import React from 'react'
import styled from 'styled-components'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import 'rc-slider/assets/index.css'
import killIcon from '../../assets/icons/killIcon.png'
import ripIcon from '../../assets/icons/ripIcon.png'
import knockIcon from '../../assets/icons/knockIcon.png'

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
    marginTop: '-4px',
}
const formatMarks = marks => {
    return marks.map(mark => {
        const status = mark.get('status')
        if (status === 'Kill') {
            return {
                style:
                {
                    backgroundImage: `url(${killIcon})`,
                    ...basicStyles,
                },
                label: status,
            }
        }
        if (status === 'Dead') {
            return {
                style:
                {
                    backgroundImage: `url(${ripIcon})`,
                    ...basicStyles,
                },
                label: status,
            }
        }
        if (status === 'Knock') {
            return {
                style:
                {
                    backgroundImage: `url(${knockIcon})`,
                    ...basicStyles,
                },
                label: status,
            }
        }
        return status
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
