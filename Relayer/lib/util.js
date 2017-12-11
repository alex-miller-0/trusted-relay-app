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

export {
  hexToAscii,
  loadLocalStore,
}
