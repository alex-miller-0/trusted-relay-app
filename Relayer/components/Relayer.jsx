import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab } from 'semantic-ui-react';
import Deposit from './Deposit.jsx';
import About from './About.jsx';

class RelayerComponent extends Component {
  constructor(props){
    super(props);
  }

  renderWindow() {

  }

  render() {
    const { state } = this.props;
    const tabs = [
      { menuItem: 'Deposit', render: () => <Deposit/> },
      { menuItem: 'Balances', render: () => <p>balances</p> },
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
