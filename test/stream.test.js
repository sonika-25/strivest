const { expect } = require("chai")
const { ethers } = require("hardhat")
//const {StreamTest} = require ("./artifacts/contracts/StreamTest.sol/StreamTest.json")

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const USDC_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"

describe("StreamExamples", () => {
  let swap
  let liquid
  let stream
  let accounts
  let dai
  let usdc

  before(async () => {
    accounts = await ethers.getSigners(1)
    const usdcAmount = 400n * 10n ** 6n;

    const SwapExamples = await ethers.getContractFactory("SwapExamples")
    swap = await SwapExamples.deploy()
    await swap.deployed();

    const LiquidityExamples = await ethers.getContractFactory("LiquidityExamples")
    liquid = await LiquidityExamples.deploy()
    await liquid.deployed()

    const StreamTest = await ethers.getContractFactory("StreamTest")
    stream = await StreamTest.deploy(USDC, DAI, swap.address, liquid.address)
    await stream.deployed()
    
    dai = await ethers.getContractAt("IERC20", DAI)
    usdc = await ethers.getContractAt("IERC20", USDC)
    
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [USDC_WHALE]
      })
    const usdcWhale = await ethers.getSigner(USDC_WHALE)
    await usdc.connect(usdcWhale).transfer(accounts[0].address, usdcAmount)
    console.log ("balance of sender account before starting stream", await usdc.connect(accounts[0]).balanceOf(accounts[0].address))
  })

  it ("should create Stream", async() => {
    const depUsdc = 400n *10n ** 6n;

    usdc.connect(accounts[0]).approve(stream.address, depUsdc);
    await stream.connect(accounts[0]).createStream (accounts[1].address, depUsdc, 10);

    await network.provider.send("evm_increaseTime", [5])
    await network.provider.send("evm_mine") 
    const id = (await stream.streamIdCounter())
    const stp = await usdc.balanceOf(stream.address);
    console.log(
      "balance of sender account after creating stream",  
      await usdc.connect(accounts[0]).balanceOf(accounts[0].address)
      );
    console.log(
      "balance of stream contract after creating stream",  
      await usdc.connect(accounts[0]).balanceOf(stream.address)
      )
  })


  it("should invest tokens", async () => {
    const amountIn = 100n *10n ** 6n;
    const id = (await stream.streamIdCounter())
  
    console.log ("amount to be invested: ", amountIn)
    await stream.withdrawAndInvestFromStream(id, amountIn)

    console.log( 
      "DAi in contract after investing in liquidity pool", 
      await dai.balanceOf(stream.address)
    )
    console.log( 
      "USDC in contract after investing", 
      await usdc.balanceOf(stream.address)
    )
    console.log( 
      "USDC in recipient account after returning leftover", 
      await usdc.balanceOf(accounts[1].address)
    )
    
  })
  
  it("should return tokens and fees", async () => {
    
    const id = (await stream.streamIdCounter())

    await stream.getFees(id)
    console.log( "DAi in recipient account after", await dai.balanceOf(accounts[1].address))
    console.log( "USDC in recipient account after", await usdc.balanceOf(accounts[1].address))

  })
  
})