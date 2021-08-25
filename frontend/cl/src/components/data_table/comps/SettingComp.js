import React, { Component } from "react";
import { Portal } from "react-portal";
import S from "../redux/store";
import TableService from "../services/table_service";
import ClassNames from "classnames";
import jQuery from "jquery";
import "jquery-ui/ui/widgets/sortable";
// import { Checkbox } from "react-mdl";
// import { Button } from "react-mdl";

class SettingComponentColumnItem extends Component {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
        this.state = {
            checked: true,
            title: ''
        };
        this.allSelected = this.allSelected.bind(this);
        this.defaultSelected = this.defaultSelected.bind(this);
    }
    componentDidMount() {
        this.store = S(this.props.appId);
        if(Object.keys(this.store.getState().columnHiddenTmp).length>0){
            this.setState({
                checked: !this.store.getState().columnHiddenTmp[this.props.column],
                title: this.store.getState().config.getColumnConfig(this.props.column).title
            });
        }else{
            this.setState({
                checked: !this.store.getState().config.columnHidden(this.props.column),
                title: this.store.getState().config.getColumnConfig(this.props.column).title
            });
        }

        this.subscriber_all = this.store.subscribeTo(this.store.SELECT_ALL_COLUMNS, open => {
            this.allSelected(open);
        });
        this.subscriber_default = this.store.subscribeTo(this.store.SELECT_DEFAULT_COLUMNS, open => {
            this.defaultSelected(open);
        });
    }
    componentWillUnmount(){
        this.subscriber_all();
        this.subscriber_default();
    }
    allSelected(open) {
        if (open) {
            this.setState({
                checked:true
            });
        } else {
            this.setState({
                checked:false
            })
        }
        this.props.onItemChecked(this.props.column, !open);
    }
    defaultSelected(open) {
        let defaultColumns = this.store.getState().defaultColumns;
        if(defaultColumns.includes(this.props.column) && open){
            this.setState({
                checked:true
            })
        }else{
            this.setState({
                checked:false
            })
        }
        setTimeout(()=>{
            this.props.onItemChecked(this.props.column, !this.state.checked);
        }, 0);
    }
    onChange(e) {
        this.setState({
            checked: e.target.checked
        });
        this.props.onItemChecked(this.props.column, !e.target.checked);
    }

    render() {
        // <span className='title autoEllipse'>{this.props.column}</span>
        return (
            <div className="columnItem">
                {/*<span className="reorder">*/}
                {/*    <i className="material-icons">drag_indicator</i>*/}
                {/*</span>*/}
                <span className="checkboxWrapper reorder">
                    <span>checkbox</span>
                    <span className='checkboxLable autoEllipse' title={this.state.title}>{this.state.title}</span>
                </span>
            </div>
        );
    }
}
// <Checkbox
//     key={this.props.rowIndex}
//     checked={this.state.checked}
//     onChange={this.onChange}
// />

class SettingComponentColumns extends Component {
    constructor() {
        super();
        this.state = {
            columnsOrder: []
        };
        this.onItemChecked = this.onItemChecked.bind(this);
        this.saveColumns = this.saveColumns.bind(this);
        this.onChangeAll=this.onChangeAll.bind(this);
        this.onChangeDefault=this.onChangeDefault.bind(this);
        this.updatedColumnStatus = {};
        this.columnOrderChanged = false;
    }

    componentDidMount() {
        this.service = new TableService();
        this.store = S(this.props.appId);
        // if there are other popups open, close them
        this.store.closeAllPopUp();
        this.store.closeAllFilterPopUp();
        //we do not want to dynamically chagne it, so having to use clone here
        this.setState({
            columnsOrder: JSON.parse(JSON.stringify( this.service.getNoneStickyColumnsOrderFromState(this.store.getState())))
        });
        this.unsubscriberCloseAllPopUp = this.store.subscribeTo(this.store.CLOSE_ALL_POPUP, () => {
            this.props.onClose();
        });
        var _this = this;
        jQuery(this.refs.columsWrapper).sortable({
            startPos: null,
            endPos: null,
            handle: ".reorder",
            start: function(event, ui) {
                this.startPos = ui.item.index();
            },
            stop: function(event, ui) {
                this.endPos = ui.item.index();
                let comps = _this.state.columnsOrder;
                comps.splice(this.endPos, 0, comps.splice(this.startPos, 1)[0]);
                _this.columnOrderChanged = true;
                //now let's updaste parent for updating
                //_this.props.onOrderChanged(comps);
                _this.setState({
                    columnsOrder: comps
                });
            }
        });
    }
    componentWillUnmount() {
        this.unsubscriberCloseAllPopUp();
        S(this.props.appId).setColumnTempHiddenStatus({});
    }
    onItemChecked(key, checked) {
        this.updatedColumnStatus[key] = checked;
        S(this.props.appId).setColumnTempHiddenStatus(this.updatedColumnStatus);
    }
    saveColumns() {
        if (this.columnOrderChanged) {
            this.props.onOrderChanged(this.service.restoreStickyColumnsFromState(this.store.getState(), this.state.columnsOrder));
            S(this.props.appId).setColumnsHidden(this.updatedColumnStatus);
        } else {
            S(this.props.appId).setColumnsHidden(this.updatedColumnStatus);
        }
        this.props.onClose();
    }
    onChangeAll(e) {
        S(this.props.appId).triggerSelectAllColumns(e.target.checked);
    }
    onChangeDefault(e) {
        S(this.props.appId).triggerDefaultColumns(e.target.checked);
    }
    render() {
        return (
            <div className="dropdownContent" onClick={e => e.stopPropagation()}>
                <div className="controllerWrapper">
                    <div className="columnTitle">Select Columns</div>

                <div>Part 1</div>

                </div>
                <div className="columsWrapper" ref="columsWrapper">
                    {this.state.columnsOrder.map((column, key) => (
                        <SettingComponentColumnItem
                            onItemChecked={this.onItemChecked}
                            key={key + Math.random()}
                            column={column}
                            {...this.props}
                        />
                    ))}
                </div>

                <div className="buttonsWrapper">
                    <div>part 2</div>
                </div>
            </div>
        );
    }
}

// <ul>
//     <li>
//         <Checkbox label={"Default"} onChange={this.onChangeDefault} />
//     </li>
//     <li>
//         <Checkbox label={"All"} onChange={this.onChangeAll} />
//     </li>
// </ul>
//
// <Button
//     className="closeBtn"
//     onClick={e => {
//         this.props.onClose();
//     }}>
//     <i className="material-icons">clear</i>
// </Button>



// <Button
//     ripple
//     onClick={e => {
//         this.props.onClose();
//     }}>
//     Cancel
// </Button>
// <Button raised colored onClick={this.saveColumns}>
//     Save
// </Button>

class SettingComponent extends Component {
    constructor() {
        super();
        this.state = {
            isOpen: false
        };
        this.toggleDropDown = this.toggleDropDown.bind(this);
    }

    componentDidMount() {
        var _this = this;
    }

    toggleDropDown(event) {
        if (event) {
            event.stopPropagation();
        }
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    _toggleClickOutside(event) {
        var excludedElement = document.querySelector(".dropdownWrapper");
        var excludedElement1 = document.querySelector(".wrapper");
        var selectedElement1 = excludedElement1 ? excludedElement1.contains(event.target) : false;
        var selectedElement = excludedElement ? excludedElement.contains(event.target) : false;
        if (!selectedElement1 && !selectedElement) {
            if (this.state.isOpen) this.toggleDropDown();
        }
    }
    render() {
        return (
            <div className="wrapper">
                <span>buttons</span>
                {/*<span className="title" onClick={this.toggleDropDown}>Edit Columns</span>*/}
                <span id={"hook_" + this.props.appId} className="dropdownWrapper" />
                {this.state.isOpen && (
                    <Portal node={document && document.getElementById("hook_" + this.props.appId)}>
                        <SettingComponentColumns {...this.props} onClose={this.toggleDropDown} />
                    </Portal>
                )}
            </div>
        );
    }
}
// <Button className='editColumnsButton' ripple raised primary onClick={this.toggleDropDown}>
//     Edit Columns
// </Button>
export default SettingComponent;
