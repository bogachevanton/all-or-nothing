// deno-lint-ignore-file
import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.0.6/index.ts";

const betContract = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wager";
const errorCodes = {
                    ERR_BETTING_NOT_ACTIVE : 101,
                    ERR_BETTING_ACTIVE : 102,
                    ERR_REACHED_BLOCK_PICK_LIMIT : 103,
                    ERR_NO_MONEY : 104,
                    ERR_ZERO_OR_MAX : 105,
}

Clarinet.test({
    name: "Make first bet",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;

        // Mine a block that contains a contract call to "bet-in-ustx"
        let block = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    deployer.address),
        ]);

        // Get the first receipt from the block and check that it is successful
        block.receipts[0].events.expectSTXTransferEvent(500000, deployer.address, betContract);
        block.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Check betting enabled, bet price and number of participants after first bet",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;

        // Mine a block that contains a contract call to "bet-in-ustx"
        let block = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    deployer.address),
        ]);

        // Get the first receipt from the block and check that it is successful
        block.receipts[0].events.expectSTXTransferEvent(500000, deployer.address, betContract);
        block.receipts[0].result.expectOk().expectBool(true);

        // Call the "betting-enabled" function of the contract
        let receipt1 = chain.callReadOnlyFn("wager", "betting-enabled", [], deployer.address);

        // Check that the function returns true
        receipt1.result.expectOk().expectBool(true);

        // Call the "get-price-in-ustx" function of the contract
        let receipt2 = chain.callReadOnlyFn("wager", "get-price-in-ustx", [], deployer.address);

        // Check that the function returns u500000
        receipt2.result.expectOk().expectUint(500000);

        // Call the "get-number-of-participants" function of the contract
        let receipt3 = chain.callReadOnlyFn("wager", "get-number-of-participants", [], deployer.address);

        // Check that the function returns u2
        receipt3.result.expectOk().expectUint(2);
    },
});

Clarinet.test({
    name: "Make 2 bets (2 participants) and check betting enabled after second bet",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;
        
        // Get the wallet1 account
        let wallet_1 = accounts.get("wallet_1")!;

        // Mine a first block that contains a contract call to "bet-in-ustx"
        let block1 = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    deployer.address),
        ]);

        // Mine a second block that contains a contract call to "bet-in-ustx"
        let block2 = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    wallet_1.address),
        ]);

        // Get the first receipt from the blocks and check that it is successful
        block1.receipts[0].events.expectSTXTransferEvent(500000, deployer.address, betContract);
        block1.receipts[0].result.expectOk().expectBool(true);
        block2.receipts[0].events.expectSTXTransferEvent(500000, wallet_1.address, betContract);
        block2.receipts[0].events.expectSTXTransferEvent(1000000, betContract, wallet_1.address);
        block2.receipts[0].result.expectOk().expectBool(true);

        // Call the "betting-enabled" function of the contract
        let receipt = chain.callReadOnlyFn("wager", "betting-enabled", [], wallet_1.address);

        // Check that the function returns false
        receipt.result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Make 3 bets (3 participants) and check betting enabled after third bet",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;
        
        // Get the wallet1 account
        let wallet_1 = accounts.get("wallet_1")!;

        // Get the wallet2 account
        let wallet_2 = accounts.get("wallet_2")!;

        // Mine a first block that contains a contract call to "bet-in-ustx"
        let block1 = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(3), // participants
                                                    ], 
                                                    deployer.address),
        ]);

        // Mine a second block that contains a contract call to "bet-in-ustx"
        let block2 = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(3), // participants
                                                    ], 
                                                    wallet_1.address),
        ]);

        // Mine a third block that contains a contract call to "bet-in-ustx"
        let block3 = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(3), // participants
                                                    ], 
                                                    wallet_2.address),
        ]);

        // Get the receipts from the blocks and check that it is successful
        block1.receipts[0].events.expectSTXTransferEvent(500000, deployer.address, betContract);
        block1.receipts[0].result.expectOk().expectBool(true);
        block2.receipts[0].events.expectSTXTransferEvent(500000, wallet_1.address, betContract);
        block2.receipts[0].result.expectOk().expectBool(true);
        block3.receipts[0].events.expectSTXTransferEvent(500000, wallet_2.address, betContract);
        block3.receipts[0].events.expectSTXTransferEvent(1500000, betContract, wallet_1.address);
        block3.receipts[0].result.expectOk().expectBool(true);

        // Call the "betting-enabled" function of the contract
        let receipt = chain.callReadOnlyFn("wager", "betting-enabled", [], wallet_1.address);

        // Check that the function returns false
        receipt.result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Make 4 bets (2 rounds - 2 participants) and check betting enabled, price in ustx, number of participants, prize pool in ustx = 0",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;
        
        // Get the wallet1 account
        let wallet_1 = accounts.get("wallet_1")!;

        // Get the wallet2 account
        let wallet_2 = accounts.get("wallet_2")!;

        // Get the wallet3 account
        let wallet_3 = accounts.get("wallet_3")!;

        // Mine a first block that contains a contract call to "bet-in-ustx"
        let block1 = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    deployer.address),
        ]);

        // Mine a second block that contains a contract call to "bet-in-ustx"
        let block2 = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    wallet_1.address),
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(100000000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    wallet_2.address),
        ]);

        // Mine a third block that contains a contract call to "bet-in-ustx"
        let block3 = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(100000000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    wallet_3.address),
        ]);

        // Get the receipts from the blocks and check that it is successful
        block1.receipts[0].events.expectSTXTransferEvent(500000, deployer.address, betContract);
        block1.receipts[0].result.expectOk().expectBool(true);
        block2.receipts[0].events.expectSTXTransferEvent(500000, wallet_1.address, betContract);
        block2.receipts[0].events.expectSTXTransferEvent(1000000, betContract, wallet_1.address);
        block2.receipts[0].result.expectOk().expectBool(true);
        block2.receipts[1].events.expectSTXTransferEvent(100000000, wallet_2.address, betContract);
        block2.receipts[1].result.expectOk().expectBool(true);
        block3.receipts[0].events.expectSTXTransferEvent(100000000, wallet_3.address, betContract);
        block3.receipts[0].events.expectSTXTransferEvent(200000000, betContract, wallet_3.address);
        block3.receipts[0].result.expectOk().expectBool(true);

        // Call the "betting-enabled" function of the contract
        let receipt1 = chain.callReadOnlyFn("wager", "betting-enabled", [], deployer.address);

        // Check that the function returns true
        receipt1.result.expectOk().expectBool(true);

        // Call the "get-price-in-ustx" function of the contract
        let receipt2 = chain.callReadOnlyFn("wager", "get-price-in-ustx", [], deployer.address);

        // Check that the function returns u0
        receipt2.result.expectOk().expectUint(0);

        // Call the "get-number-of-participants" function of the contract
        let receipt3 = chain.callReadOnlyFn("wager", "get-number-of-participants", [], deployer.address);

        // Check that the function returns u0
        receipt3.result.expectOk().expectUint(0);

        // Call the "get-prize-pool-in-ustx" function of the contract
        let receipt4 = chain.callReadOnlyFn("wager", "get-prize-pool-in-ustx", [], deployer.address);

        // Check that the function returns u0
        receipt4.result.expectOk().expectUint(0);
    }
});

Clarinet.test({
    name: "Test ERR_NO_MONEY",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;

        // Mine a block that contains a contract call to "bet-in-ustx" with price - u100000000000000
        let block = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(100000000000000), // price
                                                        types.uint(2), // participants
                                                    ], 
                                                    deployer.address),
        ]);

        // Get the first receipt from the block and check that it is successful
        block.receipts[0].result.expectErr().expectUint(errorCodes.ERR_NO_MONEY);
    }
});

Clarinet.test({
    name: "Test ERR_ZERO_OR_MAX",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;

        // Mine a block that contains a contract call to "bet-in-ustx" with participants - u1
        let block = chain.mineBlock([
            Tx.contractCall("wager", "bet-in-ustx", [
                                                        types.uint(500000), // price
                                                        types.uint(1), // participants
                                                    ], 
                                                    deployer.address),
        ]);

        // Get the first receipt from the block and check that it is successful
        block.receipts[0].result.expectErr().expectUint(errorCodes.ERR_ZERO_OR_MAX);
    }
});