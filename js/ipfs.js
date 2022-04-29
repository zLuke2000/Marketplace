var node
createNode()

export async function addData(data) {
    if (node == undefined) {
        console.error('node is still undefined...')
        setTimeout(() => { addData(data) }, 3000);
    } else {
        let result = await node.add(data)
        console.log('Added file:', result.path, result.cid)
        //path == cid.toString()
        return result.cid
    }
}

export async function retrieveData(cid) {
    if (node == undefined) {
        console.error('node is still undefined...')
        setTimeout(retrieveData(cid), 1000);
    } else {
        const stream = node.cat(cid)
        let data = ''
        for await (const chunck of stream) {
            data += chunck.toString()
        } 
        return data
    }
}

async function createNode() {
    console.log('creating node...')
    //attesa circa 10s
    node = await IpfsCore.create()
    console.log('node created!')
}