// Deposit and withdrawal history
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab } from 'semantic-ui-react';
import About from './About.jsx';
import { loadContract } from '../lib/relayEvents.js';

class RelayerComponent extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    let { dispatch } = this.props;
    const interval = setInterval(function() {
      // const provider = web3.version.network;
      // if (provider != null) {
      //   clearInterval(interval);
      //   dispatch({ type: 'UPDATE_USER', result: web3.eth.accounts[0] });
      //   dispatch({ type: 'UPDATE_WEB3_PROVIDER', result: provider });
      //   getNetworks(provider, (err, result) => {
      //     dispatch({ type: 'CURRENT_NETWORK', result: result.current });
      //     dispatch({ type: 'DESTINATION_NETWORKS', result: result.networks });
      //     const contract = loadContract(TrustedRelayAbi.abi, result.current.value, web3);
      //     dispatch({ type: 'CONTRACT', result: contract });
      //   });
      // }
    }, 100);
  }

  render() {
    const { state } = this.props;
    return (
      <div style={{margin: '20px'}}>
        <h2>History</h2>
        <p>View all deposits and relays that have occurred on this chain.</p>
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
