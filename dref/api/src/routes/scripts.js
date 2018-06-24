import { Router } from 'express'
import { format } from 'util'
import request from 'request'
import targeter from '../middlewares/targeter'

var router = Router()

router.get('/:script', targeter, function (req, res, next) {
  var url = format('http://scripts:8000%s', req.originalUrl)
  request(url).pipe(res)
})

export default router
