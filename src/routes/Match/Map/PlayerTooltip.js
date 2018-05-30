import React from 'react'
import { Group, Text } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'

const PlayerTooltip = ({ player, mapSize, mapScale, show }) => {
    if (!show) return null

    const fontSize = 11 / Math.max(1, mapScale / 1.4)
    const textOffset = 10 / Math.max(1, mapScale / 1.4)

    return (
        <Group>
            <Text
                fill={player.get('color').substring(0, 7)}
                x={toScale(mapSize, player.getIn(['location', 'x'])) + textOffset}
                y={toScale(mapSize, player.getIn(['location', 'y'])) - textOffset}
                text={player.get('name')}
                fontSize={fontSize}
                fontFamily="Palanquin"
            />
        </Group>
    )
}

export default PlayerTooltip

