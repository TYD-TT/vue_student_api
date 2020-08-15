const express = require('express')
const app = express()
const md5 = require('md5')
const port = 3000
const bodyParser = require('body-parser')
const query = require('./dbConfig')

// 配置body-parser
// 配置完成后，在req请求对象上会多出一个属性：body
// 可以使用 req.body 来获取表单 POST 请求体数据
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.engine('art', require('express-art-template'));

// 设置为可跨域
// app.all('*', function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By", ' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });

app.use("*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  if (req.method === 'OPTIONS') {
    res.send(200)
  } else {
    next()
  }
});

// 前端请求地址为  http://localhost:8001/login
app.get('/login', (req, res) => {
  query(`SELECT * FROM user`, (err, vals, fields) => {
    let rows = JSON.stringify(vals);
    res.send(rows)
  })
})

// 登录请求
app.post('/login', (req, res) => {
  var db_table
  if (req.body.radio === 0) {
    db_table = 'student'
    var sql = 'select * FROM' + " " + db_table + " " + 'where Snu = ? AND password = ?'
  } else if (req.body.radio === 1) {
    db_table = 'teacher'
    var sql = 'select * FROM' + " " + db_table + " " + 'where Tnu = ? AND password = ?'
  } else {
    db_table = 'admin'
    var sql = 'select * FROM' + " " + db_table + " " + 'where name = ? AND password = ?'
  }

  var pass = md5(md5(req.body.password))
  var sqlArr = [req.body.username, pass]

  query(sql, sqlArr, (err, vals, fields) => {
    let rows = JSON.stringify(vals)
    if (err) {
      console.log(err);
      return res.status(500).send('服务器错误')
    }
    if (rows == "") {
      return res.send({
        "data": {
          "username": req.body.username,
          "password": pass
        },
        "meta": {
          "msg": "账号或密码错误",
          "status": 204
        }
      })
    }
    res.send({
      "data": {
        "username": req.body.username,
        "password": pass
      },
      "meta": {
        "msg": "登录成功",
        "status": 201
      }
    })
  })
})

// 注册请求
app.post('/register', (req, res) => {
  var sql = 'INSERT INTO user(userID,userName,password,email,phone) VALUES(0,?,?,?,?)'
  var pass = md5(md5(req.body.password))
  var sqlArr = [req.body.username, pass, req.body.email, req.body.phone]
  query(sql, sqlArr, (err, vals, fields) => {
    // let rows = JSON.stringify(vals)
    // const message = "Duplicate entry" + " '" + req.body.username + "' " + "for key 'userName'"
    if (err) {
      res.send({
        "data": {
          "username": req.body.username,
          "password": pass,
          "email": req.body.email,
          "phone": req.body.phone
        },
        "meta": {
          "msg": "用户名已存在",
          "status": 202
        }
      })
    }
    res.send({
      "data": {
        "username": req.body.username,
        "password": pass,
        "email": req.body.email,
        "phone": req.body.phone
      },
      "meta": {
        "msg": "注册成功",
        "status": 201
      }
    })
  })
})

// 管理员查询学生基本信息
app.post('/information', (req, res) => {
  let sql = 'select Snu, name,phone,department,major from student where department=? and major=? and level=?'
  let sqlArr = [req.body.department, req.body.major, req.body.level]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      console.log(1);
      return console.log(err);
    }
    const rows = JSON.parse(JSON.stringify(vals))
    const row = {
      "data": rows,
      "meta": {
        "msg": '获取列表成功',
        "status": 201
      }
    }
    row.count = rows.length
    if (rows.length == 0) {
      row.meta.msg = '查询对象不存在'
      row.meta.status = 204
      res.send(row)
    } else {
      res.send(row)
    }
  })
})

// 添加学生
app.post('/addStu', (req, res) => {
  const password = md5(md5(req.body.password))
  const sql = 'INSERT INTO student(id, Snu, name, password, age, Sex, phone, level, department, major, creation_time) VALUES(0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  const sqlArr = [req.body.Snu, req.body.name, password, req.body.age, req.body.Sex, req.body.phone, req.body.level, req.body.department, req.body.major, req.body.creation_time]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      const data = err.sqlMessage.split(' ')
      const mes = data[data.length - 1]
      if (mes == "'Snu'") {
        return res.send({
          "data": {},
          "meta": {
            "msg": '学号已存在',
            "status": 204
          }
        })
      }
    }
    res.send({
      "data": {},
      "meta": {
        "msg": '添加成功',
        "status": 201
      }
    })
  })
})

// 查询所有院系
app.get('/department', (req, res) => {
  const sql = 'select department from dep'
  query(sql, (err, vals, fields) => {
    if (err) {
      return console.log(err);
    }
    const rows = JSON.parse(JSON.stringify(vals))
    res.send(rows)
  })
})

// 查询所有的专业
app.get('/major', (req, res) => {
  const sql = 'select depnum,major from major'
  query(sql, (err, vals, fields) => {
    if (err) {
      return console.log(err);
    }
    const rows = JSON.stringify(vals)
    res.send(rows)
  })

})

// 查询院系对应的专业
app.post('/major', (req, res) => {
  const sql = 'select major from major where depnum = ? '
  const sqlArr = [req.body.depnum]
  // console.log(req);
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return console.log(err);
    }
    const rows = JSON.stringify(vals)
    console.log(rows);
    res.send(rows)
  })
})

// 根据学号查询学生信息
app.get('/editStu', (req, res) => {
  const sql = 'select Snu, name, department, major, phone,level from student where Snu=?'
  const sqlArr = [req.query.Snu]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return console.log(err);
    }
    const rows = JSON.parse(JSON.stringify(vals))
    res.send({
      "data": {
        "Snu": rows[0].Snu,
        "name": rows[0].name,
        "department": rows[0].department,
        "major": rows[0].major,
        "phone": rows[0].phone,
        "level": rows[0].level
      },
      "meta": {
        "msg": '获取成功',
        "status": '201'
      }
    })
  })
})

// 根据学号修改学生信息
app.post('/editStudent', (req, res) => {
  const sql = 'update student set name=?,department=?,major=?,phone=? where Snu=?'
  const sqlArr = [req.body.name, req.body.department, req.body.major, req.body.phone, req.body.Snu]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return res.send({
        "meta": {
          "msg": "修改信息失败",

          "status": "205"
        }
      });
    }
    res.send({
      "meta": {
        "msg": "修改成功",

        "status": "201"
      }
    });
  })
})

// 根据学号删除学生信息
app.delete('/editStudent/:Snu', (req, res) => {
  const sql = 'DELETE FROM student WHERE Snu=?'
  const sqlArr = [req.params.Snu]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return res.send({
        "meta": {
          "msg": "删除失败",
          "status": '204'
        }
      })
    }
    res.send({
      "meta": {
        "msg": "删除成功",
        "status": '201'
      }
    })
  })
})

// 学生修改密码
app.post('/changepwd', (req, res) => {
  const sql = 'update student set password=? where Snu=?'
  const sqlArr = [md5(md5(req.body.newpass)), req.body.num]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return res.send({
        "data": {},
        "meta": {
          "msg": '修改失败',
          "status": '204'
        }
      })
    }
    res.send({
      "data": {},
      "meta": {
        "msg": '修改成功',
        "status": '201'
      }
    })
  })
})

// 查询选课结果
app.post('/course_result', (req, res) => {
  let year = [];
  year = req.body.year;
  const stuClass = year.slice(5) - req.body.level;
  const sql = 'select coursename,credit,state from course,select_course where course.id = select_course.course_id and select_course.Snu = ? and course.class = ? and course.semester = ?'
  const sqlArr = [req.body.Snu, stuClass, req.body.semester]
  query(sql,sqlArr,(err,vals,fields)=>{
    if (err) {
      return res.send({
        "meta":{
          "status":500
        }
      })
    }
    const rows = JSON.stringify(vals)
    res.send(rows)
  })
})

app.listen(port, () => console.log(`Example app listening on port port!http://127.0.0.1:3000`))
