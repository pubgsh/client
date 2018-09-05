import React, { PureComponent } from 'react'
import styled from 'styled-components'
import groupBy from 'lodash/groupBy'
import dict from '../../../assets/itemId.json'

const importAll = req => {
    return req.keys().reduce((prev, r) => {
        // Split by directory and then reverse to get the filename
        const [itemId] = r.split('/').reverse()

        // Remove the extension from the file name.
        const key = itemId.substr(0, itemId.length - 4)

        // Require the file and assign it to the itemId property
        return {
            ...prev,
            [key]: req(r),
        }
    }, {})
}

const images = importAll(require.context('../../../assets/item', true, /.png$/))

const LoadoutWrapper = styled.div`
    min-width: 150px;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: 400;
    padding: 4px;
    margin: 5px 0;
`

const CategoryHeader = styled.div`
    text-align: center;
    font-size: 1.1rem;
    font-weight: 400;
    margin-bottom: 5px;
`

const List = styled.div`
    display: grid;
    text-align: left;
`

const ListItem = styled.div`
    margin-bottom: 10px;
`

const SubListItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`

const ParentItem = styled.div`
    display: grid;
    grid-column-gap: 5px;
    grid-template-columns: 1fr 5fr;
    align-items: center;
`

const SubList = styled.div`
    text-align: left;
    margin-left: 13px;
`

const ItemIcon = styled.img`
    max-height: 25px;
    max-width: 25px;
    width: auto;
    height: auto;
    display: block;
    justify-self: center;
`

const NoItems = styled.span`
    font-size: 1.1rem;
    font-weight: 400;
`

const WEAPONS_CATEGORY = 'Weapon'
const EQUIPMENT_CATEGORY = 'Equipment'
const EQUIPMENT_REGEX = /_(\d\d)_/g

const getImageForEquipment = itemId => {
    const replacedItemId = itemId.replace(EQUIPMENT_REGEX, '_00_')
    return images[replacedItemId]
}

const ItemList = ({ category, items }) => {
    return (
        <div>
            <CategoryHeader>
                {category}
            </CategoryHeader>
            <List>
                {items && items.map((i, index) => {
                    const { itemId } = i
                    const imageSrc = category === EQUIPMENT_CATEGORY
                        ? getImageForEquipment(itemId)
                        : images[itemId]

                    const key = `${itemId}_${index}`

                    return (
                        <ListItem key={key}>
                            <ParentItem>
                                <ItemIcon src={imageSrc} />
                                <span>{dict[itemId]}</span>
                            </ParentItem>
                            {i.attachedItems.length > 0 &&
                            <SubList>
                                {i.attachedItems.map(ai => {
                                    return (
                                        <SubListItem key={ai}>
                                            {dict[ai]}
                                        </SubListItem>
                                    )
                                })}
                            </SubList>
                            }
                        </ListItem>
                    )
                })}
            </List>
        </div>
    )
}

class Loadout extends PureComponent {
    render() {
        const { items } = this.props

        const categorizedItems = groupBy(items, i => i.category)

        const weapons = categorizedItems[WEAPONS_CATEGORY]
        const equipment = categorizedItems[EQUIPMENT_CATEGORY]

        if (!items || items.length === 0) {
            return <NoItems>No Items</NoItems>
        }

        return (
            <LoadoutWrapper>
                <ItemList category={WEAPONS_CATEGORY} items={weapons} />
                <ItemList category={EQUIPMENT_CATEGORY} items={equipment} />
            </LoadoutWrapper>
        )
    }
}

export default Loadout
