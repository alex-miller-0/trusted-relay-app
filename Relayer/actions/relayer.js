export default class relayer {
  constructor (options) {
    this.host = options.host;
  }

  getDeposits(user) {
    console.log('user', user)
    const uri = `${this.host}/deposits?sender=${user}`;
    console.log('fetching', uri)
    fetch(uri)
    .then((res) => {
      if (!res.ok) { throw Error('Error getting deposits'); }
      return res.json()
    })
    .then((data) => {
      console.log('data', data)
    })
  }
}
