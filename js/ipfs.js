var node
createNode()

export async function addData(data) {
    if (node == undefined) {
        console.error('node is still undefined...')
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(addData(data))
            }, 3000)
          })
    } else {
        let result = await node.add(data)
        console.log('Added file:', result.path, result.cid)
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
            }, 3000)
          })
    } else {


        console.log("prova prova")
        const stream = node.cat(cid)
        let data = ''
        console.log("log di stream",stream)
        for await (const chunck of stream) {
            data += chunck.toString()
        } 
        console.log("ELSE RETRIVEDATA")
        return data



        let buffer = await node.cat(cid)
        return buffer
    }
}

async function createNode() {
    //FIXME: nodo non viene mai creato
    console.log('creating node...')
    //attesa circa 10s
    node = await IpfsCore.create()
    console.log('node created!')
}