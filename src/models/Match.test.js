import Match from './Match.js'

describe('match', () => {
    /* eslint-disable */
    const matchData = require('../../util/9bca3414-d17a-4e42-86e0-1884afd5e127.json')
    const telemetry = require('../../util/ecabbe8e-51aa-11e8-9f24-0a5864772f78-telemetry.json')
    /* eslint-enable */

    it('parses data', () => {
        const match = Match(matchData, telemetry)
        const players = match.stateAt(11 * 60 * 1000)
        expect(players.BOT_Andre.location.x).toBe(451758.875)
    })
})
