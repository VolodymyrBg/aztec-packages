// AUTOGENERATED FILE
#pragma once

#include "barretenberg/relations/relation_parameters.hpp"
#include "barretenberg/relations/relation_types.hpp"

namespace bb::avm {

template <typename FF_> class binaryImpl {
  public:
    using FF = FF_;

    static constexpr std::array<size_t, 10> SUBRELATION_PARTIAL_LENGTHS = { 3, 3, 3, 4, 3, 3, 3, 3, 3, 3 };

    template <typename ContainerOverSubrelations, typename AllEntities>
    void static accumulate(ContainerOverSubrelations& evals,
                           const AllEntities& new_term,
                           [[maybe_unused]] const RelationParameters<FF>&,
                           [[maybe_unused]] const FF& scaling_factor)
    {

        {
            using Accumulator = typename std::tuple_element_t<0, ContainerOverSubrelations>;
            auto tmp = (new_term.binary_sel_bin * (FF(1) - new_term.binary_sel_bin));
            tmp *= scaling_factor;
            std::get<0>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<1, ContainerOverSubrelations>;
            auto tmp = ((new_term.binary_op_id_shift - new_term.binary_op_id) * new_term.binary_mem_tag_ctr);
            tmp *= scaling_factor;
            std::get<1>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<2, ContainerOverSubrelations>;
            auto tmp = (((new_term.binary_mem_tag_ctr_shift - new_term.binary_mem_tag_ctr) + FF(1)) *
                        new_term.binary_mem_tag_ctr);
            tmp *= scaling_factor;
            std::get<2>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<3, ContainerOverSubrelations>;
            auto tmp = ((new_term.binary_mem_tag_ctr *
                         (((FF(1) - new_term.binary_sel_bin) * (FF(1) - new_term.binary_mem_tag_ctr_inv)) +
                          new_term.binary_mem_tag_ctr_inv)) -
                        new_term.binary_sel_bin);
            tmp *= scaling_factor;
            std::get<3>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<4, ContainerOverSubrelations>;
            auto tmp = ((FF(1) - new_term.binary_sel_bin) * new_term.binary_acc_ia);
            tmp *= scaling_factor;
            std::get<4>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<5, ContainerOverSubrelations>;
            auto tmp = ((FF(1) - new_term.binary_sel_bin) * new_term.binary_acc_ib);
            tmp *= scaling_factor;
            std::get<5>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<6, ContainerOverSubrelations>;
            auto tmp = ((FF(1) - new_term.binary_sel_bin) * new_term.binary_acc_ic);
            tmp *= scaling_factor;
            std::get<6>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<7, ContainerOverSubrelations>;
            auto tmp =
                (((new_term.binary_acc_ia - new_term.binary_ia_bytes) - (FF(256) * new_term.binary_acc_ia_shift)) *
                 new_term.binary_mem_tag_ctr);
            tmp *= scaling_factor;
            std::get<7>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<8, ContainerOverSubrelations>;
            auto tmp =
                (((new_term.binary_acc_ib - new_term.binary_ib_bytes) - (FF(256) * new_term.binary_acc_ib_shift)) *
                 new_term.binary_mem_tag_ctr);
            tmp *= scaling_factor;
            std::get<8>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<9, ContainerOverSubrelations>;
            auto tmp =
                (((new_term.binary_acc_ic - new_term.binary_ic_bytes) - (FF(256) * new_term.binary_acc_ic_shift)) *
                 new_term.binary_mem_tag_ctr);
            tmp *= scaling_factor;
            std::get<9>(evals) += typename Accumulator::View(tmp);
        }
    }
};

template <typename FF> class binary : public Relation<binaryImpl<FF>> {
  public:
    static constexpr const char* NAME = "binary";

    static std::string get_subrelation_label(size_t index)
    {
        switch (index) {
        case 1:
            return "OP_ID_REL";
        case 2:
            return "MEM_TAG_REL";
        case 3:
            return "SEL_BIN_CTR_REL";
        case 7:
            return "ACC_REL_A";
        case 8:
            return "ACC_REL_B";
        case 9:
            return "ACC_REL_C";
        }
        return std::to_string(index);
    }

    static constexpr size_t SR_OP_ID_REL = 1;
    static constexpr size_t SR_MEM_TAG_REL = 2;
    static constexpr size_t SR_SEL_BIN_CTR_REL = 3;
    static constexpr size_t SR_ACC_REL_A = 7;
    static constexpr size_t SR_ACC_REL_B = 8;
    static constexpr size_t SR_ACC_REL_C = 9;
};

} // namespace bb::avm