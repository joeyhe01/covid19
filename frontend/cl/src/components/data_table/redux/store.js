import {
    setUpdatedData,
    resizingTable,
    setUpdatedConfig,
    setCustomConfig,
    setRowAllSelected,
    setRowSelected,
    setRowActionSelected,
    setColumnHidden,
    setColumnSort,
    updateFilter,
    setSingleRowSelected,
    udpateTheme,
    toggleAllRows,
    updatePage,
    setSingleSelectedAction,
    setColumnsHidden,
    setUpdatedCellData,
    setGlobalAll,
    setSelectAllLevel,
    resetFilter,
    setSingleRowSelectedWithKey,
    setDownloadData,
    rowCheckboxChanged,
    closeAllPopUp,
    updateUnClickableCells,
    closeAllFilterPopUp,
    setOriginalConfig,
    setUpdatedScrollPosition,
    gotoScrollPosition,
    tableSearched,
    updateColumnHiddenTemp
} from "./actions";
import DataTableReducer from "./reducer";

class Store {
    constructor(appId, reducer) {
        this.CONFIG_UPDATE = "CONFIG_UPDATE";
        this.DATA_UPDATED = "DATA_UPDATED";
        this.CELL_DATA_UPDATED = "CELL_DATA_UPDATED";
        this.RESIZING = "RESIZING";
        this.CUSTOM_CONFIG_UPDATE = "CUSTOM_CONFIG_UPDATE";
        this.ROW_ALL_SELECTED = "ROW_ALL_SELECTED";
        this.ROW_SELECTED = "ROW_SELECTED";
        this.SINGLE_ROW_SELECTED = "SINGLE_ROW_SELECTED";
        this.RESET_DATA = "RESET_DATA";
        this.RAW_ACTION_SELECTED = "RAW_ACTION_SELECTED";
        this.SET_COLUMN_HIDDEN = "SET_COLUMN_HIDDEN";
        this.SET_COLUMNS_HIDDEN = "SET_COLUMNS_HIDDEN";
        this.SORT_COLUMN = "SORT_COLUMN";
        this.FILTER_UPDATE = "FILTER_UPDATE";
        this.UPDATE_THEME = "UPDATE_THEME";
        this.TOGGLE_ALL_ROWS = "TOGGLE_ALL_ROWS";
        this.PAGE_UPDATE = "PAGE_UPDATE";
        this.UPDATE_SINGLE_SELECTED_ACTION = "UPDATE_SINGLE_SELECTED_ACTION";
        this.ICON_CELL_CLICKED_ACTION = "ICON_CELL_CLICKED_ACTION";
        this.SELECT_ALL_LEVEL = 'SELECT_ALL_LEVEL';
        this.SINGLE_ROW_SELECTED_WITH_KEY = 'SINGLE_ROW_SELECTED_WITH_KEY';

        this.SELECT_ALL_COLUMNS = "SELECT_ALL_COLUMNS";
        this.SELECT_DEFAULT_COLUMNS = "DELECT_DEFAULT_COLUMNS";
        this.TABLE_SEARCH = "TABLE_SEARCH";
        this.SET_DOWNLOAD_DATA = "SET_DOWNLOAD_DATA";
        this.CHECKBOX_CHECKED = "CHECKBOX_CHECKED";
        this.CLOSE_ALL_POPUP = 'CLOSE_ALL_POPUP';
        this.CLOSE_ALL_FILTER_POPUP = 'CLOSE_ALL_FILTER_POPUP';
        this.UNCLICKABLE_CELLS_UPDATED = 'UNCLICKABLE_CELLS_UPDATED';
        this.ORIGINAL_CONFIG_UPDATE = 'ORIGINAL_CONFIG_UPDATE';
        this.SCROLL_POSITION_UPDATE = 'SCROLL_POSITION_UPDATE';
        this.GOTO_SCROLL_POSITION='GOTO_SCROLL_POSITION';
        this.SET_COLUMNS_HIDDEN_TEMP='SET_COLUMNS_HIDDEN_TEMP';

        this._appId = appId;
        this._state = {
            config: null,
            originalDataList: null,
            originalConfig: null, //used to save original table config
            dataList: [],
            customConfig: null,
            width: 0,
            rowAllSelected: false,
            selectedRowKeys: [],
            checkedRowKeys: [],
            rowActionSelected: {},
            allOpened: false,
            defaultColumns: [],
            passedInCellData: null, //used to save passed in cell data, for resetting purpose
            page: null, //this is page object, not number
            globalAll: false,
            selectAllLevel: 0,
            downloadDataList: [],
            globalDownloadConfig: null,
            unClickableCells: {}, // used to define which cells are NOT clickable, key-columnKey, value-[key list]
            scrollPosition: [0,0], //remember previous scrollPosition
            tableSearchedTerm: '',
            columnHiddenTmp: {}, //temprarily save column hidden status before user click save button
        };
        this._listeners = [];
        this._listenersFor = {};
        this._reducer = reducer;

        this.passedBackParams = null;
    }

    getState() {
        return this._state;
    }

    dispatch(action) {
        this._state = this._reducer(this._state, action);
        this._listeners.forEach(listener => listener(this._state));
    }
    subscribe(listener) {
        this._listeners.push(listener);
        //this return is used for return unsubscrib call back for purpose of removing listeners
        return () => {
            getStore(this._appId)._listeners = getStore(this._appId)._listeners.filter(l => l !== listener);
        };
    }

    dispatchFor(type, action) {
        this._state = this._reducer(this._state, action);
        if (type in this._listenersFor)
            this._listenersFor[type].forEach(listener => listener(this._state));
    }
    subscribeTo(type, listener) {
        if (!(type in this._listenersFor)) {
            this._listenersFor[type] = [];
        }
        this._listenersFor[type].push(listener);
        return () => {
            getStore(this._appId)._listenersFor[type] = getStore(this._appId)._listenersFor[type].filter(
                l => l !== listener
            );
        };
    }

    setTotalRecords(total) {
        let page = this._state["page"];
        page.setTotal(total);
        this.dispatchFor(this.PAGE_UPDATE, updatePage(page));
    }

    setUpdatedData(resultsObj, asOriginal = false, overWriteSelectedKeys = true) {
        //UI-2976 - Reset Pre-Selected columns when data is updated
        if (overWriteSelectedKeys) {
            this.setDefaultSelectedRowKeys([]); //clear all pre-selected rowKeys
            setTimeout(() => {
                this.setRowAllSelected(false);
            });
        }

        //handler data input: contains total and dataList field
        if ("total" in resultsObj) {
            let total = resultsObj["total"];
            let page = this._state["page"];
            page.setTotal(total);
            this.dispatchFor(this.PAGE_UPDATE, updatePage(page));
        } else {
            let page = this._state["page"];
            setTimeout(() => {
                this.dispatchFor(this.PAGE_UPDATE, updatePage(page));
            });

        }
        let list = resultsObj["dataList"];

        if (asOriginal) {
            this._state.originalDataList = list;
        }

        this.dispatchFor(this.DATA_UPDATED, setUpdatedData(list));
        this.closeAllPopUp();
    }

    setUpdatedCellValue(rowKey, columnKey, value) {
        this.dispatchFor(this.CELL_DATA_UPDATED, setUpdatedCellData(rowKey, columnKey, value));
    }

    setAppendedData(resultsObj) {
        //handler data input: contains total and dataList field
        if ("total" in resultsObj) {
            let total = resultsObj["total"];
            let page = this._state["page"];
            page.setTotal(total);
            this.dispatchFor(this.PAGE_UPDATE, updatePage(page));
        }
        let list = resultsObj["dataList"];

        this._state.originalDataList = this._state.originalDataList.concat(list);
        list = this._state.dataList.concat(list);
        this.dispatchFor(this.DATA_UPDATED, setUpdatedData(list));
        this.closeAllPopUp();
    }
    setOriginalTableConfig(config) {
        this.dispatchFor(this.ORIGINAL_CONFIG_UPDATE, setOriginalConfig(config));
    }
    setUpdatedTableConfig(config) {
        this.dispatchFor(this.CONFIG_UPDATE, setUpdatedConfig(config));
    }
    setNewTableWidth(width) {
        this.dispatchFor(this.RESIZING, resizingTable(width));
    }
    setCustomConfig(config) {
        this.dispatchFor(this.CUSTOM_CONFIG_UPDATE, setCustomConfig(config));
    }
    setRowAllSelected(allSelected) {
        this.dispatchFor(this.ROW_ALL_SELECTED, setRowAllSelected(allSelected));
    }
    toggleSingleRowSelected(rowIndex) {
        this.dispatchFor(this.SINGLE_ROW_SELECTED, setSingleRowSelected(rowIndex));
    }
    toggleCheckBoxChanged(rowIndex, selected) {
        this.dispatchFor(this.CHECKBOX_CHECKED, rowCheckboxChanged(rowIndex, selected));
    }
    toggleRowSelected(rowIndex) {
        this.dispatchFor(this.ROW_SELECTED, setRowSelected(rowIndex));
    }
    toggleRowSelectedWithKey(rowKey) {
        this.dispatchFor(this.SINGLE_ROW_SELECTED_WITH_KEY, setSingleRowSelectedWithKey(rowKey));
    }
    setRowActionSelected(rowIndex, action) {
        this.dispatchFor(this.RAW_ACTION_SELECTED, setRowActionSelected(rowIndex, action));
    }
    setColumnHidden(columnKey, hidden) {
        this.dispatchFor(this.SET_COLUMN_HIDDEN, setColumnHidden(columnKey, hidden));
    }
    setColumnsHidden(configObj) {
        this.dispatchFor(this.SET_COLUMNS_HIDDEN, setColumnsHidden(configObj));
    }
    setColumnSort(columnKey) {
        this.dispatchFor(this.SORT_COLUMN, setColumnSort(columnKey));
    }
    setFilter(filter) {
        this.dispatchFor(this.FILTER_UPDATE, updateFilter(filter));
    }
    resetFilter() {
        this.dispatchFor(this.FILTER_UPDATE, resetFilter());
    }
    setTheme(theme) {
        this.dispatchFor(this.UPDATE_THEME, udpateTheme(theme));
    }
    toggleAllRows() {
        this.dispatchFor(this.TOGGLE_ALL_ROWS, toggleAllRows());
    }
    updatePage(pageObj) {
        this.dispatchFor(this.PAGE_UPDATE, updatePage(pageObj));
    }
    updateSingleSelectAction(rowIndex, columnKey, newValue) {
        //below is to be returned
        this.passedBackParams = {
            rowIndex: rowIndex,
            columnKey: columnKey,
            newValue: newValue
        };
        this.dispatchFor(this.UPDATE_SINGLE_SELECTED_ACTION, setSingleSelectedAction(rowIndex, columnKey, newValue));
    }
    updateIconDropDownContent(htmlContent) {
        if (this.ICON_CELL_CLICKED_ACTION in this._listenersFor)
            this._listenersFor[this.ICON_CELL_CLICKED_ACTION].forEach(listener => listener(htmlContent));
    }
    triggerSelectAllColumns(selected) {
        if (this.SELECT_ALL_COLUMNS in this._listenersFor)
            this._listenersFor[this.SELECT_ALL_COLUMNS].forEach(listener => listener(selected));
    }
    triggerDefaultColumns(selected) {
        if (this.SELECT_DEFAULT_COLUMNS in this._listenersFor)
            this._listenersFor[this.SELECT_DEFAULT_COLUMNS].forEach(listener => listener(selected));
    }
    resetAll() {
        this._listeners = [];
        this._listenersFor = {};
    }
    setSelectAllLevel(level) {
        this.dispatchFor(this.SELECT_ALL_LEVEL, setSelectAllLevel(level));
    }
    setGlobalSearchTerm(term) {
        this.dispatchFor(this.TABLE_SEARCH, tableSearched(term));
    }
    setDefaultSelectedRowKeys(defaultRowKeys) {
        this._state.selectedRowKeys = defaultRowKeys;
    }
    setDownloadData(dataList) {
        this.dispatchFor(this.SET_DOWNLOAD_DATA, setDownloadData(dataList));
    }
    setGlobalDownloadConfig(cfg) {
        this._state.globalDownloadConfig = cfg;
    }
    setUnClickableCells(obj) { // { colKey: [list of keys] }
        this.dispatchFor(this.UNCLICKABLE_CELLS_UPDATED, updateUnClickableCells(obj));
    }
    closeAllPopUp() {
        this.dispatchFor(this.CLOSE_ALL_POPUP, closeAllPopUp());
    }
    closeAllFilterPopUp() {
        this.dispatchFor(this.CLOSE_ALL_FILTER_POPUP, closeAllFilterPopUp());
    }
    scrollPositionUpdated(scrollX, scrollY){
        this.dispatchFor(this.SCROLL_POSITION_UPDATE, setUpdatedScrollPosition(scrollX, scrollY));
    }
    gotoScrollPosition(scrollX, scrollY){
        this.dispatchFor(this.GOTO_SCROLL_POSITION, gotoScrollPosition(scrollX, scrollY));
    }
    setColumnTempHiddenStatus(obj){
        this.dispatchFor(this.SET_COLUMNS_HIDDEN_TEMP, updateColumnHiddenTemp(obj));
    }
}

let store;
const getStore = appId => {
    if (!store) {
        store = {};
    }
    if (!(appId in store)) store[appId] = new Store(appId, DataTableReducer);

    return store[appId];
};

export default getStore;
