<?php header('Access-Control-Allow-Origin: *');


require_once "connect.php";

$user = $_POST["username"];
$email = $_POST["email"];
$password = $_POST["password"];

// echo "user: ".$user." email: ".$email." pass: ".$password;

// $result = $stmt->get_result();

if($user == null){
    echo 'User_is_null';
}else if($email == null){
    echo 'Email_is_null';
}else if($password == null){
    echo 'Password_is_null';
}else {
    // $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (:username, :password)");
    // $stmt->bind_param("s", $username);
    // $stmt->execute();
    $query = "INSERT INTO users (username, password, email) VALUES('$user', '$password', '$email')";

    if ($conn->query($query) === TRUE) {
        echo 'Register user success';
    }else{
        echo 'Register error';
    }
    
   
}

?>