import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import crypto from 'crypto';

//引入Sequelize框架
import Sequelize  from 'sequelize';

//通过Sequelize构造方法创建Sequelize实例并链接数据库
const seq = new Sequelize(
    'api',
    'root',
    '',
    {
        'dialect': 'mysql',  // 数据库使用mysql
        'host': 'localhost', // 数据库服务器ip
        'port': 3306,         // 数据库服务器端口
        // logging:(msg)=>{
        //     //调试日志输出
        //     //console.log(msg);
        // }
    }
  );

//   seq
//   .authenticate()
//   .then(()=>{
//     console.log('链接成功');
//   })
//   .catch((err)=>{
//     console.error('链接失败', err);
//   });

  //定义数据模型
  const { STRING, DATE, INTEGER, DOUBLE, BOOLEAN } = Sequelize;
  const Teacher = seq.define('teacher',{
      tel:STRING,
      name:STRING,
      password:STRING,
      access_token:STRING,
  })

  const Student = seq.define('student',{
        tel:STRING,
        name:STRING,
        password:STRING,
        access_token:STRING,
    })

    const Coures =  seq.define('course',{
        name:STRING,
        desc:STRING,
    });

    const Comment =  seq.define('comment',{
        range:INTEGER,
        desc:STRING
    });

    Teacher.hasMany(Coures);
    Coures.belongsTo(Teacher);

    Coures.hasMany(Comment);
    Comment.belongsTo(Coures);

    Student.hasMany(Comment);
    Comment.belongsTo(Student);

  //模型同步
  seq.sync();


//通过Express框架创建一个ExpressApp对象
const app = express();

//支持跨域请求
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();   
});

//添加静态文件服务器
//使用express自带的static中间件，对source目录提供静态文件服务
app.use('/resource',express.static('./resource'));

//解析JSON数据表单
app.use(bodyParser.json())
//解析表单文件
app.use(multer().any());


app.get('/platform/test1',(req,res)=>{
    res.send({success:true});
})

 function createToken(tel,password){
    const hash = crypto.createHash('md5');
    const date = new Date();
    const random = Math.random();
    hash.update(tel + password + date + random);
    const access_token = hash.digest('hex');
    return access_token;
}


//平台API

app.post('/admin/login',async(req,res)=>{
    const { username, password } = req.body;

    if(username === 'admin' && password === '1234'){
        res.send({
            success:true,
            data:'1112223344',
        })
    }else{
        res.send({
            success:false,
            errorCode:10001
        })
    }
})

app.post('/admin/addTeacher',async(req,res)=>{
    const { name, tel } = req.body;
    const t = await Teacher.create({ name, tel });
    res.send({
        success:true,
        data:t,
    })
})

app.post('/admin/addStudent',async(req,res)=>{
    const { name, tel } = req.body;
    const t = await Student.create({ name, tel });
    res.send({
        success:true,
        data:t,
    })
})

app.post('/admin/teachers',async(req,res)=>{
    const arr = await Teacher.findAll({
        attributes:['id','name','tel','access_token']
    });
    res.send({
        success:true,
        data:arr,
    })
});

app.post('/admin/students',async(req,res)=>{
    const arr = await Student.findAll({
        attributes:['id','name','tel','access_token']
    });
    res.send({
        success:true,
        data:arr,
    })
});

app.post('/admin/courses',async(req,res)=>{
    const arr = await Coures.findAll({
        include:[
            {
                model:Teacher,
                attributes:['name']
            }
        ]
    });
    res.send({
        success:true,
        data:arr,
    })
});

app.post('/admin/comments',async(req,res)=>{
    const arr = await Comment.findAll({
        include:[
            {
                model:Student,
                attributes:['name']
            },
            {
                model:Coures,
                include:[
                    {
                        model:Teacher,
                        attributes:['name']
                    }
                ]
            }

        ]
    });
    res.send({
        success:true,
        data:arr,
    })
});

//教师API

app.post('/teacher/register',async(req,res)=>{

    const { name, tel, code, password } = req.body;
    const t = await Teacher.findOne({where:{name, tel}});
    if(!t){
        res.send({
            success:true,
            code:10001
        })
        return;
    }

    t.password = password;
    t.access_token = createToken(tel,password);

    await t.save();

    res.send({
        success:true,
        data:t.access_token
    })



});
app.post('/teacher/login',async(req,res)=>{

    const {tel, password} = req.body;
    const t = await Teacher.findOne({where:{password, tel}});
    if(!t){
        res.send({
            success:false,
            code:10002
        })
        return;
    }

    t.access_token = createToken(tel,password);

    await t.save();

    res.send({
        success:true,
        data:t.access_token
    })

});

app.post('/teacher/addCourse',async(req,res)=>{
    const { access_token, name, desc } = req.body;
    const t = await Teacher.findOne({where:{access_token}});
    if(!t){
        res.send({
            success:false,
            code:10003
        })
        return;
    }

    const c = await Coures.create({
        name,
        desc,
        teacherId:t.id
    });

    res.send({
        success:true,
        data:c,
    })

});
app.post('/teacher/courses',async(req,res)=>{
    const { access_token } = req.body;
    const t = await Teacher.findOne({where:{access_token}});
    if(!t){
        res.send({
            success:false,
            code:10003
        })
        return;
    }

    const arr = await Coures.findAll({where:{teacherId:t.id}});

    res.send({
        success:true,
        data:arr
    })
});
app.post('/teacher/courseDetail',async(req,res)=>{
    const { access_token, courseId } = req.body;
    const t = await Teacher.findOne({where:{access_token}});
    if(!t){
        res.send({
            success:false,
            code:10003
        })
        return;
    }

    const arr = await Comment.findAll({
        where:{
            courseId
        },
        include:[
            {
                model:Student,
                attributes:['name']
            }
        ]
    })

    res.send({
        success:true,
        data:arr
    })
});

//学生API
app.post('/student/register',async(req,res)=>{

    const { name, tel, code, password } = req.body;
    const t = await Student.findOne({where:{name, tel}});
    if(!t){
        res.send({
            success:false,
            code:10001
        })
        return;
    }

    t.password = password;
    t.access_token = createToken(tel,password);

    await t.save();

    res.send({
        success:true,
        data:t.access_token
    })
})

app.post('/student/login',async(req,res)=>{

    const {tel, password} = req.body;
    const t = await Student.findOne({where:{password, tel}});
    if(!t){
        res.send({
            success:false,
            code:10002
        })
        return;
    }

    t.access_token = createToken(tel,password);

    await t.save();

    res.send({
        success:true,
        data:t.access_token
    })
})

app.post('/student/addComment',async(req,res)=>{

    const { access_token, courseId, range, desc } = req.body;
    const s = await Student.findOne({where:{access_token}});
    if(!s){
        res.send({
            success:false,
            code:10003
        })
        return;
    }

    const c = await Comment.create({
        range,
        desc,
        courseId,
        studentId:s.id,
    });

    res.send({
        success:true,
        data:c,
    })

})
app.post('/student/teachers',async(req,res)=>{
    const { access_token } = req.body;
    const s = await Student.findOne({where:{access_token}});
    if(!s){
        res.send({
            success:false,
            code:10003
        })
        return;
    }

    const arr = await Teacher.findAll();
    res.send({
        success:true,
        data:arr,
    })


})
app.post('/student/courses',async(req,res)=>{
    const { access_token, teacherId } = req.body;
    const s = await Student.findOne({where:{access_token}});
    if(!s){
        res.send({
            success:false,
            code:10003
        })
        return;
    }

    const arr = await Coures.findAll({where:{teacherId}});
    res.send({
        success:true,
        data:arr,
    })

})



export {
    seq as sequelize,
    app
}