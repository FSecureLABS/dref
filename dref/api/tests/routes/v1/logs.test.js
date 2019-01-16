import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import MongodbMemoryServer from 'mongodb-memory-server'
import Log from '../../../src/models/Log'
import logs from '../../../src/routes/v1/logs'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 6000

let mongoServer
let app = express()
app.use('/', logs())

beforeAll(async () => {
  mongoServer = new MongodbMemoryServer()
  const mongoUri = await mongoServer.getConnectionString()
  await mongoose.connect(mongoUri, {}, (err) => {
    if (err) console.error(err)
  })
  await Log.create({
    'meta': {
      'sessionId': '31f9a1ee388a2a31d6a46213',
      'env': {
        'target': 'sysinfo',
        'script': 'sysinfo',
        'domain': 'attacker.com',
        'address': '127.0.0.1',
        'logPort': 443,
        'fastRebind': false
      },
      'args': null,
      'sourceAddress': '::ffff:172.19.0.1'
    }
  })
})

afterAll(() => {
  mongoose.disconnect()
  mongoServer.stop()
})

test('create should return 201 CREATED', async () => {
  // const res = await request(logs()).post('/').send({ meta: {} })
  // expect(res.statusCode).toBe(201)
  // console.log(logs())
  return request(app)
    .post('/')
    .send({ meta: {} })
    .set('Content-Type', 'application/json')
    .then(response => {
      expect(response.statusCode).toBe(201)
    })
})
