// Common short functions that don't warrant their own module

export const friendlyMapName = name => {
    if (name === 'Erangel_Main') return 'Erangel'
    if (name === 'Baltic_Main') return 'Erangel'
    if (name === 'Desert_Main') return 'Miramar'
    if (name === 'Savage_Main') return 'Sanhok'
    if (name === 'DihorOtok_Main') return 'Vikendi'
    return name
}
