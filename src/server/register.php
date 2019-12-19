<?php
/**
 * user register
 *
 * @param string  $username username
 * @param string  $password password (plaintext)
 *
 * @return integer $status 0:error 1:succeed 2:user exists
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

// check duplicate username
$sql = "SELECT username
		FROM users
		WHERE username = '$username'";
$res = $mysqli -> query($sql);
$row = $res -> fetch_assoc();

if ($row != null) {
	echo json_encode(array('status' => 2));
	exit();
}

// create new account
$sql = "INSERT INTO users (username, password)
		VALUES ('$username', '$password')";
$res = $mysqli -> query($sql);

echo json_encode(array('status' => 1));
$mysqli -> close();
