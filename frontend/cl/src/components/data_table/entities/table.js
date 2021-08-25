import Column from "./column";

export default class Table {
    constructor(data) {
        this['rowHeight'] = 'rowHeight' in data ? data.rowHeight : 50;
        this['headerHeight'] = 'headerHeight' in data ? data.headerHeight : 60;
        this['width'] = 'width' in data ? data.width : 800;
        this['height'] = 'height' in data ? data.height : 400;
        this["enableCheckBox"] = "enableCheckBox" in data ? data["enableCheckBox"] : false;
        this['enableRadioButton'] = 'enableRadioButton' in data ? data.enableRadioButton : false;
        this["enablePaginator"] = "enablePaginator" in data ? data["enablePaginator"] : false;
        this['pageSize'] = 'pageSize' in data ? data.pageSize : 20;
        this["rowExpandable"] = "rowExpandable" in data ? data.rowExpandable : false;
        this["rowCollapseable"] = "rowCollapseable" in data ? data["rowCollapseable"] : false;
        this["collapseRowHeight"] = "collapseRowHeight" in data ? data["collapseRowHeight"] : 50;
        this["singleRowToggleable"] = "singleRowToggleable" in data ? data.singleRowToggleable : false;
        this["theme"] = "theme" in data ? data.theme : "light";
        this["global"] = "global" in data ? data.global : false;
        if (this["global"] === false) {
            this['tableSearch'] = 'tableSearch' in data ? data.tableSearch : false;
        } else {
            this['tableSearch'] = false;
        }
        this['hideSetting'] = 'hideSetting' in data ? data['hideSetting'] : false;
        this["navigateable"] = "navigateable" in data ? data.navigateable : false;
        this["columns"] = [];
        let index = 0;
        data["columns"].forEach(col => {
            this["columns"].push(new Column(col, index));
            index++;
        });
        this['downloadable'] = 'downloadable' in data ? data.downloadable : false;
        this['listDeliminator'] = 'listDeliminator' in data ? data.listDeliminator : ',';
        this['totalTitle'] = 'totalTitle' in data ? data.totalTitle : '';
        this['enableAllGlobalSelector'] = 'enableAllGlobalSelector' in data ? data.enableAllGlobalSelector : false;
        this['deCoupleRowSelectAndCheckbox'] = 'deCoupleRowSelectAndCheckbox' in data ? data.deCoupleRowSelectAndCheckbox : false;
        this['listView'] = 'listView' in data ? data.listView : false;
        if (this['listView']) {
            this["rowHeight"] += 10;
        }
        this['hideTotal'] = 'hideTotal' in data? data.hideTotal : false;
        this['enforceResetFilterBtn'] = 'enforceResetFilterBtn' in data?data.enforceResetFilterBtn:false;
    }

    getColumnsOrder() {
        let columnKeys = [];
        this.columns.forEach(column => {
            columnKeys.push(column.key);
        });
        return columnKeys;
    }

    getVisibleColumnsOrder() {
        let columnKeys = [];
        this.columns.forEach(column => {
            if (!column.hidden)
                columnKeys.push(column.key);
        });
        return columnKeys;
    }

    getColumnConfig(key) {
        let config = null;
        this.columns.forEach(column => {
            if (column.key === key) {
                config = column;
            }
        });
        return config;
    }

    getPrimaryColumnKey() {
        let key = "";
        this["columns"].forEach(col => {
            if (col.primaryKey) {
                key = col.key;
            }
        });
        return key;
    }

    columnHidden(columnKey) {
        return this.getColumnConfig(columnKey) ? this.getColumnConfig(columnKey).hidden : true;
    }

    columnToBeDownloaded(columnKey) {
        const cfg = this.getColumnConfig(columnKey);
        if (!cfg) {
            // TODO: Check the logic: column is not there, then don't download
            return false;
        }
        if ('downloadStandard' in cfg && cfg.downloadStandard !== '') {
            if (cfg.downloadStandard === 'never') {
                return false;
            } else if (cfg.downloadStandard === 'always') {
                return true;
            }
        }
        if (cfg.type === 'text' || cfg.type === 'html' || cfg.type === 'pure_text') {
            return !this.columnHidden(columnKey);
        } else {
            return false;
        }

    }

    getHiddenColumnKeys() {
        let keys = [];
        this["columns"].forEach(col => {
            if (col.hidden) {
                keys.push(col.key);
            }
        });
        return keys;
    }

    updateColumnWidth(colKey, width) {
        this["columns"].forEach(col => {
            if (col.key === colKey) {
                col.width = width;
            }
        });
    }
}
