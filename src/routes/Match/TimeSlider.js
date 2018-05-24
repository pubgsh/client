import React from 'react'
import { Input, Container, Button } from 'semantic-ui-react'
import styled from 'styled-components'

const getDurationFormat = durationSeconds => {
    const minutes = Math.floor(durationSeconds / 60)
    const seconds = durationSeconds - (minutes * 60)
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const StyledRangeInput = styled(Input)`
    &&& {
        display: flex;
        flex-grow: 1;
        margin-right: 10px;

        input {
            height: 100%;
            padding-left: 0;
            padding-right: 0;
            outline: none;
            border: 0;
        }

        input[type='range']::-moz-focus-outer {
            border: 0;
        }
    }
`

const StyledDuration = styled.div`
    display: inline-block;
    line-height: 2.5em;
    margin-right: 10px;
    width: 35px;
`

const StyledPlayButton = styled(Button)`
    &&& {
        display: flex;
        margin-right: 0;
    }
`

const TimeSliderContainer = styled(Container)`
    &&& {
        display: flex;
        margin-bottom: 5px;
    }
`

const TimeSlider = ({ value, autoplay, stopAutoplay, toggleAutoplay, onChange, durationSeconds }) => (
    <TimeSliderContainer fluid id="TimeSlider">
        <StyledRangeInput
            name="secondsSinceEpoch"
            onMouseDown={stopAutoplay}
            onChange={onChange}
            value={value}
            type="range"
            min="1"
            max={durationSeconds + 11}
            step="1"
        />
        <StyledDuration>{getDurationFormat(value)}</StyledDuration>
        <StyledPlayButton icon={autoplay ? 'pause' : 'play'} onClick={toggleAutoplay} />
    </TimeSliderContainer>
)

export default TimeSlider
