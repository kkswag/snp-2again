<?php
header('Access-Control-Allow-Origin: *');


    $date = $_POST['date'];
    $time = $_POST['time'];
    $alarm = $_POST['alarm'];

    //echo "date: ".$date."\ntime: ".$time."\nalarm in: ".$alarm;

    $sToken = "4wYTVqLDBnR5DtIJLaVBYz86QmFBzS7wWdiX7Cq9Unw";
    // $sToken = "QIzjsQeQDvSVuN4MWizXeut69LAyDBFcQTk1quOPLbd";
	$sMessage = "\nแจ้งเตือนเวลา: ".$alarm."\nแจ้งเตือนเวลาในการออกกำลังกาย"."\nปี-เดือน-วัน: ".$date."\nเวลาที่เริ่มออกกำลังกาย: ".$time;

	
	$chOne = curl_init(); 
	curl_setopt( $chOne, CURLOPT_URL, "https://notify-api.line.me/api/notify"); 
	curl_setopt( $chOne, CURLOPT_SSL_VERIFYHOST, 0); 
	curl_setopt( $chOne, CURLOPT_SSL_VERIFYPEER, 0); 
	curl_setopt( $chOne, CURLOPT_POST, 1); 
	curl_setopt( $chOne, CURLOPT_POSTFIELDS, "message=".$sMessage); 
	$headers = array( 'Content-type: application/x-www-form-urlencoded', 'Authorization: Bearer '.$sToken.'', );
	curl_setopt($chOne, CURLOPT_HTTPHEADER, $headers); 
	curl_setopt( $chOne, CURLOPT_RETURNTRANSFER, 1); 
	$result = curl_exec( $chOne ); 

	//Result error 
	if(curl_error($chOne)) 
	{ 
		echo "error"; 
	} 
	else { 
		$result_ = json_decode($result, true); 
		echo "success";
	} 
	curl_close( $chOne );   

?>