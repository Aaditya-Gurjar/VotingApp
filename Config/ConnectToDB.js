const mongoose = require('mongoose')
const ConnectToDb = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected to : ", conn.connection.host);
    } catch (error) {
        console.log("Error Occured in Database Connection : ", error);
    }
}
module.exports = ConnectToDb;