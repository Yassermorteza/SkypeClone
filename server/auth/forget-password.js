const crypto = require('crypto');
const User = require('../models/user.model');
const mailgun = require('../config/mailgun');

module.exports=(req, res, next)=>{
  const emailAddress = req.body.emailAddress;

  User.findOne({ emailAddress }, (err, User) => {
    if (err || User == null) {
      res.status(422).json({ error: 'Your request could not be processed as entered. Please try again.' });
      return next(err);
    }
    crypto.randomBytes(48, (err, buffer) => {
      const resetToken = buffer.toString('hex');
      if (err) { return next(err); }

      User.resetPasswordToken = resetToken;
      User.resetPasswordExpire = Date.now() + 3600000; // 1 hour

      User.save((err) => {
        if (err) { return next(err); }

        const message = {
          subject: 'Reset Password',
          text: `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://'}${req.headers.host}/auth/reset_password/${resetToken}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        mailgun.SendMail(User.emailAddress, message);

        return res.status(200).json({ message: 'Please check your email for the link to reset your password.' });
      });
    });
  });
};



