export default class DNSAnswer {
  constructor (id, qname, qtype, addresses = []) {
    /**
     * Constructs a DNSAnswer object based on the RFC
     * https://tools.ietf.org/html/rfc1035#section-4.1.3
     *
     * Expects address to be IPv4 string, the rest in integers
     */

    this.id = id
    this.qname = qname
    this.qtype = qtype
    this.addresses = addresses
  }

  toBuffer () {
    /**
     * Returns a Buffer representation of this DNSAnswer
     */

    const header = this._getHeaderBuffer()
    const question = this._getQuestionBuffer()

    if (this.addresses.length) {
      return Buffer.concat([header, question, this._getAnswerBuffer()])
    } else {
      return Buffer.concat([header, question])
    }
  }

  _getHeaderBuffer () {
    /**
     * Return a buffer of the DNSAnswer header
     */
    const header = Buffer.alloc(12)

    // id
    header.writeUInt16BE(this.id, 0)

    /**
     * cf. RFC: https://tools.ietf.org/html/rfc1035#section-4.1.1
     *
     * byte_2 is     0  1  2  3  4  5  6  7
     *              |QR|   Opcode  |AA|TC|RD|
     *               1  0  0  0  0  1  0  0
     *
     * qr=1, opcode=0, aa=1, tc=0, rd=0
     *
     * which gives us 0x84
     */
    header.writeUInt8(0x84, 2)

    /**
     * cf. RFC: https://tools.ietf.org/html/rfc1035#section-4.1.1
     *
     * byte_3 is     0  1  2  3  4  5  6  7
     *              |RA|   Z    |   RCODE   |
     *
     * ra=0, z=0, rcode=0 or 1
     *
     * which gives us 0x00 for normal answer and 0x01 for error
     */
    if (this.addresses.length) header.writeUInt8(0x00, 3)
    else header.writeUInt8(0x04, 3)

    // qdcount
    header.writeUInt16BE(0x01, 4)
    // ancount
    header.writeUInt16BE(1 * this.addresses.length, 6)
    // nscount
    header.writeUInt16BE(0x00, 8)
    // arcount
    header.writeUInt16BE(0x00, 10)

    return header
  }

  _getQuestionBuffer () {
    /**
     * Return a buffer of the DNSAnswer question
     */
    const qnameLabels = this.qname.split('.')
    // questionSize is:
    // - the number of labels (one byte for each label length)
    // - the aggregated length of the labels
    // - 1 byte for the null terminator
    // - 4 bytes total for qtype and qclass
    const questionSize = qnameLabels.length + qnameLabels.join('').length + 5
    const question = Buffer.alloc(questionSize)

    // qname
    let offset = 0
    for (let i in qnameLabels) {
      question.writeUInt8(qnameLabels[i].length, offset)
      question.write(qnameLabels[i], offset + 1)
      offset += qnameLabels[i].length + 1
    }
    question.writeUInt8(0x00, offset)

    // qtype
    question.writeUInt16BE(this.qtype, offset + 1)
    // qclass
    question.writeUInt16BE(1, offset + 3)

    return question
  }

  _getAnswerBuffer () {
    /**
     * Return a buffer of the DNSAnswer answer section
     */
    // record size is:
    // - 2 byte name pointer
    // - 2 byte type
    // - 2 byte class
    // - 4 byte ttl
    // - 2 byte rdlength
    // - 4 byte rdata for an A record

    // allocate 16 bytes for each record
    const answer = Buffer.alloc(16 * this.addresses.length)

    for (let i = 0; i < this.addresses.length; i++) {
      // name - pointer will always be 0xc00c (the first byte of the question)
      answer.writeUInt16BE(0xc00c, 0 + 16 * i)
      // type
      answer.writeUInt16BE(1, 2 + 16 * i)
      // class - always IN
      answer.writeUInt16BE(1, 4 + 16 * i)
      // ttl
      answer.writeUInt32BE(1, 6 + 16 * i)
      // rdlength - always 4 for A record
      answer.writeUInt16BE(4, 10 + 16 * i)
      // rdata
      const addressInts = this.addresses[i].split('.')
      for (let j = 0; j < addressInts.length; j++) {
        answer.writeUInt8(addressInts[j], 12 + j + 16 * i)
      }
    }

    return answer
  }
}
