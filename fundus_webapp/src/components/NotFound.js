import React from 'react'
import { Card, Col, Row } from 'antd'

const style = { padding: '8px 8px', width: '65%' };

export default function NotFound() {
  return <Row style={style}>
    <Col style={style}>
      <Card title="Campaign not found" variant="borderless">
        <p>Please try again.</p>
      </Card>
    </Col>
  </Row >
}
