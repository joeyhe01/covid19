import React, { Component } from "react";
import S from "../redux/store";
import ClassNames from "classnames";

export default class PaginatorComponent extends Component {
    constructor() {
        super();
        this.state = {
            page: null,
            config: null
        };
        this.first = this.first.bind(this);
        this.pre = this.pre.bind(this);
        this.next = this.next.bind(this);
        this.last = this.last.bind(this);
    }

    componentDidMount() {
        this.store = S(this.props.appId);
        this.page = this.store.getState().page;
        this.setState({
            page: this.page,
            config: this.store.getState().config,
            totalRecords: this.store.getState().dataList.length
        });
        if (this.store.getState().config.enablePaginator)
            this.unSubscribePage = this.store.subscribeTo(this.store.PAGE_UPDATE, () => {
                this.page = this.store.getState().page;
                this.setState({
                    page: this.page
                });
            });
        if (!this.store.getState().config.enablePaginator)
            this.unSubscribeFilter = this.store.subscribeTo(this.store.DATA_UPDATED, state => {
                this.setState({
                    totalRecords: this.store.getState().dataList.length
                });
            });
    }

    componentWillUnmount() {
        if (this.store.getState().config.enablePaginator) this.unSubscribePage();
        if (!this.store.getState().config.enablePaginator) this.unSubscribeFilter();
    }

    first() {
        this.page.first();
        this.resetState();
    }
    pre() {
        this.page.pre();
        this.resetState();
    }
    next() {
        this.page.next();
        this.resetState();
    }
    last() {
        this.page.last();
        this.resetState();
    }

    resetState() {
        this.setState({
            page: this.page
        });
        if ("onGotoPage" in this.props) {
            this.props.onGotoPage(this.page.currentPage);
        }
    }

    render() {
        let pageStr = '';
        if(this.state.page){
            if(this.state.page.total>0){
                pageStr = this.state.page.total;
            }else{
                if(this.store.getState().dataList && this.store.getState().dataList.length>0){
                    pageStr='many';
                }else{
                    pageStr = '';
                }
            }
        }

        return (
            <div className="paginatorWrapper">
                {this.state.page &&
                    this.state.config.enablePaginator && (
                        <ul>
                            <li
                                onClick={this.first}
                                className={ClassNames({ inActive: !this.state.page.isFirstEnabled() })}>
                                <i className="material-icons">first_page</i>
                            </li>
                            <li
                                onClick={this.pre}
                                className={ClassNames({ inActive: !this.state.page.isPreEnabled() })}>
                                <i className="material-icons">skip_previous</i>
                            </li>
                            <li>
                                <div className="info">
                                    <div className="inner">
                                        {this.state.page.getPageRange()[0]} - {this.state.page.getPageRange()[1]}
                                        {pageStr===''?'':' of '}
                                        {pageStr}
                                    </div>
                                </div>
                            </li>
                            <li
                                onClick={this.next}
                                className={ClassNames({ inActive: !this.state.page.isNextEnabled() })}>
                                <i className="material-icons">skip_next</i>
                            </li>
                            <li
                                onClick={this.last}
                                className={ClassNames({ inActive: !this.state.page.isLastEnabled() })}>
                                <i className="material-icons">last_page</i>
                            </li>
                        </ul>
                    )}
                {this.state.page &&
                    !this.state.config.totalTitle &&
                    !this.state.config.enablePaginator &&
                    !this.state.config.hideTotal &&
                    (
                        <div className="totalRecordsWrapper">
                            <div className="innterPart">Total Records: {this.state.totalRecords}</div>
                        </div>
                    )}
            </div>
        );
    }
}
