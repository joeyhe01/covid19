import Table from "../entities/table";
import CustomConfig from "../entities/custom_config";
import {
    ORDER_ASC,
    ORDER_DESC,
    ORDER_NONE,
    TYPE_CONTAINS,
    TYPE_EQUALS,
    TYPE_GREATER_OR_EQUAL,
    TYPE_LESS_OR_EQUAL,
    TYPE_BETWEEN,
    TYPE_IN
} from "../entities/custom_config";
import {
    TYPE_TEXT,
    TYPE_LIST,
    TYPE_HTML,
    TYPE_HTML_LIST
} from "../entities/column";
export default class TableService {
    getAvailableListResult(dataList, tableConfig) {
        if (tableConfig.global) return {};
        let colListObj = {};
        tableConfig.columns.forEach(column => {
            console.log(column.type);
            if (column.type === TYPE_LIST) {
                let options = [];
                dataList.forEach(row => {
                    if (!options.includes(row[column.key])) {
                        options.push(row[column.key]);
                    }
                });
                colListObj[column.key] = options;
            }
        });
        return colListObj;
    }

    genenerateTableConfig(rawConfig) {
        return new Table(rawConfig);
    }

    genenerateCustomConfig(customConfig) {
        return new CustomConfig(customConfig);
    }

    getNewColumnOrder(originalColumnOrders, reorderColumn, columnAfter) {
        let columnsOrder = originalColumnOrders.filter(key => {
            return key !== reorderColumn;
        });
        if (columnAfter) {
            var index = columnsOrder.indexOf(columnAfter);
            columnsOrder.splice(index, 0, reorderColumn);
        } else {
            columnsOrder.push(reorderColumn);
        }
        return columnsOrder;
    }

    getColumnsOrder(tableConfig, customConfig) {
        if (customConfig && "columnsOrder" in customConfig && customConfig.columnsOrder.length > 0) {
            return customConfig.columnsOrder;
        } else {
            return tableConfig.getColumnsOrder();
        }
    }



    getNoneStickyColumnsOrder(tableConfig, customConfig, originalTableConfig) {
        let colOrders = [];
        if (customConfig && "columnsOrder" in customConfig && customConfig.columnsOrder.length > 0) {
            colOrders = customConfig.columnsOrder;
        } else {
            colOrders = tableConfig.getColumnsOrder();
        }
        //let's remove fixed ones
        colOrders = JSON.parse(JSON.stringify(colOrders));
        tableConfig.columns.forEach(col => {
            const originalColumnConfig = originalTableConfig.getColumnConfig(col.key);
            if(!colOrders.includes(col.key)){
                colOrders.push(col.key);
            }
            if ((col.fixed || col.fixedRight || originalColumnConfig.hidden && originalColumnConfig.primaryKey) && colOrders.includes(col.key)) {
                colOrders.splice(colOrders.indexOf(col.key), 1);
            }
        });
        return colOrders;
    }

    getVisibleColumnsOrder(tableConfig, customConfig) {
        if (customConfig && "columnsOrder" in customConfig && customConfig.columnsOrder.length > 0) {
            return customConfig.columnsOrder;
        } else {
            return tableConfig.getVisibleColumnsOrder();
        }
    }

    getColumnsOrderFromState(state) {
        return this.getColumnsOrder(state.config, state.customConfig);
    }

    getNoneStickyColumnsOrderFromState(state) {
        return this.getNoneStickyColumnsOrder(state.config, state.customConfig, state.originalConfig);
    }

    restoreStickyColumnsFromState(state, columns) {

        state.config.columns.forEach(col => {
            if (col.fixed) {
                //this is left fix
                columns.unshift(col.key);
            }
            if (col.fixedRight) {
                columns.push(col.key);
            }
        });
        return columns;
    }

    getVisibleColumnsOrderFromState(state) {
        return this.getVisibleColumnsOrder(state.config, state.customConfig);
    }


    generateAllSelectedRowKeys(tableConfig, dataList, allSelected) {
        let selectedRowKeys = [];
        if (allSelected) {
            let keyColumnKey = tableConfig.getPrimaryColumnKey();
            dataList.forEach(row => {
                selectedRowKeys.push(row[keyColumnKey]);
            });
        }
        return selectedRowKeys;
    }

    generateSelectedRowKeys(tableConfig, dataList, currentSelectedKeys, index) {
        let selectedRowKey = dataList[index][tableConfig.getPrimaryColumnKey()];
        if (currentSelectedKeys.includes(selectedRowKey)) {
            //remove it
            currentSelectedKeys.splice(currentSelectedKeys.indexOf(selectedRowKey), 1);
        } else {
            //add it
            currentSelectedKeys.push(selectedRowKey);
        }
        currentSelectedKeys.sort();
        return currentSelectedKeys;
    }

    generateCheckedRowKeys(tableConfig, dataList, currentSelectedKeys, payload) {
        let index = payload[0];
        let selected = payload[1];
        let selectedRowKey = dataList[index][tableConfig.getPrimaryColumnKey()];
        if (currentSelectedKeys.includes(selectedRowKey)) {
            //remove it
            currentSelectedKeys.splice(currentSelectedKeys.indexOf(selectedRowKey), 1);
        } else {
            //add it
            currentSelectedKeys.push(selectedRowKey);
        }
        currentSelectedKeys.sort();
        return currentSelectedKeys;
    }

    generateSingleSelectedRowKeys(tableConfig, dataList, currentSelectedKeys, index) {
        let selectedRowKey = dataList[index][tableConfig.getPrimaryColumnKey()];
        if (currentSelectedKeys.length == 1) {
            if (currentSelectedKeys[0] == selectedRowKey) {
                //untoggle it
                currentSelectedKeys = [];
            } else {
                currentSelectedKeys[0] = selectedRowKey;
            }
        } else {
            currentSelectedKeys = [selectedRowKey];
        }
        return currentSelectedKeys;
    }
    isAllRowSelected(dataList, tableConfig, selectedRowKeys) {
        let allSelected = dataList.length > 0; // if table has no data, should be false
        dataList.forEach(row => {
            if (!selectedRowKeys.includes(row[tableConfig.getPrimaryColumnKey()])) {
                allSelected = false;
            }
        });
        return allSelected;
    }

    isRowSelected(rowIndex, state) {
        let selected = false;
        state.selectedRowKeys.forEach(key => {
            if (key === this.getRowKeyValFromIndex(rowIndex, state))
                selected = true;
        });
        return selected;
    }

    isRowChecked(rowIndex, state) {
        let checked = false;
        state.checkedRowKeys.forEach(key => {
            if (key === this.getRowKeyValFromIndex(rowIndex, state))
                checked = true;
        });
        return checked;
    }

    getRowKeyValFromIndex(rowIndex, state) {
        let rowData = state.dataList[rowIndex];
        let keyColumnKey = state.config.getPrimaryColumnKey();
        return rowData ? rowData[keyColumnKey] : '';
    }

    findRowIndexFromRowKeyValue(keyVal, state) {
        let rowIndex = 0;
        for (let i = 0; i < state.dataList.length; i++) {
            if (keyVal === this.getRowKeyValFromIndex(i, state)) {
                rowIndex = i;
                break;
            }
        }
        return rowIndex;
    }

    updateRowActionSelected(rowIndex, action, state) {
        let rowKeyVal = this.getRowKeyValFromIndex(rowIndex, state);
        let currentRowActionSelected = state.rowActionSelected;
        currentRowActionSelected[rowKeyVal] = action;
        return currentRowActionSelected;
    }

    getRowActionSelectedFromIndex(rowIndex, state) {
        let rowKeyVal = this.getRowKeyValFromIndex(rowIndex, state);
        if (rowKeyVal in state.rowActionSelected) {
            return state.rowActionSelected[rowKeyVal];
        } else {
            return "";
        }
    }

    setColumnHidden(columnKey, hidden, columns) {
        columns.forEach(column => {
            if (column.key == columnKey) {
                column.hidden = hidden;
            }
        });
        return columns;
    }

    setColumnsHidden(configObj, columns) {
        Object.keys(configObj).forEach(key => {
            columns.forEach(column => {
                if (column.key == key) {
                    column.hidden = configObj[key];
                }
            });
        });
        return columns;
    }

    mergeCustomerConfig(tableConfig, customerConfig) {
        //step 1, merge hidden column status
        if (customerConfig["hiddenColumns"]) {
            tableConfig.columns.forEach(column => {
                if (customerConfig["hiddenColumns"].includes(column.key)) {
                    column.hidden = true;
                }
            });
        }

        //step 2. merge columnWidths
        if (customerConfig['columnWidths']) {
            tableConfig.columns.forEach(column => {
                let columnKey = column.key;
                if (columnKey in customerConfig['columnWidths']) {
                    column['width'] = customerConfig['columnWidths'][columnKey];
                }
            });
        }

        return tableConfig;
    }

    searchWholeData(state, term) {
        let originalDataList = JSON.parse(JSON.stringify(state.originalDataList));
        let sorter = state.customConfig.sorter;
        let _this = this;
        let _filter = function (list, filter) {
            let filterResults = [];
            for (let i = 0; i < list.length; i++) {
                let bMatch = false;
                let row = list[i];
                //we need to filer all the columns
                let colKeys = Object.keys(row);
                for (let j = 0; j < colKeys.length; j++) {
                    if (row[colKeys[j]] && ('' + row[colKeys[j]]).toLowerCase().includes(('' + term).toLowerCase())) {
                        bMatch = true;
                        break;
                    }
                }
                if (bMatch) filterResults.push(row);
            }
            return filterResults;
        };
        if (sorter.order == ORDER_ASC || sorter.order == ORDER_DESC) {
            originalDataList.sort((a, b) => {
                if (sorter.order == ORDER_ASC) {
                    if (typeof(a[sorter.by]) === "string") {
                        return _this.stripHtml(a[sorter.by]) > _this.stripHtml(b[sorter.by]) ? 1 : -1;
                    } else if(typeof(a[sorter.by]) === "number") {
                        return Number(a[sorter.by]) > Number(b[sorter.by]) ? 1 : -1;
                    } else {
                        return -1;
                    }
                } else {
                    if (typeof(a[sorter.by]) === "string") {
                        return _this.stripHtml(a[sorter.by]) > _this.stripHtml(b[sorter.by]) ? -1 : 1;
                    } else if(typeof(a[sorter.by]) === "number") {
                        return Number(a[sorter.by]) > Number(b[sorter.by]) ? -1 : 1;
                    } else{
                        return -1;
                    }
                }
            });
        }
        //now let's filter
        originalDataList = _filter(originalDataList, term);
        return originalDataList;
    }

    sortFilterData(state) {
        let originalDataList = JSON.parse(JSON.stringify(state.originalDataList));
        let sorter = state.customConfig.sorter;
        let filters = state.customConfig.filters;
        let _this = this;
        let tableConfig = state.config;

        if(state.tableSearchedTerm!==''){
            originalDataList = this.searchWholeData(state, state.tableSearchedTerm);
        }

        let _filter = function (list, filter) {
            let filterResults = [];
            list.forEach(item => {
                let bMatch = false;
                switch (filter.operator) {
                    case TYPE_CONTAINS:
                        if (_this.stripHtml(item[filter.by]).toLowerCase().includes(filter.value1.toLowerCase())) {
                            bMatch = true;
                        }
                        break;
                    case TYPE_EQUALS:
                        if (Array.isArray(filter.value1)) {
                            for (const filterVal of filter.value1) {
                                if (_this.stripHtml(item[filter.by]).toLowerCase() === filterVal.toLowerCase()) {
                                    bMatch = true;
                                }
                            }
                        } else {
                            bMatch = _this.stripHtml(item[filter.by]).toLowerCase() === filter.value1.toLowerCase();
                        }
                        break;
                    case TYPE_IN:
                        let filteredValues = [];
                        filter.value1.forEach(v => {
                            filteredValues.push(v.toLowerCase());
                        });
                        if (filteredValues.includes(_this.stripHtml(item[filter.by]).toLowerCase())) bMatch = true;
                        else {
                            filter.value1.forEach(f => {
                                if (_this.stripHtml(item[filter.by]).toLowerCase().includes(f.toLowerCase())) {
                                    bMatch = true;
                                }
                            });
                        }
                        break;
                    case TYPE_BETWEEN:
                        let columnType = tableConfig.getColumnConfig(filter.by).type;
                        let value = item[filter.by];
                        let start = filter.value1;
                        let end = filter.value2;
                        if(columnType === 'date' || columnType === 'date_time'){
                            if(!isNaN(filter.value1)){
                                start = new Date(start);
                            }
                            if(!isNaN(filter.value2)){
                                end = new Date(end);
                            }
                        }
                        let valueDate = new Date(value);
                        bMatch = valueDate>=start && valueDate<=end;
                }
                if (bMatch) filterResults.push(item);
            });
            return filterResults;
        };

        if (sorter.by && (sorter.order == ORDER_ASC || sorter.order == ORDER_DESC)) {
            originalDataList.sort((a, b) => {
                if (sorter.order == ORDER_ASC) {
                    if (typeof(a[sorter.by]) === 'string') {
                        return _this.stripHtml(a[sorter.by]) > _this.stripHtml(b[sorter.by]) ? 1 : -1;
                    } else if(typeof(a[sorter.by]) === 'number'){
                        return Number(a[sorter.by]) > Number(b[sorter.by]) ? 1 : -1;
                    } else {
                        return -1;
                    }
                } else {
                    if (typeof(a[sorter.by]) === 'string') {
                        return _this.stripHtml(a[sorter.by]) > _this.stripHtml(b[sorter.by]) ? -1 : 1;
                    } else if(typeof(a[sorter.by]) === 'number'){
                        return Number(a[sorter.by]) > Number(b[sorter.by]) ? -1 : 1;
                    } else {
                        return -1;
                    }
                }
            });
        }
        //now let's filter
        filters.forEach(filter => {
            originalDataList = _filter(originalDataList, filter);
        });

        return originalDataList;
    }

    updateSingleSelectedRowAction(state, rowIndex, columnKey, newValue) {
        let dataList = JSON.parse(JSON.stringify(state.dataList));
        let oldValue = dataList[rowIndex][columnKey];
        dataList[rowIndex][columnKey] = newValue;
        //here we need to udpate originalDataList as well as dataList
        let rowKeyVal = this.getRowKeyValFromIndex(rowIndex, state);
        let originalDataList = JSON.parse(JSON.stringify(state.originalDataList));
        let primaryKey = state.config.getPrimaryColumnKey();
        for (var i = 0; i < originalDataList.length; i++) {
            if (originalDataList[i][primaryKey] == rowKeyVal) {
                originalDataList[i][columnKey] = newValue;
                break;
            }
        }
        return [dataList, originalDataList, rowKeyVal, columnKey, oldValue];
    }

    updateSingleCellValue(state, rowKeyVal, columnKey, value) {
        //1. we need to use rowKeyVal to find out rowIndex
        let dataList = JSON.parse(JSON.stringify(state.dataList));
        let primaryKey = state.config.getPrimaryColumnKey();
        let originalDataList = JSON.parse(JSON.stringify(state.originalDataList));

        if (Array.isArray(rowKeyVal)) {
            for (var i = 0; i < dataList.length; i++) {
                if (Array.isArray(rowKeyVal) && rowKeyVal.includes(dataList[i][primaryKey])) {
                    dataList[i][columnKey] = value;
                }
            }

            for (var i = 0; i < originalDataList.length; i++) {
                if (Array.isArray(rowKeyVal) && rowKeyVal.includes(originalDataList[i][primaryKey])) {
                    originalDataList[i][columnKey] = value;
                }
            }
        } else {
            for (var i = 0; i < dataList.length; i++) {
                if (dataList[i][primaryKey] == rowKeyVal) {
                    dataList[i][columnKey] = value;
                    break;
                }
            }
            for (var i = 0; i < originalDataList.length; i++) {
                if (originalDataList[i][primaryKey] == rowKeyVal) {
                    originalDataList[i][columnKey] = value;
                    break;
                }
            }
        }
        return [dataList, originalDataList];
    }

    upgradeConfig(table, rows) {
        table.columns.forEach(column => {
            if (column.type == TYPE_TEXT && this.isDataListType(column.key, rows, table.listDeliminator)) {
                column.type = TYPE_LIST;
            }
            if (column.type == TYPE_HTML && this.isDataHTMLListType(column.key, rows)) {
                column.type = TYPE_HTML_LIST;
            }
        });
    }

    isDataListType(colKey, rows, deliminator = ",") {
        //1 check length of each cell, exclude 'UNKNOWN'
        //2. we only check 10 records here, if neighbour two items has length differene more than 5, then not a list

        let lengthThreshold = 10;
        let checkingCount = 5;
        let bList = true;
        let commaRows = 0;
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            if (isNaN(row[colKey]) && row[colKey] && row[colKey].includes(deliminator)) {
                let avgLength = 0;
                commaRows++;
                var items = row[colKey].split(deliminator);
                for (let j = 0; j < items.length - 1; j++) {
                    let item = items[j];
                    if (
                        item.toLowerCase() != "unknown" &&
                        item.toLowerCase() != "" &&
                        items[j + 1].toLowerCase() != "unknown" &&
                        items[j + 1].toLowerCase() != ""
                    ) {
                        if (Math.abs(items[j + 1].trim().length - item.trim().length) > lengthThreshold) {
                            bList = false;
                        }
                    }
                }
            }

            if (i > checkingCount || !bList) break;
        }

        if (commaRows == 0) return false;

        return bList;
    }

    getWidthOfText(txt, fontname, fontsize) {
        if (!fontname) fontname = 'Roboto, "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif';
        if (!fontsize) fontsize = '14px';

        if (this.getWidthOfText.c === undefined) {
            this.getWidthOfText.c = document.createElement("canvas");
            this.getWidthOfText.ctx = this.getWidthOfText.c.getContext("2d");
        }
        this.getWidthOfText.ctx.font = fontsize + " " + fontname;
        return this.getWidthOfText.ctx.measureText(txt).width + 20;
    }

    getWidthOfHTML(html, fontname, fontsize) {
        //assuming only first character is used to decide html.
        let content = html;
        if (html.indexOf("<") === 0) {
            let x = html.indexOf(">");
            let y = html.lastIndexOf("<");
            content = html.substring(x + 1, y);
        }
        return this.getWidthOfText(content, fontname, fontsize);
    }

    getColumnConfig(config, colKey) {
        let cfg = '';
        config.columns.forEach(item => {
            if (item.key === colKey) cfg = item;
        });
        return cfg;
    }

    getRowActualHeight(colWidths, rowIndex, dataList, rowHeight, config) {
        let rowData = dataList[rowIndex];
        let lines = 1;
        Object.keys(colWidths).forEach(colKey => {
            if (typeof rowData[colKey] === "string" && !this.getColumnConfig(config, colKey).hidden && this.getColumnConfig(config, colKey).type === 'text') {
                let contentLength = this.getWidthOfText(rowData[colKey]);
                let colWidth = colWidths[colKey];
                lines = Math.ceil(contentLength / colWidth) > lines ? Math.ceil(contentLength / colWidth) : lines;
            }
        });
        return lines * rowHeight;
    }

    getDefaultColumns(columns) {
        let columnKeys = [];
        columns.forEach(column => {
            if (!column.hidden) columnKeys.push(column.key);
        });
        return columnKeys;
    }

    fixingCustomerConfig(passedConfig, dataList) {
        if (dataList && dataList.length === 0) return passedConfig;
        let currentColumnsOrder = passedConfig.columnsOrder;
        let currentHiddenColumns = passedConfig.hiddenColumns;
        let acturalColumns = Object.keys(dataList[0]);

        for (let i = currentColumnsOrder.length - 1; i >= 0; i--) {
            if (!acturalColumns.includes(currentColumnsOrder[i])) {
                currentColumnsOrder.splice(i, 1);
            }
        }
        //PI-2216 - data fields and config are different here, so can not do below checking using dataList - for Zendesk
        // for (let i = currentHiddenColumns.length - 1; i >= 0; i--) {
        //     if (!acturalColumns.includes(currentHiddenColumns[i])) {
        //         currentHiddenColumns.splice(i, 1);
        //     }
        // }
        passedConfig.columnsOrder = currentColumnsOrder;
        passedConfig.hiddenColumns = currentHiddenColumns;
        return passedConfig;
    }

    getColumnPosition(state, colKey) {
        let columnsOrder = this.getVisibleColumnsOrderFromState(state);
        let bFirst = false;
        let bLast = false;
        let bMiddle = true;

        for (let i = 0; i < columnsOrder.length; i++) {
            if (i == 0 && columnsOrder[i] == colKey) {
                bFirst = true;
                break;
            } else if (i == columnsOrder.length - 1 && columnsOrder[i] == colKey) {
                bLast = true;
                break;
            }
        }
        if (bFirst || bLast) bMiddle = false;
        return {
            bFirst: bFirst,
            bLast: bLast,
            bMiddle: bMiddle
        }
    }

    isDataHTMLListType(colKey, rows) {
        let lengthThreshold = 5;
        let checkingCount = 100;
        let bList = false;
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let html = row[colKey];
            let checkingResults = this.analyzeHTMLListContent(html);
            if (checkingResults.innerDivs.length > 1) {
                bList = true;
                break;
            }
            if (i > checkingCount++) break;
        }
        return bList;
    }

    //here all the html content should be provided as <div.><div></div><div></div></div>;
    analyzeHTMLListContent(html) {
        let outerDiv, innerDivs;
        if (html) {
            //step 1, get outer div
            outerDiv = html.substr(0, html.indexOf('>') + 1);
            innerDivs = [];
            let innerPartStr = html.substr(html.indexOf('>') + 1, html.lastIndexOf('</div>') - 1);
            //step 2. let's split here
            innerPartStr.split('</div>').forEach(part => {
                if (part !== '') {
                    innerDivs.push(part + "</div>");
                }
            });
        } else {
            outerDiv = '';
            innerDivs = [];
        }
        return {
            outerDiv: outerDiv,
            innerDivs: innerDivs
        }
    }

    analyzeTextListContent(text) {
        return typeof text == 'string' ? text.split(",") : [];
    }

    calCountForInerDivs(innerDivs, colWidth) {
        let text = '', i;
        if (colWidth > 200) colWidth = 200;
        for (i = 0; i < innerDivs.length; i++) {
            let newText = text + this.stripHtml(innerDivs[i]);
            if (this.getWidthOfText(newText) > colWidth) {
                break;
            }
            text = newText;
        }
        return (i > 1) ? i : 1; // todo: this logic needs to be double checked
    }


    stripHtml(html) {
        // Create a new div element
        var temporalDivElement = document.createElement("div");
        // Set the HTML content with the providen
        temporalDivElement.innerHTML = html;
        // Retrieve the text property of the element (cross-browser support)
        return temporalDivElement.textContent || temporalDivElement.innerText || "";
    }

    formatNumber(number, columnConfig){
        if(columnConfig.format==='COMMASEPERATED'){
            return (''+number).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else if(columnConfig.format==='SHORTENED'){
            if (number > 1000000000) {
                return Math.floor(number / 1000000000) + ' GB';
            } else if (number > 1000000) {
                return Math.floor(number / 1000000) + ' MB';
            } else if (number > 1000) {
                return Math.floor(number / 1000) + ' KB';
            } else {
                return '' + number;
            }
        }else{
            return number;
        }
    }

}
