// SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract TokenPresale is Pausable {
    using SafeMath for uint256;

    IERC20 public token;
    IERC20 public usdt;
    address payable public owner;
    uint256 public rate;
    uint256 public endTime;

    uint256 public constant referralRewardPercentage = 5;
    uint256 public constant minPurchaseAmount = 10 * 10**6; // Minimum purchase amount: 10 USDT

    mapping(address => uint256) public referrerCount;
    mapping(address => uint256) public referrerRewards;
    mapping(address => mapping(address => bool)) private rewardedReferrals;
    uint256[3] public referralPercentages = [10, 15, 20]; // Reward percentages: 10%, 15%, 20%

    event TokensPurchased(address indexed buyer, uint256 usdtAmount, uint256 tokenAmount);

    constructor(IERC20 _token, IERC20 _usdt, uint256 _rate, uint256 _endTime) {
        token = _token;
        usdt = _usdt;
        owner = payable(msg.sender);
        rate = _rate;
        endTime = _endTime;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    // Deposit tokens
    function depositTokens(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0.");
        require(token.balanceOf(msg.sender) >= _amount, "Not enough tokens in your account.");
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function buyTokens(uint256 _usdtAmount, address referrer) external whenNotPaused {
        require(block.timestamp < endTime, "Token presale has ended.");
        require(_usdtAmount >= minPurchaseAmount, "USDT amount must be equal or greater than the minimum purchase amount.");
        uint256 tokensToBuy = _usdtAmount.mul(rate);
        require(token.balanceOf(address(this)) >= tokensToBuy, "Not enough tokens in the contract.");

        // Transfer USDT from buyer to contract
        usdt.transferFrom(msg.sender, address(this), _usdtAmount);

        // Reward referrer

         if (referrer != address(0) && referrer != msg.sender && !rewardedReferrals[msg.sender][referrer]) {
            distributeReferralRewards(referrer, _usdtAmount);
            rewardedReferrals[msg.sender][referrer] = true;
        }

        // Transfer tokens to buyer
        token.transfer(msg.sender, tokensToBuy);

        // Emit event
        emit TokensPurchased(msg.sender, _usdtAmount, tokensToBuy);
    }

    function distributeReferralRewards(address referrer, uint256 _usdtAmount) private {
        uint256 referralPercentage = getReferralPercentage(referrer);
        uint256 referralReward = _usdtAmount.mul(referralPercentage).div(100);
        referrerRewards[referrer] = referrerRewards[referrer].add(referralReward);
        usdt.transfer(referrer, referralReward);
    }

    function getReferralPercentage(address referrer) public  view returns (uint256) {
        uint256 refCount = referrerCount[referrer];
        if (        refCount >= 10) {
            return referralPercentages[2];
        } else if (refCount >= 20) {
            return referralPercentages[1];
        } else {
            return referralPercentages[0];
        }
    }

    function withdraw() external onlyOwner {
       
        uint256 usdtBalance = usdt.balanceOf(address(this));
        if (usdtBalance > 0) {
            usdt.transfer(owner, usdtBalance);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}

