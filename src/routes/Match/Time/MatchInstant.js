const MatchInstant = ({ telemetry, msSinceEpoch, render }) => {
    const currentTelemetry = telemetry.stateAt(msSinceEpoch)
    return render({ currentTelemetry })
}

export default MatchInstant
