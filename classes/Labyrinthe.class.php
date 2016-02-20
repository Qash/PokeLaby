<?php 
include_once("./classes/Kase.class.php");
class Labyrinthe {
	// Properties
	private $lab;
	private $done;
	private $taille;
	// Functions
	function __construct($taille){
		$this->taille = $taille;
		$this->lab = array_fill(0,$this->taille*$this->taille, 0);
		for ($i=0; $i < $this->taille*$this->taille; $i++) { 
			$this->lab[$i] = new Kase();
		}
		// $this->lab = array_fill(0,$this->taille*$this->taille, new Kase());
		$this->done = array_fill(0, $this->taille*$this->taille, 0);
	}

	function setBorders() {
		$max = $this->taille*$this->taille;
		for ($i=0; $i<$this->taille;$i++) {
			$this->lab[$i]->setDoor("N",-1);
			$this->lab[$max - $i - 1]->setDoor("S",-1);
			$this->lab[$i*$this->taille]->setDoor("O",-1);
			$this->lab[($i+1)*$this->taille - 1]->setDoor("E",-1);
		}
	}

	function getCaseIndex($case,$dir) {
		$res = -1;
		$max = $this->taille*$this->taille;
		switch($dir) {
			case "N":if ($case>$this->taille) $res = $case - $this->taille;
			break;
			case "S":if ($case<($max - $this->taille)) $res = $case + $this->taille;
			break;
			case "E":if ((($case+1) % $this->taille) != 0) $res = $case + 1;
			break;
			case "O":if (($case % $this->taille) != 0) $res = $case - 1;
			break;
		}
		return $res;
	}

	function setRandDoors($case) {
		$max = $this->taille*$this->taille;
		$casespos = array();
		foreach ($this->lab[$case]->doors as $dir => $v) {
			$ind = $this->getCaseIndex($case,$dir);
			if ($ind != -1){
				if ($this->done[$ind] == NULL)
					$casespos[] = array($dir,$ind);
			}
		}
		if (count($casespos)>0){
			return $casespos[array_rand($casespos)];
		}

		else
			return array();
	}

	function build() {
		$pos = 0;
		$pile = array();
		array_push($pile, 0);
		$this->done[0] = 1;
		while (count($pile) > 0) {
			$case = array_pop($pile);
			$nouveau = true;
			while ($nouveau == true) {			
				// echo($case);
				// var_dump($this->lab[$case]);
				$pos = $this->setRandDoors($case);
				// echo $case;				
				// var_dump($pos);
				if (count($pos)>0) {
					$dir = $pos[0];
					$c = $pos[1];
					$this->lab[$case]->setDoor($dir, $c);

					array_push($pile,$case);
					$case = $c;
				}
				else
					$nouveau = false;
				$this->done[$case] = 1;

			}
		}
	}

	function finalise() {
		$max = $this->taille*$this->taille;
		$op = array("N"=>"S","S"=>"N","E"=>"O","O"=>"E");
		for ($i=0;$i<$max;$i++) {
			foreach ($this->lab[$i]->doors as $dir => $c) {
				if ($c > -1) 
					$this->lab[$c]->setDoor($op[$dir],$i);
				else 
					$this->lab[$i]->setDoor($dir,-1);
			}
		}

	}

	function drawTable($taillecase) {
		$max = $this->taille*$this->taille;
		echo "test";
		echo "<table>";
		for ($i=0;$i<$max;$i++) {

			if($i%$this->taille == 0){
				if($i != 0)
					echo "</tr>";
				echo "<tr>";
			}

			// Former classe
			$class = "";
			foreach ($this->lab[$i]->doors as $dir => $c){
				if($c>-1)
					$class.="border-".$dir." ";
			}
			echo "<td class='".$class."'></td>";
		}


	}

	function getJson() {
		
		return json_encode($this->lab);
	}
	
	function setJson($json) {
		$this->lab = json_decode($json);
	}

}
?>