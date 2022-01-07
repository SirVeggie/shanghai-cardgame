import axios from 'axios'
import { IProduct } from '../../../general_types'

const baseURL = '/api/'

// Used to cancel API call retries if another API call is requested
let apiRetryID = 0

const pageItemCount = 100

const getCategories = async (): Promise<string[]> => {
  const categories = await getAPIResponse<string[]>(apiPath(["products", "categories"]))
  return categories ? categories : []
}
const getManufacturers = async (category: string): Promise<string[]> => {
  const manufacturers = await getAPIResponse<string[]>(apiPath(["products", "manufacturers"]), 6, { category })
  return manufacturers ? manufacturers : []
}
const getProducts = async (category: string, manufacturer: string, page: number, filter: string): Promise<IProduct[]> => {
  const params = {
    category,
    page,
    filter,
    manufacturer,
    pageItemCount
  }
  const products = await getAPIResponse<IProduct[]>(apiPath(["products"]), 6, params)
  return products ? products : []
}

const getAPIResponse = async <T>(path: string, retries = 6, params: any = {}): Promise<T | null> => {
  const retryID = ++apiRetryID
  for (let i = 0; i < retries; i++) {
    if (retryID !== apiRetryID) {
      break
    }
    try {
      const response = await axios.get(path, { params })
      if (response.status != 200) {
        throw "Invalid response status received: " + response.status
      }
      return response.data as T
    } catch (e) {
      console.log("Error fetching JSON from API: ", e.message, e)
    }
  }
  return null
}

const apiPath = (path: string[]) => {
  return baseURL + path.join("/")
}

export default {
  getCategories,
  getManufacturers,
  getProducts,
  pageItemCount
}