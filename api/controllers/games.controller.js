const callbackify = require('util').callbackify;
const constants = require('../../constants');
const CompanyModel = require('../data/models/companies.model').companyModel;
const ObjectId = require('mongoose').Types.ObjectId;

const setResponse = function(response, status, message, data=undefined){
    response.status = status;
    response.message = message;
    response.data = data;
};

const findByCompanyIdCallback = callbackify(function(companyId){
    return CompanyModel.findById(companyId).select('games').exec();
});

const getAll = function(req, res){
    const response = {
        status: constants.statusCode200,
        message: constants.gamesRetrievedMessage,
        data:undefined
    };

    const companyId = req.params.companyId;
    if(!companyId || !ObjectId.isValid(companyId)){
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        res.status(response.status).json({message:response.message});
    }else{
        findByCompanyIdCallback(companyId, function(err, data){
            if(err){
                console.log(err);
                setResponse(response, constants.statusCode500, err);
            }else if(!data){
                setResponse(response, constants.statusCode404, constants.companyNotFoundMessage);
            }else{
                setResponse(response, constants.statusCode200, constants.gamesRetrievedMessage, data.games);
            }
            res.status(response.status).json({message:response.message, data:response.data});
        });
    }
};

const getOne = function(req, res){
    const response = {
        status: constants.statusCode200,
        message: constants.gamesRetrievedMessage,
        data:undefined
    };

    const companyId = req.params.companyId;
    const gameId = req.params.gameId;
    if(!companyId || !ObjectId.isValid(companyId)){
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        res.status(response.status).json({message:response.message});
    }else if(!gameId || !ObjectId.isValid(gameId)){
        setResponse(response, constants.statusCode400, constants.invalidGameIdMessage);
        res.status(response.status).json({message:response.message});
    }else{
        findByCompanyIdCallback(companyId, function(err, data){
            if(err){
                console.log(err);
                setResponse(response, constants.statusCode500, err);
            }else if(!data){
                setResponse(response, constants.statusCode404, constants.companyNotFoundMessage);
            }else{
                const game = data.games.id(gameId);
                if(!game){
                    setResponse(response, constants.statusCode404, constants.gameNotFoundMessage);
                }else{
                    setResponse(response, constants.statusCode200, constants.gameRetrievedMessage, game);
                }
            }
            res.status(response.status).json({message:response.message, data:response.data});
        });
    }
};

module.exports={
    getAll,
    getOne
};