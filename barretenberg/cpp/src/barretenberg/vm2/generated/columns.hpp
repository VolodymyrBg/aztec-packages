#pragma once

#include <array>
#include <optional>

#include "barretenberg/common/std_string.hpp"

namespace bb::avm2 {

// The entities that will be used in the flavor.
// clang-format off
#define AVM2_PRECOMPUTED_ENTITIES precomputed_as_unary, precomputed_bitwise_input_a, precomputed_bitwise_input_b, precomputed_bitwise_op_id, precomputed_bitwise_output, precomputed_clk, precomputed_first_row, precomputed_integral_tag_length, precomputed_power_of_2, precomputed_sel_bitwise, precomputed_sel_integral_tag, precomputed_sel_range_16, precomputed_sel_range_8, precomputed_sel_sha256_compression, precomputed_sel_unary, precomputed_sha256_compression_round_constant
#define AVM2_WIRE_ENTITIES execution_input, alu_dst_addr, alu_ia, alu_ia_addr, alu_ib, alu_ib_addr, alu_ic, alu_op, alu_sel_op_add, bc_decomposition_abs_diff, bc_decomposition_bytes, bc_decomposition_bytes_pc_plus_1, bc_decomposition_bytes_pc_plus_10, bc_decomposition_bytes_pc_plus_11, bc_decomposition_bytes_pc_plus_12, bc_decomposition_bytes_pc_plus_13, bc_decomposition_bytes_pc_plus_14, bc_decomposition_bytes_pc_plus_15, bc_decomposition_bytes_pc_plus_16, bc_decomposition_bytes_pc_plus_17, bc_decomposition_bytes_pc_plus_18, bc_decomposition_bytes_pc_plus_19, bc_decomposition_bytes_pc_plus_2, bc_decomposition_bytes_pc_plus_20, bc_decomposition_bytes_pc_plus_21, bc_decomposition_bytes_pc_plus_22, bc_decomposition_bytes_pc_plus_23, bc_decomposition_bytes_pc_plus_24, bc_decomposition_bytes_pc_plus_25, bc_decomposition_bytes_pc_plus_26, bc_decomposition_bytes_pc_plus_27, bc_decomposition_bytes_pc_plus_28, bc_decomposition_bytes_pc_plus_29, bc_decomposition_bytes_pc_plus_3, bc_decomposition_bytes_pc_plus_30, bc_decomposition_bytes_pc_plus_31, bc_decomposition_bytes_pc_plus_32, bc_decomposition_bytes_pc_plus_33, bc_decomposition_bytes_pc_plus_34, bc_decomposition_bytes_pc_plus_35, bc_decomposition_bytes_pc_plus_4, bc_decomposition_bytes_pc_plus_5, bc_decomposition_bytes_pc_plus_6, bc_decomposition_bytes_pc_plus_7, bc_decomposition_bytes_pc_plus_8, bc_decomposition_bytes_pc_plus_9, bc_decomposition_bytes_rem_inv, bc_decomposition_bytes_rem_min_one_inv, bc_decomposition_bytes_remaining, bc_decomposition_bytes_to_read, bc_decomposition_bytes_to_read_unary, bc_decomposition_id, bc_decomposition_last_of_contract, bc_decomposition_pc, bc_decomposition_sel, bc_decomposition_sel_overflow_correction_needed, bc_decomposition_sel_pc_plus_1, bc_decomposition_sel_pc_plus_10, bc_decomposition_sel_pc_plus_11, bc_decomposition_sel_pc_plus_12, bc_decomposition_sel_pc_plus_13, bc_decomposition_sel_pc_plus_14, bc_decomposition_sel_pc_plus_15, bc_decomposition_sel_pc_plus_16, bc_decomposition_sel_pc_plus_17, bc_decomposition_sel_pc_plus_18, bc_decomposition_sel_pc_plus_19, bc_decomposition_sel_pc_plus_2, bc_decomposition_sel_pc_plus_20, bc_decomposition_sel_pc_plus_21, bc_decomposition_sel_pc_plus_22, bc_decomposition_sel_pc_plus_23, bc_decomposition_sel_pc_plus_24, bc_decomposition_sel_pc_plus_25, bc_decomposition_sel_pc_plus_26, bc_decomposition_sel_pc_plus_27, bc_decomposition_sel_pc_plus_28, bc_decomposition_sel_pc_plus_29, bc_decomposition_sel_pc_plus_3, bc_decomposition_sel_pc_plus_30, bc_decomposition_sel_pc_plus_31, bc_decomposition_sel_pc_plus_32, bc_decomposition_sel_pc_plus_33, bc_decomposition_sel_pc_plus_34, bc_decomposition_sel_pc_plus_35, bc_decomposition_sel_pc_plus_4, bc_decomposition_sel_pc_plus_5, bc_decomposition_sel_pc_plus_6, bc_decomposition_sel_pc_plus_7, bc_decomposition_sel_pc_plus_8, bc_decomposition_sel_pc_plus_9, bc_retrieval_address, bc_retrieval_artifact_hash, bc_retrieval_bytecode_id, bc_retrieval_class_id, bc_retrieval_deployer_addr, bc_retrieval_err, bc_retrieval_incoming_viewing_key_x, bc_retrieval_incoming_viewing_key_y, bc_retrieval_init_hash, bc_retrieval_nullifier_key_x, bc_retrieval_nullifier_key_y, bc_retrieval_outgoing_viewing_key_x, bc_retrieval_outgoing_viewing_key_y, bc_retrieval_private_function_root, bc_retrieval_public_bytecode_commitment, bc_retrieval_salt, bc_retrieval_sel, bc_retrieval_tagging_key_x, bc_retrieval_tagging_key_y, bitwise_acc_ia, bitwise_acc_ib, bitwise_acc_ic, bitwise_ctr, bitwise_ctr_inv, bitwise_ctr_min_one_inv, bitwise_ia_byte, bitwise_ib_byte, bitwise_ic_byte, bitwise_last, bitwise_op_id, bitwise_sel, bitwise_start, bitwise_tag, ecc_add_op, ecc_double_op, ecc_inv_2_p_y, ecc_inv_x_diff, ecc_inv_y_diff, ecc_lambda, ecc_p_is_inf, ecc_p_x, ecc_p_y, ecc_q_is_inf, ecc_q_x, ecc_q_y, ecc_r_is_inf, ecc_r_x, ecc_r_y, ecc_result_infinity, ecc_sel, ecc_x_match, ecc_y_match, execution_addressing_error_idx, execution_addressing_error_kind, execution_base_address_tag, execution_base_address_val, execution_bytecode_id, execution_clk, execution_ex_opcode, execution_indirect, execution_last, execution_op1, execution_op1_after_relative, execution_op2, execution_op2_after_relative, execution_op3, execution_op3_after_relative, execution_op4, execution_op4_after_relative, execution_pc, execution_rop1, execution_rop2, execution_rop3, execution_rop4, execution_sel, execution_sel_addressing_error, execution_sel_op1_is_address, execution_sel_op2_is_address, execution_sel_op3_is_address, execution_sel_op4_is_address, instr_fetching_bd0, instr_fetching_bd1, instr_fetching_bd10, instr_fetching_bd11, instr_fetching_bd12, instr_fetching_bd13, instr_fetching_bd14, instr_fetching_bd15, instr_fetching_bd16, instr_fetching_bd17, instr_fetching_bd18, instr_fetching_bd19, instr_fetching_bd2, instr_fetching_bd20, instr_fetching_bd21, instr_fetching_bd22, instr_fetching_bd23, instr_fetching_bd24, instr_fetching_bd25, instr_fetching_bd26, instr_fetching_bd27, instr_fetching_bd28, instr_fetching_bd29, instr_fetching_bd3, instr_fetching_bd30, instr_fetching_bd31, instr_fetching_bd32, instr_fetching_bd33, instr_fetching_bd34, instr_fetching_bd35, instr_fetching_bd4, instr_fetching_bd5, instr_fetching_bd6, instr_fetching_bd7, instr_fetching_bd8, instr_fetching_bd9, instr_fetching_bytecode_id, instr_fetching_ex_opcode, instr_fetching_fmt_3_op_u8, instr_fetching_indirect, instr_fetching_op1, instr_fetching_op2, instr_fetching_op3, instr_fetching_op4, instr_fetching_pc, instr_fetching_sel, range_check_dyn_diff, range_check_dyn_rng_chk_bits, range_check_dyn_rng_chk_pow_2, range_check_is_lte_u112, range_check_is_lte_u128, range_check_is_lte_u16, range_check_is_lte_u32, range_check_is_lte_u48, range_check_is_lte_u64, range_check_is_lte_u80, range_check_is_lte_u96, range_check_rng_chk_bits, range_check_sel, range_check_sel_r0_16_bit_rng_lookup, range_check_sel_r1_16_bit_rng_lookup, range_check_sel_r2_16_bit_rng_lookup, range_check_sel_r3_16_bit_rng_lookup, range_check_sel_r4_16_bit_rng_lookup, range_check_sel_r5_16_bit_rng_lookup, range_check_sel_r6_16_bit_rng_lookup, range_check_u16_r0, range_check_u16_r1, range_check_u16_r2, range_check_u16_r3, range_check_u16_r4, range_check_u16_r5, range_check_u16_r6, range_check_u16_r7, range_check_value, sha256_a, sha256_a_and_b, sha256_a_and_b_xor_a_and_c, sha256_a_and_c, sha256_a_rotr_13, sha256_a_rotr_2, sha256_a_rotr_22, sha256_a_rotr_2_xor_a_rotr_13, sha256_and_sel, sha256_b, sha256_b_and_c, sha256_c, sha256_ch, sha256_clk, sha256_computed_w_lhs, sha256_computed_w_rhs, sha256_d, sha256_dummy_zero, sha256_e, sha256_e_and_f, sha256_e_rotr_11, sha256_e_rotr_25, sha256_e_rotr_6, sha256_e_rotr_6_xor_e_rotr_11, sha256_f, sha256_g, sha256_h, sha256_helper_w0, sha256_helper_w1, sha256_helper_w10, sha256_helper_w11, sha256_helper_w12, sha256_helper_w13, sha256_helper_w14, sha256_helper_w15, sha256_helper_w2, sha256_helper_w3, sha256_helper_w4, sha256_helper_w5, sha256_helper_w6, sha256_helper_w7, sha256_helper_w8, sha256_helper_w9, sha256_init_a, sha256_init_b, sha256_init_c, sha256_init_d, sha256_init_e, sha256_init_f, sha256_init_g, sha256_init_h, sha256_input_offset, sha256_is_input_round, sha256_latch, sha256_lhs_a_13, sha256_lhs_a_2, sha256_lhs_a_22, sha256_lhs_e_11, sha256_lhs_e_25, sha256_lhs_e_6, sha256_lhs_w_10, sha256_lhs_w_17, sha256_lhs_w_18, sha256_lhs_w_19, sha256_lhs_w_3, sha256_lhs_w_7, sha256_maj, sha256_next_a_lhs, sha256_next_a_rhs, sha256_next_e_lhs, sha256_next_e_rhs, sha256_not_e, sha256_not_e_and_g, sha256_output_a_lhs, sha256_output_a_rhs, sha256_output_b_lhs, sha256_output_b_rhs, sha256_output_c_lhs, sha256_output_c_rhs, sha256_output_d_lhs, sha256_output_d_rhs, sha256_output_e_lhs, sha256_output_e_rhs, sha256_output_f_lhs, sha256_output_f_rhs, sha256_output_g_lhs, sha256_output_g_rhs, sha256_output_h_lhs, sha256_output_h_rhs, sha256_output_offset, sha256_perform_round, sha256_rhs_a_13, sha256_rhs_a_2, sha256_rhs_a_22, sha256_rhs_e_11, sha256_rhs_e_25, sha256_rhs_e_6, sha256_rhs_w_10, sha256_rhs_w_17, sha256_rhs_w_18, sha256_rhs_w_19, sha256_rhs_w_3, sha256_rhs_w_7, sha256_round_constant, sha256_round_count, sha256_rounds_remaining, sha256_rounds_remaining_inv, sha256_s_0, sha256_s_1, sha256_sel, sha256_start, sha256_state_offset, sha256_w, sha256_w_15_rotr_18, sha256_w_15_rotr_7, sha256_w_15_rotr_7_xor_w_15_rotr_18, sha256_w_15_rshift_3, sha256_w_2_rotr_17, sha256_w_2_rotr_17_xor_w_2_rotr_19, sha256_w_2_rotr_19, sha256_w_2_rshift_10, sha256_w_s_0, sha256_w_s_1, sha256_xor_sel, lookup_bytecode_bytes_are_bytes_counts, lookup_bytecode_remaining_abs_diff_u16_counts, lookup_bytecode_to_read_unary_counts, lookup_rng_chk_pow_2_counts, lookup_rng_chk_diff_counts, lookup_rng_chk_is_r0_16_bit_counts, lookup_rng_chk_is_r1_16_bit_counts, lookup_rng_chk_is_r2_16_bit_counts, lookup_rng_chk_is_r3_16_bit_counts, lookup_rng_chk_is_r4_16_bit_counts, lookup_rng_chk_is_r5_16_bit_counts, lookup_rng_chk_is_r6_16_bit_counts, lookup_rng_chk_is_r7_16_bit_counts, lookup_bitw_byte_lengths_counts, lookup_bitw_byte_operations_counts, lookup_sha256_round_constant_counts, lookup_dummy_precomputed_counts, lookup_dummy_dynamic_counts
#define AVM2_DERIVED_WITNESS_ENTITIES perm_dummy_dynamic_inv, lookup_bytecode_bytes_are_bytes_inv, lookup_bytecode_remaining_abs_diff_u16_inv, lookup_bytecode_to_read_unary_inv, lookup_rng_chk_pow_2_inv, lookup_rng_chk_diff_inv, lookup_rng_chk_is_r0_16_bit_inv, lookup_rng_chk_is_r1_16_bit_inv, lookup_rng_chk_is_r2_16_bit_inv, lookup_rng_chk_is_r3_16_bit_inv, lookup_rng_chk_is_r4_16_bit_inv, lookup_rng_chk_is_r5_16_bit_inv, lookup_rng_chk_is_r6_16_bit_inv, lookup_rng_chk_is_r7_16_bit_inv, lookup_bitw_byte_lengths_inv, lookup_bitw_byte_operations_inv, lookup_sha256_round_constant_inv, lookup_dummy_precomputed_inv, lookup_dummy_dynamic_inv
#define AVM2_SHIFTED_ENTITIES bc_decomposition_bytes_shift, bc_decomposition_bytes_pc_plus_1_shift, bc_decomposition_bytes_pc_plus_10_shift, bc_decomposition_bytes_pc_plus_11_shift, bc_decomposition_bytes_pc_plus_12_shift, bc_decomposition_bytes_pc_plus_13_shift, bc_decomposition_bytes_pc_plus_14_shift, bc_decomposition_bytes_pc_plus_15_shift, bc_decomposition_bytes_pc_plus_16_shift, bc_decomposition_bytes_pc_plus_17_shift, bc_decomposition_bytes_pc_plus_18_shift, bc_decomposition_bytes_pc_plus_19_shift, bc_decomposition_bytes_pc_plus_2_shift, bc_decomposition_bytes_pc_plus_20_shift, bc_decomposition_bytes_pc_plus_21_shift, bc_decomposition_bytes_pc_plus_22_shift, bc_decomposition_bytes_pc_plus_23_shift, bc_decomposition_bytes_pc_plus_24_shift, bc_decomposition_bytes_pc_plus_25_shift, bc_decomposition_bytes_pc_plus_26_shift, bc_decomposition_bytes_pc_plus_27_shift, bc_decomposition_bytes_pc_plus_28_shift, bc_decomposition_bytes_pc_plus_29_shift, bc_decomposition_bytes_pc_plus_3_shift, bc_decomposition_bytes_pc_plus_30_shift, bc_decomposition_bytes_pc_plus_31_shift, bc_decomposition_bytes_pc_plus_32_shift, bc_decomposition_bytes_pc_plus_33_shift, bc_decomposition_bytes_pc_plus_34_shift, bc_decomposition_bytes_pc_plus_4_shift, bc_decomposition_bytes_pc_plus_5_shift, bc_decomposition_bytes_pc_plus_6_shift, bc_decomposition_bytes_pc_plus_7_shift, bc_decomposition_bytes_pc_plus_8_shift, bc_decomposition_bytes_pc_plus_9_shift, bc_decomposition_bytes_remaining_shift, bc_decomposition_id_shift, bc_decomposition_pc_shift, bc_decomposition_sel_shift, bitwise_acc_ia_shift, bitwise_acc_ib_shift, bitwise_acc_ic_shift, bitwise_ctr_shift, bitwise_op_id_shift, execution_sel_shift, sha256_a_shift, sha256_b_shift, sha256_c_shift, sha256_d_shift, sha256_e_shift, sha256_f_shift, sha256_g_shift, sha256_h_shift, sha256_helper_w0_shift, sha256_helper_w1_shift, sha256_helper_w10_shift, sha256_helper_w11_shift, sha256_helper_w12_shift, sha256_helper_w13_shift, sha256_helper_w14_shift, sha256_helper_w15_shift, sha256_helper_w2_shift, sha256_helper_w3_shift, sha256_helper_w4_shift, sha256_helper_w5_shift, sha256_helper_w6_shift, sha256_helper_w7_shift, sha256_helper_w8_shift, sha256_helper_w9_shift, sha256_rounds_remaining_shift, sha256_sel_shift, sha256_start_shift
#define AVM2_TO_BE_SHIFTED(e) e.bc_decomposition_bytes, e.bc_decomposition_bytes_pc_plus_1, e.bc_decomposition_bytes_pc_plus_10, e.bc_decomposition_bytes_pc_plus_11, e.bc_decomposition_bytes_pc_plus_12, e.bc_decomposition_bytes_pc_plus_13, e.bc_decomposition_bytes_pc_plus_14, e.bc_decomposition_bytes_pc_plus_15, e.bc_decomposition_bytes_pc_plus_16, e.bc_decomposition_bytes_pc_plus_17, e.bc_decomposition_bytes_pc_plus_18, e.bc_decomposition_bytes_pc_plus_19, e.bc_decomposition_bytes_pc_plus_2, e.bc_decomposition_bytes_pc_plus_20, e.bc_decomposition_bytes_pc_plus_21, e.bc_decomposition_bytes_pc_plus_22, e.bc_decomposition_bytes_pc_plus_23, e.bc_decomposition_bytes_pc_plus_24, e.bc_decomposition_bytes_pc_plus_25, e.bc_decomposition_bytes_pc_plus_26, e.bc_decomposition_bytes_pc_plus_27, e.bc_decomposition_bytes_pc_plus_28, e.bc_decomposition_bytes_pc_plus_29, e.bc_decomposition_bytes_pc_plus_3, e.bc_decomposition_bytes_pc_plus_30, e.bc_decomposition_bytes_pc_plus_31, e.bc_decomposition_bytes_pc_plus_32, e.bc_decomposition_bytes_pc_plus_33, e.bc_decomposition_bytes_pc_plus_34, e.bc_decomposition_bytes_pc_plus_4, e.bc_decomposition_bytes_pc_plus_5, e.bc_decomposition_bytes_pc_plus_6, e.bc_decomposition_bytes_pc_plus_7, e.bc_decomposition_bytes_pc_plus_8, e.bc_decomposition_bytes_pc_plus_9, e.bc_decomposition_bytes_remaining, e.bc_decomposition_id, e.bc_decomposition_pc, e.bc_decomposition_sel, e.bitwise_acc_ia, e.bitwise_acc_ib, e.bitwise_acc_ic, e.bitwise_ctr, e.bitwise_op_id, e.execution_sel, e.sha256_a, e.sha256_b, e.sha256_c, e.sha256_d, e.sha256_e, e.sha256_f, e.sha256_g, e.sha256_h, e.sha256_helper_w0, e.sha256_helper_w1, e.sha256_helper_w10, e.sha256_helper_w11, e.sha256_helper_w12, e.sha256_helper_w13, e.sha256_helper_w14, e.sha256_helper_w15, e.sha256_helper_w2, e.sha256_helper_w3, e.sha256_helper_w4, e.sha256_helper_w5, e.sha256_helper_w6, e.sha256_helper_w7, e.sha256_helper_w8, e.sha256_helper_w9, e.sha256_rounds_remaining, e.sha256_sel, e.sha256_start
#define AVM2_ALL_ENTITIES AVM2_PRECOMPUTED_ENTITIES, AVM2_WIRE_ENTITIES, AVM2_DERIVED_WITNESS_ENTITIES, AVM2_SHIFTED_ENTITIES
#define AVM2_UNSHIFTED_ENTITIES AVM2_PRECOMPUTED_ENTITIES, AVM2_WIRE_ENTITIES, AVM2_DERIVED_WITNESS_ENTITIES
#define AVM2_WITNESS_ENTITIES AVM2_WIRE_ENTITIES, AVM2_DERIVED_WITNESS_ENTITIES

#define AVM2_TO_BE_SHIFTED_COLUMNS Column::bc_decomposition_bytes, Column::bc_decomposition_bytes_pc_plus_1, Column::bc_decomposition_bytes_pc_plus_10, Column::bc_decomposition_bytes_pc_plus_11, Column::bc_decomposition_bytes_pc_plus_12, Column::bc_decomposition_bytes_pc_plus_13, Column::bc_decomposition_bytes_pc_plus_14, Column::bc_decomposition_bytes_pc_plus_15, Column::bc_decomposition_bytes_pc_plus_16, Column::bc_decomposition_bytes_pc_plus_17, Column::bc_decomposition_bytes_pc_plus_18, Column::bc_decomposition_bytes_pc_plus_19, Column::bc_decomposition_bytes_pc_plus_2, Column::bc_decomposition_bytes_pc_plus_20, Column::bc_decomposition_bytes_pc_plus_21, Column::bc_decomposition_bytes_pc_plus_22, Column::bc_decomposition_bytes_pc_plus_23, Column::bc_decomposition_bytes_pc_plus_24, Column::bc_decomposition_bytes_pc_plus_25, Column::bc_decomposition_bytes_pc_plus_26, Column::bc_decomposition_bytes_pc_plus_27, Column::bc_decomposition_bytes_pc_plus_28, Column::bc_decomposition_bytes_pc_plus_29, Column::bc_decomposition_bytes_pc_plus_3, Column::bc_decomposition_bytes_pc_plus_30, Column::bc_decomposition_bytes_pc_plus_31, Column::bc_decomposition_bytes_pc_plus_32, Column::bc_decomposition_bytes_pc_plus_33, Column::bc_decomposition_bytes_pc_plus_34, Column::bc_decomposition_bytes_pc_plus_4, Column::bc_decomposition_bytes_pc_plus_5, Column::bc_decomposition_bytes_pc_plus_6, Column::bc_decomposition_bytes_pc_plus_7, Column::bc_decomposition_bytes_pc_plus_8, Column::bc_decomposition_bytes_pc_plus_9, Column::bc_decomposition_bytes_remaining, Column::bc_decomposition_id, Column::bc_decomposition_pc, Column::bc_decomposition_sel, Column::bitwise_acc_ia, Column::bitwise_acc_ib, Column::bitwise_acc_ic, Column::bitwise_ctr, Column::bitwise_op_id, Column::execution_sel, Column::sha256_a, Column::sha256_b, Column::sha256_c, Column::sha256_d, Column::sha256_e, Column::sha256_f, Column::sha256_g, Column::sha256_h, Column::sha256_helper_w0, Column::sha256_helper_w1, Column::sha256_helper_w10, Column::sha256_helper_w11, Column::sha256_helper_w12, Column::sha256_helper_w13, Column::sha256_helper_w14, Column::sha256_helper_w15, Column::sha256_helper_w2, Column::sha256_helper_w3, Column::sha256_helper_w4, Column::sha256_helper_w5, Column::sha256_helper_w6, Column::sha256_helper_w7, Column::sha256_helper_w8, Column::sha256_helper_w9, Column::sha256_rounds_remaining, Column::sha256_sel, Column::sha256_start
#define AVM2_SHIFTED_COLUMNS ColumnAndShifts::bc_decomposition_bytes_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_1_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_10_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_11_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_12_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_13_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_14_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_15_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_16_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_17_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_18_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_19_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_2_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_20_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_21_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_22_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_23_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_24_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_25_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_26_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_27_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_28_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_29_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_3_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_30_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_31_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_32_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_33_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_34_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_4_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_5_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_6_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_7_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_8_shift, ColumnAndShifts::bc_decomposition_bytes_pc_plus_9_shift, ColumnAndShifts::bc_decomposition_bytes_remaining_shift, ColumnAndShifts::bc_decomposition_id_shift, ColumnAndShifts::bc_decomposition_pc_shift, ColumnAndShifts::bc_decomposition_sel_shift, ColumnAndShifts::bitwise_acc_ia_shift, ColumnAndShifts::bitwise_acc_ib_shift, ColumnAndShifts::bitwise_acc_ic_shift, ColumnAndShifts::bitwise_ctr_shift, ColumnAndShifts::bitwise_op_id_shift, ColumnAndShifts::execution_sel_shift, ColumnAndShifts::sha256_a_shift, ColumnAndShifts::sha256_b_shift, ColumnAndShifts::sha256_c_shift, ColumnAndShifts::sha256_d_shift, ColumnAndShifts::sha256_e_shift, ColumnAndShifts::sha256_f_shift, ColumnAndShifts::sha256_g_shift, ColumnAndShifts::sha256_h_shift, ColumnAndShifts::sha256_helper_w0_shift, ColumnAndShifts::sha256_helper_w1_shift, ColumnAndShifts::sha256_helper_w10_shift, ColumnAndShifts::sha256_helper_w11_shift, ColumnAndShifts::sha256_helper_w12_shift, ColumnAndShifts::sha256_helper_w13_shift, ColumnAndShifts::sha256_helper_w14_shift, ColumnAndShifts::sha256_helper_w15_shift, ColumnAndShifts::sha256_helper_w2_shift, ColumnAndShifts::sha256_helper_w3_shift, ColumnAndShifts::sha256_helper_w4_shift, ColumnAndShifts::sha256_helper_w5_shift, ColumnAndShifts::sha256_helper_w6_shift, ColumnAndShifts::sha256_helper_w7_shift, ColumnAndShifts::sha256_helper_w8_shift, ColumnAndShifts::sha256_helper_w9_shift, ColumnAndShifts::sha256_rounds_remaining_shift, ColumnAndShifts::sha256_sel_shift, ColumnAndShifts::sha256_start_shift
// clang-format on

// All columns minus shifts.
enum class Column { AVM2_UNSHIFTED_ENTITIES };

// C++ doesn't allow enum extension, so we'll have to cast.
enum class ColumnAndShifts {
    AVM2_ALL_ENTITIES,
    SENTINEL_DO_NOT_USE,
};

constexpr auto NUM_COLUMNS_WITH_SHIFTS = 495;
constexpr auto NUM_COLUMNS_WITHOUT_SHIFTS = 423;
constexpr auto TO_BE_SHIFTED_COLUMNS_ARRAY = []() { return std::array{ AVM2_TO_BE_SHIFTED_COLUMNS }; }();
constexpr auto SHIFTED_COLUMNS_ARRAY = []() { return std::array{ AVM2_SHIFTED_COLUMNS }; }();
static_assert(TO_BE_SHIFTED_COLUMNS_ARRAY.size() == SHIFTED_COLUMNS_ARRAY.size());

// Two layers are needed to properly expand the macro. Don't ask why.
#define VARARGS_TO_STRING(...) #__VA_ARGS__
#define UNPACK_TO_STRING(...) VARARGS_TO_STRING(__VA_ARGS__)
inline const std::vector<std::string>& COLUMN_NAMES = []() {
    static auto vec = detail::split_and_trim(UNPACK_TO_STRING(AVM2_ALL_ENTITIES), ',');
    return vec;
}();

} // namespace bb::avm2