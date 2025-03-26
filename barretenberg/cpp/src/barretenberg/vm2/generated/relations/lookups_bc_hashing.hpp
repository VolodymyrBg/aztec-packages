// AUTOGENERATED FILE
#pragma once

#include "../columns.hpp"
#include "barretenberg/relations/generic_lookup/generic_lookup_relation.hpp"

#include <cstddef>
#include <string_view>
#include <tuple>

namespace bb::avm2 {

/////////////////// lookup_bc_hashing_get_packed_field ///////////////////

class lookup_bc_hashing_get_packed_field_settings {
  public:
    static constexpr std::string_view NAME = "LOOKUP_BC_HASHING_GET_PACKED_FIELD";
    static constexpr std::string_view RELATION_NAME = "bc_hashing";

    static constexpr size_t READ_TERMS = 1;
    static constexpr size_t WRITE_TERMS = 1;
    static constexpr size_t READ_TERM_TYPES[READ_TERMS] = { 0 };
    static constexpr size_t WRITE_TERM_TYPES[WRITE_TERMS] = { 0 };
    static constexpr size_t LOOKUP_TUPLE_SIZE = 3;
    static constexpr size_t INVERSE_EXISTS_POLYNOMIAL_DEGREE = 4;
    static constexpr size_t READ_TERM_DEGREE = 0;
    static constexpr size_t WRITE_TERM_DEGREE = 0;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::bc_hashing_sel;
    static constexpr Column DST_SELECTOR = Column::bc_decomposition_sel_packed;
    static constexpr Column COUNTS = Column::lookup_bc_hashing_get_packed_field_counts;
    static constexpr Column INVERSES = Column::lookup_bc_hashing_get_packed_field_inv;
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> SRC_COLUMNS = {
        ColumnAndShifts::bc_hashing_pc_index,
        ColumnAndShifts::bc_hashing_bytecode_id,
        ColumnAndShifts::bc_hashing_packed_field
    };
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> DST_COLUMNS = {
        ColumnAndShifts::bc_decomposition_pc,
        ColumnAndShifts::bc_decomposition_id,
        ColumnAndShifts::bc_decomposition_packed_field
    };

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._bc_hashing_sel() == 1 || in._bc_decomposition_sel_packed() == 1);
    }

    template <typename Accumulator, typename AllEntities>
    static inline auto compute_inverse_exists(const AllEntities& in)
    {
        using View = typename Accumulator::View;
        const auto is_operation = View(in._bc_hashing_sel());
        const auto is_table_entry = View(in._bc_decomposition_sel_packed());
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
        return std::forward_as_tuple(in._lookup_bc_hashing_get_packed_field_inv(),
                                     in._lookup_bc_hashing_get_packed_field_counts(),
                                     in._bc_hashing_sel(),
                                     in._bc_decomposition_sel_packed(),
                                     in._bc_hashing_pc_index(),
                                     in._bc_hashing_bytecode_id(),
                                     in._bc_hashing_packed_field(),
                                     in._bc_decomposition_pc(),
                                     in._bc_decomposition_id(),
                                     in._bc_decomposition_packed_field());
    }
};

template <typename FF_>
class lookup_bc_hashing_get_packed_field_relation
    : public GenericLookupRelation<lookup_bc_hashing_get_packed_field_settings, FF_> {
  public:
    using Settings = lookup_bc_hashing_get_packed_field_settings;
    static constexpr std::string_view NAME = lookup_bc_hashing_get_packed_field_settings::NAME;
    static constexpr std::string_view RELATION_NAME = lookup_bc_hashing_get_packed_field_settings::RELATION_NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.lookup_bc_hashing_get_packed_field_inv.is_zero();
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

/////////////////// lookup_bc_hashing_iv_is_len ///////////////////

class lookup_bc_hashing_iv_is_len_settings {
  public:
    static constexpr std::string_view NAME = "LOOKUP_BC_HASHING_IV_IS_LEN";
    static constexpr std::string_view RELATION_NAME = "bc_hashing";

    static constexpr size_t READ_TERMS = 1;
    static constexpr size_t WRITE_TERMS = 1;
    static constexpr size_t READ_TERM_TYPES[READ_TERMS] = { 0 };
    static constexpr size_t WRITE_TERM_TYPES[WRITE_TERMS] = { 0 };
    static constexpr size_t LOOKUP_TUPLE_SIZE = 3;
    static constexpr size_t INVERSE_EXISTS_POLYNOMIAL_DEGREE = 4;
    static constexpr size_t READ_TERM_DEGREE = 0;
    static constexpr size_t WRITE_TERM_DEGREE = 0;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::bc_hashing_start;
    static constexpr Column DST_SELECTOR = Column::bc_decomposition_sel_packed;
    static constexpr Column COUNTS = Column::lookup_bc_hashing_iv_is_len_counts;
    static constexpr Column INVERSES = Column::lookup_bc_hashing_iv_is_len_inv;
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> SRC_COLUMNS = {
        ColumnAndShifts::bc_hashing_pc_index,
        ColumnAndShifts::bc_hashing_bytecode_id,
        ColumnAndShifts::bc_hashing_incremental_hash
    };
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> DST_COLUMNS = {
        ColumnAndShifts::bc_decomposition_pc,
        ColumnAndShifts::bc_decomposition_id,
        ColumnAndShifts::bc_decomposition_bytes_remaining
    };

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._bc_hashing_start() == 1 || in._bc_decomposition_sel_packed() == 1);
    }

    template <typename Accumulator, typename AllEntities>
    static inline auto compute_inverse_exists(const AllEntities& in)
    {
        using View = typename Accumulator::View;
        const auto is_operation = View(in._bc_hashing_start());
        const auto is_table_entry = View(in._bc_decomposition_sel_packed());
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
        return std::forward_as_tuple(in._lookup_bc_hashing_iv_is_len_inv(),
                                     in._lookup_bc_hashing_iv_is_len_counts(),
                                     in._bc_hashing_start(),
                                     in._bc_decomposition_sel_packed(),
                                     in._bc_hashing_pc_index(),
                                     in._bc_hashing_bytecode_id(),
                                     in._bc_hashing_incremental_hash(),
                                     in._bc_decomposition_pc(),
                                     in._bc_decomposition_id(),
                                     in._bc_decomposition_bytes_remaining());
    }
};

template <typename FF_>
class lookup_bc_hashing_iv_is_len_relation : public GenericLookupRelation<lookup_bc_hashing_iv_is_len_settings, FF_> {
  public:
    using Settings = lookup_bc_hashing_iv_is_len_settings;
    static constexpr std::string_view NAME = lookup_bc_hashing_iv_is_len_settings::NAME;
    static constexpr std::string_view RELATION_NAME = lookup_bc_hashing_iv_is_len_settings::RELATION_NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.lookup_bc_hashing_iv_is_len_inv.is_zero();
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

/////////////////// lookup_bc_hashing_poseidon2_hash ///////////////////

class lookup_bc_hashing_poseidon2_hash_settings {
  public:
    static constexpr std::string_view NAME = "LOOKUP_BC_HASHING_POSEIDON2_HASH";
    static constexpr std::string_view RELATION_NAME = "bc_hashing";

    static constexpr size_t READ_TERMS = 1;
    static constexpr size_t WRITE_TERMS = 1;
    static constexpr size_t READ_TERM_TYPES[READ_TERMS] = { 0 };
    static constexpr size_t WRITE_TERM_TYPES[WRITE_TERMS] = { 0 };
    static constexpr size_t LOOKUP_TUPLE_SIZE = 3;
    static constexpr size_t INVERSE_EXISTS_POLYNOMIAL_DEGREE = 4;
    static constexpr size_t READ_TERM_DEGREE = 0;
    static constexpr size_t WRITE_TERM_DEGREE = 0;

    // Columns using the Column enum.
    static constexpr Column SRC_SELECTOR = Column::bc_hashing_sel;
    static constexpr Column DST_SELECTOR = Column::poseidon2_hash_sel;
    static constexpr Column COUNTS = Column::lookup_bc_hashing_poseidon2_hash_counts;
    static constexpr Column INVERSES = Column::lookup_bc_hashing_poseidon2_hash_inv;
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> SRC_COLUMNS = {
        ColumnAndShifts::bc_hashing_packed_field,
        ColumnAndShifts::bc_hashing_incremental_hash,
        ColumnAndShifts::bc_hashing_output_hash
    };
    static constexpr std::array<ColumnAndShifts, LOOKUP_TUPLE_SIZE> DST_COLUMNS = {
        ColumnAndShifts::poseidon2_hash_input_0,
        ColumnAndShifts::poseidon2_hash_input_1,
        ColumnAndShifts::poseidon2_hash_output
    };

    template <typename AllEntities> static inline auto inverse_polynomial_is_computed_at_row(const AllEntities& in)
    {
        return (in._bc_hashing_sel() == 1 || in._poseidon2_hash_sel() == 1);
    }

    template <typename Accumulator, typename AllEntities>
    static inline auto compute_inverse_exists(const AllEntities& in)
    {
        using View = typename Accumulator::View;
        const auto is_operation = View(in._bc_hashing_sel());
        const auto is_table_entry = View(in._poseidon2_hash_sel());
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
        return std::forward_as_tuple(in._lookup_bc_hashing_poseidon2_hash_inv(),
                                     in._lookup_bc_hashing_poseidon2_hash_counts(),
                                     in._bc_hashing_sel(),
                                     in._poseidon2_hash_sel(),
                                     in._bc_hashing_packed_field(),
                                     in._bc_hashing_incremental_hash(),
                                     in._bc_hashing_output_hash(),
                                     in._poseidon2_hash_input_0(),
                                     in._poseidon2_hash_input_1(),
                                     in._poseidon2_hash_output());
    }
};

template <typename FF_>
class lookup_bc_hashing_poseidon2_hash_relation
    : public GenericLookupRelation<lookup_bc_hashing_poseidon2_hash_settings, FF_> {
  public:
    using Settings = lookup_bc_hashing_poseidon2_hash_settings;
    static constexpr std::string_view NAME = lookup_bc_hashing_poseidon2_hash_settings::NAME;
    static constexpr std::string_view RELATION_NAME = lookup_bc_hashing_poseidon2_hash_settings::RELATION_NAME;

    template <typename AllEntities> inline static bool skip(const AllEntities& in)
    {
        return in.lookup_bc_hashing_poseidon2_hash_inv.is_zero();
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
