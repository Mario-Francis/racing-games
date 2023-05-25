const UserModel = require('../data/models/users.model').userModel;
const jwt = require('jsonwebtoken');
const constants = require('../../constants');
const promisify = require('util').promisify;


const verifyTokenWithPromise = promisify(jwt.verify);
const sendResponse = function (res, response) {
    res.status(response.status).json({ message: response.message });
};
const setResponse = function (response, status, message) {
    response.status = status;
    response.message = message;
};

const checkIfTokenExpired = function (payload, response) {
    const expiryDate = payload.exp * constants.oneThousand;
    const today = (new Date()).getTime();

    return new Promise((resolve, reject) => {
        if (expiryDate > today) {
            resolve(payload);
        } else {
            setResponse(response, constants.statusCode401, constants.tokenExpiredMessage);
            reject(response);
        }
    });
}

const checkIfUserExist = function (user, response) {
    return new Promise((resolve, reject) => {
        if (user) {
            resolve(user);
        } else {
            setResponse(response, constants.statusCode401, constants.tokenExpiredMessage);
            reject(response);
        }
    });
}

const persistAuthenticatedUserData = function (res, user) {
    res.locals.user = user;
}

const authenticate = function (req, res, next) {
    const response = {
        status: constants.statusCode401,
        message: constants.unauthorizedMessage
    };

    if (!req.headers.authorization) {
        sendResponse(res, response);
    } else {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            sendResponse(res, response);
        } else {
            verifyTokenWithPromise(token, process.env.TOKEN_SECRET)
                .then((payload) => checkIfTokenExpired(payload, response))
                .then((payload) => UserModel.findOne({ username: payload.username }).exec())
                .then((user) => checkIfUserExist(user, response))
                .then((user) => persistAuthenticatedUserData(res, user))
                .then(() => next())
                .catch((error) => sendResponse(res, response))
                .finally();
        }
    }
}

module.exports = {
    authenticate
}