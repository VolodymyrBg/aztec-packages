use crate::components::tail_output_composer::meter_gas_used;
use dep::types::{
    abis::gas::{Gas, get_emitted_contract_class_logs_len, get_emitted_private_logs_len},
    constants::{
        DA_BYTES_PER_FIELD, DA_GAS_PER_BYTE, L2_GAS_PER_CONTRACT_CLASS_LOG, L2_GAS_PER_L2_TO_L1_MSG,
        L2_GAS_PER_NOTE_HASH, L2_GAS_PER_NULLIFIER, L2_GAS_PER_PRIVATE_LOG,
    },
    tests::fixture_builder::FixtureBuilder,
};

fn new_builder() -> FixtureBuilder {
    let mut builder = FixtureBuilder::new();
    builder
}

#[test]
fn meter_gas_used_empty_succeeds() {
    let builder = new_builder();
    let data = builder.to_private_to_rollup_accumulated_data();
    let gas = meter_gas_used(data);
    assert_eq(gas, Gas::tx_overhead());
}

#[test]
fn meter_gas_used_everything_succeeds() {
    let mut builder = new_builder();
    let mut metered_da_bytes = 0;
    let mut computed_l2_gas = 0;

    builder.append_note_hashes(4);
    metered_da_bytes += 4 * DA_BYTES_PER_FIELD;
    computed_l2_gas += 4 * L2_GAS_PER_NOTE_HASH;

    builder.append_nullifiers(3);
    metered_da_bytes += 3 * DA_BYTES_PER_FIELD;
    computed_l2_gas += 3 * L2_GAS_PER_NULLIFIER;

    builder.append_l2_to_l1_msgs(1);
    metered_da_bytes += 1 * DA_BYTES_PER_FIELD;
    computed_l2_gas += 1 * L2_GAS_PER_L2_TO_L1_MSG;

    builder.append_private_logs(3);
    let total_num_private_log_fields =
        get_emitted_private_logs_len(builder.private_logs.storage().map(|l| l.inner.log));
    metered_da_bytes += total_num_private_log_fields * DA_BYTES_PER_FIELD;
    computed_l2_gas += 3 * L2_GAS_PER_PRIVATE_LOG;

    builder.add_contract_class_log_hash(3001, 51);
    let total_num_cc_log_fields =
        get_emitted_contract_class_logs_len(builder.contract_class_logs_hashes.storage());
    metered_da_bytes += total_num_cc_log_fields * DA_BYTES_PER_FIELD;
    computed_l2_gas += 1 * L2_GAS_PER_CONTRACT_CLASS_LOG;

    let data = builder.to_private_to_rollup_accumulated_data();
    let gas = meter_gas_used(data);

    assert_eq(
        gas,
        Gas::new(metered_da_bytes * DA_GAS_PER_BYTE, computed_l2_gas) + Gas::tx_overhead(),
    );
}
