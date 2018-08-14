class HTTPException extends Error {
  constructor(code, message) {
    super(message);
    this.status = code;
    this.error = message;
  }
}

module.exports = HTTPException;
