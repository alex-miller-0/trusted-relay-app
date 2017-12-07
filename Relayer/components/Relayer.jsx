import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { FormControl, FormGroup, Button, Row, Col } from 'react-bootstrap';
// import { Promise } from 'bluebird';
import { Button, Divider, Dropdown, Icon, Input, Menu, Message, Segment } from 'semantic-ui-react';
import { relayer } from '../actions/index'

class RelayerComponent extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    let { dispatch } = this.props;
    if (web3) {
      console.log('web3', web3)
      dispatch({ type: 'UPDATE_USER', result: web3.eth.accounts[0] })
      let provider = web3.version.network;
      if (typeof provider == 'number') {
        dispatch({ type: 'UPDATE_WEB3_PROVIDER', result: provider })
      }
    }
  }

  componentDidUpdate() {
    console.log('update')
  }

  updateDepositAmount(evt, data) {
    console.log('deposit', data);
  }

  updateToken(evt, data) {
    console.log('token to deposit', data);
  }

  renderCurrentNetwork() {
    let { state } = this.props;
    if (state.web3_provider != null) {
      return (
        <Segment raised>
          <b>{state.web3_provider}</b> (http://mainnet.infura.io)
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

  renderPage() {
    const destinations = [
      { text: 'Grid+ Network', value: '101' }
    ]

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
          <Dropdown placeholder='Destination Network' fluid selection options={destinations} />
          <Divider/>
          <h3>Deposit Tokens</h3>
          <p>Choose an ERC20 token and an amount to move. Once you make the deposit, a relayer will send your tokens to your desired network (destination network).</p>
          <br/>
          <p><b>Choose token to move:</b></p>
          <Input placeholder='0x12...ef' onChange={this.updateToken.bind(this)} fluid/>
          <br/><br/>
          <p><b>Choose amount:</b></p>
          <Input placeholder='0.1' onChange={this.updateDepositAmount.bind(this)}/>
          <Divider/>
          <br/>
          <Button primary>
            Move Tokens
          </Button>
        </div>
      </div>
    );
  }

  render(){
    let { state } = this.props;
    console.log('state?', state);
    if (state.web3_provider == null) {
      return this.renderPage();
    } else {
      return (<p>{state.web3_provider}</p>);
    }
  }

}

const mapStoreToProps = (store) => {
  return {
    state: store.relayer
  };
}

const Relayer = connect(mapStoreToProps)(RelayerComponent);

export default Relayer;
