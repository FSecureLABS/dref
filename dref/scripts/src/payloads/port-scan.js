import NetMap from 'netmap.js'
import * as network from '../libs/network'
import Session from '../libs/session'

const session = new Session()
const netmap = new NetMap()

async function main () {
  const localSubnet = await network.getLocalSubnet(24)

  netmap.tcpScan(localSubnet, window.args.ports).then(results => {
    session.log(results)
  })
}

main()
