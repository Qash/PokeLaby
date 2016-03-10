		var paramsInputs = document.querySelectorAll('input[type="hidden"][name^=param--]');
		if(paramsInputs.length>0){
			var params = {};
			for (var i = 0; i < paramsInputs.length; i++) {
				params[paramsInputs[i].name.split('param--')[1]] = paramsInputs[i].value;
			}
			console.log(params);
		}
		const TAILLE = 10;
		const COLORS = {"pikachu":"#FFE15F","bulbizarre":"#6EBE59","carapuce":"#4F91C0","salameche":"#FF633A"}
		var monLab;
		var imgLab;

		var players;
		var myPlayerId;
		var colorTab = [];
		var persX, persY;
		for (var i = 0; i < TAILLE; i++) {
			colorTab[i] = [];
			for (var j = 0; j < TAILLE; j++) {
				colorTab[i][j] = 'transparent';
			}
		}

		socket.on('initLab', function(datas) {
			monLab = datas.laby;
			players = datas.players;
			getLab();
			for (var i = 0; i < players.length; i++) {
				if(players[i].username === params.username){
					myPlayerId = i;
				}
			}
			document.addEventListener("keydown", ecouteurClavier, false);
		});

		socket.on('someoneMoved', function(datas){
			players = datas.players;
			dessine();
		});

		function getLab(){
			imageLabyrinthe();
			dessine();
		}

		function imageLabyrinthe(){
			var i,x,y;
			var canvasLab = document.createElement("canvas");
			var dim = Math.floor(500/TAILLE);
			canvasLab.width = 500;
			canvasLab.height = 500;
			var g = canvasLab.getContext("2d");
			g.beginPath();
			for(i=0;i<monLab.length;i++){
				x = (i%TAILLE)*dim;
				y = Math.floor(i/TAILLE)*dim;
				if(monLab[i].doors["N"]<0){
					g.moveTo(x,y);
					g.lineTo(x+dim,y);
				}
				if(monLab[i].doors["E"]<0){
					g.moveTo(x+dim,y);
					g.lineTo(x+dim,y+dim);
				}
				if(monLab[i].doors["S"]<0){
					g.moveTo(x,y+dim);
					g.lineTo(x+dim,y+dim);
				}
				if(monLab[i].doors["O"]<0){
					g.moveTo(x,y);
					g.lineTo(x,y+dim);
				}
			}
			g.stroke();
			return imgLab = canvasLab.toDataURL();
		}
		
		function dessine(){
			var dim = Math.floor(500/TAILLE);
			var zoneDessin = document.getElementById("labyrinthe");
			zoneDessin.width = 500;
			zoneDessin.height = 500;
			var g = zoneDessin.getContext("2d");
			for (var i=0;i<players.length;i++) {
				if(colorTab[players[i].x][players[i].y] === 'transparent')
					colorTab[players[i].x][players[i].y] = COLORS[players[i].color];
			}
		// COLORIZE
		for (var i = 0; i < colorTab.length; i++) {
			for (var j = 0; j < colorTab.length; j++) {
				g.beginPath();
				g.rect(dim*i,dim*j,dim,dim);
				g.fillStyle = colorTab[i][j];
				g.fill();
				g.closePath();
			}
		}
		
		var lab = new Image();
		lab.src = imgLab;
		lab.onload = function(){
			g.drawImage(lab,0,0);
		}
		for (i=0;i<players.length;i++) {
			g.beginPath();
			g.arc(players[i].x*dim+dim/2,players[i].y*dim+dim/2,10,0,2*Math.PI);
			g.lineWidth="2";
			g.strokeStyle="white";
			g.stroke();
		}
		
		/*var perso = new Image();
		perso.src = "./images/mario.png";
		perso.onload = function(){
			g.drawImage(perso,persX*dim+1,persY*dim+1,dim-2,dim-2);
		}*/
		
	}
	
	function ecouteurClavier(evt){
		switch(evt.keyCode){
			case 37 :
			if(monLab[players[myPlayerId].y*TAILLE+players[myPlayerId].x].doors["O"]>=0){
				socket.emit('someoneWantsToMove',{direction:'x', moveValue:-1, whoMoved:myPlayerId});
			}
			break;
			case 38 :
			if(monLab[players[myPlayerId].y*TAILLE+players[myPlayerId].x].doors["N"]>=0){
				socket.emit('someoneWantsToMove',{direction:'y', moveValue:-1, whoMoved:myPlayerId});
			}
			break;
			case 39 :
			if(monLab[players[myPlayerId].y*TAILLE+players[myPlayerId].x].doors["E"]>=0){
				socket.emit('someoneWantsToMove',{direction:'x', moveValue:1, whoMoved:myPlayerId});
			}
			break;
			case 40 :
			if(monLab[players[myPlayerId].y*TAILLE+players[myPlayerId].x].doors["S"]>=0){
				socket.emit('someoneWantsToMove',{direction:'y', moveValue:1, whoMoved:myPlayerId});
			}
			break;
		}
	}