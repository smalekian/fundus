import React from 'react'
import { Card, Col, Row } from 'antd'
import Campaign from './Campaign'

const style = { padding: '8px 8px', width: '65%' };

export default function CampaignPage() {
  if (!isWalletPluginInstalled()) {
    return <>
      <Row style={style}>
        <Col style={style}>
          <Card title="Wallet plugin not available" variant="borderless">
            <p>Please install a wallet plugin to use this application.</p>
          </Card>
        </Col>
      </Row >
    </>
  }

  return <Campaign />
}

function isWalletPluginInstalled() {
  return !!window.ethereum
}