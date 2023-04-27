function seqDiff(input, trim) {
  try {
    let lastSeq = Number(input);
    let trimSeq = Number(trim);

    if (isNaN(lastSeq) || isNaN(trimSeq) || lastSeq > 1000 || trimSeq > 1000){
      return undefined;
    }

    if (lastSeq < trimSeq) {
      lastSeq = 1000 + lastSeq;
    }

    return lastSeq - trimSeq;

  } catch (err) {
    console.log(err);
    return undefined;
  }
}

function createMsgStr(msgObj) {
  const {
    receiver,
    sender,
    serial,
    mode,
    msgLength,
    procType,
    procRes,
    noOfProc,
    shopCode,
    lineNo,
    procName,
    msg1,
    ta,
    msg2,
    wbs,
    msg3,
  } = msgObj;

  return `${receiver}${sender}${serial}${mode}${msgLength}${procType}${procRes}${noOfProc}${shopCode}${lineNo}${procName}${msg1}${ta}${msg2}${wbs}${msg3}`;
}

module.exports = {
  seqDiff,
  createMsgStr,
};
