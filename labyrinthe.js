window.addEventListener("DOMContentLoaded",function(){
	var socket = io.connect('http://localhost:8080');
	var paramsInputs = document.querySelectorAll('input[type="hidden"][name^=param--]');
	if(paramsInputs.length>0){
		var params = {};
		for (var i = 0; i < paramsInputs.length; i++) {
			params[paramsInputs[i].name.split('param--')[1]] = paramsInputs[i].value;
		}
		console.log(params);
	}
	const TAILLE = params.taille;

	var monLab;
	var imgLab;

	var players;
	var colorTab = [];

	for (var i = 0; i < TAILLE; i++) {
		colorTab[i] = [];
		for (var j = 0; j < TAILLE; j++) {
			colorTab[i][j] = 'transparent';
		}
	}

	function launchGame(){
		socket.emit('launchGame',TAILLE);
	}
	
	socket.on('initLab', function(datas) {
		console.log(datas.players);
		monLab = datas.laby;
		players = datas.players;
		getLab();
	});

	function getLab(){
		imageLabyrinthe();
		dessine();
	}
	document.querySelector('.launch').addEventListener('click', launchGame);
	function imageLabyrinthe(){
		var i,x,y;
		var canvasLab = document.createElement("canvas");
		var dim = Math.floor(500/TAILLE);// largeur d'une case en px
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
		for (player in players) {
			colorTab[players[player].x][players[player].y] = players[player].color;
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
		for (player in players) {
			g.beginPath();
			g.arc(players[player].x*dim+dim/2,players[player].y*dim+dim/2,10,0,2*Math.PI);
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
			if(monLab[persY*TAILLE+persX].doors["O"]>=0){
				persX = persX-1;

				dessine();
			}
			break;
			case 38 :
			if(monLab[persY*TAILLE+persX].doors["N"]>=0){
				persY = persY-1;
				dessine();
			}
			break;
			case 39 :
			if(monLab[persY*TAILLE+persX].doors["E"]>=0){
				persX = persX+1;
				dessine();
			}
			break;
			case 40 :
			if(monLab[persY*TAILLE+persX].doors["S"]>=0){
				persY = persY+1;
				dessine();
			}
			break;
		}
	}
	// document.addEventListener("keydown",ecouteurClavier,false);
},false);