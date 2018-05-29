import React from 'react'
import { Circle } from 'react-konva'

const getDotDiameter = (mapScale, isHovered) => {
    const baseDiameter = 8 / Math.max(1, mapScale / 1.25)
    return isHovered ? baseDiameter * 1.375 : baseDiameter
}

const toScale = (mapSize, n) => n / 816000 * mapSize

const PlayerDot = ({ player, mapSize, marks, mapScale }) => {
    const diameter = getDotDiameter(mapScale, marks.isRosterHovered(player.get('rosterId')))

    return (
        <Circle
            x={toScale(mapSize, player.getIn(['location', 'x']) - 1000)}
            y={toScale(mapSize, player.getIn(['location', 'y']) - 2000)}
            fill={player.get('color')}
            stroke="#222222B0"
            width={diameter}
            height={diameter}
            strokeWidth={1 / Math.max(1, mapScale / 1.4)}
            onMouseEnter={() => marks.setHoveredRosterId(player.get('rosterId'))}
            onMouseLeave={() => marks.setHoveredRosterId('')}
            onClick={() => marks.toggleTrackedRoster(player.get('rosterId'))}
        />
    )
}

export default PlayerDot
