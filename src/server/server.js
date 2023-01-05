require("dotenv").config();

global.__basedir = __dirname;

const {
  startDatabaseServer,
  setCleaningInterval,
} = require("./database/db.controller");
const { initListenerState } = require("./apps/socket/pvms.controller");

const socketServer = require("./apps/socket/pvms.server");
const apiServer = require("./apps/http/api.server");

const SERVER_PORT = Number(process.env.PVMS_SERV_PORT);
const API_PORT = Number(process.env.PVMS_API_PORT);

async function startServer(resetMode = false) {
  console.log("- - - - - - - - -");

  await startDatabaseServer();
  await setCleaningInterval(30);

  // init socket listener state
  await initListenerState(resetMode);

  console.log(`\n- - - - - - - - -`);
  socketServer.listen(SERVER_PORT, () => {
    console.log(`PVMS {Socket Server} listening on PORT : ${SERVER_PORT}...`);
  });

  apiServer.listen(API_PORT, () => {
    console.log(`PVMS {API Server} listening on PORT : ${API_PORT}...`);
  });

  return true;
}

startServer();
