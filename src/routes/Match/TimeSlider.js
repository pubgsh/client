import React from 'react'
import styled from 'styled-components'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import 'rc-slider/assets/index.css'

const getDurationFormat = durationSeconds => {
    const minutes = Math.floor(durationSeconds / 60)
    const seconds = durationSeconds - (minutes * 60)
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const SliderWithTooltip = createSliderWithTooltip(Slider)

const StyledSlider = styled(SliderWithTooltip)`
    padding-top: 1px;
    margin-top: 12px;
`

const TimeSlider = ({ value, stopAutoplay, onChange, durationSeconds }) => (
    <StyledSlider
        min={1}
        max={durationSeconds + 11}
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

export default TimeSlider
