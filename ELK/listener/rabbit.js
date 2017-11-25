var http = require('http'),
	url = require('url'),
	amqp = require('amqp');

var exchange


function sendMsg(msg)
{
  console.log(msg)
  if(exchange)
  {  

    exchange.publish('pi-sensory-key',msg, {durable: true,contentType: 'application/json'}, function(res) {
        console.log('confirmed ',res);
      })

  }
  else
  {
    console.log("exchange not around now...")
  }
}

var server = http.createServer(function(req, res){ 
	// your normal server code 
  	var path = url.parse(req.url, true).query; 

	//sendMsg(path);
	res.writeHead(200, {'Content-Type':'text/html'})
	res.write('OK', 'utf8');
	res.end();
});




var rabbitMQ = amqp.createConnection({ host: 'localhost', login: 'logstash', password: 'logstash' });

rabbitMQ.addListener('ready', function(){
  
  // create the exchange if it doesnt exist
  exchange = rabbitMQ.exchange('pi-sensory-exchange',{type: 'direct', confirm: true})

});  






server.listen(8000);