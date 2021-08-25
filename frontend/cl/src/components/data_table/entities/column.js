"use strict";

export const TYPE_TEXT = 'text';
export const TYPE_PURE_TEXT = 'pure_text';
export const TYPE_HTML = 'html';
export const TYPE_CLICKABLE = 'clickable';
export const TYPE_PURE_CLICKABLE = 'pure_clickable';
export const TYPE_SINGLE_SELECT_ACTIONS = 'single_select_actions';
export const TYPE_ICON_CALL_BACK = 'icon_call_back';
export const TYPE_LIST = 'list';
export const TYPE_NUMBER = 'number';
export const TYPE_HTML_LIST = 'html_list';
export const TYPE_MORE_OPTIONS = 'more_options';
export const DOWNLOAD_STANDARD_ALWAYS = 'always';
export const DOWNLOAD_STANDARD_NEVER = 'never';
export const TYPE_DATE = 'date';
export const TYPE_DATETIME = 'date_time';

export const TYPE_NUMBER_FORMAT_COMMASEPERATED='COMMASEPERATED';
export const TYPE_NUMBER_FORMAT_SHORTENED='SHORTENED';

class ColumnActionOption {
    constructor(data) {
        this['value'] = 'value' in data ? data.value : '';
        this['title'] = 'title' in data ? data.title : '';
    }
}

export default class Column {
    constructor(data, index) {
        this["key"] = data["key"] || "";
        this["title"] = data["title"] || "";
        this["type"] = data["type"] || TYPE_HTML; // text | html
        this["width"] = data["width"] || 100;
        this["resizable"] = "resizable" in data ? data.resizable : false;
        this["reordable"] = "reordable" in data ? data.reordable : false;
        this["flexGrow"] = "flexGrow" in data ? data.flexGrow : 1;
        this["fixed"] = "fixed" in data ? data.fixed : false;
        this["fixedRight"] = "fixedRight" in data ? data.fixedRight : false;
        this['format'] = 'format' in data?data.format:'';
        this['editable'] = 'editable' in data?data.editable:false;
        let actionOptions = [];
        if ('actionOptions' in data) {
            data.actionOptions.forEach(option => {
                actionOptions.push(new ColumnActionOption(option));
            });
        }
        this['actionOptions'] = actionOptions;

        this['hidden'] = 'hidden' in data ? data.hidden : false;
        this['sortable'] = 'sortable' in data ? data.sortable : false;
        this['filterable'] = 'filterable' in data ? data.filterable : false;
        this["primaryKey"] = "primaryKey" in data ? data.primaryKey : index === 0;
        this['filterOptions'] = 'filterOptions' in data ? data.filterOptions : [];
        this['controllers'] = 'controllers' in data ? data.controllers : {};
        this['downloadStandard'] = 'downloadStandard' in data ? data.downloadStandard : '';
        this['tooltip'] = 'tooltip' in data ? data.tooltip : '';
        this['disableTooltip'] = 'disableTooltip' in data?data.disableTooltip:false;
        //dynamically adjust column minwidth, so that header is fully view
        if ((this["title"] !== '')) {
            if (this['width'] > 20) {
                //for some column, such as spacer, we need it to be small
                this['minWidth'] = this['hidden'] ? 0 : (this.getWidthOfText(this["title"]) + 100);
                if (this['minWidth'] > this['width']) {
                    this['width'] = this['minWidth'];
                }
            } else {
                this['minWidth'] = 0;
            }
        } else {
            this['minWidth'] = 0;
        }
    }
    getActionOptions(optionValue) {
        const option = this.actionOptions.find(item => {
            return item.value.toLowerCase() === optionValue.toLowerCase();
        });
        return option ? option : {
            title: optionValue,
            value: optionValue
        }
    }

    getWidthOfText(txt) {
        const fontName = 'Roboto, "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif';
        const fontSize = '14px';
        if (this.getWidthOfText.c === undefined) {
            this.getWidthOfText.c = document.createElement("canvas");
            this.getWidthOfText.ctx = this.getWidthOfText.c.getContext("2d");
        }
        this.getWidthOfText.ctx.font = fontSize + " " + fontName;
        return this.getWidthOfText.ctx.measureText(txt).width;
    }
}
