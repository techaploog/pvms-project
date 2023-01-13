require('dotenv').config();

const {getLastALCTracking,extractData} = require('./models/client.model');
// const {makeCalculation} = require('./controller/client.controller');

const seqDiff = (input,trim) => {
    try{

        let lastSeq = Number(input);
        let trimSeq = Number(trim);
    
        if (lastSeq < trimSeq){
            lastSeq = 1000 + lastSeq;
        }
        return lastSeq - trimSeq;

    }catch (err){
        return undefined;
    }
}

const test = async () => {
    let trackData = await getLastALCTracking();
    let scrapData = await extractData();

    // console.log("Received Data")
    // console.log(trackData);
    // console.log(scrapData);
    // console.log("--------------");

    // let scDataDate = new Date(scrapData[0][2]);
    // console.log(scDataDate);

    // let tcDataDate = new Date(trackData.data?.serverTime);
    // console.log(tcDataDate);
    let lastSeq = trackData ? trackData.data.bcSeq : undefined;
    let trimSeq = scrapData[0][1].slice(2);

    const msg = `[DATA] ALC-SEQ:${lastSeq}, TRIM-SEQ:${trimSeq} T-A:${lastSeq !== undefined ? seqDiff(lastSeq,trimSeq):undefined}`
    console.log(msg);
}

console.log("[TEST] START client.test.js");
test();
setInterval( async () => {
    await test();
}, 30000);


// console.log(seqDiff('801','800'),1);
// console.log(seqDiff('999','980'),19);
// console.log(seqDiff('000','980'),20);
// console.log(seqDiff('001','999'),2);
// console.log(seqDiff('010','001'),9)
