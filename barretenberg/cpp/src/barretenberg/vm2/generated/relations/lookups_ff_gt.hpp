// AUTOGENERATED FILE
#pragma once

#include "../columns.hpp"
#include "barretenberg/relations/generic_lookup/generic_lookup_relation.hpp"

#include <cstddef>
#include <string_view>
#include <tuple>

namespace bb::avm2 {

/////////////////// lookup_ff_gt_a_lo_range ///////////////////

class lookup_ff_gt_a_lo_range_settings {
  public:
    static constexpr std::string_view NAME = "LOOKUP_FF_GT_A_LO_RANGE";
    static constexpr std::string_view RELATION_NAME = "ff_gt";

    static constexpr size_t READ_TERMS = 1;
    static constexpr size_t WRITE_TERMS = 1;
    static constexpr size_t READ_TERM_TYPES[READ_TERMS] = { 0 };
    static constexpr size_t WRITE_TERM_TYPES[WRITE_TERMS] = { 0 };
    static constexpr size_t LOOKUP_TUPLE_SIZE = 2;
    static constexpr size_t INVERSE_EXISTS_POLYNOMIAL_DEGREE = 4;
    static constexpr size_t READ_TERM_DEGREE = 0;
    static constexpr size_t WRITE_TERM_DEGREE = 0;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::ff_gt_sel;
    static constexpr Column DST_SELECTOR = Column::range_check_sel;
    static constexpr Column COUNTS = Column::lookup_ff_gt_a_lo_range_counts;
    static constexpr Column INVERSES = Column::lookup_ff_gt_a_lo_range_inv;
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> SRC_COLUMNS = {
        ColumnAndShifts::ff_gt_a_lo, ColumnAndShifts::ff_gt_constant_128
    };
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> DST_COLUMNS = {
        ColumnAndShifts::range_check_value, ColumnAndShifts::range_check_rng_chk_bits
    };

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._ff_gt_sel() == 1 || in._range_check_sel() == 1);
    }

    template <typename Accumulator, typename AllEntities>
    static inline auto compute_inverse_exists(const AllEntities& in)
    {
        using View = typename Accumulator::View;
        const auto is_operation = View(in._ff_gt_sel());
        const auto is_table_entry = View(in._range_check_sel());
        return (is_operation + is_table_entry - is_operation * is_table_entry);
    }

    template <typename AllEntities> static inline auto get_const_entities(const AllEntities& in)
    {
        return get_entities(in);
    }

    template <typename AllEntities> static inline auto get_nonconst_entities(AllEntities& in)
    {
        return get_entities(in);
    }

    template <typename AllEntities> static inline auto get_entities(AllEntities&& in)
    {
        return std::forward_as_tuple(in._lookup_ff_gt_a_lo_range_inv(),
                                     in._lookup_ff_gt_a_lo_range_counts(),
                                     in._ff_gt_sel(),
                                     in._range_check_sel(),
                                     in._ff_gt_a_lo(),
                                     in._ff_gt_constant_128(),
                                     in._range_check_value(),
                                     in._range_check_rng_chk_bits());
    }
};

template <typename FF_>
class lookup_ff_gt_a_lo_range_relation : public GenericLookupRelation<lookup_ff_gt_a_lo_range_settings, FF_> {
  public:
    using Settings = lookup_ff_gt_a_lo_range_settings;
    static constexpr std::string_view NAME = lookup_ff_gt_a_lo_range_settings::NAME;
    static constexpr std::string_view RELATION_NAME = lookup_ff_gt_a_lo_range_settings::RELATION_NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.lookup_ff_gt_a_lo_range_inv.is_zero();
    }

    static std::string get_subrelation_label(size_t index)
    {
        if (index == 0) {
            return "INVERSES_ARE_CORRECT";
        } else if (index == 1) {
            return "ACCUMULATION_IS_CORRECT";
        }
        return std::to_string(index);
    }
};

/////////////////// lookup_ff_gt_a_hi_range ///////////////////

class lookup_ff_gt_a_hi_range_settings {
  public:
    static constexpr std::string_view NAME = "LOOKUP_FF_GT_A_HI_RANGE";
    static constexpr std::string_view RELATION_NAME = "ff_gt";

    static constexpr size_t READ_TERMS = 1;
    static constexpr size_t WRITE_TERMS = 1;
    static constexpr size_t READ_TERM_TYPES[READ_TERMS] = { 0 };
    static constexpr size_t WRITE_TERM_TYPES[WRITE_TERMS] = { 0 };
    static constexpr size_t LOOKUP_TUPLE_SIZE = 2;
    static constexpr size_t INVERSE_EXISTS_POLYNOMIAL_DEGREE = 4;
    static constexpr size_t READ_TERM_DEGREE = 0;
    static constexpr size_t WRITE_TERM_DEGREE = 0;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::ff_gt_sel;
    static constexpr Column DST_SELECTOR = Column::range_check_sel;
    static constexpr Column COUNTS = Column::lookup_ff_gt_a_hi_range_counts;
    static constexpr Column INVERSES = Column::lookup_ff_gt_a_hi_range_inv;
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> SRC_COLUMNS = {
        ColumnAndShifts::ff_gt_a_hi, ColumnAndShifts::ff_gt_constant_128
    };
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> DST_COLUMNS = {
        ColumnAndShifts::range_check_value, ColumnAndShifts::range_check_rng_chk_bits
    };

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._ff_gt_sel() == 1 || in._range_check_sel() == 1);
    }

    template <typename Accumulator, typename AllEntities>
    static inline auto compute_inverse_exists(const AllEntities& in)
    {
        using View = typename Accumulator::View;
        const auto is_operation = View(in._ff_gt_sel());
        const auto is_table_entry = View(in._range_check_sel());
        return (is_operation + is_table_entry - is_operation * is_table_entry);
    }

    template <typename AllEntities> static inline auto get_const_entities(const AllEntities& in)
    {
        return get_entities(in);
    }

    template <typename AllEntities> static inline auto get_nonconst_entities(AllEntities& in)
    {
        return get_entities(in);
    }

    template <typename AllEntities> static inline auto get_entities(AllEntities&& in)
    {
        return std::forward_as_tuple(in._lookup_ff_gt_a_hi_range_inv(),
                                     in._lookup_ff_gt_a_hi_range_counts(),
                                     in._ff_gt_sel(),
                                     in._range_check_sel(),
                                     in._ff_gt_a_hi(),
                                     in._ff_gt_constant_128(),
                                     in._range_check_value(),
                                     in._range_check_rng_chk_bits());
    }
};

template <typename FF_>
class lookup_ff_gt_a_hi_range_relation : public GenericLookupRelation<lookup_ff_gt_a_hi_range_settings, FF_> {
  public:
    using Settings = lookup_ff_gt_a_hi_range_settings;
    static constexpr std::string_view NAME = lookup_ff_gt_a_hi_range_settings::NAME;
    static constexpr std::string_view RELATION_NAME = lookup_ff_gt_a_hi_range_settings::RELATION_NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.lookup_ff_gt_a_hi_range_inv.is_zero();
    }

    static std::string get_subrelation_label(size_t index)
    {
        if (index == 0) {
            return "INVERSES_ARE_CORRECT";
        } else if (index == 1) {
            return "ACCUMULATION_IS_CORRECT";
        }
        return std::to_string(index);
    }
};

} // namespace bb::avm2
