pragma solidity >=0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';


contract DToken is ERC20 {
  constructor() ERC20('DAI token', 'DAI') public {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}