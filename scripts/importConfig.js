// Import a config file from the eth-relay module. This is useful for testing
// an environment you have already populated. It will copy the networks to the
// config.json file here.
const jsonfile = require('jsonfile');

jsonfile.readFile('config.json', function(err, file) {
  // Ignore error if user doesn't have a config file
  const f = `${file['networks-source']}/networks.json`;
  if (!err && file['networks-source']) {
    jsonfile.readFile(f, function(err, file) {
      if (err) { console.log('Error searching for file:', err); }
      else {
        const newfpath = 'networks.json';
        jsonfile.writeFile(newfpath, file, { spaces: 2 }, (err) => {
          if (err) { console.log('Error writing file:', err); }
          else { console.log('\nSuccessfully copied networks configuration.\n'); }
        })
      }
    })
  }
})
