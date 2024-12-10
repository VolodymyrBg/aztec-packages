#pragma once

#include <array>
#include <optional>

namespace bb::avm {

// The entities that will be used in the flavor.
// clang-format off
#define AVM_PRECOMPUTED_ENTITIES byte_lookup_sel_bin, byte_lookup_table_byte_lengths, byte_lookup_table_in_tags, byte_lookup_table_input_a, byte_lookup_table_input_b, byte_lookup_table_op_id, byte_lookup_table_output, gas_base_da_gas_fixed_table, gas_base_l2_gas_fixed_table, gas_dyn_da_gas_fixed_table, gas_dyn_l2_gas_fixed_table, gas_sel_gas_cost, main_clk, main_sel_da_end_gas_kernel_input, main_sel_da_start_gas_kernel_input, main_sel_first, main_sel_l2_end_gas_kernel_input, main_sel_l2_start_gas_kernel_input, main_sel_start_exec, main_zeroes, powers_power_of_2
#define AVM_WIRE_ENTITIES main_kernel_inputs, main_kernel_value_out, main_kernel_side_effect_out, main_kernel_metadata_out, main_calldata, main_returndata, alu_a_hi, alu_a_lo, alu_b_hi, alu_b_lo, alu_b_pow, alu_c_hi, alu_c_lo, alu_cf, alu_clk, alu_cmp_gadget_gt, alu_cmp_gadget_input_a, alu_cmp_gadget_input_b, alu_cmp_gadget_non_ff_gt, alu_cmp_gadget_result, alu_cmp_gadget_sel, alu_ff_tag, alu_ia, alu_ib, alu_ic, alu_in_tag, alu_max_bits_sub_b_bits, alu_max_bits_sub_b_pow, alu_op_add, alu_op_cast, alu_op_div, alu_op_eq, alu_op_lt, alu_op_lte, alu_op_mul, alu_op_not, alu_op_shl, alu_op_shr, alu_op_sub, alu_partial_prod_hi, alu_partial_prod_lo, alu_range_check_input_value, alu_range_check_num_bits, alu_range_check_sel, alu_remainder, alu_sel_alu, alu_sel_cmp, alu_sel_shift_which, alu_u128_tag, alu_u16_tag, alu_u1_tag, alu_u32_tag, alu_u64_tag, alu_u8_tag, alu_zero_shift, binary_acc_ia, binary_acc_ib, binary_acc_ic, binary_clk, binary_ia_bytes, binary_ib_bytes, binary_ic_bytes, binary_in_tag, binary_mem_tag_ctr, binary_mem_tag_ctr_inv, binary_op_id, binary_sel_bin, binary_start, bytecode_arifact_hash, bytecode_as_fields, bytecode_bytes, bytecode_bytes_pc, bytecode_class_id, bytecode_contract_address, bytecode_decomposed, bytecode_deployer_addr, bytecode_end_latch, bytecode_incoming_viewing_key_x, bytecode_incoming_viewing_key_y, bytecode_initialization_hash, bytecode_length_remaining, bytecode_nullifier_key_x, bytecode_nullifier_key_y, bytecode_outgoing_viewing_key_x, bytecode_outgoing_viewing_key_y, bytecode_private_fn_root, bytecode_public_key_hash, bytecode_running_hash, bytecode_salt, bytecode_tagging_key_x, bytecode_tagging_key_y, cmp_a_hi, cmp_a_lo, cmp_b_hi, cmp_b_lo, cmp_borrow, cmp_clk, cmp_cmp_rng_ctr, cmp_diff, cmp_input_a, cmp_input_b, cmp_op_eq, cmp_op_eq_diff_inv, cmp_op_gt, cmp_op_non_ff_gt, cmp_p_a_borrow, cmp_p_b_borrow, cmp_p_sub_a_hi, cmp_p_sub_a_lo, cmp_p_sub_b_hi, cmp_p_sub_b_lo, cmp_range_chk_clk, cmp_res_hi, cmp_res_lo, cmp_result, cmp_sel_cmp, cmp_sel_rng_chk, cmp_shift_sel, conversion_clk, conversion_input, conversion_num_limbs, conversion_output_bits, conversion_radix, conversion_sel_to_radix_be, keccakf1600_clk, keccakf1600_input, keccakf1600_output, keccakf1600_sel_keccakf1600, main_abs_da_rem_gas, main_abs_l2_rem_gas, main_alu_in_tag, main_base_da_gas_op_cost, main_base_l2_gas_op_cost, main_bin_op_id, main_call_ptr, main_da_gas_remaining, main_da_gas_u16_r0, main_da_gas_u16_r1, main_da_out_of_gas, main_dyn_da_gas_op_cost, main_dyn_gas_multiplier, main_dyn_l2_gas_op_cost, main_ia, main_ib, main_ic, main_id, main_id_zero, main_ind_addr_a, main_ind_addr_b, main_ind_addr_c, main_ind_addr_d, main_internal_return_ptr, main_inv, main_is_fake_row, main_is_gas_accounted, main_l2_gas_remaining, main_l2_gas_u16_r0, main_l2_gas_u16_r1, main_l2_out_of_gas, main_mem_addr_a, main_mem_addr_b, main_mem_addr_c, main_mem_addr_d, main_op_err, main_opcode_val, main_pc, main_r_in_tag, main_rwa, main_rwb, main_rwc, main_rwd, main_sel_alu, main_sel_bin, main_sel_calldata, main_sel_execution_end, main_sel_execution_row, main_sel_mem_op_a, main_sel_mem_op_b, main_sel_mem_op_c, main_sel_mem_op_d, main_sel_mov_ia_to_ic, main_sel_mov_ib_to_ic, main_sel_op_add, main_sel_op_address, main_sel_op_and, main_sel_op_block_number, main_sel_op_calldata_copy, main_sel_op_cast, main_sel_op_chain_id, main_sel_op_dagasleft, main_sel_op_debug_log, main_sel_op_div, main_sel_op_ecadd, main_sel_op_emit_l2_to_l1_msg, main_sel_op_emit_note_hash, main_sel_op_emit_nullifier, main_sel_op_emit_unencrypted_log, main_sel_op_eq, main_sel_op_external_call, main_sel_op_external_return, main_sel_op_external_revert, main_sel_op_fdiv, main_sel_op_fee_per_da_gas, main_sel_op_fee_per_l2_gas, main_sel_op_get_contract_instance, main_sel_op_internal_call, main_sel_op_internal_return, main_sel_op_is_static_call, main_sel_op_jump, main_sel_op_jumpi, main_sel_op_keccak, main_sel_op_l1_to_l2_msg_exists, main_sel_op_l2gasleft, main_sel_op_lt, main_sel_op_lte, main_sel_op_mov, main_sel_op_msm, main_sel_op_mul, main_sel_op_not, main_sel_op_note_hash_exists, main_sel_op_nullifier_exists, main_sel_op_or, main_sel_op_poseidon2, main_sel_op_radix_be, main_sel_op_returndata_copy, main_sel_op_returndata_size, main_sel_op_sender, main_sel_op_set, main_sel_op_sha256, main_sel_op_shl, main_sel_op_shr, main_sel_op_sload, main_sel_op_sstore, main_sel_op_static_call, main_sel_op_sub, main_sel_op_timestamp, main_sel_op_transaction_fee, main_sel_op_version, main_sel_op_xor, main_sel_q_kernel_lookup, main_sel_q_kernel_output_lookup, main_sel_resolve_ind_addr_a, main_sel_resolve_ind_addr_b, main_sel_resolve_ind_addr_c, main_sel_resolve_ind_addr_d, main_sel_returndata, main_sel_rng_16, main_sel_rng_8, main_sel_slice_gadget, main_space_id, main_tag_err, main_w_in_tag, mem_addr, mem_clk, mem_diff, mem_glob_addr, mem_last, mem_lastAccess, mem_one_min_inv, mem_r_in_tag, mem_rw, mem_sel_mem, mem_sel_mov_ia_to_ic, mem_sel_mov_ib_to_ic, mem_sel_op_a, mem_sel_op_b, mem_sel_op_c, mem_sel_op_d, mem_sel_op_poseidon_read_a, mem_sel_op_poseidon_read_b, mem_sel_op_poseidon_read_c, mem_sel_op_poseidon_read_d, mem_sel_op_poseidon_write_a, mem_sel_op_poseidon_write_b, mem_sel_op_poseidon_write_c, mem_sel_op_poseidon_write_d, mem_sel_op_slice, mem_sel_resolve_ind_addr_a, mem_sel_resolve_ind_addr_b, mem_sel_resolve_ind_addr_c, mem_sel_resolve_ind_addr_d, mem_sel_rng_chk, mem_skip_check_tag, mem_space_id, mem_tag, mem_tag_err, mem_tsp, mem_u16_r0, mem_u16_r1, mem_u8_r0, mem_val, mem_w_in_tag, merkle_tree_clk, merkle_tree_expected_tree_root, merkle_tree_latch, merkle_tree_leaf_index, merkle_tree_leaf_index_is_even, merkle_tree_leaf_value, merkle_tree_left_hash, merkle_tree_output_hash, merkle_tree_path_len, merkle_tree_path_len_inv, merkle_tree_right_hash, merkle_tree_sel_merkle_tree, merkle_tree_sibling_value, poseidon2_B_10_0, poseidon2_B_10_1, poseidon2_B_10_2, poseidon2_B_10_3, poseidon2_B_11_0, poseidon2_B_11_1, poseidon2_B_11_2, poseidon2_B_11_3, poseidon2_B_12_0, poseidon2_B_12_1, poseidon2_B_12_2, poseidon2_B_12_3, poseidon2_B_13_0, poseidon2_B_13_1, poseidon2_B_13_2, poseidon2_B_13_3, poseidon2_B_14_0, poseidon2_B_14_1, poseidon2_B_14_2, poseidon2_B_14_3, poseidon2_B_15_0, poseidon2_B_15_1, poseidon2_B_15_2, poseidon2_B_15_3, poseidon2_B_16_0, poseidon2_B_16_1, poseidon2_B_16_2, poseidon2_B_16_3, poseidon2_B_17_0, poseidon2_B_17_1, poseidon2_B_17_2, poseidon2_B_17_3, poseidon2_B_18_0, poseidon2_B_18_1, poseidon2_B_18_2, poseidon2_B_18_3, poseidon2_B_19_0, poseidon2_B_19_1, poseidon2_B_19_2, poseidon2_B_19_3, poseidon2_B_20_0, poseidon2_B_20_1, poseidon2_B_20_2, poseidon2_B_20_3, poseidon2_B_21_0, poseidon2_B_21_1, poseidon2_B_21_2, poseidon2_B_21_3, poseidon2_B_22_0, poseidon2_B_22_1, poseidon2_B_22_2, poseidon2_B_22_3, poseidon2_B_23_0, poseidon2_B_23_1, poseidon2_B_23_2, poseidon2_B_23_3, poseidon2_B_24_0, poseidon2_B_24_1, poseidon2_B_24_2, poseidon2_B_24_3, poseidon2_B_25_0, poseidon2_B_25_1, poseidon2_B_25_2, poseidon2_B_25_3, poseidon2_B_26_0, poseidon2_B_26_1, poseidon2_B_26_2, poseidon2_B_26_3, poseidon2_B_27_0, poseidon2_B_27_1, poseidon2_B_27_2, poseidon2_B_27_3, poseidon2_B_28_0, poseidon2_B_28_1, poseidon2_B_28_2, poseidon2_B_28_3, poseidon2_B_29_0, poseidon2_B_29_1, poseidon2_B_29_2, poseidon2_B_29_3, poseidon2_B_30_0, poseidon2_B_30_1, poseidon2_B_30_2, poseidon2_B_30_3, poseidon2_B_31_0, poseidon2_B_31_1, poseidon2_B_31_2, poseidon2_B_31_3, poseidon2_B_32_0, poseidon2_B_32_1, poseidon2_B_32_2, poseidon2_B_32_3, poseidon2_B_33_0, poseidon2_B_33_1, poseidon2_B_33_2, poseidon2_B_33_3, poseidon2_B_34_0, poseidon2_B_34_1, poseidon2_B_34_2, poseidon2_B_34_3, poseidon2_B_35_0, poseidon2_B_35_1, poseidon2_B_35_2, poseidon2_B_35_3, poseidon2_B_36_0, poseidon2_B_36_1, poseidon2_B_36_2, poseidon2_B_36_3, poseidon2_B_37_0, poseidon2_B_37_1, poseidon2_B_37_2, poseidon2_B_37_3, poseidon2_B_38_0, poseidon2_B_38_1, poseidon2_B_38_2, poseidon2_B_38_3, poseidon2_B_39_0, poseidon2_B_39_1, poseidon2_B_39_2, poseidon2_B_39_3, poseidon2_B_40_0, poseidon2_B_40_1, poseidon2_B_40_2, poseidon2_B_40_3, poseidon2_B_41_0, poseidon2_B_41_1, poseidon2_B_41_2, poseidon2_B_41_3, poseidon2_B_42_0, poseidon2_B_42_1, poseidon2_B_42_2, poseidon2_B_42_3, poseidon2_B_43_0, poseidon2_B_43_1, poseidon2_B_43_2, poseidon2_B_43_3, poseidon2_B_44_0, poseidon2_B_44_1, poseidon2_B_44_2, poseidon2_B_44_3, poseidon2_B_45_0, poseidon2_B_45_1, poseidon2_B_45_2, poseidon2_B_45_3, poseidon2_B_46_0, poseidon2_B_46_1, poseidon2_B_46_2, poseidon2_B_46_3, poseidon2_B_47_0, poseidon2_B_47_1, poseidon2_B_47_2, poseidon2_B_47_3, poseidon2_B_48_0, poseidon2_B_48_1, poseidon2_B_48_2, poseidon2_B_48_3, poseidon2_B_49_0, poseidon2_B_49_1, poseidon2_B_49_2, poseidon2_B_49_3, poseidon2_B_4_0, poseidon2_B_4_1, poseidon2_B_4_2, poseidon2_B_4_3, poseidon2_B_50_0, poseidon2_B_50_1, poseidon2_B_50_2, poseidon2_B_50_3, poseidon2_B_51_0, poseidon2_B_51_1, poseidon2_B_51_2, poseidon2_B_51_3, poseidon2_B_52_0, poseidon2_B_52_1, poseidon2_B_52_2, poseidon2_B_52_3, poseidon2_B_53_0, poseidon2_B_53_1, poseidon2_B_53_2, poseidon2_B_53_3, poseidon2_B_54_0, poseidon2_B_54_1, poseidon2_B_54_2, poseidon2_B_54_3, poseidon2_B_55_0, poseidon2_B_55_1, poseidon2_B_55_2, poseidon2_B_55_3, poseidon2_B_56_0, poseidon2_B_56_1, poseidon2_B_56_2, poseidon2_B_56_3, poseidon2_B_57_0, poseidon2_B_57_1, poseidon2_B_57_2, poseidon2_B_57_3, poseidon2_B_58_0, poseidon2_B_58_1, poseidon2_B_58_2, poseidon2_B_58_3, poseidon2_B_59_0, poseidon2_B_59_1, poseidon2_B_59_2, poseidon2_B_59_3, poseidon2_B_5_0, poseidon2_B_5_1, poseidon2_B_5_2, poseidon2_B_5_3, poseidon2_B_6_0, poseidon2_B_6_1, poseidon2_B_6_2, poseidon2_B_6_3, poseidon2_B_7_0, poseidon2_B_7_1, poseidon2_B_7_2, poseidon2_B_7_3, poseidon2_B_8_0, poseidon2_B_8_1, poseidon2_B_8_2, poseidon2_B_8_3, poseidon2_B_9_0, poseidon2_B_9_1, poseidon2_B_9_2, poseidon2_B_9_3, poseidon2_EXT_LAYER_4, poseidon2_EXT_LAYER_5, poseidon2_EXT_LAYER_6, poseidon2_EXT_LAYER_7, poseidon2_T_0_4, poseidon2_T_0_5, poseidon2_T_0_6, poseidon2_T_0_7, poseidon2_T_1_4, poseidon2_T_1_5, poseidon2_T_1_6, poseidon2_T_1_7, poseidon2_T_2_4, poseidon2_T_2_5, poseidon2_T_2_6, poseidon2_T_2_7, poseidon2_T_3_4, poseidon2_T_3_5, poseidon2_T_3_6, poseidon2_T_3_7, poseidon2_T_60_4, poseidon2_T_60_5, poseidon2_T_60_6, poseidon2_T_60_7, poseidon2_T_61_4, poseidon2_T_61_5, poseidon2_T_61_6, poseidon2_T_61_7, poseidon2_T_62_4, poseidon2_T_62_5, poseidon2_T_62_6, poseidon2_T_62_7, poseidon2_T_63_4, poseidon2_T_63_5, poseidon2_T_63_6, poseidon2_T_63_7, poseidon2_a_0, poseidon2_a_1, poseidon2_a_2, poseidon2_a_3, poseidon2_b_0, poseidon2_b_1, poseidon2_b_2, poseidon2_b_3, poseidon2_clk, poseidon2_full_a_0, poseidon2_full_a_1, poseidon2_full_a_2, poseidon2_full_a_3, poseidon2_full_b_0, poseidon2_full_b_1, poseidon2_full_b_2, poseidon2_full_b_3, poseidon2_full_clk, poseidon2_full_end_poseidon, poseidon2_full_execute_poseidon_perm, poseidon2_full_input_0, poseidon2_full_input_1, poseidon2_full_input_2, poseidon2_full_input_len, poseidon2_full_num_perm_rounds_rem, poseidon2_full_num_perm_rounds_rem_inv, poseidon2_full_output, poseidon2_full_padding, poseidon2_full_sel_merkle_tree, poseidon2_full_sel_poseidon, poseidon2_full_start_poseidon, poseidon2_input_addr, poseidon2_mem_addr_read_a, poseidon2_mem_addr_read_b, poseidon2_mem_addr_read_c, poseidon2_mem_addr_read_d, poseidon2_mem_addr_write_a, poseidon2_mem_addr_write_b, poseidon2_mem_addr_write_c, poseidon2_mem_addr_write_d, poseidon2_output_addr, poseidon2_sel_poseidon_perm, poseidon2_sel_poseidon_perm_immediate, poseidon2_sel_poseidon_perm_mem_op, poseidon2_space_id, range_check_alu_rng_chk, range_check_clk, range_check_cmp_hi_bits_rng_chk, range_check_cmp_lo_bits_rng_chk, range_check_cmp_non_ff_rng_chk, range_check_dyn_diff, range_check_dyn_rng_chk_bits, range_check_dyn_rng_chk_pow_2, range_check_gas_da_rng_chk, range_check_gas_l2_rng_chk, range_check_is_lte_u112, range_check_is_lte_u128, range_check_is_lte_u16, range_check_is_lte_u32, range_check_is_lte_u48, range_check_is_lte_u64, range_check_is_lte_u80, range_check_is_lte_u96, range_check_rng_chk_bits, range_check_sel_lookup_0, range_check_sel_lookup_1, range_check_sel_lookup_2, range_check_sel_lookup_3, range_check_sel_lookup_4, range_check_sel_lookup_5, range_check_sel_lookup_6, range_check_sel_rng_chk, range_check_u16_r0, range_check_u16_r1, range_check_u16_r2, range_check_u16_r3, range_check_u16_r4, range_check_u16_r5, range_check_u16_r6, range_check_u16_r7, range_check_value, sha256_clk, sha256_input, sha256_output, sha256_sel_sha256_compression, sha256_state, slice_addr, slice_clk, slice_cnt, slice_col_offset, slice_one_min_inv, slice_sel_cd_cpy, slice_sel_mem_active, slice_sel_return, slice_sel_start, slice_space_id, slice_val, lookup_rng_chk_pow_2_counts, lookup_rng_chk_diff_counts, lookup_rng_chk_0_counts, lookup_rng_chk_1_counts, lookup_rng_chk_2_counts, lookup_rng_chk_3_counts, lookup_rng_chk_4_counts, lookup_rng_chk_5_counts, lookup_rng_chk_6_counts, lookup_rng_chk_7_counts, lookup_mem_rng_chk_0_counts, lookup_mem_rng_chk_1_counts, lookup_mem_rng_chk_2_counts, lookup_pow_2_0_counts, lookup_pow_2_1_counts, lookup_byte_lengths_counts, lookup_byte_operations_counts, lookup_opcode_gas_counts, lookup_l2_gas_rng_chk_0_counts, lookup_l2_gas_rng_chk_1_counts, lookup_da_gas_rng_chk_0_counts, lookup_da_gas_rng_chk_1_counts, lookup_cd_value_counts, lookup_ret_value_counts, incl_main_tag_err_counts, incl_mem_tag_err_counts
#define AVM_DERIVED_WITNESS_ENTITIES perm_rng_non_ff_cmp_inv, perm_rng_cmp_lo_inv, perm_rng_cmp_hi_inv, perm_rng_alu_inv, perm_cmp_alu_inv, perm_pos_mem_read_a_inv, perm_pos_mem_read_b_inv, perm_pos_mem_read_c_inv, perm_pos_mem_read_d_inv, perm_pos_mem_write_a_inv, perm_pos_mem_write_b_inv, perm_pos_mem_write_c_inv, perm_pos_mem_write_d_inv, perm_pos2_fixed_pos2_perm_inv, perm_slice_mem_inv, perm_merkle_poseidon2_inv, perm_main_alu_inv, perm_main_bin_inv, perm_main_conv_inv, perm_main_sha256_inv, perm_main_pos2_perm_inv, perm_main_mem_a_inv, perm_main_mem_b_inv, perm_main_mem_c_inv, perm_main_mem_d_inv, perm_main_mem_ind_addr_a_inv, perm_main_mem_ind_addr_b_inv, perm_main_mem_ind_addr_c_inv, perm_main_mem_ind_addr_d_inv, lookup_rng_chk_pow_2_inv, lookup_rng_chk_diff_inv, lookup_rng_chk_0_inv, lookup_rng_chk_1_inv, lookup_rng_chk_2_inv, lookup_rng_chk_3_inv, lookup_rng_chk_4_inv, lookup_rng_chk_5_inv, lookup_rng_chk_6_inv, lookup_rng_chk_7_inv, lookup_mem_rng_chk_0_inv, lookup_mem_rng_chk_1_inv, lookup_mem_rng_chk_2_inv, lookup_pow_2_0_inv, lookup_pow_2_1_inv, lookup_byte_lengths_inv, lookup_byte_operations_inv, lookup_opcode_gas_inv, lookup_l2_gas_rng_chk_0_inv, lookup_l2_gas_rng_chk_1_inv, lookup_da_gas_rng_chk_0_inv, lookup_da_gas_rng_chk_1_inv, lookup_cd_value_inv, lookup_ret_value_inv, incl_main_tag_err_inv, incl_mem_tag_err_inv
#define AVM_SHIFTED_ENTITIES binary_acc_ia_shift, binary_acc_ib_shift, binary_acc_ic_shift, binary_mem_tag_ctr_shift, binary_op_id_shift, cmp_a_hi_shift, cmp_a_lo_shift, cmp_b_hi_shift, cmp_b_lo_shift, cmp_cmp_rng_ctr_shift, cmp_op_gt_shift, cmp_p_sub_a_hi_shift, cmp_p_sub_a_lo_shift, cmp_p_sub_b_hi_shift, cmp_p_sub_b_lo_shift, cmp_sel_rng_chk_shift, main_da_gas_remaining_shift, main_l2_gas_remaining_shift, main_pc_shift, main_sel_execution_end_shift, main_sel_execution_row_shift, mem_glob_addr_shift, mem_rw_shift, mem_sel_mem_shift, mem_tag_shift, mem_tsp_shift, mem_val_shift, merkle_tree_leaf_index_shift, merkle_tree_leaf_value_shift, merkle_tree_path_len_shift, poseidon2_full_a_0_shift, poseidon2_full_a_1_shift, poseidon2_full_a_2_shift, poseidon2_full_a_3_shift, poseidon2_full_execute_poseidon_perm_shift, poseidon2_full_input_0_shift, poseidon2_full_input_1_shift, poseidon2_full_input_2_shift, poseidon2_full_num_perm_rounds_rem_shift, poseidon2_full_sel_poseidon_shift, poseidon2_full_start_poseidon_shift, slice_addr_shift, slice_clk_shift, slice_cnt_shift, slice_col_offset_shift, slice_sel_cd_cpy_shift, slice_sel_mem_active_shift, slice_sel_return_shift, slice_sel_start_shift, slice_space_id_shift
#define AVM_TO_BE_SHIFTED(e) e.binary_acc_ia, e.binary_acc_ib, e.binary_acc_ic, e.binary_mem_tag_ctr, e.binary_op_id, e.cmp_a_hi, e.cmp_a_lo, e.cmp_b_hi, e.cmp_b_lo, e.cmp_cmp_rng_ctr, e.cmp_op_gt, e.cmp_p_sub_a_hi, e.cmp_p_sub_a_lo, e.cmp_p_sub_b_hi, e.cmp_p_sub_b_lo, e.cmp_sel_rng_chk, e.main_da_gas_remaining, e.main_l2_gas_remaining, e.main_pc, e.main_sel_execution_end, e.main_sel_execution_row, e.mem_glob_addr, e.mem_rw, e.mem_sel_mem, e.mem_tag, e.mem_tsp, e.mem_val, e.merkle_tree_leaf_index, e.merkle_tree_leaf_value, e.merkle_tree_path_len, e.poseidon2_full_a_0, e.poseidon2_full_a_1, e.poseidon2_full_a_2, e.poseidon2_full_a_3, e.poseidon2_full_execute_poseidon_perm, e.poseidon2_full_input_0, e.poseidon2_full_input_1, e.poseidon2_full_input_2, e.poseidon2_full_num_perm_rounds_rem, e.poseidon2_full_sel_poseidon, e.poseidon2_full_start_poseidon, e.slice_addr, e.slice_clk, e.slice_cnt, e.slice_col_offset, e.slice_sel_cd_cpy, e.slice_sel_mem_active, e.slice_sel_return, e.slice_sel_start, e.slice_space_id
#define AVM_ALL_ENTITIES AVM_PRECOMPUTED_ENTITIES, AVM_WIRE_ENTITIES, AVM_DERIVED_WITNESS_ENTITIES, AVM_SHIFTED_ENTITIES
#define AVM_UNSHIFTED_ENTITIES AVM_PRECOMPUTED_ENTITIES, AVM_WIRE_ENTITIES, AVM_DERIVED_WITNESS_ENTITIES

#define AVM_TO_BE_SHIFTED_COLUMNS Column::binary_acc_ia, Column::binary_acc_ib, Column::binary_acc_ic, Column::binary_mem_tag_ctr, Column::binary_op_id, Column::cmp_a_hi, Column::cmp_a_lo, Column::cmp_b_hi, Column::cmp_b_lo, Column::cmp_cmp_rng_ctr, Column::cmp_op_gt, Column::cmp_p_sub_a_hi, Column::cmp_p_sub_a_lo, Column::cmp_p_sub_b_hi, Column::cmp_p_sub_b_lo, Column::cmp_sel_rng_chk, Column::main_da_gas_remaining, Column::main_l2_gas_remaining, Column::main_pc, Column::main_sel_execution_end, Column::main_sel_execution_row, Column::mem_glob_addr, Column::mem_rw, Column::mem_sel_mem, Column::mem_tag, Column::mem_tsp, Column::mem_val, Column::merkle_tree_leaf_index, Column::merkle_tree_leaf_value, Column::merkle_tree_path_len, Column::poseidon2_full_a_0, Column::poseidon2_full_a_1, Column::poseidon2_full_a_2, Column::poseidon2_full_a_3, Column::poseidon2_full_execute_poseidon_perm, Column::poseidon2_full_input_0, Column::poseidon2_full_input_1, Column::poseidon2_full_input_2, Column::poseidon2_full_num_perm_rounds_rem, Column::poseidon2_full_sel_poseidon, Column::poseidon2_full_start_poseidon, Column::slice_addr, Column::slice_clk, Column::slice_cnt, Column::slice_col_offset, Column::slice_sel_cd_cpy, Column::slice_sel_mem_active, Column::slice_sel_return, Column::slice_sel_start, Column::slice_space_id
#define AVM_SHIFTED_COLUMNS ColumnAndShifts::binary_acc_ia_shift, ColumnAndShifts::binary_acc_ib_shift, ColumnAndShifts::binary_acc_ic_shift, ColumnAndShifts::binary_mem_tag_ctr_shift, ColumnAndShifts::binary_op_id_shift, ColumnAndShifts::cmp_a_hi_shift, ColumnAndShifts::cmp_a_lo_shift, ColumnAndShifts::cmp_b_hi_shift, ColumnAndShifts::cmp_b_lo_shift, ColumnAndShifts::cmp_cmp_rng_ctr_shift, ColumnAndShifts::cmp_op_gt_shift, ColumnAndShifts::cmp_p_sub_a_hi_shift, ColumnAndShifts::cmp_p_sub_a_lo_shift, ColumnAndShifts::cmp_p_sub_b_hi_shift, ColumnAndShifts::cmp_p_sub_b_lo_shift, ColumnAndShifts::cmp_sel_rng_chk_shift, ColumnAndShifts::main_da_gas_remaining_shift, ColumnAndShifts::main_l2_gas_remaining_shift, ColumnAndShifts::main_pc_shift, ColumnAndShifts::main_sel_execution_end_shift, ColumnAndShifts::main_sel_execution_row_shift, ColumnAndShifts::mem_glob_addr_shift, ColumnAndShifts::mem_rw_shift, ColumnAndShifts::mem_sel_mem_shift, ColumnAndShifts::mem_tag_shift, ColumnAndShifts::mem_tsp_shift, ColumnAndShifts::mem_val_shift, ColumnAndShifts::merkle_tree_leaf_index_shift, ColumnAndShifts::merkle_tree_leaf_value_shift, ColumnAndShifts::merkle_tree_path_len_shift, ColumnAndShifts::poseidon2_full_a_0_shift, ColumnAndShifts::poseidon2_full_a_1_shift, ColumnAndShifts::poseidon2_full_a_2_shift, ColumnAndShifts::poseidon2_full_a_3_shift, ColumnAndShifts::poseidon2_full_execute_poseidon_perm_shift, ColumnAndShifts::poseidon2_full_input_0_shift, ColumnAndShifts::poseidon2_full_input_1_shift, ColumnAndShifts::poseidon2_full_input_2_shift, ColumnAndShifts::poseidon2_full_num_perm_rounds_rem_shift, ColumnAndShifts::poseidon2_full_sel_poseidon_shift, ColumnAndShifts::poseidon2_full_start_poseidon_shift, ColumnAndShifts::slice_addr_shift, ColumnAndShifts::slice_clk_shift, ColumnAndShifts::slice_cnt_shift, ColumnAndShifts::slice_col_offset_shift, ColumnAndShifts::slice_sel_cd_cpy_shift, ColumnAndShifts::slice_sel_mem_active_shift, ColumnAndShifts::slice_sel_return_shift, ColumnAndShifts::slice_sel_start_shift, ColumnAndShifts::slice_space_id_shift
// clang-format on

// All columns minus shifts.
enum class Column { AVM_UNSHIFTED_ENTITIES };

// C++ doesn't allow enum extension, so we'll have to cast.
enum class ColumnAndShifts {
    AVM_ALL_ENTITIES,
    // Sentinel.
    NUM_COLUMNS,
};

constexpr auto TO_BE_SHIFTED_COLUMNS_ARRAY = []() { return std::array{ AVM_TO_BE_SHIFTED_COLUMNS }; }();
constexpr auto SHIFTED_COLUMNS_ARRAY = []() { return std::array{ AVM_SHIFTED_COLUMNS }; }();
static_assert(TO_BE_SHIFTED_COLUMNS_ARRAY.size() == SHIFTED_COLUMNS_ARRAY.size());

} // namespace bb::avm