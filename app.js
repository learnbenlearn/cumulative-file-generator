const express = require('express');
const logger = require('morgan');

const { jobRoutes } = require('./routes');

let app = express();
app.use(express.json());
app.use(logger('dev'));

app.use('/job', jobRoutes);

app.listen(process.env.PORT, () => console.log('Server started.'));