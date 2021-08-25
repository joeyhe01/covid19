import React, { Component } from "react";
import TableService from "../services/table_service";
import S from "../redux/store";

export default class SelectAllIndicatorComponent extends Component {
    constructor() {
        super();
        this.state = {
            selectedRowsCount: 0,
            selectLevel: 0 //0,1,2,3 - 0:noSelection, 1:notAll, 2:pageLevelAll, 3:globalLevelAll
        };
        this.service = new TableService();
        this._setSelected = this._setSelected.bind(this);
        this.toggleSelectAll = this.toggleSelectAll.bind(this);
    }
    componentDidMount() {
        this.store = S(this.props.appId);
        this.unsubsriberAllSelected = this.store.subscribeTo(this.store.ROW_ALL_SELECTED, () => {
            this._setSelected();
        });
        this.unsubsriberSingleSelected = this.store.subscribeTo(this.store.ROW_SELECTED, () => {
            this._setSelected();
        });
    }
    componentWillUnmount() {
        this.unsubsriberAllSelected();
        this.unsubsriberSingleSelected();
    }
    _setSelected() {
        let state = this.store.getState();
        const isAllRowSelected = this.service.isAllRowSelected(
            state.dataList,
            state.config,
            state.selectedRowKeys
        );
        let level = 0;
        if (isAllRowSelected) {
            level = (state.selectedRowKeys.length === state.page.total) ? 3 : 2;
        } else if (state.selectedRowKeys.length > 0) {
            level = 1;
        }
        this.setState({ selectLevel: level, selectedRowsCount: state.selectedRowKeys.length });
        this.store.setSelectAllLevel(level);
    }
    toggleSelectAll() {
        this.setState({
            selectLevel: this.state.selectLevel === 3 ? 0 : 3
        });
        setTimeout(() => {
            if (this.state.selectLevel === 0) {
                this.store.setRowAllSelected(false);
                this.store.toggleRowSelected(-1);
                window.dispatchEvent(new Event("resize"));
            }
            this.store.setSelectAllLevel(this.state.selectLevel);
        }, 0);
    }

    render() {
        let comp = null;
        if (this.state.selectLevel === 1) {
            comp = (
                <div>
                    {this.state.selectedRowsCount} records selected.
                </div>
            );
        } else if (this.state.selectLevel === 2) {
            comp = (
                <div>
                    All {this.state.selectedRowsCount} records on this page are selected.
                    <span className="spanAllIndicator" onClick={this.toggleSelectAll}>
                        Select all {this.store.getState().page.total} records
                    </span>
                </div>
            );
        } else if (this.state.selectLevel === 3) {
            comp = (
                <div>
                    All {this.store.getState().page.total} records are selected.
                    <span className="spanAllIndicator" onClick={this.toggleSelectAll}>
                        Clear selection
                    </span>
                </div>
            );
        }

        return <div className="selectAllWrapper">{comp}</div>;
    }
}
