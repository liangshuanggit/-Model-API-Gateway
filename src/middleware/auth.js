export function authMiddleware(options={}) {

    const keys = options.keys || [process.env.GATEWAY_API_KEY || "gateway-key"];

    return (req,res,next)=>{

        const header = req.headers.authorization || "";
        const token = header.replace("Bearer ","");

        if(!keys.includes(token)){
            return res.status(401).json({
                error:{
                    message:"Invalid API key",
                    type:"authentication_error"
                }
            });
        }

        req.user={apiKey:token};
        next();
    };
}
