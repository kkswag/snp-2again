<?php header('Access-Control-Allow-Origin: *');
session_start();
require_once "connect.php";


$user = mysqli_real_escape_string($conn, $_POST['username']);
$pass = mysqli_real_escape_string($conn, $_POST['password']);

$query = "SELECT * FROM users WHERE username = '$user'";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        if ($pass == $row["password"]) {
            echo 'success';
            exit();
        } else {
            echo "Incorrect password";
        }
    }
} else {
    echo "User not found";
}

$conn->close();
?>