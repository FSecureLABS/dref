import mongoose from 'mongoose'
import { Router } from 'express'
import { check, validationResult } from 'express-validator/check'

const router = Router()
const ARecord = mongoose.model('ARecord')

// This should be re-written as a proper REST API
router.post('/', [
  check('domain').matches(/^([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+$/),
  check('address').optional().matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
  check('rebind').optional().isBoolean()
], function (req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  console.log('dref: POST ARecord\n' + JSON.stringify(req.body, null, 4))

  const record = { domain: req.body.domain }
  if (typeof req.body.address !== 'undefined') record.address = req.body.address
  if (typeof req.body.rebind !== 'undefined') record.rebind = req.body.rebind

  ARecord.findOneAndUpdate({
    domain: req.body.domain
  }, record, { upsert: true }, function (err) {
    if (err) {
      console.log(err)
      return res.status(400).send()
    }
    res.status(204).send()
  })
})

export default router
