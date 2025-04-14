import React from 'react'
import { Card, Col, Row } from 'antd'

const style = { padding: '8px 8px', width: '65%' };

export default function SucceededStateInput() {
  return <Row style={style}>
    <Col style={style}>
      <Card title="Success" variant="borderless">
        <p>This succeeded!</p>
      </Card>
    </Col>
  </Row >
}
