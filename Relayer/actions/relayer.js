import Promise from 'bluebird';

export default class relayer {
  constructor (options) {
    this.host = options.host;
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
