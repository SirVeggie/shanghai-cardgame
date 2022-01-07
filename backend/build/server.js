"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var morgan_1 = __importDefault(require("morgan"));
var productController_1 = __importDefault(require("./controllers/productController"));
var port = process.env.PORT || 3001;
var createServer = function () {
    var app = express_1.default();
    app.use(express_1.default.json());
    app.use(express_1.default.static('build'));
    app.use(cors_1.default());
    app.use(morgan_1.default('tiny'));
    app.use('/api/products/', productController_1.default);
    var server = http_1.default.createServer(app);
    server.listen(port, function () { return console.log("Server running on port " + port); });
};
exports.default = createServer;
