import React from 'react'
import styled from 'styled-components'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import 'rc-slider/assets/index.css'

const getDurationFormat = ms => {
    const minutes = Math.floor(ms / 1000 / 60)
    const seconds = Math.floor((ms - (minutes * 60 * 1000)) / 1000)
    const decis = Math.floor((ms - (minutes * 60 * 1000) - (seconds * 1000)) / 100)
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${decis}`
}

const SliderWithTooltip = createSliderWithTooltip(Slider)

const StyledSlider = styled(SliderWithTooltip)`
    padding-top: 5px;
    margin-top: 12px;
`

class TimeSlider extends React.PureComponent {
    render() {
        const { value, stopAutoplay, onChange, durationSeconds } = this.props

        return (
            <StyledSlider
                min={1000}
                max={(durationSeconds + 11) * 1000}
                step={100}
                onChange={onChange}
                onBeforeChange={stopAutoplay}
                value={value}
                tipFormatter={getDurationFormat}
                tipProps={{
                    visible: true,
                    placement: 'top',
                    align: { offset: [0, 8] },
                    overlayStyle: { zIndex: 1 },
                }}
            />
        )
    }
}

export default TimeSlider
