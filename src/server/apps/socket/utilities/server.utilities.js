const {RECEIVING_CODE} = require('./server.constant');

function checkMsgLenght (message) {
    try {
        const stdLength = Number(message.slice(17,22));
        const dataLength = message.slice(26).length;
        return stdLength === dataLength ;
    } catch (err) {
        console.log(`[ERROR] checkMsgLenght: ${err}`);
        return false;
    }
}

function getVehicelType (message) {
    const typeCode = message.slice(22,24);
    return {
        code: typeCode,
        msg: RECEIVING_CODE[typeCode] 
    }
}


function getTrackPoint(message) {
    try{
        const trackPoint = message.slice(26,29);
        return trackPoint;
    } catch (err) {
        return undefined;
    }
}


function getJSON(message){
    try{
        const data = {
            destName : message.slice(0,6),
            procName : message.slice(6,12),
            serialNo : message.slice(12,16),
            mode : message.slice(16,17),
            length : message.slice(17,22),
            type : message.slice(22,24),
            result : message.slice(24,26),
            line: message.slice(26,27),
            trackPoint: message.slice(27,29),
            bcSeq: message.slice(29,32),
            bodyNo: message.slice(32,37),
            data: message.slice(37)
        };
        return data;

    } catch (err) {
        console.log(err);
        return undefined;
    }
}

module.exports= {
    getJSON,
    getTrackPoint,
    checkMsgLenght,
    getVehicelType,
}