import mongoose from 'mongoose'
import { Router } from 'express'
import targeter from '../middlewares/targeter'

const router = Router()
const Target = mongoose.model('Target')

router.get('/', targeter, function (req, res, next) {
  Target.findOne({target: req.target}, 'script args', function (err, target) {
    if (err || !target) return res.status(400).send()

    res.render('index', {
      script: target.script,
      args: target.args,
      env: {
        target: req.target,
        script: target.script,
        domain: global.config.general.domain,
        address: global.config.general.address
      }
    })
  })
})

export default router
