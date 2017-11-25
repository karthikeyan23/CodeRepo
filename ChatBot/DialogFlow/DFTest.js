var apiai = require('apiai');
 
var app = apiai("ae02f46f39f94a9e9faa5d05777d7f01");
 
var request = app.textRequest('HI', {
    sessionId: 'test'
});
 
request.on('response', function(response) {
    console.log(response);
});
 
request.on('error', function(error) {
    console.log(error);
});
 
request.end();