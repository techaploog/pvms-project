const sqlite = require("sqlite3");
const path = require("path");
const fs = require("fs");

const initServerState = {
  status: false,
  db: false,
};

let currentState = initServerState;

const DB_FILE_NAME = process.env.INTERNAL_DB_FILE;
const DB_PATH = path.join(__dirname, DB_FILE_NAME);
const tableName = "dataLogs";

//INIT INTERNAL DATABASE
async function dbInit() {
  let db = new sqlite.Database(DB_PATH, (error) => {
    if (error) {
      console.log(`[ERROR]\tCannot create internal database.`);
      console.log(`\t-${error}`);
      return currentState.status;
    }
  });
  // Create Table
  let sqlStr = `CREATE TABLE IF NOT EXISTS ${tableName} (
        id char(12) PRIMARY KEY,
        serverTime datetime NOT NULL,
        trackPoint varchar(3) NOT NULL,
        rawData varchar(1024) NOT NULL
    )`;

  const result = await new Promise((resolve, rejects) => {
    db.run(sqlStr, (error) => {
      if (error) {
        console.log(error);
        resolve(false);
      } else resolve(true);
    });
  });

  if (result) {
    currentState = {
      status: true,
      db: db,
    };
  }
  return currentState.status;
}


// Connect To Database when DB file is exists
async function dbConnect() {
  let db = new sqlite.Database(DB_PATH, (error) => {
    if (error) {
      console.log(`[ERROR]\tCannot connect to internal database.`);
      console.log(`\t-${error}`);
      return currentState.status;
    }
  });

  currentState = {
    status: true,
    db: db,
  };

  return currentState.status;
}


// CHECK .db FILE
function dbCheckFile() {
  return fs.existsSync(DB_PATH);
}


// RETURN THE LATEST ROW OF DATA
async function dbLatestRow() {
  if (! currentState.status) {
    return false
  }

  const latest = await new Promise((resolve,rejects)=>{
    const sql = `SELECT * FROM ${tableName} ORDER BY serverTime DESC LIMIT 1;`
    currentState.db.get(sql,(error,rows) => {
      if (error) {
        resolve([]);
      } else {
        resolve(rows);
      }
    });
  });

  return latest;
}


// INSERT DATA INTO DB
async function dbInsert(id, trackPoint, rawData) {
  let db = currentState.db;
  const result = await new Promise((resolve, rejects) => {
    const sql = `INSERT INTO ${tableName} VALUES(
            '${id}',
            datetime('now'),
            '${trackPoint}',
            '${rawData}'
        );`;

    db.run(sql, (error) => {
        if (error){
            console.log(error);
            resolve(false);
        }else {
            resolve(true);
        }
    });
  });

  return result;
}

async function dbDeleteOlder(dateString){

  if (typeof(dateString) !== "string"){
    return [];
  }

  const rows = await new Promise((resolve,rejects)=>{
    currentState.db.all(`SELECT * FROM ${tableName} WHERE serverTime <= datetime('${dateString}')`,(error,rows)=>{
      if(error){
        resolve([]);
      }else {
        resolve(rows);
      }
    });
  });

  await new Promise((resolve,rejects) => {
    currentState.db.run(`DELETE FROM ${tableName} WHERE serverTime < datetime('${dateString}')`, (error) => {
      if(error) resolve(false);
      else resolve(true);
    });
  });

  return rows;
}

module.exports = {
  dbCheckFile,
  dbInit,
  dbConnect,
  dbInsert,
  dbLatestRow,
  dbDeleteOlder,
};
