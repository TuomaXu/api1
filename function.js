const f1 = (x)=>{
    return x+1;
}

const f2 = (x,callback)=>{
    setTimeout(()=>{
        callback(x+1);
    },1000);
}

const f3 = (x)=>{
    return new Promise((callback)=>{
        setTimeout(()=>{
            callback(x+1);
        },1000);
    })
}

export{
    f1,
    f2,
    f3,
}