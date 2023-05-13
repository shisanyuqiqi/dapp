import React, { useState } from "react";
import { Button, Layout, Menu, Typography } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import TokenPresaleComponent from "./pages/TokenPresale";
import Web3Modal from "web3modal";
import Web3 from "web3";

import Home from "./pages/Home";
import NftBlindBox from "./pages/NftBlindBox";
import NftMarket from "./pages/NftMarket";
import NftStaking from "./pages/NftStaking";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

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
  const [current, setCurrent] = useState("home");

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

  const handleMenuClick = ({ key }) => {
    setCurrent(key);
  };

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[current]}
          onClick={handleMenuClick}
        >
          <Menu.Item key="home">首页</Menu.Item>
          <Menu.Item key="presale">代币预售</Menu.Item>
          <Menu.Item key="nftblindbox">NFT盲盒</Menu.Item>
          <Menu.Item key="market">NFT市场</Menu.Item>
          <Menu.Item key="staking">NFT质押</Menu.Item>

          <Menu.Item
            key="wallet"
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
          <Title level={2}>YUTU2.0 Token Presale</Title>


          {current === "home" && <Home />}
          {current === "presale" && (
            <TokenPresaleComponent
              connected={connected}
              account={account}
              web3={web3}
            />
          )}
          {connected && current === "nftblindbox" && (
            <NftBlindBox account={account} web3={web3} connected={connected}/>
          )}
          {current === "market" && <NftMarket account={account} web3={web3} connected={connected}/>}
          {current === "staking" && <NftStaking account={account} web3={web3} connected={connected}/>}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>Token Presale DApp ©2023</Footer>
    </Layout>
  );
}

export default App;
