const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Payload } =require("dialogflow-fulfillment");
const app = express();

var username = "";
const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var randomstring = require("randomstring"); 

console.log("Running");
app.post("/",express.json(),(req,res)=>{
	const agent = new WebhookClient({
		request: req,response : res
	});

	async function sendres(){
		console.log("yo");
		accno = agent.parameters.number;
		const client = new MongoClient(url,{ useUnifiedTopology: true });
		await client.connect();
		const userdetails = await client.db("chatbotusers").collection("users").findOne({
			acc_no : accno 
		}); 
		username = userdetails.name;
		await agent.add("Hi "+username+" How could I help you");
	}
	
	async function problem(){
		var payloaddata = {
			"richContent" : [
				[
					{
						"type": "list",
						"title": "Internet Down",
						"subtitle": "Press '1' for Internet is down",
						"event": {
							"name": "",
							"languageCode": "",
							"parameters": {}
						}
					},
					{
						"type": "divider"
					},
					{
						"type": "list",
						"title": "Slow Internet",
						"subtitle": "Press '2' Slow Internet",
						"event": {
							"name": "",
							"languageCode": "",
							"parameters": {}
						}
					},
				{
						"type": "divider"
					},
				{
						"type": "list",
						"title": "Buffering problem",
						"subtitle": "Press '3' for Buffering problem",
						"event": {
							"name": "",
							"languageCode": "",
							"parameters": {}
						}
					},
					{
						"type": "divider"
					},
					{
						"type": "list",
						"title": "No connectivity",
						"subtitle": "Press '4' for No connectivity",
						"event": {
							"name": "",
							"languageCode": "",
							"parameters": {}
						}
					},
					{
						"type": "divider"
					}
					,
					{
						"type": "list",
						"title": "Internet Down",
						"subtitle": "Press '5' for Internet is down",
					}

				]
			]
		}
		agent.add(new Payload(agent.UNSPECIFIED,payloaddata,{sendAsMessage:true, rawPayload:true }));
	}
	function handissue(){
		var issue_vals={1:"Internet Down",2:"Slow Internet",3:"Buffering problem",4:"No connectivity",5:"Wiring Problem"};
		const intent_val=agent.parameters.number;
	
	var val=issue_vals[intent_val];
	
	var trouble_ticket=randomstring.generate(7);

	//Generating trouble ticket and storing it in Mongodb
	//Using random module
	MongoClient.connect(url, function(err, db) {
	var dbo = db.db("chatbotusers");
		
	var u_name = username;    
		var issue_val=  val; 
		var status="pending";

	let ts = Date.now();
		let date_ob = new Date(ts);
		let date = date_ob.getDate();
		let month = date_ob.getMonth() + 1;
		let year = date_ob.getFullYear();

		var time_date=year + "-" + month + "-" + date;

	var myobj = { username:u_name, issue:issue_val,status:status,time_date:time_date,trouble_ticket:trouble_ticket };

		dbo.collection("user_issues").insertOne(myobj, function(err, res) {
		if (err) throw err;
		db.close();    
	});
 });
	agent.add("Dear "+username+",we regret the inconvience caused" +" The issue reported is: "+ val +
	"\nThe ticket number is: "+trouble_ticket);
	agent.add("We will reach you out Soon! ")
	}

	var intentMap = new Map();
	intentMap.set("Account Number",sendres);
	intentMap.set("Account Number - next",problem);
	intentMap.set("select_issue",handissue);
	agent.handleRequest(intentMap);
})

app.listen(process.env.PORT || 8080);