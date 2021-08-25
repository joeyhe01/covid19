import React, { Component } from "react";


class ExpandDemoComp extends Component {

    render(){
        console.log(this.props)
        return <div>HelloWorld {this.props.rowIndex}</div>
    }

}

export default ExpandDemoComp;
