// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MarketFactory.sol";
import "../src/MatchMarket.sol";
import "../src/IMarket.sol";

contract MatchMarketTest is Test {
    MarketFactory factory;
    MatchMarket   market;
    address       resolver = address(0x1111);
    address       alice    = address(0xA1CE);
    address       bob      = address(0xB0B0);

    uint256 constant KICKOFF = 2_000_000_000; // far future

    function setUp() public {
        factory = new MarketFactory(resolver);
        vm.warp(KICKOFF - 1 days);
        (address m,) = factory.createMatchMarket("Arsenal", "Chelsea", KICKOFF);
        market = MatchMarket(payable(m));
        vm.deal(alice, 10 ether);
        vm.deal(bob,   10 ether);
    }

    // ── betting ───────────────────────────────────────────────────────────

    function test_betHome() public {
        vm.prank(alice);
        market.bet{value: 1 ether}(0); // HOME
        assertEq(market.quantities(0), 1 ether);
        assertGt(market.pool(), 0);
    }

    function test_betAllOutcomes() public {
        vm.prank(alice);
        market.bet{value: 1 ether}(0);
        vm.prank(bob);
        market.bet{value: 1 ether}(1); // DRAW
        vm.prank(alice);
        market.bet{value: 1 ether}(2); // AWAY
        assertEq(market.quantities(0), 1 ether);
        assertEq(market.quantities(1), 1 ether);
        assertEq(market.quantities(2), 1 ether);
    }

    function test_revertBetInvalidOutcome() public {
        vm.prank(alice);
        vm.expectRevert("invalid outcome");
        market.bet{value: 1 ether}(3);
    }

    function test_revertBetZeroValue() public {
        vm.prank(alice);
        vm.expectRevert("zero value");
        market.bet{value: 0}(0);
    }

    // ── resolution ────────────────────────────────────────────────────────

    function test_resolveByResolver() public {
        // close then resolve
        vm.prank(resolver);
        market.close();
        vm.prank(resolver);
        market.resolve(Outcome.HOME);
        assertEq(uint(market.status()), uint(MarketStatus.RESOLVED));
        assertEq(uint(market.result()), uint(Outcome.HOME));
    }

    function test_revertResolveByNonResolver() public {
        vm.prank(resolver);
        market.close();
        vm.prank(alice);
        vm.expectRevert("only resolver");
        market.resolve(Outcome.HOME);
    }

    function test_revertResolveBeforeClose() public {
        vm.prank(resolver);
        vm.expectRevert("not resolvable");
        market.resolve(Outcome.HOME);
    }

    // ── payout ────────────────────────────────────────────────────────────

    function test_payoutWinner() public {
        vm.prank(alice);
        market.bet{value: 1 ether}(0); // HOME — sole bettor
        vm.prank(resolver);
        market.close();
        vm.prank(resolver);
        market.resolve(Outcome.HOME);

        uint256 balBefore = alice.balance;
        address[] memory bettors = new address[](1);
        bettors[0] = alice;
        market.payoutBatch(bettors);
        assertGt(alice.balance, balBefore);
    }

    function test_payoutLoserGetsNothing() public {
        vm.prank(alice);
        market.bet{value: 1 ether}(0); // HOME
        vm.prank(bob);
        market.bet{value: 1 ether}(1); // DRAW

        vm.prank(resolver);
        market.close();
        vm.prank(resolver);
        market.resolve(Outcome.HOME); // alice wins

        uint256 bobBefore = bob.balance;
        address[] memory bettors = new address[](1);
        bettors[0] = bob;
        market.payoutBatch(bettors);
        assertEq(bob.balance, bobBefore); // no change
    }

    function test_claimWinner() public {
        vm.prank(alice);
        market.bet{value: 1 ether}(2); // AWAY
        vm.prank(resolver);
        market.close();
        vm.prank(resolver);
        market.resolve(Outcome.AWAY);

        uint256 balBefore = alice.balance;
        vm.prank(alice);
        market.claim();
        assertGt(alice.balance, balBefore);
    }

    // ── price ─────────────────────────────────────────────────────────────

    function test_initialPricesEqual() public view {
        // with zero quantities all outcomes are equally priced
        uint256 p0 = market.getPrice(0);
        uint256 p1 = market.getPrice(1);
        uint256 p2 = market.getPrice(2);
        assertApproxEqRel(p0, p1, 1e15); // within 0.1%
        assertApproxEqRel(p1, p2, 1e15);
    }

    function test_priceShiftsAfterBet() public {
        uint256 p0Before = market.getPrice(0);
        vm.prank(alice);
        market.bet{value: 5 ether}(0);
        uint256 p0After = market.getPrice(0);
        assertGt(p0After, p0Before);
    }
}
