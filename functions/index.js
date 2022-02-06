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
	var divAmount = (amount/100).toLocaleString(
		"en-gb", 
		{ minimumFractionDigits: 2 }
	);
	var msg = "Again?! Do you really need another £" + divAmount + " at " + merchant + " today?";
	var dbuser = dbUsers.doc(userID);
	const doc = await dbuser.get();
	if (!doc.exists) {
		console.error("No such document!");
	} else {
		console.log("Document data:", doc.data());
		var phone = doc.data().phone;
	}
	console.log(phone);
	client.messages
		.create({body: msg, from: "+447700161601", to: phone})
		.then(message => console.log(message.sid))
		.then(res.sendStatus(200))
		.catch((err) => console.error(err));
}