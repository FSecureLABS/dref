import IPCIDR from 'ip-cidr'

export function postJSON (url, data, successCb, failCb) {
  const xhr = new XMLHttpRequest()

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
      typeof successCb === 'function' && successCb()
    } else {
      typeof failCb === 'function' && failCb()
    }
  }

  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
  xhr.send(JSON.stringify(data))
}

export function get (url, successCb, failCb) {
  const xhr = new XMLHttpRequest()

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 400 && typeof successCb === 'function') {
        successCb(xhr.status, xhr.getAllResponseHeaders, xhr.response)
      } else if (typeof failCb === 'function') {
        failCb(xhr.status, xhr.getAllResponseHeaders(), xhr.response)
      }
    }
  }

  xhr.open('GET', url, true)
  xhr.setRequestHeader('Pragma', 'no-cache')
  xhr.setRequestHeader('Cache-Control', 'no-cache')
  xhr.send()
}

export function post (url, data, successCb, failCb) {
  const xhr = new XMLHttpRequest()

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 400 && typeof successCb === 'function') {
        successCb(xhr.status, xhr.getAllResponseHeaders, xhr.response)
      } else if (typeof failCb === 'function') {
        failCb(xhr.status, xhr.getAllResponseHeaders(), xhr.response)
      }
    }
  }

  xhr.open('POST', url, true)
  xhr.setRequestHeader('Pragma', 'no-cache')
  xhr.setRequestHeader('Cache-Control', 'no-cache')
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  xhr.send(data)
}

// https://github.com/muaz-khan/DetectRTC/blob/master/DetectRTC.js
export function webRTCSupported () {
  var supported = false;
  ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer'].forEach(function (item) {
    if (supported) {
      return
    }

    if (item in window) {
      supported = true
    }
  })

  return supported
}

// https://stackoverflow.com/questions/32837471/how-to-get-local-internal-ip-with-javascript
export function getLocalIP () {
  return new Promise(function (resolve, reject) {
    if (!webRTCSupported()) {
      resolve('')
    }

    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection
    var pc = new RTCPeerConnection({iceServers: []})
    var noop = function () {}
    var localIP

    pc.createDataChannel('')
    pc.createOffer(pc.setLocalDescription.bind(pc), noop)
    pc.onicecandidate = function (ice) {
      if (!ice || !ice.candidate || !ice.candidate.candidate) return
      localIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1]
      resolve(localIP)
    }
  })
}

export async function getLocalSubnet (suffix = 24) {
  const localIp = await getLocalIP()
  if (localIp === '') return []

  const cidr = new IPCIDR(localIp + '/' + suffix)
  return cidr.toArray()
}
