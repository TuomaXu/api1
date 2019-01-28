const fs = require('fs'); // 引入fs模块
const axios = require('axios'); 
const scanf = require('scanf');

fs.readFile('./r.json','utf-8', function(err, data) {
    // 读取文件失败/错误
    if (err) {
        throw err;
    }
    // 读取文件成功
    console.log('请输入姓名');
    const name = scanf('%s');

    console.log('请输入学号');
    const number = scanf('%s');

    console.log('请输入任务ID');
    const taskId = scanf('%d');

    const p = {
        test:JSON.parse(data),
        student:{
            name,
            number,
            taskId
        }
    }
    console.log(p);
    // axios.post('http://localhost:6010/submit',p)
    // .then((res)=>{
    //     //console.log(res);
    //     console.log('测试结果上传完成！');
    // })
    
});