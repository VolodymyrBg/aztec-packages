// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.27;

import {ApellaBase} from "./base.t.sol";
import {IApella} from "@aztec/governance/interfaces/IApella.sol";
import {IERC20Errors} from "@oz/interfaces/draft-IERC6093.sol";
import {Timestamp} from "@aztec/core/libraries/TimeMath.sol";
import {Errors} from "@aztec/governance/libraries/Errors.sol";
import {DataStructures} from "@aztec/governance/libraries/DataStructures.sol";
import {ConfigurationLib} from "@aztec/governance/libraries/ConfigurationLib.sol";

contract FinaliseWithdrawTest is ApellaBase {
  using ConfigurationLib for DataStructures.Configuration;

  uint256 internal constant WITHDRAWAL_COUNT = 8;
  mapping(address => uint256) internal sums;

  uint256 internal deposit;

  function test_WhenIdMatchNoPendingWithdrawal(uint256 _id) external {
    // it revert
    vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidReceiver.selector, address(0)));
    apella.finaliseWithdraw(_id);
  }

  // Lot of this is similar to initiateWithdraw.t.sol::test_WhenCallerHaveSufficientDeposits
  modifier whenItMatchPendingWithdrawal(
    uint256 _depositAmount,
    address[WITHDRAWAL_COUNT] memory _recipient,
    uint256[WITHDRAWAL_COUNT] memory _withdrawals,
    uint256[WITHDRAWAL_COUNT] memory _timejumps
  ) {
    deposit = _depositAmount;
    uint256 sum = deposit;

    token.mint(address(this), deposit);
    token.approve(address(apella), deposit);
    apella.deposit(address(this), deposit);

    for (uint256 i = 0; i < WITHDRAWAL_COUNT; i++) {
      address recipient = i % 2 == 0 ? _recipient[i] : address(0xdeadbeef);
      vm.assume(recipient != address(apella) && recipient != address(0));
      uint256 amount = bound(_withdrawals[i], 0, sum);
      // Note tiny time jumps so we do not need to jump back and forth in time.
      uint256 timeJump = bound(_timejumps[i], 1, type(uint8).max);

      if (amount == 0) {
        continue;
      }

      sum -= amount;
      vm.warp(block.timestamp + timeJump);

      apella.initiateWithdraw(recipient, amount);
    }

    _;
  }

  function test_GivenWithdrawanAlreadyClaimed(
    uint256 _depositAmount,
    address[WITHDRAWAL_COUNT] memory _recipient,
    uint256[WITHDRAWAL_COUNT] memory _withdrawals,
    uint256[WITHDRAWAL_COUNT] memory _timejumps
  ) external whenItMatchPendingWithdrawal(_depositAmount, _recipient, _withdrawals, _timejumps) {
    // it revert

    uint256 withdrawalCount = apella.withdrawalCount();
    for (uint256 i = 0; i < withdrawalCount; i++) {
      DataStructures.Withdrawal memory withdrawal = apella.getWithdrawal(i);
      vm.warp(Timestamp.unwrap(withdrawal.unlocksAt));
      apella.finaliseWithdraw(i);
    }

    for (uint256 i = 0; i < withdrawalCount; i++) {
      vm.expectRevert(abi.encodeWithSelector(Errors.Apella__WithdrawalAlreadyclaimed.selector));
      apella.finaliseWithdraw(i);
    }
  }

  modifier givenWithdrawanNotClaimed() {
    _;
  }

  function test_WhenTimeIsBeforeUnlock(
    uint256 _depositAmount,
    address[WITHDRAWAL_COUNT] memory _recipient,
    uint256[WITHDRAWAL_COUNT] memory _withdrawals,
    uint256[WITHDRAWAL_COUNT] memory _timejumps,
    uint256[WITHDRAWAL_COUNT] memory _timejumps2
  )
    external
    whenItMatchPendingWithdrawal(_depositAmount, _recipient, _withdrawals, _timejumps)
    givenWithdrawanNotClaimed
  {
    // it revert

    uint256 withdrawalCount = apella.withdrawalCount();
    for (uint256 i = 0; i < withdrawalCount; i++) {
      DataStructures.Withdrawal memory withdrawal = apella.getWithdrawal(i);
      assertGt(withdrawal.unlocksAt, block.timestamp);

      uint256 time =
        bound(_timejumps2[i], block.timestamp, Timestamp.unwrap(withdrawal.unlocksAt) - 1);

      vm.warp(time);

      vm.expectRevert(
        abi.encodeWithSelector(
          Errors.Apella__WithdrawalNotUnlockedYet.selector,
          Timestamp.wrap(block.timestamp),
          withdrawal.unlocksAt
        )
      );
      apella.finaliseWithdraw(i);
    }
  }

  function test_WhenTimeIsAfterOrAtUnlock(
    uint256 _depositAmount,
    address[WITHDRAWAL_COUNT] memory _recipient,
    uint256[WITHDRAWAL_COUNT] memory _withdrawals,
    uint256[WITHDRAWAL_COUNT] memory _timejumps,
    uint256[WITHDRAWAL_COUNT] memory _timejumps2
  )
    external
    whenItMatchPendingWithdrawal(_depositAmount, _recipient, _withdrawals, _timejumps)
    givenWithdrawanNotClaimed
  {
    // it mark withdrawal as claimed
    // it transfer funds to account
    // it emits {WithdrawalFinalised} event

    uint256 sum = token.balanceOf(address(apella));

    uint256 withdrawalCount = apella.withdrawalCount();
    for (uint256 i = 0; i < withdrawalCount; i++) {
      DataStructures.Withdrawal memory withdrawal = apella.getWithdrawal(i);

      uint256 upper = i + 1 == withdrawalCount
        ? type(uint256).max
        : Timestamp.unwrap(apella.getWithdrawal(i + 1).unlocksAt);
      uint256 time = bound(_timejumps2[i], Timestamp.unwrap(withdrawal.unlocksAt), upper);

      vm.warp(time);

      vm.expectEmit(true, true, true, true, address(apella));
      emit IApella.WithdrawFinalised(i);
      apella.finaliseWithdraw(i);

      DataStructures.Withdrawal memory withdrawal2 = apella.getWithdrawal(i);
      assertTrue(withdrawal2.claimed);

      sum -= withdrawal.amount;
      sums[withdrawal.recipient] += withdrawal.amount;

      assertEq(token.balanceOf(address(apella)), sum, "total balance");
      assertEq(
        token.balanceOf(withdrawal.recipient), sums[withdrawal.recipient], "recipient balance"
      );
    }
  }
}
