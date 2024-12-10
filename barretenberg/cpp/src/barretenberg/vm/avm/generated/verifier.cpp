// AUTOGENERATED FILE
#include "verifier.hpp"
#include "barretenberg/commitment_schemes/shplonk/shplemini.hpp"
#include "barretenberg/common/log.hpp"
#include "barretenberg/numeric/bitop/get_msb.hpp"
#include "barretenberg/transcript/transcript.hpp"
#include "barretenberg/vm/constants.hpp"

namespace bb::avm {

AvmVerifier::AvmVerifier(std::shared_ptr<Flavor::VerificationKey> verifier_key)
    : key(std::move(verifier_key))
{}

AvmVerifier::AvmVerifier(AvmVerifier&& other) noexcept
    : key(std::move(other.key))
{}

AvmVerifier& AvmVerifier::operator=(AvmVerifier&& other) noexcept
{
    key = other.key;
    commitments.clear();
    return *this;
}

using FF = AvmFlavor::FF;

// Evaluate the given public input column over the multivariate challenge points
inline FF AvmVerifier::evaluate_public_input_column(const std::vector<FF>& points, std::vector<FF> challenges)
{
    Polynomial<FF> polynomial(points, key->circuit_size);
    return polynomial.evaluate_mle(challenges);
}

/**
 * @brief This function verifies an Avm Honk proof for given program settings.
 *
 */
bool AvmVerifier::verify_proof(const HonkProof& proof, const std::vector<std::vector<FF>>& public_inputs)
{
    using Flavor = AvmFlavor;
    using FF = Flavor::FF;
    using Commitment = Flavor::Commitment;
    using PCS = Flavor::PCS;
    using Curve = Flavor::Curve;
    using VerifierCommitments = Flavor::VerifierCommitments;
    using CommitmentLabels = Flavor::CommitmentLabels;
    using Shplemini = ShpleminiVerifier_<Curve>;

    RelationParameters<FF> relation_parameters;

    transcript = std::make_shared<Transcript>(proof);

    VerifierCommitments commitments{ key };
    CommitmentLabels commitment_labels;

    const auto circuit_size = transcript->template receive_from_prover<uint32_t>("circuit_size");
    if (circuit_size != key->circuit_size) {
        vinfo("Circuit size mismatch: expected", key->circuit_size, " got ", circuit_size);
        return false;
    }

    // Get commitments to VM wires
    for (auto [comm, label] : zip_view(commitments.get_wires(), commitment_labels.get_wires())) {
        comm = transcript->template receive_from_prover<Commitment>(label);
    }

    auto [beta, gamm] = transcript->template get_challenges<FF>("beta", "gamma");
    relation_parameters.beta = beta;
    relation_parameters.gamma = gamm;

    // Get commitments to inverses
    for (auto [label, commitment] : zip_view(commitment_labels.get_derived(), commitments.get_derived())) {
        commitment = transcript->template receive_from_prover<Commitment>(label);
    }

    // Execute Sumcheck Verifier
    const size_t log_circuit_size = numeric::get_msb(circuit_size);
    auto sumcheck = SumcheckVerifier<Flavor>(log_circuit_size, transcript);

    FF alpha = transcript->template get_challenge<FF>("Sumcheck:alpha");

    auto gate_challenges = std::vector<FF>(log_circuit_size);
    for (size_t idx = 0; idx < log_circuit_size; idx++) {
        gate_challenges[idx] = transcript->template get_challenge<FF>("Sumcheck:gate_challenge_" + std::to_string(idx));
    }

    auto [multivariate_challenge, claimed_evaluations, sumcheck_verified] =
        sumcheck.verify(relation_parameters, alpha, gate_challenges);

    // If Sumcheck did not verify, return false
    if (!sumcheck_verified.has_value() || !sumcheck_verified.value()) {
        vinfo("Sumcheck verification failed");
        return false;
    }

    // Public columns evaluation checks
    std::vector<FF> mle_challenge(multivariate_challenge.begin(),
                                  multivariate_challenge.begin() + static_cast<int>(log_circuit_size));

    FF main_kernel_inputs_evaluation = evaluate_public_input_column(public_inputs[0], mle_challenge);
    if (main_kernel_inputs_evaluation != claimed_evaluations.main_kernel_inputs) {
        vinfo("main_kernel_inputs_evaluation failed");
        return false;
    }
    FF main_kernel_value_out_evaluation = evaluate_public_input_column(public_inputs[1], mle_challenge);
    if (main_kernel_value_out_evaluation != claimed_evaluations.main_kernel_value_out) {
        vinfo("main_kernel_value_out_evaluation failed");
        return false;
    }
    FF main_kernel_side_effect_out_evaluation = evaluate_public_input_column(public_inputs[2], mle_challenge);
    if (main_kernel_side_effect_out_evaluation != claimed_evaluations.main_kernel_side_effect_out) {
        vinfo("main_kernel_side_effect_out_evaluation failed");
        return false;
    }
    FF main_kernel_metadata_out_evaluation = evaluate_public_input_column(public_inputs[3], mle_challenge);
    if (main_kernel_metadata_out_evaluation != claimed_evaluations.main_kernel_metadata_out) {
        vinfo("main_kernel_metadata_out_evaluation failed");
        return false;
    }
    FF main_calldata_evaluation = evaluate_public_input_column(public_inputs[4], mle_challenge);
    if (main_calldata_evaluation != claimed_evaluations.main_calldata) {
        vinfo("main_calldata_evaluation failed");
        return false;
    }
    FF main_returndata_evaluation = evaluate_public_input_column(public_inputs[5], mle_challenge);
    if (main_returndata_evaluation != claimed_evaluations.main_returndata) {
        vinfo("main_returndata_evaluation failed");
        return false;
    }

    const BatchOpeningClaim<Curve> opening_claim =
        Shplemini::compute_batch_opening_claim(circuit_size,
                                               commitments.get_unshifted(),
                                               commitments.get_to_be_shifted(),
                                               claimed_evaluations.get_unshifted(),
                                               claimed_evaluations.get_shifted(),
                                               multivariate_challenge,
                                               Commitment::one(),
                                               transcript);

    const auto pairing_points = PCS::reduce_verify_batch_opening_claim(opening_claim, transcript);
    const auto shplemini_verified = key->pcs_verification_key->pairing_check(pairing_points[0], pairing_points[1]);

    if (!shplemini_verified) {
        vinfo("Shplemini verification failed");
        return false;
    }

    return true;
}

} // namespace bb::avm
