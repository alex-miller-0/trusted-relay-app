import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { FormControl, FormGroup, Button, Row, Col } from 'react-bootstrap';
// import { Promise } from 'bluebird';
import { Button, Card, Divider, Dropdown, Icon, Input, Menu, Message, Popup, Segment } from 'semantic-ui-react';
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
import { checkSubmitInput } from '../lib/errorChecks.js';
import SuccessModal from './SuccessModal.jsx';
import Balances from './Balances.jsx';
import FaQuestionCircle from 'react-icons/lib/fa/question-circle';


class DepositComponent extends Component {
  constructor(props){
    super(props);
  }

  updateDepositAmount(evt, data) {
    const { state, dispatch } = this.props;
    const req = {
      amount: state.depositAmount,
      token: state.depositToken,
    }
    let amount = parseFloat(data.value);
    const lastChar = data.value[data.value.length - 1];
    if (lastChar === '.' || lastChar === '0') { amount = data.value; }
    dispatch({ type: 'UPDATE_DEPOSIT_AMOUNT', result: amount })
    dispatch({ type: 'EXCEEDS_BAL', result: parseFloat(data.value) > state.userBal });
    checkSubmitInput(req, state)
    .then((input) => {
      dispatch({ type: 'INPUT_CHECK', result: true });
    })
    .catch((err) => { console.log('got error', err); })
  }

  updateToken(evt, data) {
    const { state, dispatch } = this.props;
    const req = { amount: state.depositAmount, token: state.depositToken };
    const dataSplit = data.value.split('-');
    const token = dataSplit[0];
    const bal = dataSplit[1];
    const name = dataSplit[2];
    const sym = dataSplit[3];
    const currentToken = {
      addr: token,
      balance: parseFloat(bal),
      name: name,
      symbol: sym,
    };
    dispatch({ type: 'UPDATE_DEPOSIT_TOKEN', result: token });
    dispatch({ type: 'UPDATE_USER_BAL', result: parseFloat(bal) });
    dispatch({ type: 'UPDATE_CURRENT_TOKEN', result: currentToken });
    if (token.length == 42) {
      getAllowance(token, state.currentNetwork.value, web3)
      .then((allowance) => {
        dispatch({ type: 'ALLOWANCE', result: allowance });
        return getTokenDecimals(token, web3);
      })
      .then((decimals) => {
        dispatch({ type: 'DECIMALS', result: decimals });
        return checkSubmitInput(req, state)
      })
      .then((input) => {
        dispatch({ type: 'INPUT_CHECK', result: true });
      })
      .catch((err) => {
        console.log('Error updating token', err);
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
          {state.currentNetwork.text}
        </Segment>
      );
    } else {
      return this.renderWaiting('Please Wait', 'Loading your network.')
    }
  }

  submit() {
    let { state, dispatch } = this.props;
    let req = {
      amount: parseFloat(state.depositAmount),
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
    const { state, dispatch } = this.props;
    setAllowance(state, web3)
    .then((success) => {
      return getAllowance(state.depositToken, state.currentNetwork.value, web3);
    })
    .then((allowance) => {
      dispatch({ type: 'ALLOWANCE', result: -1 });
      // This may update immediately, but we'll probably have to sit on an
      // interval until the value updates.
      return getAllowanceUpdate(0, 0, state, web3)
    })
    .then((newAllowance) => {
      dispatch({ type: 'ALLOWANCE', result: newAllowance });
    })
    .catch((err) => { console.log('Error setting allowance', err); })
  }

  renderExceedsBal() {
    const { state } = this.props;
    if (state.exceedsBal) {
      return (
        <Message negative>
          <Message.Header>Insufficient Balance</Message.Header>
          <p>Warning: This amount exceeds your token balance.</p>
        </Message>
      );
    }
  }

  renderActionButton() {
    let { state } = this.props;
    // TODO Need BN
    let allowance = state.allowance / (10 ** state.decimals);
    let amount = state.depositAmount;
    let bal = state.userBal;
    if (state.input === false) {
      return;
    } else if (allowance === -1 || bal === -1) {
      return (
        <div>
          <br/><Divider/>
          <Button loading>
            Waiting
          </Button>
        </div>
      )
    } else if (allowance < parseFloat(amount)) {
      return (
        <div>
          <br/><Divider/>
          <Button primary onClick={this.allow.bind(this)} disabled={state.exceedsBal}>
            Step 1: Set Allowance
          </Button>
          <Popup
            trigger={<FaQuestionCircle/>}
            content="You will need to grant permission for the Gateway to move your tokens."
            basic
          />
          {this.renderExceedsBal()}
        </div>
      )
    } else {
      return (
        <div>
          <br/><Divider/>
          <Button primary onClick={this.submit.bind(this)} disabled={state.exceedsBal}>
            Step 2: Start Relay
          </Button>
          <Popup
            trigger={<FaQuestionCircle/>}
            content="You must deposit your tokens to the Gateway before the relayer can award you new tokens on the other chain. Don't worry - these tokens won't be moved from the Gateway."
            basic
          />
          {this.renderExceedsBal()}
        </div>
      )
    }
  }


  renderTokens() {
    let { balances, dispatch, state } = this.props;
    let myTokens = [];
    balances.balances.forEach((b) => {
      const tmp = {
        ...b,
        text: `${b.name}: ${b.balance} ${b.symbol}`,
        value: `${b.address}-${b.balance}-${b.name}-${b.symbol}`,
      };
      myTokens.push(tmp);
    })
    let defaultText;
    let defaultValue;
    if (state.currentToken) {
      const t = state.currentToken;
      defaultText = `${t.name}: ${t.balance} ${t.symbol}`;
      defaultValue = `${t.address}-${t.balance}-${t.name}-${t.symbol}`;
      if (!state.depositToken) {
        dispatch({ type: 'UPDATE_DEPOSIT_TOKEN', result: t.address });
      }
    }

    if (balances.balances.length == 0) {
      return (
        <Segment raised>
          <p>You have no token balances! Please go to the <b>Balances page</b> and add your tokens.</p>
        </Segment>
      )
    } else {
      return (
        <Dropdown
          placeholder='Choose token'
          fluid selection
          options={myTokens}
          text={defaultText}
          value={defaultValue}
          onChange={this.updateToken.bind(this)}
        />
      )
    }
  }

  renderDestination() {
    const { state } = this.props;
    let destination = { text: null, value: null, name: null };
    if (state.destinationId) {
      state.destinations.forEach((d) => {
        if (d.value == state.destinationId) {
          return destination = d;
        }
      })
    }
    return (
      <Dropdown
        placeholder='Choose Network'
        fluid selection
        text={destination.text}
        value={destination.value}
        options={state.destinations.length ? state.destinations : []}
        onChange={this.updateDestinationNetwork.bind(this)}
      />
    )
  }

  renderAmount() {
    const { balances, state } = this.props;
    if (balances.balances.length > 0) {
      return (
        <div>
          <p><b>Choose amount:</b></p>
          <Input
            placeholder='0.1234'
            value={state.depositAmount || ''}
            onChange={this.updateDepositAmount.bind(this)}
          />
        </div>
      );
    } else {
      return;
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
          <p><b>Destination network:</b>&nbsp;<Popup
              trigger={<FaQuestionCircle/>}
              content="This is the network to which your coins will be moved."
              basic
          /></p>
          {this.renderDestination()}
          <Divider/>
          <h3>Deposit Tokens</h3>
          <p>Choose an ERC20 token and an amount to move. Once you make the deposit, a relayer will send your tokens to your desired network (destination network).</p>
          <br/>
          <p><b>Choose token to move:</b>&nbsp;<Popup
              trigger={<FaQuestionCircle/>}
              content="You can load tokens by going to your balances and looking up a token address on this chain."
              basic
          /></p>
          {this.renderTokens()}
          <br/>
          <br/>
          {this.renderAmount()}
          {this.renderActionButton()}
        </div>
      </div>
    );
  }
}

const mapStoreToProps = (store) => {
  return {
    state: store.relayer,
    balances: store.balances,
  };
}

const Deposit = connect(mapStoreToProps)(DepositComponent);

export default Deposit;
