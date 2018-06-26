/**
 * This is _NOT_ intended to enable secure transmission of data.
 * This is _NOT_ intended to be secure cryptography.
 * This is just some obfuscation.
 *
 * It's only intended to very slightly slow down someone investigating the
 * network traffic.
 *
 * In the future this will be improved and obfuscation of the JavaScript
 * payloads will slow down investigative efforts some more.
 *
 * Obfuscation is only really a concern for potential use in Red Team exercises.
 */

export const staticKey = 'eea46dfa5dead1bbc1d6d5c9'

export function randomHex (n) {
  var id = ''
  var range = '0123456789abcdef'

  for (var i = 0; i < n; i++) {
    id += range.charAt(Math.floor(Math.random() * range.length))
  }

  return id
}

// https://stackoverflow.com/questions/30651062/how-to-use-the-xor-on-two-strings
export function xor (a, b) {
  // xor two hex strings
  var res = ''
  var i = a.length
  var j = b.length

  while (i-- > 0 && j-- > 0) {
    res = (parseInt(a.charAt(i), 16) ^ parseInt(b.charAt(j), 16)).toString(16) + res
  }

  return res
}

// https://gist.github.com/salipro4ever/e234addf92eb80f1858f
export function rc4 (key, str) {
  var s = []
  var j = 0
  var x
  var res = ''

  for (var i = 0; i < 256; i++) {
    s[i] = i
  }

  for (i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256
    x = s[i]
    s[i] = s[j]
    s[j] = x
  }

  i = 0
  j = 0

  for (var y = 0; y < str.length; y++) {
    i = (i + 1) % 256
    j = (j + s[i]) % 256
    x = s[i]
    s[i] = s[j]
    s[j] = x
    res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256])
  }

  return res
}
