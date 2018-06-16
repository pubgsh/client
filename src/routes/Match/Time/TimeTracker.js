import React from 'react'
import { clamp } from 'lodash'

class TimeTracker extends React.Component {
    state = {
        autoplaySpeed: 10,
        msSinceEpoch: 1000,
        autoplay: true,
    }

    clampAutoplaySpeed = val => clamp(val, 1, 40)
    clampMsSinceEpoch = val => clamp(val, 1000, (this.props.durationSeconds + 10) * 1000)
    setMsSinceEpoch = val => { this.setState({ msSinceEpoch: this.clampMsSinceEpoch(val) }) }
    setAutoplaySpeed = val => { this.setState({ autoplaySpeed: this.clampAutoplaySpeed(val) }) }

    onKeydown = e => {
        if (e.keyCode === 32) { // Space
            this.toggleAutoplay()
        }

        if (e.keyCode === 37) { // Left Arrow
            if (this.state.autoplay) this.stopAutoplay()

            this.setState(({ msSinceEpoch, autoplaySpeed }) => ({
                msSinceEpoch: this.clampMsSinceEpoch(msSinceEpoch - (autoplaySpeed * 100)),
            }))
        }

        if (e.keyCode === 39) { // Right Arrow
            if (this.state.autoplay) this.stopAutoplay()

            this.setState(({ msSinceEpoch, autoplaySpeed }) => ({
                msSinceEpoch: this.clampMsSinceEpoch(msSinceEpoch + (autoplaySpeed * 100)),
            }))
        }

        if (e.keyCode === 40) { // Down Arrow
            this.setState(({ autoplaySpeed }) => ({
                autoplaySpeed: this.clampAutoplaySpeed(autoplaySpeed - 1),
            }))
        }

        if (e.keyCode === 38) { // Up Arrow
            this.setState(({ autoplaySpeed }) => ({
                autoplaySpeed: this.clampAutoplaySpeed(autoplaySpeed + 1),
            }))
        }
    }

    componentDidMount() {
        this.mounted = true
        if (this.state.autoplay) setTimeout(this.startAutoplay, 300)
        window.addEventListener('keydown', this.onKeydown)
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rafId)
        this.mounted = false
        window.removeEventListener('keydown', this.onKeydown)
    }

    loop = time => {
        if (!this.state.autoplay || !this.mounted) return

        const elapsedTime = time - this.rafLastTime
        if (elapsedTime > 16) {
            this.rafLastTime = time

            this.setState(prevState => {
                const prev = prevState.msSinceEpoch

                if (Math.floor(prev / 1000) > this.props.durationSeconds) {
                    return { msSinceEpoch: 1000 }
                }

                return { msSinceEpoch: prevState.msSinceEpoch + (prevState.autoplaySpeed * elapsedTime) }
            })
        }

        this.rafId = requestAnimationFrame(this.loop)
    }

    startAutoplay = () => {
        this.rafLastTime = performance.now()
        this.setState({ autoplay: true })
        this.rafId = requestAnimationFrame(this.loop)
    }

    stopAutoplay = () => {
        cancelAnimationFrame(this.rafId)
        this.setState({ autoplay: false })
    }

    toggleAutoplay = () => {
        if (this.state.autoplay) {
            this.stopAutoplay()
        } else {
            this.startAutoplay()
        }
    }

    render() {
        const renderProps = {
            msSinceEpoch: this.state.msSinceEpoch,
            timeControls: {
                autoplay: this.state.autoplay,
                autoplaySpeed: this.state.autoplaySpeed,
                startAutoplay: this.startAutoplay,
                stopAutoplay: this.stopAutoplay,
                toggleAutoplay: this.toggleAutoplay,
                setAutoplaySpeed: this.setAutoplaySpeed,
                setMsSinceEpoch: this.setMsSinceEpoch,
            },
        }

        return this.props.render(renderProps)
    }
}

export default TimeTracker
