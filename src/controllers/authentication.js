const {checkUser} = require('../models/usersModel');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt-node');
const config = require('../settings/settings');
const jwt = require('jsonwebtoken');
const tokenList = {};



function tokenForUser (userId){
  const timeStamp = new Date().getTime();
  const token = jwt.sign({  sub : userId , iat : timeStamp , exp: Math.floor(Date.now() / 1000) + (60 * 60), }, config.secret)
  const refreshToken = jwt.sign({  sub : userId , iat : timeStamp ,exp: Math.floor(Date.now() / 1000) + (60 * 60), }, config.refreshTokenSecret)
  const access = { 
        "token": token,
        "refreshToken": refreshToken,
      };
  tokenList[refreshToken] = access
  return access
}
exports.signIn = function(req ,res ,next){
    //User has already had their email and password auth'd
    //We just need to give them a token
    res.cookie(tokenForUser(req.user))
    res.json(tokenForUser(req.user))
}
exports.signup = function (req, res, next) {
  const { email } = req.body;
  const { password } = req.body;
  if (!email || !password){
    res.status(422).json({error:"Email or Password not provided"})
  }else{
   // See if a user with given email exists
  checkUser(email,(data )=>{
    if(data[0] == undefined || data[0] == null) {res.status(403).json({error:"User Not Found"})}
    else {
      //if exists compare passwords
      var hash = data[0].password;
      bcrypt.compare(password, hash, function(err, responce) {
        if(responce){
        // res.status(200).send("User is Authenticated")
          res.json({token : tokenForUser(data[0].id)})
      }
        else{
          res.status(200).send("Incorrect Email or Password")
        }
    });
    }
  });
}
 
  // See if a user with given email exists
 
  // If a user with email exists ,return an error

  // If a user with email doesn't exist ,create and save user record

  // Respond to request indicating that user was created
};

