// AUTOGENERATED FILE
#pragma once

#include <string_view>

#include "barretenberg/relations/relation_parameters.hpp"
#include "barretenberg/relations/relation_types.hpp"

namespace bb::avm {

template <typename FF_> class merkle_treeImpl {
  public:
    using FF = FF_;

    static constexpr std::array<size_t, 9> SUBRELATION_PARTIAL_LENGTHS = { 3, 4, 3, 5, 3, 4, 4, 4, 4 };

    template <typename ContainerOverSubrelations, typename AllEntities>
    void static accumulate(ContainerOverSubrelations& evals,
                           const AllEntities& new_term,
                           [[maybe_unused]] const RelationParameters<FF>&,
                           [[maybe_unused]] const FF& scaling_factor)
    {
        const auto merkle_tree_LEAF_INDEX_IS_ODD = (FF(1) - new_term.merkle_tree_leaf_index_is_even);

        {
            using Accumulator = typename std::tuple_element_t<0, ContainerOverSubrelations>;
            auto tmp = (new_term.merkle_tree_sel_merkle_tree * (FF(1) - new_term.merkle_tree_sel_merkle_tree));
            tmp *= scaling_factor;
            std::get<0>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<1, ContainerOverSubrelations>;
            auto tmp = ((new_term.merkle_tree_sel_merkle_tree * (FF(1) - new_term.merkle_tree_latch)) *
                        ((new_term.merkle_tree_path_len_shift - new_term.merkle_tree_path_len) + FF(1)));
            tmp *= scaling_factor;
            std::get<1>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<2, ContainerOverSubrelations>;
            auto tmp = (new_term.merkle_tree_latch * (FF(1) - new_term.merkle_tree_latch));
            tmp *= scaling_factor;
            std::get<2>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<3, ContainerOverSubrelations>;
            auto tmp = (new_term.merkle_tree_sel_merkle_tree *
                        (((new_term.merkle_tree_path_len *
                           ((new_term.merkle_tree_latch * (FF(1) - new_term.merkle_tree_path_len_inv)) +
                            new_term.merkle_tree_path_len_inv)) -
                          FF(1)) +
                         new_term.merkle_tree_latch));
            tmp *= scaling_factor;
            std::get<3>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<4, ContainerOverSubrelations>;
            auto tmp = (new_term.merkle_tree_leaf_index_is_even * (FF(1) - new_term.merkle_tree_leaf_index_is_even));
            tmp *= scaling_factor;
            std::get<4>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<5, ContainerOverSubrelations>;
            auto tmp = ((new_term.merkle_tree_sel_merkle_tree * (FF(1) - new_term.merkle_tree_latch)) *
                        (((new_term.merkle_tree_leaf_index_shift * FF(2)) + merkle_tree_LEAF_INDEX_IS_ODD) -
                         new_term.merkle_tree_leaf_index));
            tmp *= scaling_factor;
            std::get<5>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<6, ContainerOverSubrelations>;
            auto tmp = ((((new_term.merkle_tree_sel_merkle_tree * new_term.merkle_tree_leaf_index_is_even) *
                          (new_term.merkle_tree_left_hash - new_term.merkle_tree_right_hash)) +
                         new_term.merkle_tree_right_hash) -
                        new_term.merkle_tree_leaf_value);
            tmp *= scaling_factor;
            std::get<6>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<7, ContainerOverSubrelations>;
            auto tmp = ((((new_term.merkle_tree_sel_merkle_tree * new_term.merkle_tree_leaf_index_is_even) *
                          (new_term.merkle_tree_right_hash - new_term.merkle_tree_left_hash)) +
                         new_term.merkle_tree_left_hash) -
                        new_term.merkle_tree_sibling_value);
            tmp *= scaling_factor;
            std::get<7>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<8, ContainerOverSubrelations>;
            auto tmp = ((new_term.merkle_tree_sel_merkle_tree * (FF(1) - new_term.merkle_tree_latch)) *
                        (new_term.merkle_tree_leaf_value_shift - new_term.merkle_tree_output_hash));
            tmp *= scaling_factor;
            std::get<8>(evals) += typename Accumulator::View(tmp);
        }
    }
};

template <typename FF> class merkle_tree : public Relation<merkle_treeImpl<FF>> {
  public:
    static constexpr const std::string_view NAME = "merkle_tree";

    static std::string get_subrelation_label(size_t index)
    {
        switch (index) {}
        return std::to_string(index);
    }
};

} // namespace bb::avm