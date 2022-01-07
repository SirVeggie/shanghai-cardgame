import { getJsonResponse, getSeconds, delay } from '../utils/index'
import parser from 'xml2json'
import { IProduct, IAvailability } from '../../general_types'
import { CronJob } from 'cron'

interface IProductCache {
    // Map<category, list of products>
    products: { [name: string]: Array<IProduct> },
    availability: { [name: string]: string },
    productUpdateTimes: { [name: string]: number },
    availabilityUpdateTimes: { [name: string]: number }
}
interface IAvailabilityResponse {
    response: IRawAvailability[]
}
type IRawAvailability = {
    id: string,
    DATAPAYLOAD: string
}

/*  If true, the backend will periodically download everything from the "bad api" and cache it in memory. 
    Huge speedup and a viable solution when the amount of data is relatively small like now. */
const cacheAll = process.env.CACHE_ALL === "true"

const cacheUpdateMinutes = 5
const cachedObjectLifetime = 300

const baseURL = "https://bad-api-assignment.reaktor.com/v2"

const cache: IProductCache = {
    products: {},
    availability: {},
    productUpdateTimes: {},
    availabilityUpdateTimes: {}
}

const categories = ["gloves", "facemasks", "beanies"]

//#region updating
const updateProducts = async (category: string) => {

    console.log("Update products: ", category)

    if (cache.products[category]
        && cache.products[category].length > 0
        && getSeconds() - cache.productUpdateTimes[category] < cachedObjectLifetime) {
        return
    }
    try {
        const path = baseURL + "/products/" + category
        let products = await getJsonResponse<IProduct[]>(path)
        products = products.map(p => {
            p.availability = ""
            return p
        }).sort((a, b) => a.name.localeCompare(b.name))
        saveProducts(category, products)
    } catch (error) {
        console.log("Error updating products: ", error.message)
    }
}

const updateAvailability = async (manufacturer: string) => {

    console.log("Update availability: ", manufacturer)

    if (cache.availabilityUpdateTimes[manufacturer] && getSeconds() - cache.availabilityUpdateTimes[manufacturer] < cachedObjectLifetime) {
        console.log("Not updated")
        return
    }

    try {
        const path = baseURL + "/availability/" + manufacturer
        let data = await getJsonResponse<IAvailabilityResponse>(path)
        const availability = data.response.map((p: { id: any; DATAPAYLOAD: string; }) => {
            const productAvailability: IAvailability = {
                id: p.id,
                availability: getAvailabilityFromXml(p.DATAPAYLOAD)
            }
            return productAvailability
        })

        saveAvailability(manufacturer, availability)
    } catch (error) {
        console.log("Error updating availability: ", error.message)
    }
}

const safeTimeout = 250
const updateAll = async () => {

    console.log("Starting to update cache...")

    let allProducts: IProduct[] = []
    let promises: Promise<void>[] = []

    for (const cat of categories) {
        promises.push(updateProducts(cat))
        await delay(safeTimeout)
    }

    console.log("Avaiting product data...")
    await Promise.all(promises)
    for (const cat of categories) {
        allProducts = allProducts.concat(cache.products[cat])
    }
    const manufacturers = getUniqueManufacturers(allProducts)
    promises = []
    for (const man of manufacturers) {
        console.log("Update man: ", man)
        promises.push(updateAvailability(man))
        await delay(safeTimeout)
    }

    console.log("Avaiting availability data...")
    await Promise.all(promises)
    console.log("Updated cache...")
}

const getAvailabilityFromXml = (s: string): string => {
    const data = JSON.parse(parser.toJson(s))
    return data["AVAILABILITY"]["INSTOCKVALUE"]
}

const getUniqueManufacturers = (products: IProduct[]) => {
    return Array.from(new Set(products.map(p => p.manufacturer))).sort()
}
//#endregion

//#region saving
const saveProducts = (category: string, products: IProduct[]) => {
    console.log("Save products")
    cache.products[category] = products
    cache.productUpdateTimes[category] = getSeconds()
}
const saveAvailability = (manufacturer: string, availabilityArray: IAvailability[]) => {
    console.log("Save availability")
    availabilityArray.forEach(a => {
        cache.availability[a.id.toLowerCase()] = a.availability
    });
    cache.availabilityUpdateTimes[manufacturer] = getSeconds()
}


//#endregion


//#region API
const getCategories = () => {
    return categories
}

const getManufacturers = async (category: string): Promise<string[] | null> => {

    console.log("Getting manufacturers...")

    if (!cacheAll) {
        await updateProducts(category)
    }

    const products = cache.products[category]
    if (!products) {
        return []
    }
    return getUniqueManufacturers(products)
}

const getProducts = async (category: string, manufacturer: string, page = 0, pageItemCount = 20, filter = ""): Promise<IProduct[] | null> => {

    const offset = page*pageItemCount

    console.log(`Getting products: cat=${category} man=${manufacturer} page=${page} filter=${filter}`)

    if (!cacheAll) {
        await updateProducts(category)
        await updateAvailability(manufacturer)
    }

    // leave out await for instant return

    return cache.products[category].filter(p => {
        return manufacturer == p.manufacturer && p.name.toLocaleLowerCase().includes(filter.toLowerCase())
    }).slice(offset, offset + pageItemCount).map(p => {
        p.availability = cache.availability?.[p.id]
        return p
    })
}
//#endregion

if (cacheAll) {
    updateAll()
    var updateJob = new CronJob(`0 */${cacheUpdateMinutes} * * * *`, updateAll)
    updateJob.start()
}

export default {
    getManufacturers,
    getProducts,
    getCategories,
}