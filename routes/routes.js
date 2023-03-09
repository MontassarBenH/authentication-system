const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  user.save((err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error registering new user please try again.');
    } else {
      res.redirect('/login');
    }
  });
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error on the server.');
    } else if (!user) {
      res.status(401).send('Invalid email or password.');
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send('Error on the server.');
        } else if (!result) {
          res.status(401).send('Invalid email or password.');
        } else {
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: 86400,
          });
          res.cookie('token', token, { httpOnly: true });
          res.redirect('/dashboard');
        }
      });
    }
  });
});

router.get('/dashboard', auth, (req, res) => {
  res.render('dashboard');
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
