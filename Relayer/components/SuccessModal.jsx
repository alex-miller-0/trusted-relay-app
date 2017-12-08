import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Header, Icon, Modal } from 'semantic-ui-react'

class SuccessModalComponent extends Component {
  constructor(props){
    super(props);
  }

  render() {
    const { relayer } = this.props;
    return (
      <div>
        <Modal open={true}>
            <Header content='Success!' />
            <Modal.Content>
              <p>You successfully deposited <b>{relayer.depositAmount}</b> tokens. Someone will relay your message shortly. Please visit
              the destination chain at {relayer.destinationId}</p>
            </Modal.Content>
            <Modal.Actions>
              <Button color='green'>
                Okay
              </Button>
            </Modal.Actions>
          </Modal>
      </div>
    );
  }

}

const mapStoreToProps = (store) => {
  return {
    relayer: store.relayer
  };
}

const SuccessModal = connect(mapStoreToProps)(SuccessModalComponent);

export default SuccessModal;
