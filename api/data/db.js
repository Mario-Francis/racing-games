const mongoose = require('mongoose');
const constants = require('../../constants');
require('./models/games.model');
require('./models/companies.model');

const callbackify = require('util').callbackify;

mongoose.connect(process.env.DB_CONN_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const dbConnectedHandler = function () {
    console.log(process.env.DB_CONNECTED_MESSAGE);
}

const dbFailedHandler = function (err) {
    console.log(process.env.DB_FAILED_MESSAGE, err);
}

const dbDisconnectedHandler = function () {
    console.log(process.env.DB_DISCONNECTED_MESSAGE);
}

mongoose.connection.on(process.env.DB_CONNECTED_EVENT, dbConnectedHandler);
mongoose.connection.on(process.env.DB_ERROR_EVENT, dbFailedHandler);
mongoose.connection.on(process.env.DB_DISCONNECTED_EVENT, dbDisconnectedHandler);


const intConnectionCloseHandler = function () {
    console.log(process.env.PROCESS_INT_MESSAGE);
    process.exit(constants.zero);
}

const termConnectionCloseHandler = function () {
    console.log(process.env.SIGTERM_MESSAGE);
        process.exit(constants.zero);
}
const resConnectionCloseHandler = function () {
    console.log(process.env.SIGUSR2_MESSAGE);
        process.kill(process.pid, process.env.PROCESS_RESTART_EVENT);
}
const processInterruptHandler = function () {
    callbackify(mongoose.connection.close)(intConnectionCloseHandler);
}
const processTerminateHandler = function () {
    callbackify(mongoose.connection.close)(termConnectionCloseHandler);
}
const processRestartHandler = function () {
    callbackify(mongoose.connection.close)(resConnectionCloseHandler);
}
process.on(process.env.PROCESS_INTERRUPT_EVENT, processInterruptHandler);
process.on(process.env.PROCESS_TERMINATE_EVENT, processTerminateHandler);
process.once(process.env.PROCESS_RESTART_EVENT, processRestartHandler);