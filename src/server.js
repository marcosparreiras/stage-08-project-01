require('express-async-errors');
require('dotenv/config');

const AppError = require('./utils/AppError');
const migrationsRun = require('./database/sqlite/migrations');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const uploadConfig = require('./config/upload');

const app = express();
migrationsRun();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER));

app.use((error, _req, res, _next) => {
    if (error instanceof AppError) {
        return res
            .status(error.statusCode)
            .json({ status: 'error', message: error.message });
    }
    console.log(error);
    return res
        .status(500)
        .json({ status: 'error', message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});
