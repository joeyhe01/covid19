"use strict";

export default class CustomConfig {
    constructor(data) {
        this["columnsOrder"] = [];
        this["hiddenColumns"] = [];
        this["sorter"] = {};
        this["filters"] = [];
        this["columnWidths"] = {};

        if (data) {
            if ("columnsOrder" in data) this["columnsOrder"] = data["columnsOrder"];
            if ("hiddenColumns" in data) this["hiddenColumns"] = data["hiddenColumns"];
            if ("sorter" in data) this["sorter"] = new Sorter(data.sorter);
            if ("columnWidths" in data) this['columnWidths'] = data['columnWidths'];
            if ("filters" in data)
                data["filters"].forEach(filter => {
                    this.filters.push(new Filter(filter));
                });
        }
    }
    setColumnWidths(widths) {
        this['columnWidths'] = widths;
    }
    setColumnsOrder(columns) {
        this["columnsOrder"] = columns;
    }

    setHiddenColumns(columns) {
        this["hiddenColumns"] = columns;
    }

    getColumnSortOrder(columnKey) {
        if (Object.keys(this.sorter).length === 0) {
            return ORDER_NONE;
        } else {
            if (this.sorter.by === columnKey) {
                return this.sorter.order;
            } else {
                return ORDER_NONE;
            }
        }
    }

    updateSorter(columnKey) {
        //if sorter is empty, create it
        if (Object.keys(this.sorter).length === 0) {
            this.sorter = new Sorter();
        }
        this.sorter.toggle(columnKey);
    }

    updateFilter(filter) {
        let index = -1;
        for (let i = this.filters.length - 1; i >= 0; i--) {
            if (this.filters[i].by === filter.by) {
                index = i;
                break;
            }
        }
        //1. if not exist, we just add
        if (index === -1) {
            this.filters.push(filter);
        } else {
            //2. if exist, we need to update
            //2.1, if value is empty, we remove it1
            let toRemove = false;
            if (
                filter.operator === TYPE_CONTAINS ||
                filter.operator === TYPE_EQUALS ||
                filter.operator === TYPE_GREATER_OR_EQUAL ||
                filter.operator === TYPE_LESS_OR_EQUAL
            ) {
                if (filter.value1 === "" || filter.value1 === undefined || filter.value1 == null) {
                    //remove this
                    toRemove = true;
                }
            } else {
                if (filter.operator === TYPE_IN) {
                    if (filter.value1.length===0) {
                        //if empty list item, let's just remove it
                        toRemove = true;
                    } else {
                        //let's remove filter
                        this.filters.splice(index, 1);
                        toRemove = false;
                    }
                } else if (
                    filter.value1 === "" ||
                    filter.value1 === undefined ||
                    filter.value1 == null ||
                    filter.value2 === "" ||
                    filter.value2 === undefined ||
                    filter.value2 == null
                )
                    toRemove = true;
            }

            if (toRemove) {
                this.filters.splice(index, 1);
            } else {
                //toUpdate
                this.filters[index] = filter;
            }
        }
    }

    getFilterFor(colKey) {
        return this.filters.find(filter => {
            return filter.by === colKey;
        });
    }
}

export const ORDER_ASC = "asc";
export const ORDER_DESC = "desc";
export const ORDER_NONE = "none";

export class Sorter {
    constructor(data) {
        if (data) {
            this.by = "by" in data ? data["by"] : "";
            this.order = "order" in data ? data["order"] : ORDER_ASC;
        } else {
            this.by = "";
            this.order = "";
        }
    }

    toggle(columnKey) {
        if (this.by !== columnKey) {
            this.resetSort(columnKey);
        } else {
            this.toggleSort();
        }
    }

    resetSort(columnKey) {
        this.by = columnKey;
        this.order = ORDER_ASC;
    }

    toggleSort() {
        let nextOrder;
        if (this.order === ORDER_ASC) {
            nextOrder = ORDER_DESC;
        } else if (this.order === ORDER_DESC) {
            nextOrder = ORDER_NONE;
        } else {
            nextOrder = ORDER_ASC;
        }
        this.order = nextOrder;
    }
}

export const TYPE_CONTAINS = "contains";
export const TYPE_EQUALS = "equals";
export const TYPE_GREATER_OR_EQUAL = "greater_or_equal";
export const TYPE_LESS_OR_EQUAL = "less_or_equal";
export const TYPE_BETWEEN = "between";
export const TYPE_NUMBER = "number";
export const TYPE_IN = "in";
export class Filter {
    constructor(data) {
        this.by = "by" in data ? data.by : "";
        this.operator = "operator" in data ? data.operator : "";
        this.value1 = "value1" in data ? data["value1"] : "";
        this.value2 = "value2" in data ? data["value2"] : "";
    }

    inValid(){
        if(this.operator === TYPE_BETWEEN){
            let errorCode= false;
            if(!this.value1){
                errorCode ='Start datetime missing';
            }else if(!this.value2){
                errorCode ='End datetime missing';
            }else if(this.value1>this.value2){
                errorCode = 'End datetime before start datetime';
            }
            return errorCode;
        }
    }
}
