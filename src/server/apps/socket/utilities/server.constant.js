const RECEIVING_CODE = {
    "00" : "normal",
    "01" : "normal-restriction",
    "0E" : "normal-emptyHanger",
    "10" : "reCreate",
    "11" : "reCreate-restriction",
    "12" : "reCreate-testPrint",
    "1E" : "reCreate-emptyHanger",
    "S0" : "cancel",
    "S1" : "shiftChange",
    "D0" : "directInput",
    "L0" : "log",
    "C0" : "reservation",
    "C1" : "alarm",
    "T0" : "terminalUp",
};

const REPLY_CODE = {
    "00" : "normal",
    "13" : "dataError",
    "14" : "dataFullError",
    "75" : "serialError",
    "76" : "lengthError",
    "90" : "vehicleSeqError",
    "91" : "vehicleDataLengthError",
}


const SERVER_MODE = {
    STD : "SERVER_MODE_STD",
    PVMS : "SERVER_MODE_PVMS"
}


module.exports = {
    SERVER_MODE,
    RECEIVING_CODE,
    REPLY_CODE,
}