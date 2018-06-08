import React from 'react'
import { Group, Line, Rect } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'

const CarePackage = ({ mapSize, mapScale, carePackage }) => {
    if (!carePackage) {
        return null
    }

    const rectSize = 10 / Math.max(1, mapScale / 1.25)
    const scaledX = toScale(mapSize, carePackage.x)
    const scaledY = toScale(mapSize, carePackage.y)
    const rectX = scaledX - rectSize / 2
    const rectY = scaledY - rectSize / 2
    const lineWidth = 1 / Math.max(1, mapScale / 1.4)

    return (
        <Group>
            <Rect
                x={rectX}
                y={rectY}
                fill="#A02522"
                width={rectSize}
                height={rectSize}
            />
            <Rect
                x={rectX}
                y={rectY}
                fill="#207CAE"
                width={rectSize}
                height={rectSize / 3}
            />
            <Line
                points={[
                    rectX + rectSize / 4, rectY,
                    rectX + rectSize / 4, rectY + rectSize,
                ]}
                stroke="black"
                strokeWidth={lineWidth}
            />
            <Line
                points={[
                    rectX + (rectSize - rectSize / 4),
                    rectY, rectX + (rectSize - rectSize / 4), rectY + rectSize,
                ]}
                stroke="black"
                strokeWidth={lineWidth}
            />
        </Group>
    )
}

export default CarePackage
