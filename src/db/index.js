import mongoose from "mongoose"


const connectDB = async () => {
    try {
        console.log(`${process.env.URL}`)
        const connectionInstance = await mongoose.connect(`${process.env.URL}/stormshelf`);
        console.log(`\n COnnected to DB host :${connectionInstance.connection.host}`);

    }
    catch (err) {
        console.log("error connecitng DB");
        process.exit(1);

    }
}
export default connectDB