## Trusted Relay App

This is the front-end react app to accompany [eth-relayer](https://github.com/alex-miller-0/eth-relayer).

## Installation

You can get started with:

```
npm install
npm start
```

This will load a webpack server at `localhost:8080`.

### Configuring networks

Trusted Relayer requires an origin network and a destination network. The app will
get the network id from Metamask via `web3.version.network` and will try to find this
id as a key in a file called `networks.json`. Similarly, the app will scan `networks.json`
for all networks that are not equivalent to the current one. These will be the user's
"destination" options.

If you would like to auto-configure networks to correspond with tests in eth-relayer, you can
serve the location of that repo in `config.json`, which would look something like this:

```
{
  "networks-source": "/Users/alexmiller/eth-relayer/networks.json"
}
```

When you run `npm run start`, a script will copy `networks.json`, which is automatically updated whenever you redeploy your
contracts in eth-rellayer, to this directory. Note that in dev mode you need to have
a `networks.json` file, so this is a good way to get set up. Your `networks.json` file should
look like this:

```
{
  "networks": {
    "5777": {
      "name": "Origin",
      "value": "0x30d0355c7398ff98722552dfc3fc039ce379778f",
      "gateway": "http://localhost:7545"
    },
    "1512850781666": {
      "name": "Destination",
      "value": "0x185d3e518001a1099456a5f82F51Fd3BB3B65F91",
      "gateway": "http://localhost:7546"
    }
  },
  "tokens": {
    "origin": "0xea8e04ebec4a5cf453ad64e28f34d1373e54ef45",
    "destination": "0x7E857De23706c78Dd3aaD9C01F6e222FE51ce3aa",
    "etherToken": "0xee6268fdf71442c5b2ac81ea930320159e7cf554"
  }
}
```

Where `networks` is imported into react. The `tokens` addresses are there for your convenience (so you can easily look up balances).

*NOTE: If you make changes to your networks file in your eth-relayer repo, you should run `npm run networks-copy` to re-copy the file.
