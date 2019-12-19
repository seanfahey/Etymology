'use strict';

const speechReprompt =  "<speak>What word would you like me to find out about?</speak>";

/**
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
 *
 * @param event
 * @param context
 */
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.application.applicationId !== '') {
            context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    let intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if ("EtymologyIntent" === intentName) {
        handleWordRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------

var CARD_TITLE = "Word Source";

/**
 * Get welcome response
 *
 * @param callback
 */
function getWelcomeResponse(callback) {
    let speechOutput = speechReprompt,
		sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": speechReprompt
    };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
}

/**
 * Handle word request
 * TODO handle app actions like 'help', 'exit', 'stop', 'cancel'
 *
 * @param intent
 * @param session
 * @param callback
 */
function handleWordRequest(intent, session, callback) {
    let speechOutput = 'Ok, looking up ' + intent.slots.Word.value + '. ',
		speechError = "Failed lookup",
		sessionAttributes = {
			"speechOutput": speechOutput,
			"repromptText": speechReprompt
		},
		https = require('https'),
		options = {
			host: 'www.etymonline.com',
			path: '/word/'+ intent.slots.Word.value
		},
		request = https.get(options, function(response) {
			console.log(intent.slots.Word.value);

			// handle the response
			let data = '';
			response.on('data', function(chunk) {
				data += chunk;
			});
			response.on('end', function() {
				console.log('response.on end');
				console.log(data);

				const cheerio = require('cheerio');

				console.log('loading data in cheerio');

				//parse the input
				//try {
					const $ = cheerio.load(data);
					console.log('cheerio loaded');
				//} catch (e) {
				//	console.log(e);
				//}

				console.log('loaded data in cheerio');

				let entry;
				try {
					console.log('getting word__defination');

					//where the entry for etymonline is located on the page
					entry = $("section[class^=word__defination]");
				} catch (e) {
					console.log('failed getting word__defination');
					console.log(e);

					speechOutput = '<speak>There was a problem parsing the word definition. </speak>';
					sessionAttributes.speechOutput = speechOutput;

					callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechReprompt, true));
				}

				console.log('found entry');

				// convert to text from html
				entry =	'<prosody rate="86%">' + entry.text() + '</prosody>';
				console.log(entry);

				if(entry === '' || entry == null || typeof entry === 'undefined'){
					entry = 'I could not find an entry for this word.'
				}
				speechOutput = '<speak>' + speechOutput + entry + '</speak>';
				sessionAttributes.speechOutput = speechOutput;

				callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechReprompt, true));
			});

		});

	request.on('error', function(err) {
		console.log("Request error: " + err.message);

		callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, "<speak>" + speechError + "Request error: " + err.message + "</speak>", speechReprompt, false));
	});
}

/**
 * Handle repeat request
 *
 * @param intent
 * @param session
 * @param callback
 */
function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

/**
 * Provide a help prompt for the user
 *
 * @param intent
 * @param session
 * @param callback
 */
function handleGetHelpRequest(intent, session, callback) {
    let speechOutput = "<speak>Ask me about the origin of a word and I will tell you about it.</speak>",
        repromptText = "<speak>Would you like to ask about another word?</speak>";
    callback(session.attributes,
		buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

/**
 * Handle Finish Sesssion Request
 * @param intent
 * @param session
 * @param callback
 */
function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Until next time", "", true));
}

// ------- Helper functions to build responses -------
/**
 * Build Speechlet Response
 *
 * @param title
 * @param output
 * @param repromptText
 * @param shouldEndSession
 */
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
	//remove ssml from card output
	let card_output = output.replace(/<.*?>/g, "");

    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Simple",
            title: title,
            content: card_output
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

/**
 * Build Speechlet Response Without Card
 * @param output
 * @param repromptText
 * @param shouldEndSession
 * @returns {{outputSpeech: {type: string, text: *}, reprompt: {outputSpeech: {type: string, text: *}}, shouldEndSession: *}}
 */
function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

/**
 * Build Response
 *
 * @param sessionAttributes
 * @param speechletResponse
 * @returns {{version: string, sessionAttributes: *, response: *}}
 */
function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}