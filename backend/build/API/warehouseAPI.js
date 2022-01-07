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
const index_1 = require("../utils/index");
const xml2json_1 = __importDefault(require("xml2json"));
const cron_1 = require("cron");
/*  If true, the backend will periodically download everything from the "bad api" and cache it in memory.
    Huge speedup and a viable solution when the amount of data is relatively small like now. */
const cacheAll = process.env.CACHE_ALL === "true";
const cacheUpdateMinutes = 5;
const cachedObjectLifetime = 300;
const baseURL = "https://bad-api-assignment.reaktor.com/v2";
const cache = {
    products: {},
    availability: {},
    productUpdateTimes: {},
    availabilityUpdateTimes: {}
};
const categories = ["gloves", "facemasks", "beanies"];
//#region updating
const updateProducts = (category) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Update products: ", category);
    if (cache.products[category]
        && cache.products[category].length > 0
        && (0, index_1.getSeconds)() - cache.productUpdateTimes[category] < cachedObjectLifetime) {
        return;
    }
    try {
        const path = baseURL + "/products/" + category;
        let products = yield (0, index_1.getJsonResponse)(path);
        products = products.map(p => {
            p.availability = "";
            return p;
        }).sort((a, b) => a.name.localeCompare(b.name));
        saveProducts(category, products);
    }
    catch (error) {
        console.log("Error updating products: ", error.message);
    }
});
const updateAvailability = (manufacturer) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Update availability: ", manufacturer);
    if (cache.availabilityUpdateTimes[manufacturer] && (0, index_1.getSeconds)() - cache.availabilityUpdateTimes[manufacturer] < cachedObjectLifetime) {
        console.log("Not updated");
        return;
    }
    try {
        const path = baseURL + "/availability/" + manufacturer;
        let data = yield (0, index_1.getJsonResponse)(path);
        const availability = data.response.map((p) => {
            const productAvailability = {
                id: p.id,
                availability: getAvailabilityFromXml(p.DATAPAYLOAD)
            };
            return productAvailability;
        });
        saveAvailability(manufacturer, availability);
    }
    catch (error) {
        console.log("Error updating availability: ", error.message);
    }
});
const safeTimeout = 250;
const updateAll = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Starting to update cache...");
    let allProducts = [];
    let promises = [];
    for (const cat of categories) {
        promises.push(updateProducts(cat));
        yield (0, index_1.delay)(safeTimeout);
    }
    console.log("Avaiting product data...");
    yield Promise.all(promises);
    for (const cat of categories) {
        allProducts = allProducts.concat(cache.products[cat]);
    }
    const manufacturers = getUniqueManufacturers(allProducts);
    promises = [];
    for (const man of manufacturers) {
        console.log("Update man: ", man);
        promises.push(updateAvailability(man));
        yield (0, index_1.delay)(safeTimeout);
    }
    console.log("Avaiting availability data...");
    yield Promise.all(promises);
    console.log("Updated cache...");
});
const getAvailabilityFromXml = (s) => {
    const data = JSON.parse(xml2json_1.default.toJson(s));
    return data["AVAILABILITY"]["INSTOCKVALUE"];
};
const getUniqueManufacturers = (products) => {
    return Array.from(new Set(products.map(p => p.manufacturer))).sort();
};
//#endregion
//#region saving
const saveProducts = (category, products) => {
    console.log("Save products");
    cache.products[category] = products;
    cache.productUpdateTimes[category] = (0, index_1.getSeconds)();
};
const saveAvailability = (manufacturer, availabilityArray) => {
    console.log("Save availability");
    availabilityArray.forEach(a => {
        cache.availability[a.id.toLowerCase()] = a.availability;
    });
    cache.availabilityUpdateTimes[manufacturer] = (0, index_1.getSeconds)();
};
//#endregion
//#region API
const getCategories = () => {
    return categories;
};
const getManufacturers = (category) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Getting manufacturers...");
    if (!cacheAll) {
        yield updateProducts(category);
    }
    const products = cache.products[category];
    if (!products) {
        return [];
    }
    return getUniqueManufacturers(products);
});
const getProducts = (category, manufacturer, page = 0, pageItemCount = 20, filter = "") => __awaiter(void 0, void 0, void 0, function* () {
    const offset = page * pageItemCount;
    console.log(`Getting products: cat=${category} man=${manufacturer} page=${page} filter=${filter}`);
    if (!cacheAll) {
        yield updateProducts(category);
        yield updateAvailability(manufacturer);
    }
    // leave out await for instant return
    return cache.products[category].filter(p => {
        return manufacturer == p.manufacturer && p.name.toLocaleLowerCase().includes(filter.toLowerCase());
    }).slice(offset, offset + pageItemCount).map(p => {
        var _a;
        p.availability = (_a = cache.availability) === null || _a === void 0 ? void 0 : _a[p.id];
        return p;
    });
});
//#endregion
if (cacheAll) {
    updateAll();
    var updateJob = new cron_1.CronJob(`0 */${cacheUpdateMinutes} * * * *`, updateAll);
    updateJob.start();
}
exports.default = {
    getManufacturers,
    getProducts,
    getCategories,
};
