import React from 'react'
import { merge } from 'lodash'

export const STORAGE_KEY = 'optionsV2'

export const DEFAULT_OPTIONS = {
    colors: {
        dot: {
            focused: '#8D79F3',
            teammate: '#31D499',
            enemy: '#FFFFFF',
            dead: '#B12020',
            deadTeammate: '#FF5ABA',
            knocked: '#FDFE0B',
            base: '#141414',
        },
        roster: {
            focused: '#8D79F3',
            teammate: '#31D499',
            enemy: '#000000',
            dead: '#B12020',
            deadTeammate: '#FF5ABA',
            knocked: '#E6B476',
        },
    },
}

const DEV_OPTIONS = {
    tools: {
        enabled: false,
        match: {
            timestamp: '5:24.6',
            autoplay: false,
        },
        map: {
            mapScale: 5.159780351999999,
            offsetX: -2144.042802688,
            offsetY: -1281.1747701759996,
        },
    },
}

if (process.env.NODE_ENV === 'production') {
    DEV_OPTIONS.tools.enabled = false
}

merge(DEFAULT_OPTIONS, DEV_OPTIONS)


export const Context = React.createContext({})
