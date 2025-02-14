// AUTOGENERATED FILE
#pragma once

#include "../columns.hpp"
#include "barretenberg/relations/generic_lookup/generic_lookup_relation.hpp"

#include <cstddef>
#include <string_view>
#include <tuple>

namespace bb::avm2 {

/////////////////// lookup_bytecode_bytes_are_bytes ///////////////////

class lookup_bytecode_bytes_are_bytes_lookup_settings {
  public:
    static constexpr std::string_view NAME = "LOOKUP_BYTECODE_BYTES_ARE_BYTES";
    static constexpr std::string_view RELATION_NAME = "bc_decomposition";

    static constexpr size_t READ_TERMS = 1;
    static constexpr size_t WRITE_TERMS = 1;
    static constexpr size_t READ_TERM_TYPES[READ_TERMS] = { 0 };
    static constexpr size_t WRITE_TERM_TYPES[WRITE_TERMS] = { 0 };
    static constexpr size_t LOOKUP_TUPLE_SIZE = 1;
    static constexpr size_t INVERSE_EXISTS_POLYNOMIAL_DEGREE = 4;
    static constexpr size_t READ_TERM_DEGREE = 0;
    static constexpr size_t WRITE_TERM_DEGREE = 0;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::bc_decomposition_sel;
    static constexpr Column DST_SELECTOR = Column::precomputed_sel_range_8;
    static constexpr Column COUNTS = Column::lookup_bytecode_bytes_are_bytes_counts;
    static constexpr Column INVERSES = Column::lookup_bytecode_bytes_are_bytes_inv;
    static constexpr std::array<Column, LOOKUP_TUPLE_SIZE> SRC_COLUMNS = { Column::bc_decomposition_bytes };
    static constexpr std::array<Column, LOOKUP_TUPLE_SIZE> DST_COLUMNS = { Column::precomputed_clk };

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._bc_decomposition_sel() == 1 || in._precomputed_sel_range_8() == 1);
    }

    template <typename Accumulator, typename AllEntities>
    static inline auto compute_inverse_exists(const AllEntities& in)
    {
        using View = typename Accumulator::View;
        const auto is_operation = View(in._bc_decomposition_sel());
        const auto is_table_entry = View(in._precomputed_sel_range_8());
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
        return std::forward_as_tuple(in._lookup_bytecode_bytes_are_bytes_inv(),
                                     in._lookup_bytecode_bytes_are_bytes_counts(),
                                     in._bc_decomposition_sel(),
                                     in._precomputed_sel_range_8(),
                                     in._bc_decomposition_bytes(),
                                     in._precomputed_clk());
    }
};

template <typename FF_>
class lookup_bytecode_bytes_are_bytes_relation
    : public GenericLookupRelation<lookup_bytecode_bytes_are_bytes_lookup_settings, FF_> {
  public:
    using Settings = lookup_bytecode_bytes_are_bytes_lookup_settings;
    static constexpr std::string_view NAME = lookup_bytecode_bytes_are_bytes_lookup_settings::NAME;
    static constexpr std::string_view RELATION_NAME = lookup_bytecode_bytes_are_bytes_lookup_settings::RELATION_NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.bc_decomposition_sel.is_zero() && in.precomputed_sel_range_8.is_zero();
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

/////////////////// lookup_bytecode_remaining_abs_diff_u16 ///////////////////

class lookup_bytecode_remaining_abs_diff_u16_lookup_settings {
  public:
    static constexpr std::string_view NAME = "LOOKUP_BYTECODE_REMAINING_ABS_DIFF_U16";
    static constexpr std::string_view RELATION_NAME = "bc_decomposition";

    static constexpr size_t READ_TERMS = 1;
    static constexpr size_t WRITE_TERMS = 1;
    static constexpr size_t READ_TERM_TYPES[READ_TERMS] = { 0 };
    static constexpr size_t WRITE_TERM_TYPES[WRITE_TERMS] = { 0 };
    static constexpr size_t LOOKUP_TUPLE_SIZE = 1;
    static constexpr size_t INVERSE_EXISTS_POLYNOMIAL_DEGREE = 4;
    static constexpr size_t READ_TERM_DEGREE = 0;
    static constexpr size_t WRITE_TERM_DEGREE = 0;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::bc_decomposition_sel;
    static constexpr Column DST_SELECTOR = Column::precomputed_sel_range_16;
    static constexpr Column COUNTS = Column::lookup_bytecode_remaining_abs_diff_u16_counts;
    static constexpr Column INVERSES = Column::lookup_bytecode_remaining_abs_diff_u16_inv;
    static constexpr std::array<Column, LOOKUP_TUPLE_SIZE> SRC_COLUMNS = { Column::bc_decomposition_abs_diff };
    static constexpr std::array<Column, LOOKUP_TUPLE_SIZE> DST_COLUMNS = { Column::precomputed_clk };

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._bc_decomposition_sel() == 1 || in._precomputed_sel_range_16() == 1);
    }

    template <typename Accumulator, typename AllEntities>
    static inline auto compute_inverse_exists(const AllEntities& in)
    {
        using View = typename Accumulator::View;
        const auto is_operation = View(in._bc_decomposition_sel());
        const auto is_table_entry = View(in._precomputed_sel_range_16());
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
        return std::forward_as_tuple(in._lookup_bytecode_remaining_abs_diff_u16_inv(),
                                     in._lookup_bytecode_remaining_abs_diff_u16_counts(),
                                     in._bc_decomposition_sel(),
                                     in._precomputed_sel_range_16(),
                                     in._bc_decomposition_abs_diff(),
                                     in._precomputed_clk());
    }
};

template <typename FF_>
class lookup_bytecode_remaining_abs_diff_u16_relation
    : public GenericLookupRelation<lookup_bytecode_remaining_abs_diff_u16_lookup_settings, FF_> {
  public:
    using Settings = lookup_bytecode_remaining_abs_diff_u16_lookup_settings;
    static constexpr std::string_view NAME = lookup_bytecode_remaining_abs_diff_u16_lookup_settings::NAME;
    static constexpr std::string_view RELATION_NAME =
        lookup_bytecode_remaining_abs_diff_u16_lookup_settings::RELATION_NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.bc_decomposition_sel.is_zero() && in.precomputed_sel_range_16.is_zero();
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

/////////////////// lookup_bytecode_to_read_unary ///////////////////

class lookup_bytecode_to_read_unary_lookup_settings {
  public:
    static constexpr std::string_view NAME = "LOOKUP_BYTECODE_TO_READ_UNARY";
    static constexpr std::string_view RELATION_NAME = "bc_decomposition";

    static constexpr size_t READ_TERMS = 1;
    static constexpr size_t WRITE_TERMS = 1;
    static constexpr size_t READ_TERM_TYPES[READ_TERMS] = { 0 };
    static constexpr size_t WRITE_TERM_TYPES[WRITE_TERMS] = { 0 };
    static constexpr size_t LOOKUP_TUPLE_SIZE = 2;
    static constexpr size_t INVERSE_EXISTS_POLYNOMIAL_DEGREE = 4;
    static constexpr size_t READ_TERM_DEGREE = 0;
    static constexpr size_t WRITE_TERM_DEGREE = 0;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::bc_decomposition_sel;
    static constexpr Column DST_SELECTOR = Column::precomputed_sel_unary;
    static constexpr Column COUNTS = Column::lookup_bytecode_to_read_unary_counts;
    static constexpr Column INVERSES = Column::lookup_bytecode_to_read_unary_inv;
    static constexpr std::array<Column, LOOKUP_TUPLE_SIZE> SRC_COLUMNS = {
        Column::bc_decomposition_bytes_to_read, Column::bc_decomposition_bytes_to_read_unary
    };
    static constexpr std::array<Column, LOOKUP_TUPLE_SIZE> DST_COLUMNS = { Column::precomputed_clk,
                                                                           Column::precomputed_as_unary };

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._bc_decomposition_sel() == 1 || in._precomputed_sel_unary() == 1);
    }

    template <typename Accumulator, typename AllEntities>
    static inline auto compute_inverse_exists(const AllEntities& in)
    {
        using View = typename Accumulator::View;
        const auto is_operation = View(in._bc_decomposition_sel());
        const auto is_table_entry = View(in._precomputed_sel_unary());
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
        return std::forward_as_tuple(in._lookup_bytecode_to_read_unary_inv(),
                                     in._lookup_bytecode_to_read_unary_counts(),
                                     in._bc_decomposition_sel(),
                                     in._precomputed_sel_unary(),
                                     in._bc_decomposition_bytes_to_read(),
                                     in._bc_decomposition_bytes_to_read_unary(),
                                     in._precomputed_clk(),
                                     in._precomputed_as_unary());
    }
};

template <typename FF_>
class lookup_bytecode_to_read_unary_relation
    : public GenericLookupRelation<lookup_bytecode_to_read_unary_lookup_settings, FF_> {
  public:
    using Settings = lookup_bytecode_to_read_unary_lookup_settings;
    static constexpr std::string_view NAME = lookup_bytecode_to_read_unary_lookup_settings::NAME;
    static constexpr std::string_view RELATION_NAME = lookup_bytecode_to_read_unary_lookup_settings::RELATION_NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.bc_decomposition_sel.is_zero() && in.precomputed_sel_unary.is_zero();
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