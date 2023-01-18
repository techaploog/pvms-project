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

const SERVER_MODE_STD = "SERVER_MODE_STD";
const SERVER_MODE_RESET = "SERVER_MODE_RESET";
const SERVER_MODE_PVMS = "SERVER_MODE_PVMS";


module.exports = {
    SERVER_MODE_STD,
    SERVER_MODE_RESET,
    SERVER_MODE_PVMS,
    RECEIVING_CODE,
    REPLY_CODE,
}