import mongoose from "mongoose"


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.URL}/stormshelf`);
        console.log(`\n COnnected to DB host :${connectionInstance.connection.host}`);

    }
    catch(err) {
        console.log("error connecitng DB");
        process.exit(1);

    }
}
export default connectDB