export default class DNSQuestion {
  constructor (data) {
    /**
     * Constructs a DNSQuestion object based on the RFC
     * https://tools.ietf.org/html/rfc1035#section-4.1.2
     *
     * Expects data to be a Buffer
     */

    this.id = data.readUInt16BE(0)

    // get the qname
    const qnameLabels = []
    let offset = 12

    do {
      // get the length octet
      let _length = data.readInt8(offset)
      qnameLabels.push(data.toString('utf8', offset + 1, offset + 1 + _length))
      offset += _length + 1
    }
    while (data.readInt8(offset) !== 0)

    this.qname = qnameLabels.join('.')
    // get qtype and qclass, using offset which is now on the qname null terminator
    this.qtype = data.readInt16BE(offset + 1)
  }
}
