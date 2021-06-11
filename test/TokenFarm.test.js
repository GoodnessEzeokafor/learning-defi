const { assert } = require("chai");

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");
require("chai")
    .use(require("chai-as-promised"))
    .should()

const tokens = (n) => {
     return web3.utils.toWei(n, 'ether')
}

contract("TokenFarm", ([owner, investor, investor2, investor3]) => {
   let daiToken, dappToken, tokenFarm;
    before(async() => {
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
        
        await dappToken.transfer(tokenFarm.address, tokens("1000000"))
        
        // send tokens to investor
        await daiToken.transfer(investor, tokens("100"), {from:owner})
    })
    describe("Mock Dai deployment", async() => {
        it("has a name", async() => {
            const  name = await daiToken.name()
            assert.equal(name, "Mock DAI Token")
        })
        it("has a symbol", async() => {
            const symbol = await daiToken.symbol()
            assert.equal(symbol, "mDAI")
        })
    })
    describe("Dapp Token Deployment", async() => {
        it("has a name", async() => {
            const name = await dappToken.name()
            assert.equal(name, "Goody Token")
        })
        it("has a symbol", async() => {
            const symbol = await dappToken.symbol()
            assert.equal(symbol, "Goody")

        })
    })
    describe("Token Farm Deployment", async()=> {
        it("has a name", async() => {
            const name = await tokenFarm.name()
            assert.equal(name, "Dapp Token Farm")
        })
        it("has note", async() => {
            const note = await tokenFarm.note()
            assert.equal(note, "Learning Solidity My Ass")
        })
        it("contract has tokens", async() => {
            const balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens("1000000"))
        })
    })
    describe("Farming tokens", async() => {
        let result
        it("rewards investors for staking mDai tokens", async()=> {
        result = await daiToken.balanceOf(investor)
        assert.equal(result.toString(), tokens("100"), 'investor Mock DAI wallet ballet correct before staking')


        // Stake 
        await daiToken.approve(tokenFarm.address, tokens("100"),{from:investor})
        await tokenFarm.stakeToken(tokens("100"), {from:investor})

        result = await daiToken.balanceOf(investor)
        assert.equal(result.toString(), tokens("0"), "investor MOck DAI wallet balance correct after staking")
        
        result = await daiToken.balanceOf(tokenFarm.address)
        assert.equal(result.toString(), tokens("100"), "Token Farm Mock DAI balance correct after staking")
        

        // Issue Tokens
        await tokenFarm.issueToken({from:owner})
        result = await dappToken.balanceOf(investor)
        assert.equal(result.toString(), tokens("100"), "investor DApp Token wallet balance correct after issuance")

        // Ensure that only owner can call the function
        await tokenFarm.issueToken({from:investor}).should.be.rejected;
        
        // unstake token
        await tokenFarm.unstakeToken({from:investor});

        // check results after unstaking
        result = await daiToken.balanceOf(investor)
        assert.equal(result.toString(), tokens("100"), "investory Mock DAI balance correct after staking")
        
        result = await daiToken.balanceOf(tokenFarm.address)
        assert.equal(result.toString(), tokens("0"), "Token Farm Mock Dai balance correct after unstaking")

        result = await tokenFarm.stakingBalance(investor)
        assert.equal(result.toString(), tokens("0"), "investor staking balance correct after staking")

        result = await tokenFarm.isStaking(investor)
        assert.equal(result.toString(), 'false', 'investor staking status corect after staking')

    })
    })
})