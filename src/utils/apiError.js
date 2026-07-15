"use strict";

/**
 * apiError.js
 * ----------------------------------------------------------------------------
 * Lightweight error class carrying an HTTP status code, so controllers can
 * throw domain errors from deep inside the service layer and have them
 * translated into the correct HTTP response without service code knowing
 * anything about Express.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, ApiError);
  }
}

module.exports = { ApiError };
