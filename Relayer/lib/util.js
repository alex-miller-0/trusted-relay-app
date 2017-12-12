// Basic util functions

function hexToAscii(h) {
  const hex = h.toString();//force conversion
  let str = '';
  for (let i = 0; i < hex.length; i += 2)
  str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

function loadLocalStore(i) {
  const _local = localStorage.getItem(i);
  let local = {}
  if (_local) {
    try { local = JSON.parse(_local); }
    catch (e) { local = {}; }
  }
  return local;
}

function parseEvents(evts) {
  let newEvts = [];
  evts.forEach((_evt) => {
    if(!_evt.symbol) {
      console.log('evt with no symbol', _evt)
    }
    let evt = {
      symbol: _evt.symbol,
      type: null,
      amount: _evt.amount / (10 ** _evt.decimals),
      timestamp: _evt.tsNow.toString(),
    };
    if (_evt.newToken) {
      // Relayed events
      evt.type = 'Withdrawal'
      evt.token = _evt.newToken;
      evt.fromChain = _evt.fromChain;
    } else {
      // Deposit events
      evt.type = 'Deposit';
      evt.toChain = _evt.toChain;
      evt.token = _evt.token;
    }
    newEvts.push(evt);
  });
  return newEvts;
}



export {
  hexToAscii,
  loadLocalStore,
  parseEvents,
}
