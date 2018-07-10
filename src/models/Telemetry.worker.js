import parseTelemetry from './Telemetry.parser.js'

async function handleMessage({ data: { match, focusedPlayer } }) {
    const res = await fetch(match.telemetryUrl)
    const telemetryData = await res.json()
    const state = parseTelemetry(match, telemetryData, focusedPlayer)
    postMessage(state)
}

self.addEventListener('message', handleMessage)
