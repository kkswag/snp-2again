<?php header('Access-Control-Allow-Origin: *');


require_once "connect.php";

$user = $_POST["username"];
$email = $_POST["email"];
$password = $_POST["password"];


if($user == null){
    echo 'User_is_null';

}else if($email == null){
    echo 'Email_is_null';

}else if($password == null){
    echo 'Password_is_null';

}else {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $query = "INSERT INTO users (username, password, email) VALUES('$user', '$hash', '$email')";

    if ($conn->query($query) === TRUE) {
        echo 'Register user success';
    }else{
        echo 'Register error';
    }
}

?>