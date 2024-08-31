var express = require('express');
var router = express.Router();
const db = require('./db/db'); // データベースをインポート

//ユーザー登録
router.post('/sugnup', function (req, res, next) {
	const user_id = req.body.user_id;
	const password = req.body.password;
	const errMsg = "Account creation failed";

	if (!user_id || !password) {
		res.status(400).json({ message: errMsg, cause: "required user_id and password" });
	} else if (user_id.length < 6 || user_id.length > 20) {
		res.status(400).json({ message: errMsg, cause: "length is user_id must be 6 to 20" });
	} else if (password.length < 8 || password.length > 20) {
		res.status(400).json({ message: errMsg, cause: "length is password must be 8 to 20" });
	} else if (/^[a-zA-Z0-9]+$/.test(user_id) === false) {
		res.status(400).json({ message: errMsg, cause: "pattern user_id must be alphanumeric" });
	} else if (/^[\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password) === false) {
		res.status(400).json({ message: errMsg, cause: "pattern password must be alphanumeric or symbol" });
	}

	db.get(`SELECT 1 FROM users WHERE user_id = ? LIMIT 1`, [user_id], (err, row) => {
		if (err) {
			res.status(400).json({ message: errMsg, cause: err.message });
		} else if (row) {
			res.status(400).json({ message: errMsg, cause: "already same user_id is used" });
		} else {
			db.run(`INSERT INTO users (user_id, password, nickname, comment) VALUES (?, ?, ?, ?)`, [user_id, password, user_id, ""], (err) => {
				if (err) {
					res.status(400).json({ message: errMsg, cause: err.message });
				} else {
					res.status(400).json({
						message: "Account successfully created",
						user: { user_id: user_id, nickname: user_id }
					});
				}
			});
		}
	})


});

//ユーザー消去
router.post('/close', function (req, res, next) {
	const user_id = req.params.user_id;
	const authHeader = req.headers.authorization;
	const auth = Buffer.from(authHeader, 'base64').toString('utf-8');
	const [authUser, authPassword] = auth.split(':');
	const userFoundMsg = "User details is by user_id";

	if (!authUser || !authPassword || authUser !== user_id) {
		res.status(401).json({ message: "Authentication failed" });
	}
	db.serealize(() => {
		db.get(`SELECT password FROM users WHERE user_id = ? LIMIT 1`, [user_id], (err, row) => {
			if (err) {
				res.status(400).json({ message: err.message });
			} else if (!row) {
				res.status(404).json({ message: "No User found" });
			} else if (row.password !== authPassword) {
				res.status(401).json({ message: "Authentication failed" });
			}
		});
		db.run(`DELETE FROM users WHERE user_id = ?`, [user_id], (err) => {
			if (err) {
				res.status(400).json({ message: err.message });
			} else {
				res.status(200).json({ message: "Account and user successfully removed" });
			}
		});
	});
});

module.exports = router;
