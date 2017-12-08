import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Divider, Dropdown, Icon, Input, Menu, Message, Segment } from 'semantic-ui-react';

class ModalComponent extends Component {
  constructor(props){
    super(props);
  }

  render() {
    const { relayer } = this.props;
    return (
      <div>
        <p>{relayer.destinationId}</p>
      </div>
    );
  }

}

const mapStoreToProps = (store) => {
  return {
    relayer: store.relayer
  };
}

const Modal = connect(mapStoreToProps)(ModalComponent);

export default Modal;
