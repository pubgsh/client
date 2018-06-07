import Participants from './Participants.js'
import Telemetry from './Telemetry.js'
import matchData from '../../util/cce37d14-ebc8-40c0-b942-cbc8fd7b34cc.json'
import telemetryData from '../../util/7236f71d-5a53-11e8-b364-0a58647f9b0f-telemetry.json'

describe('Participants', () => {
    test('parses players / teammates / opponents', () => {
        const participants = Participants(matchData, 'BOT_Andre')

        expect(participants.get('BOT_Andre')).toBeDefined()
        expect(participants.get('BOT_Andre').get('health')).toBe(100)
    })
})

describe('Telemetry', () => {
    let telemetry

    const playerAtTime = (ms, playerName) =>
        telemetry.stateAt(ms).get('players').find(p => p.get('name') === playerName)

    beforeAll(() => {
        telemetry = Telemetry(matchData, telemetryData, 'BOT_Andre')
    })

    test('parses player locations', () => {
        expect(playerAtTime(600000, 'BOT_Andre').get('location')).toEqual({
            x: 603765.63125,
            y: 489161.1583333333,
        })
    })

    test('parses player status', () => {
        expect(playerAtTime(600000, 'BOT_Andre').get('status')).toEqual('alive')
        expect(playerAtTime(1200000, 'Roxxxi').get('status')).toEqual('dead')
    })

    test('parses zone circles', () => {
        expect(telemetry.stateAt(600000).getIn(['bluezone', 'radius'])).toBe(372669.5625)
        expect(telemetry.stateAt(600000).getIn(['redzone', 'radius'])).toBe(50000)
        expect(telemetry.stateAt(600000).getIn(['safezone', 'radius'])).toBe(231887.484375)
    })

    test('parses players health', () => {
        expect(playerAtTime(600000, 'BOT_Andre').get('health')).toEqual(98)
        expect(playerAtTime(1200000, 'Roxxxi').get('health')).toEqual(0)
    })
})
