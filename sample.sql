SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+08:00";

CREATE TABLE `articles` (
  `aid` int(10) NOT NULL,
  `uid` int(10) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci,
  `body` text CHARACTER SET utf8 COLLATE utf8_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `comments` (
  `cid` int(10) NOT NULL,
  `aid` int(10) NOT NULL,
  `uid` int(10) NOT NULL,
  `body` text CHARACTER SET utf8 COLLATE utf8_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `likes` (
  `uid` int(10) NOT NULL,
  `aid` int(10) NOT NULL,
  `polarity` enum('1','0') CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `users` (
  `uid` int(10) NOT NULL,
  `username` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` char(32) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `articles`
  ADD PRIMARY KEY (`aid`) USING BTREE,
  ADD KEY `author` (`uid`);

ALTER TABLE `comments`
  ADD PRIMARY KEY (`cid`) USING BTREE,
  ADD KEY `comment_operator` (`uid`),
  ADD KEY `comment_article` (`aid`);

ALTER TABLE `likes`
  ADD PRIMARY KEY (`uid`,`aid`) USING BTREE,
  ADD KEY `like_operator` (`aid`),
  ADD KEY `like_article` (`aid`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`uid`) USING BTREE;

ALTER TABLE `articles`
  MODIFY `aid` int(10) NOT NULL AUTO_INCREMENT;

ALTER TABLE `comments`
  MODIFY `cid` int(10) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `uid` int(10) NOT NULL AUTO_INCREMENT;

ALTER TABLE `articles`
  ADD CONSTRAINT `author` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`);

ALTER TABLE `comments`
  ADD CONSTRAINT `comment_article` FOREIGN KEY (`aid`) REFERENCES `articles` (`aid`),
  ADD CONSTRAINT `comment_operator` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`);

ALTER TABLE `likes`
  ADD CONSTRAINT `like_article` FOREIGN KEY (`aid`) REFERENCES `articles` (`aid`),
  ADD CONSTRAINT `like_operator` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`);
COMMIT;
