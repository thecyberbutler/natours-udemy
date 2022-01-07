const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("../../models/tourModel");

dotenv.config({ path: "../../.env" });

const DB = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose
    .connect(DB, {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("DB Connected...");
    });

const tours = JSON.parse(fs.readFileSync("tours-simple.json", "utf-8"));

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data loaded");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Data deleted");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}

console.log(process.argv);
