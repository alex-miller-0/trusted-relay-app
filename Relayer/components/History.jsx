// Deposit and withdrawal history
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Popup, Table } from 'semantic-ui-react';
import About from './About.jsx';
import { submitWithdrawal } from '../lib/metamask.js';
import { getEventHistory, findTokens, fillPendingDeposits } from '../lib/relayEvents.js';
import { loadLocalStore, parseEvents } from '../lib/util.js';
import FaQuestionCircle from 'react-icons/lib/fa/question-circle';
import { relayer } from '../actions';

class RelayerComponent extends Component {
  constructor(props){
    super(props);
  }

  // Search for any tokens the user has deposited or had withdrawn on this
  // chain's gateway.
  loadHistory() {
    const { deposit, dispatch } = this.props;
    const currentNet = deposit.currentNetwork.value;
    let user = web3.eth.accounts[0];
    let local = loadLocalStore(currentNet);
    let history;
    findTokens(user, deposit.contract, web3)
    .then((tokens) => {
      return getEventHistory(tokens, user, deposit.contract, web3)
    })
    .then((events) => {
      history = parseEvents(events);
      return relayer.getPendingDeposits(web3.eth.accounts[0], currentNet)
    })
    .then((pending) => {
      return fillPendingDeposits(pending, deposit.contract, web3);
    })
    .then((pending) => {
      history = history.concat(pending);
      dispatch({ type: 'HISTORY', result: history });
    })
  }

  withdraw(item) {
    const { deposit, dispatch } = this.props;
    if (!item.data) { throw new Error(`Could not find data for item ${JSON.stringify(item)}`); }
    relayer.getSignature(item.data)
    .then((sig) => {
      console.log('got sig', sig);
      let idx = null;
      console.log('sig.hash', sig.hash)
      deposit.history.forEach((item, i) => {
        if(item.data && item.data.hash == sig.hash) { idx = i; }
      })
      deposit.history[idx].data.relayerR = sig.r;
      deposit.history[idx].data.relayerS = sig.s;
      deposit.history[idx].data.relayerV = sig.v;
      return submitWithdrawal(deposit.history[idx].data, web3)
    })
    .then(() => {
      console.log('made it');
    })
    .catch((err) => { throw Error(`Error withdrawing: ${err}`); })
  }

  renderHistory() {
    const { deposit } = this.props;
    console.log('deposit.history', deposit.history)
    if (deposit.history && deposit.history.length > 0) {
      return (
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Event Type</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Symbol</Table.HeaderCell>
              <Table.HeaderCell>To ChainId</Table.HeaderCell>
              <Table.HeaderCell>From ChainId</Table.HeaderCell>
              <Table.HeaderCell>Time</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {deposit.history.map((item, i) => {
              if (item.name != "" && item.symbol != "") {
                return (
                  <Table.Row key={`row-${i}`}>
                    <Table.Cell>
                      {item.type}
                    </Table.Cell>
                    <Table.Cell>
                      {item.amount}
                    </Table.Cell>
                    <Table.Cell>
                      {item.symbol}
                    </Table.Cell>
                    <Table.Cell>
                      {item.toChain ? item.toChain : ""}
                    </Table.Cell>
                    <Table.Cell>
                      {item.fromChain ? item.fromChain : ""}
                    </Table.Cell>
                    <Table.Cell>
                      {item.timestamp}
                    </Table.Cell>
                    <Table.Cell>
                      {(() => {
                        if(item.type == 'Pending Withdrawal') {
                          return (<Button onClick={this.withdraw.bind(this, item)}>Withdraw</Button>)
                        }
                      })()}
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
    } else if (deposit.history && deposit.history.length == 0) {
      return (
        <div>
          <br/><h4>You have no deposits or withdrawals on this chain.</h4>
        </div>
      )
    } else {
      return;
    }
  }

  render() {
    const { state } = this.props;
    return (
      <div className="container" style={{margin: '20px'}}>
        <h2>History</h2>
        <p>View all deposits and relays that have occurred on this chain.&nbsp;<Popup
            trigger={<FaQuestionCircle/>}
            content="Depositing a token into a relayer Gateway (this site) locks the tokens until you withdraw them. Withdrawals each correspond
            to a deposit from a different chain. Both events are shown in your history, which you can load by clicking the button below."
            basic
        /></p>
        <Button onClick={this.loadHistory.bind(this)}>Load History</Button>
        {this.renderHistory()}
      </div>
    );
  }

}

const mapStoreToProps = (store) => {
  return {
    deposit: store.relayer,
  };
}

const Relayer = connect(mapStoreToProps)(RelayerComponent);

export default Relayer;
