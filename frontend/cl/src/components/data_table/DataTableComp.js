import React, { Component } from "react";
import TableComp from "./comps/TableComp";
import PropTypes from "prop-types";
import S from "./redux/store";
import TableService from "./services/table_service";
import Page from "./entities/page";
import utils from "../common/utils";

import ClassNames from "classnames";
require("./datatable.scss");

class DataTableComp extends Component {
    constructor(props) {
        super(props);
        this.bindingFunctions();
        this.service = new TableService();
        this.store = S(this.props.appId);
        this.jumpToRowIndex = 0;

        if (this.props.config) {
            this.store.setOriginalTableConfig(this.service.genenerateTableConfig(this.props.config));
            this.store.setUpdatedTableConfig(this.service.genenerateTableConfig(this.props.config));
            //create page obj in store
            this.store.updatePage(new Page(this.props.config));
        }

        if (this.props.selectedRowKeys){
            this.store.setRowAllSelected(false);
            this.props.selectedRowKeys.forEach(rowKey=>{
                this.store.toggleRowSelectedWithKey(rowKey);
            });
        }

        if(this.props.unClickableCells){
            this.store.setUnClickableCells(this.props.unClickableCells);
        }

        if (this.props.data) {
            //set as original dataList
            this.store.setUpdatedData(this.props.data, true, false);
        }

        //next, we need to upgrade the columnType from text to list - this step is automatically done, and on column level
        //to gain performance
        this.service.upgradeConfig(this.store.getState().config, this.store.getState().dataList);

        let cfg = this.props.customConfig || null;
        //use previous saved totalDataFields to check if we need to reset customerConfig, if fields are not same, then ignore customer config here
        if( cfg && 'totalDataFields' in cfg
            &&  cfg['totalDataFields']!==this.store.getState().config.columns.length ){
                cfg['columnsOrder']=[];
                let customerConfig = this.service.genenerateCustomConfig(cfg);
                this.store.setCustomConfig(customerConfig);
        }else{
            let customerConfig = this.service.genenerateCustomConfig(cfg);
            this.store.setCustomConfig(customerConfig);
            //next we need to update table config based on customerConfig
            this.store.setUpdatedTableConfig(
                this.service.mergeCustomerConfig(this.store.getState().config, customerConfig)
            );
        }


        //if there are sorter/filter, we need to do here
        this._sortFilterDatatNoDispatch(false);

        //we now need to get rowIndex based on selectedRow
        if (this.props.selectedRowKeys){
            this.jumpToRowIndex = this.service.findRowIndexFromRowKeyValue(
                this.props.selectedRowKeys[0],
                this.store.getState()
            );
        }
    }

    selectedRowKeysUpdated(selectedRowKeys){
        this.store.setRowAllSelected(false);
        selectedRowKeys.forEach(rowKey=>{
            this.store.toggleRowSelectedWithKey(rowKey);
        });
        //enforce window resize event to make UI updates
        window.dispatchEvent(new Event('resize'));
    }

    setUnClickableCells(unClickableCells){
        this.store.setUnClickableCells(unClickableCells);
    }

    setDownloadData(dataList){
        this.store.setDownloadData(dataList);
    }

    totalTitleUpdated(totalTitle){
        const cfg = this.store.getState().config;
        cfg['totalTitle'] = totalTitle;
        this.store.setUpdatedTableConfig(cfg);
    }

    //below methods are externally callable, used to udpate data directly
    dataUpdated(updatedDataObj) {
        //we need to update with empty data first, so that all the dropdown/checkbox will be resetted
        S(this.props.appId).setUpdatedData({ dataList: [] }, true);
        S(this.props.appId).setUpdatedData(updatedDataObj, true);
        //if there are sorter/filter, we need to do here
        this._sortFilterDatatNoDispatch(true);
        this._scrollTo();
    }

    dataUpdatedSelectNoChange(updatedDataObj) {
        //we do not want to overwrite preivously selected row keys, just append data here
        S(this.props.appId).setUpdatedData({ dataList: [] }, true, false);
        S(this.props.appId).setUpdatedData(updatedDataObj, true, false);
        //if there are sorter/filter, we need to do here
        this._sortFilterDatatNoDispatch(false);
        this._scrollTo();
    }

    _scrollTo(){
        this.store.gotoScrollPosition(this.store.getState().scrollPosition[0], this.store.getState().scrollPosition[1]);
    }

    setTotalRecords(total){
        S(this.props.appId).setTotalRecords(total);
    }

    _sortFilterDatatNoDispatch(overWriteSelectedKeys=true){
        if( !this.store.getState().config.global && (this.store.getState().customConfig.sorter || this.store.getState().customConfig.filters)){
            let dataList = this.service.sortFilterData(this.store.getState());
            S(this.props.appId).setUpdatedData({ dataList: dataList }, false, overWriteSelectedKeys);
        }
    }

    cellDataUpdate(rowKeyVal, columnKey, value) {
        S(this.props.appId).setUpdatedCellValue(rowKeyVal, columnKey, value);
    }
    dataAppended(updatedDataObj) {
        S(this.props.appId).setAppendedData(updatedDataObj);
    }
    updateIconDropDown(htmlContent) {
        S(this.props.appId).updateIconDropDownContent(htmlContent);
    }
    themeUpdate(theme) {
        S(this.props.appId).setTheme(theme);
    }
    toggleAllRows() {
        S(this.props.appId).toggleAllRows();
    }
    resetPage() {
        this.store.getState().page.reset();
        let page = this.store.getState().page;
        page.reset();
        S(this.props.appId).updatePage(page);
    }
    bindingFunctions() {
        this._updateWidth = this._updateWidth.bind(this);
        this._onCustomConfigUpdate = this._onCustomConfigUpdate.bind(this);
        this._onSelectedRowChanged = this._onSelectedRowChanged.bind(this);
        this._onRowActionSelected = this._onRowActionSelected.bind(this);
        this._onSortFilterData = this._onSortFilterData.bind(this);
        this._onSingleActionUpdated = this._onSingleActionUpdated.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this._onSelectAllLevel = this._onSelectAllLevel.bind(this);
        this._onTableSearch = this._onTableSearch.bind(this);
        this._onCheckBoxChanged=this._onCheckBoxChanged.bind(this);
    }

    componentDidMount() {
        var win = window;
        if (win.addEventListener) {
            win.addEventListener("resize", this._updateWidth, false);
        } else if (win.attachEvent) {
            win.attachEvent("onresize", this._updateWidth);
        } else {
            win.onresize = this._updateWidth;
        }
        win.addEventListener('click', this._toggleClickOutside.bind(this), false);

        //emulate to have full width
        win.dispatchEvent(new Event("resize"));

        //now, let's set up listener to customConfigUpdate
        this.store.subscribeTo(this.store.CUSTOM_CONFIG_UPDATE, state => {
            this._onCustomConfigUpdate();
        });
        this.store.subscribeTo(this.store.ROW_ALL_SELECTED, state => {
            this._onSelectedRowChanged();
        });
        this.store.subscribeTo(this.store.ROW_SELECTED, state => {
            this._onSelectedRowChanged();
        });
        this.store.subscribeTo(this.store.SINGLE_ROW_SELECTED, state => {
            this._onSelectedRowChanged();
        });
        this.store.subscribeTo(this.store.CHECKBOX_CHECKED, state => {
            this._onCheckBoxChanged();
        });
        this.store.subscribeTo(this.store.RAW_ACTION_SELECTED, state => {
            this._onRowActionSelected();
        });
        this.store.subscribeTo(this.store.SORT_COLUMN, state => {
            this._onSortFilterData();
        });
        this.store.subscribeTo(this.store.FILTER_UPDATE, state => {
            this._onSortFilterData();
        });
        this.store.subscribeTo(this.store.UPDATE_THEME, () => {
            this.setState({
                config: this.store.getState().config
            });
        });
        this.store.subscribeTo(this.store.UPDATE_SINGLE_SELECTED_ACTION, () => {
            this._onSingleActionUpdated();
        });
        this.store.subscribeTo(this.store.SELECT_ALL_LEVEL, () => {
            this._onSelectAllLevel();
        });
        this.store.subscribeTo(this.store.TABLE_SEARCH, state => {
            this._onTableSearch(state.tableSearchedTerm);
        });
    }
    componentWillUnmount() {
        var win = window;
        if (win.removeEventListener) {
            win.removeEventListener("resize", this._updateWidth, false);
        } else if (win.detachEvent) {
            win.detachEvent("onresize", this._updateWidth);
        }
        this.store.resetAll();
    }


    //this is to close all the tether component automatically
    _toggleClickOutside(event) {
        var excludedElement = document.querySelector(".dvClPopUpWrapper");
        var selectedElement = excludedElement ? excludedElement.contains(event.target) : false;
        if (!selectedElement) {
            this.closeAllPopUp();
            this.closeAllFilterPopUp();
        }
    }

    closeAllPopUp(){
        this.store.closeAllPopUp();
    }

    closeAllFilterPopUp(){
        this.store.closeAllFilterPopUp();
    }

    //belows are callback methods
    _onCheckBoxChanged() {
        if (this.props.onCheckBoxChanged) {
            this.props.onCheckBoxChanged(this.store.getState().checkedRowKeys);
        }
    }
    _onSelectAllLevel() {
        //needs debounce here as multiple events are triggered together.
        utils._debounce(() => {
            if (this.props.onSelectAllLevel) {
                this.props.onSelectAllLevel(this.store.getState().selectAllLevel);
            }
        }, 100);
    }

    _onSingleActionUpdated() {
        if (this.props.onSingleActionUpdated) {
            let params = this.store.passedBackParams;
            params["rowKeyVal"] = this.store.getState().rowkeyVal;
            params["oldValue"] = this.store.getState().oldValue;
            params["oldColumnKey"] = this.store.getState().oldColumnKey;
            this.props.onSingleActionUpdated(params);
        }
    }

    _onCustomConfigUpdate() {
        utils._debounce(() => {
            if (this.props.onCustomConfigUpdate) {
                const cfg = this.store.getState().customConfig;
                cfg['totalDataFields'] = this.store.getState().config.columns.length;
                this.props.onCustomConfigUpdate(this.store.getState().customConfig);
            }
        }, 200);
    }
    _onSelectedRowChanged() {
        if (this.props.onSelectedRowChanged) {
            this.props.onSelectedRowChanged(this.store.getState().selectedRowKeys);
        }
    }
    _onRowActionSelected() {
        if (this.props.onRowActionSelected) {
            this.props.onRowActionSelected(this.store.getState().rowActionSelected);
        }
    }
    _onSortFilterData() {
        if (this.store.getState().config.global) {
            //first we need to reset page
            this.resetPage();
            if (this.props.onSortingFiltering) {
                this.props.onSortingFiltering(
                    this.store.getState().customConfig.sorter,
                    this.store.getState().customConfig.filters
                );
            }
        } else {
            let dataList = this.service.sortFilterData(this.store.getState());
            S(this.props.appId).setUpdatedData({ dataList: [] });
            setTimeout(()=>{
                S(this.props.appId).setUpdatedData({ dataList: dataList });
            });
        }
        //finally, we need to call back customConfig update
        this._onCustomConfigUpdate();
    }

    _onTableSearch(term) {
        if (this.store.getState().config.global) {
            //this is global level table search, not supportd now
        } else {
            let dataList = this.service.searchWholeData(this.store.getState(), term);
            S(this.props.appId).setUpdatedData({ dataList: [] });
            setTimeout(()=>{
                S(this.props.appId).setUpdatedData({ dataList: dataList });
            });
        }
    }

    _updateWidth() {
        S(this.props.appId).setNewTableWidth(document.querySelector('.dv_table_cl').offsetWidth);
    }

    render() {
        return (
            <div
                className={ClassNames({
                    dv_table_cl: true,
                    noir: this.store.getState().config.theme == "noir",
                    light: this.store.getState().config.theme == "light"
                })}
                >
                <TableComp {...this.props} scrollToRow={this.jumpToRowIndex}/>
            </div>
        );
    }
}

DataTableComp.propTypes = {
    appId: PropTypes.string,
    config: PropTypes.object,
    data: PropTypes.object,
    customConfig: PropTypes.object,
    onCustomConfigUpdate: PropTypes.func,
    onSelectedRowChanged: PropTypes.func,
    onRowExpandedContent: PropTypes.func,
    onNextPageHandler: PropTypes.func,
    onGotoPage: PropTypes.func,
    onRowActionSelected: PropTypes.func,
    onSortingFiltering: PropTypes.func,
    onNavigate: PropTypes.func,
    onSingleActionUpdated: PropTypes.func,
    onSelectAllLevel: PropTypes.func,
    onCellClicked: PropTypes.func,
    selectedRowKeys: PropTypes.array,
    onListItemClick: PropTypes.func,
    onGlobalDownload: PropTypes.func,
};

DataTableComp.defaultProps = {
    appId: "",
    config: null,
    data: null,
    customConfig: null,
    onCustomConfigUpdate: null,
    onSelectedRowChanged: null,
    onRowExpandedContent: null,
    onNextPageHandler: null,
    onGotoPage: null,
    onRowActionSelected: null,
    onSortingFiltering: null,
    onNavigate: null,
    onSingleActionUpdated: null,
    onSelectAllLevel: null,
    onCellClicked: null,
    selectedRowKeys: [],
    onListItemClick: null,
    onGlobalDownload: null
};

export default DataTableComp;
