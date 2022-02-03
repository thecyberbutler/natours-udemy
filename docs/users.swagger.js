exports.signUp = {
    tags: ["Users"],
    description: "Create new Account",
    operationId: "users/signup",
    requestBody: {
        description: "The user to create",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["name", "email", "password", "passwordConfirm"],
                    properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        password: { type: "string" },
                        passwordConfirm: { type: "string" },
                    },
                },
            },
        },
    },
    responses: {
        201: {
            description: "New Account Created",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            token: { type: "string" },
                            data: {
                                $ref: "#/components/schemas/User",
                            },
                        },
                    },
                },
            },
        },
    },
};

exports.login = {
    tags: ["Users"],
    description: "Logs the user in",
    operationId: "users/login",
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string" },
                        password: { type: "string" },
                    },
                },
            },
        },
    },
    responses: {
        200: {
            description: "Valid credentials provided, here is your token",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            token: { type: "string" },
                            data: {
                                $ref: "#/components/schemas/User",
                            },
                        },
                    },
                },
            },
        },
        401: {
            description: "Authentication failed",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
    },
};

exports.forgotPassword = {
    tags: ["Users"],
    description: "Sends email to user who forgot password",
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: { type: "string" },
                    },
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
    },
};

exports.resetPassword = {
    tags: ["Users"],
    description: "Allows users to reset password after running forgotPassword",
    operationId: "users/:token",
    parameters: [
        {
            name: "token",
            in: "path",
        },
    ],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["password", "passwordConfirm"],
                    properties: {
                        password: { type: "string" },
                        passwordConfirm: { type: "string" },
                    },
                },
            },
        },
    },
    responses: {
        200: {
            description: "Valid credentials provided, here is your token",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            token: { type: "string" },
                            data: {
                                $ref: "#/components/schemas/User",
                            },
                        },
                    },
                },
            },
        },
    },
};

exports.updatePassword = {
    tags: ["Users"],
    description: "Updates the logged in users password",
    operationId: "updatePassword",
    security: [
        {
            bearerAuth: [],
        },
    ],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["email", "password", "passwordConfirm"],
                    properties: {
                        email: { type: "string" },
                        password: { type: "string" },
                        passwordConfirm: { type: "string" },
                    },
                },
            },
        },
    },
    responses: {
        200: {
            description: "Valid credentials provided, here is your token",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            token: { type: "string" },
                            data: {
                                $ref: "#/components/schemas/User",
                            },
                        },
                    },
                },
            },
        },
    },
};

exports.getAllUsers = {
    tags: ["Users"],
    description: "Gets all users",
    operationId: "users",
    security: [
        {
            bearerAuth: [],
        },
    ],
    parameters: [
        {
            name: "fields",
            in: "query",
        },
        {
            name: "limit",
            in: "query",
        },
        {
            name: "page",
            in: "query",
        },
        {
            name: "sort",
            in: "query",
        },
    ],
    responses: {
        200: {
            description: "A list of all users",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: {
                                type: "string",
                            },
                            data: {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/User",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

exports.User = {
    type: "object",
    properties: {
        _id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        photo: { type: "string" },
        role: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
};
