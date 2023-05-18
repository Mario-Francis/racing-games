const constants = require('../../constants');
const CompanyModel = require('../data/models/companies.model').companyModel;
const ObjectId = require('mongoose').Types.ObjectId;


const setResponse = function (response, status, message, data = undefined) {
    response.status = status;
    response.message = message;
    response.data = data;
};

const sendResponse = function (res, response) {
    res.status(response.status)
        .json({ message: response.message, data: response.data });
}

const createResponse = function(status=constants.statusCode200, message=constants.companyRetrievedMessage){
    return {
        status: status,
        message: message
    };
}

const getAll = function (req, res) {
    const response = createResponse();

    let offset = constants.zero;
    let count = constants.defaultResultCount;

    if (req.query) {
        if (req.query.offset && !isNaN(parseInt(req.query.offset))) {
            offset = parseInt(req.query.offset);
            if (offset < constants.zero) {
                setResponse(response, constants.statusCode400, constants.invalidOffsetMessage);
            }
        }

        if (req.query.count && !isNaN(parseInt(req.query.count))) {
            count = parseInt(req.query.count);
            if (count > constants.maxResultCount || count == constants.zero) {
                setResponse(response, constants.statusCode400, constants.invalidCountMessage);
            }
        }
    }


    if (response.status != constants.statusCode200) {
        sendResponse(res, response);
    } else {
        CompanyModel.find({}).skip(offset).limit(count).exec()
            .then((games) => setResponse(response, constants.statusCode200, constants.companiesRetrievedMessage, games))
            .catch((error) => setResponse(response, constants.statusCode500, error))
            .finally(() => sendResponse(res, response));
    }
};

const checkIfCompanyExist = function(response, company){
    return new Promise((resolve, reject)=>{
        if(!company){
            setResponse(response, constants.statusCode404, constants.companyNotFoundMessage);
            reject(response);
        }else{
            resolve(company);
        }
    });
}

const handleError = function(error, response){
    if(!error.status){
        if(error.message){
            setResponse(response, constants.statusCode400, error.message);
        }else{
            setResponse(response, constants.statusCode500, error);
        }
    }
}

const getOne = function (req, res) {
    const response = createResponse();

    let companyId = req.params.companyId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        sendResponse(res, response);
    } else {
        CompanyModel.findById(new ObjectId(companyId)).exec()
        .then((company)=> checkIfCompanyExist(response, company))
        .then((company)=> setResponse(response, constants.statusCode200, constants.companyRetrievedMessage, company))
        .catch((error)=> handleError(error, response))
        .finally(()=> sendResponse(res, response));
    }
};

const createOne = function (req, res) {
    const response = createResponse();
    let body = req.body;

    let company = new CompanyModel(body);
    company.validate()
    .then(()=> CompanyModel.create(company))
    .then((data)=> setResponse(response, constants.statusCode200, constants.companyCreatedMessage))
    .catch((error)=> handleError(error, response))
    .finally(()=> sendResponse(res, response));
};

const checkValidateCompany = function(company, validate){
    return new Promise((resolve, reject)=>{
        if(validate){
            resolve(company.validate());
        }else{
            resolve();
        }
    });
};

const updateOneHelper = function (req, res, validateCompany) {
    const response = createResponse();

    let companyId = req.params.companyId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        sendResponse(res, response);
    } else {
        let body = req.body;
        let company = new CompanyModel(body);
        
        checkValidateCompany(company, validateCompany)
        .then(()=> CompanyModel.findByIdAndUpdate(new ObjectId(companyId), body).exec())
        .then((data)=> checkIfCompanyExist(response, data))
        .then(()=> setResponse(response, constants.statusCode200, constants.companyUpdatedMessage))
        .catch((error)=> handleError(error, response))
        .finally(()=> sendResponse(res, response));
    }
};

const fullUpdateOne = function (req, res) {
    updateOneHelper(req, res, true);
};

const partialUpdateOne = function (req, res) {
    updateOneHelper(req, res, false);
};

const deleteOne = function (req, res) {
    const response = createResponse();

    let companyId = req.params.companyId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
        sendResponse(res, response);
    } else {
        CompanyModel.findByIdAndDelete(new ObjectId(companyId)).exec()
        .then((company)=> checkIfCompanyExist(response, company))
        .then((company)=> setResponse(response, constants.statusCode200, constants.companyDeletedMessage))
        .catch((error)=> handleError(error, response))
        .finally(()=> sendResponse(res, response));
    }
};

module.exports = {
    getAll: getAll,
    getOne: getOne,
    createOne: createOne,
    updateOne: fullUpdateOne,
    patchOne: partialUpdateOne,
    deleteOne: deleteOne
};