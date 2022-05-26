import * as IPFS from 'ipfs'

const node = await IPFS.create()

export async function addData(data) {
    if (node == undefined) {
        console.error('node is still undefined...')
        return new Promise(resolve => {
            setTimeout(function () {
                resolve(addData(data))
            }, 5000)
        })
    } else {
        let result = await node.add(data)
        return result.path
    }
}

export async function readData(cid) {
    if (node == undefined) {
        console.error('node is still undefined...')
        return new Promise(resolve => {
            setTimeout(function () {
                resolve(readData(cid))
            }, 5000)
        })
    } else {
        try {
            const stream = await node.cat(cid)
            let data = ''
            for await (const chunck of stream) {
                data += new TextDecoder().decode(chunck)
            }
            return data
        } catch (error) {
            console.error('Error while retrieving data from IPFS:', error)
            return null;
        }

    }
}
