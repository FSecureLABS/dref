import { Router } from 'express'
import { check, validationResult } from 'express-validator/check'
import cors from 'cors'
import * as iptables from '../utils/iptables'
import { resolve } from 'url';

const router = Router()

function runIPTables (command, port, address) {
  return new Promise((resolve, reject) => {
    iptables.execute({
      table: iptables.Table.NAT,
      command: command,
      chain: iptables.Chain.PREROUTING,
      target: iptables.Target.REDIRECT,
      fromPort: port,
      toPort: 1,
      srcAddress: address
    }).then(status => {
      resolve(status)
    })
  })
}

router.post('/', cors(), [
  check('block').optional().isBoolean(),
  check('port').optional().isInt({min: 1, max: 65535})
], function (req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  console.log('dref: POST IPTables\n' + JSON.stringify(req.body, null, 4))

  // Get IP address
  const ipv4Match = req.ip.match(/::ffff:(\d{0,3}.\d{0,3}.\d{0,3}.\d{0,3})/)
  if (!ipv4Match) {
    console.log(`source IP ${req.ip} doesn't appear to be IPv4, can't manipulate iptables and fast-rebind not available`)
    return res.status(400).send()
  }
  const ipv4 = ipv4Match[1]

  // Block for 10 seconds or unblock
  if (req.body.block) {
    runIPTables(iptables.Command.INSERT, req.body.port, ipv4).then(status => {
      // unblock after 10 seconds max (fail-safe if client forgets to unblock)
      setTimeout(function () {
        runIPTables(iptables.Command.DELETE, req.body.port, ipv4)
      }, global.config.general.iptablesTimeout)

      if (status) {
        return res.status(204).send()
      }
      return res.status(400).send()
    })
  } else {
    runIPTables(iptables.Command.DELETE, req.body.port, ipv4).then(status => {
      if (status) return res.status(204).send()
      return res.status(400).send()
    })
  }
})

export default router
