const config = require('../../config.json');

function getNetworks(currentNetwork, cb) {
  let current;
  let networks = [];
  Object.keys(config.networks).forEach((i) => {
    if (currentNetwork == i) { current = config.networks[i] }
    else {
      const tmp = {
        "text": `${config.networks[i].name} (${config.networks[i].gateway})`,
        "value": config.networks[i].value
      }
      networks.push(tmp);
    }
  })

  cb(null, { networks, current });
}

export {
  getNetworks,
}
