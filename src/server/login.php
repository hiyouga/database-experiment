<?php
/**
 * user login
 *
 * @param string  $username username
 * @param string  $password password (plaintext)
 *
 * @return integer $status 0:error 1:succeed 2:user not found 3:wrong password
 *
 */

header("Content-type:application/json;charset=utf-8");
require_once('database.php');

if (isset($_POST['username'])) {
	$username = $_POST['username'];
} else {
	echo json_encode(array('status' => 0));
	exit();
}

if (isset($_POST['password'])) {
	$password = md5($_POST['password']);
} else {
	echo json_encode(array('status' => 0));
	exit();
}

$sql = "SELECT password, uid
		FROM users
		WHERE username = '$username'";
$res = $mysqli -> query($sql);
$row = $res -> fetch_assoc();

if ($row != null) { // check user existence
	if ($row['password'] == $password) { // check password
		// create Cookies
		$timestamp = time();
		echo json_encode(array('status' => 1, 'uid' => $row['uid'], 'username' => $username, 'created_at' => $timestamp, 'check' => md5($row['uid'] . $username . $timestamp)));
	} else {
		echo json_encode(array('status' => 3));
	}
} else {
	echo json_encode(array('status' => 2));
}

$mysqli -> close();
