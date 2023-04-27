const path = require('path');

const {dbRunQuery} = require(path.join(__basedir,'database','db.model.js'));

async function httpGetAllData (req,res) {
    try{
        // select *
        const dataRow = await dbRunQuery("*");
        return res.status(200).json({data:dataRow});
    }catch (err) {
        console.log(err);
        return res.status(500).json({detail:"Cannot Query Data!"})
    }
}

// TODO: create controller function
async function httpGetSelectData (req,res) {
    try{
        // select 
        const condition = "ORDER BY serverTime DESC LIMIT 10";
        const dataRow = await dbRunQuery("*", condition);
        return res.status(200).json({data:dataRow});
    }catch (err) {
        console.log(err);
        return res.status(500).json({detail:"Cannot Query Data!"})
    }
}

module.exports = {
    httpGetAllData,
    httpGetSelectData,
}