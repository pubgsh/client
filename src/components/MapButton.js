import styled from 'styled-components'

const MapButton = styled.button`
    background: #777777E0;
    width: 2rem;
    height: 2rem;
    position: absolute;
    margin: 0;
    padding: 0;
    border-radius: 0;
    color: white;
    line-height: 1rem;
    font-size: 1.4rem;
    font-weight: 300;
    padding-left: 1px;
    border: 1px solid #888;

    &:hover, &:focus {
        color: white;
        border: 1px solid #888;
    }
`

export default MapButton
