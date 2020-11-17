const express = require('express')
const router = express.Router()
const userServices = require('../services/users')


const mongoConnection = new userServices()
router.get('/users', async (req, res) => {
  const users = await mongoConnection.getUsers()
  res.json({
    data: users,
    message: 'hola'
  })
})

router.get('/users/:id', async (req, res) => {
  const { id } = req.params
  const user = await mysqlConnection.getUser(id)
  res.json({
    data: user,
    message: 'ok'
  })
})

router.post('/users', async (req, res) => {
  const { name, username, password } = req.body
  const user = await mysqlConnection.createUser({ name, username, password })
  res.json(user)
})

router.put('/users/:id', async (req, res) => {
  const { id } = req.params
  const { name, username, password } = req.body
  const user = await mysqlConnection.updateUser(id, { name, username, password })
  res.json(user)
  
})

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params
  const user = await mysqlConnection.deleteUser(id)
  res.json(user)
})


module.exports = router