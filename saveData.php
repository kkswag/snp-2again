<?php header("Access-Control-Allow-Origin: *");


require_once "connect.php";


// $status = $_POST['status'];
$status = "success";
$username = $_POST['username'];

// echo "stat: ".$status."\nusername: ".$username;
// echo gettype($status);

// $data = "INSERT INTO symptom (username, stat) VALUES ('$username', '$status')" ;

// if ($db->query($data) === TRUE) {
//   echo "New record created successfully";
// } else {
//   echo "Error: " . $data . "<br>" . $conn->error;
// }

$stmt = $conn->prepare("INSERT INTO symptom (username, stat) VALUES (?, ?)");

$stmt->bind_param("ss", $username, $status);

if ($stmt->execute()) {
  echo "success";
} else {
  echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();

?>