var paramsInputs = document.querySelectorAll('input[type="hidden"][name^=param--]');
if(paramsInputs.length>0){
	var params = {};
	for (var i = 0; i < paramsInputs.length; i++) {
		params[paramsInputs[i].name.split('param--')[1]] = paramsInputs[i].value;
	}
	console.log(params);
}

var launchButton = document.querySelector('.launchButton');
launchButton.addEventListener('click', function(){
	launchButton.classList.toggle('ready');
	if(launchButton.classList.contains('ready')){
		launchButton.innerHTML = "Je suis prêt";
	}
	else {
		launchButton.innerHTML = "Je ne suis pas prêt";
	}
	socket.emit('changeReadyState', params.username);
});



var quitButton = document.querySelector('.quitButton');
quitButton.addEventListener('click', function(){
	socket.emit('disconnectFromGame', params.username);
});