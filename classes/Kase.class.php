<?php  
class Kase {
	// Properties
	public $doors;
	// Functions
	function __construct(){
		$this->doors = array("N"=>-2,"S"=>-2,"E"=>-2,"O"=>-2);
	}

	function setDoor($direction, $value){
		$this->doors[$direction] = $value;
	}
}
?>