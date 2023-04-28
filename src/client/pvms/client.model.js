const fs = require('fs');
const axios = require("axios");
const cheerio = require("cheerio");

const SCRAPING_URL = process.env.PVMS_CLIENT_SRC_URL;
const PVMS_WBS_URL = process.env.PVMS_WBS_URL;

const API_PORT = process.env.PVMS_API_PORT;
const TRACK_POINT = "1L0";
const API_URL = `/api/points/latest/${TRACK_POINT}`;

const state = {
  lastestID: undefined,
};

async function extractTrimSeq() {
  const { data } = await axios.get(SCRAPING_URL);
  const $ = cheerio.load(data);
  const tmp = [...$("font[size=2]")];
  const resultList = [];

  // transform into 2D array
  while (tmp.length > 0) {
    resultList.push([...tmp.splice(0, 3)].map((el) => $(el).text()));
  }

  return resultList;
}

async function getLastInputSeq() {
  let isNew = false;
  try {
    const { data } = await axios.get(`http://localhost:${API_PORT}${API_URL}`);

    if (data) {
      if (state.lastestID !== data.id) {
        state.lastestID = data.id;
        isNew = true;
      }

      return {
        data,
        isNew,
      };
    }
  } catch (error) {
    const msg =
      error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message;
    return { error: msg };
  }

  return {
    data: undefined,
    isNew,
  }; 
}

async function extractWBS() {
  let wbsValue = undefined;

  wbsValue = await new Promise((resolve,rejects)=> {
    fs.ReadStream(PVMS_WBS_URL)
      .on('data', async (data) => {
        resolve(data);
      })
      .on('error', (err) => {
        console.log(err);
        resolve(undefined);
        // rejects(err);
      })      
  });

  if (wbsValue) {
    wbsValue = String(wbsValue,"utf-8").split("=").slice(-1);
  }

  return wbsValue;

};

module.exports = {
  extractWBS,
  extractTrimSeq,
  getLastInputSeq,
};
