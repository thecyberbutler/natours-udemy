/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");

const port = process.env.PORT || 3000;

let mongoServer;
let server;

module.exports = (testDescription, testsCallBack) => {
    const clearDB = async () => {
        for (const i in mongoose.connection.collections) {
            mongoose.connection.collections[i].deleteMany(() => {});
        }
    };

    describe(testDescription, () => {
        before(async () => {
            //before stuff like setting up the app and mongoose server.
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            console.log(mongoUri);
            await mongoose.connect(mongoUri);
            // server = app.listen(port, () => {
            //     console.log(`Server listening on port ${port}...`);
            // });
        });

        beforeEach(async () => {
            //beforeEach stuff clearing out the db.
            await clearDB();
        });

        after(async () => {
            //after stuff like shutting down the app and mongoose server.
            server.close(() => {
                process.exit(0);
            });
            await mongoose.disconnect();
            await mongoServer.stop();
        });

        testsCallBack();
    });
};
