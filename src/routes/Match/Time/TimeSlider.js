import React from 'react'
import styled from 'styled-components'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import ripIcon from '../../../assets/ripIcon.png'

const getDurationFormat = ms => {
    const minutes = Math.floor(ms / 1000 / 60)
    const seconds = Math.floor((ms - (minutes * 60 * 1000)) / 1000)
    const decis = Math.floor((ms - (minutes * 60 * 1000) - (seconds * 1000)) / 100)
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${decis}`
}

const SliderContainer = styled.div`
    position: relative;

    @media (max-width: 700px) {
        grid-column: 2;
    }
`

const StyledSlider = styled(Slider)`
    padding-top: 5px;
    margin-top: 12px;
`

const TimePositionedElement = styled.div.attrs({
    style: ({ value, durationSeconds }) => ({
        left: `${value / (durationSeconds * 1000) * 100}%`,
    }),
})

const Tooltip = TimePositionedElement`
    position: absolute;
    top: -8px;
    font-size: 12px;
    margin-left: -35px;
    width: 70px;
    text-align: center;
`

const HoverableTimePositionedElement = TimePositionedElement`
    &:hover:before {
        display: block;
        position: absolute;
        font-size: 12px;
        top: -35px;
        background-color: white;
        white-space: nowrap;
        border: 1px solid #ddd;
        border-radius: 3px;
        transform: translateX(-50%);
        background: #F7F7F7;
        padding: 2px 6px;
    }
`

const KillMarker = HoverableTimePositionedElement.extend`
    position: absolute;
    top: 23px;
    margin-left: -6px;
    width: 12px;
    text-align: center;
    height: ${props => props.count > 1 ? 10 : 10}px;
    background: linear-gradient(to right,
        transparent 0%,
        transparent calc(50% - 0.41px),
        ${props => props.color} calc(50% - 0.8px),
        ${props => props.color} calc(50% + 0.8px),
        transparent calc(50% + 0.41px),
        transparent 100%
    );

    &:after {
        content: "${props => props.count > 1 ? `(${props.count})` : ''}";
        color: ${props => props.color};
        display: block;
        top: 9px;
        position: absolute;
        text-align: center;
        font-size: 11px;
    }

    &:hover:before {
        content: "${props => props.victimNames}";
    }
`

const DeathMarker = HoverableTimePositionedElement.extend`
    position: absolute;
    top: 26px;
    margin-left: -10px;
    width: 19px;
    height: 19px;
    background: url('${ripIcon}');
    background-size: 19px;
    background-repeat: no-repeat;

    &:after {
        content: "";
        display: block;
    }

    &:hover:before {
        content: "Killed By: ${props => props.killerName}";
    }
`

class TimeSlider extends React.PureComponent {
    render() {
        const { value, stopAutoplay, onChange, durationSeconds, globalState, options } = this.props

        const groupedKills = globalState && globalState.kills.reduce((acc, kill, idx) => {
            if (idx === 0) return [[kill]]

            const [previousKill] = acc[acc.length - 1]
            const shouldGroupWithPrevious = kill.msSinceEpoch - previousKill.msSinceEpoch < 1000

            if (shouldGroupWithPrevious) {
                acc[acc.length - 1].push(kill)
            } else {
                acc.push([kill])
            }

            return acc
        }, null)

        return (
            <SliderContainer>
                <StyledSlider
                    min={1000}
                    max={durationSeconds * 1000}
                    step={100}
                    onChange={onChange}
                    onBeforeChange={stopAutoplay}
                    value={value}
                />
                <Tooltip value={value} durationSeconds={durationSeconds}>{getDurationFormat(value)}</Tooltip>
                {groupedKills && groupedKills.map((kills, idx) =>
                    <KillMarker
                        key={`killmarker-${idx}`} // eslint-disable-line react/no-array-index-key
                        value={kills[0].msSinceEpoch}
                        count={kills.length}
                        durationSeconds={durationSeconds}
                        color={options.colors.roster.dead}
                        victimNames={kills.map(k => k.victimName).join(', ')}
                    />
                )}
                {globalState && globalState.death &&
                    <DeathMarker
                        value={globalState.death.msSinceEpoch}
                        durationSeconds={durationSeconds}
                        killerName={globalState.death.killedBy}
                    />
                }
            </SliderContainer>
        )
    }
}

export default TimeSlider
