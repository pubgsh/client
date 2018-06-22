import React from 'react'
import { clamp } from 'lodash'
import { Arc, Circle, Group, Text, Label, Tag } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'
import { getPlayerColor, getStatusColor } from '../../../lib/player-color.js'

const PlayerLabel = ({ visible, player, strokeColor }) => {
    if (!visible) return null

    return (
        <Label offsetY={-11}>
            <Tag
                fill="#000000A0"
                pointerDirection="up"
                pointerHeight={7}
                pointerWidth={11}
                stroke={strokeColor}
                strokeWidth={0.5}
                cornerRadius={4}
            />
            <Text
                fill={strokeColor}
                lineHeight={1}
                padding={5}
                text={player.get('name')}
                fontSize={10}
                fontFamily="Palanquin"
                align="center"
            />
        </Label>
    )
}

const PlayerDot = ({ player, pubgMapSize, mapSize, marks, mapScale, showName }) => {
    const diameter = marks.isPlayerHovered(player.get('name')) ? 11 : 8
    const scaledDiameter = diameter * clamp(mapScale / 1.4, 1, 1.3)
    const health = player.get('health') / 100

    const mouseEvents = {
        onMouseOver(e) {
            marks.setHoveredPlayer(player.get('name'))
        },

        onMouseOut() {
            marks.setHoveredPlayer(null)
        },

        onClick(e) {
            const toToggle = [player.get('name')]

            if (e.evt.shiftKey) {
                toToggle.push(...player.get('teammates'))
            }

            if (marks.isPlayerTracked(player.get('name'))) {
                marks.setHoveredPlayer(null)
            }

            marks.toggleTrackedPlayer(...toToggle)
        },
    }


    return (
        <Group
            x={toScale(pubgMapSize, mapSize, player.getIn(['location', 'x']))}
            y={toScale(pubgMapSize, mapSize, player.getIn(['location', 'y']))}
            scale={{ x: 1 / mapScale, y: 1 / mapScale }}
        >
            <Circle
                fill={getStatusColor(marks, player)}
                radius={(scaledDiameter / 2) + 0}
                {...mouseEvents}
                stroke="#000000"
                strokeWidth={0.75}
            />
            <Arc
                fill={getPlayerColor(marks, player)}
                innerRadius={0}
                outerRadius={scaledDiameter / 2}
                angle={(360 * health)}
                {...mouseEvents}
            />
            <PlayerLabel
                player={player}
                visible={showName || marks.isPlayerHovered(player.get('name'))}
                strokeColor={getPlayerColor(marks, player)}
            />
        </Group>
    )
}

export default PlayerDot
