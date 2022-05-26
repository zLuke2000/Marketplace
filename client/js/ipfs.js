const ipfs = window.IpfsHttpClient.create({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

export async function addData(data) {
    if (ipfs == undefined) {
        console.error('node is still undefined...')
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(addData(data))
            }, 5000)
          })
    } else {
        let result = await ipfs.add(data)
        //path == cid.toString()
        return result.path
    }
}

export async function readData(cid) {
    if (ipfs == undefined) {
        console.error('node is still undefined...')
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(readData(cid))
            }, 5000)
          })
    } else {
        try {
            const stream = await ipfs.cat(cid)
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