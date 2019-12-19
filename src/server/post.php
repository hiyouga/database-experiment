<?php
/**
 * post an article
 *
 * @param string  $title article title
 * @param string  $body  article body
 *
 * @return integer $status 0:error 1:succeed 2:user not logged in
 *
 */

header("Content-type:application/json;charset=utf-8");
require_once('database.php');
require_once('utils.php');
check_login();

if (isset($_POST['title'])) {
	$title = adv_xss($_POST['title']);
} else {
	echo json_encode(array('status' => 0));
	exit();
}

if (isset($_POST['body'])) {
	$body = adv_xss($_POST['body']);
} else {
	echo json_encode(array('status' => 0));
	exit();
}

// publish article	
$uid = $_COOKIE['uid'];
$sql = "INSERT INTO articles (uid, title, body)
		VALUES ('$uid', '$title', '$body')";
$res = $mysqli -> query($sql);

echo json_encode(array('status' => 1));
$mysqli -> close();
