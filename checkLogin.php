<?php
header('Access-Control-Allow-Origin: *');
session_start();
require_once "connect.php";

$user = $_POST['username'];
$pass = $_POST['password'];

// echo "user: ".$user." pass: ".$pass;

$query = "SELECT * FROM users WHERE username = '$user'";
$result = $conn->query($query);

if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    $hash = $row['password'];
    if (password_verify($pass, $hash)) {
        echo 'success';
    } else {
        echo 'Incorrect password';
    }
} else {
    echo "User not found";
}

$conn->close();
?>
