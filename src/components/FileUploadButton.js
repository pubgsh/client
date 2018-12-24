import React from 'react'
import styled from 'styled-components'

const HiddenFileInput = styled.input`
    display: none;
`

const UploadButton = styled.button`
    display: inline;
    font-size: 1rem;
    border: 0;
    padding: 0;
`

class FileUploadButton extends React.Component {
    handleUploadClick = e => { this.fileInputRef.click() }

    render() {
        return (
            <React.Fragment>
                <UploadButton onClick={this.handleUploadClick}>
                    {this.props.children}
                </UploadButton>
                <HiddenFileInput
                    type="file"
                    accept=".json"
                    innerRef={ref => { this.fileInputRef = ref }}
                    onChange={this.props.onFile}
                />
            </React.Fragment>
        )
    }
}

export default FileUploadButton
