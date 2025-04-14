import React, { useState } from 'react'
import { Button, Input, Space } from 'antd'
import { getWeb3 } from '../ethereum/utils'

export default function ContributeInput(props) {
  const { campaignFinished, contractAddress, currentAccount } = props;

  const web3 = getWeb3()

  const [contributionAmount, setContributionAmount] = useState('')

  async function contribute(event) {
    const amount = web3.utils.toWei(contributionAmount, 'ether')

    const gasEstimate = await web3.eth.estimateGas({
      value: amount,
      from: currentAccount,
      to: contractAddress
    })

    await web3.eth.sendTransaction({
      from: currentAccount,
      to: contractAddress,
      value: amount,
      gas: gasEstimate
    }).once('transactionHash', (hash) => {
      console.log('Transaction hash received', hash)
    }).once('receipt', (receipt) => {
      console.log('Transaction receipt received', receipt)
    }).on('confirmation', (confNumber, receipt) => {
      console.log('Confirmation', confNumber)
      // for now, refresh page to see updated state of contract
      // TODO: update campaign state without requiring refresh
      window.location.reload();
    })
  }

  if (campaignFinished) {
    return <Button disabled type='submit'>Campaign Finished</Button>
  }

  return <div>
    <Space.Compact style={{ width: '100%' }}>
      <Input placeholder="ETH" onChange={(e) => setContributionAmount(e.target.value)} />
      <Button type="primary" disabled={!isValidNumber(contributionAmount)} onClick={contribute}>Contribute</Button>
    </Space.Compact>
  </div>
}
function isValidNumber(amount) {
  return !isNaN(parseFloat(amount));
}