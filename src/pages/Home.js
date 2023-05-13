import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

function Home() {
  return (
    <div>
      <Title level={2}>欢迎来到yutu社区</Title>
      <p>更多生态稍后就来</p>
    </div>
  );
}

export default Home;
