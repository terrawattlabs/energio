// Include Cloud Code module dependencies
var express = require('express');
    twilio = require('twilio');


// Create an Express web app (more info: http://expressjs.com/)
var app = express();
app.use(express.urlencoded());
 
// Create a route that will respond to am HTTP GET request with some
// simple TwiML instructions

 
// Start the Express app
app.listen();

 var authToken = 'da9c29a9a9ceda42b101242c8b5bfdb9';
 var sid = "AC73f7249b29a458ccfb05e1ca469023aa";
 var options = {};


app.post('/sms', function (request, response) {
    // Create a TwiML response generator object
    var twiml = new twilio.TwimlResponse();
    
    twiml.Message('hello world');

    // add some instructions
    // twiml.dial(function (res) {
    //   res.number('+17341111111');
    // }, { action: "http://custdiscdev.parseapp.com/recording", record: "record-from-answer", method: "POST"});

 
    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());
  

    
});


app.get('/api/incoming', function (request, response) {
    // Create a TwiML response generator object
    var twiml = new twilio.TwimlResponse();
    var clientName = request.params.clientID;
    // add some instructions
     
    // twiml.dial('+19082954795');

 twiml.dial(function (res) {
      res.number('+19082954795');
    }, { callerId: "+17324121092"});

    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());

    
});


// app.post('/sms', twilio.webhook(authToken,{
//     validate:false
// }), function(request, response) {
//     var twiml = new twilio.TwimlResponse();
//     twiml.message('Sorry - there was an error processing your message.');
//     response.send(twiml);
// });




    Parse.Cloud.define("sendEnergyTexts", function (request,response) {
    	// Require and initialize the Twilio module with your credentials
    var accountSid = 'AC73f7249b29a458ccfb05e1ca469023aa';
    var authToken = 'da9c29a9a9ceda42b101242c8b5bfdb9';
    var client = require('twilio')(accountSid, authToken);

    var numbersList = request.params.numbersSet;

    for (var i = numbersList.length - 1; i >= 0; i--) {
    	
          	// Send an SMS message
          client.sendSms({
              to: numbersList[i], 
              from: '+17324121092', 
              body: request.params.msgBody
            }, function (err, responseData) { 
              if (err) {
                response.error(err);
                console.log(err);
              } else {
              if (i == 0) {response.success(responseData.body) }; 
                console.log(responseData.from); 
                console.log(responseData.body);
              }
            }
          );

          


    };

    }); 



Parse.Cloud.job("sendWeeklySMS", function(request, status) {
  

 // start cloud code 
    var Locations = Parse.Object.extend("Locations");
    var query = new Parse.Query("Locations");
    var td = new Date();
    var day = td.getDay();
    console.log(day);

    query.equalTo("frequency", "weekly");
    query.equalTo("day", day);
      query.find({
        success: function(results) {
          console.log(results);
          compileTexts(results);
        },
        error: function() {
          response.error("location failed");
        }
      });
});

Parse.Cloud.job("sendDailySMS", function(request, status) {
  

 // start cloud code 
    var Locations = Parse.Object.extend("Locations");
    var query = new Parse.Query("Locations");
    query.equalTo("frequency", "daily");
      query.find({
        success: function(results) {
          console.log(results);
          compileTexts(results);
        },
        error: function() {
          response.error("location failed");
        }
      });
});


      // for-loop to build each text, run sendText() to actually send off the msg
      function compileTexts (locs){
        for (var i = 0; i <= locs.length -1; i++) {
          console.log(locs.length);
          var sendTo = locs[i].get('phone_1');
          var electricityCost = locs[i].get('elec_cost');
          var name = locs[i].get('name_1');

          var phone_2 = locs[i].get('phone_2');
          var name_2 = locs[i].get('name_2');

          var phone_3 = locs[i].get('phone_3');
          var name_3 = locs[i].get('name_3');

          var phone_4 = locs[i].get('phone_4');
          var name_4 = locs[i].get('name_4');

          var phone_5 = locs[i].get('phone_5');
          var name_5 = locs[i].get('name_5');

          getReadingSend(sendTo, electricityCost, name, locs[i], phone_2, name_2, phone_3, name_3, phone_4, name_4, phone_5, name_5);

         
        };
      };



      function getReadingSend(sendTo, elec, name, location, phone_2, name_2, phone_3, name_3, phone_4, name_4, phone_5, name_5) {
           // pull previous reading
            var MeterRead = Parse.Object.extend("Meter_Readings");
            var query = new Parse.Query(MeterRead);
            query.equalTo("location", location);
            query.descending("createdAt");
            query.limit(1);
            query.find({
              success: function(reading) {
                console.log('in the success block');
                console.log(reading);

                var daily = (elec * reading[0].get('kwh_per_day')).toFixed(2);
                var monthly = (elec * reading[0].get('kwh_per_month')).toFixed(0);
                var multiple = reading[0].get('multiple_from_prev');
                var percentage;
                var percHelper;
                var customMsg;
                var body;

                if (multiple >= 1) {
                  percentage = ((multiple -1) * 100).toFixed(0);
                  percHelper = "higher";
                  customMsg = "Remember to turn those lights off!"
                } else {
                  percentage = ((1 - multiple) * 100).toFixed(0);
                  percHelper = "lower";
                  customMsg = "Keep up the great work!"
                };

                body = ", your house has been using $" + 
                daily + 
                "/day of electricity. That's about $" +
                monthly +
                "/mo. and " +
                percentage +
                "% " +
                percHelper +
                " than last measured. " +
                customMsg;

                var sendList = [];
                sendList[0] = {"name" : name, "phone" : sendTo};

                if (phone_2 !== undefined) {
                  sendList[1] = {"name" : name_2, "phone" : phone_2};
                };
                if (phone_3 !== undefined) {
                  sendList[2] = {"name" : name_3, "phone" : phone_3};
                };
                if (phone_4 !== undefined) {
                  sendList[3] = {"name" : name_4, "phone" : phone_4};
                };
                if (phone_5 !== undefined) {
                  sendList[4] = {"name" : name_5, "phone" : phone_5};
                };

                console.log(sendList);

                for (var i = sendList.length - 1; i >= 0; i--) {
                  var sendBody = sendList[i].name + body;
                  sendText(sendList[i].phone, sendBody);
                };
                

              },
              error: function(object, error) {
                console.log(error);
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
              }
            });
          

      };

      // called from compileTexts() to send the msg.
      function sendText (toNumber, theBody) {
          console.log("i'm in the send text function");
          var accountSid = 'AC73f7249b29a458ccfb05e1ca469023aa';
          var authToken = 'da9c29a9a9ceda42b101242c8b5bfdb9';
          var client = require('twilio')(accountSid, authToken);
          console.log('seems to be working');
            // Send an SMS message
          client.sendSms({
              to: toNumber, 
              from: '+17324121092',
              body: theBody
            }, function (err, responseData) { 
              if (err) {
                console.log('there was an error with the text');
                // response.error(err);
                console.log(err);
              } else {
                console.log('there was no error!');
                console.log(responseData.from); 
                console.log(responseData.body);
              }
            }
          );
          console.log('did it send the texts?')
      };

      // end cloud code





