import relayer from './relayer'

module.exports = {
  relayer: new relayer({ host: `http://localhost:3000` })
}
