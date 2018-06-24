import { Router } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import decrypter from '../middlewares/decrypter'

var Log = mongoose.model('Log')
var router = Router()

router.post('/', cors(), decrypter, function (req, res, next) {
  console.log(JSON.stringify(req.data, null, 4))

  new Log({
    port: req.get('host').split(':')[1] || 80,
    ip: req.ip,
    data: req.data
  }).save()

  res.status(204).send()
})

export default router
