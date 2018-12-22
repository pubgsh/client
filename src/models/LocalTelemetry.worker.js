import parseTelemetry from './Telemetry.parser.js'

async function handleMessage({ data: { match, focusedPlayer, rawTelemetry } }) {
    try {
        const { state, globalState } = parseTelemetry(match, rawTelemetry, focusedPlayer)
        postMessage({ success: true, state, globalState })
    } catch (error) {
        postMessage({ success: false, error: error.message })
    }
}

self.addEventListener('message', handleMessage)
