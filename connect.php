<?php
$host = "localhost"; // The host of the database
$username = "root"; // The username of the database
$password = ""; // The password of the database
$database_name = "office_thera"; // The name of the database

// Create a connection to the database
$conn = new mysqli($host, $username, $password, $database_name);

// Check if the connection was successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>