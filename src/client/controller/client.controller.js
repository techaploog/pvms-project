const axios = require('axios');

const {extractData, getLastALCTracking} = require('../models/client.model');

async function makeCalculation(){
    const trackData = await getLastALCTracking();

    // TODO:
    // if (!trackData?.isNew){
    //     return {
    //         success:false,
    //         numVeh:undefined
    //     }
    // }

    const scrapData = await extractData();

    // TODO:
    // calculate and return number here

    return {
        trackData,
        scraped:scrapData[0]
    };
}

module.exports = {
    makeCalculation,
}