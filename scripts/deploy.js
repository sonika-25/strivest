//deploy: npx hardhat run scripts/deploy.js --network rinkeby

const hre = require("hardhat");
const usdcAmount = 10000n * 10n ** 6n;
const USDC_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

async function main() {
  const accounts = await ethers.getSigners();

  const SwapExamples = await hre.ethers.getContractFactory("SwapExamples")
  const swap = await SwapExamples.deploy()
  await swap.deployed();

  const LiquidityExamples = await hre.ethers.getContractFactory("LiquidityExamples")
  const liquid = await LiquidityExamples.deploy()
  await liquid.deployed()

  const StreamTest = await hre.ethers.getContractFactory("StreamTest")
  const stream = await StreamTest.deploy(USDC, DAI, swap.address, liquid.address)
  await stream.deployed();

  console.log("Swap deployed to:", swap.address);
  console.log("Liquidity deployed to:", liquid.address);
  console.log("Streamer deployed to:", stream.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });