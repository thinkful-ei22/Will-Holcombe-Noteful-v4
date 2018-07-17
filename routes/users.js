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
// router.get('/test', function(req, res){
//     res.json({message: 'we r in'});
// });
router.post('/', function (req, res, next) {
  // NOTE: validation removed for brevity
  console.log('post endpoint reached');
  let { username, password, fullName } = req.body;
  
  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullName
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
      
    
});

module.exports = {router};