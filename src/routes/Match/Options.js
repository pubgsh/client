import React from 'react'

export const STORAGE_KEY = 'options'

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

export const Context = React.createContext({})
