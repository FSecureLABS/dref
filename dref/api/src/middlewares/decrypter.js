import * as crypto from '../utils/crypto'
import atob from 'atob'

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

export default function (req, res, next) {
  if (!req.body.hasOwnProperty('s') || !req.body.hasOwnProperty('d')) {
    res.status(400).send()
  }

  var sessionKey = crypto.xor(req.body.s, crypto.staticKey)
  req.data = JSON.parse(crypto.rc4(sessionKey, atob(req.body.d)))

  next()
}
