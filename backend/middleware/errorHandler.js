const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.status && res.statusCode === 200) {
    statusCode = err.status;
  }

  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
  }

  if (err.code === 11000) {
    statusCode = 409;
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
  }

  logger.error(err.message, { stack: err.stack, statusCode });

  res.status(statusCode).json({
    message: err.message || "Server error",
  });
};

module.exports = {
  notFound,
  errorHandler,
};
