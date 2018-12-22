import React from 'react'
import styled from 'styled-components'

const HiddenFileInput = styled.input`
    display: none;
`

class FileUploadButton extends React.Component {
    handleUploadClick = e => { this.fileInputRef.click() }

    render() {
        return (
            <div>
                <button onClick={this.handleUploadClick}>
                    {this.props.children}
                </button>
                <HiddenFileInput
                    type="file"
                    innerRef={ref => { this.fileInputRef = ref }}
                    onChange={this.props.onFile}
                />
            </div>
        )
    }
}

export default FileUploadButton
