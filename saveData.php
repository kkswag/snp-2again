<?php header("Access-Control-Allow-Origin: *");


require_once "connect.php";


// $status = $_POST['status'];
$status = "success";

// echo gettype($status);

$data = "INSERT INTO symptom (stat) VALUES ('$status')" ;

if ($db->query($data) === TRUE) {
  echo "New record created successfully";
} else {
  echo "Error: " . $data . "<br>" . $conn->error;
}


$db->close();

?>