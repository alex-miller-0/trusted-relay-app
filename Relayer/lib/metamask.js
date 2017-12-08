const leftPad = require('left-pad');
const sha3 = require('solidity-sha3').default;
const ethUtil = require('ethereumjs-util');

function getUserBalance(token, web3, state) {
  return new Promise((resolve, reject) => {

    const data = `0x70a08231${leftPad(state.user.slice(2), 64, '0')}`;
    console.log('forming data', data)
    // Get the total balance (atomic units) for the user

    web3.eth.call({ to: token, data: data}, (err, res) => {
      if (err || res == '0x0') { return reject(err); }
      console.log('res,', res, 'err', err);
      // Get decimals of the token
      const decData = '0x313ce567';
      web3.eth.call({ to: token, data: decData }, (err, dec) => {
        if (err) { return reject(err); }
        console.log('dec', dec)
        const userBal = parseInt(res, 16) / 10 ** parseInt(dec, 16);
        resolve(userBal);
      })
    })
  })
}

function getAllowance(state, web3) {
  return new Promise((resolve, reject) => {
    const owner = leftPad(web3.eth.accounts[0].slice(2), 64, '0');
    const spender = leftPad(state.currentNetwork.value.slice(2), 64, '0');
    const data = `0xdd62ed3e${owner}${spender}`;
    web3.eth.call({ to: state.depositToken, data: data }, (err, res) => {
      if (err) { return reject(err); }
      return resolve(parseInt(res, 16));
    })
  })
}

function getAllowanceUpdate(oldAllow, newAllow, state, web3) {
  return new Promise((resolve, reject) => {
    console.log('going');
    setTimeout(() => {
      console.log('newAllow', newAllow, 'oldAllow', oldAllow);
      // Set promise interval to check for a new allowance
      if (oldAllow != newAllow) { console.log('resolving', newAllow); return resolve(newAllow); }
      getAllowance(state, web3)
      .then((allowance) => {
        console.log('got allowance', allowance);
        return resolve(getAllowanceUpdate(newAllow, allowance, state, web3));
      })
      .catch((err) => { return reject(err); })
    }, 100)
  })
}

function setAllowance(state, web3) {
  return new Promise((resolve, reject) => {
    const spender = leftPad(state.currentNetwork.value.slice(2), 64, '0');
    const amount = leftPad(state.depositAmount.toString(16), 64, '0');
    const data = `0x095ea7b3${spender}${amount}`;
    web3.eth.sendTransaction({ to: state.depositToken, data: data }, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res);
    })
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
      amount: state.depositAmount,
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
      console.log('msg', msg);
      console.log('hash', hash);
      console.log('got sig', sig);
      return Deposit(data, hash, sig, web3);
    })
    .then((receipt) => {
      console.log('got receipt', receipt);
    })
    .catch((err) => { console.log('signing err', err); reject(err); })
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
        const v = parseInt(sig.substr(128, 2));
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
  const header = '0xaae63abf'
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
  console.log('forming tx data', txData);
  return txData;
}

function Deposit(data, hash, sig, web3) {
  return new Promise((resolve, reject) => {
    const txData = getDepositERC20Data(data, hash, sig);
    getNonce(web3)
    .then((nonce) => {
      console.log('got nonce', nonce);
      console.log('account', web3.eth.accounts[0]);
      web3.eth.sendTransaction({
        from: web3.eth.accounts[0],
        to: data.origChain,
        data: txData,
        nonce: nonce,
        gas: 500000,
        gasPrice: 1000000000
      }, (err, res) => {
        console.log('senttx');
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
  console.log('data', data)
  const a = data.origChain.slice(2);
  const b = data.destChain.slice(2);
  const c = data.token.slice(2);
  const e = leftPad(data.amount.toString(16), 64, '0');
  const f = data.sender.slice(2);
  const g = leftPad(data.fee.toString(16), 64, '0');
  const h = leftPad(data.ts.toString(16), 64, '0');
  return `0x${a}${b}${c}${e}${f}${g}${h}`
}

//
// function TestHash(data, web3) {
//   return new Promise((resolve, reject) => {
//     // testHash(address destChain, address origChain, uint amount, address token, uint[2] data)
//     // testHash(address,address,uint256,address,uint256[2])
//     const header = '0x764e8eb2'
//     const da = leftPad(data.origChain.slice(2), 64, '0');
//     const db = leftPad(data.destChain.slice(2), 64, 0);
//     const dc = leftPad(data.amount.toString(16), 64, '0');
//     const dd = leftPad(data.token.slice(2), 64, '0');
//     const de = leftPad(data.fee.toString(16), 64, '0');
//     const df = leftPad(data.ts.toString(16), 64, '0');
//     const txData = `${header}${db}${da}${dc}${dd}${de}${df}`;
//
//     const ma = data.origChain.slice(2);
//     const mb = data.destChain.slice(2);
//     const mc = leftPad(data.amount.toString(16), 64, '0');
//     const md = data.token.slice(2);
//     const me = leftPad(data.fee.toString(16), 64, '0');
//     const mf = leftPad(data.ts.toString(16), 64, '0');
//
//
//     const user = web3.eth.accounts[0].slice(2);
//     const msg2 = `${ma}${mb}${md}${mc}${user}${me}${mf}`;
//     console.log('msg2', msg2);
//     const hash = ethUtil.hashPersonalMessage(Buffer.from(msg2, 'hex'));
//     console.log('hashed test', hash.toString('hex'));
//     console.log('forming test tx', txData);
//     web3.eth.call({
//       from: web3.eth.accounts[0],
//       to: data.origChain,
//       data: txData,
//     }, (err, res) => {
//       console.log('test hash err', err);
//       console.log('test hash res', res);
//     })
//   })
// }

export {
  getAllowance,
  getAllowanceUpdate,
  getTokenDecimals,
  getUserBalance,
  makeDeposit,
  setAllowance,
}
