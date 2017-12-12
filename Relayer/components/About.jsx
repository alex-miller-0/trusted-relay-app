import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Accordion, Icon } from 'semantic-ui-react'

class AboutComponent extends Component {
  constructor(props){
    super(props);
  }

  state = { activeIndex: 0 }

   handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  render() {
    const { activeIndex } = this.state
    const tabs = [
      { menuItem: 'Deposit', render: () => <Deposit/> },
      { menuItem: 'Balances', render: () => <p>balances</p> },
    ]
    return (
      <div className="container" style={{margin: '20px'}}>
        <Accordion fluid styled>
        <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
          <Icon name='dropdown' />
          What is Trusted Relay?
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <p>
            Trusted Relay is an implementation of a Trusted Relay Network. The concept was published by Alex Miller of
             &nbsp;<a href="https://gridplus.io">Grid+</a>. A Trusted Relay Network (TRR) is a set of smart contracts (called "Gateways") on multiple
            Ethereum-based networks. These contracts are maintained by "relayers", who are responsible for associating tokens
            and other assets between blockchains. A user may deposit a token to one of the Gateways and a relayer will replay
            the message on the desired destination network.
          </p>
        </Accordion.Content>

        <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
          <Icon name='dropdown' />
          Why can't I relay my own messages?
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 1}>
          <p>
            Because Ethereum and other blockchain networks are deterministic, it is impossible to prove that an event happened
            on another blockchain. This is because each blockchain requires input as its own "source of truth". Therefore, if users
            could relay their own messages, it would be impossible to prove malicious behavior (e.g. replaying a message on the destination
            chain without actually making the intial deposit).
          </p>
        </Accordion.Content>

        <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick}>
          <Icon name='dropdown' />
          Can a relayer steal my money?
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 2}>
          <p>
            No, a relayer can only relay a message to another blockchain. Your deposit is only accessible by you.
          </p>
        </Accordion.Content>

        <Accordion.Title active={activeIndex === 3} index={3} onClick={this.handleClick}>
          <Icon name='dropdown' />
          How do I get my assets back to the main chain?
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 3}>
          <p>
            A TRN is bi-directional, meaning once you move your assets to the destination chain, you can deposit them there
            using the gateway on that chain and set your new destination to your original chain. If you do that, a relayer will
            happily take that message and relay it to the main chain.
          </p>
        </Accordion.Content>

        <Accordion.Title active={activeIndex === 4} index={4} onClick={this.handleClick}>
          <Icon name='dropdown' />
          Are there fees?
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 4}>
          <p>
            There are fees written into the protocol, which are meant to incentivize relayers to spend gas to relay your message.
            However, Trusted Relay is a proof of concept and does not require fees at this time.
          </p>
        </Accordion.Content>

        <Accordion.Title active={activeIndex === 5} index={5} onClick={this.handleClick}>
          <Icon name='dropdown' />
          What if something goes wrong?
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 5}>
          <p>
            In the event of a catastrophic failure, relayers have the ability to "undo" deposits on any chain. Thus, if you have assets
            locked in the Gateway on the mainnet and something goes wrong, the relayer would unlock your deposit, releasing it to you automatically.
          </p>
        </Accordion.Content>
      </Accordion>
      </div>
    );
  }

}

const mapStoreToProps = (store) => {
  return {
    state: store.relayer
  };
}

const About = connect(mapStoreToProps)(AboutComponent);

export default About;
