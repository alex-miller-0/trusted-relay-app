// Scan relay events for deposits and such
import Promise from 'bluebird';
import { getTokenData, getTokenDecimals } from './metamask.js';

function loadContract(abi, address, web3) {
  const contract = web3.eth.contract(abi);
  const instance = contract.at(address);
  return instance;
}

// Search Deposit and RelayedDeposit events for all unique tokens
function findTokens(user, contract, web3) {
  return new Promise((resolve, reject) => {
    let tokens = {};
    const event = contract.Deposit({ sender: user },
      { fromBlock: 0, toBlock: 'latest'});
    event.get((err, events) => {
      if (err) { return reject(err); }
      console.log('events', events)
      events.forEach((evt) => { tokens[evt.args.token] = true; })
      const event2 = contract.RelayedDeposit({ sender: user },
      { fromBlock: 0, toBlock: 'latest' });
      event2.get((err2, events2) => {
        if (err2) { return reject(err2); }
        events2.forEach((evt) => { tokens[evt.args.newToken] = true; })
        return resolve(Object.keys(tokens));
      })
    })
  })
}

// Given an array of token addresses, get all the token data and balances
// Returns a sorted array with each element of form
// { name, decimals, symbol, balance, address }
function getTokens(tokens, user, contract, web3) {
  return new Promise((resolve, reject) => {
    let data = [];
    return Promise.map(tokens, (token) => {
      return getOneToken(token, user, contract, web3)
    })
    .map((datum) => {
      data.push(datum);
      return;
    })
    .then(() => {
      const sortedData = data.sort((a, b) => { return a.name[0] > b.name[0] })
      resolve(sortedData);
    })
    .catch((err) => { reject(err); })
  })
}

// Get a balance and all token data
function getOneToken(token, user, contract, web3) {
  return new Promise((resolve, reject) => {
    let deposited = 0;
    let data;
    getTokenData(token, web3)
    .then((_data) => {
      data = _data;
      // Find the number of tokens currently deposited to the gateway by the user
      return getTotalDeposited(token, user, contract, web3)
    })
    .then((_deposited) => {
      deposited += _deposited;
      return getTotalWithdrawn(token, user, contract, web3)
    })
    .then((withdrawn) => {
      deposited -= withdrawn;
      if (deposited < 0) {
        console.log('Warning: Your balance is below zero. Please notify your relayer.');
        deposited = 0;
      }
      const sizedDeposit = deposited / (10 ** data.decimals);
      data.deposit = sizedDeposit;
      return resolve(data);
    })
    .catch((err) => { return reject(err); })
  })
}

// Get the total number of tokens deposited by this user in this gateway
function getTotalDeposited(token, user, contract, web3) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const event = contract.Deposit({ sender: user, token: token },
      { fromBlock: 0, toBlock: 'latest'});
    event.get((err, events) => {
      if (err) { return reject(err); }
      events.forEach((evt) => {
        const amt = parseInt(evt.args.amount.toString())
        total += amt;
      })
      return resolve(total);
    })
  })
}

// Get the total number of tokens withdrawn by this user in this gateway
// Tokens are withdrawn when the message is relayed from another chain. They can
// also be withdrawn from cancellations
//
// TODO: Add cancellations
//
function getTotalWithdrawn(token, user, contract, web3) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const event = contract.RelayedDeposit({ sender: user, newToken: token },
      { fromBlock: 0, toBlock: 'latest'});
    event.get((err, events) => {
      if (err) { return reject(err); }
      events.forEach((evt) => {
        const amt = parseInt(evt.args.amount.toString())
        total += amt;
      })
      return resolve(total);
    })
  })
}


export {
  findTokens,
  getTokens,
  getTotalDeposited,
  getTotalWithdrawn,
  loadContract,
}
