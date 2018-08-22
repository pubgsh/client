import React from 'react'
import { clamp } from 'lodash'
import { Arc, Circle, Group, Text, Label, Tag } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'

const getBasePlayerColor = ({ colors }, marks, player) => {
    if (marks.focusedPlayer() === player.name) {
        return colors.dot.focused
    } else if (player.teammates.includes(marks.focusedPlayer())) {
        return colors.dot.teammate
    }

    return colors.dot.enemy
}

const getPlayerColor = ({ colors }, marks, player) => {
    const base = getBasePlayerColor({ colors }, marks, player)
    return `${base}E0`
}

const getBaseStatusColor = ({ colors }, marks, player) => {
    if (player.status === 'dead') {
        const isTeammate = player.teammates.includes(marks.focusedPlayer())
        const isFocused = marks.focusedPlayer() === player.name

        if (isTeammate || isFocused) {
            return colors.dot.deadTeammate
        }

        return colors.dot.dead
    }

    if (player.status !== 'dead' && player.health === 0) {
        return colors.dot.knocked
    }

    return colors.dot.base
}

const getStatusColor = ({ colors }, marks, player) => {
    const base = getBaseStatusColor({ colors }, marks, player)
    return `${base}B0`
}

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
                text={player.name}
                fontSize={10}
                align="center"
            />
        </Label>
    )
}

const PlayerDot = ({ options, player, pubgMapSize, mapSize, marks, mapScale, showName }) => {
    const diameter = marks.isPlayerHovered(player.name) ? 11 : 8
    const scaledDiameter = diameter * clamp(mapScale / 1.4, 1, 1.3)
    const health = player.health / 100

    const mouseEvents = {
        onMouseOver(e) {
            marks.setHoveredPlayer(player.name)
        },

        onMouseOut() {
            marks.setHoveredPlayer(null)
        },

        onClick(e) {
            const toToggle = [player.name]

            if (e.evt.shiftKey) {
                toToggle.push(...player.teammates)
            }

            if (marks.isPlayerTracked(player.name)) {
                marks.setHoveredPlayer(null)
            }

            marks.toggleTrackedPlayer(...toToggle)
        },
    }

    return (
        <Group
            x={toScale(pubgMapSize, mapSize, player.location.x)}
            y={toScale(pubgMapSize, mapSize, player.location.y)}
            scale={{ x: 1 / mapScale, y: 1 / mapScale }}
        >
            <Circle
                fill={getStatusColor(options, marks, player)}
                radius={(scaledDiameter / 2) + 0}
                {...mouseEvents}
                stroke="#000000"
                strokeWidth={0.75}
            />
            <Arc
                fill={getPlayerColor(options, marks, player)}
                innerRadius={0}
                outerRadius={scaledDiameter / 2}
                angle={(360 * health)}
                {...mouseEvents}
            />
            <PlayerLabel
                player={player}
                visible={showName || marks.isPlayerHovered(player.name)}
                strokeColor={getPlayerColor(options, marks, player)}
            />
        </Group>
    )
}

export default PlayerDot
