const conn = new BigchainDB.Connection('https://test.ipdb.io/api/v1/', {
    header1: 'header1_value',
    header2: 'header2_value'
})

function createProduct(product, address) {

    const alice = new BigchainDB.Ed25519Keypair()

    const asset = {
        'ref': 'marketplace',
        product
    }
    const metadata = {
        'owner': address,
        'purchased': 'false'
    }

    const tx = BigchainDB.Transaction.makeCreateTransaction(
        asset,
        metadata,
        [ BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))
        ],
        alice.privateKey
    )

    const txSigned = BigchainDB.Transaction.signTransaction(tx, alice.privateKey)

    conn.postTransactionCommit(txSigned)
    .then(retrievedTx  => {
        console.log('Transaction ', retrievedTx.id, ' accepted')
    })
}

async function searchProducts() {
    conn.searchAssets('')
    .then(assets => console.log('Found assets:', assets))
    .catch(error => console.error('Error while searching products', error))
}