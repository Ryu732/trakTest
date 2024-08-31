var express = require('express');
var router = express.Router();
const db = require('./db/db'); // データベースをインポート


// ユーザー情報取得
router.get('/:user_id', function (req, res, next) {
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

		db.get(`SELECT 1 FROM users WHERE user_id = ? LIMIT 1`, [user_id], (err, row) => {
			if (err) {
				res.status(400).json({ message: err.message });
			} else if (!row) {
				res.status(404).json({ message: "No User found" });
			} else {
				db.get(`SELECT user_id, nickname, comment FROM users WHERE user_id = ?`, [user_id], (err, row) => {
					if (err) {
						res.status(400).json({ message: err.message });
					} else {
						if (row.comment === null) {
							res.json({ message: userFoundMsg, user: { user_id: row.user_id, nickname: row.nickname } });
						} else {
							res.json({ message: userFoundMsg, user: { user_id: row.user_id, nickname: row.nickname, comment: row.comment } });
						}
					}
				});
			}
		});
	});
});

router.patch('/:user_id', function (req, res, next) {
	const user_id = req.params.user_id;
	const authHeader = req.headers.authorization;
	const auth = Buffer.from(authHeader, 'base64').toString('utf-8');
	const [authUser, authPassword] = auth.split(':');

	if (!authUser || !authPassword) {
		res.status(401).json({ message: "Authentication failed" });
	} else if (authUser !== user_id) {
		res.status(403).json({ message: "No Permission for update" });
	} else if (req.body.recipe.user_id || req.body.recipe.password) {
		res.status(400).json({ message: "User updation failed", cause: "not updatable user_id and password" });
	} else if (!req.body.recipe.nickname || !req.body.recipe.comment) {
		res.status(400).json({ message: "User updation failed", cause: "required nickname or comment" });
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
		db.get(`SELECT 1 FROM users WHERE user_id = ? LIMIT 1`, [user_id], (err, row) => {
			if (err) {
				res.status(400).json({ message: err.message });
			} else if (!row) {
				res.status(404).json({ message: "No User found" });
			} else {
				db.run(`UPDATE users SET nickname = ?, comment = ? WHERE user_id = ?`, [req.body.recipe.nickname, req.body.recipe.comment, user_id], (err) => {
					if (err) {
						res.status(400).json({ message: err.message });
					} else {
						res.status(200).json({ message: "User successfully updated", recipe: { nickname: req.body.recipe.nickname, comment: req.body.recipe.comment } });
					}
				});
			}
		});
	});

});

module.exports = router;
