const { dbInsert, dbLatestRow } = require("./database/db.model");
const { getTrackPoint, getJSON } = require('./utilities/server.utilities');

async function pvmsInsertData (idx,message){
    const nowStr = new Date().toISOString().split('T')[0].replace(/-/g,'');
    const dataIndex = `${nowStr}${String(idx).padStart(4,0)}`;
    const trackPoint = getTrackPoint(message);
    const result = await dbInsert(dataIndex,trackPoint,message);
    return result;
}

async function pvmsTrackingStatus(trackPoing){
    const lastRow = await dbLatestRow(trackPoing);

    if (lastRow){
        const {serialNo,bcSeq} = getJSON(lastRow.rawData);
        if (serialNo && bcSeq){
            return {
                serialNo: Number(serialNo),
                bcSeq: Number(bcSeq),
            }
        }
    }
    
    return {
        serialNo:undefined,
        bcSeq:undefined
    };
    
}

module.exports = {
    pvmsInsertData,
    pvmsTrackingStatus,
}