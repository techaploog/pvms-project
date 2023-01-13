require("dotenv").config();

const { Command } = require("commander");

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

const program = new Command();
program
.option("-r, --reset <boolean>", "start server and receive all message",false)
.option("-a, --allowance <number>", "number of records of RESET mode","100");

const args = program.parse().opts();

async function startServer() {
  console.log("- - - - - - - - -");

  await startDatabaseServer();
  await setCleaningInterval(30);

  // init socket listener state
  if (args.reset){
    console.log(`[INIT] "Reset Mode" : receive all message for ${args.allowance} messages.`)
  }
  await initListenerState(args.reset,Number(args.allowance));

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
