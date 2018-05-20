import React from 'react'
import { Circle } from 'react-konva'

const PlayerDot = ({ player, mapSize, isHovered, isTracked, setHoveredPlayer, toggleTrackedPlayer }) => {
    const toScale = n => n / 816000 * mapSize

    return (
        <Circle
            x={toScale(player.getIn(['location', 'x']))}
            y={toScale(player.getIn(['location', 'y']))}
            fill={player.get('color')}
            stroke="#22222280"
            width={isHovered ? 13 : 8}
            height={isHovered ? 13 : 8}
            strokeWidth="1"
            onMouseEnter={() => setHoveredPlayer(player.get('name'))}
            onMouseLeave={() => setHoveredPlayer('')}
            onClick={() => toggleTrackedPlayer(player.get('name'))}
        />
    )
}

export default PlayerDot
