import { Router } from 'express'

var router = Router()

router.get('/', function (req, res, next) {
  res.set('Connection', 'close')
  res.send(JSON.stringify({
    checkpoint: true
  }))
})

export default router
