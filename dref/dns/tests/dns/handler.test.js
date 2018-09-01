import mongoose from 'mongoose'
import MongodbMemoryServer from 'mongodb-memory-server'
import ARecord from '../../src/models/ARecord'
import DNSHandler from '../../src/dns/handler'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

let mongoServer

beforeAll(async () => {
  mongoServer = new MongodbMemoryServer()
  const mongoUri = await mongoServer.getConnectionString()
  await mongoose.connect(mongoUri, {}, (err) => {
    if (err) console.error(err)
  })
  await ARecord.create({ domain: 'x.hello.com', address: '1.2.3.4', rebind: 'false' })
  await ARecord.create({ domain: 'y.hello.com', address: '1.2.3.4', rebind: 'true' })
})

afterAll(() => {
  mongoose.disconnect()
  mongoServer.stop()
})

test('returns answer with address for A record of default domain', async () => {
  global.config = { general: { domain: 'helloworld.com', address: '10.0.0.1' } }
  const handler = new DNSHandler()
  const rinfo = { address: '127.0.0.1', port: '1234' }
  // $ dig a helloworld.com @localhost
  const queryData = Buffer.from([
    0xed, 0x0f, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x0a, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x03,
    0x63, 0x6f, 0x6d, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x29, 0x10,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ])

  await handler.query(queryData, rinfo).then(answer => {
    expect(answer.addresses).toBeTruthy()
  })
})

test('returns answer without address for A record of unknown domain', async () => {
  // $ dig a helloworld.com @localhost
  global.config = { general: { domain: 'domain.example', address: '10.0.0.1' } }
  const handler = new DNSHandler()
  const rinfo = { address: '127.0.0.1', port: '1234' }
  const queryData = Buffer.from([
    0xed, 0x0f, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x0a, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x03,
    0x63, 0x6f, 0x6d, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x29, 0x10,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ])

  await handler.query(queryData, rinfo).then(answer => {
    expect(answer.addresses.length).toEqual(0)
  })
})

test('returns answer without address for non-A record', async () => {
  // $ dig a helloworld.com @localhost
  global.config = { general: { domain: 'domain.example', address: '10.0.0.1' } }
  const handler = new DNSHandler()
  const rinfo = { address: '127.0.0.1', port: '1234' }
  const queryData = Buffer.from([
    0xed, 0x0f, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x0a, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x03,
    0x63, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x29, 0x10,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ])

  await handler.query(queryData, rinfo).then(answer => {
    expect(answer.addresses.length).toEqual(0)
  })
})

test('returns null on parsing error', async () => {
  global.config = { general: { domain: 'hello.com', address: '10.0.0.1' } }
  const handler = new DNSHandler()
  const rinfo = { address: '127.0.0.1', port: '1234' }
  const queryData = Buffer.from([0x00])

  await handler.query(queryData, rinfo).then(answer => {
    expect(answer).toBeNull()
  })
})

<<<<<<< HEAD
test('_lookup() returns a known record', async () => {
  global.config = {general: {domain: 'hello.com', address: '10.0.0.1'}}

  await (new DNSHandler())._lookup('x.hello.com').then(record => {
    expect(record).toMatchObject({
      domain: 'x.hello.com',
      address: '1.2.3.4',
      rebind: false
    })
=======
test('_lookup() returns default address for existing record when no rebind', async () => {
  global.config = { general: { domain: 'hello.com', address: '10.0.0.1' } }

  await (new DNSHandler())._lookup('x.hello.com').then(address => {
    expect(address).toEqual('10.0.0.1')
  })
})

test('_lookup() returns defined address for existing record when rebind', async () => {
  global.config = { general: { domain: 'hello.com', address: '10.0.0.1' } }

  await (new DNSHandler())._lookup('y.hello.com').then(address => {
    expect(address).toEqual('1.2.3.4')
>>>>>>> 387779f29212e13ab169a22f3eef5e30134a4575
  })
})

test('_lookup() returns null for unknown record', async () => {
  await (new DNSHandler())._lookup('unknown.host').then(address => {
    expect(address).toBeNull()
  })
})

test('returns answer with default address for A record when no rebind', async () => {
  global.config = { general: { domain: 'hello.com', address: '10.0.0.1' } }
  const handler = new DNSHandler()
  const rinfo = { address: '127.0.0.1', port: '1234' }
  // $ dig a x.hello.com @localhost
  const queryData = Buffer.from([
    0xaa, 0xaa, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x01, 0x78, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x03, 0x63, 0x6f, 0x6d,
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x29, 0x10, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00
  ])

  await handler.query(queryData, rinfo).then(answer => {
    expect(answer.addresses).toEqual(['10.0.0.1'])
  })
})

test('returns answer with defined address for A record when rebind', async () => {
  global.config = { general: { domain: 'hello.com', address: '10.0.0.1' } }
  const handler = new DNSHandler()
  const rinfo = { address: '127.0.0.1', port: '1234' }
  // $ dig a y.hello.com @localhost
  const queryData = Buffer.from([
    0xaa, 0xaa, 0x01, 0x20, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x01, 0x79, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x03, 0x63, 0x6f, 0x6d,
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x29, 0x10, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00
  ])

  await handler.query(queryData, rinfo).then(answer => {
    expect(answer.addresses).toEqual(['1.2.3.4'])
  })
})
