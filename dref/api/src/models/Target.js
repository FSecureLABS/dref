import mongoose from 'mongoose'

var TargetSchema = new mongoose.Schema({
  target: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]$/
  },
  script: {
    type: String,
    required: true
  },
  hang: {
    type: Boolean,
    default: false
  },
  args: mongoose.Schema.Types.Mixed
}, {timestamps: true})

let Target = mongoose.model('Target', TargetSchema)

export default Target
