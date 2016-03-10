var http = require('http');
var request = require('request');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var util = require("util");
var users = {};
var games = {'test':{gameId:'test', creator:'machinChouette', maxPlayers:4, players:[], nbConPlyrs:0}};
var params = {}

var site = function(query, result){
	var pathurl = url.parse(query.url).pathname;
	if(pathurl.match("\.(js|css)$")){
		fs.readFile('../'+pathurl,'utf-8',function read(err, data){	
			result.writeHead(200,{});
			result.write(data);
			result.end();
		});
	}
	else{
		
		fs.readFile('home.html','utf-8',function read(err, data){
			params = querystring.parse(url.parse(query.url).query);
			for (var param in params) {
				if (params.hasOwnProperty(param)) {
					console.log("	"+param + " -> " + params[param]);
					data = data.replace('<body>','<body><input type="hidden" name="param--'+param+'" value="'+params[param]+'"/>');
				}
			}
			result.writeHead(200,{"Content-Type":"text/html"});
			result.write(""+data);
			result.end();
		});
	}
}

var server = http.createServer(site);

console.log("Serveur en route");
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	console.log('CONNECT : '+ socket.id);

	socket.on('gameCreated', function(datas){
		console.log("Game Created -- ");
		for (var singleData in datas) {
			if (datas.hasOwnProperty(singleData)) {
				console.log("   "+singleData + " -> " + datas[singleData]);
			}
		}
		if(games[datas.name] === undefined){
			var game = {
				gameId: datas.name, 
				creator: datas.username, 
				maxPlayers: datas.maxPlayers, 
				players: [], 
				nbConPlyrs: 0
			};
			game.players[0] = {
				userId: socket.id, 
				username: game.creator, 
				x: 0, 
				y: 0, 
				color: "transparent", 
				readyState: false
			};
			game.nbConPlyrs = Object.size(game.players);
			games[datas.name] = game;

			users[datas.username].where = "launchGame_"+game.gameId;
			var redirDatas = {'username': datas.username, 'game':game};
			socket.emit('redirection', getContentFrom('launchGame', redirDatas, socket));
			socket.emit('updateGame',game);
			socket.broadcast.emit('newGameCreated', game);
		}
		else{
			socket.emit('nameAlreadyTaken', null);
		}
	});

	socket.on('wantToJoinGame', function(datas){
		var theGame = games[datas.gameName];
		if(theGame.players.length < theGame.maxPlayers){
			theGame.players[theGame.players.length] = {
				userId: users[datas.username].sckt, 
				username: datas.username, 
				x:0, 
				y:0, 
				color:"transparent", 
				readyState:false
			};
			theGame.nbConPlyrs =  theGame.players.length;
			games[datas.gameName] = theGame;
			users[datas.username].where = 'launchGame_'+ datas.gameName;
			var redirDatas = {'username':datas.username, 'game':theGame}; 
			socket.emit('redirection', getContentFrom('launchGame', redirDatas, socket));
			socket.broadcast.emit('gameUpdated', theGame);
			emitToGame(theGame.players, [socket.id], "gameUpdated", theGame, socket);
		}
		else{
			socket.emit('noMorePlayers', null);
		}
	});

	socket.on('changeReadyState', function(user){
		var gameConcerned = games[users[user].where.slice(users[user].where.indexOf('_')+1)];
		var gameReady = true;
		for(var i = 0;i<gameConcerned.players.length;i++){
			if(gameConcerned.players[i].username === user){
				gameConcerned.players[i].readyState = !gameConcerned.players[i].readyState;
				var log = gameConcerned.players[i].readyState? gameConcerned.players[i].username + ' is ready' : gameConcerned.players[i].username + ' is not ready';
				console.log(log + ' on ' + gameConcerned.gameId);
			}
			gameReady = (gameReady && gameConcerned.players[i].readyState);
		}
		games[users[user].where.slice(users[user].where.indexOf('_')+1)] = gameConcerned;
		if(gameReady){
			for (var i = 0; i < gameConcerned.players.length; i++) {
				games[users[user].where.slice(users[user].where.indexOf('_')+1)].players[i].where = 'labyrinthe_'+gameConcerned.gameId;
			}
			var redirDatas = games[users[user].where.slice(users[user].where.indexOf('_')+1)];
			// socket.emit('redirection', getContentFrom('labyrinthe', redirDatas, socket));
			emitToGame(gameConcerned.players, [], "redirection", getContentFrom('labyrinthe', redirDatas, socket), socket);
		}else{
			socket.emit('gameUpdated', gameConcerned);
			emitToGame(gameConcerned.players, [], "gameUpdated", gameConcerned, socket);
		}

	});

socket.on('disconnectFromGame', function(user){
	var gameConcerned = games[users[user].where.slice(users[user].where.indexOf('_')+1)];
	for(var i = 0;i<gameConcerned.players.length;i++){
		if(gameConcerned.players[i].username === user){
			gameConcerned.players.splice(i,1);
			gameConcerned.nbConPlyrs = gameConcerned.players.length;
		}
	}
	users[user].where = 'lobby';
	var redirDatas = {'username':user};
	socket.emit('redirection', getContentFrom(users[user].where, redirDatas, socket));
	emitToGame(gameConcerned.players, [], "gameUpdated", gameConcerned, socket);
});

socket.on('launchGame', function(datas){
	request('http://localhost/PokeLabTest/laby.php?taille='+datas.size, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var lab = JSON.parse(body);

			games[datas.gameName].laby = lab;

			for (var i = 0; i < games[datas.gameName].players.length; i++) {
				switch(i){
					case 0:
					games[datas.gameName].players[i].x = 0;
					games[datas.gameName].players[i].y = 0;
					games[datas.gameName].players[i].color = 'pikachu'; //'#FF633A'; 
					break;
					case 1:
					games[datas.gameName].players[i].x = datas.size-1;
					games[datas.gameName].players[i].y = 0;
					games[datas.gameName].players[i].color = 'salameche'; //'#4F91C0'; 
					break;
					case 2:
					games[datas.gameName].players[i].x = 0;
					games[datas.gameName].players[i].y = datas.size-1;
					games[datas.gameName].players[i].color = 'carapuce'; //'#FFE15F'; 
					break;
					case 3:
					games[datas.gameName].players[i].x = datas.size-1;
					games[datas.gameName].players[i].y = datas.size-1;
					games[datas.gameName].players[i].color = 'bulbizarre'; //'#6EBE59'; 
					break;
				}
			}
			socket.broadcast.emit("initLab", games[datas.gameName]);
			emitToGame(games[datas.gameName].players, [], "initLab", games[datas.gameName], socket);
		}
	});
});

socket.on('someoneWantsToMove', function(datas){
	var user = datas.userName;
 	var theGame = games[datas.gameName];
 	theGame.players[datas.whoMoved][datas.direction] += datas.moveValue;
	for (var i = 0; i < theGame.players.length; i++) {
		if(theGame.players[i].username === user){
			theGame.players[i][datas.direction] += datas.moveValue;
		}
	}
	socket.emit('someoneMoved', theGame);
	emitToGame(theGame.players, [], 'someoneMoved', theGame, socket);
});

socket.on('ident', function(user){
	console.log(user + " est connecté");

	if(users[user]===undefined){
		users[user] = {};
	}

	users[user].sckt = socket.id;
	users[user].where = users[user].where === undefined || users[user].where === '' ? "lobby" : users[user].where;
	socket.emit('redirection', getContentFrom(users[user].where, {'username':user}, socket));
});

socket.on('requestUserList', function (){
	socket.emit('getUserList', users);
	socket.broadcast.emit('getUserList', users);
});

socket.on('requestGameList', function (){
	socket.emit('getGameList', games);
	socket.broadcast.emit('getGameList', games);
});

socket.on('disconnect', function(){
	var user = getUsernameByScktId(socket.id);
	if(user){
		console.log('DECONNEXION '+ user);
		if(users[user].where.indexOf('launchGame')!==-1){
			var gameConcerned = games[users[user].where.slice(users[user].where.indexOf('_')+1)];
			for(var i = 0;i<gameConcerned.players.length;i++){
				if(gameConcerned.players[i].username === user){
					gameConcerned.players.splice(i,1);
					gameConcerned.nbConPlyrs = gameConcerned.players.length;
				}
			}
			users[user].where = 'lobby';
			var redirDatas = {
				'username':user
			};
			socket.emit('redirection', getContentFrom(users[user].where, redirDatas, socket));
			emitToGame(gameConcerned.players, [], "gameUpdated", gameConcerned, socket);

			users[user].where = 'lobby';
		}
		users[user].sckt = false;
	}
});
});

server.listen(8080);

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

var emitToGame = function(players, exclude, msg, datas, socket){
	for(var i = 0;i<players.length;i++){
		if(exclude.indexOf(players[i].username)===-1){
			console.log(players[i].userId,players[i].username);
			socket.to(players[i].userId).emit(msg, datas);
		}
	}
}

var getUsernameByScktId = function(id){
	for( var uname in users ) {
		if( users.hasOwnProperty( uname ) ) {
			if( users[ uname ].sckt === id )
				return uname;
		}
	}
	return false;
}

var getContentFrom = function(page, datas, socket){
	var finalDatas = {};
	fs.readFile('../'+page+'.html','utf-8',function read(err, data){
		console.log('Redirect to '+page+' with:');
		for (var singleData in datas) {
			if (datas.hasOwnProperty(singleData)) {
				console.log("   "+singleData + " -> " + datas[singleData]);
				data = data.replace('{{params}}','{{params}}<input type="hidden" name="param--'+singleData+'" value="'+datas[singleData]+'"/>');
			}
		}
		data = data.replace('{{params}}','');
		finalDatas.datas = datas;
		finalDatas.body = data;
		console.log('---> End Redirect');
		socket.emit('uGotRedirected', finalDatas);
	});
}