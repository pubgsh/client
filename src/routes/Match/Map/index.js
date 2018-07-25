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
import * as Options from '../Options.js'

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
        const { match: { mapName }, telemetry, mapSize, marks, msSinceEpoch } = this.props
        const { mapScale, offsetX, offsetY } = this.state
        const scale = { x: mapScale, y: mapScale }

        const pubgMapSize = mapName === 'Savage_Main' ? 408000 : 816000

        // The order players are added to the canvas determines their relative z-index. We want to render
        // focused players on top, then tracked, etc, so we need to sort the players. We want dead players
        // below everything else, so we have to do this sort on every render. We use ~ and @ as they wrap
        // the ASCII range and we want a stable sort, so we use the player's name as the default value.
        const sortedPlayers = sortBy(telemetry.players, player => {
            if (marks.isPlayerFocused(player.name)) return '~z'
            if (marks.isPlayerTracked(player.name)) return '~y'
            if (telemetry.players[marks.focusedPlayer()].teammates.includes(player.name)) return '~x'
            if (player.status === 'dead') return '@y'
            if (player.health === 0) return '@z'
            return player.name
        })

        return (
            <Options.Context.Consumer>
                {({ options }) => (
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
                            <BackgroundLayer mapName={mapName} mapSize={mapSize} />
                            <Layer>
                                {telemetry.safezone && <Safezone
                                    mapSize={mapSize}
                                    pubgMapSize={pubgMapSize}
                                    mapScale={mapScale}
                                    circle={telemetry.safezone}
                                />}
                                {telemetry.bluezone && <Bluezone
                                    mapSize={mapSize}
                                    pubgMapSize={pubgMapSize}
                                    mapScale={mapScale}
                                    circle={telemetry.bluezone}
                                />}
                                {telemetry.redzone && <Redzone
                                    mapSize={mapSize}
                                    pubgMapSize={pubgMapSize}
                                    mapScale={mapScale}
                                    circle={telemetry.redzone}
                                />}
                                {telemetry.carePackages.map(carePackage =>
                                    <CarePackage
                                        key={carePackage.key}
                                        mapSize={mapSize}
                                        pubgMapSize={pubgMapSize}
                                        mapScale={mapScale}
                                        carePackage={carePackage}
                                    />
                                )}
                                {map(sortedPlayers, player =>
                                    <PlayerDot
                                        options={options}
                                        player={player}
                                        mapSize={mapSize}
                                        pubgMapSize={pubgMapSize}
                                        mapScale={mapScale}
                                        key={`dot-${player.name}`}
                                        marks={marks}
                                        showName={marks.isPlayerTracked(player.name)}
                                    />
                                )}
                                {telemetry.tracers.map(tracer =>
                                    <Tracer
                                        key={tracer.key}
                                        mapSize={mapSize}
                                        pubgMapSize={pubgMapSize}
                                        mapScale={mapScale}
                                        players={telemetry.players}
                                        tracer={tracer}
                                        msSinceEpoch={msSinceEpoch}
                                    />
                                )}
                            </Layer>
                        </StyledStage>
                        <AliveCount players={telemetry.players} />
                    </StageWrapper>
                )}
            </Options.Context.Consumer>
        )
    }
}

export default Map
