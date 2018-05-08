import data from '@/../test/__fixtures__/match.json'
import generateFixtures from '@/../test/generateFixtures.js' // eslint-disable-line
import Match from './Match.js'

describe('match', () => {
    // beforeAll(async () => { await generateFixtures() }, 60000)

    it('parses data', () => {
        const match = Match(data)
        const players = match.stateAt(11 * 60 * 1000)
        expect(players.robobagins.location.x).toBe(486426.34375)
    })
})
