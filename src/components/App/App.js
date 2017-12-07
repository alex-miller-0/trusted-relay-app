import React, { Component } from 'react';
import { dependencies, devDependencies } from '../../../package.json';
import { Button, Divider, Dropdown, Icon, Input, Menu, Message, Segment } from 'semantic-ui-react';
const deps = Object.assign({}, dependencies, devDependencies);

class App extends Component {

  chooseGridPlus() {
    console.log('chosen grid+')
  }

  updateDepositAmount(evt, data) {
    console.log('deposit amount', data.value)
  }

  loadTokenBalances() {
    console.log('loading token balances')
  }

  loadingMessage() {
    return (
      <Message icon>
        <Icon name='circle notched' loading />
        <Message.Content>
          <Message.Header>
            Please Wait
          </Message.Header>
        Loading your token balances.
        </Message.Content>
      </Message>
    )
  }

  render() {
    const tokens = [
      {
        text: 'Token A',
        value: 'Token A',
      }
    ];
    const loading = this.loadingMessage();
    return (
      <div>
        <div class="container">
          <h1>Trusted Relay</h1>
          Would you like to move your assets off chain to pay lower fees? Now you can. Deposit your tokens to the Gateway contract and a relayer will do the rest. Once the tokens are on the new network, you can use them as normal and withdraw them to the original network any time you want.
          <Divider/>
          <h3>Choose Destination Network</h3>
          <p>Pick a network to move your tokens to. They will be deposited in the Gateway on your current network and cannot be moved until you withdraw them.</p>
          <br/>
          <p><b>You are currently on network:</b></p>
          <Segment raised>
            <b>Mainnet</b> (http://mainnet.infura.io)
          </Segment>
          <Divider/>
          <p><b>Destination network:</b></p>
          <Segment raise>
            <b>Grid+ Network</b> (http://gateway.gridplus.io)
          </Segment>
          <Divider/>
          <h3>Deposit Tokens</h3>
          <p>Choose an ERC20 token and an amount to move. Once you make the deposit, a relayer will send your tokens to your desired network (destination network).</p>
          <br/>
          {loading}
          <p><b>Choose token to move:</b></p>
          <Button onClick={this.loadTokenBalances.bind(this)}>
            Load token balances
          </Button>
          <br/><br/>
          <Dropdown placeholder='Token' fluid selection options={tokens} />
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
}

export default App;
