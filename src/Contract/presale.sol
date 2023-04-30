// SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TokenPresale is Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token;
    IERC20 public usdt;
    uint256 public rate;
    uint256 public endTime;
    uint256 public tokensSold; //已经售出代币数量
    uint256 public startTime; // 预售开始时间变量

    uint256 public constant minPurchaseAmount = 10 * 10**6; // Minimum purchase amount: 10 USDT

    mapping(address => uint256) public referrerCount;
    mapping(address => uint256) public referrerRewards;
    mapping(address => mapping(address => bool)) private rewardedReferrals;
    uint256[3] public referralPercentages = [10, 15, 20]; // Reward percentages: 10%, 15%, 20%

    event TokensPurchased(address indexed buyer, uint256 usdtAmount, uint256 tokenAmount);
    event ReferralReward(address indexed referrer, uint256 amount);

    constructor(IERC20 _token, IERC20 _usdt, uint256 _rate) {
        require(address(_token) != address(0), "Token address cannot be the zero address.");
        require(address(_usdt) != address(0), "USDT address cannot be the zero address.");
        token = _token;
        usdt = _usdt;
        rate = _rate;
        startTime = 0; // 初始化开始时间为 0
        endTime = 0;   // 初始化结束时间为 0
    }

    // 设置预售开始时间
   function setStartTime() external onlyOwner {
        require(endTime == 0 || block.timestamp < endTime, "Start time must be less than end time.");
        startTime = block.timestamp;
    }

     // 设置预售结束时间
    function setEndTime(uint256 _endTime) external onlyOwner {
        require(_endTime > 0, "End time must be greater than 0.");
        require(startTime == 0 || _endTime > startTime, "End time must be greater than start time.");
        endTime = _endTime;
    }

    // Deposit tokens
    function depositTokens(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0.");
        require(token.balanceOf(msg.sender) >= _amount, "Not enough tokens in your account.");
        require(startTime > 0 && endTime > 0, "Start and end times must be set.");
        require(block.timestamp >= startTime && block.timestamp < endTime, "Token presale is not active.");
        token.safeTransferFrom(msg.sender, address(this), _amount);
    }

    function buyTokens(uint256 _usdtAmount, address referrer) external whenNotPaused {
        require(block.timestamp < endTime, "Token presale has ended.");
        require(_usdtAmount >= minPurchaseAmount, "USDT amount must be equal or greater than the minimum purchase amount.");
        uint256 tokensToBuy = _usdtAmount.mul(rate);
        require(token.balanceOf(address(this)) >= tokensToBuy, "Not enough tokens in the contract.");

        // Transfer USDT from buyer to contract
        usdt.safeTransferFrom(msg.sender, address(this), _usdtAmount);

        // Reward referrer
        if (referrer != address(0) && referrer != msg.sender && !rewardedReferrals[msg.sender][referrer]) {
            distributeReferralRewards(referrer, _usdtAmount);
            rewardedReferrals[msg.sender][referrer] = true;
        }

        // Transfer tokens to buyer
            token.safeTransfer(msg.sender, tokensToBuy);

        // 更新已经售出代币数量
            tokensSold = tokensSold.add(tokensToBuy);    

    // 发出事件
    emit TokensPurchased(msg.sender, _usdtAmount, tokensToBuy);
}

function distributeReferralRewards(address referrer, uint256 _usdtAmount) private {
    uint256 referralPercentage = getReferralPercentage(referrer);
    uint256 referralReward = _usdtAmount.mul(referralPercentage).div(100);
    referrerRewards[referrer] = referrerRewards[referrer].add(referralReward);
    usdt.safeTransfer(referrer, referralReward);
    emit ReferralReward(referrer, referralReward);
}

function getReferralPercentage(address referrer) public view returns (uint256) {
    uint256 refCount = referrerCount[referrer];
    if (refCount >= 20) {
        return referralPercentages[2]; // 推荐数量大于等于20时，奖励百分比为20%
    } else if (refCount >= 10) {
        return referralPercentages[1]; // 推荐数量大于等于10且小于20时，奖励百分比为15%
    } else {
        return referralPercentages[0]; // 推荐数量小于10时，奖励百分比为10%
    }
}

function withdraw() external onlyOwner {
    uint256 usdtBalance = usdt.balanceOf(address(this));
    if (usdtBalance > 0) {
        usdt.safeTransfer(owner(), usdtBalance);
    }

    uint256 tokenBalance = token.balanceOf(address(this));
    if (tokenBalance > 0) {
        token.safeTransfer(owner(), tokenBalance);
    }
}
// 允许合约所有者提取合约内的 USDT 和预售代币。

function pause() external onlyOwner {
    _pause();
}

function unpause() external onlyOwner {
    _unpause();
}

function getTokensSold() public view returns (uint256) {
    return tokensSold;
}


}