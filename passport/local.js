'use strict';
//require('passport-local');
const { Strategy: LocalStrategy } = require('passport-local');
const { User }= require('../models/user');



//Note: Remember to drop the users collection or delete users that have plain-text password.!!!!!

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  User.findOne({ username })
    .then(results => {
      user = results;
      if (!user) {
        // Removed for brevity
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        // Removed for brevity
      }
      return done(null, user);
    })
    .catch(err => {
      // Removed for brevity
    });
});

module.exports = localStrategy;