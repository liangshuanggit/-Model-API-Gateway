import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPostgres(){
  if(!pool){
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }
  return pool;
}

export async function query(sql, params=[]){
  const db = getPostgres();
  return db.query(sql, params);
}
