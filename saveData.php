<?php 
header("Access-Control-Allow-Origin: *");
require_once "connect.php";


// $status = $_POST['status'];
$status = "success";
$username = $_POST['username'];

$query = "SELECT id FROM users WHERE username = '$username'";
$result = mysqli_query($conn, $query);
$row = mysqli_fetch_assoc($result);

$user_id = $row['id'];

$sql = "INSERT INTO symptom (user_id, stat) VALUES ('$user_id', '$status')";
$insert = mysqli_query($conn, $sql);

if ($insert) {
  echo "success";
} else {
  echo "Error: " . $insert->error;
}

$conn->close();

?>