pragma solidity >=0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';


contract UToken is ERC20 {
  constructor() ERC20('USDC token', 'USDC') {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
  function decimals() public view virtual override returns (uint8) {
    return 6;
  }
}