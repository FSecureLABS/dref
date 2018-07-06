import { Router } from 'express'

var router = Router()

router.get('/', function (req, res, next) {
  res.status(200).set({
    'Content-Length': '1'
  }).send()
})

export default router
