import React from 'react'
import { Circle } from 'react-konva'

const getDotDiameter = (mapScale, isHovered) => {
    const baseDiameter = 8 / Math.max(1, mapScale / 1.4)
    return isHovered ? baseDiameter * 1.375 : baseDiameter
}

const toScale = (mapSize, n) => n / 816000 * mapSize

const PlayerDot = ({ player, mapSize, marks, mapScale }) => {
    const diameter = getDotDiameter(mapScale, marks.isHovered(player.get('name')))

    return (
        <Circle
            x={toScale(mapSize, player.getIn(['location', 'x']))}
            y={toScale(mapSize, player.getIn(['location', 'y']))}
            fill={player.get('color')}
            stroke="#222222B0"
            width={diameter}
            height={diameter}
            strokeWidth={1 / Math.max(1, mapScale / 1.4)}
            onMouseEnter={() => marks.setHoveredPlayer(player.get('name'))}
            onMouseLeave={() => marks.setHoveredPlayer('')}
            onClick={() => marks.toggleTrackedPlayer(player.get('name'))}
        />
    )
}

export default PlayerDot
