// window.addEventListener("DOMContentLoaded", function(){
	// var socket = io.connect('http://localhost:8080');
	var paramsInputs = document.querySelectorAll('input[type="hidden"][name^=param--]');
	if(paramsInputs.length>0){
		var params = {};
		for (var i = 0; i < paramsInputs.length; i++) {
			params[paramsInputs[i].name.split('param--')[1]] = paramsInputs[i].value;
		}
		console.log(params);
	}
	document.querySelector('.submit.create').addEventListener('click', function(){
		document.querySelector('.createGame-popin').classList.add('visible');
	});

	document.querySelector('.createGame-popin .close').addEventListener('click', function(){
		document.querySelector('.createGame-popin').classList.remove('visible');
	});

	[].slice.call(document.querySelectorAll('.join')).forEach(function(btn){
		btn.addEventListener('click', joinGame);
	});

	socket.emit('requestUserList',null);
	socket.emit('requestGameList',null);

	document.querySelector('#createGame').addEventListener('click', sendGameDatas);

	function sendGameDatas(){
		var datas = {
			name: document.querySelector('input[name=gameName]').value,
			username: params.username,
			maxPlayers: document.querySelector('select[name=nbJoueurMax]').value
		}
		socket.emit('gameCreated', datas);
		console.log('gameDatasSent');
	}

	function joinGame(e){
		var gameInfos = e.target;
		var datas = {};
		datas.gameName = gameInfos.getAttribute('data-game-id');
		datas.username = params.username;
		socket.emit('wantToJoinGame', datas);
	}

	socket.on('nameAlreadyTaken', function(){
		displayErrorMessage("Nom déjà pris")
	});
	socket.on('noMorePlayers', function(){
		displayErrorMessage("Cette partie est déjà pleine")
	});

	socket.on('newGameCreated', function(game){createGame(game)});
	socket.on('gameUpdated', function(game){updateGame(game)});
	socket.on('gameDeleted', function(game){deleteGame(game)});
	socket.on('getUserList', function(users){
		console.log(users);
		for(user in users){
			if(users[user].sckt){
				createUser(user);
			}
		}
	});

	socket.on('getGameList', function(games){
		var container = document.querySelector('.table-game tbody');
		var elts = container.querySelectorAll('tr:not([data-template])');
		[].slice.call(elts).forEach(function(elt){
			container.removeChild(elt);
		});
		for(game in games){
			createGame(games[game]);
		}
	});

	function createUser(user){
		console.log(user);
	}

	function createGame(game){
		var model = document.querySelector('[data-template=game]');
		var clone = model.cloneNode(true);
		clone.removeAttribute('data-template');
		clone.querySelector('.submit.join').setAttribute('data-game-id',game.gameId);
		var fields = [].slice.call(clone.querySelectorAll('[data-templateField]'));
		fields.forEach(function(field){
			field.innerHTML = game[field.getAttribute('data-templateField')];
		});
		model.parentNode.appendChild(clone);
		clone.querySelector('.join').addEventListener('click', joinGame);
	}

	function deleteGame(gameId){
		var gameToDelete = document.querySelector('[data-game-id='+gameId+']');
		gameToDelete.parentElement.removeChild(gameToDelete);
	}

	function displayErrorMessage(msg){
		alert(msg);
	}

	function updateGame(game){
		if(document.querySelector('body.launchGame')!==null){

			console.log('UPDATE IN LAUNCH', game);
			var listPlayer = document.querySelector('.listPlayers');
			var model = listPlayer.querySelector('[data-template=player]');
			listPlayer.querySelector('h2').innerHTML = game.gameId;
			var playersCtnr = [].slice.call(listPlayer.querySelectorAll('.player:not([data-template])'));
			playersCtnr.forEach(function(plyr){
				listPlayer.removeChild(plyr);
			});
			for(var playerIndex = 0;playerIndex < game.players.length;playerIndex++){
				var clone = model.cloneNode(true);
				clone.removeAttribute('data-template');
				if(game.players[playerIndex].readyState){
					clone.querySelector('.state').classList.add('stateReady');
				}
				clone.querySelector('p').innerHTML = game.players[playerIndex].username;
				switch(playerIndex){
					case 0:
					clone.querySelector('img').setAttribute('src','http://localhost/PokeLabTest/Images/pikachu.png');
					clone.classList.add('pikachu');
					break;
					case 1:
					clone.querySelector('img').setAttribute('src','http://localhost/PokeLabTest/Images/salameche.png');
					clone.classList.add('salameche');
					break;
					case 2:
					clone.querySelector('img').setAttribute('src','http://localhost/PokeLabTest/Images/carapuce.png');
					clone.classList.add('carapuce');
					break;
					case 3:
					clone.querySelector('img').setAttribute('src','http://localhost/PokeLabTest/Images/bulbizarre.png');
					clone.classList.add('bulbizarre');
					break;
				}
				listPlayer.appendChild(clone);
				console.log('GAAAME - ',game);
			}
		}else{
			console.log('UPDATE OUT LAUNCH');
			var gameContainer = document.querySelector('[data-game-id='+game.gameId+']').parentElement.parentElement;
			
			var playerDisplayer = gameContainer.querySelector('.nbPlayerConnected');
			playerDisplayer.innerHTML = game.players.length;
		}
	}

	Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};
// });

