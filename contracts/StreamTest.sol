// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.6;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

import "./SwapExamples.sol";
import "./LiquidityExamples.sol";
import "hardhat/console.sol";
contract StreamTest is ReentrancyGuard{
    struct Stream {
        address recipient;
        address sender;
        uint256 deposit;
        uint256 duration;
        uint256 startTime;
        uint256 stopTime;
        uint256 rate;
        uint256 balance;
        uint256 liquidity;
    }

    event CreateStream(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 deposit,
        uint256 duration
    );

    IERC20 public payToken;
    SwapExamples public swapExamples;
    LiquidityExamples public liquidityExamples;
    IERC20 public swapToken;
    uint256 public streamIdCounter;

    mapping (address => uint) public nftIDs;
    mapping (uint256 => Stream) public streams;
    mapping (address => uint256[]) public streamIDs;
    constructor(
        address _token, 
        address _swapToken,
        address _swapAddress, 
        address _liqAddress) {
        payToken = IERC20(_token);
        swapToken = IERC20(_swapToken);
        swapExamples = SwapExamples(_swapAddress);
        liquidityExamples = LiquidityExamples(_liqAddress);
    }
    function createStream (
        address _recipient,
        uint256 _deposit,
        uint256 _duration
    )
    public 
    payable 
    returns (uint256 _streamId)
    {
        require(_recipient != address(0x00), "Stream to the zero address");
        require(_recipient != address(this), "Stream to the contract itself");
        require(_recipient != msg.sender, "Stream to the caller");
        require(_deposit > 0, "Deposit is equal to zero");
        require(_duration > 0, "Duration not valid");


        require(_deposit >= _duration, "Deposit smaller than duration");
        require(_deposit % _duration == 0, "Deposit is not a multiple of time delta");

        streamIdCounter += 1;
        uint256 currentStreamId = streamIdCounter;
        payToken.approve(address(this), _deposit);
        payToken.transferFrom(msg.sender, address(this), _deposit);
        // Rate Per second

        uint256 rate = _deposit / _duration;
        uint256 endTime = block.timestamp + _duration;
        streams[currentStreamId] = Stream({
           balance: _deposit,
           deposit: _deposit,
           rate: rate,
           recipient: _recipient,
           sender: msg.sender,
           duration: _duration,
           startTime: block.timestamp,
           stopTime: endTime,
           liquidity : 0
        });
        streamIDs[msg.sender].push(currentStreamId);
        emit CreateStream(currentStreamId, msg.sender, _recipient, _deposit, _duration);
        return currentStreamId;

    }
    function withdrawAndInvestFromStream(
        uint256 _streamId, 
        uint256 _invest) 
        public 
    {
        Stream memory stream = streams[_streamId];
        console.log (
            "balance of recipeint after elapsed time before swapping",
            balanceOf(_streamId , stream.recipient)
        );
        uint256 bal = balanceOf(_streamId, stream.recipient);
        uint256 half = _invest/2;
        payToken.approve(address(this),_invest);
        payToken.approve(address(swapExamples), half);
        uint swapReturn = swapExamples.swapExactInputSingle(half);
        console.log ("Dai in contract before providing liquidity", swapToken.balanceOf(address(this)));
        console.log ("USDC in contract before providing liquidity", payToken.balanceOf(address(this)));        

        payToken.transfer(address(liquidityExamples), half);
        swapToken.transfer(address(liquidityExamples), swapReturn);
        liquidityExamples.mintNewPosition(swapReturn, half);
        payToken.transfer(stream.recipient, (bal-_invest) );
        uint id = liquidityExamples.tokenId();
        uint128 liqTokens = liquidityExamples.getLiquidity(id);
        nftIDs[stream.recipient] = id;
        streams[_streamId].balance = 0;
        streams[_streamId].liquidity = liqTokens;
    }

    function getFees (uint256 _streamId) 
    public {
        Stream memory stream = streams[_streamId];
        uint nftId = nftIDs[stream.recipient];
        uint128 liquidity = liquidityExamples.getLiquidity(nftId);
        liquidityExamples.decreaseLiquidity(liquidity);
        liquidityExamples.collectAllFees();
        uint256 convert = ( swapToken.balanceOf(address(this))) / (10**12);
        swapToken.transfer(stream.recipient, swapToken.balanceOf(address(this)));
        payToken.transfer(stream.recipient, convert );
        //console.log ("convert", convert);
        //console.log( " ahdfhasdfhdsjfhsa" , payToken.balanceOf(stream.recipient));
    }

    function balanceOf( uint256 _streamId, address _who)  public view returns (uint256 balance) {
        Stream memory stream = streams[_streamId];
        require (stream.sender != address(0),"stream does not exist");

        uint256 elapsedTime = elapsedTimeFor(_streamId);
        uint256 due = elapsedTime * stream.rate;
       
        if (_who == stream.recipient) {
            return due;
        } else if (_who == stream.sender) {
            return stream.balance - due;
        } else {
            return 0;
        }
    }


    function elapsedTimeFor(uint256 _streamId) private view returns (uint256 delta) {
        Stream memory stream = streams[_streamId];

        // Before the start of the stream
        
        // During the stream
        if (block.timestamp < stream.stopTime) return block.timestamp - stream.startTime;

        // After the end of the stream
        return stream.stopTime - stream.startTime;
    }

}