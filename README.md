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

This app requires you have a `networks.json` file to know which networks you are connecting. This should
be identical to the one in [eth-relayer](https://github.com/alex-miller-0/eth-relayer). Create a file
called `config.json` and put the location of your eth-relayer `networks.json` file under `networks-source`, e.g.:

```
{
  "networks-source": "/Users/alexmiller/eth-relayer/networks.json"
}
```

*NOTE: If you make changes to your networks file in your eth-relayer repo, you should run `npm run networks-copy` to re-copy the file.*

### History not loading?

There is an active bug with Metamask where switching providers fails to fetch events. This means when you make a deposit and try to find the corresponding withdrawal on the destination chain, it will often not show up. The only way to fix this at the moment is to reboot your browser. I have filed an issue [here](https://github.com/MetaMask/metamask-extension/issues/2761) and will update the README when it is resolved.  
