const buckets = new Map();

export function rateLimit(options={}){

    const limit = options.limit || 60;
    const windowMs = options.windowMs || 60000;

    return (req,res,next)=>{

        const key = req.user?.apiKey || req.ip;
        const now = Date.now();

        let bucket = buckets.get(key);

        if(!bucket || now-bucket.start > windowMs){
            bucket={start:now,count:0};
        }

        bucket.count++;
        buckets.set(key,bucket);

        if(bucket.count>limit){
            return res.status(429).json({
                error:{
                    message:"Rate limit exceeded",
                    type:"rate_limit_error"
                }
            });
        }

        next();
    };
}
