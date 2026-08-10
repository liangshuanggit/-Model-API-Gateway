export function requestLogger(req,res,next){
  const start=Date.now();

  res.on('finish',()=>{
    console.log(JSON.stringify({
      method:req.method,
      path:req.path,
      status:res.statusCode,
      latency:Date.now()-start,
      ip:req.ip
    }));
  });

  next();
}
