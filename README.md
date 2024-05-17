### notice

This is a zero amount transfer phishing attack demo in Ethereum, same way with [1155WBTC was hacked](https://slowmist.medium.com/small-bait-big-fish-unveiling-the-1155-wbtc-phishing-incident-22bf53b6fe60).
This is just for learning purpose, don't use it to do evil.

### key points

- Victim Address
- Transfer Address (victim's intended transfer address)
- Hacker Address (send gas to phishing address)
- Phishing Address

Hackers monitor the wallet activities of large holders (victims) on the blockchain. When the victim send a transfer transaction, the hacker generates a phishing address that is extremely similar to the victim's intended transfer address. The hacker's address sends a small amount of ETH to the phishing address as Gas. The phishing address then send a zero-amount transfer to the victim's address, contaminating the victim's transaction history. When the victim wants to transfer again to the intended address, they mistakenly transfer to the phishing address, resulting in theft.

### use

1.  `npm i`
2.  Add secret.mjs, then add your own wallet private key(your wallet need some ETH as gas) and alchemy api key.
3.  use `npm run hack` or use `node ./src/index.mjs` to attack victim.
