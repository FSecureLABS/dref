import DNSQuestion from './question'
import DNSAnswer from './answer'
import ARecord from '../models/ARecord'

export default class DNSHandler {
  query (data, rinfo) {
    return new Promise((resolve, reject) => {
      let query
      try {
        query = new DNSQuestion(data)
      } catch (err) {
        console.log(`parsing error: ${rinfo.address}:${rinfo.port} - ${data}`)
        resolve(null)
      }

      console.log(`question: ${rinfo.address}:${rinfo.port} - ${JSON.stringify(query)}`)

      if (query.qtype !== 1) {
        // empty response to other queries
        resolve(new DNSAnswer(query.id, query.qname, query.qtype))
      }

      // A query (qtype === 1)
      this._lookup(query.qname.toLowerCase()).then(address => {
        if (address) {
          resolve(new DNSAnswer(query.id, query.qname, query.qtype, address))
        } else if (query.qname.endsWith(global.config.general.domain)) {
          resolve(new DNSAnswer(query.id, query.qname, query.qtype, global.config.general.address))
        } else {
          resolve(new DNSAnswer(query.id, query.qname, query.qtype))
        }
      })
    })
  }

  _lookup (domain) {
    return new Promise((resolve) => {
      ARecord.findOne({domain: domain}, (err, record) => {
        if (err || record === null) resolve(null)
        else if (record.rebind) resolve(record.address)
        else resolve(global.config.general.address)
      })
    })
  }
}
