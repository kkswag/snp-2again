<?php header('Access-Control-Allow-Origin: *');


require_once "connect.php";
$data = json_decode(stripslashes($_POST['ar']));
// $sql = "select * from symptom_detail";
foreach($data as $value){
    $sql = "INSERT INTO symptom_detail (level_symptom) VALUES('$value')";

    if ($db->query($sql) === TRUE) {
        echo "New record created successfully";
      } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
      }
}



?>