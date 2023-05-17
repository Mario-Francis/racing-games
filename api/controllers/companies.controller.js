const callbackify = require('util').callbackify;
const constants = require('../../constants');
const CompanyModel = require('../data/models/companies.model').companyModel;
const ObjectId = require('mongoose').Types.ObjectId;

const findAllWithCallback = callbackify(function (offset, count) {
    return CompanyModel.find({}).skip(offset).limit(count).exec();
});

const findOneWithCallback = callbackify(function (companyId) {
    return CompanyModel.findById(new ObjectId(companyId)).exec();
});

const validateCompanyWithCallback = callbackify(function (comapny) {
    return comapny.validate();
});

const saveCompanyWithCallback = callbackify(function (company) {
    return CompanyModel.create(company);
});

const updateCompanyWithCallback = callbackify(function (id, company) {
    return CompanyModel.findByIdAndUpdate(new ObjectId(id), company).exec();
});

const deleteCompanyWithCallback = callbackify(function (id) {
    return CompanyModel.findByIdAndDelete(new ObjectId(id)).exec();
});


const setResponse = function (response, status, message, data=undefined) {
    response.status = status;
    response.message = message;
    response.data=data;
};


const getAll = function (req, res) {
    const response = {
        status: constants.statusCode200,
        message: constants.companiesRetrievedMessage,
        data:undefined
    };

    let offset = constants.zero;
    let count = constants.defaultResultCount;

    if (req.query) {
        if (req.query.offset && !isNaN(parseInt(req.query.offset))) {
            offset = parseInt(req.query.offset);
        }

        if (req.query.count && !isNaN(parseInt(req.query.count))) {
            count = parseInt(req.query.count);
        }
    }

    if (offset < constants.zero) {
        setResponse(response, constants.statusCode400, constants.invalidOffsetMessage);
    } else if (count > constants.maxResultCount || count == constants.zero) {
        setResponse(response, constants.statusCode400, constants.invalidCountMessage);
    } else {
        if (response.status != constants.statusCode200) {
            res.status(response.status).json({ message: response.message });
        } else {
            const findAllCallback = function (error, data) {
                setResponse(response, constants.statusCode200, constants.companiesRetrievedMessage, data);
                if (error) {
                    console.log(error);
                    setResponse(response, constants.statusCode500, error);
                }
                res.status(response.status).json({ message: response.message, data: response.data });
            };
            findAllWithCallback(offset, count, findAllCallback);
        }

    }

};

const getOne = function (req, res) {
    const response = {
        status: constants.statusCode200,
        message: constants.companyRetrievedMessage,
        data:undefined
    };

    let companyId = req.params.companyId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
    } else {
        const findOneCallback = function (error, data) {
            if (error) {
                console.log(error);
                setResponse(response, constants.statusCode500, error);
            } else {
                if (data) {
                    setResponse(response, constants.statusCode200, constants.companyRetrievedMessage, data);
                } else {
                    setResponse(response, constants.statusCode404, constants.companyNotFoundMessage);
                }
            }
            res.status(response.status).json({ message: response.message, data: response.data });
        };
        findOneWithCallback(companyId, findOneCallback);
    }
};

const create = function (req, res) {
    const response = {
        status: constants.statusCode200,
        message: constants.companyRetrievedMessage
    };
    let body = req.body;

    let company = new CompanyModel(body);
    const saveCompanyCallback = function (error2, data) {
        setResponse(response, constants.statusCode200, constants.companyCreatedMessage);
        if (error2) {
            console.log(error2);
            setResponse(response, constants.statusCode500, error2);
        } 
        res.status(response.status).json({ message: response.message, data: response.data });
    };
    const validateCompanyCallback = function (error, data) {
        if (error) {
            console.log(error);
            res.status(constants.statusCode400)
                .json({ message: error.message });
        } else {
            saveCompanyWithCallback(body, saveCompanyCallback);
        }
    };
    validateCompanyWithCallback(company, validateCompanyCallback);
};


const updateOneHelper = function (req, res, validateCompany, callback) {
    const response = {
        status: constants.statusCode200,
        message: constants.companyUpdatedMessage
    };

    let companyId = req.params.companyId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
    } else {
        let body = req.body;
        let company = new CompanyModel(body);
        const updateCompanyCallback = function (error2, data) {
            if (error2) {
                console.log(error2);
                setResponse(response, constants.statusCode500, constants.error2);
            } else {
                if (data) {
                    setResponse(response, constants.statusCode200, constants.companyUpdatedMessage);
                } else {
                    setResponse(response, constants.statusCode404, constants.companyNotFoundMessage);
                }
            }
            callback(response);
        };

        const validateCompanyCallback = function (error, data) {
            if (error) {
                console.log(error);
                setResponse(response, constants.statusCode400, error.message);
                callback(response);
            } else {
                updateCompanyWithCallback(companyId, body, updateCompanyCallback);
            }
        };

        if (validateCompany) {
            validateCompanyWithCallback(company, validateCompanyCallback);
        } else {
            updateCompanyWithCallback(companyId, body, updateCompanyCallback);
        }
    }


}

const fullUpdateOne = function (req, res) {
    const updateCallback = function (response) {
        res.status(response.status).json({ message: response.message });
    };
    updateOneHelper(req, res, true, updateCallback);
};

const partialUpdateOne = function (req, res) {
    const updateCallback = function (response) {
        res.status(response.status).json({ message: response.message });
    };
    updateOneHelper(req, res, false, updateCallback);
}

const deleteOne = function (req, res) {
    const response = {
        status: constants.statusCode200,
        message: constants.companyRetrievedMessage
    };

    let companyId = req.params.companyId;
    if (!companyId || !ObjectId.isValid(companyId)) {
        setResponse(response, constants.statusCode400, constants.invalidCompanyIdMessage);
    } else {
        const deleteCompanyCallback = function (error, data) {
            setResponse(response, constants.statusCode200, constants.companyDeletedMessage);
            if (error) {
                console.log(error);
                setResponse(response, constants.statusCode500, error);
            } else if(!data){
                setResponse(response, constants.statusCode404, constants.companyNotFoundMessage);
            }
            res.status(response.status).json({ message: response.message});
        };
        deleteCompanyWithCallback(companyId, deleteCompanyCallback);
    }
};

module.exports = {
    getAll: getAll,
    getOne: getOne,
    createOne: create,
    updateOne: fullUpdateOne,
    patchOne: partialUpdateOne,
    deleteOne: deleteOne
};