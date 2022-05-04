const conn = new BigchainDB.Connection('https://test.ipdb.io/api/v1/', {
    header1: 'header1_value',
    header2: 'header2_value'
})

const alice = new BigchainDB.Ed25519Keypair()

export function createProduct(cid, address) {

    const asset = {
        'ref': 'marketplace_10:25_blobProva',
        'cid': cid
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

export async function searchProducts() {
    try {
        return await conn.searchAssets('marketplace_10:25_blobProva')
    } catch (error) {
        console.error('Error while searching products', error)
    }
}

