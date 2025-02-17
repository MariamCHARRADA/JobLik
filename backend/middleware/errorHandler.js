const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.status(statusCode).json({
        success: false,
        title: "Validation Failed",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    case constants.UNAUTHORIZED:
      res.status(statusCode).json({
        success: false,
        title: "Unauthorized",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    case constants.FORBIDDEN:
      res.status(statusCode).json({
        success: false,
        title: "Forbidden",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    case constants.NOT_FOUND:
      res.status(statusCode).json({
        success: false,
        title: "Not Found",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    case constants.SERVER_ERROR:
      res.status(statusCode).json({
        success: false,
        title: "Server Error",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    default:
      console.error("Unhandled Error:", err);
      res.status(500).json({
        success: false,
        title: "Internal Server Error",
        message: "Something went wrong!",
        stackTrace: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;
  }
};

module.exports = errorHandler;