// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ResolverAgent.sol";
import "../src/MarketFactory.sol";

// Deploy order: ResolverAgent → MarketFactory
// Run:
//   forge script script/Deploy.s.sol --rpc-url somnia_testnet --broadcast
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        address agentPlatform = vm.envAddress("SOMNIA_AGENT_PLATFORM");
        address msig0 = vm.envOr("MULTISIG_0", deployer);
        address msig1 = vm.envOr("MULTISIG_1", deployer);
        address msig2 = vm.envOr("MULTISIG_2", deployer);

        vm.startBroadcast(deployerKey);

        ResolverAgent resolver = new ResolverAgent(
            agentPlatform,
            [msig0, msig1, msig2]
        );
        console.log("ResolverAgent:", address(resolver));

        MarketFactory factory = new MarketFactory(address(resolver));
        console.log("MarketFactory:", address(factory));

        vm.stopBroadcast();
    }
}
