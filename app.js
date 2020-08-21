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
  if (req.body.radio == 0) {
    db_table = 'student'
    var sql = 'select * FROM' + " " + db_table + " " + 'where Snu = ? AND password = ?'
  } else if (req.body.radio == 1) {
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
      return res.send({
        "data": {
          "username": req.body.username,
          "password": pass
        },
        "meta": {
          "msg": "用户不存在",
          "status": 500
        }
      })
    }else if (rows == "[]") {
      return res.send({
        "data": {
          "username": req.body.username,
          "password": pass
        },
        "meta": {
          "msg": "账号或密码错误",
          "status": 500
        }
      })
    } else {
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
    }
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
      row.meta.status = 504
      res.send(row)
    } else {
      res.send(row)
    }
  })
})

// 管理员查询教师基本信息
app.post('/teacher_message', (req, res) => {
  const sql = 'select Tnu, name, age,Sex,department,phone from teacher where department=?'
  const sqlArr = [req.body.department]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
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
      row.meta.status = 504
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

// 添加教师
app.post('/addTea', (req, res) => {
  const password = md5(md5(req.body.password))
  const sql = 'INSERT INTO teacher(id, Tnu, name, password, age, Sex, phone, department, creation_time) VALUES(0, ?, ?, ?, ?, ?, ?, ?, ?)'
  const sqlArr = [req.body.Tnu, req.body.name, password, req.body.age, req.body.Sex, req.body.phone, req.body.department, req.body.creation_time]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      const data = err.sqlMessage.split(' ')
      const mes = data[data.length - 1]
      if (mes == "'Snu'") {
        return res.send({
          "data": {},
          "meta": {
            "msg": '教工号已存在',
            "status": 504
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
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return console.log(err);
    }
    const rows = JSON.stringify(vals)
    res.send(rows)
  })
})

// 根据学号/教工号查询基本信息
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

// 根据教工号查询教师信息
app.get('/editTea', (req, res) => {
  const sql = 'select Tnu, name, department, phone from teacher where Tnu=?'
  const sqlArr = [req.query.Tnu]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return console.log(err);
    }
    const rows = JSON.parse(JSON.stringify(vals))
    res.send({
      "data": {
        "Tnu": rows[0].Tnu,
        "name": rows[0].name,
        "department": rows[0].department,
        "phone": rows[0].phone,
      },
      "meta": {
        "msg": '获取成功',
        "status": '201'
      }
    })
  })
})

// 根据学号/教工号修改基本信息
app.post('/editMsgById', (req, res) => {
  const mn = JSON.stringify(req.body).slice(2, 5)
  if (mn == "Snu") {
    var sql = 'update student set name=?,department=?,major=?,phone=? where Snu=?'
    var sqlArr = [req.body.name, req.body.department, req.body.major, req.body.phone, req.body.Snu]
  } else {
    var sql = 'update teacher set name=?,department=?,phone=? where Tnu=?'
    var sqlArr = [req.body.name, req.body.department, req.body.phone, req.body.Tnu]
  }
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return res.send({
        "meta": {
          "msg": "修改信息失败",

          "status": "504"
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
  const num = req.params.Snu.length;
  if (num == 11) {
    var sql = 'DELETE FROM student WHERE Snu=?'
  } else if (num == 10) {
    var sql = 'DELETE FROM teacher WHERE Tnu=?'
  }
  const sqlArr = [req.params.Snu]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      console.log(err);
      return res.send({
        "meta": {
          "msg": "删除失败",
          "status": '504'
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

// 教师修改密码
app.post('/changeTeapwd', (req, res) => {
  const sql = 'update teacher set password=? where Tnu=?'
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
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return res.send({
        "meta": {
          "status": 500
        }
      })
    }
    const rows = JSON.stringify(vals)
    res.send(rows)
  })
})

// 查询可选课程
app.post('/course_select', (req, res) => {
  let year = [];
  year = req.body.year;
  const stuClass = year.slice(5) - req.body.level;
  const sql = `select course.id,course.coursename,teacher.name,course.max,course.credit,course.state,course.address,course.schooltime
  from course,teacher  
  where course.Tnu = teacher.Tnu and depnum = (select depnum from dep where department=?) and class=? and semester=?`
  const sqlArr = [req.body.dep, stuClass, req.body.semester]
  query(sql, sqlArr, (err, vals, fields) => {
    if (err) {
      return res.send(err)
    }
    const rows = JSON.stringify(vals)
    res.send(rows)
  })
})

// 选课
app.put('/course_select/:id', (req, res) => {
  const sql1 = "select count(*) from select_course where Snu=? and course_id=?"
  const sql2 = "INSERT INTO select_course (id,Snu,course_id) VALUES (0,?,?)"
  const sqlArr = [req.body.Snu, req.body.id]
  query(sql1, sqlArr, (err, data) => {
    if (err) {
      return res.send({
        "data": {},
        "meta": {
          "msg": '选择失败',
          "status": 500
        }
      })
    }
    const count = JSON.stringify(data[0]["count(*)"]);
    if (count != 0) {
      return res.send({
        "data": {},
        "meta": {
          "msg": '该课程已选择',
          "status": 500
        }
      })
    } else {
      query(sql2, sqlArr, (err, vals, fields) => {
        if (err) {
          return res.send({
            "data": {},
            "meta": {
              "msg": '选择失败',
              "status": 500
            }
          })
        }
        res.send({
          "data": {},
          "meta": {
            "msg": '选择成功',
            "status": 201
          }
        })
      })
    }
  })
})

// 获取需要打分的列表
app.get('/make_gradeList/:Tnu', (req, res) => {
  const sql = ` 
  select student.Snu,student.name 
  from student 
  Inner join select_course 
  on student.Snu = select_course.Snu 
  Inner join course 
  on select_course.course_id = course.id 
  Inner join teacher 
  on course.Tnu = teacher.Tnu 
  where teacher.Tnu =?
  ORDER BY student.Snu
  `
  const sqlArr = [req.params.Tnu]
  query(sql, sqlArr, (err, data) => {
    const rows = JSON.parse(JSON.stringify(data))
    res.send(rows)
  })
})

// 打分/更成绩
app.put('/make_grade', (req, res) => {
  // 查看成绩是否已经存在
  const sql1 = `
  select count(*) 
  from grade 
  where Snu=? and name=? and course_id 
  IN (SELECT id from course where Tnu = ?)
  `
  // 没有存入成绩是存入成绩
  const sql2 = `
  INSERT INTO grade (id,Snu,name,course_id,grade) 
  VALUES (0,?,?,(SELECT id from course where Tnu = ?),?)
  `
  // 更改成绩
  const sql3 = `
  update grade set grade=?
  where Snu=? and name=? and course_id 
  IN (SELECT id from course where Tnu = ?)
  `
  const sqlArr1 = [req.body.Snu, req.body.name, req.body.Tnu, req.body.grade]
  const sqlArr3 = [req.body.grade, req.body.Snu, req.body.name, req.body.Tnu]
  query(sql1, sqlArr1, (error, data) => {
    if (error) {
      return res.send({
        "data": {},
        "meta": {
          "msg": '添加错误',
          "status": 500
        }
      })
    }
    const count = JSON.stringify(data[0]["count(*)"]);
    if (count != 0) {
      query(sql3, sqlArr3, (error3, data2) => {
        if (error3) {
          return res.send({
            "data": {},
            "meta": {
              "msg": '添加错误',
              "status": 500
            }
          })
        }
        res.send({
          "data": {},
          "meta": {
            "msg": '添加成功',
            "status": 201
          }
        })
      })
    } else {
      query(sql2, sqlArr1, (err, vals) => {
        if (err) {
          return res.send({
            "data": {},
            "meta": {
              "msg": '添加错误',
              "status": 500
            }
          })
        }
        res.send({
          "data": {},
          "meta": {
            "msg": '添加成功',
            "status": 201
          }
        })
      })
    }
  })

})

// 教师查看学生成绩
app.post('/view_grade',(req,res)=>{
  const snu = JSON.stringify(req.body).slice(11,13);
  const sql = "select grade.Snu,grade.name,grade.grade,course.coursename from grade,course where course.id=grade.course_id and Tnu=? and Snu LIKE " +"'"+ snu + "%"+"'"
  const sqlArr = [req.body.Tnu]
  query(sql,sqlArr,(err,data)=>{
    if (err) {
      return console.log(err);
    }
    const rows = JSON.stringify(data)
    res.send(data)
  })
})

// 学生查看成绩
app.post('/S_viewGrade',(req,res)=>{
  let year = [];
  year = req.body.year;
  const stuClass = year.slice(5) - req.body.level;
  const sql = `
  select course.coursename,teacher.name,grade.grade,course.credit
  from course,grade,teacher
  where grade.course_id = course.id
  and course.Tnu = teacher.Tnu
  and course.class=? and course.semester=? and grade.Snu=?
  `
  const sqlArr = [req.body.semester,stuClass,req.body.Snu]
  query(sql,sqlArr,(err,vals)=>{
    if (err) {
      return console.log(err);
    }
    const rows = JSON.stringify(vals)
    res.send(rows)
  })
})

app.listen(port, () => console.log(`Example app listening on port port!http://127.0.0.1:3000`))
