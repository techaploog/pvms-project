const path = require('path');

const {dbTrackPoints,dbLatestRow} = require(path.join(__basedir,'database','db.model.js'));
const {getJSON} = require(path.join(__basedir,'apps','socket','utilities','server.utilities.js'));

async function httpGetTrackPoints(req,res){
    const queryData = await dbTrackPoints();
    return res.status(200).json(queryData);
}

async function httpGetLastest(req,res) {
    const tp = req.params.tp;
    const queryRow = await dbLatestRow(tp);

    if (queryRow){
        const msgData = getJSON(queryRow.rawData);
    
        const repData = {
            id: queryRow.id,
            serverTime: queryRow.serverTime,
            trackPoint: queryRow.trackPoint,
            bodyNo: msgData.bodyNo,
            bcSeq:msgData.bcSeq
        }
    
        return res.status(200).json(repData);

    }else {
        return res.status(400).json({details:`No data for ${tp}`})
    }

}

module.exports = {
    httpGetTrackPoints,
    httpGetLastest,
}