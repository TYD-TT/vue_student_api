const mysql = require("mysql");
const pool = mysql.createPool({
    connectionLimit : 100,
    host: 'localhost',
    user: 'root',
    password: 'tyd970420',
    database: 'db_student',
    port: 3306
  })

var query = function (sql,sqlArr, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql,sqlArr, function (qerr, vals, fields) {
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr, vals, fields);
            });
        }
    });
};

module.exports = query;