import Participants from './Participants.js'
import Telemetry from './Telemetry.js'
import matchData from '../../util/cce37d14-ebc8-40c0-b942-cbc8fd7b34cc.json'
import telemetryData from '../../util/7236f71d-5a53-11e8-b364-0a58647f9b0f-telemetry.json'

describe('Participants', () => {
    test('parses players / teammates / opponents', () => {
        const participants = Participants(matchData, 'BOT_Andre')

        expect(participants.get('BOT_Andre').get('focusType')).toBe('player')
        expect(participants.get('Goobeez').get('focusType')).toBe('teammate')
        expect(participants.get('Urmay').get('focusType')).toBe('none')

        // We expect the order of players to be the focus, their teammates, and then everyone else
        const arr = participants.toArray()
        expect(arr[0][0]).toBe('BOT_Andre')
        expect(arr[1][0]).toBe('Goobeez')
    })
})

describe('Telemetry', () => {
    test('parses player locations', () => {
        const telemetry = Telemetry(matchData, telemetryData, 'BOT_Andre')
        expect(telemetry.stateAt(600).get('players')[97].get('location')).toEqual({
            x: 603807.15,
            y: 489202.20625,
        })
    })

    test('parses player status', () => {
        const telemetry = Telemetry(matchData, telemetryData, 'BOT_Andre')
        expect(telemetry.stateAt(600).get('players')[97].get('status')).toEqual('alive')
        expect(telemetry.stateAt(1200).get('players')[10].get('status')).toEqual('dead')
    })

    test('parses zone circles', () => {
        const telemetry = Telemetry(matchData, telemetryData, 'BOT_Andre')
        expect(telemetry.stateAt(600).getIn(['bluezone', 'radius'])).toBe(372669.5625)
        expect(telemetry.stateAt(600).getIn(['redzone', 'radius'])).toBe(50000)
        expect(telemetry.stateAt(600).getIn(['safezone', 'radius'])).toBe(231887.484375)
    })
})
