import * as actionType from "./ActionType";
import TableService from "../services/table_service";
const DataTableReducer = (state = {}, action) => {
    let newState;
    let service = new TableService();
    let config = state.config;
    let customConfig = state.customConfig;
    switch (action.type) {
        case actionType.ORIGINAL_CONFIG_UPDATE:
            newState = Object.assign({}, state, {
                originalConfig: action.payload
            });
            break;
        case actionType.SET_DOWNLOAD_DATA:
            newState = Object.assign({}, state, {
                downloadDataList: action.payload
            });
            break;
        case actionType.DATA_UPDATED:
            newState = Object.assign({}, state, {
                dataList: action.payload
            });
            break;
        case actionType.RESIZING:
            newState = Object.assign({}, state, {
                width: action.payload
            });
            break;
        case actionType.CONFIG_UPDATE:
            newState = Object.assign({}, state, {
                config: action.payload,
                defaultColumns: service.getDefaultColumns(action.payload.columns)
            });
            break;
        case actionType.CUSTOM_CONFIG_UPDATE:
            newState = Object.assign({}, state, {
                //here we need to fix customConfig automatially, as sometimes, customer config saved non-existing columns
                customConfig: service.fixingCustomerConfig(action.payload, state.dataList),
                // once customer config updated, we need to merge back to table config
                config: service.mergeCustomerConfig(state.config, action.payload)
            });
            break;
        case actionType.ROW_ALL_SELECTED:
            newState = Object.assign({}, state, {
                rowAllSelected: action.payload,
                selectedRowKeys: service.generateAllSelectedRowKeys(state.config, state.dataList, action.payload)
            });
            break;
        case actionType.ROW_SELECTED:
            if (action.payload >= 0) {
                newState = Object.assign({}, state, {
                    selectedRowKeys: service.generateSelectedRowKeys(
                        state.config,
                        state.dataList, !state.config.enableRadioButton ? state.selectedRowKeys : [],
                        action.payload
                    )
                });
            } else {
                newState = Object.assign({}, state, {
                    rowAllSelected: false,
                    selectedRowKeys: []
                });
            }
            break;
        case actionType.SINGLE_ROW_SELECTED:
            newState = Object.assign({}, state, {
                selectedRowKeys: service.generateSingleSelectedRowKeys(
                    state.config,
                    state.dataList, !state.config.enableRadioButton ? state.selectedRowKeys : [],
                    action.payload
                )
            });
            break;
        case actionType.SINGLE_ROW_SELECTED_WITH_KEY:
            let currentRowKeys = state.selectedRowKeys;
            currentRowKeys.push(action.payload);
            newState = Object.assign({}, state, {
                selectedRowKeys: currentRowKeys
            });
            break;
        case actionType.UPDATE_SINGLE_SELECTED_ACTION:
            var updatedResults = service.updateSingleSelectedRowAction(state, ...action.payload);
            newState = Object.assign({}, state, {
                dataList: updatedResults[0],
                originalDataList: updatedResults[1],
                rowkeyVal: updatedResults[2],
                oldColumnKey: updatedResults[3],
                oldValue: updatedResults[4]
            });
            break;
        case actionType.RAW_ACTION_SELECTED:
            newState = Object.assign({}, state, {
                rowActionSelected: service.updateRowActionSelected(action.payload[0], action.payload[1], state)
            });
            break;
        case actionType.SET_COLUMN_HIDDEN:
            config.columns = service.setColumnHidden(action.payload[0], action.payload[1], config.columns);
            newState = Object.assign({}, state, {
                config: config
            });
            break;
        case actionType.SET_COLUMNS_HIDDEN:
            config.columns = service.setColumnsHidden(action.payload, config.columns);
            newState = Object.assign({}, state, {
                config: config
            });
            break;
        case actionType.SORT_COLUMN:
            customConfig.updateSorter(action.payload);
            newState = Object.assign({}, state, {
                customConfig: customConfig
            });
            break;
        case actionType.FILTER_UPDATE:
            customConfig.updateFilter(action.payload);
            newState = Object.assign({}, state, {
                customConfig: customConfig
            });
            break;
        case actionType.RESET_FILTER:
            customConfig.filters = [];
            newState = Object.assign({}, state, {
                customConfig: customConfig
            });
            break;
        case actionType.UPDATE_THEME:
            config.theme = action.payload;
            newState = Object.assign({}, state, {
                config: config
            });
            break;
        case actionType.TOGGLE_ALL_ROWS:
            newState = Object.assign({}, state, {
                allOpened: !state.allOpened
            });
            break;
        case actionType.PAGE_UPDATE:
            newState = Object.assign({}, state, {
                page: action.payload
            });
            break;
        case actionType.CELL_DATA_UPDATED:
            var updatedResults = service.updateSingleCellValue(state, ...action.payload);
            newState = Object.assign({}, state, {
                dataList: updatedResults[0],
                originalDataList: updatedResults[1],
                passedInCellData: action.payload
            });
            break;
        case actionType.SELECT_ALL_LEVEL:
            newState = Object.assign({}, state, {
                selectAllLevel: action.payload
            });
            break;
        case actionType.CHECKBOX_CHECKED:
            const checkedRows = service.generateCheckedRowKeys(
                state.config,
                state.dataList, !state.config.enableRadioButton ? state.checkedRowKeys : [],
                action.payload
            );
            newState = Object.assign({}, state, {
                checkedRowKeys: checkedRows
            });
            break;
        case actionType.UNCLICKABLE_CELLS_UPDATED:
            newState = Object.assign({}, state, {
                unClickableCells: action.payload
            });
            break;
        case actionType.SCROLL_POSITION_UPDATE:
            newState = Object.assign({}, state, {
                scrollPosition: action.payload
            });
            break;
        case actionType.GOTO_SCROLL_POSITION:
            newState = Object.assign({}, state, {
                scrollPosition: action.payload
            });
            break;
        case actionType.TABLE_SEARCH:
            newState = Object.assign({}, state, {
                tableSearchedTerm: action.payload
            });
            break;
        case actionType.SET_COLUMNS_HIDDEN_TEMP:
            newState = Object.assign({}, state, {
                columnHiddenTmp: action.payload
            });
            break;
        default:
            newState = Object.assign({}, state);
    }
    return newState;
};

export default DataTableReducer;
