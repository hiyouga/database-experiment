<?php
/**
 * display the article and its comments
 *
 * @param integer $aid article ID
 *
 * @example array('title' => 'article1', 'author' => 'user1', 'body' => 'contents', 'created_at' => '2018-01-31T10:42:06Z', 'likes' => 5, 'dislikes' => 1, 'history' => 'liked', 'comments' => array(array('author' => 'user2', 'body' => 'comment2', 'created_at' => '2018-03-18T10:42:06Z')));
 *
 */

header("Content-type:application/json;charset=utf-8");
require_once('database.php');

if (isset($_GET['aid'])) {
	$aid = $_GET['aid'];
} else {
	$aid = 1;
}

// get article
$sql = "SELECT users.username AS author, title, body, created_at
		FROM articles
		LEFT JOIN users
		ON articles.uid = users.uid
		WHERE aid = $aid";
$res = $mysqli -> query($sql);
$row = $res -> fetch_assoc();
$author = $row['author'];
$title = $row['title'];
$body = $row['body'];
$created_at = date('c', strtotime($row['created_at']));

// get likes
$sql = "SELECT COUNT(polarity) AS likes
		FROM likes
		WHERE aid = $aid AND polarity = '1'";
$res = $mysqli -> query($sql);
$row = $res -> fetch_assoc();
$likes = $row['likes'];

// get dislikes
$sql = "SELECT COUNT(polarity) AS dislikes
		FROM likes
		WHERE aid = $aid AND polarity = '0'";
$res = $mysqli -> query($sql);
$row = $res -> fetch_assoc();
$dislikes = $row['dislikes'];

// get history
$history = 'null';
if (isset($_COOKIE['uid'])) {
	$uid = $_COOKIE['uid'];
	$sql = "SELECT polarity
			FROM likes
			WHERE aid = $aid AND uid = $uid";
	$res = $mysqli -> query($sql);
	$row = $res -> fetch_assoc();
	if ($row != null) {
		if ($row['polarity'] == '1') {
			$history = 'liked';
		} else if ($row['polarity'] == '0') {
			$history = 'disliked';
		}
	}
}

$data = array('title' => $title, 'author' => $author, 'body' => $body, 'created_at' => $created_at, 'likes' => $likes, 'dislikes' => $dislikes, 'history' => $history, 'comments' => array());

// get comments
$sql = "SELECT users.username AS commenter, body, created_at
		FROM comments
		LEFT JOIN users
		ON users.uid = comments.uid
		WHERE aid = '$aid'
		ORDER BY cid DESC";
$res = $mysqli -> query($sql);
$row = $res -> fetch_assoc();

while ($row != null) {
	$commenter = $row['commenter'];
	$text = $row['body'];
	$timestamp = date('c', strtotime($row['created_at']));
	array_push($data['comments'], array('author' => $commenter, 'body' => $text, 'created_at' => $timestamp));
	$row = $res -> fetch_assoc();
}

echo json_encode($data);
$mysqli -> close();
