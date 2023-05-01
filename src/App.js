import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import Web3 from "web3";
import IERC20_ABI from "./abi/IERC20";
import TokenPresale_ABI from "./abi/TokenPresale.json";
import {
  Button,
  Input,
  Layout,
  Menu,
  Typography,
  Progress,
  Row,
  Col,
  Form,
  Divider,
  message,
  Tooltip,Space
} from "antd";
import { AppstoreOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const providerOptions = {
  // 在此处选择您想要支持的钱包提供商
};

const web3Modal = new Web3Modal({
  network: "binance-testnet",
  cacheProvider: true,
  providerOptions,
});

function App() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [usdtAmount, setUsdtAmount] = useState(10);
  const [referrerAddress, setReferrerAddress] = useState("");
  const [referrerRewardBalance, setReferrerRewardBalance] = useState(0);

  


  const [tokensSold, setTokensSold] = useState(0);
  const [targetAmount, setTargetAmount] = useState(1000000); // 您的目标数量，可以根据需要进行调整

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [progress, setProgress] = useState(0);

  const [referrerFromLink, setReferrerFromLink] = useState(false);

  const tokenAddress = "0xcDaDB1D9ae238dB553aB88A7c5356F4b518C76Cb";
  const presaleAddress = "0x163d00b4D08ac8085A6a9Ec187A5836734eAc3d0";

  useEffect(() => {
    if (!connected) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const referrerParam = urlSearchParams.get("referrer");
      if (referrerParam) {
        const referrer = referrerParam.split("?")[0]; // 添加这行代码
        setReferrerAddress(referrer);
        setReferrerFromLink(true);
      }
    }
    if (connected) {
      fetchTokensSold();
    }
    if (connected) {
      fetchStartTimeAndEndTime();
    }
    if (!connected) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const referrerParam = urlSearchParams.get("referrer");
      if (referrerParam) {
        setReferrerAddress(referrerParam);
        setReferrerFromLink(true);
      }
    }
    if (connected) {
      fetchReferrerRewardBalance();
    }
    if (connected) {
      fetchTokensSold();
    }
  }, [connected]);

  useEffect(() => {
    const percentage = (tokensSold / targetAmount) * 100;
    setProgress(percentage);
  }, [tokensSold, targetAmount]);

  const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    return result;
  };
  
  const generateReferralLink = (walletAddress) => {
    const baseUrl = window.location.href;
    const referralLink = `${baseUrl}?referrer=${walletAddress}`;
    return referralLink;
  };

  async function connectWallet() {
    try {
      const provider = await web3Modal.connect();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setConnected(true);
      } else {
        alert("请授权钱包访问");
      }
    } catch (error) {
      console.error("连接钱包时发生错误：", error);
    }
  }

  async function fetchStartTimeAndEndTime() {
    if (!connected || !web3) {
      return;
    }

    try {
      const presaleContract = new web3.eth.Contract(
        TokenPresale_ABI,
        presaleAddress
      );
      const start = await presaleContract.methods.startTime().call();
      const end = await presaleContract.methods.endTime().call();
      setStartTime(start);
      setEndTime(end);
    } catch (error) {
      console.error("获取开始和结束时间时发生错误：", error);
    }
  }

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
  
      const amountToApprove = web3.utils.toWei(usdtAmount);
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
      alert("购买成功");
    } catch (error) {
      console.error("购买代币时发生错误：", error);
    }
  }
  

  async function fetchReferrerRewardBalance() {
    if (!connected || !web3) {
      return;
    }
  
    try {
      const presaleContract = new web3.eth.Contract(
        TokenPresale_ABI,
        presaleAddress
      );
      const rewardsInWei = await presaleContract.methods
        .getReferrerRewards(account)
        .call();
      const rewardsInUsdt = web3.utils.fromWei(rewardsInWei, 'ether'); // 修改这行代码
      setReferrerRewardBalance(rewardsInUsdt);
    } catch (error) {
      console.error("获取推荐奖励余额时发生错误：", error);
    }
  }
  
  
  



  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1">首页</Menu.Item>
          <Menu.Item key="2">代币预售</Menu.Item>
          <Menu.Item key="3">生态</Menu.Item>
          <Menu.Item key="4">关于我们</Menu.Item>
          <Menu.Item key="5">常见问题</Menu.Item>
          <Menu.Item
            key="6"
            icon={<AppstoreOutlined />}
            onClick={connectWallet}
          >
            {connected
              ? account.slice(0, 6) + "..." + account.slice(-4)
              : "连接钱包"}
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "50px" }}>
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
            status="active"
            showInfo={false}
            strokeLinecap="square"
          />
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
                    placeholder="最小购买金额为 10 USDT"
                  />
                </Form.Item>
                <Form.Item label="推荐人地址" name="referrerAddress">
                  <Tooltip
                    title={
                      referrerFromLink
                        ? "通过推荐链接进来自动填入"
                        : ""
                    }
                    visible={referrerFromLink}
                    placement="bottomLeft"
                    overlayStyle={{ top: "520px", right: "100px" }}

                  >
                    <Input
                      value={referrerAddress}
                      onChange={(e) => setReferrerAddress(e.target.value)}
                      placeholder="输入推荐人地址（可选）"
                      disabled={referrerFromLink}
                    />
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
  }}
>
  复制链接
</Button>


                <Divider />
              </div>
            )}
            {/*...其他已有的代码*/}
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: "center" }}>Token Presale DApp ©2023</Footer>
    </Layout>
  );
}

export default App;
