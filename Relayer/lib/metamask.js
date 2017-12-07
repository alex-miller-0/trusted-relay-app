const leftPad = require('left-pad');

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

export {
  getUserBalance,
}
