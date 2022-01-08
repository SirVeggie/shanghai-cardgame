import React, { useState } from 'react'
import { Dropdown, Input, Button, Pagination, Message, Icon } from 'semantic-ui-react'
import { capitalize } from '../utils/capitalize'

type SideBarProps = {
  currentCategory: string,
  categories: string[],
  selectCategory: (category: string) => void,
  currentManufacturer: string,
  manufacturers: string[],
  selectManufacturer: (manufacturer: string) => void,
  updateFilter: (filter: string) => void,
  page: number,
  pageCount: number,
  selectPage: (page: number) => void,
  loadingMessage: string,
}

type DDownProps = {
  placeholder: string,
  value: string,
  onChange: (value: string) => void,
  options: string[]
}

const SideBar: React.FC<SideBarProps> = (props: SideBarProps) => {

  const [filter, setFilter] = useState("")

  return <div>
    <DDown placeholder="Select category"
      value={props.currentCategory}
      onChange={props.selectCategory}
      options={props.categories} />
    <DDown placeholder="Select manufacturer"
      value={props.currentManufacturer}
      onChange={props.selectManufacturer}
      options={props.manufacturers} />
      &nbsp;
      {props.currentCategory == "" || props.currentManufacturer == "" ? "" : <div>
      <Input icon='search'
        style={{ width: "272px" }}
        onChange={(e, data) => setFilter(data.value as string)}>
        <input />
        <Button type='submit' onClick={() => props.updateFilter(filter)}>Search</Button>
      </Input>
      &nbsp;
      {props.pageCount > 0 ? <Pagination
        style={{ width: "272px" }}
        boundaryRange={0}
        ellipsisItem={null}
        firstItem={null}
        lastItem={null}
        siblingRange={1}
        totalPages={props.pageCount}
        activePage={props.page}
        onPageChange={(e, data) => props.selectPage(Number(data.activePage))}
      /> : ""}
    </div>}

    &nbsp;
      {props.loadingMessage.length == 0 ? "" : <Message icon>
      <Icon name='circle notched' loading />
      <Message.Content>{props.loadingMessage}</Message.Content>
    </Message>}
  </div>
}

const DDown: React.FC<DDownProps> = (props: DDownProps) => <Dropdown
  placeholder={props.placeholder}
  fluid
  selection
  value={props.value}
  onChange={(event, data) => props.onChange(data.value as string)}
  options={props.options.map(o => {
    return {
      key: o,
      text: capitalize(o),
      value: o
    }
  })}
/>

export default SideBar