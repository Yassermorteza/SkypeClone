const config = require('./config').mailgun;
const mailgun = require('mailgun-js')({apiKey: config.API_KEY, domain: config.DOMAIN});

exports.SendMail =(mailTo, message)=>{
	const data = {
		from: config.FROM,
		to: mailTo,
		subject: message.subject,
		text: message.text
	};

	mailgun.messages().send(data, (error, body)=>{
		console.log(body);
	});
}



