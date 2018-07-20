import * as network from '../libs/network'
import Session from '../libs/session'

const session = new Session()

async function mainFrame () {
  session.createRebindFrame(window.args.host, window.args.port, {
    // the rebindFrame function is run in another iFrame
    // behind the scenes, the script is re-delivered using a new "target" subdomain (cf. api)
    // we can pass args to that new iFrame, and we need to pass the path in this case
    args: {
      path: window.args.path
    }
  })
}

function rebindFrame () {
  session.triggerRebind().then(() => {
    network.get(session.baseURL + window.args.path, (code, headers, body) => {
      session.log({code: code, headers: headers, body: body})
    })
  })
}

if (window.args && window.args._rebind) rebindFrame()
else mainFrame()
