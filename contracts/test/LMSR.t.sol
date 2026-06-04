// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/LMSR.sol";

// Exposes LMSR internal functions for testing.
contract LMSRHarness {
    function cost(
        uint256[3] memory q,
        uint8 outcome,
        uint256 amount,
        uint256 b
    ) external pure returns (uint256) {
        return LMSR.cost(q, outcome, amount, b);
    }

    function price(
        uint256[3] memory q,
        uint8 outcome,
        uint256 b
    ) external pure returns (uint256) {
        return LMSR.price(q, outcome, b);
    }
}

contract LMSRTest is Test {
    LMSRHarness lmsr;
    uint256 constant B = 100e18;
    uint256 constant SCALE = 1e18;

    function setUp() public {
        lmsr = new LMSRHarness();
    }

    function test_equalPricesAtZeroQuantities() public view {
        uint256[3] memory q;
        uint256 p0 = lmsr.price(q, 0, B);
        uint256 p1 = lmsr.price(q, 1, B);
        uint256 p2 = lmsr.price(q, 2, B);
        // each ~0.333e18
        assertApproxEqRel(p0, p1, 1e15);
        assertApproxEqRel(p1, p2, 1e15);
        // sum ~1.0
        assertApproxEqRel(p0 + p1 + p2, SCALE, 1e15);
    }

    function test_costPositive() public view {
        uint256[3] memory q;
        uint256 c = lmsr.cost(q, 0, 1 ether, B);
        assertGt(c, 0);
    }

    function test_costIncreasesWithAmount() public view {
        uint256[3] memory q;
        uint256 c1 = lmsr.cost(q, 0, 1 ether,  B);
        uint256 c2 = lmsr.cost(q, 0, 10 ether, B);
        assertGt(c2, c1);
    }

    function test_priceShiftsTowardBetOutcome() public view {
        uint256[3] memory q;
        q[0] = 10 ether; // heavy bets on HOME
        uint256 p0 = lmsr.price(q, 0, B);
        uint256 p1 = lmsr.price(q, 1, B);
        assertGt(p0, p1);
    }

    function test_costLessThanOrEqualAmount() public view {
        // the cost of buying shares should not exceed the payment
        uint256[3] memory q;
        uint256 amount = 1 ether;
        uint256 c = lmsr.cost(q, 0, amount, B);
        assertLe(c, amount);
    }

    // fuzz: cost must always be > 0 and <= amount
    function testFuzz_costBounds(uint256 amount, uint8 outcome) public view {
        amount  = bound(amount,  0.001 ether, 100 ether);
        outcome = uint8(bound(outcome, 0, 2));
        uint256[3] memory q;
        uint256 c = lmsr.cost(q, outcome, amount, B);
        assertGt(c, 0);
        assertLe(c, amount);
    }

    // fuzz: prices must sum to ~1
    function testFuzz_priceSumApproxOne(uint256 q0, uint256 q1, uint256 q2) public view {
        q0 = bound(q0, 0, 50 ether);
        q1 = bound(q1, 0, 50 ether);
        q2 = bound(q2, 0, 50 ether);
        uint256[3] memory q = [q0, q1, q2];
        uint256 sum = lmsr.price(q, 0, B) + lmsr.price(q, 1, B) + lmsr.price(q, 2, B);
        assertApproxEqRel(sum, SCALE, 1e14); // within 0.01%
    }
}
