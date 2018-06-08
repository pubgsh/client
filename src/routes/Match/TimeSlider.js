import React from 'react'
import styled from 'styled-components'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import 'rc-slider/assets/index.css'
import killIcon from '../../assets/icons/killIcon.png'
import ripIcon from '../../assets/icons/ripIcon.png'

const getDurationFormat = ms => {
    const minutes = Math.floor(ms / 1000 / 60)
    const seconds = Math.floor((ms - (minutes * 60 * 1000)) / 1000)
    const decis = Math.floor((ms - (minutes * 60 * 1000) - (seconds * 1000)) / 100)
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${decis}`
}

const basicStyles = {
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    backgroundPosition: 'center top',
    color: 'transparent',
    height: '32px', 
}
const formatMarks = marks => {
    return marks.map((status, time) => {
        if (status === 'Kill') {
            return (time,
            {
                style:
                {
                    backgroundImage: `url(${killIcon})`,
                    marginTop: '-4px',
                    ...basicStyles,
                },
                label: status,
            })
        }
        if (status === 'Dead') {
            return (time,
            {
                style:
                {
                    backgroundImage: `url(${ripIcon})`,
                    marginTop: '-20px',
                    ...basicStyles,
                },
                label: status,
            })
        }
        return (time, status)
    }).toObject()
}
const SliderWithTooltip = createSliderWithTooltip(Slider)

const StyledSlider = styled(SliderWithTooltip)`
    padding-top: 5px;
    margin-top: 12px;
`

const TimeSlider = ({ value, stopAutoplay, onChange, durationSeconds, telemetry }) => (
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
        marks={formatMarks(telemetry.get('marks'))}
    />
)

export default TimeSlider
