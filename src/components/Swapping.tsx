import { BrowserNode } from '@connext/vector-browser-node';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { Button, Timeline, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as connext from '../services/connext';
import { formatTokenAmount } from '../services/utils';
import { getChainById, getChainByKey } from '../types/lists';
import { CrossAction, DepositAction, emptyExecution, Execution, ParaswapAction, Process, SwapAction, SwapEstimate, TranferStep, WithdrawAction } from '../types/server';
import StateChannelBalances from './StateChannelBalances';
import ConnectButton from './web3/ConnectButton';
import { getAllowance, setAllowance, transfer } from '../services/paraswap';
import {oneInch} from '../services/1Inch'

interface SwappingProps {
  route: Array<TranferStep>,
  updateRoute: Function,
}

const ADMIN_MODE = false

const Swapping = ({ route, updateRoute }: SwappingProps) => {
  // Connext
  const [node, setNode] = useState<BrowserNode>(connext.getNode())
  const [loggingIn, setLoggingIn] = useState<boolean>(false)
  const [isSwapping, setIsSwapping] = useState<boolean>(false)
  const [swapDone, setSwapDone] = useState<boolean>(false)

  const initializeConnext = async () => {
    setLoggingIn(true)
    try {
      const _node = await connext.initNode()
      setNode(_node)
    } catch (e) {
      console.log('Initiation error', { e })
    } finally {
      setLoggingIn(false)
    }
  }

  // Wallet
  const web3 = useWeb3React<Web3Provider>()

  // Paraswap
  const executeParaswap = async (chainId: number, signer: JsonRpcSigner, srcToken: string, destToken: string, srcAmount: number, srcAddress: string, destAddress: string, updateStatus?: Function, initialStatus?: Execution) => {
    // setup
    const status = initialStatus || JSON.parse(JSON.stringify(emptyExecution))
    const update = updateStatus || console.log
    update(status)

    // Ask user to set allowance
    // -> set status
    status.status = 'PENDING'
    const allowanceProcess : Process = {
      startedAt: Date.now(),
      message: 'Set Allowance',
      status: 'PENDING',
    }
    status.process.push(allowanceProcess)
    update(status)

    // -> check allowance
    try {
      const allowance1 = await getAllowance(chainId, srcAddress, srcToken)
      // -> set allowance
      if (allowance1 < srcAmount) {
        await setAllowance(chainId, srcAddress, srcToken, srcAmount)
      }
    } catch (e) {
      // -> set status
      status.status = 'FAILED'
      allowanceProcess.failedAt = Date.now()
      allowanceProcess.status = 'FAILED'
      update(status)
      throw e
    }

    // -> set status
    allowanceProcess.doneAt = Date.now()
    allowanceProcess.status = 'DONE'
    update(status)


    // Swap via Paraswap
    // -> set status
    status.status = 'PENDING'
    const swapProcess : Process = {
      startedAt: Date.now(),
      message: 'Swap via Paraswap',
      status: 'PENDING',
    }
    status.process.push(swapProcess)
    update(status)

    // -> swapping
    let tx
    try {
      tx = await transfer(signer, chainId, srcAddress, srcToken, destToken, srcAmount, destAddress)
    } catch (e) {
      // -> set status
      status.status = 'FAILED'
      swapProcess.failedAt = Date.now()
      swapProcess.status = 'FAILED'
      update(status)
      throw e
    }

    // -> set status
    swapProcess.doneAt = Date.now()
    swapProcess.status = 'DONE'
    update(status)


    // Wait for transaction
    // -> set status
    status.status = 'PENDING'
    const waitingProcess : Process = {
      startedAt: Date.now(),
      message: 'Wait for Transaction',
      status: 'PENDING',
      transaction: tx.hash,
    }
    status.process.push(waitingProcess)
    update(status)

    // -> waiting
    try {
      await tx.wait()
    } catch (e) {
      // -> set status
      status.status = 'FAILED'
      waitingProcess.failedAt = Date.now()
      waitingProcess.status = 'FAILED'
      update(status)
      throw e
    }

    // -> set status
    waitingProcess.doneAt = Date.now()
    waitingProcess.status = 'DONE'
    update(status)

    if (srcAddress !== destAddress) {
      // Reconcile Deposit
      // -> set status
      status.status = 'PENDING'
      const reconcileProcess : Process = {
        startedAt: Date.now(),
        message: 'Claim Transfer',
        status: 'PENDING',
        transaction: tx.hash,
      }
      status.process.push(reconcileProcess)
      update(status)

      // -> reconciling
      await connext.reconcileDeposit(node, chainId, destToken)

      // -> set status
      reconcileProcess.doneAt = Date.now()
      reconcileProcess.status = 'DONE'
      update(status)
    }

    // -> set status
    status.status = 'DONE'
    update(status)

    // DONE
    return status
  }

  // 1Inch
  const executeOneInchSwap = async (chainId: number, signer: JsonRpcSigner, srcToken: string, destToken: string, srcAmount: number, srcAddress: string, destAddress: string, updateStatus?: Function, initialStatus?: Execution) => {
    // setup
    const status = initialStatus || JSON.parse(JSON.stringify(emptyExecution))
    const update = updateStatus || console.log
    update(status)

    // Ask user to set allowance
    // -> set status
    status.status = 'PENDING'
    const allowanceProcess : Process = {
      startedAt: Date.now(),
      message: 'Set Allowance',
      status: 'PENDING',
    }
    status.process.push(allowanceProcess)
    update(status)

    // -> check allowance
    try {
      const allowance = await oneInch.getSignerForChain(chainId, srcAmount, srcToken, (web3.library as any).getSigner() as JsonRpcSigner)
      // -> set allowance
      // if (allowance1 < srcAmount) {
      //   await setAllowance(chainId, srcAddress, srcToken, srcAmount)
      // }
    } catch (e) {
      // -> set status
      status.status = 'FAILED'
      allowanceProcess.failedAt = Date.now()
      allowanceProcess.status = 'FAILED'
      update(status)
      throw e
    }

    // -> set status
    allowanceProcess.doneAt = Date.now()
    allowanceProcess.status = 'DONE'
    update(status)


    // Swap via Paraswap
    // -> set status
    status.status = 'PENDING'
    const swapProcess : Process = {
      startedAt: Date.now(),
      message: 'Swap via 1Inch',
      status: 'PENDING',
    }
    status.process.push(swapProcess)
    update(status)

    // -> swapping
    let tx
    try {
      tx = await oneInch.transfer((web3.library as any).getSigner() as JsonRpcSigner, chainId, srcToken, destToken, srcAmount, destAddress)
    } catch (e) {
      // -> set status
      status.status = 'FAILED'
      swapProcess.failedAt = Date.now()
      swapProcess.status = 'FAILED'
      update(status)
      throw e
    }

    // -> set status
    swapProcess.doneAt = Date.now()
    swapProcess.status = 'DONE'
    update(status)


    // Wait for transaction
    // -> set status
    status.status = 'PENDING'
    const waitingProcess : Process = {
      startedAt: Date.now(),
      message: 'Wait for Transaction',
      status: 'PENDING',
      transaction: tx.hash,
    }
    status.process.push(waitingProcess)
    update(status)

    // -> waiting
    try {
      await tx.wait()
    } catch (e) {
      // -> set status
      status.status = 'FAILED'
      waitingProcess.failedAt = Date.now()
      waitingProcess.status = 'FAILED'
      update(status)
      throw e
    }

    // -> set status
    waitingProcess.doneAt = Date.now()
    waitingProcess.status = 'DONE'
    update(status)

    if (srcAddress !== destAddress) {
      // Reconcile Deposit
      // -> set status
      status.status = 'PENDING'
      const reconcileProcess : Process = {
        startedAt: Date.now(),
        message: 'Claim Transfer',
        status: 'PENDING',
        transaction: tx.hash,
      }
      status.process.push(reconcileProcess)
      update(status)

      // -> reconciling
      await connext.reconcileDeposit(node, chainId, destToken)

      // -> set status
      reconcileProcess.doneAt = Date.now()
      reconcileProcess.status = 'DONE'
      update(status)
    }

    // -> set status
    status.status = 'DONE'
    update(status)

    // DONE
    return status
  }

  // Swap
  const updateStatus = (step: TranferStep, status: Execution) => {
    console.log('STATUS_CHANGE:', status)
    step.execution = status

    updateRoute(route)
  }

  const triggerDeposit = (step: TranferStep) => {
    if (!node || !web3.library) return
    const depositAction = step.action as DepositAction

    return connext.triggerDeposit(node, web3.library.getSigner(), depositAction.chainId, depositAction.token.id, depositAction.amount, (status: Execution) => updateStatus(step, status))
  }

  const triggerSwap = (step: TranferStep) => {
    if (!node) return
    const swapAction = step.action as SwapAction
    const swapEstimate = step.estimate as SwapEstimate
    const chainId = getChainByKey(swapAction.chainKey).id // will be replaced by swapAction.chainId

    return connext.triggerSwap(node, chainId, swapEstimate.path, swapAction.fromToken.id, swapAction.toToken.id, swapAction.fromAmount, (status: Execution) => updateStatus(step, status))
  }

  const triggerParaswap = async (step: TranferStep) => {
    if (!node || !web3.account || !web3.library) return
    const swapAction = step.action as ParaswapAction
    const chainId = getChainByKey(swapAction.chainKey).id // will be replaced by swapAction.chainId
    const fromAddress = web3.account
    const toAddress = swapAction.target === 'wallet' ? fromAddress : await connext.getChannelAddress(node, chainId)

    return executeParaswap(chainId, web3.library.getSigner(), swapAction.fromToken.id, swapAction.toToken.id, swapAction.fromAmount, fromAddress, toAddress, (status: Execution) => updateStatus(step, status))
  }

  const triggerOneIchSwap = async (step: TranferStep) => {
    if (!node || !web3.account || !web3.library) return
    const swapAction = step.action as ParaswapAction
    const chainId = getChainByKey(swapAction.chainKey).id // will be replaced by swapAction.chainId
    const fromAddress = web3.account
    const toAddress = swapAction.target === 'wallet' ? fromAddress : await connext.getChannelAddress(node, chainId)

    return executeOneInchSwap(chainId, web3.library.getSigner(), swapAction.fromToken.id, swapAction.toToken.id, swapAction.fromAmount, fromAddress, toAddress, (status: Execution) => updateStatus(step, status))
  }

  const triggerTransfer = (step: TranferStep) => {
    if (!node) return
    const crossAction = step.action as CrossAction
    const fromChainId = getChainByKey(crossAction.chainKey).id // will be replaced by crossAction.chainId
    const toChainId = getChainByKey(crossAction.toChainKey).id // will be replaced by crossAction.toChainId

    return connext.triggerTransfer(node, fromChainId, toChainId, crossAction.fromToken.id, crossAction.toToken.id, crossAction.amount, (status: Execution) => updateStatus(step, status))
  }

  const triggerWithdraw = (step: TranferStep) => {
    if (!node || !web3.account) return
    const withdrawAction = step.action as WithdrawAction
    const chainId = getChainByKey(withdrawAction.chainKey).id // will be replaced by withdrawAction.chainId
    const recipient = withdrawAction.recipient ?? web3.account

    return connext.triggerWithdraw(node, chainId, recipient, withdrawAction.token.id, withdrawAction.amount, (status: Execution) => updateStatus(step, status))
  }

  // TODO: move in own component
  const switchChain = async (chainId: number) => {
    if (web3.chainId === route[0].action.chainId) return // already on right chain

    const ethereum = (window as any).ethereum
    if (typeof ethereum === 'undefined') return

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: getChainById(chainId).metamask?.chainId }],
      })
    } catch (error) {
      console.error(error)
      if (error.code === 4902) {
        addChain(chainId)
      }
    }
  }
  // TODO: move in own component
  const addChain = async (chainId: number) => {
    const ethereum = (window as any).ethereum
    if (typeof ethereum === 'undefined') return

    const params = getChainById(chainId).metamask
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [params],
      })
    } catch (error) {
      console.error(`Error adding chain ${chainId}: ${error.message}`)
    }
  }

  let activeButton = null

  const parseWalletSteps = () => {
    const isDone = !!web3.account
    const isActive = !isDone

    const button = <ConnectButton />
    if (isActive) {
      activeButton = button
    }

    const color = isDone ? 'green' : 'blue'
    return [
      <Timeline.Item key="wallet_left" color={color}>
        <h4 style={{ marginBottom: 0 }}>
          Connect Wallet on {route[0].action.chainKey}
        </h4>
      </Timeline.Item>,
      <Timeline.Item key="wallet_right" color={color}>
        {!web3.account ?
          button
          :
          <Typography.Text type="success">
            Connected with {web3.account.substr(0, 4)}...

          </Typography.Text>
        }
      </Timeline.Item>,
    ]
  }

  const parseChainSteps = () => {
    const isDone = web3.chainId === route[0].action.chainId
    const isActive = !isDone && web3.account

    const button = <Button type="primary" disabled={!web3.account} onClick={() => switchChain(route[0].action.chainId)}>switch chain to {route[0].action.chainId}</Button>
    if (isActive) {
      activeButton = button
    }

    const color = isDone ? 'green' : (isActive ? 'blue' : 'gray')
    return [
      <Timeline.Item key="chain_left" color={color}>
        <h4 style={{ marginBottom: 0 }}>
          Switch to {route[0].action.chainKey}
        </h4>
      </Timeline.Item>,
      <Timeline.Item key="chain_right" color={color}>
        {web3.chainId !== route[0].action.chainId ?
          button
          :
          <Typography.Text type="success">
            On {route[0].action.chainKey} chain
          </Typography.Text>
        }
      </Timeline.Item>,
    ]
  }

  const parseConnextSteps = () => {
    const isDone = !!node
    const isActive = !isDone && web3.chainId === route[0].action.chainId

    const button = <Button type="primary" disabled={!isActive} onClick={() => initializeConnext()}>Login to Connext</Button>
    if (isActive) {
      activeButton = button
    }

    const color = isDone ? 'green' : (isActive ? 'blue' : 'gray')
    return [
      <Timeline.Item key="connext_left" color={color}>
        <h4 style={{ marginBottom: 0 }}>
          Login to Connext
        </h4>
      </Timeline.Item>,
      <Timeline.Item key="connext_right" color={color}>
        {!node && !loggingIn && button}
        {!node && loggingIn &&
          <Typography.Text className="flashing">
            In Progress
          </Typography.Text>
        }
        {node &&
          <Typography.Text type="success">
            Login successful
          </Typography.Text>
        }
      </Timeline.Item>,
    ]
  }

  const parseExecution = (execution?: Execution) => {
    if (!execution) {
      return []
    }

    return execution.process.map((process, index) => {
      return (
        <p key={index}>
          <Typography.Text
            type={process.status === 'DONE' ? 'success' : (process.status === 'FAILED' ? 'danger' : undefined)}
            className={process.status === 'PENDING' ? 'flashing' : undefined}
          >
            {process.message}
          </Typography.Text>
        </p>
      )
    })
  }

  const startSwapButton = <Button type="primary" onClick={() => startCrossChainSwap()}>Start Cross Chain Swap</Button>

  const parseStepToTimeline = (step: TranferStep, index: number) => {
    const executionSteps = parseExecution(step.execution)
    const color = step.execution && step.execution.status === 'DONE' ? 'green' : (step.execution ? 'blue' : 'gray')
    const hasFailed = step.execution && step.execution.status === 'FAILED'

    switch (step.action.type) {
      case 'deposit': {
        const triggerButton = <Button type="primary" disabled={!node || !web3.library || web3.chainId !== route[0].action.chainId} onClick={() => triggerStep(step)}>trigger Deposit</Button>
        return [
          <Timeline.Item key={index + '_left'} color={color}>
            <h4>Deposit</h4>
            <span>{formatTokenAmount(step.action.token, step.estimate?.fromAmount)} from {web3.account ? web3.account.substr(0, 4) : '0x'}...</span>
          </Timeline.Item>,
          <Timeline.Item key={index + '_right'} color={color}>
            {!step.execution && ADMIN_MODE ? triggerButton : executionSteps}
            {hasFailed ? triggerButton : undefined}
          </Timeline.Item>,
        ]
      }

      case 'swap': {
        const triggerButton = <Button type="primary" disabled={!node} onClick={() => triggerStep(step)} >trigger Swap</Button>
        return [
          <Timeline.Item key={index + '_left'} color={color}>
            <h4>Swap</h4>
            <span>{formatTokenAmount(step.action.fromToken, step.estimate?.fromAmount)} for {formatTokenAmount(step.action.toToken, step.estimate?.toAmount)} on {step.action.chainKey}</span>
          </Timeline.Item>,
          <Timeline.Item key={index + '_right'} color={color}>
            {!step.execution && ADMIN_MODE ? triggerButton : executionSteps}
            {hasFailed ? triggerButton : undefined}
          </Timeline.Item>,
        ]
      }

      case 'paraswap': {
        const triggerButton = <Button type="primary" disabled={!node} onClick={() => triggerParaswap(step)} >trigger Swap</Button>
        return [
          <Timeline.Item key={index + '_left'} color={color}>
            <h4>Swap{step.action.target === 'channel' ? ' and Deposit' : ''}</h4>
            <span>{formatTokenAmount(step.action.fromToken, step.estimate?.fromAmount)} for {formatTokenAmount(step.action.toToken, step.estimate?.toAmount)} via Paraswap</span>
          </Timeline.Item>,
          <Timeline.Item key={index + '_right'} color={color}>
            {!step.execution && ADMIN_MODE ? triggerButton : executionSteps}
            {hasFailed ? triggerButton : undefined}
          </Timeline.Item>,
        ]
      }

      case '1inch': {
        const triggerButton = <Button type="primary" disabled={!node} onClick={() => triggerOneIchSwap(step)} >trigger Swap</Button>
        return [
          <Timeline.Item key={index + '_left'} color={color}>
            <h4>Swap{step.action.target === 'channel' ? ' and Deposit' : ''}</h4>
            <span>{formatTokenAmount(step.action.fromToken, step.estimate?.fromAmount)} for {formatTokenAmount(step.action.toToken, step.estimate?.toAmount)} via 1Inch</span>
          </Timeline.Item>,
          <Timeline.Item key={index + '_right'} color={color}>
            {!step.execution && ADMIN_MODE ? triggerButton : executionSteps}
            {hasFailed ? triggerButton : undefined}
          </Timeline.Item>,
        ]
      }

      case 'cross': {
        const triggerButton = <Button type="primary" disabled={!node} onClick={() => triggerStep(step)} >trigger Transfer</Button>

        return [
          <Timeline.Item key={index + '_left'} color={color}>
            <h4>Transfer</h4>
            <span>{formatTokenAmount(step.action.fromToken, step.estimate?.fromAmount)} on {step.action.chainKey} to {formatTokenAmount(step.action.toToken, step.estimate?.toAmount)} on {step.action.toChainKey}</span>
          </Timeline.Item>,
          <Timeline.Item key={index + '_right'} color={color}>
            {!step.execution && ADMIN_MODE ? triggerButton : executionSteps}
            {hasFailed ? triggerButton : undefined}
          </Timeline.Item>,
        ]
      }

      case 'withdraw':
        const triggerButton = <Button type="primary" disabled={!node || !web3.account} onClick={() => triggerStep(step)}>trigger Withdraw</Button>
        return [
          <Timeline.Item key={index + '_left'} color={color}>
            <h4>Withdraw</h4>
            <span>{formatTokenAmount(step.action.token, step.estimate?.toAmount)} to {web3.account ? web3.account.substr(0, 4) : '0x'}...</span>
          </Timeline.Item>,
          <Timeline.Item key={index + '_right'} color={color}>
            {!step.execution && ADMIN_MODE ? triggerButton : executionSteps}
            {hasFailed ? triggerButton : undefined}
          </Timeline.Item>,
        ]

      default:
        console.warn('should never reach here')
    }
  }

  const triggerStep = async (step: TranferStep) => {
    let triggerFunc
    switch (step.action.type) {
      case 'deposit':
        triggerFunc = triggerDeposit
        break
      case 'swap':
        triggerFunc = triggerSwap
        break
      case 'paraswap':
        triggerFunc = triggerParaswap
        break
      case '1inch':
        triggerFunc = triggerOneIchSwap
        break
      case 'cross':
        triggerFunc = triggerTransfer
        break
      case 'withdraw':
        triggerFunc = triggerWithdraw
        break
      default:
        throw new Error('Invalid Step')
    }

    return triggerFunc(step)
  }

  const startCrossChainSwap = async () => {
    setIsSwapping(true)

    try {
      for (const step of route) {
          await triggerStep(step)
      }
    } catch (e) {
      console.error(e)
      return
    }

    setIsSwapping(false)
    setSwapDone(true)
  }

  if (!activeButton && !isSwapping && !swapDone) {
    activeButton = startSwapButton
  }
  if (swapDone) {
    activeButton = <Link to="/dashboard"><Button type="link" >DONE - check your balances in our Dashboard</Button></Link>
  }

  return (<>
    <Timeline mode="alternate">
      <Timeline.Item color="green"></Timeline.Item>

      {/* Wallet */}
      {parseWalletSteps()}

      {/* Chain */}
      {parseChainSteps()}

      {/* Connext */}
      {parseConnextSteps()}

      {/* Steps */}
      {route.map(parseStepToTimeline)}
    </Timeline>

    <div style={{ textAlign: 'center', transform: 'scale(1.5)', marginBottom: 20 }}>
      {activeButton}
    </div>
    {ADMIN_MODE && <StateChannelBalances node={node}></StateChannelBalances>}
  </>)
}

export default Swapping

