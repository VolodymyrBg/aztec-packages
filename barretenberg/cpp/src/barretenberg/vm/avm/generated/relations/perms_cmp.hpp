// AUTOGENERATED FILE
#pragma once

#include "../columns.hpp"
#include "barretenberg/relations/generic_permutation/generic_permutation_relation.hpp"

#include <cstddef>
#include <string_view>
#include <tuple>

namespace bb::avm {

/////////////////// perm_rng_non_ff_cmp ///////////////////

class perm_rng_non_ff_cmp_permutation_settings {
  public:
    static constexpr std::string_view NAME = "PERM_RNG_NON_FF_CMP";

    // This constant defines how many columns are bundled together to form each set.
    constexpr static size_t COLUMNS_PER_SET = 2;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::range_check_cmp_non_ff_rng_chk;
    static constexpr Column DST_SELECTOR = Column::cmp_op_non_ff_gt;
    static constexpr Column INVERSES = Column::perm_rng_non_ff_cmp_inv;

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._range_check_cmp_non_ff_rng_chk() == 1 || in._cmp_op_non_ff_gt() == 1);
    }

    template <typename AllEntities> static inline auto get_const_entities(const AllEntities& in)
    {
        return std::forward_as_tuple(in._perm_rng_non_ff_cmp_inv(),
                                     in._range_check_cmp_non_ff_rng_chk(),
                                     in._range_check_cmp_non_ff_rng_chk(),
                                     in._cmp_op_non_ff_gt(),
                                     in._range_check_clk(),
                                     in._range_check_value(),
                                     in._cmp_range_chk_clk(),
                                     in._cmp_diff());
    }

    template <typename AllEntities> static inline auto get_nonconst_entities(AllEntities& in)
    {
        return std::forward_as_tuple(in._perm_rng_non_ff_cmp_inv(),
                                     in._range_check_cmp_non_ff_rng_chk(),
                                     in._range_check_cmp_non_ff_rng_chk(),
                                     in._cmp_op_non_ff_gt(),
                                     in._range_check_clk(),
                                     in._range_check_value(),
                                     in._cmp_range_chk_clk(),
                                     in._cmp_diff());
    }
};

template <typename FF_>
class perm_rng_non_ff_cmp_relation : public GenericPermutationRelation<perm_rng_non_ff_cmp_permutation_settings, FF_> {
  public:
    static constexpr std::string_view NAME = perm_rng_non_ff_cmp_permutation_settings::NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.range_check_cmp_non_ff_rng_chk.is_zero() && in.cmp_op_non_ff_gt.is_zero();
    }
};
template <typename FF_> using perm_rng_non_ff_cmp = GenericPermutation<perm_rng_non_ff_cmp_permutation_settings, FF_>;

/////////////////// perm_rng_cmp_lo ///////////////////

class perm_rng_cmp_lo_permutation_settings {
  public:
    static constexpr std::string_view NAME = "PERM_RNG_CMP_LO";

    // This constant defines how many columns are bundled together to form each set.
    constexpr static size_t COLUMNS_PER_SET = 2;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::range_check_cmp_lo_bits_rng_chk;
    static constexpr Column DST_SELECTOR = Column::cmp_sel_rng_chk;
    static constexpr Column INVERSES = Column::perm_rng_cmp_lo_inv;

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._range_check_cmp_lo_bits_rng_chk() == 1 || in._cmp_sel_rng_chk() == 1);
    }

    template <typename AllEntities> static inline auto get_const_entities(const AllEntities& in)
    {
        return std::forward_as_tuple(in._perm_rng_cmp_lo_inv(),
                                     in._range_check_cmp_lo_bits_rng_chk(),
                                     in._range_check_cmp_lo_bits_rng_chk(),
                                     in._cmp_sel_rng_chk(),
                                     in._range_check_clk(),
                                     in._range_check_value(),
                                     in._cmp_range_chk_clk(),
                                     in._cmp_a_lo());
    }

    template <typename AllEntities> static inline auto get_nonconst_entities(AllEntities& in)
    {
        return std::forward_as_tuple(in._perm_rng_cmp_lo_inv(),
                                     in._range_check_cmp_lo_bits_rng_chk(),
                                     in._range_check_cmp_lo_bits_rng_chk(),
                                     in._cmp_sel_rng_chk(),
                                     in._range_check_clk(),
                                     in._range_check_value(),
                                     in._cmp_range_chk_clk(),
                                     in._cmp_a_lo());
    }
};

template <typename FF_>
class perm_rng_cmp_lo_relation : public GenericPermutationRelation<perm_rng_cmp_lo_permutation_settings, FF_> {
  public:
    static constexpr std::string_view NAME = perm_rng_cmp_lo_permutation_settings::NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.range_check_cmp_lo_bits_rng_chk.is_zero() && in.cmp_sel_rng_chk.is_zero();
    }
};
template <typename FF_> using perm_rng_cmp_lo = GenericPermutation<perm_rng_cmp_lo_permutation_settings, FF_>;

/////////////////// perm_rng_cmp_hi ///////////////////

class perm_rng_cmp_hi_permutation_settings {
  public:
    static constexpr std::string_view NAME = "PERM_RNG_CMP_HI";

    // This constant defines how many columns are bundled together to form each set.
    constexpr static size_t COLUMNS_PER_SET = 2;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::range_check_cmp_hi_bits_rng_chk;
    static constexpr Column DST_SELECTOR = Column::cmp_sel_rng_chk;
    static constexpr Column INVERSES = Column::perm_rng_cmp_hi_inv;

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._range_check_cmp_hi_bits_rng_chk() == 1 || in._cmp_sel_rng_chk() == 1);
    }

    template <typename AllEntities> static inline auto get_const_entities(const AllEntities& in)
    {
        return std::forward_as_tuple(in._perm_rng_cmp_hi_inv(),
                                     in._range_check_cmp_hi_bits_rng_chk(),
                                     in._range_check_cmp_hi_bits_rng_chk(),
                                     in._cmp_sel_rng_chk(),
                                     in._range_check_clk(),
                                     in._range_check_value(),
                                     in._cmp_range_chk_clk(),
                                     in._cmp_a_hi());
    }

    template <typename AllEntities> static inline auto get_nonconst_entities(AllEntities& in)
    {
        return std::forward_as_tuple(in._perm_rng_cmp_hi_inv(),
                                     in._range_check_cmp_hi_bits_rng_chk(),
                                     in._range_check_cmp_hi_bits_rng_chk(),
                                     in._cmp_sel_rng_chk(),
                                     in._range_check_clk(),
                                     in._range_check_value(),
                                     in._cmp_range_chk_clk(),
                                     in._cmp_a_hi());
    }
};

template <typename FF_>
class perm_rng_cmp_hi_relation : public GenericPermutationRelation<perm_rng_cmp_hi_permutation_settings, FF_> {
  public:
    static constexpr std::string_view NAME = perm_rng_cmp_hi_permutation_settings::NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.range_check_cmp_hi_bits_rng_chk.is_zero() && in.cmp_sel_rng_chk.is_zero();
    }
};
template <typename FF_> using perm_rng_cmp_hi = GenericPermutation<perm_rng_cmp_hi_permutation_settings, FF_>;

} // namespace bb::avm