const REPLY_CODE_DESC = {
  "00":"Normal",
  "RO":"Resend request",
  "10":"Computation error",
  "12":"Other error",
  "60":"No schedule file",
  "75":"Serial No. error",
  "76":"Length error"
}

function seqDiff(input, trim) {
  try {
    let lastSeq = Number(input);
    let trimSeq = Number(trim);

    if (isNaN(lastSeq) || isNaN(trimSeq) || lastSeq > 1000 || trimSeq > 1000) {
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
  const keyList = [
    "receiver",
    "sender",
    "serial",
    "mode",
    "msgLength",
    "procType",
    "procRes",
    "noOfProc",
    "shopCode",
    "lineNo",
    "procName",
    "msg1",
    "ta",
    "msg2",
    "wbs",
    "msg3",
  ];

  const objKeys = Object.keys(msgObj);
  if (!keyList.reduce((acc,val)=>acc && objKeys.includes(val),true)){
    return undefined;
  }

  const msgStr = keyList.reduce((acc,val)=>`${acc}${msgObj[val]}`,"");

  return msgStr;
}

function replyMsgToJSON (message) {

  const data = {
    receiverName:message.slice(0,6),
    senderName:message.slice(6,12),
    serialNo:message.slice(12,16),
    mode:message.slice(16,17),
    length:message.slice(17,22),
    procType:message.slice(22,24),
    replyCode:message.slice(24,26)
  }

  return ({
    ...data,
    replyDesc:REPLY_CODE_DESC[data.replyCode],
  });
}

module.exports = {
  seqDiff,
  createMsgStr,
  replyMsgToJSON,
};
