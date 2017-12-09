import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Card, Divider, Icon, Input, Table } from 'semantic-ui-react';
import {
  getTokenData,
} from '../lib/metamask.js';
const decoder = require('ethereumjs-abi');

class BalancesComponent extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const interval = setInterval(() => {
      const { deposit  } = this.props;
      if (deposit.currentNetwork && deposit.currentNetwork.value) {
        // Balances are stored in local store in a JSON object indexed by
        // the network id (remember this is the address of the Gateway contract)
        const _local = localStorage.getItem(deposit.currentNetwork.value);
        const local = _local ? JSON.parse(_local) : {};
        dispatch({ type: 'LOCAL_STORE', result: local })
        this.updateBalances()
        clearInterval(interval);
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
    const { state, dispatch } = this.props;
    let balances = [];
    let sortedBals = [];
    if (Object.keys(state.localStore).length > 0) {
      Object.keys(state.localStore).map((key) => {
        return getTokenData(key, web3)
        .then((data) => {
          balances.push(data);
          sortedBals = balances.sort((a, b) => { return a.name[0] > b.name[0] })
          dispatch({ type: 'BALANCES', result: sortedBals })
        })
      })
    } else {
      dispatch({ type: 'BALANCES', result: sortedBals })
    }
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
              <Table.HeaderCell>Balance</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Remove</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {state.balances.map((item, i) => {
              return (
                <Table.Row key={`row-${i}`}>
                  <Table.Cell>
                    {item.symbol}
                  </Table.Cell>
                  <Table.Cell>
                    {item.balance}
                  </Table.Cell>
                  <Table.Cell>
                    {item.address}
                  </Table.Cell>
                  <Table.Cell>
                    <Button onClick={this.removeBalance.bind(this, item)}>Remove</Button>
                  </Table.Cell>
                </Table.Row>
              )
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

  render() {
    return (
      <div style={{margin: '20px'}}>
        <h2>Balances</h2>
        {this.renderBalances()}
        <Divider/>
        <h2>Add Token</h2>
        <p>Search for a token by address</p>
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
