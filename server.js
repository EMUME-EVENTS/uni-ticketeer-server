require('dotenv').config();

const express = require('express');
const fileupload = require('express-fileupload');
const cors = require('cors');
const indexRoute = require('./routes/index');
const usersRoute = require('./routes/users');
const eventsRoute = require('./routes/events');
const ticketsRoute = require('./routes/tickets');
const cartRoute = require('./routes/cart');
const dashboardAnalyticsRoute = require('./routes/dashboardAnalytics');
const webhooksRoute = require("./routes/webhooks")
const adminRoute = require('./routes/admin')
const { connectDB } = require('./db/db');
const morgan = require('morgan');
const logger = require('./logger');

const app = express();

app.use(cors("*"));
app.use(morgan('combined'));
app.use(fileupload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB(process.env.MONGO_LOCAL || process.env.MONGO_DEV);

const apiVersion = '/api/v1';

const routes = [
    ['/', indexRoute],
    ['/users', usersRoute],
    ['/events', eventsRoute],
    ['/tickets', ticketsRoute],
    ['/cart', cartRoute],
    ['/dashboard-analytics', dashboardAnalyticsRoute],
    ['/webhooks', webhooksRoute],
    ['/admin', adminRoute]
];

// Register all routes with api version
routes.forEach(([path, router]) => {
    app.use(`${apiVersion}${path}`, router);
});

app.listen(5000, ()=>{
    logger.info('App running on port 5000');
});