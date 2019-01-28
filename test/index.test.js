import assert from 'assert';
import superTest from 'supertest'

import {
    f1,
    f2,
    f3,
} from '../function';

import { app, sequelize } from '../app';

let http;



describe('测试套件1',()=>{

    before('测试准备',()=>{
        http = superTest(app);
    })
    

    it('测试用例1-普通函数测试',()=>{
        assert(f1(1) == 3);
    })

    it('测试用例2-异步回调函数测试',(done)=>{
        f2(1,(r)=>{
            assert(r == 2);
            done();
        })
    })

    it('测试用例3-Promise异步函数测试',async()=>{
        const r = await f3(1);
        assert(r == 2);
    })

    it('测试用例4-内部Web服务测试',async()=>{
        const res = await http.get('/api/test1');
        //console.log(res);
        assert(res.body.success === true);
    })

})