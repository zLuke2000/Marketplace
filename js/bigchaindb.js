const API_PATH = 'http://localhost:9984/api/v1/'

const conn = new BigchainDB.Connection(API_PATH)

const alice = new BigchainDB.Ed25519Keypair()

// Assets are the immutable part of the transaction
const asset = {
    'product': {
        'name': 'product',
        'price': '999'
    }
}
// Metadata is mutable, the information in metadata can be updated in the future transactions
const metadata = { 'purchased': false }

console.log('creating tx')
const tx = BigchainDB.Transaction.makeCreateTransaction(
    asset,
    metadata,
    // A transaction needs an output
    // Each output indicates the crypto-conditions which must be satisfied by anyone wishing to spend/transfer that output
    [ BigchainDB.Transaction.makeOutput(
        BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))
    ],
    // Input of the transaction
    // Each input spends/transfer the Output by satisfying the crypto-condition on that output
    alice.publicKey
)

console.log('signing tx')
const txSigned = BigchainDB.Transaction.signTransaction(
    tx,
    alice.privateKey
)

console.log('posting tx')
conn.postTransactionCommit(txSigned)
.then(retrievedTx  => {
    console.log('Transaction ', retrievedTx.id, ' accepted')
})
.then(() => {
    console.log('we')
})
.catch( error => {
    console.error('Error while posting the transaction:', error)
})

// conn.getTransaction(txSigned.id)