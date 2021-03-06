import Axios from 'axios';
import express from 'express';
import { userInfoModel, userInfoSchema } from './userInfoSchema.js';

const routes = express.Router();
const weatherApiKey = '3442bc148b46b294a5ce5abf9240896d';

/**
 * @swagger
 * /api:
 *   get:
 *     summary: get hello
 *     description: get hello
 *     responses:
 *       '200':
 *         description: a successful response
 */
routes.get('/', (req, res) => {
    res.send("Hello");
});

/**
 * @swagger
 * /api/weather/{city}:
 *   get:
 *     summary: get weather
 *     description: get weather
 *     parameters:
 *       - name: city
 *         in: path
 *         required: true
 *     responses:
 *       '200':
 *         description: a successful response
 */
routes.get('/weather/:city?', (req, res) => {
    console.log("at weather");
    if (req.params.city === undefined || req.params.city === '') {
        res.status(500).send("missing city");
        return;
    }

    const city = req.params.city;
    const openWeatherUrl = `http://api.openweathermap.org/data/2.5/weather?` +
        `q=${city}&appid=${weatherApiKey}&units=imperial`;
    Axios.get(openWeatherUrl).then((axiosRes) => {
        res.send(axiosRes.data);
    }).catch((error) => {
        console.error("weather url error" + error.stack);
        res.status(500).send("weather url error" + error.message);
    })
});

/**
 * @swagger
 * /api/getUsers:
 *   get:
 *     summary: get all users
 *     description: get all users
 *     responses:
 *       '200':
 *         description: a successful response
 */
routes.get('/getUsers', (req, res) => {
    userInfoModel.find({}).then((data) => {
        res.send(data);
    }).catch((error) => {
        console.error(error.stack);
        res.status(500).send(error.message);
    })
});

/**
 * @swagger
 * /api/saveUser:
 *   post:
 *     summary: get all user info
 *     description: get all information from database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 descirption: user
 *                 type: string
 *               city:
 *                 descirption: city the user stays at
 *                 type: string
 *     responses:
 *       '201':
 *         description: user saved
 */
routes.post('/saveUser', (req, res) => {
    console.log("at save user: " + req.body);

    if (req.body === undefined || req.body === '') {
        console.error("missing data");
        res.status(500).send("missing data");
        return;
    }

    userInfoSchema.validateAsync(req.body).then((validBody) => {
        console.log(validBody);
        validBody.timestamp = new Date();

        const newUser = new userInfoModel(validBody);
        newUser.save().then((data) => {
            console.log("saved data: " + data);
            res.status(201).send(data);
        }).catch((error) => {
            console.error("save data error: " + error.stack);
            res.status(500).send("save data error: " + error.message);
        })
    }).catch((error) => {
        console.error("invalide data: " + error.stack);
        res.status(500).send("invalide data: " + error.message);
    });
});

export default routes;