import React, { PureComponent } from 'react'
import styled from 'styled-components'
import { groupBy, isEmpty, sortBy } from 'lodash'
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
    width: 220px;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: 400;
    padding: 4px;
`

const CategoryHeader = styled.div`
    text-align: center;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 5px 0 20px;
`

const List = styled.div`
    display: grid;
    text-align: left;
`

const ListItem = styled.div`
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 10px;
    }
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
    font-weight: 600;
`

const SubList = styled.div`
    text-align: left;
    margin-left: 40px;
`

const ItemIcon = styled.img`
    max-height: 25px;
    max-width: 25px;
    width: auto;
    height: auto;
    display: inline-block;
    justify-self: center;
    filter: invert(0.75);
`

const StyledEquipmentIcons = styled.div`
    width: 150px;
    margin: 10px auto;
    display: grid;
    grid-column-gap: 10px;
    grid-template-columns: repeat(4, 1fr);
`

const ItemIconPlaceholder = styled(ItemIcon)`
    filter: none !important;
`

const NoItems = styled.span`
    font-size: 1.1rem;
    font-weight: 400;
    margin-bottom: 10px;
    display: inline-block;
`

const WEAPON_PRIORITIES = {
    Main: 0,
    Handgun: 1,
    Melee: 2,
}
const EQUIPMENT_REGEX = /_(\d\d)_/g
const EQUIPMENT_SUBCATS = ['Headgear', 'Vest', 'Backpack', 'Throwable']
const EQUIPMENT_PLACEHOLDERS = {
    Headgear: 'Item_Head_E_00_Lv1_C',
    Vest: 'Item_Armor_E_00_Lv1_C',
    Backpack: 'Item_Back_E_00_Lv1_C',
    Throwable: 'Item_Weapon_Grenade_C',
}


const WeaponsList = ({ weapons }) => {
    if (isEmpty(weapons)) {
        return <NoItems>(No Weapons)</NoItems>
    }

    const sortedWeapons = sortBy(weapons, w => `${WEAPON_PRIORITIES[w.subCategory]}${w.itemId}`)

    return (
        <List>
            {sortedWeapons.map((i, index) => {
                const { itemId } = i
                const imageSrc = images[itemId]

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
    )
}

const EquipmentIcons = ({ equipment }) =>
    <StyledEquipmentIcons>
        {EQUIPMENT_SUBCATS.map(subcat => {
            const e = equipment.find(i => i.subCategory === subcat)
            if (e) {
                const replacedItemId = e.itemId.replace(EQUIPMENT_REGEX, '_00_')
                return (
                    <ItemIcon key={subcat} src={images[replacedItemId]} />
                )
            }

            return <ItemIconPlaceholder key={subcat} src={images[EQUIPMENT_PLACEHOLDERS[subcat]]} />
        })}
    </StyledEquipmentIcons>

class Loadout extends PureComponent {
    render() {
        const {
            Weapon: weapons = [],
            Equipment: equipment = [],
        } = groupBy(this.props.items, i => i.category)

        return (
            <LoadoutWrapper>
                <CategoryHeader>Loadout</CategoryHeader>
                <WeaponsList weapons={weapons} />
                <EquipmentIcons equipment={equipment} />
            </LoadoutWrapper>
        )
    }
}

export default Loadout
