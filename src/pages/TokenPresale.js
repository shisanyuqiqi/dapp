import React, { useState, useEffect } from "react";
import { Layout, Typography, Row, Col, Form, Input, Button, Progress, Divider, message, Tooltip } from "antd";
import Web3 from "web3";
import IERC20_ABI from '../abi/IERC20.json';
import TokenPresale_ABI from '../abi/TokenPresale.json';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const TokenPresaleComponent = ({ connected, web3, account, startTime, endTime }) => {
  const [usdtAmount, setUsdtAmount] = useState(10);
  const [referrerAddress, setReferrerAddress] = useState("");
  const [tokensSold, setTokensSold] = useState(0);
  const [targetAmount, setTargetAmount] = useState(1000000);
  const [progress, setProgress] = useState(0);
  const [referrerFromLink, setReferrerFromLink] = useState(false);
  const [referrerRewardBalance, setReferrerRewardBalance] = useState(0);

  const tokenAddress = "0xcDaDB1D9ae238dB553aB88A7c5356F4b518C76Cb";
  const presaleAddress = "0x163d00b4D08ac8085A6a9Ec187A5836734eAc3d0";

  useEffect(() => {
    if (connected) {
      fetchTokensSold();
    }
  }, [connected, web3]);

  useEffect(() => {
    if (connected) {
      fetchTokensSold();
      fetchReferrerReward();
    }
  }, [connected, web3]);
  

  useEffect(() => {
    const percentage = (tokensSold / targetAmount) * 100;
    setProgress(percentage);
  }, [tokensSold, targetAmount]);

  async function fetchTokensSold() {
    if (!connected || !web3) {
      return;
    }

    try {
      const presaleContract = new web3.eth.Contract(
        TokenPresale_ABI,
        presaleAddress
      );
      const soldInWei = await presaleContract.methods.getTokensSold().call();
      const sold = web3.utils.fromWei(soldInWei, 'ether');
      setTokensSold(sold);
    } catch (error) {
      console.error("获取已售出代币数量时发生错误：", error);
    }
  }

  async function buyTokens() {
    if (!connected || !web3) {
      alert("请先连接钱包");
      return;
    }

    try {
      const usdtContract = new web3.eth.Contract(IERC20_ABI, tokenAddress);
      const presaleContract = new web3.eth.Contract(
        TokenPresale_ABI,
        presaleAddress
      );

      const amountToApprove = web3.utils.toWei(usdtAmount.toString());
  console.log("开始调用approve方法");
  await usdtContract.methods
    .approve(presaleAddress, amountToApprove)
    .send({ from: account });
  console.log("approve方法调用成功");

  console.log("开始调用buyTokens方法");
  await presaleContract.methods
    .buyTokens(amountToApprove, referrerAddress)
    .send({ from: account });
  console.log("buyTokens方法调用成功");
  message.success("购买成功");
} catch (error) {
  console.error("购买代币时发生错误：", error);
  message.error("购买代币失败：" + error.message);
}
}

async function fetchReferrerReward() {
    if (!connected || !web3) {
      return;
    }
  
    try {
      const presaleContract = new web3.eth.Contract(
        TokenPresale_ABI,
        presaleAddress
      );
      const rewardBalance = await presaleContract.methods
        .getReferrerReward(account)
        .call();
      setReferrerRewardBalance(rewardBalance);
    } catch (error) {
      console.error("获取推荐奖励时发生错误：", error);
    }
  }
  

  function generateReferralLink(address) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/referral/${address}`;
  }
  
  

function copyToClipboard(text) {
const element = document.createElement("textarea");
element.value = text;
document.body.appendChild(element);
element.select();
document.execCommand("copy");
document.body.removeChild(element);
return true;
}

return (
    <><Content style={{ padding: "50px" }}>
        <div className="site-layout-content">
            {/* 主视觉Banner */}
            <Title level={2}>YUTU2.0 Token Prasale</Title>
            <Text>
                预售活动开始时间：
                {startTime && new Date(startTime * 1000).toLocaleString()}
            </Text>
            <Text>
                预售活动结束时间：
                {endTime && new Date(endTime * 1000).toLocaleString()}
            </Text>

            <Title level={4}>机制：买卖6% 营销1%，销毁1%，回流1%，分红3%</Title>

            {/* 代币预售区域 */}
            <Title level={3}>代币预售</Title>
            <Progress
                percent={progress}
                status="normal"
                showInfo={false}
                strokeLinecap="square" />
            <Text>
                已售出代币数量：{tokensSold} / {targetAmount}
            </Text>

            <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
                <Col span={12}>
                    <Title level={5}>代币价格</Title>
                    <Text>1 USDT = 1000 代币</Text>
                </Col>
                <Col span={12}>
                    <Form>
                        <Form.Item label="购买数量" name="buyAmount">
                            <Input
                                type="number"
                                value={usdtAmount}
                                min={10}
                                onChange={(e) => setUsdtAmount(e.target.value)}
                                placeholder="最小购买金额为 10 USDT" />
                        </Form.Item>
                        <Form.Item label="推荐人地址" name="referrerAddress">
                            <Tooltip
                                title={referrerFromLink
                                    ? "通过推荐链接进来自动填入"
                                    : ""}
                                visible={referrerFromLink}
                                placement="bottomLeft"
                                overlayStyle={{ top: "520px", right: "100px" }}

                            >
                                <Input
                                    value={referrerAddress}
                                    onChange={(e) => setReferrerAddress(e.target.value)}
                                    placeholder="输入推荐人地址（可选）"
                                    disabled={referrerFromLink} />
                            </Tooltip>
                        </Form.Item>

                        <Form.Item>
                            <Button onClick={buyTokens}>购买代币</Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            {connected && (
                <>
                    <Divider />
                    <Title level={3}>推荐奖励</Title>
                    <Text>
                        您的累积推荐奖励：
                        {referrerRewardBalance} USDT
                    </Text>
                </>
            )}
        </div>
        <Row>
            <Col span={12} offset={6}>
                {connected && (
                    <div>
                        <Title level={4}>您的推荐链接</Title>
                        <Input value={generateReferralLink(account)} disabled />
                        <Button
                            type="primary"
                            onClick={() => {
                                const copied = copyToClipboard(generateReferralLink(account));
                                if (copied) {
                                    message.success("链接已复制成功");
                                } else {
                                    message.error("链接复制失败，请手动复制");
                                }
                            } }
                        >
                            复制链接
                        </Button>
                        <Divider />
                    </div>
                )}
                {/*...其他已有的代码*/}
            </Col>
        </Row>
    </Content><Footer style={{ textAlign: "center" }}>Token Presale DApp ©2023</Footer></>

)
};

export default TokenPresaleComponent;