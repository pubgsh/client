import moment from 'moment'
import { friendlyMapName } from './util'

const generateMatchFilename = (match, playerName = undefined) => {
    const dateFragment = moment(match.playedAt).format('YYYY-MM-DD-HH-mm')
    const modeFragment = match.gameMode
    const mapFragment = friendlyMapName(match.mapName)
    const playerNameFragment = playerName
        ? `-${playerName}`
        : ''

    return `pubgsh${playerNameFragment}-${dateFragment}-${modeFragment}-${mapFragment}.json`
}

export const downloadJSON = data => {
    const filename = generateMatchFilename(data.match, data.playerName)

    // Add fake <a> to page
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'

    // Generate JSON blob
    const json = JSON.stringify(data)
    const blob = new Blob([json], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)

    // Click fake <a>
    a.href = url
    a.download = filename
    a.click()

    // Cleanup
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}
