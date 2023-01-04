const { pvmsInsertData, pvmsTrackingStatus } = require("./pvms.model");
const { getTrackPoint, getJSON } = require("./utilities/server.utilities");

const TRACK_POINTS = process.env.PVMS_SERV_TP_LIST.split(',');

let serverState = {};

async function initListenerState(){
    for (i=0;i<TRACK_POINTS?.length;i++){
        let tp = TRACK_POINTS[i];
        let resp = await pvmsTrackingStatus(tp);
        serverState[tp] = resp;
    }

    console.log(`[INIT]\tServer State`)
    Object.keys(serverState).map((tp)=>{
        console.log(`\t- ${tp} :`,serverState[tp]);
    })
}

module.exports = {
    initListenerState,
}



