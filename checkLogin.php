<?php header('Access-Control-Allow-Origin: *');
session_start();
require_once "connect.php";


$user = $_POST["username"];
$pass = $_POST["password"];

$data = "SELECT * FROM users";

$result = $db->query($data);

if($result->num_rows > 0){

    while($row = $result->fetch_assoc()){

        if($user == $row["username"]){

            $db_pass = $row["password"];

            if($pass == $db_pass){
                echo 'logged_in';
                
            }else{
                echo 'password_wrong';
            };
        };
        
    };
    
};
$db->close();

?>