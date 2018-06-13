import React from 'react'
import { map, clamp, sortBy } from 'lodash'
import { Stage, Layer } from 'react-konva'
import styled from 'styled-components'
import { Safezone, Bluezone, Redzone } from './ZoneCircle.js'
import PlayerDot from './PlayerDot.js'
import BackgroundLayer from './BackgroundLayer.js'
import CarePackage from './CarePackage.js'
import Tracer from './Tracer.js'
import AliveCount from './AliveCount.js'

const SCALE_STEP = 1.2
const MIN_SCALE = 1
const MAX_SCALE = 50
const CLAMP_MAP = true // TODO: This should be a configurable option

const StageWrapper = styled.div`
    position: relative;
`

const StyledStage = styled(Stage)`
    div.konvajs-content {
        overflow: hidden;
        border-radius: 4px;
    }
`

class Map extends React.Component {
    state = { mapScale: 1, offsetX: 0, offsetY: 0 }

    handleDragEnd = e => {
        this.setState({
            offsetX: e.target.x(),
            offsetY: e.target.y(),
        })
    }

    dragBoundFunc = pos => {
        let { x, y } = pos
        if (CLAMP_MAP) {
            x = clamp(x, -(this.state.mapScale - 1) * this.props.mapSize, 0)
            y = clamp(y, -(this.state.mapScale - 1) * this.props.mapSize, 0)
        }

        this.setState({
            offsetX: x,
            offsetY: y,
        })

        return { x, y }
    }

    handleMousewheel = e => {
        e.evt.preventDefault()
        const scaleDelta = e.evt.deltaY > 0 ? 1 / SCALE_STEP : SCALE_STEP

        this.setState(prevState => {
            const newScale = clamp(prevState.mapScale * scaleDelta, MIN_SCALE, MAX_SCALE)

            const mousePointX = e.evt.layerX / prevState.mapScale - prevState.offsetX / prevState.mapScale
            const mousePointY = e.evt.layerY / prevState.mapScale - prevState.offsetY / prevState.mapScale

            let offsetX = -(mousePointX - e.evt.layerX / newScale) * newScale
            let offsetY = -(mousePointY - e.evt.layerY / newScale) * newScale

            if (CLAMP_MAP) {
                offsetX = clamp(offsetX, -(newScale - 1) * this.props.mapSize, 0)
                offsetY = clamp(offsetY, -(newScale - 1) * this.props.mapSize, 0)
            }

            return {
                mapScale: newScale,
                offsetX,
                offsetY,
            }
        })
    }

    render() {
        const { match, telemetry, mapSize, marks } = this.props
        const { mapScale, offsetX, offsetY } = this.state
        const scale = { x: mapScale, y: mapScale }

        const focusedPlayer = telemetry.get('players').find(p => p.get('name') === marks.focusedPlayer())
        const sortedPlayers = sortBy(telemetry.get('players'), player => {
            if (marks.isPlayerFocused(player.get('name'))) return 1000
            if (focusedPlayer.get('teammates').includes(player.get('name'))) return 900
            return marks.trackedPlayers().indexOf(player.get('name'))
        })

        return (
            <StageWrapper>
                <StyledStage
                    width={mapSize}
                    height={mapSize}
                    scale={scale}
                    x={offsetX}
                    y={offsetY}
                    dragBoundFunc={this.dragBoundFunc}
                    onDragEnd={this.handleDragEnd}
                    onWheel={this.handleMousewheel}
                    draggable="true"
                    hitGraphEnabled={false}
                >
                    <BackgroundLayer mapName={match.mapName} mapSize={mapSize} />
                    <Layer>
                        {<Safezone
                            mapSize={mapSize}
                            mapScale={mapScale}
                            circle={telemetry.get('safezone')}
                        />}
                        {<Bluezone
                            mapSize={mapSize}
                            mapScale={mapScale}
                            circle={telemetry.get('bluezone')}
                        />}
                        {<Redzone
                            mapSize={mapSize}
                            mapScale={mapScale}
                            circle={telemetry.get('redzone')}
                        />}
                        {telemetry.get('packages').map(carePackage =>
                            <CarePackage
                                key={carePackage.key}
                                mapSize={mapSize}
                                mapScale={mapScale}
                                carePackage={carePackage}
                            />,
                        )}
                        {map(sortedPlayers, player =>
                            <PlayerDot
                                player={player}
                                mapSize={mapSize}
                                mapScale={mapScale}
                                key={`dot-${player.get('name')}`}
                                marks={marks}
                                showName={marks.isPlayerTracked(player.get('name'))}
                            />,
                        )}
                        {telemetry.get('tracers').map(tracer =>
                            <Tracer
                                key={tracer.key}
                                mapSize={mapSize}
                                mapScale={mapScale}
                                players={telemetry.get('players')}
                                tracer={tracer}
                            />,
                        )}
                    </Layer>
                </StyledStage>
                <AliveCount players={telemetry.get('players')} />
            </StageWrapper>
        )
    }
}

export default Map
