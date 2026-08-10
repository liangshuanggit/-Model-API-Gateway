import express from 'express';

const router = express.Router();

let metrics = {
  requests: 0,
  errors: 0
};

export function incRequest(){
  metrics.requests++;
}

export function incError(){
  metrics.errors++;
}

router.get('/metrics',(req,res)=>{
  res.type('text/plain').send(
`gateway_requests_total ${metrics.requests}\ngateway_errors_total ${metrics.errors}\n`
  );
});

export default router;
