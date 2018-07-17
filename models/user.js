'use strict';
//const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
 const bcrypt = require('bcryptjs');

const UserSchema =new mongoose.Schema({
  fullName:{ type: String}, //no default: '' ?
  username:{ type: String, 
    required: true, 
    unique: true },
  password:{ type: String,
    required: true}

});
// Like the previous challenges, we'll use the mongoose transform
//  function to modify the results from the database and create a representation.
//   But this time you also need to prevent the password from being returned, so add a 
//   delete ret.password; statement to userSchema.set('toObject'...) like the following.
UserSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.password;
  }
});

// UserSchema.methods.validatePassword = function (password) {
//   return password === this.password;
// };

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};


const User = mongoose.model('User', UserSchema);

module.exports =  {User} ;