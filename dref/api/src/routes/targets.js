import mongoose from 'mongoose'
import { Router } from 'express'
import { check, validationResult } from 'express-validator/check'

const router = Router()
const Target = mongoose.model('Target')

// This should be re-written as a proper REST API
router.post('/', [
  check('target').matches(/^[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]$/),
  check('script').isString(),
  check('hang').optional().isBoolean(),
  check('fastRebind').optional().isBoolean(),
  check('args').optional()
], function (req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  console.log('dref: POST Target\n' + JSON.stringify(req.body, null, 4))

  const record = {
    target: req.body.target,
    script: req.body.script
  }
  if (typeof req.body.hang !== 'undefined') record.hang = req.body.hang
  if (typeof req.body.fastRebind !== 'undefined') record.fastRebind = req.body.fastRebind
  if (typeof req.body.args !== 'undefined') record.args = req.body.args

  Target.findOneAndUpdate({
    target: req.body.target
  }, record, { upsert: true }, function (err) {
    if (err) {
      console.log(err)
      return res.status(400).send()
    }
    res.status(204).send()
  })
})

export default router
