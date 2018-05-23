import React from 'react'
import { isEmpty } from 'lodash'
import moment from 'moment'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const StyledTable = styled.table`
    margin-left: -3px;

    & th {
        text-align: left;
        font-weight: 500;
    }

    & td {
        padding-right: 30px;
    }
`

const friendlyMapName = name => {
    if (name === 'Erangel_Main') return 'Erangel'
    if (name === 'Desert_Main') return 'Miramar'
    return name
}

const MatchesTable = ({ baseUrl, matches }) => {
    if (isEmpty(matches)) {
        return <span>No matches found</span>
    }

    return (
        <StyledTable>
            <thead>
                <tr>
                    <th>Played at</th>
                    <th>Map Name</th>
                </tr>
            </thead>
            <tbody>
                {matches.map(m => (
                    <tr key={m.id}>
                        <td>
                            <Link to={`${baseUrl}/${m.id}`}>
                                {moment(m.playedAt).format('MMM DD h:mm:ss a')}
                            </Link>
                        </td>
                        <td>
                            {friendlyMapName(m.mapName)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </StyledTable>
    )
}

const MatchesList = ({ header, ...rest }) =>
    <div>
        <h5>{header}</h5>
        <MatchesTable {...rest} />
    </div>

export default MatchesList
