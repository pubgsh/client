import React from 'react'
import styled from 'styled-components'

const DropdownContainer = styled.div`
    line-height: 3.6rem;
    text-transform: uppercase;
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    margin-right: 10px;
    position: relative;
    border: 1px solid #D1D1D1;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 1rem;
    top: -2px;

    @-moz-document url-prefix() {
        top: -1px;
    }

    ul {
        position: absolute;
        background: white;
        right: -1px;
        text-align: right;
        list-style-type: none;
        top: 45px;
        border: 1px solid #D1D1D1;
        border-radius: 4px;
        width: 66px;
        z-index: 10;

        li {
            margin-bottom: 0;
            padding: 0 10px;
            line-height: 3rem;

            &:hover {
                background-color: #F7F7F7;

                &:first-child {
                    border-radius: 4px 4px 0 0;
                }

                &:last-child {
                    border-radius: 0 0 4px 4px;
                }
            }
        }
    }
`

const Downarrow = styled.div`
    width: 0;
    height: 0;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-top: 5px solid #969696;
    margin-bottom: 1px;
    margin-left: 3px;
    display: inline-block;
`

const Options = ({ options, select }) => {
    return <ul>
        {options.map(o => (
            // eslint-disable-next-line
            <li key={o.key} onClick={() => select(o.value)}>{o.name}</li>
        ))}
    </ul>
}

class Dropdown extends React.Component {
    state = { open: false, value: '', options: [] }

    static getDerivedStateFromProps(props) {
        return {
            value: props.value,
            options: props.options.map(o => ({ key: o, name: o, value: o })),
        }
    }

    toggleOpen = () => this.setState(prevState => ({ open: !prevState.open }))

    selectValue = value => {
        this.setState({ value })
        this.props.onChange({ value })
    }

    render() {
        const { open, value, options } = this.state

        return (
            <DropdownContainer onClick={this.toggleOpen}>
                {value}
                <Downarrow />
                {open && <Options options={options} select={this.selectValue} />}
            </DropdownContainer>
        )
    }
}

export default Dropdown
