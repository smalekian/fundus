import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Col, Row } from 'antd'

import { Button, Input } from 'antd'


export default function Home() {
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  function search() {
    navigate(`/campaigns/${address.target.value}`)

  }

  const style = { padding: '8px 8px' };
  return (
    <>
      <Row style={style}>
        <Col style={style}>
          <h1>Crowdfunding App</h1>
        </Col>
      </Row>
      <Row style={style}>
        <Col style={style} span={6}>
          <Input
            autoFocus
            style={style}
            color='teal'
            placeholder='Contract address'
            onInput={setAddress}
          />
        </Col>
      </Row >
      <Row style={style}>
        <Col style={style} span={6}>
          <Button type="primary" onClick={search}>Submit</Button>
        </Col>
      </Row >

    </>
  )
}