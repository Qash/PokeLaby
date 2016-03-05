﻿<?php
	/* Connexion à la base de données */
	try {
		$db = new PDO('mysql:host=localhost;dbname=pokelaby', 'root', '');
	}
	catch (Exception $e) {
        die('Erreur : ' . $e->getMessage());
	}
?>