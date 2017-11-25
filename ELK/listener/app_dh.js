var amqp = require('amqplib/callback_api');
var http = require('http'),
	url = require('url');


var server = http.createServer(function(req, res){ 
	// your normal server code 
  var path = url.parse(req.url, true).query;
	
 amqp.connect('amqp://logstash:logstash@localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'pi-sensory-exchange';
    var msg = JSON.stringify(path);
    console.log(msg)
    ch.assertExchange(ex, 'direct', {durable: true});
    ch.publish('pi-sensory-exchange', 'pi-sensory-key', new Buffer(msg));
    console.log(" [x] Sent %s", msg);
  });

  setTimeout(function() { conn.close() }, 500);
});   


	res.writeHead(200, {'Content-Type':'text/html'})
	res.write('OK', 'utf8');
	res.end();
});

server.listen(8001);
