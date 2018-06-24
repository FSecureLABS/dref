export default function (req, res, next) {
  // get subdomain
  for (var i = 0; i < req.subdomains.length; i++) {
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]$/.test(req.subdomains[i])) {
      req.target = req.subdomains[i]
    }
  }

  // get port
  req.port = req.get('host').split(':')[1]
  if (!req.port) {
    req.port = 80
  }

  // check we have both
  if (req.port && req.target) next()
  else res.status(400).send()
}
