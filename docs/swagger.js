const {
    getAllUsers,
    signUp,
    login,
    User,
    forgotPassword,
    resetPassword,
} = require("./users.swagger");

module.exports = {
    openapi: "3.0.1",
    info: {
        version: "1.0.0",
        title: "NA Tours API",
        description: "",
        termsOfService: "",
        contact: {
            name: "Michael Butler",
            email: "michaelbutler75@gmail.com",
        },
        license: {
            name: "Apache 2.0",
            url: "https://www.apache.org/licenses/LICENSE-2.0.html",
        },
    },
    servers: [
        {
            url: "localhost:8000/api/v1",
            description: "Development Environment",
        },
    ],
    components: {
        schemas: { User },
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    paths: {
        "/users/signup": {
            post: signUp,
        },
        "/users/login": {
            post: login,
        },
        "/users/forgotPassword": {
            post: forgotPassword,
        },
        "/users/resetPassword/{token}": {
            post: resetPassword,
        },
        "/users": {
            get: getAllUsers,
        },
    },
};
