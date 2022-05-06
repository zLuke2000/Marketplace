var node
createNode()

async function createNode() {
    console.log('creating node...')
    node = await IpfsCore.create()
    console.log('node created!')
}

export async function addData(data) {
    if (node == undefined) {
        console.error('node is still undefined...')
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(addData(data))
            }, 5000)
          })
    } else {
        let result = await node.add(data)
        //path == cid.toString()
        return result.path
    }
}

export async function readData(cid) {
    if (node == undefined) {
        console.error('node is still undefined...')
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(readData(cid))
            }, 5000)
          })
    } else {
        const stream = node.cat(cid)
        let data = ''
        for await (const chunck of stream) {
            data += chunck.toString()
        } 
        return data
    }
}