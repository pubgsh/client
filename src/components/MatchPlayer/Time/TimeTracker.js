import React from 'react'
import { clamp } from 'lodash'

class TimeTracker extends React.Component {
    state = {
        autoplaySpeed: 10,
        msSinceEpoch: 1000,
        autoplay: false,
    }

    clampAutoplaySpeed = val => clamp(val, 1, 40)
    clampMsSinceEpoch = val => clamp(val, 1000, this.props.durationSeconds * 1000)
    setMsSinceEpoch = val => { this.setState({ msSinceEpoch: this.clampMsSinceEpoch(val) }) }
    setAutoplaySpeed = val => { this.setState({ autoplaySpeed: this.clampAutoplaySpeed(val) }) }

    onKeydown = e => {
        if (e.target.tagName.toLowerCase() === 'input') return

        if (e.keyCode === 32) { // Space
            e.preventDefault()
            this.toggleAutoplay()
        }

        if (e.keyCode === 37) { // Left Arrow
            e.preventDefault()
            if (this.state.autoplay) this.stopAutoplay()

            this.setState(({ msSinceEpoch, autoplaySpeed }) => ({
                msSinceEpoch: this.clampMsSinceEpoch(msSinceEpoch - (autoplaySpeed * 100)),
            }))
        }

        if (e.keyCode === 39) { // Right Arrow
            e.preventDefault()
            if (this.state.autoplay) this.stopAutoplay()

            this.setState(({ msSinceEpoch, autoplaySpeed }) => ({
                msSinceEpoch: this.clampMsSinceEpoch(msSinceEpoch + (autoplaySpeed * 100)),
            }))
        }

        if (e.keyCode === 40) { // Down Arrow
            e.preventDefault()
            this.setState(({ autoplaySpeed }) => ({
                autoplaySpeed: this.clampAutoplaySpeed(autoplaySpeed - 1),
            }))
        }

        if (e.keyCode === 38) { // Up Arrow
            e.preventDefault()
            this.setState(({ autoplaySpeed }) => ({
                autoplaySpeed: this.clampAutoplaySpeed(autoplaySpeed + 1),
            }))
        }
    }

    componentDidMount() {
        this.mounted = true
        if (this.state.autoplay) setTimeout(this.startAutoplay, 300)
        window.addEventListener('keydown', this.onKeydown)

        // Handle devtools options
        if (this.props.options.tools.enabled) {
            const { timestamp, autoplay } = this.props.options.tools.match

            if (autoplay) {
                setTimeout(this.toggleAutoplay, 100)
            }

            const [, min, sec, ds] = /(\d+):(\d+)\.(\d)/.exec(timestamp)
            this.setMsSinceEpoch((min * 60 * 1000) + (sec * 1000) + (ds * 100))

            return
        }

        setTimeout(this.toggleAutoplay, 100)
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rafId)
        this.mounted = false
        window.removeEventListener('keydown', this.onKeydown)
    }

    loop = time => {
        if (!this.state.autoplay || !this.mounted) return

        const elapsedTime = time - this.rafLastTime
        this.rafLastTime = time

        this.setState(({ msSinceEpoch, autoplaySpeed }) => {
            if (Math.floor(msSinceEpoch / 1000) >= this.props.durationSeconds) {
                cancelAnimationFrame(this.rafId)
                return { autoplay: false }
            }

            return { msSinceEpoch: this.clampMsSinceEpoch(msSinceEpoch + (autoplaySpeed * elapsedTime)) }
        })

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
            if (this.state.msSinceEpoch === this.props.durationSeconds * 1000) {
                this.setState({ msSinceEpoch: 1000 })
            }
            this.startAutoplay()
        }
    }

    rewindToStart = () => {
        if (this.state.autoplay) {
            this.stopAutoplay()
        }

        this.setState({ msSinceEpoch: 1000 })
    }

    render() {
        const { telemetry } = this.props
        const renderProps = {
            msSinceEpoch: this.state.msSinceEpoch,
            currentTelemetry: telemetry && telemetry.stateAt(this.state.msSinceEpoch),
            timeControls: {
                autoplay: this.state.autoplay,
                autoplaySpeed: this.state.autoplaySpeed,
                startAutoplay: this.startAutoplay,
                stopAutoplay: this.stopAutoplay,
                toggleAutoplay: this.toggleAutoplay,
                setAutoplaySpeed: this.setAutoplaySpeed,
                setMsSinceEpoch: this.setMsSinceEpoch,
                rewindToStart: this.rewindToStart,
            },
        }

        return this.props.render(renderProps)
    }
}

export default TimeTracker
