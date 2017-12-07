import React, { Component } from 'react';
import { dependencies, devDependencies } from '../../../package.json';
import { Segment } from 'semantic-ui-react';
const deps = Object.assign({}, dependencies, devDependencies);

class App extends Component {
  render() {
    return (
      <div>
        <div class="container">
          <h1>Trusted Relay</h1>
          <h2>Move your assets to any Ethereum blockchain</h2>
          <Segment raised>
            Hello
          </Segment>
        </div>
      </div>
    );
  }
}

export default App;
