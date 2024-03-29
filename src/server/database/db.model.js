const sqlite = require("sqlite3");
const path = require("path");
const fs = require("fs");

const initServerState = {
  status: false,
  db: false,
};

let currentState = initServerState;

const DB_FILE_NAME = process.env.PVMS_SERV_DB_FILE;
const DB_PATH = path.join(__dirname, DB_FILE_NAME);
const tableName = "dataLogs";

//INIT INTERNAL DATABASE
async function dbInit() {
  let newDB = new sqlite.Database(DB_PATH, (error) => {
    if (error) {
      console.log(`[ERROR]\tCannot create internal database.`);
      console.log(`\t-${error}`);
      return currentState.status;
    }
  });
  // Create Table
  let sqlStr = `CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(20) PRIMARY KEY,
        serverTime datetime NOT NULL,
        msgType CHARACTER(2) NOT NULL,
        trackPoint CHARACTER(3) NOT NULL,
        bcSeq CHARACTER(3) NOT NULL,
        bodyNo CHARACTER(5) NOT NULL,
        rawData VARCHAR(1024) NOT NULL
    )`;

  const result = await new Promise((resolve, rejects) => {
    newDB.run(sqlStr, (error) => {
      if (error) {
        console.log(error);
        resolve(false);
      } else {
        resolve(true)
      };
    });
  });

  if (result) {
    currentState = {
      status: true,
      db: newDB,
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


// GET THE LATEST ROW OF DATA
async function dbLatestRow(trackPoint=undefined, msgType="00") {
  if (! currentState.status) {
    return false
  }

  const latest = await new Promise((resolve,rejects)=>{
    const sql = `SELECT * FROM ${tableName} ` + 
      `WHERE msgType = '${msgType}' ` +
      `${trackPoint ? `AND trackPoint = '${trackPoint}' `: ""}` +
      `ORDER BY serverTime DESC, id DESC LIMIT 1;`

    currentState.db.get(sql,(error,rows) => {
      if (error) {
        resolve(undefined);
      } else {
        resolve(rows);
      }
    });
  });

  return latest;
}


// INSERT DATA INTO DB
async function dbInsert(id, msgType, trackPoint, bcSeq, bodyNo, rawData) {
  let db = currentState.db;
  const result = await new Promise((resolve, rejects) => {
    const sql = `INSERT INTO ${tableName} VALUES(
            '${id}',
            datetime('now','localtime'),
            '${msgType}',
            '${trackPoint}',
            '${bcSeq}',
            '${bodyNo}',
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


// delete data which are older than "dateString"
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


async function dbTrackPoints() {
  const sqlstr = `SELECT DISTINCT trackPoint FROM ${tableName}`
  
  const dataRows = await new Promise((resolve,rejects) => {
    currentState.db.all(sqlstr, (error,rows) => {
      resolve(rows);
    })
  });

  return dataRows;
}


async function dbRunQuery(selectString,conditionString=undefined){
  const sqlstr =`SELECT ${selectString} FROM ${tableName} ${conditionString ? conditionString : ""};`;
  return new Promise((resolve,rejects) => {
    currentState.db.all(sqlstr, (error,rows) => {
      if(error){
        rejects(error);
      }

      resolve(rows);
    });
  });
}

module.exports = {
  dbInit,
  dbInsert,
  dbConnect,
  dbRunQuery,
  dbCheckFile,
  dbLatestRow,
  dbTrackPoints,
  dbDeleteOlder,
};
