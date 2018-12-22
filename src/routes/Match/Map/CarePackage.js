import React from 'react'
import { Group, Image, Label, Tag, Text } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'
import cpFlying from '../../../assets/CarePackage_Flying.png'
import cpNormal from '../../../assets/CarePackage_Normal.png'
import dict from '../../../assets/itemId.json'

const Items = ({ visible, items }) => {
    if (!visible) return null

    const itemsText = items
        .map(i => `${i.stackCount > 1 ? `(${i.stackCount}) ` : ''}${dict[i.itemId] || i.itemId}`)
        .join('\n')

    return (
        <Label offsetY={-11}>
            <Tag
                fill="#000000A0"
                pointerDirection="up"
                pointerHeight={7}
                pointerWidth={11}
                stroke="#FFFFFF"
                strokeWidth={0.5}
                cornerRadius={4}
            />
            <Text
                fill="#FFFFFF"
                lineHeight={1}
                padding={5}
                text={itemsText}
                fontSize={10}
                align="left"
            />
        </Label>
    )
}

class CarePackage extends React.Component {
    state = { flyingImage: null, normalImage: null }

    componentDidMount() {
        const flyingImage = new window.Image()
        flyingImage.src = cpFlying
        flyingImage.onload = () => {
            this.setState({ flyingImage })
        }

        const normalImage = new window.Image()
        normalImage.src = cpNormal
        normalImage.onload = () => {
            this.setState({ normalImage })
        }
    }

    render() {
        const { pubgMapSize, mapSize, mapScale, carePackage } = this.props
        if (!carePackage) return null

        // react-konva uses the deprecated string refs from React.
        // TODO: Investigate upgrade path
        /* eslint-disable react/no-string-refs */
        return (
            <Group
                x={toScale(pubgMapSize, mapSize, carePackage.location.x)}
                y={toScale(pubgMapSize, mapSize, carePackage.location.y)}
                scale={{ x: 1 / mapScale, y: 1 / mapScale }}
                ref="group"
            >
                <Image
                    image={carePackage.state === 'spawned' ? this.state.flyingImage : this.state.normalImage}
                    width={18}
                    height={carePackage.state === 'spawned' ? 32 : 17}
                    offsetX={9}
                    offsetY={carePackage.state === 'spawned' ? 23 : 8}
                    onMouseOver={() => {
                        this.refs.group.moveToTop()
                        this.setState({ isHovered: true })
                    }}
                    onMouseOut={() => {
                        this.refs.group.moveToBottom()
                        this.refs.group.moveUp()
                        this.refs.group.moveUp()
                        this.refs.group.moveUp()
                        this.setState({ isHovered: false })
                    }}
                />
                <Items visible={this.state.isHovered} items={carePackage.items} />
            </Group>
        )
        /* eslint-enable react/no-string-refs */
    }
}

export default CarePackage
