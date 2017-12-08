import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { FormControl, FormGroup, Button, Row, Col } from 'react-bootstrap';
// import { Promise } from 'bluebird';
import { Button, Divider, Dropdown, Icon, Input, Menu, Message, Segment } from 'semantic-ui-react';
import { relayer } from '../actions/index'
const leftPad = require('left-pad');
import {
  getAllowance,
  getAllowanceUpdate,
  getTokenDecimals,
  getUserBalance,
  getUserBalanceUpdate,
  setAllowance,
  makeDeposit
} from '../lib/metamask.js';
import { getNetworks } from '../lib/networks.js';
import { checkSubmitInput } from '../lib/errorChecks.js';
import SuccessModal from './SuccessModal.jsx';

class DepositComponent extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    let { dispatch } = this.props;
    const interval = setInterval(function() {
      const provider = web3.version.network;
      if (provider != null) {
        clearInterval(interval);
        dispatch({ type: 'UPDATE_USER', result: web3.eth.accounts[0] });
        dispatch({ type: 'UPDATE_WEB3_PROVIDER', result: provider });
        getNetworks(provider, (err, result) => {
          dispatch({ type: 'CURRENT_NETWORK', result: result.current });
          dispatch({ type: 'DESTINATION_NETWORKS', result: result.networks });
        })
      }
    }, 100);
  }

  updateDepositAmount(evt, data) {
    const { state, dispatch } = this.props;
    const req = {
      amount: state.depositAmount,
      token: state.depositToken,
    }
    dispatch({ type: 'UPDATE_DEPOSIT_AMOUNT', result: parseInt(data.value) })
    checkSubmitInput(req, state)
    .then((input) => {
      dispatch({ type: 'INPUT_CHECK', result: true });
      return getAllowance(state, web3);
    })
    .then((allowance) => {
      dispatch({ type: 'ALLOWANCE', result: allowance });
      return getTokenDecimals(state.depositToken, web3);
    })
    .then((decimals) => {
      dispatch({ type: 'DECIMALS', result: decimals });
    })
    .catch((err) => { console.log('got error', err); })
  }

  updateToken(evt, data) {
    const { state, dispatch } = this.props;
    const req = { amount: state.depositAmount, token: state.depositToken };
    dispatch({ type: 'UPDATE_DEPOSIT_TOKEN', result: data.value })
    if (data.value.length == 42) {
      getUserBalance(data.value, web3, this.props.state)
      .then((balance) => {
        dispatch({ type: 'UPDATE_USER_BAL', result: balance })
        return checkSubmitInput(req, state)
      })
      .then((input) => {
        dispatch({ type: 'INPUT_CHECK', result: true });
      })
    }
  }

  updateDestinationNetwork(evt, data) {
    this.props.dispatch({ type: 'UPDATE_DESTINATION_ID', result: data.value })
  }

  renderWaiting(header, msg) {
    return (
      <Message icon>
        <Icon name='circle notched' loading />
        <Message.Content>
          <Message.Header>
            {header}
          </Message.Header>
          {msg}
        </Message.Content>
      </Message>
    )
  }

  renderCurrentNetwork() {
    const { state } = this.props;
    if (state.web3Provider != null) {
      return (
        <Segment raised>
          <b>{state.currentNetwork.name}</b> (http://mainnet.infura.io)
        </Segment>
      );
    } else {
      return this.renderWaiting('Please Wait', 'Loading your network.')
    }
  }

  renderBalance() {
    const { state } = this.props;
    if (state.userBal && state.userBal != -1) {
      return (<p>Current balance: <b>{state.userBal}</b></p>);
    } else {
      return;
    }
  }

  submit() {
    let { state, dispatch } = this.props;
    let req = {
      amount: state.depositAmount,
      token: state.depositToken,
    }
    checkSubmitInput(req, state)
    .then(() => {
      dispatch({ type: 'INPUT_CHECK', result: true });
      return makeDeposit(state, web3)
    })
    .then((receipt) => {
      const bal = state.userBal;
      dispatch({ type: 'UPDATE_USER_BAL', result: -1 });
      return getUserBalanceUpdate(bal, bal, state, web3);
    })
    .then((newBalance) => {
      dispatch({ type: 'UPDATE_USER_BAL', result: newBalance });
    })
    .catch((err) => {
      console.log('got error', err);
    })
  }

  allow() {
    console.log('allow')
    const { state, dispatch } = this.props;
    setAllowance(state, web3)
    .then((success) => { return getAllowance(state, web3); })
    .then((allowance) => {
      dispatch({ type: 'ALLOWANCE', result: -1 });
      // This may update immediately, but we'll probably have to sit on an
      // interval until the value updates.
      return getAllowanceUpdate(allowance, allowance, state, web3)
    })
    .then((newAllowance) => {
      dispatch({ type: 'ALLOWANCE', result: newAllowance });
    })
    .catch((err) => { console.log('Error setting allowance', err); })
  }

  renderActionButton() {
    let { state } = this.props;
    // TODO Need BN
    let allowance = state.allowance / (10 ** state.decimals);
    console.log('allowance', allowance);
    let amount = state.depositAmount;
    let bal = state.userBal;
    if (state.input === false) {
      return;
    } else if (allowance === -1 || bal === -1) {
      return (
        <Button loading>
          Waiting
        </Button>
      )
    } else if (allowance < amount) {
      return (
        <Button primary onClick={this.allow.bind(this)}>
          Step 1: Allow Movement
        </Button>
      )
    } else {
      return (
        <Button primary onClick={this.submit.bind(this)}>
          Move Tokens
        </Button>
      )
    }
  }

  renderModal() {
    const { state } = this.props;
    state.modal = { active: true, title: 'test' }
    if (true) { return <SuccessModal/>}
  }

  render() {
    const { state } = this.props;
    return (
      <div style={{margin: 20}}>
        <div className="container">
          <h3>Choose Destination Network</h3>
          <p>Pick a network to move your tokens to. They will be deposited in the Gateway on your current network and cannot be moved until you withdraw them.</p>
          <br/>
          <p><b>You are currently on network:</b></p>
          {this.renderCurrentNetwork()}
          <Divider/>
          <p><b>Destination network:</b></p>
          <Dropdown
            placeholder='Choose Network'
            fluid selection
            options={state.destinations.length ? state.destinations : []}
            onChange={this.updateDestinationNetwork.bind(this)}
          />
          <Divider/>
          <h3>Deposit Tokens</h3>
          <p>Choose an ERC20 token and an amount to move. Once you make the deposit, a relayer will send your tokens to your desired network (destination network).</p>
          <br/>
          <p><b>Choose token to move:</b></p>
          <Input placeholder='0x12...ef' onChange={this.updateToken.bind(this)} fluid/>
          <br/>
          {this.renderBalance()}
          <br/>
          <p><b>Choose amount:</b></p>
          <Input placeholder='0.1' onChange={this.updateDepositAmount.bind(this)}/>
          <Divider/>
          <br/>
          {this.renderActionButton()}
        </div>
      </div>
    );
  }

}

const mapStoreToProps = (store) => {
  return {
    state: store.relayer
  };
}

const Deposit = connect(mapStoreToProps)(DepositComponent);

export default Deposit;
