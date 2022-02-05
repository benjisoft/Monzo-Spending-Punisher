const functions = require("firebase-functions");
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

initializeApp();

const db = getFirestore();
var dbUsers = db.collection("users");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

exports.spentMoney = functions.https.onRequest((request, response) => {
    sendMsg();
});

function sendMsg(merchant, amount, userID) {
	var msg = "Again?! Do you really need another £" + amount + " " + merchant + " today?";
	var phone = dbUsers.doc(userID).phone;
	client.messages
		.create({body: msg, from: "Knulla", to: phone})
		.then(message => console.log(message.sid));
}