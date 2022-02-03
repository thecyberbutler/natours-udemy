const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { expect } = require("chai");
const app = require("../app");

const port = process.env.PORT || 3000;

let mongoServer;
let server;

const clearDB = async () => {
    for (let i in mongoose.connection.collections) {
        mongoose.connection.collections[i].deleteMany(() => {});
    }
};

before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log(mongoUri);
    await mongoose.connect(mongoUri);
    server = app.listen(port, () => {
        console.log(`Server listening on port ${port}...`);
    });
});

beforeEach(async () => {
    await clearDB();
});

after(async () => {
    server.close(() => {
        process.exit(0);
    });
    await mongoose.disconnect();
    await mongoServer.stop();
});

// describe("...", () => {
//     it("...", async () => {
//         const User = mongoose.model(
//             "User",
//             new mongoose.Schema({ name: String })
//         );
//         const cnt = await User.count();
//         expect(cnt).to.equal(0);
//     });
// });
