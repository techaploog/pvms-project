require("dotenv").config();

const { Command } = require("commander");

global.__basedir = __dirname;

const {
  startDatabaseServer,
  setCleaningInterval,
} = require("./database/db.controller");
const { initListenerState } = require("./apps/socket/pvms.controller");
const { SERVER_MODE } = require("./apps/socket/utilities/server.constant");

const socketServer = require("./apps/socket/pvms.server");
const apiServer = require("./apps/http/api.server");

const SERVER_PORT = Number(process.env.PVMS_SERV_PORT);
const API_PORT = Number(process.env.PVMS_API_PORT);

const program = new Command();
program
  .option("-p, --pvmsMode <boolean>", "Skip validation for 1 sequence", false);

const args = program.parse().opts();

async function startServer() {
  console.log("- - - - - - - - -");

  await startDatabaseServer();
  await setCleaningInterval(30);

  // init socket listener state
  if (args.pvmsMode) {
    await initListenerState(SERVER_MODE.PVMS);
  } else {
    await initListenerState();
  }

  console.log(`\n- - - - - - - - -`);
  socketServer.listen(SERVER_PORT, () => {
    console.log(`PVMS { Socket Server } listening on PORT : ${String(SERVER_PORT).padEnd(5," ")}...`);
  });

  apiServer.listen(API_PORT, () => {
    console.log(`PVMS {   API Server  } listening on PORT : ${String(API_PORT).padEnd(5," ")}...`);
  });

  return true;
}

startServer();
