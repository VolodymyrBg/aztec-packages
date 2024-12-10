// AUTOGENERATED FILE
#pragma once

#include "barretenberg/relations/generic_permutation/generic_permutation_relation.hpp"

#include <cstddef>
#include <tuple>

namespace bb::avm {

class perm_pos_mem_read_d_permutation_settings {
  public:
    // This constant defines how many columns are bundled together to form each set.
    constexpr static size_t COLUMNS_PER_SET = 5;

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in.poseidon2_sel_poseidon_perm_mem_op == 1 || in.mem_sel_op_poseidon_read_d == 1);
    }

    template <typename AllEntities> static inline auto get_const_entities(const AllEntities& in)
    {
        return std::forward_as_tuple(in.perm_pos_mem_read_d_inv,
                                     in.poseidon2_sel_poseidon_perm_mem_op,
                                     in.poseidon2_sel_poseidon_perm_mem_op,
                                     in.mem_sel_op_poseidon_read_d,
                                     in.poseidon2_clk,
                                     in.poseidon2_space_id,
                                     in.poseidon2_mem_addr_read_d,
                                     in.poseidon2_a_3,
                                     in.main_zeroes,
                                     in.mem_clk,
                                     in.mem_space_id,
                                     in.mem_addr,
                                     in.mem_val,
                                     in.mem_rw);
    }

    template <typename AllEntities> static inline auto get_nonconst_entities(AllEntities& in)
    {
        return std::forward_as_tuple(in.perm_pos_mem_read_d_inv,
                                     in.poseidon2_sel_poseidon_perm_mem_op,
                                     in.poseidon2_sel_poseidon_perm_mem_op,
                                     in.mem_sel_op_poseidon_read_d,
                                     in.poseidon2_clk,
                                     in.poseidon2_space_id,
                                     in.poseidon2_mem_addr_read_d,
                                     in.poseidon2_a_3,
                                     in.main_zeroes,
                                     in.mem_clk,
                                     in.mem_space_id,
                                     in.mem_addr,
                                     in.mem_val,
                                     in.mem_rw);
    }
};

template <typename FF_>
class perm_pos_mem_read_d_relation : public GenericPermutationRelation<perm_pos_mem_read_d_permutation_settings, FF_> {
  public:
    static constexpr const char* NAME = "PERM_POS_MEM_READ_D";
};
template <typename FF_> using perm_pos_mem_read_d = GenericPermutation<perm_pos_mem_read_d_permutation_settings, FF_>;

} // namespace bb::avm