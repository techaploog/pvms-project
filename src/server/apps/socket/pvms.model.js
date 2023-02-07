const { dbInsert, dbLatestRow } = require("../../database/db.model");
const { getJSON } = require("./utilities/server.utilities");

async function pvmsInsertData(idx, message) {
  // const nowStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const nowStr = String(Number(new Date()));
  const dataIndex = `${nowStr}${String(idx).padStart(4, 0)}`;

  const {type,line,trackPoint,bcSeq,bodyNo} = getJSON(message);
  const TP = line + trackPoint;

  const result = await dbInsert(dataIndex,type,TP,bcSeq,bodyNo, message);

  return result;
}

async function pvmsTrackingStatus(trackPoing = undefined) {
  const lastRow = await dbLatestRow(trackPoing);

  if (lastRow) {
    const { serialNo, bcSeq } = getJSON(lastRow.rawData);
    if (serialNo && bcSeq) {
      return {
        serialNo: Number(serialNo),
        bcSeq: Number(bcSeq),
      };
    }
  }

  return {
    serialNo: undefined,
    bcSeq: undefined,
  };
}

module.exports = {
  pvmsInsertData,
  pvmsTrackingStatus,
};
