console.log('creating node...')
const node = await IpfsCore.create()
console.log('node created!')

const opType = {
    Add: 'Add',
    Read: 'Read'
};

export async function addData(data) {
    if (checkNode(data, null, 5000)) {
        let result = await node.add(data)
        return result.path
    }
}

export async function readData(cid) {
    if (checkNode(null, cid, 5000)) {
        const stream = node.cat(cid)
        let data = ''
        for await (const chunck of stream) {
            data += chunck.toString()
        } 
        return data
    }
}

function checkNode(operation, data, delay) {
    if (node == undefined) {
        console.error('node is still undefined...')
        new Promise(resolve => {
            setTimeout(function() {
                if(operation === opType.Add) {
                    resolve(addData(data))
                } else if(operation === opType.Read) {
                    resolve(readData(data))
                }
            }, delay)
        })
    } else {
        return true
    }
    return false
}