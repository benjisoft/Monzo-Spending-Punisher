const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
var dbUsers = db.collection("users");

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.auth;
const client = require("twilio")(accountSid, authToken);

exports.spentMoney = functions.region("europe-west2").https.onRequest((req, res) => {
	if (req.body.type != "transaction.created") {
		console.log("Incorrect transaction type");
		res.sendStatus(500);
		return(false);
	}
	sendMsg(res, req.body.data.description, req.body.data.amount, req.body.data.account_id);
});

async function sendMsg(res, merchant, amount, userID) {
	var divAmount = convertToMoney(amount);
	var dbuser = dbUsers.doc(userID);
	var msg;
	const doc = await dbuser.get();
	if (!doc.exists) {
		console.error("No such user!");
	} else {
		var phone = doc.data().phone;
		var currentQty = doc.data()[merchant];
		dbuser.set({
			[merchant]: Number(currentQty) + 1
		}, {merge: true});
		switch (currentQty) {
		case 1: 
			msg = "Fine, I'll let you off just this once. But watch it,ß we don't want to spend too much at " + merchant;
			break;
		case 2:
		case 3:
		case 4:
		case 5:
			msg = "Again?! Do you really need to spend another £" + divAmount + " at " + merchant + " this month?";
			break;
		case 10:
			msg = "10 times at " + merchant + ". I'm just disapointed in you now. ";
			break;
		default: 
			msg = "How many?! You're really spending £" + divAmount + " at " + merchant + " for the " + th(currentQty) + " time this month!";
			break;
		}
	}
	client.messages
		.create({body: msg, from: "+447700161601", to: phone})
		.then(message => console.log(message.sid))
		.then(res.sendStatus(200))
		.catch((err) => console.error(err));
}

function convertToMoney(amount) {
	return((amount/100).toLocaleString(
		"en-gb", 
		{ minimumFractionDigits: 2 }
	).split("-")[1]);
}

function th(i) {
	var j = i % 10,
		k = i % 100;
	if (j == 1 && k != 11) {
		return i + "st";
	}
	if (j == 2 && k != 12) {
		return i + "nd";
	}
	if (j == 3 && k != 13) {
		return i + "rd";
	}
	return i + "th";
}