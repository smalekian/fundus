import React from 'react'
import { Card, Col, Row } from 'antd'

const style = { padding: '8px 8px', width: '65%' };

export default function FailedStateInput() {
  return <Row style={style}>
    <Col style={style}>
      <Card title="Failed" variant="borderless">
        <p>This failed.</p>
      </Card>
    </Col>
  </Row >
}
