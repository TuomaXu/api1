import {app} from './app';

//开启监听服务
const server = app.listen(5001,()=>{
	console.log('开启成功');
});
