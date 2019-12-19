<?php
/**
 * articles shown at the homepage
 *
 * @param integer $page    require one page ordered by post_time
 * @param integer $perpage the number of articles in one page
 *
 * @example array(array('aid' => 0, 'title' => 'article1', 'author' => 'user1', 'preview' => 'some contents', 'created_at' => '2018-01-31T10:42:06Z', 'likes' => 5, 'dislikes' => 1));
 *
 */

header("Content-type:application/json;charset=utf-8");
require_once('database.php');

if (isset($_GET['page'])) {
	$page = $_GET['page'];
} else {
	$page = 1;
}

if (isset($_GET['perpage'])) {
	$perpage = $_GET['perpage'];
} else {
	$perpage = 10;
}

$index = ($page - 1) * $perpage;

$sql = "SELECT aid, title, body, users.username as author, created_at
		FROM articles
		LEFT JOIN users
		ON articles.uid = users.uid
		WHERE title NOT IN ( SELECT t.title FROM (SELECT * FROM articles ORDER BY created_at DESC LIMIT $index) AS t)
		ORDER BY created_at DESC
		LIMIT $perpage";

$res = $mysqli -> query($sql);

$data = array();

function utf_substr($str, $len) {
    for($i=0; $i<$len; $i++) {
        $temp_str = substr($str, 0, 1);
        if (ord($temp_str) > 127) {
            if ($i < $len) {
                $new_str[] = substr($str, 0, 3);
                $str = substr($str, 3);
            }
        } else {
            $new_str[] = substr($str, 0, 1);
            $str = substr($str, 1);
        }
    }
    return join($new_str);
}

$row = $res -> fetch_assoc();
while ($row != null) {
	$aid = $row['aid'];
	$title = $row['title'];
	$author = $row['author'];
	$text = $row['body'];
	if (strlen($text) > 300) {
		$preview = utf_substr($text, 300);
	} else {
		$preview = $text;
	}
	$created_at = date('c', strtotime($row['created_at']));
	
	// get likes
	$sql_temp = "SELECT COUNT(polarity) AS likes
			FROM likes
			WHERE aid = $aid AND polarity = '1'";
	$res_temp = $mysqli -> query($sql_temp);
	$row_temp = $res_temp -> fetch_assoc();
	$likes = $row_temp['likes'];

	// get dislikes
	$sql_temp = "SELECT COUNT(polarity) AS dislikes
				FROM likes
				WHERE aid = $aid AND polarity = '0'";
	$res_temp = $mysqli -> query($sql_temp);
	$row_temp = $res_temp -> fetch_assoc();
	$dislikes = $row_temp['dislikes'];
	
	array_push($data, array('aid' => $aid, 'title' => $title, 'author' => $author, 'preview' => $preview, 'created_at' => $created_at, 'likes' => $likes, 'dislikes' => $dislikes));

	$row = $res -> fetch_assoc();
}

echo json_encode($data);
$mysqli -> close();
