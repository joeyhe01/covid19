import { Table, Column, Cell } from "fixed-data-table-2";
import React, { Component } from "react";
import S from "../redux/store";
import {
    CellWrapper,
    RowActionControlSingleSelectCell,
    ColumnCheckBoxCell,
    ColumnHeaderCheckBoxCell,
    CollapseCell
} from "./cells/cells";
import { HeaderCell } from "./cells/headercell";
import SettingComp from "./SettingComp";
import PaginatorComponent from "./PaginatorComp";
import TableService from "../services/table_service";

class SimpleTableComp extends Component {
    constructor(props) {
        super(props);

        this.service = new TableService();
        this.store = S(this.props.appId);
        this.tableConfig = this.store.getState().config;
        this.page = this.store.getState().page;

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
            collapsedRows: new Set()
        };
        console.log("nowe==>", this.store.getState());
        console.log("nowe123==>", this.service.getColumnsOrderFromState(this.store.getState()));

        setTimeout(()=>{
            console.log("now123e==>", this.store.getState());
        }, 1000);

    }

    render (){
        const rows =[0,1,2];
        return (
           <div>
               <Table rowHeight={50} rowsCount={2} width={200} height={200} headerHeight={50}>
                   {this.state.columnsOrder.map((columnKey, i) => {
                          return (
                               <Column
                                   columnKey={i}
                                   key={i + Math.random()}
                                   width={this.state.columnWidths[columnKey]}
                               />
                           );
                   })}
               </Table>
           </div>
        );


    }

}

export default SimpleTableComp;
