// Scan relay events for deposits and such

function loadContract(abi, address, web3) {
  const contract = web3.eth.contract(abi);
  const instance = contract.at(address);
  return instance;
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
  getTotalDeposited,
  getTotalWithdrawn,
  loadContract,
}
