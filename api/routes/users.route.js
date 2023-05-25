const usersController = require('../controllers/users.controller');
const router = require('express').Router();

router.route(process.env.USERS_ROUTE)
.post(usersController.register);

router.route(process.env.LOGIN_ROUTE)
.post(usersController.login);

module.exports = router;