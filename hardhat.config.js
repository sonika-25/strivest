require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");

module.exports = {
  paths: {
    artifacts: './client/src/artifacts',
  },
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/613t3mfjTevdrCwDl28CVvuk6wSIxRPi",
      },
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${infuraKey}`,
      accounts: [privateKey],

    }
  },
  // mocha: {
  //   timeout: 100000000,
  // },
}