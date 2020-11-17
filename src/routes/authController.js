const { Router } = require('express');
const cors = require('cors')
const corsOptions = require('../config/corsOptions')

const router = Router();

/* const User = require('../models/User');*/
const verifyToken = require('../controllers/verifyToken')
const bcrypt = require('bcryptjs');


const jwt = require('jsonwebtoken');
const config = require('../config');

const MySqlLib = require('../database')
const mysqlConnection = new MySqlLib()

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};


router.post('/singup', cors(corsOptions), async (req, res) => {
    try {
        console.log('si entra')
        // Receiving Data
        let { name, username, password } = req.body;
        password = await encryptPassword(password)
        // Creating a new User
        const user = await mysqlConnection.createUser({
          name,
          username,
          password
      })

        // Create a Token
        const token = jwt.sign({ id: user.data.insertId }, config.secret, {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
        });
        console.log('Registro????')
        res.json({ auth: true, token });

    } catch (e) {
        console.log(e)
        res.status(500).send('There was a problem registering your user');
    }
});

router.get('/me', verifyToken, async (req, res) => {
    // res.status(200).send(decoded);
    // Search the Info base on the ID
    // const user = await User.findById(decoded.id, { password: 0});
    console.log("Est es er.userId", req.userId)
    const user = await mysqlConnection.getUser(req.userId);
    if (!user) {
        return res.status(404).send("No user found.");
    }
    res.status(200).json(user);
});

router.post('/singin', async (req, res) => {
    const user = await mysqlConnection.getUserByUsername(req.body.username)
    console.log("Este es el usuario encontrado", user)
    if(!user) {
        return res.status(404).send("The email doesn't exists")
    }
    console.log("Este es la contraseña que llegó", req.body.password)
    console.log("Este es la contraseña de base de datos", user.password)
    
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
        return res.status(401).send({auth: false, token: null});
    }
    const token = jwt.sign({id: user.id}, config.secret, {
        expiresIn: 60 * 60 * 24
    });
    res.status(200).json({auth: true, token});
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;