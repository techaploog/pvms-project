const axios = require('axios');
const cheerio = require('cheerio');

const url = process.env.PVMS_SRC_URL

// const fetchData = async () => {
//     const {data} = await axios.get(url);
//     return data;
// }

async function extractData () {
    const {data} = await axios.get(url);
    const $ = cheerio.load(data);
    const tmp = [...$("font[size=2]")];
    const resultList = [];

    // transform into 2D array
    while (tmp.length > 0){
        resultList.push([...tmp.splice(0,3)].map((el)=>$(el).text()));
    }
    
    return resultList;
}


module.exports = {extractData};