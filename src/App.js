import React, { useState } from "react";
import {
  Button,
  Layout,
  Menu,
  Typography,
} from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import TokenPresaleComponent from './pages/TokenPresale';
import Web3Modal from "web3modal";
import Web3 from "web3";

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
          <Title level={2}>YUTU2.0 Token Presale</Title>

         
          <TokenPresaleComponent
            connected={connected}
            account={account}
            web3={web3}
          />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>Token Presale DApp ©2023</Footer>
    </Layout>
  );
}

export default App;
