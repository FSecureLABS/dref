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
      this._lookup(query.qname.toLowerCase()).then(record => {
        let addresses = []

        if (record) {
          if (record.dual) {
            // return both the target address and the default address when using
            // dual A record mode ("fast rebind")
            addresses.push(global.config.general.address)
            addresses.push(record.address)
          } else if (record.rebind) {
            // "slow rebind" uses a single A record after payload-defined
            // trigger
            addresses.push(record.address)
          } else {
            // if there's a record for this target but we're not using fast
            // rebind and we've not received a trigger for slow rebind
            // we just dish out the default
            addresses.push(global.config.general.address)
          }
        } else if (query.qname.endsWith(global.config.general.domain)) {
          addresses.push(global.config.general.address)
        }

        resolve(new DNSAnswer(query.id, query.qname, query.qtype, addresses))
      })
    })
  }

  _lookup (domain) {
    return new Promise((resolve) => {
      ARecord.findOne({ domain: domain }, (err, record) => {
        if (err || record === null) resolve(null)
        resolve(record)
      })
    })
  }
}
