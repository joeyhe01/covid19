import * as actionType from "./ActionType";

export const tableSearched = function(term){
    return {
        type: actionType.TABLE_SEARCH,
        payload: term
    };
}

export const gotoScrollPosition =  function(scrollX, scrollY){
    return {
        type: actionType.GOTO_SCROLL_POSITION,
        payload: [scrollX, scrollY]
    };
}

export const setUpdatedScrollPosition = function(scrollX, scrollY){
    return {
        type: actionType.SCROLL_POSITION_UPDATE,
        payload: [scrollX, scrollY]
    };
}

export const setOriginalConfig = function(config){
    return {
        type: actionType.ORIGINAL_CONFIG_UPDATE,
        payload: config
    };
};

export const setDownloadData = function(dataList){
    return {
        type: actionType.SET_DOWNLOAD_DATA,
        payload: dataList
    };
};

export const setUpdatedData = function(dataList) {
    return {
        type: actionType.DATA_UPDATED,
        payload: dataList
    };
};

export const setUpdatedCellData = function(rowKeyVal, columnKey, value){
    return {
        type: actionType.CELL_DATA_UPDATED,
        payload: [rowKeyVal, columnKey, value]
    };
};

export const resizingTable = function(width) {
    return {
        type: actionType.RESIZING,
        payload: width
    };
};

export const setUpdatedConfig = function(config) {
    return {
        type: actionType.CONFIG_UPDATE,
        payload: config
    };
};

export const setCustomConfig = function(config) {
    return {
        type: actionType.CUSTOM_CONFIG_UPDATE,
        payload: config
    };
};

export const setRowAllSelected = function(selected) {
    return {
        type: actionType.ROW_ALL_SELECTED,
        payload: selected
    };
};

export const setRowSelected = function(rowIndex) {
    return {
        type: actionType.ROW_SELECTED,
        payload: rowIndex
    };
};

export const setSingleRowSelected = function(rowIndex) {
    return {
        type: actionType.SINGLE_ROW_SELECTED,
        payload: rowIndex
    };
};

export const setSingleRowSelectedWithKey = function(rowKey){
    return {
        type: actionType.SINGLE_ROW_SELECTED_WITH_KEY,
        payload: rowKey
    }
};

export const setSingleSelectedAction = function(rowIndex, columnKey, newValue) {
    return {
        type: actionType.UPDATE_SINGLE_SELECTED_ACTION,
        payload: [rowIndex, columnKey, newValue]
    };
};

export const setRowActionSelected = function(rowIndex, action) {
    return {
        type: actionType.RAW_ACTION_SELECTED,
        payload: [rowIndex, action]
    };
};

export const setColumnHidden = function(columnKey, hidden) {
    return {
        type: actionType.SET_COLUMN_HIDDEN,
        payload: [columnKey, hidden]
    };
};

export const setColumnsHidden = function(object) {
    return {
        type: actionType.SET_COLUMNS_HIDDEN,
        payload: object
    };
};

export const setColumnSort = function(columnKey) {
    return {
        type: actionType.SORT_COLUMN,
        payload: columnKey
    };
};

export const updateFilter = function(filter) {
    return {
        type: actionType.FILTER_UPDATE,
        payload: filter
    };
};

export const resetFilter = function(){
    return {
        type: actionType.RESET_FILTER
    };
};

export const udpateTheme = function(theme) {
    return {
        type: actionType.UPDATE_THEME,
        payload: theme
    };
};

export const toggleAllRows = function() {
    return {
        type: actionType.TOGGLE_ALL_ROWS
    };
};

export const updatePage = function(page) {
    return {
        type: actionType.PAGE_UPDATE,
        payload: page
    };
};

export const setSelectAllLevel = function(level){
    return {
        type: actionType.SELECT_ALL_LEVEL,
        payload: level
    }
};

export const setTableSearchTerm = function(term){
    return {
        type: actionType.TABLE_SEARCH,
        payload: term
    }
};

export const rowCheckboxChanged = function(rowIndex, selected){
    return {
        type: actionType.CHECKBOX_CHECKED,
        payload: [rowIndex, selected]
    }
};

export const closeAllPopUp = function(){
    return {
        type: actionType.CLOSE_ALL_POPUP
    }
};

export const closeAllFilterPopUp = function(){
    return {
        type: actionType.CLOSE_ALL_FILTER_POPUP
    }
};

export const updateUnClickableCells = function(obj){
    return {
        type: actionType.UNCLICKABLE_CELLS_UPDATED,
        payload: obj
    }
};

export const updateColumnHiddenTemp = function(obj){
    return {
        type: actionType.SET_COLUMNS_HIDDEN_TEMP,
        payload: obj
    }
}
