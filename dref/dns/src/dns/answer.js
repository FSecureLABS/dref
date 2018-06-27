export default class DNSAnswer {
  constructor (id, qname, qtype, address = null) {
    /**
     * Constructs a DNSAnswer object based on the RFC
     * https://tools.ietf.org/html/rfc1035#section-4.1.3
     *
     * Expects address to be IPv4 string, the rest in integers
     */

    this.id = id
    this.qname = qname
    this.qtype = qtype
    this.address = address
  }

  toBuffer () {
    /**
     * Returns a Buffer representation of this DNSAnswer
     */

    const header = this._getHeaderBuffer()
    const question = this._getQuestionBuffer()

    if (this.address) {
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
    if (this.address) header.writeUInt8(0x00, 3)
    else header.writeUInt8(0x04, 3)

    // qdcount
    header.writeUInt16BE(0x01, 4)
    // ancount
    if (this.address) header.writeUInt16BE(0x01, 6)
    else header.writeUInt16BE(0x00, 6)
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
    // answer_size is:
    // - 2 byte name pointer
    // - 2 byte type
    // - 2 byte class
    // - 4 byte ttl
    // - 2 byte rdlength
    // - 4 byte rdata for an A record
    const answer = Buffer.alloc(16)

    // name - pointer will always be 0xc00c (the first byte of the question)
    answer.writeUInt16BE(0xc00c, 0)
    // type
    answer.writeUInt16BE(1, 2)
    // class - always IN
    answer.writeUInt16BE(1, 4)
    // ttl
    answer.writeUInt32BE(1, 6)
    // rdlength - always 4 for A record
    answer.writeUInt16BE(4, 10)
    // rdata
    const addressInts = this.address.split('.')
    for (let i = 0; i < addressInts.length; i++) {
      answer.writeUInt8(addressInts[i], 12 + i)
    }

    return answer
  }
}
