const companiesController = require('../controllers/companies.controller');
const gamesController = require('../controllers/games.controller');
const router = require('express').Router();
const authenticationController = require('../controllers/authentication.controller');


router.route(process.env.COMPANIES_ROUTE)
    .get(companiesController.getAll)
    .post(authenticationController.authenticate, companiesController.createOne);

router.route(process.env.SINGLE_COMPANY_ROUTE)
    .get(companiesController.getOne)
    .put(authenticationController.authenticate, companiesController.updateOne)
    .patch(authenticationController.authenticate, companiesController.patchOne)
    .delete(authenticationController.authenticate, companiesController.deleteOne);

router.route(process.env.COMPANY_GAMES_ROUTE)
    .get(gamesController.getAll)
    .post(authenticationController.authenticate, gamesController.createOne);

router.route(process.env.COMPANY_GAME_ROUTE)
    .get(gamesController.getOne)
    .put(authenticationController.authenticate, gamesController.updateOne)
    .patch(authenticationController.authenticate, gamesController.patchOne)
    .delete(authenticationController.authenticate, gamesController.deleteOne);

module.exports = router;