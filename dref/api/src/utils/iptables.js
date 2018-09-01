import {spawn} from 'child_process'

export const Command = Object.freeze({
  APPEND: '-A',
  CHECK: '-C',
  DELETE: '-D',
  INSERT: '-I'
})

export const Target = Object.freeze({
  DROP: 'DROP',
  REDIRECT: 'REDIRECT',
  REJECT: 'REJECT'
})

export const Table = Object.freeze({
  FILTER: 'filter',
  NAT: 'nat'
})

export const Chain = Object.freeze({
  INPUT: 'INPUT',
  PREROUTING: 'PREROUTING'
})

function getRule ({table, command, chain, target, fromPort, toPort, srcAddress}) {
  fromPort = fromPort || null
  toPort = toPort || null
  srcAddress = srcAddress || null

  let args = []
  args = args.concat(['-t', table])
  args = args.concat([command, chain])
  args = args.concat(['-p', 'tcp'])

  if (srcAddress) args = args.concat(['--src', srcAddress])
  if (fromPort) args = args.concat(['--dport', fromPort])

  args = args.concat(['-j', target])

  if (target == Target.REJECT) args = args.concat(['--reject-with', 'tcp-reset'])
  if (toPort) args = args.concat(['--to-port', toPort])

  return args
}

function checkRuleExists (args) {
  // returns true if the rule with args alreadys exists
  return new Promise((resolve, reject) => {
    const check = spawn('iptables', args)

    check.on('close', (code) => {
      if (code === 1) return resolve(false)
      return resolve(true)
    })
  })
}

export function execute ({table, command, chain, target, fromPort, toPort, srcAddress} = {}) {
  return new Promise((resolve, reject) => {
    fromPort = fromPort || null
    toPort = toPort || null
    srcAddress = srcAddress || null

    checkRuleExists(getRule({
      table: table,
      command: Command.CHECK,
      chain: chain,
      target: target,
      fromPort: fromPort,
      toPort: toPort,
      srcAddress: srcAddress
    })).then((exists) => {
      if (([Command.APPEND, Command.INSERT].includes(command) && exists) || (command === Command.DELETE && !exists)) {
        console.log(`ignoring execute(${table}, ${command}, ${chain}, ${target}, ${fromPort}, ${toPort}, ${srcAddress})`)
        resolve(true)
      }

      const iptables = spawn('iptables', getRule({
        table: table,
        command: command,
        chain: chain,
        target: target,
        fromPort: fromPort,
        toPort: toPort,
        srcAddress: srcAddress
      }))

      iptables.on('close', (code) => {
        if (code === 0) {
          console.log(`success execute(${table}, ${command}, ${chain}, ${target}, ${fromPort}, ${toPort}, ${srcAddress})`)
          resolve(true)
        } else {
          console.log(`fail execute(${table}, ${command}, ${chain}, ${target}, ${fromPort}, ${toPort}, ${srcAddress})`)
          resolve(false)
        }
      })
    })
  })
}
