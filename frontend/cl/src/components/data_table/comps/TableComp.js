import { Table, Column, Cell } from "fixed-data-table-2";
import React, { Component } from "react";
import ClassNames from "classnames";
import S from "../redux/store";

import {
    CellWrapper,
    ColumnCheckBoxCell,
    ColumnHeaderCheckBoxCell,
    CollapseCell,
    NavigateCell,
    SingleSelectActionCell,
    CollapseHeaderCell,
    ColumnRadioButtonCell
} from "./cells/cells";
import { HeaderCell } from "./cells/headercell";
import SettingComp from "./SettingComp";
import PaginatorComponent from "./PaginatorComp";
import TableService from "../services/table_service";
import { TYPE_SINGLE_SELECT_ACTIONS } from "../entities/column";
import SelectAllIndicatorComponent from "./SelectAllIndicatorComp";
import ClearFilterComp from "./ClearFilterComp";
import TableSearchComp from "./TableSearchComp";
import DownloadComp from './DownloadComp';

require("fixed-data-table-2/dist/fixed-data-table.css");
require("../datatable.scss");

class TableComp extends Component {
    constructor(props) {
        super(props);
        this.bindingFunctions();
        this.service = new TableService();
        this.store = S(this.props.appId);
        this.tableConfig = this.store.getState().config;
        this.page = this.store.getState().page;
        this.autoScrolling = false;

        var columnWidths = {};
        this.tableConfig.columns.forEach(column => {
            columnWidths[column.key] = column.width;
        });

        this.state = {
            dataList: this.store.getState().dataList,
            columns: this.tableConfig.columns,
            width: this.tableConfig.width,
            height: this.tableConfig.height,
            columnWidths: columnWidths,
            config: this.tableConfig,
            //the default order should be based on presaved vs default
            columnsOrder: this.service.getColumnsOrderFromState(this.store.getState()),
            collapsedRows: new Set(),
            expandedRows: new Set(),
            selectAllLevel: 0,
            scrollToRow: this.props.scrollToRow,
            scrollTop: this._getScrollTopValue(this.props.scrollToRow)
        };

        this.unSubscribeConfig = this.store.subscribeTo(this.store.CONFIG_UPDATE, () => {
            let stateObj = {};
            stateObj["config"] = this.store.getState().config;
            this.setState(stateObj);
        });

        this.unSubscribeData = this.store.subscribeTo(this.store.DATA_UPDATED, () => {
            let stateObj = {};
            stateObj["dataList"] = this.store.getState().dataList;
            this.setState(stateObj);
        });

        this.unSubscribeCellData = this.store.subscribeTo(this.store.CELL_DATA_UPDATED, () => {
            let stateObj = {};
            stateObj["dataList"] = this.store.getState().dataList;
            this.setState(stateObj);
        });

        this.unSubscribeResizing = this.store.subscribeTo(this.store.RESIZING, () => {
            let stateObj = {};
            stateObj["width"] = this.store.getState().width;
            this.setState(stateObj);
        });
        this.unSubscribeColumnHidden = this.store.subscribeTo(this.store.SET_COLUMNS_HIDDEN, () => {
            let stateObj = {};
            stateObj["config"] = this.store.getState().config;
            this.setState(stateObj);
            this._customerConfigUpdate(null);
        });

        this.unSubscriberSelectAllLevel = this.store.subscribeTo(this.store.SELECT_ALL_LEVEL, () => {
            this._onSelectAllLevel();
        });

        this.unSubscribeScrollTo = this.store.subscribeTo(this.store.GOTO_SCROLL_POSITION, () => {
            this.autoScrolling = true;
            setTimeout(()=>{
                this.autoScrolling = false;
            }, 2000);
            this._scrollTo();
        });
    }

    _getScrollTopValue(rowIndex){
        let value = rowIndex*this.store.getState().config.rowHeight;
        return value;
    }

    //we must unsubscribe to avoid memory leak here
    componentWillUnmount() {
        this.unSubscribeData();
        this.unSubscribeResizing();
        this.unSubscribeColumnHidden();
        this.unSubscribeThemeUpdate();
        this.unSubscribeCellData();
        this.unSubscriberSelectAllLevel();
        this.unSubscribeConfig();
        this.unSubscribeScrollTo();
    }

    bindingFunctions() {
        this._onColumnResizeEndCallback = this._onColumnResizeEndCallback.bind(this);
        this._onColumnReorderEndCallback = this._onColumnReorderEndCallback.bind(this);
        this._handleCollapseClick = this._handleCollapseClick.bind(this);
        this._subRowHeightGetter = this._subRowHeightGetter.bind(this);
        this._rowExpandedGetter = this._rowExpandedGetter.bind(this);
        this._onScrollEndCallBack = this._onScrollEndCallBack.bind(this);
        this.onOrderChanged = this.onOrderChanged.bind(this);
        this._onRowClick = this._onRowClick.bind(this);
        this._rowClassNameGetter = this._rowClassNameGetter.bind(this);
        this.rowHeightGetter = this.rowHeightGetter.bind(this);
        this._handleCollapseAllClick = this._handleCollapseAllClick.bind(this);
        this._onSelectAllLevel = this._onSelectAllLevel.bind(this);
        this._scrollTo = this._scrollTo.bind(this);
    }

    _scrollTo(){
        this.setState({
            scrollTop: this._getScrollTopValue(this.store.getState().scrollPosition[1])
        });
    }
    _onSelectAllLevel() {
        this.setState({
            selectAllLevel: this.store.getState().selectAllLevel
        });
    }
    _customerConfigUpdate(newColumnOrder) {
        //now, we need to dispatch this so that it can be saved in backend db
        let customConfig = this.store.getState().customConfig;
        //set new columnsOrder
        if (newColumnOrder) customConfig.setColumnsOrder(newColumnOrder);
        //set hiddenColumns
        customConfig.setHiddenColumns(this.store.getState().config.getHiddenColumnKeys());
        //now dispatchEvent
        this.store.setCustomConfig(customConfig);
    }

    _onColumnResizeEndCallback(newColumnWidth, columnKey) {
        let columnWidths = this.state.columnWidths;
        columnWidths[columnKey] = newColumnWidth;
        this.setState({ columnWidths: columnWidths });

        let customConfig = this.store.getState().customConfig;
        customConfig.setColumnWidths(columnWidths);
        //now dispatchEvent
        this.store.setCustomConfig(customConfig);
    }
    onOrderChanged(newOrder) {
        this.setState({
            columnsOrder: newOrder
        });
        //we need to new update customer Config and dispatch event!
        this._customerConfigUpdate(newOrder);
    }
    _onColumnReorderEndCallback(event) {
        let newColsOrder = this.service.getNewColumnOrder(
            this.state.columnsOrder,
            event.reorderColumn,
            event.columnAfter
        );
        this.onOrderChanged(newColsOrder);
    }

    _handleCollapseClick(rowIndex) {
        const { collapsedRows } = this.state;
        const shallowCopyOfCollapsedRows = new Set([...collapsedRows]);
        let scrollToRow = rowIndex;
        if (shallowCopyOfCollapsedRows.has(rowIndex)) {
            shallowCopyOfCollapsedRows.delete(rowIndex);
        } else {
            shallowCopyOfCollapsedRows.add(rowIndex);
        }

        this.setState({
            collapsedRows: shallowCopyOfCollapsedRows
        });
    }

    _subRowHeightGetter(index) {
        //this is for subRow only - collapsedRow
        if (this.state.config.rowCollapseable)
            return this.state.collapsedRows.has(index) ? this.state.config.collapseRowHeight : 0;
        else return 0;
    }

    _rowExpandedGetter({ rowIndex, width, height }) {
        if (this.state.config.rowCollapseable) {
            //only for collapsed row, not for expanded rows
            if (!this.state.collapsedRows.has(rowIndex)) {
                return null;
            }
            if (this.props.onRowExpandedContent) {
                return this.props.onRowExpandedContent(
                    rowIndex,
                    this.service.getRowKeyValFromIndex(rowIndex, this.store.getState()),
                    width,
                    height
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    rowHeightGetter(rowIndex) {
        if (this.state.config.rowExpandable && this.state.collapsedRows.has(rowIndex)) {
            //here we need to calculate the highest cells
            return this.service.getRowActualHeight(
                this.state.columnWidths,
                rowIndex,
                this.state.dataList,
                this.state.config.rowHeight,
                this.state.config
            );
        } else {
            return this.state.config.rowHeight;
        }
    }
    _onScrollEndCallBack(scrollX, scrollY) {

        if(this.autoScrolling) return;

        if (!this.state.config.enablePaginator) {
            var totalHeight = this.state.config.rowHeight * (this.state.dataList.length - 1);
            if (scrollY + this.state.config.height >= totalHeight && this.props.onNextPageHandler) {
                //now update page config
                this.page.next();
                //if we have all the data in dataList, no need to trigger anymore
                if ("onNextPageHandler" in this.props && this.state.dataList.length < this.page.total) {
                    this.props.onNextPageHandler(this.page.currentPage);
                }
            }
        }
        //here, we are converting scrollY to selectedRowIndex, so as to re-use the scrollToRow controller
        this.store.scrollPositionUpdated(scrollX, (scrollY)/this.state.config.rowHeight);
    }

    _onRowClick(e, rowIndex) {
        //when decoupling checkbox and row, we always enforce single row select
        if (this.state.config.deCoupleRowSelectAndCheckbox) {
            this.store.toggleSingleRowSelected(rowIndex);
        } else {
            //here, we must prevent double trigger, as checkBox click also dispatch events
            const targetCheckbox = e.target.className.includes("mdl-checkbox");
            const targetRadio = e.target.className.includes("mdl-radio");
            if ((this.state.config.enableCheckBox && !targetCheckbox)
                || (this.state.config.enableRadioButton && !targetRadio)) {
                this.store.toggleRowSelected(rowIndex);
            } else if (this.state.config.singleRowToggleable && !targetCheckbox && !targetRadio) {
                this.store.toggleSingleRowSelected(rowIndex);
            }
        }
        setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 0);
    }

    _rowClassNameGetter(rowIndex) {

        let rowClassNames = [];

        if ('onRowClassNameGetter' in this.props) {
            //here,we need to pass back key column value, not rowIndex, as it is always changing
            rowClassNames.push(this.props.onRowClassNameGetter(
                this.service.getRowKeyValFromIndex(rowIndex, this.store.getState())
            ));
        }

        if (this.state.config.singleRowToggleable || this.state.config.enableCheckBox || this.state.config.enableRadioButton) {
            if (this.service.isRowSelected(rowIndex, this.store.getState())) {
                rowClassNames.push((this.state.config.theme ? this.state.config.theme : "") + "rowSelected");
            }
        }

        return rowClassNames.join(' ');
    }

    _handleCollapseAllClick(open) {
        let rowIndexes = new Set();
        if (open)
            for (let i = 0; i < this.state.dataList.length; i++) {
                rowIndexes.add(i);
            }
        this.setState({
            collapsedRows: rowIndexes
        });
    }

    render() {
        let checkColumn = null;
        let collapseColumn = null;
        let expandableColumn = null;
        let controllerColumn = null;
        let navigateColumn = null;

        if (this.state.config.navigateable) {
            navigateColumn = (
                <Column
                    width={50}
                    fixedRight={true}
                    cell={<NavigateCell {...this.props} dataList={this.state.dataList} />}
                />
            );
        }

        if (this.state.config.enableCheckBox) {
            checkColumn = (
                <Column
                    width={35}
                    fixed={true}
                    header={<ColumnHeaderCheckBoxCell appId={this.props.appId} />}
                    cell={<ColumnCheckBoxCell {...this.props} dataList={this.state.dataList} />}
                />
            );
        }

        if (this.state.config.enableRadioButton) {
            checkColumn = (
                <Column
                    width={35}
                    fixed={true}
                    cell={<ColumnRadioButtonCell {...this.props} dataList={this.state.dataList} />}
                />
            );
        }

        //expandable is having high priority than collapseable
        if (this.state.config.rowCollapseable || this.state.config.rowExpandable) {
            collapseColumn = (
                <Column
                    cell={
                        <CollapseCell
                            {...this.props}
                            callback={this._handleCollapseClick}
                            collapsedRows={this.state.collapsedRows}
                            dataList={this.state.dataList}
                        />
                    }
                    header={<CollapseHeaderCell {...this.props} callback={this._handleCollapseAllClick} />}
                    fixed={true}
                    width={35}
                />
            );
        }

        return (
            <div className="tableWrapper" style={{ height: 60 + this.state.height }}>
                <div className="tableHead">
                    <div className="tableHeaderHead">
                        {this.state.config.totalTitle && <div className='totalTitle'>{this.state.config.totalTitle}</div>}
                    </div>
                    <div className="tableHeaderTail">
                        {this.state.config.downloadable && <DownloadComp {...this.props} />}
                        { (!this.state.config.global || this.state.config.enforceResetFilterBtn) && <ClearFilterComp {...this.props} />}
                        <PaginatorComponent {...this.props} />
                        {this.state.config.tableSearch && <TableSearchComp {...this.props} />}
                        {!this.state.config.hideSetting && <SettingComp {...this.props} onOrderChanged={this.onOrderChanged} />}
                    </div>
                </div>
                {this.state.config.enableAllGlobalSelector && <SelectAllIndicatorComponent {...this.props} />}
                <div className={ClassNames({
                    tableBody: true,
                    listView: this.state.config.listView,
                    tableGlobalAll: this.state.selectAllLevel > 0
                })}>
                    <Table
                        rowHeight={this.state.config.rowHeight}
                        headerHeight={this.state.config.headerHeight}
                        rowsCount={this.state.dataList.length}
                        width={this.state.width}
                        height={this.state.height}
                        isColumnResizing={false}
                        onColumnResizeEndCallback={this._onColumnResizeEndCallback}
                        isColumnReordering={false}
                        onColumnReorderEndCallback={this._onColumnReorderEndCallback}
                        subRowHeightGetter={this._subRowHeightGetter}
                        rowExpanded={this._rowExpandedGetter}
                        onRowClick={this._onRowClick}
                        rowClassNameGetter={this._rowClassNameGetter}
                        onScrollEnd={this._onScrollEndCallBack}
                        rowHeightGetter={this.rowHeightGetter}
                        scrollTop = {this.state.scrollTop}
                    >
                        {collapseColumn}
                        {checkColumn}
                        {this.state.columnsOrder.map((columnKey, i) => {
                            //if column is hidden
                            let columnConfig = this.state.config.getColumnConfig(columnKey);
                            if (this.state.config.columnHidden(columnKey)) {
                                return null;
                            } else if (columnConfig.type === TYPE_SINGLE_SELECT_ACTIONS) {
                                //put here to guarantee the rowIndex into the cell so as to avoid the recycling cells
                                return (
                                    <Column
                                        isReorderable={columnConfig.reordable}
                                        columnKey={columnKey}
                                        key={i + Math.random()}
                                        header={<HeaderCell {...this.props} columnKey={columnKey} />}
                                        cell={<SingleSelectActionCell {...this.props} columnKey={columnKey} />}
                                        fixedRight={columnConfig.fixedRight}
                                        width={this.state.columnWidths[columnKey]}
                                        isResizable={columnConfig.resizable}
                                        flexGrow={columnConfig.flexGrow}
                                        fixed={columnConfig.fixed}
                                        minWidth={columnConfig.minWidth}
                                    />
                                );
                            } else
                                return (
                                    <Column
                                        isReorderable={columnConfig.reordable}
                                        columnKey={columnKey}
                                        key={i + Math.random()}
                                        header={<HeaderCell {...this.props} columnKey={columnKey} />}
                                        cell={
                                            <CellWrapper
                                                {...this.props}
                                                columnKey={columnKey}
                                                dataList={this.state.dataList}
                                                collapsedRows={this.state.collapsedRows}
                                            />
                                        }
                                        fixedRight={this.state.config.getColumnConfig(columnKey).fixedRight}
                                        width={this.state.columnWidths[columnKey]}
                                        isResizable={this.state.config.getColumnConfig(columnKey).resizable}
                                        flexGrow={this.state.config.getColumnConfig(columnKey).flexGrow}
                                        fixed={this.state.config.getColumnConfig(columnKey).fixed}
                                    />
                                );
                        })}
                        {controllerColumn}
                        {navigateColumn}
                    </Table>
                </div>
            </div>
        );
    }
}
export default TableComp;
