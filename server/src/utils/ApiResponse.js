class ApiResponse {
    constructor(statusCode, data, message = "Success") { // Fix typo: statucsCode -> statusCode
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}

export default ApiResponse; 