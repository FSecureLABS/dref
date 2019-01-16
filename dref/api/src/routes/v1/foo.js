import resource from 'resource-router-middleware'

export default () => resource({
  id: 'foo',

  create: [
    (req, res) => {
      res.status(201).json({ 'foo': 'bar' })
    }
  ]
})
