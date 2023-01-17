<?php header('Access-Control-Allow-Origin: *');


require_once "connect.php";

$user = $_POST["username"];
$email = $_POST["email"];
$password = $_POST["password"];



if($user == ""){
    echo 'User_is_null';
}else if($email == ""){
    echo 'Email_is_null';
}else if($password == ""){
    echo 'Password_is_null';
}else {
    $query = "INSERT INTO users (username, password, email) VALUES('$user', '$password', '$email')";
    mysqli_query($db, $query);
    echo 'Register user success';
}

?>