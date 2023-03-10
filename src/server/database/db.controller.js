const {
  dbCheckFile,
  dbInit,
  dbConnect,
  dbDeleteOlder,
} = require("./db.model");

let dbStatus;

async function startDatabaseServer() {
  if (dbCheckFile()) {
    dbStatus = await dbConnect();
  } else {
    dbStatus = await dbInit();
  }

  if (dbStatus) {
    console.log(`[INIT]\tInternal Database \t: READY.`);
    return true;
  } else {
    console.log(`[ERROR]\tCannot connect to Database.`);
    return false;
  }
}

async function setCleaningInterval (nDays=30) {
  if (typeof(nDays) !== "number" || nDays <=0 ){
    console.log(`[ERROR]\t'nDays' parameter must be number which greater than 0.`);
    return false;
  }
  
  let counter = nDays;
  const dayMS = 24 * 3600 * 1000;

  console.log(`[INIT]\tSet auto cleaning every\t: ${nDays} days`);
  
  setInterval( async ()=>{
    if (counter <= 0){
      let oldDate = new Date(Number(new Date()) - (nDays * dayMS));
      let oldDateStr = oldDate.toISOString().split('T')[0];
      
      console.log(`[INFO]\t Start clearning...\t : ${oldDateStr}.`);
      
      let deletedRows = await dbDeleteOlder(oldDateStr);
    
      console.log(`[INFO]\t Deleted total\t\t : ${deletedRows.length} rows.`);
  
      deletedRows.forEach((row)=>{
        console.log('\t-> ',row.id,row.serverTime);
      });

      counter = nDays;
    }else{
      counter--;
    }
  }, (dayMS) );

  return true;
  
}

module.exports = {
  startDatabaseServer,
  setCleaningInterval,
};
