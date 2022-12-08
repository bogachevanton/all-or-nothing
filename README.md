<p align="center">
<img width="735" height="335" src="https://i.imgur.com/OzMB9le.png">
</p>

## Inspiration

December is a very difficult month for everyone because the calendar year is ending and it is necessary to finish and close all the cases in the outgoing year. But you also need to find time for your hobbies.
My personal hobbies are Stacks and Clarity, so I sat at the computer for several evenings and wrote a couple of smart contracts that can also help someone else get distracted if they risk playing for STX.

## What it does

Let's start in order, the first smart contract `wager` allows several participants to wager with a certain amount of STX tokens (the same for everyone). A value is set in uSTX and participants when the contract is initialized.
Using a random number obtained from a part of the block VRF in Stacks, determine the winner who will win the bet and take the entire reward for himself. Hence the name - All or nothing.

_Notes:_

<ol>
<li>For each new bet, a new contract is needed.</li>
<li>Number of participants in the smart contract is limited to 10 users, but this can be easily changed by changing the limit:</li>
</ol>

```
;; line 31 - replace u10 with any number of uint
(asserts! (and (> participants u1) (< participants u10)) ERR_ZERO_OR_MAX)
```

The second smart contract `guess-the-number` allows two users to play a game - guess the number. The one who guesses the number that is closer to the random number takes the entire reward for himself. A value in uSTX, participants and user-number is set when initializing the contract.

_Notes:_

<ol>
<li>Restrictions on the number of users - 2 people.</li>
<li>The range in which the number is determined is from 0 to 100. But it can also be changed, for this you need to change the code in several places:</li>
</ol>

```
;; line 45 - replace 101 with the number you want, but no more than 65536
(asserts! (< user-number 101) ERR_OVER_LIMIT)

;; line 161 - replace u100 with the number you want, but no more than u65536
(define-data-var limit-numbers uint u100)
```

## How I built it

I created a project using Clarity for smart contracts and Typescript for writing unit tests.

## Challenges we ran into

Run `lcov` on Windows. I tried long and hard, but it didn't work. It would be nice to add a `brew` alternative to the [Clarinet](https://github.com/hirosystems/clarinet).
Deal with Clarinet, before that I did not pay much attention to unit testing. I tested contracts in the testnet, after downloading the contract via Sandbox.
Attach the [random number generator](https://github.com/FriendsFerdinand/random-test/tree/main/contracts).

## Accomplishments that we're proud of

That smart contracts work and are pretty secure. All tokens sent by users are stored in the contract address and can only be retrieved from the contract by completing the bet/guess cycle.

## What's next for Implementing a simple bet/guess between users

<ol>
<li>Modify the wager smart contract, supplement the code, add resetting the variables to their initial values, and this smart contract will live forever.</li>
<li>Create a separate (top-level) smart contract, which will be the main one for smart contracts and calls will be made from it. This smart contract will allow you to organize parallel work for several bets/guesses.</li>
<li>Building a frontend using Stacks.js or micro-stacks and make web UI.</li>
</ol>
