import React from 'react'
import styled from 'styled-components'
import * as Options from './Options.js'
import MapButton from '../../components/MapButton.js'

const ModalContainer = styled.div`
    top: 63px;
    position: absolute;
    z-index: 999;
    background: #333333F0;
    left: 15px;
    width: ${props => props.mapSize - 30}px;
    height: ${props => props.mapSize - 30}px;
    color: white;
    display: relative;
    font-size: 1.2rem;
    overflow: hidden;

    h5 {
        font-size: 1.8rem;
    }

    ul {
        list-style-type: none;
    }

    @media (-moz-touch-enabled: 1), (pointer:coarse) {
        top: 15px;
    }
`

const OpenButton = MapButton.extend`
    top: 63px;
    right: 15px;

    @media (-moz-touch-enabled: 1), (pointer:coarse) {
        top: 15px;
    }
`

const CloseButton = MapButton.extend`
    top: 0px;
    right: 0px;
`

const HelpText = styled.div`
    padding: 20px;
    width: ${props => props.mapSize - 80}px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
`

class HelpModal extends React.PureComponent {
    state = { visible: false }

    toggleVisibility = () => { this.setState(({ visible }) => ({ visible: !visible })) }

    onKeydown = e => {
        if (e.keyCode === 191 && e.shiftKey) { // Question Mark
            this.toggleVisibility()
        }
    }

    componentDidMount() {
        window.addEventListener('keydown', this.onKeydown)
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeydown)
    }

    /* eslint-disable max-len */
    render() {
        if (!this.state.visible) {
            return <OpenButton onClick={this.toggleVisibility}>?</OpenButton>
        }

        return (
            <Options.Context.Consumer>
                {({ options: { colors: { dot } } }) => (
                    <ModalContainer mapSize={this.props.mapSize} visible={this.state.visible}>
                        {this.state.visible &&
                            <HelpText mapSize={this.props.mapSize}>
                                <section>
                                    <h5>General Usage</h5>
                                    <ul>
                                        <li>Zoom in and out by scrolling, click and drag to pan</li>
                                        <li>Click on dot or roster entry to toggle pinning of their name</li>
                                        <li>Shift+Click on player dot to toggle pinning of their name + teammates</li>
                                        <li>Tracked player names are underlined on the roster</li>
                                        <li>Hover on care packages to view contents</li>
                                    </ul>
                                </section>

                                <section>
                                    <h5>Colors</h5>
                                    <ul>
                                        <li style={{ color: dot.focused }}>Focused player</li>
                                        <li style={{ color: dot.teammate }}>Focused player’s teammates</li>
                                        <li style={{ color: dot.deadTeammate }}>Dead focused player/teammate</li>
                                        <li style={{ color: dot.dead }}>Dead enemies</li>
                                        <li style={{ color: dot.knocked }}>Knocked down</li>
                                        <li style={{ color: dot.enemy }}>Living enemies</li>
                                    </ul>
                                </section>

                                <section>
                                    <h5>Keyboard Shortcuts</h5>
                                    <ul>
                                        <li>&lt;Space&gt;: Play / Pause</li>
                                        <li>&lt;Left/Right arrows&gt;: Backward/Forward in time (step = speed)</li>
                                        <li>&lt;Up/Down arrows&gt;: Increase/Decrease play speed</li>
                                        <li>&lt;?&gt;: Show/hide this help screen</li>
                                    </ul>
                                </section>

                                <section>
                                    <h5>Info</h5>
                                    <ul>
                                        <li>Matches are usually available ~10 minutes after completion</li>
                                        <li>Player HP is represented by the % of the circle that’s filled in</li>
                                    </ul>
                                </section>
                            </HelpText>
                        }
                        <CloseButton onClick={this.toggleVisibility}>X</CloseButton>
                    </ModalContainer>
                )}
            </Options.Context.Consumer>
        )
    }
    /* eslint-enable max-len */
}

export default HelpModal

