// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

let localWallet = require('./wallet.json');

const LOCAL_SECRET_KEY = new Uint8Array(localWallet.secretKey);

const getWallet = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    var wallet = Keypair.generate();
    console.log(wallet);
}
//getWallet();

const testBalance = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    var wallet = Keypair.fromSecretKey(LOCAL_SECRET_KEY);
    const walletBalance = await connection.getBalance(
        new PublicKey(wallet.publicKey)
    );

    //console.log(wallet);
    //console.log(new PublicKey(wallet.publicKey));
    
    //console.log("Wallet: ", wallet.publicKey);
    console.log("Balance: ", parseInt(walletBalance) / LAMPORTS_PER_SOL, " SOL");
    //console.log(parseInt(walletBalance) / 2);
    //console.log(walletBalance / 2);
    return parseInt(walletBalance);
}

testBalance();



const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(LOCAL_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // calculate half of the Sender's balance in SOL
    let halfSenderBalance = await testBalance();
    halfSenderBalance = halfSenderBalance / 2;

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: halfSenderBalance
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    testBalance();
}

//transferSol();
