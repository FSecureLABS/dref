import DNSAnswer from '../../src/dns/answer'

test('creates DNS answer', () => {
  const answer = new DNSAnswer(0xabab, 'test.random.co.uk', 1, ['192.168.1.1'])

  expect(answer.id).toEqual(0xabab)
  expect(answer.qname).toEqual('test.random.co.uk')
  expect(answer.qtype).toEqual(1)
  expect(answer.addresses).toEqual(['192.168.1.1'])
})

test('creates header Buffer with ancount "1" when address present', () => {
  const answer = new DNSAnswer(0xabab, 'test.random.co.uk', 1, ['192.168.1.1'])

  const expectedBuffer = Buffer.from([
    0xab, 0xab, // id
    0x84, // qr, opcode, aa, tc, rd
    0x00, // ra, z, rcode
    0x00, 0x01, // qdcount
    0x00, 0x01, // ancount
    0x00, 0x00, // nscount
    0x00, 0x00 // arcount
  ])

  expect(answer._getHeaderBuffer()).toEqual(expectedBuffer)
})

test('creates header Buffer with rcode "not implemented" and ancode "0" when no address present', () => {
  const answer = new DNSAnswer(0xabab, 'test.random.co.uk', 1)

  const expectedBuffer = Buffer.from([
    0xab, 0xab, // id
    0x84, // qr, opcode, aa, tc, rd
    0x04, // ra, z, rcode
    0x00, 0x01, // qdcount
    0x00, 0x00, // ancount
    0x00, 0x00, // nscount
    0x00, 0x00 // arcount
  ])

  expect(answer._getHeaderBuffer()).toEqual(expectedBuffer)
})

test('creates question Buffer with constructor params', () => {
  const answer = new DNSAnswer(0xabab, 'x.abc.com', 2)

  const expectedBuffer = Buffer.from([
    0x01, 0x78, 0x03, 0x61, 0x62, 0x63, 0x03, 0x63, 0x6f, 0x6d, 0x00, // qname
    0x00, 0x02, // qtype
    0x00, 0x01 // qclass
  ])

  expect(answer._getQuestionBuffer()).toEqual(expectedBuffer)
})

test('creates answer Buffer with constructor params', () => {
  const answer = new DNSAnswer(0xabab, 'x.abc.com', 1, ['255.255.255.255'])

  const expectedBuffer = Buffer.from([
    0xc0, 0x0c, // name pointer to first byte of question
    0x00, 0x01, // type
    0x00, 0x01, // class
    0x00, 0x00, 0x00, 0x01, // ttl
    0x00, 0x04, // rdlength
    0xff, 0xff, 0xff, 0xff // rdata
  ])

  expect(answer._getAnswerBuffer()).toEqual(expectedBuffer)
})

test('creates Buffer with answer', () => {
  const answer = new DNSAnswer(0xabab, 'x.abc.com', 1, ['255.255.255.255'])

  const expectedBuffer = Buffer.from([
    // header
    0xab, 0xab, // id
    0x84, // qr, opcode, aa, tc, rd
    0x00, // ra, z, rcode
    0x00, 0x01, // qdcount
    0x00, 0x01, // ancount
    0x00, 0x00, // nscount
    0x00, 0x00, // arcount
    // question
    0x01, 0x78, 0x03, 0x61, 0x62, 0x63, 0x03, 0x63, 0x6f, 0x6d, 0x00, // qname
    0x00, 0x01, // qtype
    0x00, 0x01, // qclass
    // answer
    0xc0, 0x0c, // name pointer to first byte of question
    0x00, 0x01, // type
    0x00, 0x01, // class
    0x00, 0x00, 0x00, 0x01, // ttl
    0x00, 0x04, // rdlength
    0xff, 0xff, 0xff, 0xff // rdata
  ])

  expect(answer.toBuffer()).toEqual(expectedBuffer)
})

test('creates Buffer without answer', () => {
  const answer = new DNSAnswer(0xabab, 'x.abc.com', 1)

  const expectedBuffer = Buffer.from([
    // header
    0xab, 0xab, // id
    0x84, // qr, opcode, aa, tc, rd
    0x04, // ra, z, rcode
    0x00, 0x01, // qdcount
    0x00, 0x00, // ancount
    0x00, 0x00, // nscount
    0x00, 0x00, // arcount
    // question
    0x01, 0x78, 0x03, 0x61, 0x62, 0x63, 0x03, 0x63, 0x6f, 0x6d, 0x00, // qname
    0x00, 0x01, // qtype
    0x00, 0x01 // qclass
  ])

  expect(answer.toBuffer()).toEqual(expectedBuffer)
})
