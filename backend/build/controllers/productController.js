"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const warehouseAPI_1 = __importDefault(require("../API/warehouseAPI"));
const router = (0, express_1.Router)();
router.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("--------------------------------");
    console.log("\nSTART GET categories");
    res.json(warehouseAPI_1.default.getCategories());
    console.log("--------------------------------");
}));
router.get('/manufacturers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("--------------------------------");
    console.log("\nSTART GET manufacturers");
    const manufacturers = yield warehouseAPI_1.default.getManufacturers(req.query.category);
    manufacturers ? res.json(manufacturers) : res.status(500).json([]);
    console.log("--------------------------------");
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("--------------------------------");
    console.log("\nSTART GET products: ", req.query);
    const products = yield warehouseAPI_1.default.getProducts(req.query.category, req.query.manufacturer, Number(req.query.page) - 1, Number(req.query.pageItemCount), req.query.filter);
    console.log("Products received: ", products === null || products === void 0 ? void 0 : products.length);
    products ? res.json(products) : res.status(500).json([]);
    console.log("--------------------------------");
}));
exports.default = router;
