const path = require('path');

const {dbRunQuery} = require(path.join(__basedir,'database','db.model.js'));

async function httpGetAllData (req,res) {
    try{
        // select *
        const dataRow = await dbRunQuery("*");
        return res.status(200).json(dataRow);
    }catch (err) {
        console.log(err);
        return res.status(500).json({detail:"Cannot Query Data!"})
    }
}

module.exports = {
    httpGetAllData,
}