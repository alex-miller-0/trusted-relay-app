import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Divider, Tab } from 'semantic-ui-react';
import About from './About.jsx';
import Balances from './Balances.jsx';
import Deposit from './Deposit.jsx';
import History from './History.jsx';
import { getNetworks } from '../lib/networks.js';
import { loadContract } from '../lib/relayEvents.js';
const TrustedRelayAbi = require('../abis/TrustedRelay.json');

class RelayerComponent extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    let { dispatch } = this.props;
    const interval = setInterval(function() {
      const provider = web3.version.network;
      if (provider != null) {
        dispatch({ type: 'UPDATE_USER', result: web3.eth.accounts[0] });
        dispatch({ type: 'UPDATE_WEB3_PROVIDER', result: provider });
        getNetworks(provider, (err, result) => {
          dispatch({ type: 'DESTINATION_NETWORKS', result: result.networks });
          if (result.current && Object.keys(result.current).length > 0) {
            clearInterval(interval);
            dispatch({ type: 'CURRENT_NETWORK', result: result.current });
            const contract = loadContract(TrustedRelayAbi.abi, result.current.value, web3);
            dispatch({ type: 'CONTRACT', result: contract });
          }
        });
      }
    }, 100);
  }

  renderHeader() {
    return (
      <div>
        <h1>Trusted Relay</h1>
        <p>Move your assets to any Ethereum-based chain with the click of a button!</p>
      </div>
    )
  }

  renderContent() {
    const { state } = this.props;
    const tabs = [
      { menuItem: 'Balances', render: () => <Balances/> },
      { menuItem: 'Deposit', render: () => <Deposit/> },
      { menuItem: 'History', render: () => <History/> },
      { menuItem: 'About', render: () => <About/> }
    ];
    if (!state.currentNetwork || Object.keys(state.currentNetwork) == 0) {
      return (
        <div>
          <Divider/>
          <br/><br/>
          <h3>Wrong Network</h3>
          <p>We can't connect to your Metamask extension. Please set your Metamask provider to one of the following gateways:</p>
          {
            state.destinations.map((network, i) => {
              return (<h4 key={`h3-${i}`}>{network.text}</h4>)
            })
          }
        </div>
      );
    } else if (web3.eth.accounts.length === 0) {
      return (
        <div>
          <Divider/>
          <br/><br/>
          <h3>Locked Account</h3>
          <p>Your Metamask account is currently locked. Please sign into Metamask.</p>
        </div>
      );
    } else {
      return (
        <Tab panes={tabs}/>
      );
    }
  }

  render() {
    return (
      <div style={{ margin: '20px' }}>
        {this.renderHeader()}
        <center>
          {this.renderContent()}
        </center>
      </div>
    )
  }

}

const mapStoreToProps = (store) => {
  return {
    state: store.relayer
  };
}

const Relayer = connect(mapStoreToProps)(RelayerComponent);

export default Relayer;
