import React from 'react'
import styled from 'styled-components'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const getDurationFormat = ms => {
    const minutes = Math.floor(ms / 1000 / 60)
    const seconds = Math.floor((ms - (minutes * 60 * 1000)) / 1000)
    const decis = Math.floor((ms - (minutes * 60 * 1000) - (seconds * 1000)) / 100)
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${decis}`
}

const SliderContainer = styled.div`
    position: relative;
`

const StyledSlider = styled(Slider)`
    padding-top: 5px;
    margin-top: 12px;
`

const Tooltip = styled.div.attrs({
    style: ({ value, durationSeconds }) => ({
        left: `${value / (durationSeconds * 1000) * 100}%`,
    }),
})`
    position: absolute;
    top: -8px;
    font-size: 12px;
    margin-left: -35px;
    width: 70px;
    text-align: center;
`

class TimeSlider extends React.PureComponent {
    render() {
        const { value, stopAutoplay, onChange, durationSeconds } = this.props

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
            </SliderContainer>
        )
    }
}

export default TimeSlider
