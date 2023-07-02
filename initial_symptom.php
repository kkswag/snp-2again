<?php
header('Access-Control-Allow-Origin: *');

require_once "connect.php";
$data = json_decode(stripslashes($_POST['ar']));
$username = $_POST['username'];

$query = "SELECT id FROM users WHERE username = '$username'";
$result = mysqli_query($conn, $query);
$row = mysqli_fetch_assoc($result);

$user_id = $row['id'];
$success = true;
foreach($data as $value) {
  $sql = "INSERT INTO symptom_detail (user_id, level_symptom) VALUES ('$user_id', '$value')";

  if ($conn->query($sql) !== TRUE) {
    $success = false;
    echo "Error: " . $sql . "<br>" . $conn->error;
    break;
  }
}

  if ($success) {
    echo "success";
  } else {
    echo "upload_failed";
  }
?>
