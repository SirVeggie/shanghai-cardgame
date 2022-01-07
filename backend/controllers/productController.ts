import { Router } from 'express'
import warehouseAPI from '../API/warehouseAPI'
const router = Router()

router.get('/categories', async (req, res) => {
    console.log("--------------------------------")
    console.log("\nSTART GET categories")
    res.json(warehouseAPI.getCategories())
    console.log("--------------------------------")
})

router.get('/manufacturers', async (req, res) => {
    console.log("--------------------------------")
    console.log("\nSTART GET manufacturers")
    const manufacturers = await warehouseAPI.getManufacturers(req.query.category as string)
    manufacturers ? res.json(manufacturers) : res.status(500).json([])
    console.log("--------------------------------")
})

router.get('/', async (req, res) => {
    console.log("--------------------------------")
    console.log("\nSTART GET products: ", req.query)
    const products = await warehouseAPI.getProducts(
        req.query.category as string,
        req.query.manufacturer as string,
        Number(req.query.page) - 1,
        Number(req.query.pageItemCount),
        req.query.filter as string)

    console.log("Products received: ", products?.length)

    products ? res.json(products) : res.status(500).json([])
    console.log("--------------------------------")
})

export default router;