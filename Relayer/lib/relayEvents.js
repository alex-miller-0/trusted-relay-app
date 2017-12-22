// Scan relay events for deposits and such
import Promise from 'bluebird';
import { getTokenData, getTokenDecimals } from './metamask.js';
const relayAbi = require('../abis/TrustedRelay.json').abi;
const networks = require('../../networks.json');

function loadContract(abi, address, web3) {
  const contract = web3.eth.contract(abi);
  const instance = contract.at(address);
  return instance;
}

// NOTE: This is super weird, but `oldToken` and `newToken` are flipped
// on the react app. If you go to a web3 console and get events, the
// arguments are correct. Here they're flipped.
// I'm perplexed as to what is causing this. For now, I'm just going
// to ignore it.
// This is ONLY for RelayedDeposit events
// TODO: Fix this
function _hack(evt) {
  const newToken = evt.oldToken;
  const oldToken = evt.newToken;
  evt.oldToken = newToken;
  evt.newToken = oldToken;
  return evt;
}

// Search Deposit and RelayedDeposit events for all unique tokens
function findTokens(user, contract, web3) {
  return new Promise((resolve, reject) => {
    let tokens = {};
    const event = contract.Deposit({ sender: user },
      { fromBlock: 0, toBlock: 'latest'});
    event.get((err, events) => {
      if (err) { return reject(err); }
      events.forEach((evt) => { tokens[evt.args.token] = true; })
      const event2 = contract.RelayedDeposit({ sender: user },
      { fromBlock: 0, toBlock: 'latest' });
      event2.get((err2, events2) => {
        if (err2) { return reject(err2); }
        events2.forEach((evt2) => {
          // SEE: _hack()
          evt2 = _hack(evt2);
          tokens[evt2.args.oldToken] = true;
        })
        return resolve(Object.keys(tokens));
      })
    })
  })
}

// Get all deposit and relay events associated with a user and a token on this chain
function getEventHistory(tokens, user, contract, web3) {
  return new Promise((resolve, reject) => {
    let allEvents = [];
    getTokens(tokens, user, contract, web3)
    .map((tokenData) => {
      return getTokenHistory(tokenData, user, contract, web3)
    })
    .map((tokenEvents) => {
      allEvents = allEvents.concat(tokenEvents);
      return;
    })
    .then(() => {
      const sortedEvents = allEvents.sort((a, b) => { a.tsNow > b.tsNow; });
      return resolve(sortedEvents);
    })
    .catch((err) => { reject(err); })
  })
}


function getTokenHistory(tokenData, user, contract, web3) {
  return new Promise((resolve, reject) => {
    let allEvents = [];
    const event = contract.Deposit({ sender: user, token: tokenData.address },
      { fromBlock: 0, toBlock: 'latest'});
    event.get((err, events) => {
      if (err) { return reject(err); }
      events.forEach((evt) => {
        evt.args.symbol = tokenData.symbol;
        evt.args.decimals = tokenData.decimals;
        allEvents.push(evt.args);
      })
      const event2 = contract.RelayedDeposit({ sender: user, newToken: tokenData.address },
        { fromBlock: 0, toBlock: 'latest' });
      event2.get((err2, events2) => {
        if (err2) { return reject(err2); }
        events2.forEach((evt2) => {
          evt2.args.symbol = tokenData.symbol;
          evt2.args.decimals = tokenData.decimals;
          allEvents.push(evt2.args);
        })
        return resolve(allEvents);
      })
    })
  })
}

function fillPendingDeposits(pending, web3) {
  return new Promise((resolve, reject) => {
    let tokens = {};
    let events = [];
    pending.forEach((d) => { tokens[d.oldToken] = false; })
    Promise.map(Object.keys(tokens), (token) => {
      return getTokenData(token, web3)
    })
    .map((data) => {
      if (data.symbol != '' && !isNaN(data.decimals)) { tokens[data.address] = data; }
      return;
    })
    .then(() => {
      pending.forEach((d) => {
        let tmp = {
          type: 'Pending Withdrawal',
          fromChain: d.fromChain,
          timestamp: d.timestamp,
          amount: d.amount,
        };
        events.push(tmp);
      })
      return;
    })
    .then(() => { return resolve(events); })
    .catch((err) => { return reject(err); })
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
      if (datum && datum.symbol != '' && !isNaN(datum.decimals)) { data.push(datum); }
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
      data.deposited = sizedDeposit;
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
  fillPendingDeposits,
  findTokens,
  getEventHistory,
  getTokens,
  getTotalDeposited,
  getTotalWithdrawn,
  loadContract,
}
