const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();
var dbUsers = db.collection("users");

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.auth;
const client = require("twilio")(accountSid, authToken);

exports.spentMoney = functions.https.onRequest((req, res) => {
	if (req.body.type != "transaction.created") {
		res.send(500);
		return(false);
	}
	sendMsg(req.body.data.description, req.body.data.amount, req.body.data.account_id);
});

function sendMsg(merchant, amount, userID) {
	var msg = "Again?! Do you really need another £" + amount + " at " + merchant + " today?";
	var phone = dbUsers.doc(userID).phone;
	client.messages
		.create({body: msg, from: "Knulla", to: phone})
		.then(message => console.log(message.sid));
}