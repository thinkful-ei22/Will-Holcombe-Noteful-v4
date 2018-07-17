'use strict';

const express = require('express');

const passport = require('passport');



//const { User } = require('../models/user');//  ** added/user// two dots

const router = express.Router();


const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);

router.post('/', localAuth, function (req, res) {
  console.log('target post endpoint reached');
  return res.json(req.user);
});

module.exports = router;