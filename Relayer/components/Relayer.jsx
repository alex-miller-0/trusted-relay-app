import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab } from 'semantic-ui-react';
import About from './About.jsx';
import Balances from './Balances.jsx';
import Deposit from './Deposit.jsx';
import { getNetworks } from '../lib/networks.js';

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

  render() {
    const { state } = this.props;
    const tabs = [
      { menuItem: 'Balances', render: () => <Balances/> },
      { menuItem: 'Deposit', render: () => <Deposit/> },
      { menuItem: 'About', render: () => <About/> }
    ]
    return (
      <div style={{margin: '20px'}}>
        <h1>Trusted Relay</h1>
        <p>
          Move your assets to any Ethereum-based chain with the click of a button!
        </p>
        <Tab panes={tabs}/>
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
