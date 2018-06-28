import React from 'react'
import styled from 'styled-components'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import 'rc-slider/assets/index.css'

const SliderWithTooltip = createSliderWithTooltip(Slider)

const StyledSlider = styled(SliderWithTooltip)`
    padding-top: 5px;
    margin-top: 12px;
    grid-column: 2;
    min-width: 80px;
`

const PlayButton = styled.button`
    padding: 0;
    font-size: 2rem;
    border: 0;
    margin: 0 10px;
    width: 25px;
    grid-column: 1;

    &:disabled {
        color: #bbb;
    }
`

const ControlsWrapper = styled.div`
    display: grid;
`

class AutoplayControls extends React.PureComponent {
    render() {
        const { autoplay, toggleAutoplay, changeSpeed, autoplaySpeed } = this.props
        return (
            <ControlsWrapper>
                <PlayButton className="button" type="submit" onClick={toggleAutoplay}>
                    <i className={`fi-${autoplay ? 'pause' : 'play'}`} />
                </PlayButton>
                <StyledSlider
                    min={1}
                    max={40}
                    value={autoplaySpeed}
                    onChange={changeSpeed}
                    tipFormatter={v => `${v}x`}
                    tipProps={{
                        visible: true,
                        placement: 'top',
                        align: { offset: [0, 8] },
                        overlayStyle: { zIndex: 1 },
                    }}
                />
            </ControlsWrapper>
        )
    }
}

export default AutoplayControls
