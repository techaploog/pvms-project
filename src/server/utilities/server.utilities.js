const {RECEIVING_CODE,REPLY_CODE} = require('./server.constant');

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

module.exports= {
    checkMsgLenght,
    getVehicelType,
}