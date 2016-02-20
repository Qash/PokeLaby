<?php
	include_once("include/autoload.inc.php");
	if(isset($_GET["taille"])){
		$lab = new Labyrinthe($_GET["taille"]);
		$lab->setBorders();
		$lab->build();
		$lab->finalise();
		echo $lab->getJson();
	}
?>