import { Cell } from "fixed-data-table-2";
import React, { Component } from "react";
import S from "../../redux/store";
import TableService from "../../services/table_service";
import { Filter, ORDER_ASC, ORDER_DESC, ORDER_NONE } from "../../entities/custom_config";
import TetherComponent from "react-tether";
import { TYPE_DATE, TYPE_DATETIME, TYPE_TEXT, TYPE_HTML, TYPE_LIST, TYPE_SINGLE_SELECT_ACTIONS, TYPE_PURE_TEXT, TYPE_CLICKABLE } from "../../entities/column";
import ClassNames from "classnames";
import Checkbox from 'muicss/lib/react/checkbox';
import { ToolTipComp } from "./cells";
import { BoundedTetherComp } from "../BoundedTetherComp";
var Datetime = require('react-datetime');
import {
    TYPE_CONTAINS,
    TYPE_EQUALS,
    TYPE_GREATER_OR_EQUAL,
    TYPE_LESS_OR_EQUAL,
    TYPE_BETWEEN,
    TYPE_IN,
    TYPE_NUMBER
} from "../../entities/custom_config";

export class HeaderCell extends React.PureComponent {
    constructor () {
        super();
        this.state = {
            columnConfig: null,
            openFilter: false,
            mouseHover: false,
            currentFiltered: false
        };
        this.service = new TableService();
        this._setCfg = this._setCfg.bind(this);
        this._setFilterCfg = this._setFilterCfg.bind(this);
        this.sort = this.sort.bind(this);
        this.filter = this.filter.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onMouseEnterSort = this.onMouseEnterSort.bind(this);
        this.onMouseLeaveSort = this.onMouseLeaveSort.bind(this);
        this.onFilterUpdate = this.onFilterUpdate.bind(this);
    }
    componentDidMount () {
        this.store = S(this.props.appId);
        this.unsubscriberCloseAllPopUp = this.store.subscribeTo(this.store.CLOSE_ALL_FILTER_POPUP, () => {
            this.onClose();
        });
        this.unsubsriberSortColumn = this.store.subscribeTo(this.store.SORT_COLUMN, () => {
            this._setCfg();
        });
        this.unsubsriberFilterColumn = this.store.subscribeTo(this.store.FILTER_UPDATE, () => {
            this._setFilterCfg();
        });
        this._setCfg();
        this._setFilterCfg();
        this.setState({
            currentSorted: false
        });
    }
    componentWillUnmount () {
        this.unsubscriberCloseAllPopUp();
        this.unsubsriberSortColumn();
        this.unsubsriberFilterColumn();
    }
    _setCfg () {
        let columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        let customConfig = S(this.props.appId).getState().customConfig;
        let sortIcon;
        if (columnConfig.sortable && customConfig) {
            if (customConfig.getColumnSortOrder(this.props.columnKey) !== ORDER_NONE) {
                sortIcon = <i className={
                    ClassNames({
                        "material-icons": true,
                        "sortIconUp": true,
                        "sortIconDown": customConfig.sorter.order === ORDER_DESC
                    })
                }>arrow_upward</i>;
            }
        } else {
            sortIcon = null;
        }
        this.setState({
            columnConfig: columnConfig,
            sortIcon: sortIcon
        });
    }

    _setFilterCfg () {
        let customConfig = S(this.props.appId).getState().customConfig;
        let currentFiltered = false;
        if (customConfig && customConfig.getFilterFor(this.props.columnKey)) {
            currentFiltered = true;
        }
        this.setState({
            currentFiltered: currentFiltered
        });
    }

    sort () {
        let columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        if (columnConfig.sortable) {
            S(this.props.appId).setColumnSort(this.props.columnKey);
        }
    }
    filter (event) {
        if (event) { event.stopPropagation(); }
        this.store.closeAllFilterPopUp();
        this.setState({
            openFilter: !this.state.openFilter
        });
    }
    onClose () {
        this.setState({
            openFilter: false
        });
    }
    onFilterUpdate (filter) {
        this.store.setFilter(filter);
    }
    onMouseEnterSort () {
        this.setState({
            mouseHover: true
        });
    }
    onMouseLeaveSort () {
        this.setState({
            mouseHover: false
        });
    }
    render () {
        if (this.state.columnConfig == null) return null;

        let filterIcon;
        let columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        if (columnConfig.filterable) {
            filterIcon = (
                <i
                    className={ClassNames({
                        "material-icons": true,
                        up: !this.state.openFilter,
                        down: this.state.openFilter
                    })}>
                    filter_list
                </i>
            );
        } else {
            filterIcon = null;
        }

        let sortIcon = null;
        if (columnConfig.sortable && this.state.mouseHover) {
            sortIcon = <i className={
                ClassNames({
                    "material-icons": true,
                    "sortIconUp": true,
                })
            }>arrow_upward</i>;
        }

        return (
            <Cell>
                <div className="headerWrapper">
                    <span className="headerTitle" onClick={this.sort}
                        onMouseEnter={this.onMouseEnterSort} onMouseLeave={this.onMouseLeaveSort}
                    >
                        {this.state.columnConfig.title}
                        <BoundedTetherComp className="dvTetheredToolTip" attachment="top center" appId={this.props.appId}>
                            <span className="headerTooltipAttachPoint" />
                            {this.state.mouseHover && this.state.columnConfig.tooltip && <ToolTipComp {...this.props} content={this.state.columnConfig.tooltip} />}
                        </BoundedTetherComp>
                    </span>
                    <span className={ClassNames({ sortIconWrapper: true, hoverSort: this.state.mouseHover && !this.state.sortIcon })}
                        onMouseEnter={this.onMouseEnterSort} onMouseLeave={this.onMouseLeaveSort} onClick={this.sort}
                    > {this.state.sortIcon || sortIcon} </span>
                    <span
                        className={ClassNames({ filterIconWrapper: true, selectedFilter: this.state.currentFiltered })}
                        onClick={e => this.filter(e)}
                    > {filterIcon} </span>
                    <BoundedTetherComp attachment="top left" appId={this.props.appId}>
                        <span className="filterAttachPoint" />
                        {this.state.openFilter && <HeaderFilterComp {...this.props} onClose={this.onClose} />}
                    </BoundedTetherComp>
                </div>
            </Cell>
        );
    }
}

class HeaderFilterComp extends React.PureComponent {
    constructor (props) {
        super(props);
    }
    render () {
        let columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        let filterComp = null;

        if(columnConfig.type === TYPE_NUMBER){
            filterComp = <HeaderFilterNumberComp {...this.props} />;
        }else if (columnConfig.type === TYPE_SINGLE_SELECT_ACTIONS || columnConfig.filterOptions.length > 0) {
            filterComp = <HeaderFilterListComp {...this.props} />;
        } else if (
            columnConfig.type === TYPE_TEXT ||
            columnConfig.type === TYPE_PURE_TEXT ||
            columnConfig.type === TYPE_HTML ||
            columnConfig.type === TYPE_LIST ||
            columnConfig.type === TYPE_CLICKABLE
        ) {
            filterComp = <HeaderFilterCompTextHtml {...this.props} />;
        } else if (
            columnConfig.type === TYPE_DATE || columnConfig.type === TYPE_DATETIME
        ) {
            filterComp = <HeaderFilterDateTimeComp {...this.props} />;
        }
        return <div className={ClassNames({
            "headerFilterWrapper": true,
            "normaFilterlWrapper": !(columnConfig.type === TYPE_DATE || columnConfig.type === TYPE_DATETIME),
            "dateTimePickerWrapper": columnConfig.type === TYPE_DATE || columnConfig.type === TYPE_DATETIME
        })} onClick={e => e.stopPropagation()}>{filterComp}</div>;
    }
}

class HeaderFilterNumberComp extends React.PureComponent {
    constructor (props) {
        super(props);

        this.updateStartNum = this.updateStartNum.bind(this);
        this.updateEndNum = this.updateEndNum.bind(this);
        this.confirm = this.confirm.bind(this);
        this.closeme = this.closeme.bind(this);

        this.customConfig = S(this.props.appId).getState().customConfig;
        this.currentFilter = null;

        if (this.customConfig) {
            this.currentFilter = this.customConfig.getFilterFor(this.props.columnKey);
        }

        if (this.currentFilter) {
            this.filter = new Filter({
                by: this.props.columnKey,
                operator: TYPE_BETWEEN,
                value1: this.currentFilter.value1,
                value2: this.currentFilter.value2,
            });
        } else {
            this.filter = new Filter({ by: this.props.columnKey, operator: TYPE_BETWEEN, value1: 0, value2: 0 });
        }
    }

    updateStartNum (e) {
        this.filter.value1 = e.target.value;
    }
    updateEndNum (e) {
        this.filter.value2 = e.target.value;
    }
    confirm () {
        S(this.props.appId).setFilter(this.filter);
    }
    closeme () {
        this.props.onClose();
    }
    render () {
        return <div className="headerFilerNumber">
            <div className="headerFilerNumberFilters">
                <span>From: </span>
                <input type='number' onChange={this.updateStartNum} />
                <span>To</span>
                <input type='number' onChange={this.updateEndNum} />
            </div>

            <div className="cfx"></div>
            <div className="headerFilterButtons">
                <i className={ClassNames({ "material-icons": true })} onClick={this.confirm}>
                    done
                         </i>
                <i className="material-icons" onClick={this.closeme}>
                    clear
                         </i>
            </div>
        </div>;
    }
}

class HeaderFilterDateTimeComp extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            invalid: true
        };
        this.updateStartDate = this.updateStartDate.bind(this);
        this.updateEndDate = this.updateEndDate.bind(this);
        this.confirm = this.confirm.bind(this);
        this.closeme = this.closeme.bind(this);

        this.customConfig = S(this.props.appId).getState().customConfig;
        this.currentFilter = null;

        if (this.customConfig) {
            this.currentFilter = this.customConfig.getFilterFor(this.props.columnKey);
        }

        if (this.currentFilter) {
            this.filter = new Filter({
                by: this.props.columnKey,
                operator: TYPE_BETWEEN,
                value1: new Date(this.currentFilter.value1),
                value2: new Date(this.currentFilter.value2),
            });
        } else {
            this.filter = new Filter({ by: this.props.columnKey, operator: TYPE_BETWEEN, value1: new Date(), value2: new Date() });
        }
        //this.checkValidate();
    }

    updateStartDate (e) {
        this.filter.value1 = e._d.getTime();
        this.checkValidate();
    }
    updateEndDate (e) {
        this.filter.value2 = e._d.getTime();
        this.checkValidate();
    }

    checkValidate () {
        this.setState({
            invalid: this.filter.inValid()
        });
    }

    confirm () {
        S(this.props.appId).setFilter(this.filter);
        this.closeme();
    }
    closeme () {
        this.props.onClose();
    }
    render () {
        return <div className="headerFilerDateTime">
            <div className="headerDateTimeFilters">
                <span className="startDTWrapper">
                    <span>From DateTime</span>
                    <Datetime dateFormat="YYYY-MM-DD" defaultValue={this.filter.value1} onChange={this.updateStartDate} />
                </span>
                <span className="endDTWraper">
                    <span>To DateTime</span>
                    <Datetime dateFormat="YYYY-MM-DD" defaultValue={this.filter.value2} onChange={this.updateEndDate} />
                </span>
            </div>

            <div className="cfx"></div>

            <div className="headerFilterButtons">
                {this.state.invalid && <div className='error'>{this.state.invalid}</div>}
                <i className={ClassNames({ "material-icons": true, "hidden": this.state.invalid })} onClick={this.confirm}>
                    done
                         </i>
                <i className="material-icons" onClick={this.closeme}>
                    clear
                         </i>
            </div>
        </div>;
    }
}

class HeaderFilterListCheckBoxComp extends React.PureComponent {
    constructor (props) {
        super(props);
        this.filter = this.filter.bind(this);
        this.state = {
            checked: this.props.currentFilter.value1.includes(this.props.item.value)
        };
    }
    componentWillReceiveProps (nextProps) {
        this.setState({
            checked: nextProps.currentFilter.value1.includes(this.props.item.value)
        });
    }

    filter () {
        this.setState({
            checked: !this.state.checked
        }, () => {
            this.props.updateFilter(this.props.item, !this.state.checked);
        });

    }
    render () {
        return (
            <div className="checkBoxRowWrapper">
                <span>
                    <Checkbox key={this.props.item.value} checked={this.state.checked} onChange={this.filter} />
                </span>
                <span className="title" onClick={this.filter}>
                    {this.props.item.title}
                </span>
            </div>
        );
    }
}
// <Checkbox key={this.props.item.value} checked={this.state.checked} onChange={this.filter} />
class HeaderFilterListComp extends React.PureComponent {
    constructor (props) {
        super(props);
        this.closeme = this.closeme.bind(this);
        this.customConfig = S(this.props.appId).getState().customConfig;
        this.currentFilter = null;
        this.columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        this.keysMap = [];
        this.checkList = [];
        this.filterObj = {
            by: this.props.columnKey,
            operator: "in",
            value1: []
        };
        if (this.columnConfig.filterOptions.length !== 0) {
            this.columnConfig.filterOptions.forEach(item => {
                this.keysMap.push({
                    title: item.title,
                    value: item.value
                });
            });
        }
        if (this.columnConfig.actionOptions.length !== 0) {
            this.columnConfig.actionOptions.forEach(item => {
                this.keysMap.push({
                    title: item.title,
                    value: item.value
                });
            });
        }
        this.filterObj.value1 = [...this.keysMap];
        this.keysMap.unshift({
            title: 'All',
            value: 'all'
        });

        if (this.customConfig) {
            this.currentFilter = this.customConfig.getFilterFor(this.props.columnKey);
        }

        if (this.currentFilter) {
            this.filter = new Filter({
                by: this.props.columnKey,
                operator: TYPE_EQUALS,
                value1: this.currentFilter.value1
            });

            this.checkList = this.keysMap.map((ele, key) => {
                return {
                    title: ele.title,
                    key: ele.title === 'All' ? `${this.props.columnKey}_all` : `${ele.title}_${key}`,
                    value: ele.value,
                    checked: ele.title === 'All' ? this.currentFilter.value1.length + 1 === this.keysMap.length : this.currentFilter.value1.includes(ele.value)
                };
            });
        } else {
            this.checkList = this.keysMap.map((ele, key) => {
                return {
                    title: ele.title,
                    key: ele.title === 'All' ? `${this.props.columnKey}_all` : `${ele.title}_${key}`,
                    value: ele.value,
                    checked: true
                };
            });

            this.filter = new Filter(this.filterObj);
            this.currentFilter = this.filter;
        }

        this.state = {
            checkList: this.checkList
        };
    }

    closeme () {
        this.props.onClose();
    }
    checkThis (item) {
        if (item.title === 'All') {
            if (item.checked) {
                this.checkList.forEach(i => {
                    i.checked = false;
                });
            } else {
                this.checkList.forEach(i => {
                    i.checked = true;
                });
            }

        }
        const filterValue = [];
        this.checkList.forEach(j => {
            if (item.title !== 'All' && j.title === item.title) {
                j.checked = !j.checked;
            }
            if (item.title !== 'All' && j.checked) {
                filterValue.push(j.value);
            }
        });
        let uncheck = this.checkList.find((ele, index) => {
            return index !== 0 && ele.checked === false;
        });
        this.checkList[0].checked = !uncheck;


        this.filter = new Filter({
            by: this.props.columnKey,
            operator: "in",
            value1: filterValue
        });

        this.setState({
            checkList: [...this.checkList]
        }, () => {
            this.currentFilter = this.filter;
            S(this.props.appId).setFilter(this.filter);
        });
    }

    render () {
        return (
            <div className="headerListWrapper">
                <div className="headerFilterButtons">
                    <i className="material-icons" onClick={this.closeme}>
                        clear
                    </i>
                </div>
                {
                    this.state.checkList.length !== 0 && this.state.checkList.map((item, index) => {
                        return <div key={item.key} className="checkBoxRowWrapper">
                            <Checkbox checked={item.checked} onChange={() => this.checkThis(item)} />
                            <span className="title" onClick={() => this.checkThis(item)}>
                                {item.title}
                            </span>
                        </div>;
                    })
                }
            </div>
        );
    }
}
// <Checkbox checked={item.checked} onChange={() => this.checkThis(item)} />
class HeaderFilterCompTextHtml extends React.PureComponent {
    constructor (props) {
        super(props);
        this.confirm = this.confirm.bind(this);
        this.closeme = this.closeme.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.customConfig = S(this.props.appId).getState().customConfig;
        this.currentFilter = null;
        if (this.customConfig) {
            this.currentFilter = this.customConfig.getFilterFor(this.props.columnKey);
        }

        if (this.currentFilter) {
            this.filter = new Filter({
                by: this.props.columnKey,
                operator: "contains",
                value1: this.currentFilter.value1
            });
        } else {
            this.filter = new Filter({ by: this.props.columnKey, operator: "contains", value1: "" });
        }

        this.state = {
            focused: false
        };
    }
    onFilterUpdate (filter) {
        S(this.props.appId).setFilter(this.filter);
    }
    confirm () {
        // this.filter.value1 = this.refs.columnInputBox.value;
        // S(this.props.appId).setFilter(this.filter);
        // this.closeme();
    }
    closeme () {
        this.props.onClose();
    }
    onFocus () {
        this.setState({
            focused: true
        });
    }
    onBlur () {
        this.setState({
            focused: false
        });
    }
    render () {
        return (
            <div>
                <div className="filterSearchTitle">Please enter content to search:</div>
                <div className={ClassNames({ filterSearchWrapper: true, focused: this.state.focused })}>
                    <input ref="columnInputBox" placeholder="Search"
                        onFocus={this.onFocus} onBlur={this.onBlur}
                        type="text" defaultValue={this.filter.value1} />
                    <i className="material-icons">search</i>
                </div>
                <div className="headerFilterButtons">
                    <i className="material-icons" onClick={this.confirm}>
                        done
                    </i>
                    <i className="material-icons" onClick={this.closeme}>
                        clear
                    </i>
                </div>
            </div>
        );
    }
}
