const responseCodes = {
  200: {
    status: "Success",
    message: "Request completed successfully",
  },
  201: {
    status: "Created",
    message: "Resource created successfully",
  },
  400: {
    status: "Bad Request",
    message: "Invalid request payload or parameters",
  },
  401: {
    status: "Unauthorized",
    message: "Authentication required or token missing/invalid",
  },
  403: {
    status: "Forbidden",
    message: "You are not allowed to access this resource",
  },
  404: {
    status: "Not Found",
    message: "Requested resource not found",
  },
  409: {
    status: "Conflict",
    message: "Resource already exists or conflict occurred",
  },
  429: {
    status: "Too Many Requests",
    message: "Rate limit exceeded. Try again later",
  },
  500: {
    status: "Internal Server Error",
    message: "Something went wrong on the server",
  },
  503: {
    status: "Service Unavailable",
    message: "Server is currently unavailable",
  },
};

module.exports = responseCodes;