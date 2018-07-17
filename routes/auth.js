'use strict';

const express = require('express');

const passport = require('passport');

const jwt = require('jsonwebtoken');

//const { User } = require('../models/user');//  ** added/user// two dots

const router = express.Router();


const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);
// First, npm install the jsonwebtoken and require it. Then in /routes/auth.js file, require config.js 
// and extract JWT_SECRET and JWT_EXPIRY using object destructuring. 
const { JWT_SECRET, JWT_EXPIRY } = require('../config');


function createAuthToken (user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

router.post('/', localAuth, function (req, res) {
  console.log('auth post endpoint reached');
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = router;