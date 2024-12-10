// AUTOGENERATED FILE
#pragma once

#include "barretenberg/relations/relation_parameters.hpp"
#include "barretenberg/relations/relation_types.hpp"

namespace bb::avm {

template <typename FF_> class aluImpl {
  public:
    using FF = FF_;

    static constexpr std::array<size_t, 50> SUBRELATION_PARTIAL_LENGTHS = { 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 4, 4,
                                                                            3, 3, 2, 3, 3, 4, 4, 5, 5, 5, 4, 7, 3,
                                                                            3, 3, 5, 5, 4, 7, 4, 3, 3, 3, 2, 3, 3,
                                                                            3, 4, 3, 3, 3, 3, 3, 4, 4, 4, 5 };

    template <typename ContainerOverSubrelations, typename AllEntities>
    void static accumulate(ContainerOverSubrelations& evals,
                           const AllEntities& new_term,
                           [[maybe_unused]] const RelationParameters<FF>&,
                           [[maybe_unused]] const FF& scaling_factor)
    {
        const auto constants_MEM_TAG_FF = FF(0);
        const auto constants_MEM_TAG_U1 = FF(1);
        const auto constants_MEM_TAG_U8 = FF(2);
        const auto constants_MEM_TAG_U16 = FF(3);
        const auto constants_MEM_TAG_U32 = FF(4);
        const auto constants_MEM_TAG_U64 = FF(5);
        const auto constants_MEM_TAG_U128 = FF(6);
        const auto alu_CMP_GADGET_GT =
            ((((new_term.alu_op_lt + new_term.alu_op_lte) + new_term.alu_op_div) + new_term.alu_op_shr) +
             new_term.alu_op_shl);
        const auto alu_MAX_BITS =
            ((((((new_term.alu_u1_tag * FF(1)) + (new_term.alu_u8_tag * FF(8))) + (new_term.alu_u16_tag * FF(16))) +
               (new_term.alu_u32_tag * FF(32))) +
              (new_term.alu_u64_tag * FF(64))) +
             (new_term.alu_u128_tag * FF(128)));
        const auto alu_MAX_BITS_POW = ((((((new_term.alu_u1_tag * FF(2)) + (new_term.alu_u8_tag * FF(256))) +
                                          (new_term.alu_u16_tag * FF(65536))) +
                                         (new_term.alu_u32_tag * FF(4294967296UL))) +
                                        (new_term.alu_u64_tag * FF(uint256_t{ 0UL, 1UL, 0UL, 0UL }))) +
                                       (new_term.alu_u128_tag * FF(uint256_t{ 0UL, 0UL, 1UL, 0UL })));
        const auto alu_UINT_MAX = (alu_MAX_BITS_POW - FF(1));
        const auto alu_LIMB_BITS_POW = (((((new_term.alu_u8_tag * FF(16)) + (new_term.alu_u16_tag * FF(256))) +
                                          (new_term.alu_u32_tag * FF(65536))) +
                                         (new_term.alu_u64_tag * FF(4294967296UL))) +
                                        (new_term.alu_u128_tag * FF(uint256_t{ 0UL, 1UL, 0UL, 0UL })));
        const auto alu_PRODUCT =
            ((new_term.alu_a_lo * new_term.alu_b_lo) +
             ((FF(1) - new_term.alu_u1_tag) *
              ((alu_LIMB_BITS_POW * new_term.alu_partial_prod_lo) +
               (alu_MAX_BITS_POW * (new_term.alu_partial_prod_hi + (new_term.alu_a_hi * new_term.alu_b_hi))))));
        const auto alu_RESULT = ((new_term.alu_op_add * (new_term.alu_ia + new_term.alu_ib)) +
                                 (new_term.alu_op_sub * (new_term.alu_ia - new_term.alu_ib)));
        const auto alu_NON_TRIVIAL_SHIFT = (FF(1) - new_term.alu_zero_shift);

        {
            using Accumulator = typename std::tuple_element_t<0, ContainerOverSubrelations>;
            auto tmp =
                (new_term.alu_sel_alu -
                 ((((((((((new_term.alu_op_add + new_term.alu_op_sub) + new_term.alu_op_mul) + new_term.alu_op_not) +
                        new_term.alu_op_eq) +
                       new_term.alu_op_cast) +
                      new_term.alu_op_lt) +
                     new_term.alu_op_lte) +
                    new_term.alu_op_shr) +
                   new_term.alu_op_shl) +
                  new_term.alu_op_div));
            tmp *= scaling_factor;
            std::get<0>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<1, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_u1_tag * (FF(1) - new_term.alu_u1_tag));
            tmp *= scaling_factor;
            std::get<1>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<2, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_u8_tag * (FF(1) - new_term.alu_u8_tag));
            tmp *= scaling_factor;
            std::get<2>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<3, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_u16_tag * (FF(1) - new_term.alu_u16_tag));
            tmp *= scaling_factor;
            std::get<3>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<4, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_u32_tag * (FF(1) - new_term.alu_u32_tag));
            tmp *= scaling_factor;
            std::get<4>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<5, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_u64_tag * (FF(1) - new_term.alu_u64_tag));
            tmp *= scaling_factor;
            std::get<5>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<6, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_u128_tag * (FF(1) - new_term.alu_u128_tag));
            tmp *= scaling_factor;
            std::get<6>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<7, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_ff_tag * (FF(1) - new_term.alu_ff_tag));
            tmp *= scaling_factor;
            std::get<7>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<8, ContainerOverSubrelations>;
            auto tmp =
                (new_term.alu_sel_alu *
                 (((((((new_term.alu_u1_tag + new_term.alu_u8_tag) + new_term.alu_u16_tag) + new_term.alu_u32_tag) +
                     new_term.alu_u64_tag) +
                    new_term.alu_u128_tag) +
                   new_term.alu_ff_tag) -
                  FF(1)));
            tmp *= scaling_factor;
            std::get<8>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<9, ContainerOverSubrelations>;
            auto tmp =
                (new_term.alu_in_tag -
                 (((((((constants_MEM_TAG_U1 * new_term.alu_u1_tag) + (constants_MEM_TAG_U8 * new_term.alu_u8_tag)) +
                      (constants_MEM_TAG_U16 * new_term.alu_u16_tag)) +
                     (constants_MEM_TAG_U32 * new_term.alu_u32_tag)) +
                    (constants_MEM_TAG_U64 * new_term.alu_u64_tag)) +
                   (constants_MEM_TAG_U128 * new_term.alu_u128_tag)) +
                  (constants_MEM_TAG_FF * new_term.alu_ff_tag)));
            tmp *= scaling_factor;
            std::get<9>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<10, ContainerOverSubrelations>;
            auto tmp =
                (new_term.alu_range_check_sel -
                 (((FF(1) - new_term.alu_ff_tag) *
                   ((((new_term.alu_op_add + new_term.alu_op_sub) + new_term.alu_op_mul) + new_term.alu_op_cast) +
                    new_term.alu_op_div)) +
                  ((new_term.alu_op_shr + new_term.alu_op_shl) * alu_NON_TRIVIAL_SHIFT)));
            tmp *= scaling_factor;
            std::get<10>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<11, ContainerOverSubrelations>;
            auto tmp =
                (new_term.alu_range_check_input_value -
                 (((((((new_term.alu_op_add + new_term.alu_op_sub) + new_term.alu_op_mul) + new_term.alu_op_cast) +
                     new_term.alu_op_div) *
                    new_term.alu_ic) +
                   ((new_term.alu_op_shr * new_term.alu_a_hi) * alu_NON_TRIVIAL_SHIFT)) +
                  ((new_term.alu_op_shl * new_term.alu_a_lo) * alu_NON_TRIVIAL_SHIFT)));
            tmp *= scaling_factor;
            std::get<11>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<12, ContainerOverSubrelations>;
            auto tmp =
                (new_term.alu_range_check_num_bits -
                 ((((((new_term.alu_op_add + new_term.alu_op_sub) + new_term.alu_op_mul) + new_term.alu_op_cast) +
                    new_term.alu_op_div) *
                   ((((((new_term.alu_u1_tag * FF(1)) + (new_term.alu_u8_tag * FF(8))) +
                       (new_term.alu_u16_tag * FF(16))) +
                      (new_term.alu_u32_tag * FF(32))) +
                     (new_term.alu_u64_tag * FF(64))) +
                    (new_term.alu_u128_tag * FF(128)))) +
                  (((new_term.alu_op_shl + new_term.alu_op_shr) * (alu_MAX_BITS - new_term.alu_ib)) *
                   alu_NON_TRIVIAL_SHIFT)));
            tmp *= scaling_factor;
            std::get<12>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<13, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_cmp_gadget_gt - (alu_CMP_GADGET_GT * new_term.alu_ff_tag));
            tmp *= scaling_factor;
            std::get<13>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<14, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_cmp_gadget_non_ff_gt - (alu_CMP_GADGET_GT * (FF(1) - new_term.alu_ff_tag)));
            tmp *= scaling_factor;
            std::get<14>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<15, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_cmp_gadget_sel -
                        ((new_term.alu_cmp_gadget_gt + new_term.alu_op_eq) + new_term.alu_cmp_gadget_non_ff_gt));
            tmp *= scaling_factor;
            std::get<15>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<16, ContainerOverSubrelations>;
            auto tmp = (((new_term.alu_a_lo * new_term.alu_b_hi) + (new_term.alu_b_lo * new_term.alu_a_hi)) -
                        (new_term.alu_partial_prod_lo + (alu_LIMB_BITS_POW * new_term.alu_partial_prod_hi)));
            tmp *= scaling_factor;
            std::get<16>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<17, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_cf * (FF(1) - new_term.alu_cf));
            tmp *= scaling_factor;
            std::get<17>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<18, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_add * ((alu_RESULT - new_term.alu_ic) - (new_term.alu_cf * alu_MAX_BITS_POW)));
            tmp *= scaling_factor;
            std::get<18>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<19, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_sub * ((alu_RESULT - new_term.alu_ic) + (new_term.alu_cf * alu_MAX_BITS_POW)));
            tmp *= scaling_factor;
            std::get<19>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<20, ContainerOverSubrelations>;
            auto tmp =
                ((new_term.alu_ff_tag * new_term.alu_op_mul) * ((new_term.alu_ia * new_term.alu_ib) - new_term.alu_ic));
            tmp *= scaling_factor;
            std::get<20>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<21, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_mul) *
                        ((new_term.alu_ia - new_term.alu_a_lo) - (alu_LIMB_BITS_POW * new_term.alu_a_hi)));
            tmp *= scaling_factor;
            std::get<21>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<22, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_mul) *
                        ((new_term.alu_ib - new_term.alu_b_lo) - (alu_LIMB_BITS_POW * new_term.alu_b_hi)));
            tmp *= scaling_factor;
            std::get<22>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<23, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_mul) * (new_term.alu_ic - new_term.alu_c_lo));
            tmp *= scaling_factor;
            std::get<23>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<24, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_mul) *
                        (alu_PRODUCT - (new_term.alu_c_lo + (alu_MAX_BITS_POW * new_term.alu_c_hi))));
            tmp *= scaling_factor;
            std::get<24>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<25, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_div * (new_term.alu_cmp_gadget_input_a - new_term.alu_ib));
            tmp *= scaling_factor;
            std::get<25>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<26, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_div * (new_term.alu_cmp_gadget_input_b - new_term.alu_remainder));
            tmp *= scaling_factor;
            std::get<26>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<27, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_div * (new_term.alu_cmp_gadget_result - FF(1)));
            tmp *= scaling_factor;
            std::get<27>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<28, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_div) *
                        ((new_term.alu_ib - new_term.alu_a_lo) - (alu_LIMB_BITS_POW * new_term.alu_a_hi)));
            tmp *= scaling_factor;
            std::get<28>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<29, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_div) *
                        ((new_term.alu_ic - new_term.alu_b_lo) - (alu_LIMB_BITS_POW * new_term.alu_b_hi)));
            tmp *= scaling_factor;
            std::get<29>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<30, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_div) * (new_term.alu_ia - new_term.alu_c_lo));
            tmp *= scaling_factor;
            std::get<30>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<31, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_div) *
                        (alu_PRODUCT -
                         ((new_term.alu_c_lo - new_term.alu_remainder) + (alu_MAX_BITS_POW * new_term.alu_c_hi))));
            tmp *= scaling_factor;
            std::get<31>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<32, ContainerOverSubrelations>;
            auto tmp = (((FF(1) - new_term.alu_ff_tag) * new_term.alu_op_not) *
                        ((new_term.alu_ia + new_term.alu_ic) - alu_UINT_MAX));
            tmp *= scaling_factor;
            std::get<32>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<33, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_eq * (new_term.alu_ia - new_term.alu_cmp_gadget_input_a));
            tmp *= scaling_factor;
            std::get<33>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<34, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_eq * (new_term.alu_ib - new_term.alu_cmp_gadget_input_b));
            tmp *= scaling_factor;
            std::get<34>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<35, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_eq * (new_term.alu_ic - new_term.alu_cmp_gadget_result));
            tmp *= scaling_factor;
            std::get<35>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<36, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_sel_cmp - (new_term.alu_op_lt + new_term.alu_op_lte));
            tmp *= scaling_factor;
            std::get<36>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<37, ContainerOverSubrelations>;
            auto tmp = ((new_term.alu_op_lt * (new_term.alu_ib - new_term.alu_cmp_gadget_input_a)) +
                        (new_term.alu_op_lte * (new_term.alu_ia - new_term.alu_cmp_gadget_input_a)));
            tmp *= scaling_factor;
            std::get<37>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<38, ContainerOverSubrelations>;
            auto tmp = ((new_term.alu_op_lt * (new_term.alu_ia - new_term.alu_cmp_gadget_input_b)) +
                        (new_term.alu_op_lte * (new_term.alu_ib - new_term.alu_cmp_gadget_input_b)));
            tmp *= scaling_factor;
            std::get<38>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<39, ContainerOverSubrelations>;
            auto tmp = ((new_term.alu_op_lte * ((FF(1) - new_term.alu_cmp_gadget_result) - new_term.alu_ic)) +
                        (new_term.alu_op_lt * (new_term.alu_cmp_gadget_result - new_term.alu_ic)));
            tmp *= scaling_factor;
            std::get<39>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<40, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_cast *
                        ((new_term.alu_ia - new_term.alu_a_lo) - (alu_MAX_BITS_POW * new_term.alu_a_hi)));
            tmp *= scaling_factor;
            std::get<40>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<41, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_cast * (new_term.alu_ic - new_term.alu_a_lo));
            tmp *= scaling_factor;
            std::get<41>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<42, ContainerOverSubrelations>;
            auto tmp =
                ((new_term.alu_op_shl + new_term.alu_op_shr) * (new_term.alu_cmp_gadget_input_a - new_term.alu_ib));
            tmp *= scaling_factor;
            std::get<42>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<43, ContainerOverSubrelations>;
            auto tmp = ((new_term.alu_op_shl + new_term.alu_op_shr) *
                        (new_term.alu_cmp_gadget_input_b - (alu_MAX_BITS - FF(1))));
            tmp *= scaling_factor;
            std::get<43>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<44, ContainerOverSubrelations>;
            auto tmp = ((new_term.alu_op_shl + new_term.alu_op_shr) *
                        (new_term.alu_zero_shift - new_term.alu_cmp_gadget_result));
            tmp *= scaling_factor;
            std::get<44>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<45, ContainerOverSubrelations>;
            auto tmp =
                (new_term.alu_sel_shift_which - ((new_term.alu_op_shr + new_term.alu_op_shl) * alu_NON_TRIVIAL_SHIFT));
            tmp *= scaling_factor;
            std::get<45>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<46, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_shr *
                        ((new_term.alu_ia - new_term.alu_a_lo) - (new_term.alu_b_pow * new_term.alu_a_hi)));
            tmp *= scaling_factor;
            std::get<46>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<47, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_shr * (new_term.alu_ic - (new_term.alu_a_hi * alu_NON_TRIVIAL_SHIFT)));
            tmp *= scaling_factor;
            std::get<47>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<48, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_shl * ((new_term.alu_ia - new_term.alu_a_lo) -
                                               (new_term.alu_max_bits_sub_b_pow * new_term.alu_a_hi)));
            tmp *= scaling_factor;
            std::get<48>(evals) += typename Accumulator::View(tmp);
        }
        {
            using Accumulator = typename std::tuple_element_t<49, ContainerOverSubrelations>;
            auto tmp = (new_term.alu_op_shl *
                        (new_term.alu_ic - ((new_term.alu_a_lo * new_term.alu_b_pow) * alu_NON_TRIVIAL_SHIFT)));
            tmp *= scaling_factor;
            std::get<49>(evals) += typename Accumulator::View(tmp);
        }
    }
};

template <typename FF> class alu : public Relation<aluImpl<FF>> {
  public:
    static constexpr const char* NAME = "alu";

    static std::string get_subrelation_label(size_t index)
    {
        switch (index) {
        case 20:
            return "ALU_MULTIPLICATION_FF";
        case 24:
            return "ALU_PROD_MUL";
        case 31:
            return "DIVISION_RELATION";
        case 32:
            return "ALU_OP_NOT";
        }
        return std::to_string(index);
    }

    // Subrelation indices constants, to be used in tests.
    static constexpr size_t SR_ALU_MULTIPLICATION_FF = 20;
    static constexpr size_t SR_ALU_PROD_MUL = 24;
    static constexpr size_t SR_DIVISION_RELATION = 31;
    static constexpr size_t SR_ALU_OP_NOT = 32;
};

} // namespace bb::avm