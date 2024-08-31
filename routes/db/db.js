// db.js
const sqlite3 = require('sqlite3').verbose();

// データベースファイルを指定（存在しない場合は自動的に作成されます）
const db = new sqlite3.Database('./my-database.db', (err) => {
	if (err) {
		console.error('データベースに接続できません:', err.message);
	} else {
		console.log('データベースに接続されました');
	}
});

// テーブルを作成（存在しない場合のみ）
db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
        nickname TEXT NOT NULL,
		comment TEXT
    )`, (err) => {
		if (err) {
			console.error('テーブル作成中にエラーが発生しました:', err.message);
		} else {
			console.log('テーブルが正常に作成されました');
		}
	});

	db.run(`INSERT INTO users (user_id, password, nickname, comment) VALUES ("TaroYamada", "PaSSwd4TY", "たろー", "僕は元気です")`, (err) => {
		if (err) {
			console.error('データ挿入中にエラーが発生しました:', err.message);
		} else {
			console.log('データが正常に挿入されました');
		}
	});
});

module.exports = db;