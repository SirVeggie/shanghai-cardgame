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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../utils/index");
var xml2json_1 = __importDefault(require("xml2json"));
var cron_1 = require("cron");
/*  If true, the backend will periodically download everything from the "bad api" and cache it in memory.
    Huge speedup and a viable solution when the amount of data is relatively small like now. */
var cacheAll = process.env.CACHE_ALL === "true";
var cacheUpdateMinutes = 10;
var cachedObjectLifetime = 300;
var baseURL = "https://bad-api-assignment.reaktor.com/v2";
var cache = {
    products: {},
    availability: {},
    productUpdateTimes: {},
    availabilityUpdateTimes: {}
};
var categories = ["gloves", "facemasks", "beanies"];
//#region updating
var updateProducts = function (category) { return __awaiter(void 0, void 0, void 0, function () {
    var path, products, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Update products: ", category);
                if (cache.products[category]
                    && cache.products[category].length > 0
                    && index_1.getSeconds() - cache.productUpdateTimes[category] < cachedObjectLifetime) {
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                path = baseURL + "/products/" + category;
                return [4 /*yield*/, index_1.getJsonResponse(path)];
            case 2:
                products = _a.sent();
                products = products.map(function (p) {
                    p.availability = "";
                    return p;
                }).sort(function (a, b) { return a.name.localeCompare(b.name); });
                saveProducts(category, products);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.log("Error updating products: ", error_1.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var updateAvailability = function (manufacturer) { return __awaiter(void 0, void 0, void 0, function () {
    var path, data, availability, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Update availability: ", manufacturer);
                if (cache.availabilityUpdateTimes[manufacturer] && index_1.getSeconds() - cache.availabilityUpdateTimes[manufacturer] < cachedObjectLifetime) {
                    console.log("Not updated");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                path = baseURL + "/availability/" + manufacturer;
                return [4 /*yield*/, index_1.getJsonResponse(path)];
            case 2:
                data = _a.sent();
                availability = data.response.map(function (p) {
                    var productAvailability = {
                        id: p.id,
                        availability: getAvailabilityFromXml(p.DATAPAYLOAD)
                    };
                    return productAvailability;
                });
                saveAvailability(manufacturer, availability);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.log("Error updating availability: ", error_2.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var safeTimeout = 250;
var updateAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allProducts, promises, _i, categories_1, cat, _a, categories_2, cat, manufacturers, _b, manufacturers_1, man;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("Starting to update cache...");
                allProducts = [];
                promises = [];
                _i = 0, categories_1 = categories;
                _c.label = 1;
            case 1:
                if (!(_i < categories_1.length)) return [3 /*break*/, 4];
                cat = categories_1[_i];
                promises.push(updateProducts(cat));
                return [4 /*yield*/, index_1.delay(safeTimeout)];
            case 2:
                _c.sent();
                _c.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                console.log("Avaiting product data...");
                return [4 /*yield*/, Promise.all(promises)];
            case 5:
                _c.sent();
                for (_a = 0, categories_2 = categories; _a < categories_2.length; _a++) {
                    cat = categories_2[_a];
                    allProducts = allProducts.concat(cache.products[cat]);
                }
                manufacturers = getUniqueManufacturers(allProducts);
                promises = [];
                _b = 0, manufacturers_1 = manufacturers;
                _c.label = 6;
            case 6:
                if (!(_b < manufacturers_1.length)) return [3 /*break*/, 9];
                man = manufacturers_1[_b];
                console.log("Update man: ", man);
                promises.push(updateAvailability(man));
                return [4 /*yield*/, index_1.delay(safeTimeout)];
            case 7:
                _c.sent();
                _c.label = 8;
            case 8:
                _b++;
                return [3 /*break*/, 6];
            case 9:
                console.log("Avaiting availability data...");
                return [4 /*yield*/, Promise.all(promises)];
            case 10:
                _c.sent();
                console.log("Updated cache...");
                return [2 /*return*/];
        }
    });
}); };
var getAvailabilityFromXml = function (s) {
    var data = JSON.parse(xml2json_1.default.toJson(s));
    return data["AVAILABILITY"]["INSTOCKVALUE"];
};
var getUniqueManufacturers = function (products) {
    return Array.from(new Set(products.map(function (p) { return p.manufacturer; }))).sort();
};
//#endregion
//#region saving
var saveProducts = function (category, products) {
    console.log("Save products");
    cache.products[category] = products;
    cache.productUpdateTimes[category] = index_1.getSeconds();
};
var saveAvailability = function (manufacturer, availabilityArray) {
    console.log("Save availability");
    availabilityArray.forEach(function (a) {
        cache.availability[a.id.toLowerCase()] = a.availability;
    });
    cache.availabilityUpdateTimes[manufacturer] = index_1.getSeconds();
};
//#endregion
//#region API
var getCategories = function () {
    return categories;
};
var getManufacturers = function (category) { return __awaiter(void 0, void 0, void 0, function () {
    var products;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Getting manufacturers...");
                if (!!cacheAll) return [3 /*break*/, 2];
                return [4 /*yield*/, updateProducts(category)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                products = cache.products[category];
                if (!products) {
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, getUniqueManufacturers(products)];
        }
    });
}); };
var getProducts = function (category, manufacturer, page, pageItemCount, filter) {
    if (page === void 0) { page = 0; }
    if (pageItemCount === void 0) { pageItemCount = 20; }
    if (filter === void 0) { filter = ""; }
    return __awaiter(void 0, void 0, void 0, function () {
        var offset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    offset = page * pageItemCount;
                    console.log("Getting products: cat=" + category + " man=" + manufacturer + " page=" + page + " filter=" + filter);
                    if (!!cacheAll) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateProducts(category)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, updateAvailability(manufacturer)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: 
                // leave out await for instant return
                return [2 /*return*/, cache.products[category].filter(function (p) {
                        return manufacturer == p.manufacturer && p.name.toLocaleLowerCase().includes(filter.toLowerCase());
                    }).slice(offset, offset + pageItemCount).map(function (p) {
                        var _a;
                        p.availability = (_a = cache.availability) === null || _a === void 0 ? void 0 : _a[p.id];
                        return p;
                    })];
            }
        });
    });
};
//#endregion
if (cacheAll) {
    updateAll();
    var updateJob = new cron_1.CronJob("0 */" + cacheUpdateMinutes + " * * * *", updateAll);
    updateJob.start();
}
exports.default = {
    getManufacturers: getManufacturers,
    getProducts: getProducts,
    getCategories: getCategories,
};
