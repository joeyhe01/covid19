import React from "react";
import TetherComponent from "react-tether";

export class BoundedTetherComp extends React.PureComponent {
    constructor() {
        super();
    }

    componentDidMount() {
        this.tableElement = document.querySelector(`.${this.props.appId}`);
    }

    render() {
        return (
            <TetherComponent
                {...this.props}
                constraints={[
                    {
                        to: this.tableElement,
                        attachment: 'target',
                        pin: true,
                    }
                ]}
            >
                {this.props.children}
            </TetherComponent>
        );
    }
}
