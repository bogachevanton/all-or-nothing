// deno-lint-ignore-file
import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.0.6/index.ts";

const guessContract = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.guess-the-number";
const errorCodes = {
                    ERR_GUESSING_NOT_ACTIVE : 101,
                    ERR_GUESSING_ACTIVE : 102,
                    ERR_REACHED_BLOCK_PICK_LIMIT : 103,
                    ERR_NO_MONEY : 104,
                    ERR_ZERO_OR_MAX : 105,
                    ERR_OVER_LIMIT : 106,
}

Clarinet.test({
    name: "Make first guess, check guessing enabled, guess price and number of participants",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;

        // Mine a block that contains a contract call to "choose-number"
        let block = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(500000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(60), // user-number
                                                                 ], 
                                                                 deployer.address),
        ]);

        block.receipts[0].events.expectSTXTransferEvent(500000, deployer.address, guessContract);
        block.receipts[0].result.expectOk().expectBool(true);

        // Call the "guessing-enabled" function of the contract
        let receipt1 = chain.callReadOnlyFn("guess-the-number", "guessing-enabled", [], deployer.address);

        // Check that the function returns true
        receipt1.result.expectOk().expectBool(true);

        // Call the "get-price-in-ustx" function of the contract
        let receipt2 = chain.callReadOnlyFn("guess-the-number", "get-price-in-ustx", [], deployer.address);

        // Check that the function returns u500000
        receipt2.result.expectOk().expectUint(500000);

        // Call the "get-number-of-participants" function of the contract
        let receipt3 = chain.callReadOnlyFn("guess-the-number", "get-number-of-participants", [], deployer.address);

        // Check that the function returns u2
        receipt3.result.expectOk().expectUint(2);
    },
});

Clarinet.test({
    name: "Make 2 guesses and check betting enabled",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;
        
        // Get the wallet1 account
        let wallet_1 = accounts.get("wallet_1")!;

        // Mine a block that contains a contract call to "choose-number"
        let block1 = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(500000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(60), // user-number
                                                                 ], 
                                                                 deployer.address),
        ]);

        // Mine a second block that contains a contract call to "choose-number"
        let block2 = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(500000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(65), // user-number
                                                                 ], 
                                                                 wallet_1.address),
        ]);

        // Get the first receipt from the blocks and check that it is successful
        block1.receipts[0].events.expectSTXTransferEvent(500000, deployer.address, guessContract);
        block1.receipts[0].result.expectOk().expectBool(true);
        block2.receipts[0].events.expectSTXTransferEvent(500000, wallet_1.address, guessContract);
        block2.receipts[0].events.expectSTXTransferEvent(1000000, guessContract, wallet_1.address);
        block2.receipts[0].result.expectOk().expectBool(true);

        // Call the "betting-enabled" function of the contract
        let receipt = chain.callReadOnlyFn("guess-the-number", "guessing-enabled", [], wallet_1.address);

        // Check that the function returns false
        receipt.result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Make 4 guesses (2 rounds - 2 participants)",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;
        
        // Get the wallet1 account
        let wallet_1 = accounts.get("wallet_1")!;

        // Get the wallet1 account
        let wallet_2 = accounts.get("wallet_2")!;

        // Get the wallet1 account
        let wallet_3 = accounts.get("wallet_3")!;

        // Mine a block that contains a contract call to "choose-number"
        let block1 = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(500000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(60), // user-number
                                                                 ], 
                                                                 deployer.address),
        ]);

        // Mine a second block that contains a contract call to "choose-number"
        let block2 = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(500000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(65), // user-number
                                                                 ], 
                                                                 wallet_1.address),
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(700000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(80), // user-number
                                                                 ], 
                                                                 wallet_2.address),
        ]);

        // Mine a block that contains a contract call to "choose-number"
        let block3 = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(700000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(17), // user-number
                                                                 ], 
                                                                 wallet_3.address),
        ]);

        // Get the first receipt from the blocks and check that it is successful
        block1.receipts[0].events.expectSTXTransferEvent(500000, deployer.address, guessContract);
        block1.receipts[0].result.expectOk().expectBool(true);
        block2.receipts[0].events.expectSTXTransferEvent(500000, wallet_1.address, guessContract);
        block2.receipts[0].events.expectSTXTransferEvent(1000000, guessContract, wallet_1.address);
        block2.receipts[0].result.expectOk().expectBool(true);
        block2.receipts[1].events.expectSTXTransferEvent(700000, wallet_2.address, guessContract);
        block2.receipts[1].result.expectOk().expectBool(true);
        block3.receipts[0].events.expectSTXTransferEvent(700000, wallet_3.address, guessContract);
        block3.receipts[0].events.expectSTXTransferEvent(1400000, guessContract, wallet_2.address);
        block3.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Make 2 guesses with same number",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;
        
        // Get the wallet1 account
        let wallet_1 = accounts.get("wallet_1")!;

        // Mine a block that contains a contract call to "choose-number"
        let block1 = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(900000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(60), // user-number
                                                                 ], 
                                                                 deployer.address),
        ]);

        // Mine a second block that contains a contract call to "choose-number"
        let block2 = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                                    types.uint(900000), // price
                                                                    types.uint(2), // participants
                                                                    types.int(60), // user-number
                                                                 ], 
                                                                 wallet_1.address),
        ]);

        // Get the first receipt from the blocks and check that it is successful
        block1.receipts[0].events.expectSTXTransferEvent(900000, deployer.address, guessContract);
        block1.receipts[0].result.expectOk().expectBool(true);
        block2.receipts[0].events.expectSTXTransferEvent(900000, wallet_1.address, guessContract);
        block2.receipts[0].events.expectSTXTransferEvent(900000, guessContract, deployer.address);
        block2.receipts[0].events.expectSTXTransferEvent(900000, guessContract, wallet_1.address);
        block2.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Test ERR_NO_MONEY",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;

        // Mine a block that contains a contract call to "choose-numbe with price - u100000000000000
        let block = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                        types.uint(100000000000000), // price
                                                        types.uint(2), // participants
                                                        types.int(65), // user-number
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

        // Mine a block that contains a contract call to "choose-number" with participants - u1
        let block = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                        types.uint(500000), // price
                                                        types.uint(1), // participants
                                                        types.int(65), // user-number
                                                    ], 
                                                    deployer.address),
        ]);

        // Get the first receipt from the block and check that it is successful
        block.receipts[0].result.expectErr().expectUint(errorCodes.ERR_ZERO_OR_MAX);
    }
});

Clarinet.test({
    name: "Test ERR_OVER_LIMIT",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        // Get the deployer's account
        let deployer = accounts.get("deployer")!;

        // Mine a block that contains a contract call to "choose-number" with participants - u1
        let block = chain.mineBlock([
            Tx.contractCall("guess-the-number", "choose-number", [
                                                        types.uint(500000), // price
                                                        types.uint(2), // participants
                                                        types.int(150), // user-number
                                                    ], 
                                                    deployer.address),
        ]);

        // Get the first receipt from the block and check that it is successful
        block.receipts[0].result.expectErr().expectUint(errorCodes.ERR_OVER_LIMIT);
    }
});