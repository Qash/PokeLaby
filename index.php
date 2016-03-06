<!doctype html>
<html lang="fr">
<?php
	include('include/connexion.inc.php');
?>
<head>
	<meta charset="utf-8"/>
	<title>PokeLaby</title>
	<link rel="stylesheet" href="Styles/Css/global.css"/>
	<link rel="stylesheet" href="Styles/Css/index.css"/>	
</head>

<body>

	<header class="header">
		<img src="Images/Logo-PokeLaby-Darkblue.png" alt="Logo Poke Laby">
	</header>

	<div class="main-container">
		<div class="container">
			<form action="" method="post" id="connexion" class="login">
				
				<input type="text" placeholder="Pseudo" name="login_pseudo" required>
				<input type="password" name="login_password" placeholder="Mot de Passe" required>
				<input type="submit" value="Se Connecter" name="login" class="submit input-login">
			</form>
			<form action="" method="post" id="inscription" class="register">
				
				<input type="text" placeholder="Pseudo" name="register_pseudo">
				<input type="password" placeholder="Mot de Passe" name="register_password">
				<input type="submit" value="S'inscrire" name="register" class="submit input-register">
			</form>

			<div class="erreur">
				<?php

				if(isset($_POST['login'])){
					$erreur = null;
					$i=0;

					//Récupération des variables
					$login_pseudo=$_POST['login_pseudo'];
					$login_password=$_POST['login_password'];

					//Vérification de la concordance entre le pseudo et le mot de passe
					$query=$db->prepare('SELECT password FROM users WHERE pseudo =:login_pseudo');
					$query->bindValue(':login_pseudo', $login_pseudo, PDO::PARAM_STR);
					$query->execute();
					$test_password= $query->fetchColumn();
					$query->CloseCursor();
					if($login_password != $test_password){
						$erreur = "Votre identifiant ou votre mot de passe est erroné";
						$i++;
					}

					//On redirige le joueur vers le lobby du jeu s'il n'y a pas d'erreurs
					if($i==0){
						session_start();
						$_SESSION['user'] = $login_pseudo;
						echo "<script type='text/javascript'>
								var sessionUser = '".$_SESSION['user']."';
								sessionStorage.setItem('sessionUser', sessionUser);
								window.location = 'lobby.html';
							</script>";
						exit();
					}

					else {
						echo '<h1>Connexion interrompue</h1>';
						echo 'Une ou plusieurs erreurs se sont produites lors de la connexion</p>';
						echo '<p>'.$i.'erreur(s)</p>';
						echo '<p>'.$erreur.'</p>';
						echo '<p>Cliquez <a href="index.php">ici</a>pour recommencer</p>';
					}
				}

				?>

				<?php

				if(isset($_POST['register'])){
					$login_erreur = null;
					$mdp_erreur = null;
					$i=0;

					//Récupération des variables
					$register_pseudo=$_POST['register_pseudo'];
					$register_password=$_POST['register_password'];

					//Vérification du login déjà utilisé ou non dans la base de données
					$query=$db->prepare('SELECT COUNT(*) AS nbr FROM users WHERE pseudo =:register_pseudo');
					$query->bindValue(':register_pseudo', $register_pseudo, PDO::PARAM_STR);
					$query->execute();
					$login_free=($query->fetchColumn()==0)?1:0;
					$query->CloseCursor();
					if(!$login_free){
						$mail_erreur = "Votre pseudo est déjà utilisé par un utilisateur";
						$i++;
					}

					//On inscrit le joueur dans la base de données
					if($i==0){
						$query=$db->prepare('INSERT INTO users(pseudo, password) VALUES(:register_pseudo, :register_password)');
						$query->execute(array (':register_pseudo' => $register_pseudo, ':register_password' => $register_password));
						session_start();
						$_SESSION['user'] = $register_pseudo;
						echo "<script type='text/javascript'>
								var sessionUser = '".$_SESSION['user']."';
								sessionStorage.setItem('sessionUser', sessionUser);
								window.location = 'lobby.html';
							</script>";
						exit();
					}

					else {
						echo '<h1>Inscription interrompue</h1>';
						echo 'Une ou plusieurs erreurs se sont produites lors de l\'inscription</p>';
						echo '<p>'.$i.'erreur(s)</p>';
						echo '<p>'.$mail_erreur.'</p>';
						echo '<p>Cliquez <a href="index.php">ici</a>pour recommencer</p>';
					}
				}

				?>
			</div>
		</div>
	</div>

	

	<footer class="footer">
		Jeu développé par Hadrien Chevallier et Laura Jonin
	</footer>

</body>
</html>