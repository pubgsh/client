import React from 'react'
import { isEmpty, groupBy, map } from 'lodash'
import moment from 'moment'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ordinalSuffix } from 'ordinal-js'

const MatchesColumn = styled.div`
    text-align: center;
    grid-column: ${props => props.col};

    @media (max-width: 700px) {
        grid-column: 1;
        margin-bottom: 2rem;
    }
`

const StyledTable = styled.table`
    margin: 0 auto;

    & td {
        padding: 2px 7px;
        border: 0;
    }

    th {
        text-align: center;
    }
`

const NoMatches = styled.span`
    display: inline-block;
    padding-top: 12px;
`

const CustomMap = styled.span`
    font-size: 0.7em;
    margin-left: 5px;
`

const friendlyMapName = name => {
    if (name === 'Erangel_Main') return 'Erangel'
    if (name === 'Desert_Main') return 'Miramar'
    if (name === 'Savage_Main') return 'Sanhok'
    return name
}

const customIndicator = match => {
    if (match.gameMode === 'normal') return <CustomMap>(custom)</CustomMap>
    return null
}

const MatchesTable = ({ baseUrl, matches }) => {
    if (isEmpty(matches)) {
        return <NoMatches>No matches found</NoMatches>
    }

    const byDate = groupBy(matches, m => moment(m.playedAt).format('MMM Do'))

    return (
        <StyledTable>
            <tbody>
                {map(byDate, (ms, date) => {
                    return [
                        <tr key={`header-${date}`}>
                            <th colSpan="4">{date}</th>
                        </tr>,
                        ...ms.map(m => (
                            <tr key={m.id}>
                                <td>
                                    <Link to={`${baseUrl}/${m.id}`}>
                                        {moment(m.playedAt).format('h:mm a')}
                                    </Link>
                                </td>
                                <td>
                                    {friendlyMapName(m.mapName)}
                                    {customIndicator(m)}
                                </td>
                                <td>
                                    <strong>{m.stats.winPlace}</strong>{ordinalSuffix(m.stats.winPlace)}
                                </td>
                                <td>
                                    <strong>{m.stats.kills}</strong> kills
                                </td>
                            </tr>
                        )),
                    ]
                })}
            </tbody>
        </StyledTable>
    )
}

const MatchesList = ({ header, col, ...rest }) =>
    <MatchesColumn col={col}>
        <h5>{header}</h5>
        <MatchesTable {...rest} />
    </MatchesColumn>


export default MatchesList
