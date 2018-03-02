const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const mailgun = require('../config/mailgun');

module.exports = (req, res, next)=>{
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpire: { $gt: Date.now() } }, (err, User) => {
    if (!User) {
        if (err) { return next(err); }
        res.status(422).json({ error: 'Your token has expired. Please attempt to reset your password again.' });
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) { return next(err); }
        User.password = hash;
        User.resetPasswordToken = undefined;
        User.resetPasswordExpire = undefined;
        User.save((err) => {
        if (err) { return next(err); }
        const message = {
          subject: 'Password Changed',
          text: 'You are receiving this email because you changed your password. \n\n' +
          'If you did not request this change, please contact us.'
        };

        mailgun.SendMail(User.emailAddress, message);

        return res.status(200).json({ message: 'Password changed successfully. Please login with your new password.' });
        });    
      });
    });
  });
};
