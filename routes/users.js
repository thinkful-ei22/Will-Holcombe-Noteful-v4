'use strict';
const express = require('express');




const { User } = require('../models/user');//  ** added/user// two dots

const router = express.Router();



// router.post('/users', (req, res) => {
 
//   let {username, password, fullName} = req.body; // no =''?
//   fullName.trim();
    
//   //digest =  User.hashPassword(password);
//   return User.create({
//     username, 
//     password,
//     fullName
//   })
//     .then(user => {
//       return res.status(201).location(`/api/users/${user.id}`).json(user.apiRepr());
//     });
//});
router.get('/test', function(req, res){
    res.json({message: 'we r in'});
});
router.post('/', function (req, res) {
  // NOTE: validation removed for brevity
  console.log('post endpoint reached');
  let { username, password, fullName } = req.body;
  
  return User
    .find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.create({ username, password, fullName });
    })
    .then(user => {
      return res.location(`/api/users/${user.id}`).status(201)
        .json(user);//serialize
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      else{
        res.status(500).json({ code: 500, message: 'Internal server error' });
      }
      
    });
});

module.exports = {router};