const constants = require('../../constants');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const promisify = require('util').promisify;
const UserModel = require('../data/models/users.model').userModel;

const setResponse = function (response, status, message, data = undefined) {
    response.status = status;
    response.message = message;
    response.data = data;
};

const sendResponse = function (res, response) {
    res.status(response.status)
        .json({ message: response.message, data: response.data });
}

const createResponse = function (status = constants.statusCode200, message = constants.companyRetrievedMessage) {
    return {
        status: status,
        message: message
    };
}

const handleError = function (error, response) {
    if (!error.status) {
        if (error.message) {
            setResponse(response, constants.statusCode400, error.message);
        } else {
            setResponse(response, constants.statusCode500, error);
        }
    }
}

const generateSalt = function (user) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(parseInt(process.env.PASSWORD_HASH_SALT_ROUND))
            .then((salt) => resolve({ user: user, salt: salt }))
            .catch((error) => reject(error))
    });
}

const getUserWithHashedPassword = function (user, passwordHash) {
    user.password = passwordHash;
    return user;
};

const hashUserPassword = function (user, salt) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(user.password, salt)
            .then((passwordHash) => resolve(getUserWithHashedPassword(user, passwordHash)))
            .catch((error) => resolve(error));
    });
}


const createOne = function (req, res) {
    const response = createResponse();
    let body = req.body;

    let user = new UserModel(body);
    user.validate()
        .then(() => generateSalt(user))
        .then(({ user, salt }) => hashUserPassword(user, salt))
        .then((user) => UserModel.create(user))
        .then((user) => setResponse(response, constants.statusCode201, constants.userCreatedMessage))
        .catch((error) => handleError(error, response))
        .finally(() => sendResponse(res, response));
};

const checkIfUserExist = function (response, user) {
    return new Promise((resolve, reject) => {
        if (!user) {
            setResponse(response, constants.statusCode401, constants.invalidCredentialsMessage);
            reject(response);
        } else {
            resolve(user);
        }
    });
}

const checkIfPasswordMatch = function (user, password) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password)
            .then((isPasswordMatch) => resolve({user, isPasswordMatch}))
            .catch((error) => reject(error));
    });
};

const handlePasswordMatch = function(response, user, isPasswordMatch){
    return new Promise((resolve, reject)=>{
        if(!isPasswordMatch){
            setResponse(response, constants.statusCode401, constants.invalidCredentialsMessage);
            reject(response);
        }else{
            resolve(user);
        }
    });
}

const signTokenWithPromise = promisify(jwt.sign);

const generateToken = function(user){
    const payload = {
        name: user.name,
        username:user.username
    };
    return new Promise((resolve, reject)=>{
        signTokenWithPromise(payload, process.env.TOKEN_SECRET, {expiresIn:parseInt(process.env.TOKEN_EXPIRY_TIME)})
        .then((token)=> resolve({user,token}))
        .catch((error)=> reject(error));
    });
};

const login = function (req, res) {
    const response = createResponse();
    let username = req.body.username ?? '';
    let password = req.body.password ?? '';

    UserModel.findOne({ username: username })
        .then((user) => checkIfUserExist(response, user))
        .then((user)=> checkIfPasswordMatch(user, password))
        .then(({user, isPasswordMatch})=> handlePasswordMatch(response, user, isPasswordMatch))
        .then((user)=> generateToken(user))
        .then(({user, token})=> setResponse(response, constants.statusCode200, constants.loginSuccessMessage, {name:user.name, token:token}))
        .catch((error)=> handleError(error))
        .finally(()=> sendResponse(res, response));
};

module.exports = {
    register: createOne,
    login:login
};