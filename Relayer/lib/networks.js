const config = require('../../config.json');

function getNetworks(currentNetwork, cb) {
  let current;
  let networks = [];
  Object.keys(config.networks).forEach((i) => {
    const net = config.networks[i];
    if (currentNetwork == i) {
      current = {
        text: `${net.name} (${net.gateway})`,
        name: net.name,
        value: net.value
      } ;
    } else {
      const tmp = {
        text: `${net.name} (${net.gateway})`,
        value: net.value,
        name: net.name,
      };
      networks.push(tmp);
    }
  })

  cb(null, { networks, current });
}

export {
  getNetworks,
}
