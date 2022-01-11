/* eslint-disable no-console */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception... Shutting down");
    console.error(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: "./.env" });

const app = require("./app");

const DB = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose
    .connect(DB, {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("DB Connected...");
    });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
    console.error(err.name, err.message);
    console.log("Unhandled Rejection... Shutting down");
    server.close(() => {
        process.exit(1);
    });
});
