import React, { Component } from "react";
import S from "../redux/store";
// import { Button } from "react-mdl";

class ClearFilterComp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showing: false
        };
        this.store = S(this.props.appId);
        this.unsubsriberFilterColumn = this.store.subscribeTo(this.store.FILTER_UPDATE, () => {
            this._setFilterCfg();
        });
        this._setFilterCfg=this._setFilterCfg.bind(this);
        this.reset = this.reset.bind(this);
    }
    componentWillUnmount() {
        this.unsubsriberFilterColumn();
    }
    _setFilterCfg(){
        let customConfig = S(this.props.appId).getState().customConfig;
        if (customConfig && customConfig.filters.length>0) {
            this.setState({
                showing: true
            });
        } else {
            this.setState({
                showing: false
            });
        }
    }
    reset(){
        this.store.resetFilter();
    }
    render() {
        return (this.state.showing &&
            <span>Button</span>
        )
    }
}
// <Button className="clearFilterComp" onClick={this.reset}>
//     Reset Filters
// </Button>
export default ClearFilterComp;
