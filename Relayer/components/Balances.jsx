import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Card, Divider, Icon, Input, Popup, Segment, Table } from 'semantic-ui-react';
import {
  getTokenData,
} from '../lib/metamask.js';
import { getTotalDeposited, getTotalWithdrawn, findTokens, getTokens } from '../lib/relayEvents.js';
import { loadLocalStore } from '../lib/util.js';
import FaQuestionCircle from 'react-icons/lib/fa/question-circle';

const decoder = require('ethereumjs-abi');

class BalancesComponent extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const interval = setInterval(() => {
      const { deposit  } = this.props;
      if (deposit.currentNetwork && deposit.currentNetwork.value && web3) {
        clearInterval(interval);
        // Balances are stored in local store in a JSON object indexed by
        // the network id (remember this is the address of the Gateway contract)
        const local = loadLocalStore(deposit.currentNetwork.value);
        dispatch({ type: 'LOCAL_STORE', result: local })
        this.updateBalances();
      }
    }, 100);
  }

  updateToken(evt, data) {
    const { state, dispatch } = this.props;
    dispatch({ type: 'SEARCH_TOKEN', result: data.value })
    if (data.value.length == 42) {
      getTokenData(data.value, web3)
      .then((data) => {
        dispatch({ type: 'BAL_SEARCH_TOKEN', result: data.balance });
        dispatch({ type: 'NAME_SEARCH_TOKEN', result: data.name });
        dispatch({ type: 'SYMBOL_SEARCH_TOKEN', result: data.symbol });
      })
      .catch((err) => { console.log('Error finding token', err); })
    }
  }

  saveSearchToken() {
    const { state, dispatch, deposit } = this.props;
    let local = state.localStore;
    local[state.searchToken] = state.searchTokenBal;
    const toSave = JSON.stringify(local);
    localStorage.setItem(deposit.currentNetwork.value, toSave);
    this.updateBalances();
  }

  updateBalances() {
    const { state, dispatch, deposit } = this.props;
    let balances = [];
    let sortedBals = [];
    let tokenKeys = Object.keys(state.localStore);
    if (tokenKeys.length > 0) {
      getTokens(tokenKeys, web3.eth.accounts[0], deposit.contract, web3)
      .then((tokenData) => {
        dispatch({ type: 'BALANCES', result: tokenData })
      })
    } else {
      dispatch({ type: 'BALANCES', result: sortedBals })
    }
  }

  // Search for any tokens the user has deposited or had withdrawn on this
  // chain's gateway.
  loadTokens() {
    const { deposit, dispatch } = this.props;
    let tokens;
    localStorage.setItem(deposit.currentNetwork.value, JSON.stringify({}));
    let user = web3.eth.accounts[0];
    let local = loadLocalStore(deposit.currentNetwork.value);
    findTokens(user, deposit.contract, web3)
    .then((tokens) => {
      return getTokens(tokens, user, deposit.contract, web3)
    })
    .map((token) => {
      local[token.address] = token.balance;
      return;
    })
    .then(() => {
      const toSave = JSON.stringify(local);
      localStorage.setItem(deposit.currentNetwork.value, toSave);
      dispatch({ type: 'LOCAL_STORE', result: local })
      this.updateBalances();
    })
  }

  removeBalance(i, evt) {
    let { deposit, state } = this.props;
    delete state.localStore[i.address];
    localStorage.setItem(deposit.currentNetwork.value, state.localStore);
    this.updateBalances();
  }

  renderBalances() {
    const { state } = this.props;
    if (state.balances.length == 0) {
      return (<p>No balances</p>);
    } else {
      return (
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Symbol</Table.HeaderCell>
              <Table.HeaderCell>Usable Balance</Table.HeaderCell>
              <Table.HeaderCell>Deposited</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Remove</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {state.balances.map((item, i) => {
              if (item.name != "" && item.symbol != "" && !isNaN(item.decimals)
                && !isNaN(item.balance) && item.address && item.address != '0x0000000000000000000000000000000000000000') {
                return (
                  <Table.Row key={`row-${i}`}>
                    <Table.Cell>
                      {item.symbol}
                    </Table.Cell>
                    <Table.Cell>
                      {item.balance}
                    </Table.Cell>
                    <Table.Cell>
                      {item.deposited}
                    </Table.Cell>
                    <Table.Cell>
                      {item.address}
                    </Table.Cell>
                    <Table.Cell>
                      <Button onClick={this.removeBalance.bind(this, item)}>Remove</Button>
                    </Table.Cell>
                  </Table.Row>
                )
              } else {
                return;
              }
            })}
          </Table.Body>
        </Table>
      )
    }
  }

  renderAdd() {
    const { state } = this.props;
    if (state.searchTokenBal != null) {
      return (
        <Card>
          <Card.Content header={state.searchTokenName}/>
          <div style={{margin: 20}}>
            <p>Balance: <b>{state.searchTokenBal} {state.searchTokenSymbol}</b></p>
            <Button onClick={this.saveSearchToken.bind(this)}>Save</Button>
          </div>
        </Card>
      )
    } else {
      return;
    }
  }

  renderText() {
    const { deposit } = this.props;
    if (deposit.currentNetwork.text) {
      return (
        <Segment raised>Currently on network <b>{deposit.currentNetwork.text}</b></Segment>
      )
    } else {
      return;
    }
  }

  render() {
    let { deposit } = this.props;
    const text = deposit.currentNetwork.text;
    return (
      <div className="container" style={{margin: '20px'}}>
        <h2>Balances</h2>
        {this.renderText()}
        {this.renderBalances()}
        <Divider/>
        <h2>Load Tokens</h2>
        <p>Find tokens associated with your address.&nbsp;
        <Popup
          trigger={<FaQuestionCircle/>}
          content="This site only tracks the balances of tokens you add. Any tokens deposited on a different chain and relayed
          to this chain will also be tracked automatically."
          basic
        /></p>
        <Button onClick={this.loadTokens.bind(this)}>Load Tokens</Button>
        <h2>Add New Token</h2>
        <p>Search for a token by address.</p>
        <Input
          style={{width: 500}}
          placeholder='0x12...ef'
          onChange={this.updateToken.bind(this)}
          fluid
        />
        <br/>
        {this.renderAdd()}
      </div>
    );
  }

}

const mapStoreToProps = (store) => {
  return {
    state: store.balances,
    deposit: store.relayer,
  };
}

const Balances = connect(mapStoreToProps)(BalancesComponent);

export default Balances;
