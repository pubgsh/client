import React from 'react'
import tippy from 'tippy.js'

/**
 * Taken from here: https://gist.github.com/atomiks/25ba93a551fc1e8a1ef18aa7669c6699#gistcomment-2693191
 */

class Tooltip extends React.Component {
    constructor(props) {
        super(props)

        this.childrenCount = React.Children.count(props.children)
        if (this.childrenCount === 0) console.warn('Tippy: child not found')
        if (this.childrenCount > 1) console.warn('Tippy: can have only 1 child')

        this.createMainRef = element => {
            this.reference = element
        }

        this.createHtmlRef = element => {
            this.htmlRef = element
        }
    }

    componentDidMount() {
        /**
         * Regarding popperOptions:
         *  https://github.com/atomiks/tippyjs/issues/196#issuecomment-371635364
         *  https://popper.js.org/popper-documentation.html#modifiers..preventOverflow
         */
        if (this.childrenCount !== 1) return false
        this.tippyInstance = tippy.one(this.reference, {
            ...this.props,
            popperOptions: {
                modifiers: {
                    preventOverflow: {
                        boundariesElement: 'window',
                    },
                },
            },
            html: this.htmlRef,
        })

        if (this.props.show) {
            this.tippyInstance.show()
        }
    }

    componentDidUpdate() {
        if (this.childrenCount !== 1) return false
        if (!this.props.html) {
            const tippyProp = this.props.allowTitleHTML ? 'innerHTML' : 'textContent'
            this.tippyInstance.popper.querySelector('.tippy-content')[tippyProp] =
                this.props.children.props.title
        }
    }

    componentWillUnmount() {
        if (this.tippyInstance) {
            this.tippyInstance.destroy()
            this.tippyInstance = null
        }
    }

    render() {
        if (this.childrenCount === 0) return <div style={{ display: 'none' }} />
        else if (this.childrenCount > 1) return <div>{this.props.children}</div>

        return (
            <div>
                <div
                    ref={this.createMainRef}
                    title={this.props.children.props.title}
                >
                    {this.props.children}
                </div>
                {this.props.html && <div ref={this.createHtmlRef}>{this.props.html}</div>}
            </div>
        )
    }
}

export default Tooltip
