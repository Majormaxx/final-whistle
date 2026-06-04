// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ResolverAgent.sol";
import "../src/MarketFactory.sol";

// Deploy order: ResolverAgent → MarketFactory
//
// Required env vars:
//   PRIVATE_KEY             — deployer private key
//   JSON_API_AGENT_ID       — agent ID from agents.somnia.network (JSON API Request)
//
// Optional (default to deployer address):
//   MULTISIG_0, MULTISIG_1, MULTISIG_2
//
// Run:
//   forge script script/Deploy.s.sol --rpc-url somnia_testnet --broadcast
contract Deploy is Script {
    function run() external {
        uint256 deployerKey  = vm.envUint("PRIVATE_KEY");
        address deployer     = vm.addr(deployerKey);
        uint256 agentId      = vm.envUint("JSON_API_AGENT_ID");
        address msig0        = vm.envOr("MULTISIG_0", deployer);
        address msig1        = vm.envOr("MULTISIG_1", deployer);
        address msig2        = vm.envOr("MULTISIG_2", deployer);

        vm.startBroadcast(deployerKey);

        address platform = vm.envOr("AGENT_PLATFORM", address(0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776));

        ResolverAgent resolver = new ResolverAgent(
            platform,
            agentId,
            [msig0, msig1, msig2]
        );
        console.log("ResolverAgent:", address(resolver));

        MarketFactory factory = new MarketFactory(address(resolver));
        console.log("MarketFactory:", address(factory));

        vm.stopBroadcast();
    }
}
