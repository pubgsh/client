import React from 'react'
import { Line } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'

const INTERVALS = 16

const Tracer = ({ pubgMapSize, mapSize, mapScale, players, tracer, msSinceEpoch }) => {
    if (!tracer) return null

    const { attackerName, victimName, startInterval, endInterval } = tracer

    const victimLoc = players[victimName].location
    const attackerLoc = players[attackerName].location

    const curInterval = (msSinceEpoch / 100) - startInterval
    const tracerInterval = Math.floor(curInterval / ((endInterval - startInterval) / INTERVALS))
    const xDeltaPerInterval = (victimLoc.x - attackerLoc.x) / INTERVALS
    const yDeltaPerInterval = (victimLoc.y - attackerLoc.y) / INTERVALS

    const fromX = attackerLoc.x + (xDeltaPerInterval * (tracerInterval + 0.1))
    const fromY = attackerLoc.y + (yDeltaPerInterval * (tracerInterval + 0.1))
    const toX = attackerLoc.x + (xDeltaPerInterval * (tracerInterval + 0.9))
    const toY = attackerLoc.y + (yDeltaPerInterval * (tracerInterval + 0.9))

    return (
        <Line
            points={[
                toScale(pubgMapSize, mapSize, toX), toScale(pubgMapSize, mapSize, toY),
                toScale(pubgMapSize, mapSize, fromX), toScale(pubgMapSize, mapSize, fromY),
            ]}
            stroke="#FFFFFF80"
            strokeWidth={1.5 / Math.max(1, mapScale / 1.4)}
        />
    )
}

export default Tracer
