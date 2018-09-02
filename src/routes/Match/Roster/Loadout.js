import React, { PureComponent } from 'react'
import styled from 'styled-components'
import groupBy from 'lodash/groupBy';
import dict from '../../../assets/itemId.json'

const importAll = req => {
    return req.keys().reduce((prev, r) => {
        // Split by directory and then reverse to get the filename
        const [itemId] = r.split('/').reverse();

        // Remove the extension from the file name.
        const key = itemId.substr(0, itemId.length - 4);

        // Require the file and assign it to the itemId property
        return {
            ...prev,
            [key]: req(r)
        }
    }, {});
}
  
const images = importAll(require.context('../../../assets/item', true, /.png$/));

const LoadoutWrapper = styled.div`
    position: absolute;
    left: -165px;
    min-width: 150px;
    background-color: #000000;
    color: #FFFFFF;
    border: 1px solid blue;
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
    display: flex;
    flex-direction: column;
    text-align: left;
    margin-bottom: 10px;
`

const ListItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`

const ParentItem = styled.div`
    display: flex;
    align-items: center;
`

const SubList = styled.div`
    text-align: left;
    margin-bottom: 10px;
    margin-left: 13px;
`

const ItemIcon = styled.img`
    max-height: 25px;
    max-width: 25px;
    width: auto;
    height: auto;
    display: block;
    margin-right: 5px;
`

const WEAPONS_CATEGORY = "Weapon"
const EQUIPMENT_CATEGORY = "Equipment"

const ItemList = ({ category, items }) => {
    if (!items || items.length === 0) {
        return (
            <div>
                No {category}
            </div>
        )
    }

    return (
        <div>
            <CategoryHeader>
                {category}
            </CategoryHeader>
            <List>
                {items.map(i => {
                    const { itemId } = i;

                    return (
                        <ListItem key={itemId}>
                            <ParentItem>
                                <ItemIcon src={images[itemId]} />
                                <span>{dict[itemId]}</span>
                            </ParentItem>
                            {i.attachedItems.length > 0 &&
                            <SubList>
                                {i.attachedItems.map(ai => {
                                    return (
                                        <ListItem key={ai}>
                                            {dict[ai]}
                                        </ListItem>
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
        const { items } = this.props;
        
        if (!items || items.length === 0) return null
        const categorizedItems = groupBy(items, i => i.category)

        const weapons = categorizedItems[WEAPONS_CATEGORY]
        const equipment = categorizedItems[EQUIPMENT_CATEGORY]
        
        return (
            <LoadoutWrapper>
                <ItemList category={WEAPONS_CATEGORY} items={weapons} />
                <ItemList category={EQUIPMENT_CATEGORY} items={equipment} />
            </LoadoutWrapper>
        );
    }
}

export default Loadout;