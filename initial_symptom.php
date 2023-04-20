<?php header('Access-Control-Allow-Origin: *');


require_once "connect.php";
$data = json_decode(stripslashes($_POST['ar']));
$username = $_POST['username'];


$result = mysqli_query($conn, "SELECT user_id FROM users WHERE username = '$username'");
$row = mysqli_fetch_assoc($result);

$user_id = $row['user_id'];
$success = true;
foreach($data as $value) {
  $sql = "INSERT INTO symptom_detail (user_id, level_symptom) VALUES ('$user_id', '$value')";

  if ($conn->query($sql) !== TRUE) {
      $success = false;
      echo "Error: " . $sql . "<br>" . $db->error;
      break;
  }
}

if ($success) {
  echo "success";
}

// $sql = "INSERT INTO symptom_detail (column1, column2, user_id) VALUES ('$data->column1', '$data->column2', '$user_id')";
// mysqli_query($connection, $sql);



// while ($row = mysqli_fetch_assoc($result)) {
//     echo "User ID: " . $row['user_id'] . "<br>";
// }

?>