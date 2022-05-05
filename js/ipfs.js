var node
createNode()

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

export async function retrieveData(cid) {
    if (node == undefined) {
        console.error('node is still undefined...')
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(retrieveData(cid))
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

async function createNode() {
    console.log('creating node...')
    //attesa circa 10s
    node = await IpfsCore.create()
    console.log('node created!')
}