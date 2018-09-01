import mongoose from 'mongoose'

var ARecordSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    default: '127.0.0.1'
  },
  rebind: {
    type: Boolean,
    default: false
  },
  // a dual entry will return two A records: the arecord.address above and the
  // server's default address
  dual: {
    type: Boolean,
    default: false
  }
})

export default mongoose.model('ARecord', ARecordSchema)
