import mongoose from 'mongoose'

var LogSchema = new mongoose.Schema({
  port: {
    type: Number,
    required: true,
    min: 0,
    max: 65535
  },
  ip: {
    type: String,
    required: true
  },
  data: mongoose.Schema.Types.Mixed
}, { timestamps: true })

let Log = mongoose.model('Log', LogSchema)

export default Log
