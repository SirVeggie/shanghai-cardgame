import React, { useEffect } from 'react';
import { Container, Grid, Rail, Segment, Message } from 'semantic-ui-react'
import productApi from '../services/productApi'
import { IProduct } from '../../../general_types'
import { ProductInfo, ProductList } from './product'
import SideBar from './sidebar'
import { stat } from 'fs';

interface IViewState {
  loadingMessage: string
  selectedProduct: IProduct | null
}

interface IProductState {
  categories: string[] | null
  manufacturers: string[]
}

interface IProductSelection {
  category: string
  manufacturer: string
  page: number
  filter: string
}

interface IProductSelectionArgs {
  category?: string
  manufacturer?: string
  page?: number
  filter?: string
}

const Listing: React.FC = () => {

  const [view, setView] = React.useState<IViewState>({
    loadingMessage: "",
    selectedProduct: null
  })
  const [productData, setProductData] = React.useState<IProductState>({
    categories: null,
    manufacturers: [],
  })
  const [selection, setSelection] = React.useState<IProductSelection>({
    category: "",
    manufacturer: "",
    page: 1,
    filter: ""
  })
  const [products, setProducts] = React.useState<IProduct[]>([])

  useEffect(() => {
    if (!productData.categories) {
      loadCategories()
    }
  })

  //#region utilities
  const loadCategories = async () => {
    const categories = await productApi.getCategories()
    setProductData({ ...productData, categories })
  }

  const selectPage = (page: number) => {
    console.log("Select page: ", page)
    updateProducts({ page, filter: selection.filter })
  }

  const updateFilter = (filter: string) => {
    updateProducts({ page: 1, filter })
  }

  const getCurrentPageCount = () => {
    return 10000
  }

  const selectManufacturer = async (manufacturer: string) => {
    console.log("Enabled manufacturer: ", manufacturer)
    updateProducts({ manufacturer })
  }

  const selectCategory = async (category: string) => {
    setSelection({ ...selection, category })
    setView({ ...view, loadingMessage: "Loading manufacturers..." })
    console.log("Enabled category: ", category)

    const manufacturers = await productApi.getManufacturers(category)
    setProductData({ ...productData, manufacturers })
    console.log("Set manufacturers: ", manufacturers)

    if (manufacturers.length == 0) {
      window.alert("There seems to be an error accessing the API. Please try again.")
      return
    }

    updateProducts({ category, manufacturer: selection.manufacturer == "" ? manufacturers[0] : selection.manufacturer })
  }

  const updateProducts = async ({ category = selection.category, manufacturer = selection.manufacturer, page = 1, filter = "" }: IProductSelectionArgs) => {
    console.log("Update products with page: ", page)
    setView({ ...view, loadingMessage: "Loading products..." })
    setProducts([])
    const products = await productApi.getProducts(category, manufacturer, page, filter)
    setProducts(products)
    setSelection({ ...selection, category, manufacturer, page, filter })
    setView({ ...view, loadingMessage: "" })
  }

  const selectProduct = async (selectedProduct: IProduct) => {
    console.log("Selected product: ", selectedProduct)
    setView({ ...view, selectedProduct })
  }
  //#endregion

  return (
    <div>
      <Container>
        <Grid centered columns={3}>
          <Grid.Column>
            <Segment>
              <ProductList products={products} clickHandler={selectProduct} />

              <Rail position="left">
                <SideBar
                  currentCategory={selection.category}
                  categories={productData.categories ? productData.categories : []}
                  selectCategory={selectCategory}
                  currentManufacturer={selection.manufacturer}
                  manufacturers={productData.manufacturers}
                  selectManufacturer={selectManufacturer}
                  updateFilter={updateFilter}
                  page={selection.page}
                  pageCount={getCurrentPageCount()}
                  selectPage={selectPage}
                  loadingMessage={view.loadingMessage}
                />
              </Rail>

              <Rail position="right">
                {view.selectedProduct ? <ProductInfo product={view.selectedProduct} />
                  : <Message><Message.Content>Select a product for more information</Message.Content></Message>}
              </Rail>

            </Segment>
          </Grid.Column>
        </Grid>
      </Container>
    </div>
  )
}

export default Listing