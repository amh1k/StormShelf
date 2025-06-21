import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express();


app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

// common middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


//import routes
import healthCheckRouter from "./routes/healthcheck.route.js"
import userRouter from "./routes/user.route.js"
import bookRouter from "./routes/book.route.js"
import favouritesRouter from "./routes/favourites.route.js"
import reviewsRouter from "./routes/reviews.route.js"


app.use("/api/v1/healthcheck", healthCheckRouter)


//User route
app.use("/api/v1/user", userRouter);

//book route
app.use("/api/v1/books", bookRouter)

//favourites route
app.use("/api/v1/favourites", favouritesRouter)

//review route
app.use("/api/v1/reviews", reviewsRouter)

export { app }