import Session from '../libs/session'
import { webRTCSupported, getLocalIP } from '../libs/network'

async function main () {
  const session = new Session()
  const date = new Date()
  const data = {}

  data.browser = {}
  data.browser.navigator = {}
  data.browser.navigator.userAgent = navigator.userAgent
  data.browser.navigator.language = navigator.language
  data.browser.navigator.appName = navigator.appName
  data.browser.navigator.appCodeName = navigator.appCodeName
  data.browser.navigator.appVersion = navigator.appVersion
  data.browser.navigator.product = navigator.product
  data.browser.navigator.platform = navigator.platform
  data.browser.navigator.oscpu = navigator.oscpu
  data.browser.navigator.hardwareConcurrency = navigator.hardwareConcurrency

  data.browser.window = {}
  data.browser.window.inner = {}
  data.browser.window.inner.height = window.innerHeight
  data.browser.window.inner.width = window.innerWidth

  data.browser.plugins = []
  for (let i = 0; i < navigator.plugins.length; i++) {
    data.browser.plugins.push(navigator.plugins[i].name)
  }

  data.browser.components = {}
  data.browser.components.webAssembly = (typeof window.WebAssembly !== 'undefined')
  data.browser.components.webSocket = (typeof window.WebSocket !== 'undefined')
  data.browser.components.webRTC = webRTCSupported()

  data.system = {}
  data.system.time = date.toString()

  data.system.screen = {}
  data.system.screen.height = screen.height
  data.system.screen.width = screen.width

  data.system.network = {}
  data.system.network.localIP = await getLocalIP()

  session.log(data)
}

main()
