const constants = require('../../constants');
const CompanyModel = require('../data/models/companies.model').companyModel;
const ObjectId = require('mongoose').Types.ObjectId;
const gameSchema = require('../data/models/games.model').gameSchema;


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

const checkIfCompanyExist = function (response, company) {
    return new Promise((resolve, reject) => {
        if (!company) {
            setResponse(response, constants.statusCode404, constants.companyNotFoundMessage);
            reject(response);
        } else {
            resolve(company);
        }
    });
}

const getGame = function (games, gameId) {
    return new Promise((resolve, reject) => {
        const game = games.id(gameId);
        resolve(game);
    });
}

const checkIfGameExist = function (response, game) {
    return new Promise((resolve, reject) => {
        if (!game) {
            setResponse(response, constants.statusCode404, constants.gameNotFoundMessage);
            reject(response);
        } else {
            resolve(game);
        }
    });
}

const checkIfGameExistById = function (response, company, gameId) {
    return new Promise((resolve, reject) => {
        const game = company.games.id(gameId);
        if (!game) {
            setResponse(response, constants.statusCode404, constants.gameNotFoundMessage);
            reject(response);
        } else {
            resolve(company);
        }
    });
}


const handleError = function (error, response) {
    console.log(error);
    if (!error.status) {
        if (error.message) {
            setResponse(response, constants.statusCode400, error.message);
        } else {
            setResponse(response, constants.statusCode500, error);
        }
    }
}

const getAll = function (req, res) {
    const response = createResponse();

    const companyId = req.params.companyId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        sendResponse(res, response);
    } else {
        CompanyModel.findById(companyId).select(constants.games).exec()
            .then((company) => checkIfCompanyExist(response, company))
            .then((company) => setResponse(response, constants.statusCode200, constants.gamesRetrievedMessage, company.games))
            .catch((error) => handleError(error, response))
            .finally(() => sendResponse(res, response));
    }
};

const getOne = function (req, res) {
    const response = createResponse();

    const companyId = req.params.companyId;
    const gameId = req.params.gameId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        sendResponse(res, response);
    } else if (!gameId || !ObjectId.isValid(gameId)) {
        setResponse(response, constants.statusCode400, constants.invalidGameIdMessage);
        sendResponse(res, response);
    } else {
        CompanyModel.findById(companyId).select(constants.games).exec()
            .then((company) => checkIfCompanyExist(response, company))
            .then((company) => checkIfGameExistById(response, company, gameId))
            .then((company) => getGame(company.games, gameId))
            // .then((game) => checkIfGameExist(response, game))
            .then((game) => setResponse(response, constants.statusCode200, constants.gameRetrievedMessage, game))
            .catch((error) => handleError(error, response))
            .finally(() => sendResponse(res, response));
    }
};

const addNewGame = function (company, game) {
    company.games.push(game);
    return company.save();
}
const createOne = function (req, res) {
    const response = createResponse();

    const companyId = req.params.companyId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        sendResponse(res, response);
    } else {
        CompanyModel.findById(companyId).select(constants.games).exec()
            .then((company) => checkIfCompanyExist(response, company))
            .then((company) => addNewGame(company, req.body))
            .then((game) => setResponse(response, constants.statusCode200, constants.gameCreatedMessage))
            .catch((error) => handleError(error, response))
            .finally(() => sendResponse(res, response));
    }
}

const updateGame = function (company, gameId, gameData, isPatch) {
    const game = company.games.id(gameId);
    if (!isPatch) {
        let data = {
            title:gameData.title ,
            yearReleased:gameData.yearReleased,
            platforms:gameData.platforms
        };
        game.set(data);
    } else {
        game.set(gameData);
    }
   
    return company.save();
}

const updateHelper = function (req, res, isPatch) {
    const response = createResponse();

    const companyId = req.params.companyId;
    const gameId = req.params.gameId;
    const body = req.body;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        sendResponse(res, response);
    } else if (!gameId || !ObjectId.isValid(gameId)) {
        setResponse(response, constants.statusCode400, constants.invalidGameIdMessage);
        sendResponse(res, response);
    } else {
        CompanyModel.findById(companyId).select(constants.games).exec()
            .then((company) => checkIfCompanyExist(response, company))
            .then((company) => checkIfGameExistById(response, company, gameId))
            .then((company) => updateGame(company, gameId, body, isPatch))
            .then((game) => setResponse(response, constants.statusCode200, constants.gameUpdatedMessage))
            .catch((error) => handleError(error, response))
            .finally(() => sendResponse(res, response));
    }
}

const updateOne = function (req, res) {
    updateHelper(req, res, false);
}

const patchOne = function (req, res) {
    updateHelper(req, res, true);
}

const deleteGame = function(company, gameId){
    company.games.id(gameId).deleteOne();

    return company.save();
}

const deleteOne = function (req, res) {
    const response = createResponse();

    const companyId = req.params.companyId;
    const gameId = req.params.gameId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        sendResponse(res, response);
    } else if (!gameId || !ObjectId.isValid(gameId)) {
        setResponse(response, constants.statusCode400, constants.invalidGameIdMessage);
        sendResponse(res, response);
    } else {
        CompanyModel.findById(companyId).select(constants.games).exec()
            .then((company) => checkIfCompanyExist(response, company))
            .then((company) => checkIfGameExistById(response, company, gameId))
            .then((company) => deleteGame(company, gameId))
            .then((game) => setResponse(response, constants.statusCode200, constants.gameDeletedMessage))
            .catch((error) => handleError(error, response))
            .finally(() => sendResponse(res, response));
    }
}

module.exports = {
    getAll,
    getOne,
    createOne,
    updateOne,
    patchOne,
    deleteOne
};