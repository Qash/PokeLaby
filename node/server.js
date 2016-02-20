var http = require('http');
var request = require('request');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var util = require("util");
var users = [];
var lab;
var params = {};
var site = function(query, result){
	var pathurl = url.parse(query.url).pathname;
	
	if(pathurl.match("\.(html|js|css)$")){
		fs.readFile('../'+pathurl,'utf-8',function read(err, data){	
			params = querystring.parse(url.parse(query.url).query);
			if(pathurl.match("\.(html)$")){
				console.log("PARAMETRES PASSES");
				for (var param in params) {
					if (params.hasOwnProperty(param)) {
						console.log("	"+param + " -> " + params[param]);
						data = data.replace('<body>','<body><input type="hidden" name="param--'+param+'" value="'+params[param]+'"/>');
					}
				}
				console.log("/ PARAMETRES PASSES");
			}
			result.writeHead(200,{"Content-Type":"text/html"});
			result.write(data);
			result.end();
		});
	}
	else{
		var data = fs.readFileSync('home.html','utf-8');
		result.writeHead(200,{"Content-Type":"text/html"});
		result.write(data);
		result.end();
	}
}

var userExists = function(user){
	var ret = false;
	for (var scktId in users) {
		if (users.hasOwnProperty(scktId)) {
			if(users[scktId] === user){
				ret = true;
			}
		}
	}
	return ret;
};

// Serveur
var server = http.createServer(site);

console.log("Serveur en route");
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	console.log('CONNECT : '+ socket.id)
	users.push(socket.id);

	socket.on('launchGame', function(size){
		console.log("PARAMS ", size);
		request('http://localhost/PokeLabTest/laby.php?taille='+size, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				lab = JSON.parse(body);
				
				var datas ={};
				datas.laby = lab;
				datas.players = {};
				
				for (var i = 0; i < users.length; i++) {
					datas.players["player-"+(i+1)] = {};
					datas.players["player-"+(i+1)].id = users[i];
					switch(i){
						case 0:
							datas.players["player-"+(i+1)].x = 0;
							datas.players["player-"+(i+1)].y = 0;
							datas.players["player-"+(i+1)].color = '#FF633A'; //rouge
							break;
						case 1:
							datas.players["player-"+(i+1)].x = size-1;
							datas.players["player-"+(i+1)].y = 0;
							datas.players["player-"+(i+1)].color = '#4F91C0'; //bleu
							break;
						case 2:
							datas.players["player-"+(i+1)].x = 0;
							datas.players["player-"+(i+1)].y = size-1;
							datas.players["player-"+(i+1)].color = '#FFE15F'; //jaune
							break;
						case 3:
							datas.players["player-"+(i+1)].x = size-1;
							datas.players["player-"+(i+1)].y = size-1;
							datas.players["player-"+(i+1)].color = '#6EBE59'; //vert
							break;
					}
				}
				socket.broadcast.emit("initLab",datas);
				socket.emit("initLab",datas);

			}
		});

});


socket.on('ident', function(user){
	console.log(user+" est connecté");
	if(!userExists()) users[socket.id] = user;
	console.log("after",users);
});

socket.on('msgSent', function(datas){
	socket.emit("message","ME > "+datas.text);
	socket.broadcast.emit("message",datas.user+" > "+datas.text);
});

socket.on('liste',function (msg){
	console.log('envoi liste');
	socket.emit('liste', users);
	socket.broadcast.emit('liste', users);
});

socket.on('disconnect', function(){
	console.log('DECONNEXION '+users[socket.id]);
	console.log(socket.id);
});
});


server.listen(8080);
