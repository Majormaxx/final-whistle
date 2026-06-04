// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

enum MarketStatus { OPEN, CLOSED, RESOLVED, CANCELLED }
enum Outcome { NONE, HOME, DRAW, AWAY, YES, NO }

interface IMarket {
    function resolve(Outcome outcome) external;
    function status() external view returns (MarketStatus);
    function marketId() external view returns (bytes32);
}
