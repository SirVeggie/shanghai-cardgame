import { IProduct } from '../../../general_types'
import { Item, List } from 'semantic-ui-react'

type ProductProps = {
  product: IProduct
}

type ProductListProps = {
  products: IProduct[],
  clickHandler: (product: IProduct) => void
}

type ProductListItemProps = {
  product: IProduct,
  clickHandler: () => void
}


export const ProductInfo : React.FC<ProductProps> = ({ product }: ProductProps) => <Item>
  <Item.Content>
    <Item.Header>{product.name}</Item.Header>
    <Item.Description>
      Availability: {product.availability}
    </Item.Description>
    <Item.Description>
      Price: {product.price}
    </Item.Description>
    <Item.Description>
      Manufacturer: {product.manufacturer}
    </Item.Description>
    <Item.Description>
      Color: {product.color.join(", ")}
    </Item.Description>
    <Item.Description>
      Type: {product.type}
    </Item.Description>
    <Item.Description>
      ID: {product.id}
    </Item.Description>
  </Item.Content>
</Item>

export const ProductList: React.FC<ProductListProps> = ({ products, clickHandler }: ProductListProps) => <List divided>
  {products.map(p => {
    return <List.Item key={p.id} onClick={() => clickHandler(p)}>
      <List.Content>
        <List.Header as='a'>{p.name}</List.Header>
        <List.Description>Availability: {p.availability}</List.Description>
        <List.Description>Price: {p.price}</List.Description>
      </List.Content>
    </List.Item>
  })}
</List>

export const ProductListItem: React.FC<ProductListItemProps> = ({ product, clickHandler }: ProductListItemProps) => <List.Item key={product.id} onClick={clickHandler}>
  <List.Content>
    <List.Header as='a'>{product.name}</List.Header>
    {product.availability == "" ? "" : <List.Description>Availability: {product.availability}</List.Description>}

    <List.Description>Price: {product.price}</List.Description>
  </List.Content>
</List.Item>