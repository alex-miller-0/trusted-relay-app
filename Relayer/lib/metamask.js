const leftPad = require('left-pad');
const sha3 = require('solidity-sha3').default;
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
import { hexToAscii } from './util.js';


function getUserBalance(token, web3) {
  return new Promise((resolve, reject) => {
    const data = `0x70a08231${leftPad(web3.eth.accounts[0].slice(2), 64, '0')}`;
    // Get the total balance (atomic units) for the user
    web3.eth.call({ to: token, data: data}, (err, res) => {
      if (err || res == '0x0') { return reject(err || 'Could not get balance'); }
      // Get decimals of the token
      const decData = '0x313ce567';
      web3.eth.call({ to: token, data: decData }, (err, dec) => {
        if (err) { return reject(err); }
        const userBal = parseInt(res, 16) / 10 ** parseInt(dec, 16);
        resolve(userBal);
      })
    })
  })
}

function getTokenData(token, web3) {
  return new Promise((resolve, reject) => {
    let data = { address: token };
    getTokenName(token, web3)
    .then((name) => {
      data.name = hexToAscii(name);
      return getTokenSymbol(token, web3)
    })
    .then((symbol) => {
      data.symbol = hexToAscii(symbol);
      return getTokenDecimals(token, web3)
    })
    .then((decimals) => {
      data.decimals = decimals;
      return getUserBalance(token, web3)
    })
    .then((bal) => {
      data.balance = bal;
      return resolve(data);
    })
    .catch((err) => { return reject(err); })
  })
}


function getUserBalanceUpdate(oldBal, newBal, state, web3) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (oldBal != newBal) { return resolve(newBal); }
      getUserBalance(state.depositToken, web3, state)
      .then((balance) => {
        return resolve(getUserBalanceUpdate(newBal, balance, state, web3));
      })
      .catch((err) => { return reject(err); })
    })
  })
}

function getAllowance(token, _spender, web3) {
  return new Promise((resolve, reject) => {
    const owner = leftPad(web3.eth.accounts[0].slice(2), 64, '0');
    const spender = leftPad(_spender.slice(2), 64, '0');
    const data = `0xdd62ed3e${owner}${spender}`;
    web3.eth.call({ to: token, data: data }, (err, res) => {
      if (err) { return reject(err); }
      return resolve(parseInt(res, 16));
    })
  })
}

function getAllowanceUpdate(oldAllow, newAllow, state, web3) {
  return new Promise((resolve, reject) => {
    console.log('oldAllowance', oldAllow, 'newAllowance', newAllow);
    setTimeout(() => {
      // Set promise interval to check for a new allowance
      if (oldAllow != newAllow) { return resolve(newAllow); }
      getAllowance(state, web3)
      .then((allowance) => {
        return resolve(getAllowanceUpdate(newAllow, allowance, state, web3));
      })
      .catch((err) => { return reject(err); })
    }, 100)
  })
}

function setAllowance(state, web3) {
  return new Promise((resolve, reject) => {
    const spender = leftPad(state.currentNetwork.value.slice(2), 64, '0');
    const _amount = state.depositAmount * 10 ** state.decimals;
    console.log('setting allowance:', _amount);
    console.log('decimals?', state.decimals);
    const amount = leftPad(_amount.toString(16), 64, '0');
    const data = `0x095ea7b3${spender}${amount}`;
    getNonce(web3)
    .then((nonce) => {
      web3.eth.sendTransaction({
        to: state.depositToken,
        data: data,
        nonce: nonce,
        gas: 100000
      }, (err, res) => {
        if (err) { return reject(err); }
        return resolve(res);
      })
    })
    .catch((err) => { return reject(err); })
  })
}

function getTokenDecimals(token, web3) {
  return new Promise((resolve, reject) => {
    web3.eth.call({ to: token, data: '0x313ce567'}, (err, res) => {
      if (err) { return reject(err); }
      return resolve(parseInt(res, 16));
    });
  });
}

function makeDeposit(state, web3) {
  return new Promise((resolve, reject) => {
    let data = {
      origChain: state.currentNetwork.value,
      destChain: state.destinationId,
      token: state.depositToken,
      amount: state.depositAmount * 10 ** state.decimals,
      sender: state.user,
      fee: 0,
      ts: null,
    };
    let msg;
    getNowFromGateway(data.origChain, web3)
    .then((ts) => {
      data.ts = parseInt(ts, 16) + 1;
      msg = getMessage(data);
      return requestSig(msg, web3)
    })
    .then((sig) => {
      const hashTmp = ethUtil.hashPersonalMessage(Buffer.from(msg.slice(2), 'hex'));
      const hash = `0x${hashTmp.toString('hex')}`;
      const sanCheckPub = ethUtil.ecrecover(hashTmp, sig.v, Buffer.from(sig.r, 'hex'), Buffer.from(sig.s, 'hex'));
      const sanCheckAddr = ethUtil.pubToAddress(sanCheckPub).toString('hex');
      return Deposit(data, hash, sig, web3);
    })
    .then((receipt) => { return resolve(receipt); })
    .catch((err) => { return reject(err); })
  })
}

// =============================================================================
// INTERNAL
// =============================================================================

function requestSig(msg, web3) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      id: 1,
      method: 'personal_sign',
      params: [web3.eth.accounts[0], msg]
    }, function(err, res) {
      if (err) { return reject(err); }
      else {
        const sig = res.result.substr(2, res.result.length);
        const r = sig.substr(0, 64);
        const s = sig.substr(64, 64);
        const v = parseInt(sig.substr(128, 2), 16);
        resolve({ r, s, v })
      }
    })
  })
}

// Call a function in the gateway that is called "getNow()"
function getNowFromGateway(addr, web3) {
  return new Promise((resolve, reject) => {
    web3.eth.call({ to: addr, data: '0xbbe4fd50' }, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res);
    })
  })
}

function getDepositERC20Data(data, hash, sig) {
  const header = '0x43a4f775'
  const a = hash.slice(2);
  const b = leftPad(sig.v.toString(16), 64, '0');
  const c = sig.r;
  const d = sig.s;
  const e = leftPad(data.token.slice(2), 64, '0');
  const f = leftPad(data.amount.toString(16), 64, '0');
  const g = leftPad(data.destChain.slice(2), 64, '0');
  const h = leftPad(data.fee.toString(16), 64, '0');
  const i = leftPad(data.ts.toString(16), 64, '0');
  const txData = `${header}${a}${b}${c}${d}${e}${f}${g}${h}${i}`;
  return txData;
}

function Deposit(data, hash, sig, web3) {
  return new Promise((resolve, reject) => {
    const txData = getDepositERC20Data(data, hash, sig);
    getNonce(web3)
    .then((nonce) => {
      web3.eth.sendTransaction({
        from: web3.eth.accounts[0],
        to: data.origChain,
        data: txData,
        nonce: nonce,
        gas: 500000,
        gasPrice: 1000000000
      }, (err, res) => {
        if (err) { return reject(err); }
        return resolve(res);
      });
    })
    .catch((err) => { return reject(err); })
  });
}

function getNonce(web3) {
  return new Promise((resolve, reject) => {
    web3.eth.getTransactionCount(web3.eth.accounts[0], (err, nonce) => {
      if (err) { return reject(err); }
      return resolve(nonce);
    })
  })
}

// Get the message (in hex) to sign
function getMessage(data) {
  // NOTE: Solidity tightly packs addresses as 20-byte strings. Everything else
  // is packed as a 32 byte string. This is a weird idiosyncracy.
  const a = data.origChain.slice(2);
  const b = data.destChain.slice(2);
  const c = data.token.slice(2);
  const e = leftPad(data.amount.toString(16), 64, '0');
  const f = data.sender.slice(2);
  const g = leftPad(data.fee.toString(16), 64, '0');
  const h = leftPad(data.ts.toString(16), 64, '0');
  const msg = `0x${a}${b}${c}${e}${f}${g}${h}`;
  return msg;
}

function getTokenName(token, web3) {
  return new Promise((resolve, reject) => {
    const data = `0x06fdde03`;
    web3.eth.call({ to: token, data: data}, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res);
    })
  })
}

function getTokenSymbol(token, web3) {
  return new Promise((resolve, reject) => {
    const data = `0x95d89b41`;
    web3.eth.call({ to: token, data: data}, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res);
    })
  })
}


export {
  getAllowance,
  getAllowanceUpdate,
  getTokenData,
  getTokenDecimals,
  getUserBalance,
  getUserBalanceUpdate,
  makeDeposit,
  setAllowance,
}
