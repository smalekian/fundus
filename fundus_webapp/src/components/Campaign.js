import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Table, Row } from 'antd'

import { getContract, getWeb3 } from '../ethereum/utils';
import { useParams } from 'react-router-dom';

import ContributeInput from './ContributeInput'
import SucceededStateInput from './SucceededStateInput'
import FailedStateInput from './FailedStateInput'

const contractStates = {
  '0': "Ongoing",
  '1': "Failed",
  '2': "Succeeded",
}

const style = { padding: '8px 8px', width: '65%' };

export default function Campaign() {
  const web3 = useMemo(() => getWeb3(), [])
  const [currentAccount, setCurrentAccount] = useState(null)

  const [contractTable, setContractTable] = useState(
    [
      {
        key: '1',
        label: 'Target Amount',
        value: 0
      },
      {
        key: '2',
        label: 'Is Finished?',
        value: false
      },
      {
        key: '3',
        label: 'Deadline',
        value: new Date()
      },
      {
        key: '4',
        label: 'I am Beneficiary?',
        value: true
      },
      {
        key: '5',
        label: 'Collected amount',
        value: 0
      },
      {
        key: '6',
        label: 'Contributed amount',
        value: 0
      },
      {
        key: '7',
        label: 'Contract State',
        value: contractStates['0']
      },
    ]
  )
  const [contractInfo, setContractInfo] = useState({
    name: 'N/A',
    targetAmount: 0,
    totalCollected: 0,
    campaignFinished: false,
    deadline: new Date(),
    isBeneficiary: true,
    collectedAmount: 10,
    contributedAmount: 10,
    state: '0',
  })

  const { address } = useParams();

  const columns = [
    {
      title: 'Name',
      key: 'label',
      dataIndex: 'label',
    },
    {
      title: 'Value',
      key: 'value',
      dataIndex: 'value',
      render: val => <p>{val.toString()}</p>
    }
  ]

  async function connectWallet() {
    const accounts = await web3.eth.requestAccounts()
    setCurrentAccount(accounts[0])
  }

  async function getCurrentConnectedAccount() {
    const accounts = await web3.eth.getAccounts()
    setCurrentAccount(accounts[0])
  }

  useEffect(() => {
    getCurrentConnectedAccount()
  })

  useEffect(() => {
    async function getCampaign(address) {
      if (!currentAccount) return;

      const contract = await getContract(web3, address, currentAccount)
      contract.defaultCommon = { customChain: { name: 'local', chainId: contract.options.chain, networkId: 11155111 }, baseChain: 'mainnet', hardfork: 'petersburg' };

      try {
        const name = await contract.methods.name().call({ from: currentAccount })
        const targetAmount = await contract.methods.targetAmount().call()
        const totalCollected = await contract.methods.totalCollected().call()
        const beforeDeadline = await contract.methods.beforeDeadline().call()
        const beneficiary = await contract.methods.beneficiary().call()
        const deadlineSeconds = await contract.methods.fundingDeadline().call()
        const contributedAmount = await contract.methods.amounts(currentAccount).call()
        const state = await contract.methods.state().call()

        const deadlineDate = new Date(0)
        deadlineDate.setUTCSeconds(deadlineSeconds)

        const contractInfo = {
          name: name,
          targetAmount: targetAmount,
          totalCollected: totalCollected,
          campaignFinished: !beforeDeadline,
          deadline: deadlineDate,
          isBeneficiary: beneficiary.toLowerCase() === currentAccount.toLowerCase(),
          contributedAmount: contributedAmount,
          state: state
        };
        setContractInfo(contractInfo)

        const table = populateContractTable(contractInfo);

        setContractTable(table);

      } catch (e) {
        setContractInfo(null)
      }
    }
    getCampaign(address)
  }, [web3, address, currentAccount])

  window.ethereum.on('accountsChanged', function (accounts) {
    if (accounts) {
      setCurrentAccount(accounts[0])
    }
  })

  if (!currentAccount) {
    return (
      <>
        <Row style={style}>
          <Col style={style}>
            <Card title="Connect to Ethereum" variant="borderless">
              <p>You must connect an Ethereum wallet to use this app.</p>
              <Button type="primary" onClick={() => connectWallet()}>Connect Wallet</Button>
            </Card>
          </Col>
        </Row >
      </>
    )
  }

  if (!contractInfo) {
    return (
      <>
        <Row style={style}>
          <Col style={style}>
            <Card title="Failed to load campaign" variant="borderless">
              <p>Check if the campaign's contract is deployed and you are using the right network.</p>
            </Card>
          </Col>
        </Row >
      </>
    )
  }

  return <>
    <Row style={style}>
      <Col style={style}>
        <Card title={"Campaign: " + contractInfo.name} variant="borderless">
          <Table columns={columns} dataSource={contractTable} pagination={false} />
          {campaignInteractionSection(contractInfo, address, currentAccount)}
        </Card>
      </Col>
    </Row >
  </>
}

function campaignInteractionSection(contractInfo, address, currentAccount) {
  if (contractStates[contractInfo.state] === "Ongoing") {
    return <ContributeInput campaignFinished={contractInfo.campaignFinished} contractAddress={address} currentAccount={currentAccount} />
  } else if (contractStates[contractInfo.state] === "Succeeded") {
    return <SucceededStateInput isBeneficiary={contractInfo.isBeneficiary} />
  } else if (contractStates[contractInfo.state] === "Failed") {
    return <FailedStateInput contributedByCurrentAccount={contractInfo.contributedByCurrentAccount} />
  }
}

function populateContractTable(contractInfo) {
  return [
    {
      key: '1',
      label: 'Target Amount',
      value: contractInfo.targetAmount
    },
    {
      key: '2',
      label: 'Is Finished?',
      value: contractInfo.campaignFinished
    },
    {
      key: '3',
      label: 'Deadline',
      value: contractInfo.deadline
    },
    {
      key: '4',
      label: 'I am Beneficiary?',
      value: contractInfo.isBeneficiary
    },
    {
      key: '5',
      label: 'Collected amount',
      value: contractInfo.totalCollected
    },
    {
      key: '6',
      label: 'Contributed amount',
      value: contractInfo.contributedAmount
    },
    {
      key: '7',
      label: 'Contract State',
      value: contractStates[contractInfo.state]
    },
  ]
}