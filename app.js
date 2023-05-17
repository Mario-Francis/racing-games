require('dotenv').config();
require('./api/data/db');
const express = require('express');
const router = require('./api/routes');

const app = express();

app.use(express.json());
app.use(process.env.API_ROUTE, router);

const listenHandler = function(){
    console.log(process.env.LISTEN_MESSAGE, server.address().port);
}
const server = app.listen(process.env.HOST_PORT, listenHandler);