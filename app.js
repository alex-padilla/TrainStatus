var restify = require('restify');
var builder = require('botbuilder');
var axios = require('axios'); // Promise based HTTP client for browsers and node.js

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// TFL App ID and App Key for demonstration purposes only
const appId = '71e28a96';
const appKey = '2b7d3637da7bb9a8589eb5a3e74cedad';

//Empty array of TFL Lines
var tflLines = [];

// URL for querying the different tube lines and other modes (overground, dlr, tram, tfl rail) on the TFL API
const linesURL = 'https://api.tfl.gov.uk/Line/Mode/tube%2Cdlr%2Ctram%2Coverground%2Ctflrail?app_id=' + appId + '&app_key=' + appKey;

// Gets the ID of the lines and other modes and stores them into the tflLines array
axios.get(linesURL)
      .then(function(response){                             //If querying was successful, and TFL API sent a response, it goes to this promise
          for(i = 0; i < (response.data).length; i++){      //This checks how many elements are there in the response array sent back by the TFL API and loop over all of them
              tflLines.push(response.data[i]['id']);        //This accesses the ID of the line from the response and stores it to the tflLines array
          }
      })
      .catch(function(error){
          console.log(error);   //This prints out the error in the console
      });


// Receive messages from the user and respond by giving the status of the line the user has asked for
var bot = new builder.UniversalBot(connector, function (session) {

    // Splits user input into each word and transforms it to lower case and split each word by space
    var inputSplitWords = session.message.text
            .replace(/[.,?!;()"'-]/g, "")     //This replaces [.,?!;()"'-] with nothing
            .replace(/\s+/g, " ")             //This replaces \s+ with a space
            .toLowerCase()                    //This transforms the words into lowercase
            .split(" ");                      //This splits the user input by a space and stores it into inputSplitWords array

    //Empty array for corrected inputs
    var correctedInput = [];

    //Stores the original word count of the user input that has been split in inputSplitWords
    var originalSentenceCount = inputSplitWords.length;

    /** Checks each word in inputSplitWords array.
        -- If it matches, add it to the correctedInput array
        -- If the word is a spelling mistake that matches any of the cases below, correct it and push it to the correctedInput array
        -- If the word doesn't match any of the cases, remove it from inputSplitWords. It WILL NOT be added to the correctedInput array
    **/
    for(var a = 0; a < inputSplitWords.length; a++){
        switch(inputSplitWords[a]){
          //For tube
          case "met": case "metro": case"metropolitan": correctedInput.push('metropolitan'); break;
          case "baker": case "bakerlo": case"bakerloo": correctedInput.push('bakerloo'); break;
          case "cir": case "circel": case "circle": correctedInput.push('circle'); break;
          case "district": correctedInput.push('district'); break;
          case "ham&city": case "hamersmith": case "hammersmith city": case "hammersmith & city": correctedInput.push('hammersmith-city'); break;
          case "jubile": case "jub": case "jubilee": correctedInput.push('jubilee'); break;
          case "northern" : correctedInput.push('northern');  break;
          case "picadily": case "pic": case "picadilly": case "piccadily": correctedInput.push('piccadilly'); break;
          case "vic": case "victoria": correctedInput.push('victoria');  break;
          case "waterloo": case "waterloo and city": case "waterloo city": case "waterloo & city": correctedInput.push('waterloo-city'); break;
          case "central": correctedInput.push('central'); break;

          //For other lines
          case "og": case "london overground": case "overground": correctedInput.push('london-overground'); break;
          case "dlr": correctedInput.push('dlr'); break;
          case "trams": case "tram": correctedInput.push('tram'); break;
          case "tfl": case "tflrail": case "tfl rail": case "tfl-rail": correctedInput.push('tfl-rail'); break;
          default:
            inputSplitWords.splice(a, 1); // This removes any word that does not match any of the cases stated above
            a--; // added this so that the counter will not skip a word from the list
        }
    }

    // This checks if there are duplicates in the correctedInput array and returns an array that contains no duplicates
    var uniqueCorrectedInput = correctedInput.filter(function(element, position) {
        return correctedInput.indexOf(element) == position;
    });

    // If the original input doesn't contain any valid lines to query, then the bot will respond with "Please enter a valid line to query."
    if(uniqueCorrectedInput.length === 0){
        session.send ("Please enter a valid line to query. This can be a London Underground, London Overground, TFL rail, DLR, or Tram lines.");
    }

    else{
        var lineStatus;
        var lineName;
        var lineSeverity;
        var lineReason;

        for(var a = 0; a < uniqueCorrectedInput.length; a++){ // For all the elements in the uniqueCorrectedInput array
            const queryURL = 'https://api.tfl.gov.uk/Line/' + correctedInput[a] + '/Status?detail=true&app_id=' + appId + '&app_key=' + appKey; //URL of the query

            axios.get(queryURL).then(function(response){              // The bot will query the API per the line stored in the uniqueCorrectedInput array
                queryResponse = response.data;                        // This will contain the parsed JSON response from the query if the query is successful

                lineStatus = queryResponse[0]['lineStatuses'];        // This will contain the array of lineStatuses from the response
                lineName = queryResponse[0]['name'];                  // This will contain the line name from the response
                lineSeverity = lineStatus[0]['statusSeverityDescription']; // This will contain the status severity description (Good service, Minor Delays, Severe Delays) from the response

                // If the lineSeverity is good service, then the bot will reply with the message below.
                if(lineSeverity == "Good Service"){
                    session.send("There is a " + lineSeverity + " on the " + lineName + " line.");
                }

                //If the lineSeverity is minor or severe delays, it will contain a reason. The bot will reply with the status of the line and the reason why there is a minor/severe delays
                else{
                   lineReason = lineStatus[0]['reason'];
                   session.send("There is a " + lineSeverity + " on the " + lineName + " line. " + lineReason);
               }

            }).catch(function(error){
              console.log(error); //This prints out the error in the console
            });
          }
      }
});
