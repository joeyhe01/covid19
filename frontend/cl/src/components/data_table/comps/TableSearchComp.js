import React, { Component } from "react";
import util from "../../common/utils";
import S from "../redux/store";
import ClassNames from "classnames";

class TableSearchComp extends Component {
    constructor() {
        super();
        this.update = this.update.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.state = {
            focused: false
        };
    }
    update(e) {
        this.text = e.target.value;
        util._debounce(() => {
            S(this.props.appId).setGlobalSearchTerm(this.text);
        }, 400);
    }
    onFocus() {
        this.setState({
            focused: true
        });
    }
    onBlur() {
        this.setState({
            focused: false
        });
    }
    render() {
        return (
            <div className={ClassNames({tableSearchWrapper: true, focused: this.state.focused })}>
                <input type="text" placeholder="Search"
                       onFocus={this.onFocus} onBlur={this.onBlur}
                       onKeyUp={this.update} onPaste={this.update} />
                <i className="material-icons">search</i>
            </div>
        );
    }
}
export default TableSearchComp;
