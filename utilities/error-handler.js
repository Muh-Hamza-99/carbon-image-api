const AppError = require("./app-error");

const sendErrorDevelopment = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        error,
        message: error.message,
        stack: error.stack,
    });
};

const sendErrorProduction = (error, res) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({ 
            status: error.status, 
            message: error.message, 
        });
    } else {
        console.log(`Oh no, something went wrong! ${error}`);
        res.status(500).json({ status: "error", message: "Something went very wrong!" });
    };
};

const JOIValidationError = error => {
    console.log(error);
    return new AppError(error.details[0].message, 422);
};

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") sendErrorDevelopment(err, res);
    else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        if (error._original) error = JOIValidationError(error); 
        sendErrorProduction(error, res); 
    };
};

module.exports = globalErrorHandler;