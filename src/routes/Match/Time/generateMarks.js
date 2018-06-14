import killIcon from '../../../assets/icons/kill.png'
import deathIcon from '../../../assets/icons/death.png'
import knockIcon from '../../../assets/icons/knock.png'

const basicStyles = {
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    backgroundPosition: 'center top',
    color: 'transparent',
    height: '32px',
    marginTop: '-4px',
}

export const generateMarks = marks => {
    return marks.reduce((acc, mark) => {
        acc[mark.timestamp] = mark.type

        if (mark.type === 'kill') {
            acc[mark.timestamp] = {
                style: {
                    ...basicStyles,
                    backgroundImage: `url(${killIcon})`,
                },
                label: mark.type,
            }
        }

        if (mark.type === 'death') {
            acc[mark.timestamp] = {
                style: {
                    ...basicStyles,
                    backgroundImage: `url(${deathIcon})`,
                },
                label: mark.type,
            }
        }

        if (mark.type === 'knock') {
            acc[mark.timestamp] = {
                style: {
                    ...basicStyles,
                    backgroundImage: `url(${knockIcon})`,
                },
                label: mark.type,
            }
        }

        return acc
    }, {})
}
