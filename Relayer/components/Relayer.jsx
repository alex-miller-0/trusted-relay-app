import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { FormControl, FormGroup, Button, Row, Col } from 'react-bootstrap';
// import { Promise } from 'bluebird';
import { Button, Divider, Dropdown, Icon, Input, Menu, Message, Segment } from 'semantic-ui-react';
import { relayer } from '../actions/index'
const leftPad = require('left-pad');
import { getUserBalance } from '../lib/metamask.js';
import { getNetworks } from '../lib/networks.js';
import { checkSubmitInput } from '../lib/errorChecks.js';

class RelayerComponent extends Component {
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
    this.props.dispatch({ type: 'UPDATE_DEPOSIT_AMOUNT', result: parseInt(data.value) })
  }

  updateToken(evt, data) {
    this.props.dispatch({ type: 'UPDATE_DEPOSIT_TOKEN', result: data.value })
    if (data.value.length == 42) {
      getUserBalance(data.value, web3, this.props.state)
      .then((balance) => {
        this.props.dispatch({ type: 'UPDATE_USER_BAL', result: balance })
      })
    }
  }

  updateDestinationNetwork(evt, data) {
    this.props.dispatch({ type: 'UPDATE_DESTINATION_ID', result: data.value })
  }

  renderCurrentNetwork() {
    const { state } = this.props;
    if (state.web3_provider != null) {
      return (
        <Segment raised>
          <b>{state.currentNetwork.name}</b> (http://mainnet.infura.io)
        </Segment>
      );
    } else {
      return (
        <Message icon>
          <Icon name='circle notched' loading />
          <Message.Content>
            <Message.Header>
              Please Wait
            </Message.Header>
            Loading your network.
          </Message.Content>
        </Message>
      );
    }
  }

  renderDestinations() {
    const { state } = this.props;
    if (state.destinations.length === 0) {

    }
  }

  renderBalance() {
    const { state } = this.props;
    if (state.userBal) {
      return (<p>Current balance: <b>{state.userBal}</b></p>);
    } else {
      return;
    }
  }

  submit() {
    let { state } = this.props;
    let req = {
      amount: state.deposit_amount,
      token: state.deposit_token,
    }
    checkSubmitInput(req, state)
    .then((result) => {
      console.log('got result', result);
    })
    .catch((err) => {
      console.log('got error', err);
    })
  }

  render() {
    const { state } = this.props;
    return (
      <div>
        <div className="container">
          <h1>Trusted Relay</h1>
          Would you like to move your assets off chain to pay lower fees? Now you can. Deposit your tokens to the Gateway contract and a relayer will do the rest. Once the tokens are on the new network, you can use them as normal and withdraw them to the original network any time you want.
          <Divider/>
          <h3>Choose Destination Network</h3>
          <p>Pick a network to move your tokens to. They will be deposited in the Gateway on your current network and cannot be moved until you withdraw them.</p>
          <br/>
          <p><b>You are currently on network:</b></p>
          {this.renderCurrentNetwork()}
          <Divider/>
          <p><b>Destination network:</b></p>
          <Dropdown
            placeholder='Grid+ Network'
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
          <Button primary onClick={this.submit.bind(this)}>
            Move Tokens
          </Button>
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

const Relayer = connect(mapStoreToProps)(RelayerComponent);

export default Relayer;
