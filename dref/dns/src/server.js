import { createSocket } from 'dgram'
import YAML from 'yamljs'
import mongoose from 'mongoose'
import DNSHandler from './dns/handler'

/**
 * Load Config
 */
global.config = YAML.load('/tmp/dref-config.yml')

/**
 * Connect to MongoDB
 */
mongoose.connect('mongodb://mongo:27017/dref')

/**
 * Set up Service
 */
const server = createSocket('udp4')
const handler = new DNSHandler()

server.on('message', (data, rinfo) => {
  handler.query(data, rinfo).then(answer => {
    if (!answer) return
    const answerBuffer = answer.toBuffer()

    server.send(answerBuffer, 0, answerBuffer.length, rinfo.port, rinfo.address, () => {
      console.log(`answer: ${rinfo.address}:${rinfo.port} - ${JSON.stringify(answer)}`)
    })
  })
})

server.on('error', (err) => {
  console.log(`server error: ${err.stack}`)
})

server.on('listening', () => {
  const address = server.address()
  console.log(`server listening: ${address.address}:${address.port}`)
})

server.bind(53)
