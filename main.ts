import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, WalletContractV4, fromNano, internal } from "ton";
import { mnemonicToWalletKey } from "ton-crypto";

async function main() {
    const mnemonic = "scatter release video rather jelly local true betray furnace huge crush possible aunt inject mammal seminar arch ribbon loan pottery talent brand onion museum";
    const key = await mnemonicToWalletKey(mnemonic.split(" ")); // Split the mnemonic into an array of words
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });
    
    try {
        const deployed = await client.isContractDeployed(wallet.address);
        if (!deployed) {
            console.log("Wallet is not deployed");
        } else {
            console.log("Wallet is deployed - ", wallet.address);

            const balance = await client.getBalance(wallet.address);
            console.log("Balance: ", fromNano(balance));
        }
    } catch (error) {
        console.error("Error:", error);
    }

    //EQD263BI9u6JPgXz10npMzXXfL23H5xfYZl8dxiVgCCx-Wt-
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: "EQD263BI9u6JPgXz10npMzXXfL23H5xfYZl8dxiVgCCx-Wt-",
                value: "0.05", // 0.05 TON
                body: "Hello", // optional comment
                bounce: false,
            })
        ]
    });

    // wait until confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed!");
}

main();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
