const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("NTOI", () => {
  let swapExamples
  let accounts
  let dai
  let usdc

  before(async () => {
    accounts = await ethers.getSigners(1)
    const usdcAmount = 1000n * 10n **6n

    const DToken = await hre.ethers.getContractFactory("DToken")
    dai = await DToken.deploy()
    await dai.deployed();
    
    const UToken = await hre.ethers.getContractFactory("UToken")
    usdc = await UToken.deploy()
    await usdc.deployed();

    const SwapExamples = await ethers.getContractFactory("SwapExamples")
    swapExamples = await SwapExamples.deploy(dai.address,usdc.address)
    await swapExamples.deployed()

    await usdc.connect(accounts[0]).faucet(accounts[0].address, usdcAmount)
    console.log(await usdc.balanceOf(accounts[0].address))
  })

  it("swapExactInputSingle", async () => {
    const amountIn = 100n * 10n **6n
    console.log("DAI balance b4", await dai.balanceOf(accounts[0].address))
    console.log("USC balance b4", await usdc.balanceOf(accounts[0].address))
    await usdc.connect(accounts[0]).approve(swapExamples.address, amountIn)

    console.log ('allowance', await usdc.allowance(accounts[0].address, swapExamples.address))
    await swapExamples.connect(accounts[0]).swapExactInputSingle(amountIn)
    console.log("DAI balance", await dai.balanceOf(accounts[0].address))
    console.log("USC balance ", await usdc.balanceOf(accounts[0].address))


    
  })

})