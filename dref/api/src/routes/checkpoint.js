import { Router } from 'express'

var router = Router()

router.get('/', function (req, res, next) {
  res.send(JSON.stringify({
    checkpoint: true
  }))
})

export default router
