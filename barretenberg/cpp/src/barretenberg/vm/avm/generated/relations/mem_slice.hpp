// AUTOGENERATED FILE
#pragma once

#include <string_view>

#include "barretenberg/relations/relation_parameters.hpp"
#include "barretenberg/relations/relation_types.hpp"

namespace bb::avm {

template <typename FF_> class mem_sliceImpl {
  public:
    using FF = FF_;

    static constexpr std::array<size_t, 10> SUBRELATION_PARTIAL_LENGTHS = { 2, 3, 3, 3, 3, 3, 3, 4, 4, 4 };

    template <typename ContainerOverSubrelations, typename AllEntities>
    void static accumulate(ContainerOverSubrelations& evals,
                           const AllEntities& new_term,
                           [[maybe_unused]] const RelationParameters<FF>&,
                           [[maybe_unused]] const FF& scaling_factor)
    {

        {
            using Accumulator = typename std::tuple_element_t<0, ContainerOverSubrelations>;
            auto tmp = (new_term.slice_sel_mem_active - (new_term.slice_sel_cd_cpy + new_term.slice_sel_return));
            tmp *= scaling_factor;
            std::get<0>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<1, ContainerOverSubrelations>;
            auto tmp = ((new_term.slice_cnt * (FF(1) - new_term.slice_one_min_inv)) - new_term.slice_sel_mem_active);
            tmp *= scaling_factor;
            std::get<1>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<2, ContainerOverSubrelations>;
            auto tmp = ((FF(1) - new_term.slice_sel_mem_active) * new_term.slice_one_min_inv);
            tmp *= scaling_factor;
            std::get<2>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<3, ContainerOverSubrelations>;
            auto tmp = (new_term.slice_sel_mem_active * ((new_term.slice_cnt - FF(1)) - new_term.slice_cnt_shift));
            tmp *= scaling_factor;
            std::get<3>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<4, ContainerOverSubrelations>;
            auto tmp = (new_term.slice_sel_mem_active * ((new_term.slice_addr + FF(1)) - new_term.slice_addr_shift));
            tmp *= scaling_factor;
            std::get<4>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<5, ContainerOverSubrelations>;
            auto tmp = (new_term.slice_sel_mem_active * (new_term.slice_clk - new_term.slice_clk_shift));
            tmp *= scaling_factor;
            std::get<5>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<6, ContainerOverSubrelations>;
            auto tmp = (new_term.slice_sel_mem_active * (new_term.slice_space_id - new_term.slice_space_id_shift));
            tmp *= scaling_factor;
            std::get<6>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<7, ContainerOverSubrelations>;
            auto tmp = ((new_term.slice_sel_mem_active * new_term.slice_sel_mem_active_shift) *
                        (new_term.slice_sel_return - new_term.slice_sel_return_shift));
            tmp *= scaling_factor;
            std::get<7>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<8, ContainerOverSubrelations>;
            auto tmp = ((new_term.slice_sel_mem_active * new_term.slice_sel_mem_active_shift) *
                        (new_term.slice_sel_cd_cpy - new_term.slice_sel_cd_cpy_shift));
            tmp *= scaling_factor;
            std::get<8>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<9, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.slice_sel_mem_active) * new_term.slice_sel_mem_active_shift) *
                        (FF(1) - new_term.slice_sel_start_shift));
            tmp *= scaling_factor;
            std::get<9>(evals) += typename Accumulator::View(tmp);
        }
    }
};

template <typename FF> class mem_slice : public Relation<mem_sliceImpl<FF>> {
  public:
    static constexpr const std::string_view NAME = "mem_slice";

    static std::string get_subrelation_label(size_t index)
    {
        switch (index) {
        case 1:
            return "SLICE_CNT_ZERO_TEST1";
        case 2:
            return "SLICE_CNT_ZERO_TEST2";
        case 3:
            return "SLICE_CNT_DECREMENT";
        case 4:
            return "ADDR_INCREMENT";
        case 5:
            return "SAME_CLK";
        case 6:
            return "SAME_SPACE_ID";
        case 7:
            return "SAME_SEL_RETURN";
        case 8:
            return "SAME_SEL_CD_CPY";
        case 9:
            return "SEL_MEM_INACTIVE";
        }
        return std::to_string(index);
    }

    // Subrelation indices constants, to be used in tests.
    static constexpr size_t SR_SLICE_CNT_ZERO_TEST1 = 1;
    static constexpr size_t SR_SLICE_CNT_ZERO_TEST2 = 2;
    static constexpr size_t SR_SLICE_CNT_DECREMENT = 3;
    static constexpr size_t SR_ADDR_INCREMENT = 4;
    static constexpr size_t SR_SAME_CLK = 5;
    static constexpr size_t SR_SAME_SPACE_ID = 6;
    static constexpr size_t SR_SAME_SEL_RETURN = 7;
    static constexpr size_t SR_SAME_SEL_CD_CPY = 8;
    static constexpr size_t SR_SEL_MEM_INACTIVE = 9;
};

} // namespace bb::avm