// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MarketFactory.sol";
import "../src/NextGoalMarket.sol";
import "../src/IMarket.sol";

contract NextGoalMarketTest is Test {
    MarketFactory factory;
    NextGoalMarket market;
    address        resolver = address(0x1111);
    address        alice    = address(0xA1CE);

    uint256 constant KICKOFF  = 2_000_000_000;
    uint256 constant WIN_START = KICKOFF + 5 minutes;
    uint256 constant WIN_END   = KICKOFF + 10 minutes;

    function setUp() public {
        factory = new MarketFactory(resolver);
        vm.warp(KICKOFF - 1 days);
        (, bytes32 matchId) =
            factory.createMatchMarket("Real Madrid", "Atletico", KICKOFF);

        vm.warp(KICKOFF + 1 minutes); // match is live
        vm.prank(resolver);
        (address m,) = factory.spawnNextGoalMarket(matchId, WIN_START, WIN_END, 0);
        market = NextGoalMarket(payable(m));
        vm.deal(alice, 10 ether);
    }

    function test_betYes() public {
        vm.warp(WIN_START + 1);
        vm.prank(alice);
        market.bet{value: 1 ether}(0); // YES
        assertEq(market.quantities(0), 1 ether);
    }

    function test_revertBetAfterWindowEnd() public {
        vm.warp(WIN_END + 1);
        vm.prank(alice);
        vm.expectRevert("window closed");
        market.bet{value: 1 ether}(0);
    }

    function test_resolveYes() public {
        vm.warp(WIN_START + 1);
        vm.prank(alice);
        market.bet{value: 1 ether}(0);

        vm.warp(WIN_END + 1);
        vm.prank(resolver);
        market.close();
        vm.prank(resolver);
        market.resolve(Outcome.YES);
        assertEq(uint(market.result()), uint(Outcome.YES));
    }

    function test_resolveNo() public {
        vm.warp(WIN_END + 1);
        vm.prank(resolver);
        market.close();
        vm.prank(resolver);
        market.resolve(Outcome.NO);
        assertEq(uint(market.result()), uint(Outcome.NO));
    }

    function test_payoutYesWinner() public {
        vm.warp(WIN_START + 1);
        vm.prank(alice);
        market.bet{value: 1 ether}(0);
        vm.warp(WIN_END + 1);
        vm.prank(resolver);
        market.close();
        vm.prank(resolver);
        market.resolve(Outcome.YES);

        uint256 balBefore = alice.balance;
        address[] memory bettors = new address[](1);
        bettors[0] = alice;
        market.payoutBatch(bettors);
        assertGt(alice.balance, balBefore);
    }

    function test_autoCloseAtWindowEnd() public {
        vm.warp(WIN_END + 1);
        // anyone can trigger close once window expires
        vm.prank(alice);
        market.close();
        assertEq(uint(market.status()), uint(MarketStatus.CLOSED));
    }
}
