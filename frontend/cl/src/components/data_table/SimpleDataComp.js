import React, { Component } from "react";
import SimpleTableComp from "./comps/SimpleTableComp";
import S from "./redux/store";
import TableService from "./services/table_service";
import Page from "./entities/page";

class SimpleDataComp extends Component {
    constructor(props) {
        super(props);
        this.service = new TableService();
        this.store = S(this.props.appId);
        if (this.props.config) {
            this.store.setUpdatedTableConfig(this.service.genenerateTableConfig(this.props.config));
            //create page obj in store
            this.store.updatePage(new Page(this.props.config));
        }
        if (this.props.data) {
            //set as original dataList
            this.store.setUpdatedData(this.props.data, true);
        }
        if (this.props.customConfig) {
            let customerConfig = this.service.genenerateCustomConfig(this.props.customConfig);
            this.store.setCustomConfig(customerConfig);
            //next we need to update table config based on customerConfig
            this.store.setUpdatedTableConfig(
                this.service.mergeCustomerConfig(this.store.getState().config, customerConfig)
            );
        }
    }

    render() {
         const rows =[0,1,2];

        return (
            <div>
                <SimpleTableComp  {...this.props} />
            </div>
        );
    }
}

export default SimpleDataComp;
