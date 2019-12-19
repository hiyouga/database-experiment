<?php
/**
 * comment an article
 *
 * @param integer $aid  article ID
 * @param string  $body comment body
 *
 * @return integer $status 0:error 1:succeed 2:user not logged in
 *
 */

header("Content-type:application/json;charset=utf-8");
require_once('database.php');
require_once('utils.php');
check_login();

if (isset($_POST['aid'])) {
	$aid = $_POST['aid'];
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

$uid = $_COOKIE['uid'];
$sql = "INSERT INTO comments (aid, uid, body)
		VALUES ('$aid', '$uid', '$body')";
$res = $mysqli -> query($sql);

echo json_encode(array('status' => 1));
$mysqli -> close();
