import mongoose from "mongoose";
import  {dburl}  from './config.js';

const conectBD = async() =>{
    try{
        if (!dburl) {
            throw new Error("MongoDB URL is missing. Set MONGO_URL (or mongo_url) in .env");
        }
        await mongoose.connect(dburl);
    }catch(error) {
        console.log(`error ${error.message}`);
        if (error.message.includes("querySrv ECONNREFUSED")) {
            console.log(
                "SRV DNS lookup failed. If your network blocks SRV records, use a standard mongodb:// URI instead of mongodb+srv://"
            );
        }

        process.exit(1);

    }
}
export default conectBD;
