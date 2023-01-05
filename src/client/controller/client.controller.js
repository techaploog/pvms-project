const axios = require('axios');

const {extractData} = require('../models/client.model');

async function makeCalculation(){
    const scrapDAta = await extractData();
    return {data:scrapDAta[0]};
}

module.exports = {
    makeCalculation,
}