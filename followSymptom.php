<?php
    header('Access-Control-Allow-Origin: http://localhost:1234');
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
    // if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    //     http_response_code(204);
    //     exit;
    // }

    require_once "connect.php";

    $user = $_POST['username'];
    $head = $_POST['head'];
    $neck = $_POST['neck'];
    $shoulder = $_POST['shoulder'];
    $hip = $_POST['hip'];

    $query = "SELECT id FROM users WHERE username = '$user'";
    $result = mysqli_query($conn, $query);

    if($result){
        $row = mysqli_fetch_assoc($result);
        $userId = $row['id'];

        $sql = "INSERT INTO follow_symptom (user_id, head, neck, shoulder, hip) 
        VALUES ('$userId', '$head', '$neck', '$shoulder', '$hip')";
        $insert = mysqli_query($conn, $sql);
    }
    if ($insert) {
        http_response_code(200);
        echo "success";
    } else {
        http_response_code(500);
        echo "failed: " . mysqli_error($conn);
    }
    // echo "user-id: ".$userId." head-level: ".$head." neck-level: ".$neck." shoulder-level: ".$shoulder." hip-level: ".$hip;
?>
