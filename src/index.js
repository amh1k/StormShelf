import dotenv from "dotenv"
import { app } from "./app.js";
import connectDB from "./db/index.js";
//import express from "express"
dotenv.config();
//const app = express();

const PORT= process.env.PORT || 9000
connectDB().then(() => {
    app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`)
})


})

// app.get("/", (req, res) => {
//     console.log("abc")
//     return res.status(200).json({ status: "ok" });
    
// })


