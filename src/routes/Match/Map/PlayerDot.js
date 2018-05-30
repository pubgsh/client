import React from 'react'
import { Circle } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'

const getDotDiameter = (mapScale, isHovered) => {
    const baseDiameter = 8 / Math.max(1, mapScale / 1.25)
    return isHovered ? baseDiameter * 1.375 : baseDiameter
}

const PlayerDot = ({ player, mapSize, marks, mapScale }) => {
    const diameter = getDotDiameter(mapScale, marks.isRosterHovered(player.get('rosterId')))
    const currHealth = player.get('health');
    const diameterMultiplier = currHealth / 100 * diameter;
    return (
        <Circle
            x={toScale(mapSize, player.getIn(['location', 'x']))}
            y={toScale(mapSize, player.getIn(['location', 'y']))}
            fill={player.get('color')}
            stroke="#222222B0"
            fillRadialGradientColorStops={[0, '#00FF00B0', 0.5, '#FFFF00B0', 1, '#FF0000B0']}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={diameterMultiplier}
            fillPriority={currHealth > 0 ? 'radial-gradient' : 'color'}
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
