import Promise from 'bluebird';

export default class relayer {
  constructor (options) {
    this.host = options.host;
  }

  getSignature(item) {
    return new Promise((resolve, reject) => {
      console.log('item', item)
      let uri = `${this.host}/sign?fromChain=${item.fromChain.toLowerCase()}&`;
      uri += `toChain=${item.toChain.toLowerCase()}&oldToken=${item.oldToken.toLowerCase()}&`;
      uri += `amount=${item.amount}&sender=${item.sender.toLowerCase()}&fee=${item.fee}&`;
      uri += `timestamp=${item.timestamp}`;
      fetch(uri)
      .then((res) => {
        if (!res.ok) { throw Error('Error getting signature'); }
        return res.json()
      })
      .then((data) => { return resolve(data.result); })
      .catch((err) => { return reject(err); })
    })
  }

  getPendingDeposits(user, chainId) {
    return new Promise((resolve, reject) => {
      const uri = `${this.host}/deposits?sender=${user}&toChain=${chainId}`;
      fetch(uri)
      .then((res) => {
        if (!res.ok) { throw Error('Error getting deposits'); }
        return res.json()
      })
      .then((data) => {
        let pending = [];
        data.result.forEach((d) => {
          if (!d.relayId && d.toChain == chainId) { pending.push(d); }
        })
        return resolve(pending);
      })
      .catch((err) => { return reject(err); })
    })
  }
}
