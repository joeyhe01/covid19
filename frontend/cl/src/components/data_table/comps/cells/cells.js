import { Cell } from "fixed-data-table-2";
import React, { Component } from "react";
import S from "../../redux/store";
// import { Checkbox, Radio } from "react-mdl";
import Checkbox from 'muicss/lib/react/checkbox';
import TableService from "../../services/table_service";
import MoreOptionItems from "../../entities/more_option";
import {
    TYPE_TEXT,
    TYPE_PURE_TEXT,
    TYPE_HTML,
    TYPE_TOOLTIP_TEXT,
    TYPE_SINGLE_SELECT_ACTIONS,
    TYPE_ICON_CALL_BACK,
    TYPE_LIST,
    TYPE_NUMBER,
    TYPE_CLICKABLE,
    TYPE_HTML_LIST,
    TYPE_MORE_OPTIONS,
    TYPE_DATE,
    TYPE_DATETIME,
    TYPE_PURE_CLICKABLE
} from "../../entities/column";
import ClassNames from "classnames";
import { BoundedTetherComp } from "../BoundedTetherComp";

require("../../datatable.scss");

export class CellWrapper extends React.PureComponent {
    render() {
        const columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        let comp = null;
        const { rowIndex, columnKey, collapsedRows } = this.props;
        const service = new TableService();
        switch (columnConfig.type) {
            case TYPE_MORE_OPTIONS:
                comp = <MoreOptionCell {...this.props} dataList={this.props.dataList} />;
                break;
            case TYPE_NUMBER:
                comp = <NumberCell {...this.props} dataList={this.props.dataList} />;
                break;
            case TYPE_TEXT:
            case TYPE_PURE_TEXT:
            case TYPE_DATE:
            case TYPE_DATETIME:
                //first, check content length vs. column width, then give different Cell
                if (!columnConfig.disableTooltip &&
                    this.props.dataList[rowIndex][columnKey] &&
                    service.getWidthOfText(this.props.dataList[rowIndex][columnKey]) > columnConfig.width &&
                    !collapsedRows.has(rowIndex) //we use different cell comp based on expanded status
                ) {
                    comp = (
                        <ToolTipTextCell {...this.props} dataList={this.props.dataList} collapsedRows={collapsedRows} />
                    );
                } else {
                    comp = <TextCell {...this.props} dataList={this.props.dataList} />;
                }
                break;
            case TYPE_HTML:
                //first, check content length vs. column width, then give different Cell
                if (!columnConfig.disableTooltip &&
                    this.props.dataList[rowIndex][columnKey] &&
                    service.getWidthOfHTML(this.props.dataList[rowIndex][columnKey]) > columnConfig.width &&
                    !collapsedRows.has(rowIndex) //we use different cell comp based on expanded status
                ) {
                    comp = (
                        <ToolTipHtmlCell {...this.props} dataList={this.props.dataList} collapsedRows={collapsedRows} />
                    );
                } else {
                    comp = <HtmlCell {...this.props} dataList={this.props.dataList} />;
                }
                break;
            case TYPE_LIST:
                //only using listView if not expanded
                if (!collapsedRows.has(rowIndex)) {
                    comp = <ListCell {...this.props} dataList={this.props.dataList} columnWidth={columnConfig.width} />;
                } else {
                    comp = <TextCell {...this.props} dataList={this.props.dataList} />;
                }
                break;
            case TYPE_ICON_CALL_BACK:
                comp = <IconCallBackCell {...this.props} dataList={this.props.dataList} />;
                break;
            case TYPE_CLICKABLE:
                comp = <ClickableCell {...this.props} dataList={this.props.dataList} />;
                break;
            case TYPE_PURE_CLICKABLE:
                comp = <PureClickableCell {...this.props} dataList={this.props.dataList} />;
                break;
            case TYPE_HTML_LIST:

                //only using listView if not expanded
                if (collapsedRows.has(rowIndex)) {
                    comp = <HtmlListCell {...this.props} dataList={this.props.dataList} columnWidth={columnConfig.width} />;
                } else {
                    if (this.props.onListItemClick) {
                        comp = <HtmlListExpandedCell {...this.props} dataList={this.props.dataList} columnWidth={columnConfig.width} />;
                    } else {
                        comp = <HtmlCell {...this.props} dataList={this.props.dataList} />;
                    }
                }
                break;
        }
        return comp;
    }
}

export class MoreOptionCell extends React.PureComponent {

    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
        this.close = this.close.bind(this);
        this.toggleOpen = this.toggleOpen.bind(this);
        this.row = null;
        this.state = {
            open: false,
            optionItems: [],
            theme: "light"
        };
        this.optionItems = null;
    }

    toggleOpen(e) {
        // if there are other popups open, close them
        if (document.querySelector(".dvClPopUpWrapper")) {
            this.store.closeAllPopUp()
        }
        if (e) e.stopPropagation();
        this.state.theme = this.store.getState().config.theme;
        this.setState({
            open: !this.state.open
        });
    }
    onClick(e){
        if (this.props.onMoreOptionItemClicked) {
            this.props.onMoreOptionItemClicked(this.row, this.optionItems.findByValue(
                e.target.getAttribute("data-value")
            ));
        }
        this.close();
    }
    close(){
        this.setState({
            open: false
        });
    }

    componentDidMount() {
        this._updateState();
        this.store = S(this.props.appId);
        this.unsubscriberCloseAllPopUp = this.store.subscribeTo(this.store.CLOSE_ALL_POPUP, () => {
            this.close();
        });
    }
    componentWillUnmount() {
        this.unsubscriberCloseAllPopUp();
    }

    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex) this._updateState();
    }

    _updateState() {
        setTimeout(() => {
            const dataList = S(this.props.appId).getState().dataList;
            if(dataList.length===0) return;
            //here, cellValue should be options
            this.row =  dataList[this.props.rowIndex]
            const cellValue =this.row[this.props.columnKey];
            this.optionItems = new MoreOptionItems(cellValue);
            this.setState({
                optionItems: this.optionItems.moreOptionItems
            });
        }, 0);
    }
    render() {
        let items = [];
        this.state.optionItems.forEach(option => {
            items.push(
                <li
                    key={option.value}
                    onClick={this.onClick}
                    data-value={option.value}
                    className={ClassNames({
                        optionItem: true
                    })}>
                    {option.title}
                </li>
            );
        });
        let iconPart = null, content=null;
        if(items.length>0){
            iconPart=<i className="material-icons" onClick={this.toggleOpen}>more_horiz</i>;
            content = <div className="moreOptionDock moreOptionDockHTML">
                <BoundedTetherComp attachment={"top right"} appId={this.props.appId}>
                    <span className="moreOptionAttachPoint" />
                        {this.state.open && (
                            <div className="moreOptionsWrapperInner">
                                <div className={ClassNames({
                                    dvClPopUpWrapper: true,
                                    noir: this.state.theme === "noir",
                                    light: this.state.theme === "light"
                                })}>
                                    <ul>{items}</ul>
                                </div>
                            </div>
                        )}
                </BoundedTetherComp>
            </div>;
        }

        return (
            <Cell>
                <div className="moreOptionsWrapper">
                    {iconPart}
                    {content}
                </div>
            </Cell>
        )
    }
}

export class IconCallBackCell extends React.PureComponent {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
        this.close = this.close.bind(this);
        this._onIconDataUpdate = this._onIconDataUpdate.bind(this);
        this.state = {
            showDetail: false,
            popUpContent: "",
            theme: "light"
        };
    }
    componentWillMount() {
        this.store = S(this.props.appId)
        this.state.theme = this.store.getState().config.theme;
        this.unsubscriberCloseAllPopUp =  this.store.subscribeTo(this.store.CLOSE_ALL_POPUP, () => {
            this.setState({showDetail: false})
        });
    }
    componentWillUnmount(){
        this.unsubscriberCloseAllPopUp();
        if(this.subscriber) this.subscriber();
    }
    onClick(e) {
        e.stopPropagation();
        if (this.state.showDetail) {
            this.close();
        } else {
            this.subscriber = this.store.subscribeTo(this.store.ICON_CELL_CLICKED_ACTION, htmlContent => {
                this._onIconDataUpdate(htmlContent);
            });
            if (this.props.onIconClicked) {
                this.state.theme = this.store.getState().config.theme;
                this.props.onIconClicked(this.props.dataList[this.props.rowIndex], this.props.columnKey);
            }
        }
    }

    close() {
        this.setState({
            showDetail: false,
            popUpContent: ""
        });
    }

    _onIconDataUpdate(htmlContent) {
        this.setState({
            showDetail: true,
            popUpContent: htmlContent
        });
        // //now remove it
        this.subscriber();
    }

    render() {
        const { rowIndex, columnKey } = this.props;
        const cellValue = this.props.dataList[rowIndex][columnKey];
        let comp = null;

        let colPositionObj = new TableService().getColumnPosition(S(this.props.appId).getState(), columnKey);
        let position = 'center';
        if (colPositionObj.bFirst) {
            position = 'left';
        } else if (colPositionObj.bLast) {
            position = 'right';
        }

        if (cellValue)
            comp = (
                <span className="iconCallBackCellWrapper" onClick={this.onClick}>
                    {cellValue.includes('/') && <img src={cellValue} />}
                    {!cellValue.includes('/') && <i className="material-icons">{cellValue}</i>}
                    <BoundedTetherComp attachment={"middle " + position} appId={this.props.appId}>
                        <span className="iconActionAttachPoint" />
                        {this.state.showDetail && (
                            <div className={ClassNames({
                                dvClPopUpWrapper: true,
                                noir: this.state.theme === "noir",
                                light: this.state.theme === "light"
                            })}>
                                <i className="material-icons closeIcon" onClick={this.close}>
                                    clear
                                </i>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: this.state.popUpContent
                                    }}
                                />
                            </div>
                        )}
                    </BoundedTetherComp>
                </span>
            );
        return <Cell>{comp}</Cell>;
    }
}

export class SingleSelectActionCell extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            open: false,
            title: "",
            selectedValue: "",
            disabled: false
        };
        this.toggleOpen = this.toggleOpen.bind(this);
        this.selected = this.selected.bind(this);
    }
    toggleOpen(e) {
        // if there are other popups open, close them
        if (document.querySelector(".dvClPopUpWrapper")) {
            this.store.closeAllPopUp()
        }
        if (e) e.stopPropagation();
        if (!this.state.disabled) {
            this.setState({
                open: !this.state.open
            });
        }
    }
    selected(e) {
        this.setState({ title: this.columnConfig.getActionOptions(e).title, selectedValue: e });
        S(this.props.appId).updateSingleSelectAction(this.props.rowIndex, this.props.columnKey, e);
    }
    componentDidMount() {
        this._updateState();
        this.store = S(this.props.appId);
        this.unsubscriberCloseAllPopUp =  this.store.subscribeTo(this.store.CLOSE_ALL_POPUP, () => {
            this.setState({open: false})
        });
        this.unSubscribeCellData = this.store.subscribeTo(this.store.CELL_DATA_UPDATED, () => {
            //this is to set up externally the value for selected items
            let pasedInCellData = this.store.getState().passedInCellData;
            let rowKeyVal = pasedInCellData[0];
            let columnKey = pasedInCellData[1];
            let value = pasedInCellData[2];
            let primaryKey = this.store.getState().config.getPrimaryColumnKey();
            //not current column, do nothing
            if (this.props.columnKey !== columnKey) return;

            if (
                (Array.isArray(rowKeyVal) &&
                    rowKeyVal.includes(this.store.getState().dataList[this.props.rowIndex][primaryKey])) ||
                this.store.getState().dataList[this.props.rowIndex][primaryKey] === rowKeyVal
            ) {
                const option = this.columnConfig.getActionOptions(value);
                this.setState({
                    title: option ? option.title : "",
                    selectedValue: option ? option.value : ""
                });
            }
        });
    }
    componentWillUnmount() {
        this.unSubscribeCellData();
        this.unsubscriberCloseAllPopUp();
    }
    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex) this._updateState();
    }

    _updateState() {
        setTimeout(() => {
            this.columnConfig = S(this.props.appId)
                .getState()
                .config.getColumnConfig(this.props.columnKey);
            const dataList = S(this.props.appId).getState().dataList;
            if(dataList.length===0) return;
            const cellValue = dataList[this.props.rowIndex][this.props.columnKey];
            const option = this.columnConfig.getActionOptions(
                cellValue
            );
            const disabled = 'controllers' in this.columnConfig
                && 'disabled' in this.columnConfig.controllers
                && this.columnConfig.controllers.disabled(cellValue, dataList[this.props.rowIndex]);
            this.setState({
                title: option ? option.title : "",
                selectedValue: option ? option.value : "",
                disabled: disabled
            });
        }, 0);
    }

    render() {
        return (
            <Cell>
                <div className={ClassNames({ "dropDownActionWrapper": true, "dropDownActionWrapperDisabled": this.state.disabled })} onClick={this.toggleOpen}>
                    <span className="title">{this.state.title}</span>
                    <i className={ClassNames({ "material-icons": true, open: this.state.open, hidden: this.state.disabled })}>arrow_drop_down</i>
                    <hr className={ClassNames({ "dropdownSelectUnderline": true, hidden: this.state.disabled })}/>
                    <BoundedTetherComp attachment="top left" appId={this.props.appId}>
                        <span className="actionDropDownAttachPoint" />
                        {this.state.open && (
                            <SingleSelectOptions
                                close={this.toggleOpen}
                                selected={this.selected}
                                selectedValue={this.state.selectedValue}
                                {...this.props}
                                dataList={this.props.dataList}
                            />
                        )}
                    </BoundedTetherComp>
                </div>
            </Cell>
        );
    }
}

class SingleSelectOptions extends React.PureComponent {
    constructor() {
        super();
        this.close = this.close.bind(this);
        this.click = this.click.bind(this);
        this.state = {
            theme: "light"
        };
    }
    componentWillMount() {
        this.state.theme = S(this.props.appId).getState().config.theme;
    }
    close() {
        this.props.close();
    }
    click(e) {
        this.props.selected(e.target.getAttribute("data-value"));
        this.close();
    }
    render() {
        let items = [];
        const columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        const selectedValue = this.props.selectedValue;
        columnConfig.actionOptions.forEach(option => {
            items.push(
                <li
                    key={option.value}
                    onClick={this.click}
                    data-value={option.value}
                    className={ClassNames({
                        selectable: true,
                        selected: option.value === selectedValue
                    })}>
                    {option.title}
                </li>
            );
        });
        return (
            <div className={ClassNames({
                dvClPopUpWrapper: true,
                noir: this.state.theme == "noir",
                light: this.state.theme == "light"
            })}>
                <ul>{items}</ul>
            </div>
        );
    }
}

export class HtmlListExpandedCell extends React.PureComponent {
    constructor(props) {
        super(props);
        this.store = S(this.props.appId);
        this.update = this.update.bind(this);
        this.state = {}
    }
    componentDidMount() {
        this.update(this.props.rowIndex);
    }
    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex)
            this.update(nextProps.rowIndex);
    }
    update(rowIndex) {
        const { columnKey } = this.props;
        const service = new TableService();
        const checkingResults = service.analyzeHTMLListContent(this.props.dataList[rowIndex][columnKey]);
        const outerDiv = checkingResults.outerDiv;
        const innerDivs = checkingResults.innerDivs;

        let htmlComps = [];
        for (let i = 0; i < innerDivs.length; i++) {
            htmlComps.push(<HtmlListSingleClickableItem key={i} contents={innerDivs[i]} {...this.props} ></HtmlListSingleClickableItem>)
        }
        this.setState({
            htmlComps: htmlComps
        });
    }

    render() {
        return (
            <Cell>
                <div className="htmlListCellWrapper">
                    {this.state.htmlComps}
                </div>
            </Cell>
        )
    }

}

export class HtmlListCell extends React.PureComponent {
    constructor(props) {
        super(props);
        this.store = S(this.props.appId);
        this.toggleMore = this.toggleMore.bind(this);
        this.state = {
            showMore: false,
            htmlCnt: '',
            remainingCount: 0,
            position: 'center'
        };
        this.update = this.update.bind(this);
    }
    componentDidMount() {
        this.unsubscriberCloseAllPopUp =  this.store.subscribeTo(this.store.CLOSE_ALL_POPUP, () => {
            this.setState({showMore: false})
        });
        //now, let's set up listener to customConfigUpdate
        this.unsubscriber = this.store.subscribeTo(this.store.CUSTOM_CONFIG_UPDATE, state => {
            this.store = S(this.props.appId);
            let innerDivCounts = new TableService().calCountForInerDivs(this.state.innerDivs,
                this.store.getState().config.getColumnConfig(this.props.columnKey).width - 100);
            let htmlCnt = this.state.outerDiv;
            for (let i = 0; i < innerDivCounts; i++) {
                if (this.state.innerDivs[i]) {
                    htmlCnt += '<span style="float:left;margin-right:5px">' + this.state.innerDivs[i] + '</span>';
                }
            }
            htmlCnt += '</div>';
            let remainingCount = this.state.innerDivs.length - innerDivCounts;
            this.setState({
                htmlCnt: htmlCnt,
                remainingCount: remainingCount
            })
        });
        this.update(this.props.rowIndex);
    }
    componentWillUnmount() {
        this.unsubscriber();
        this.unsubscriberCloseAllPopUp();
    }

    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex)
            this.update(nextProps.rowIndex);
    }

    toggleMore(e) {
        if (document.querySelector(".dvClPopUpWrapper")) {
            this.store.closeAllPopUp()
        }
        if (e) e.stopPropagation();
        this.setState({
            showMore: !this.state.showMore
        });
    }

    update(rowIndex) {
        const { columnKey } = this.props;
        const service = new TableService();
        const checkingResults = service.analyzeHTMLListContent(this.props.dataList[rowIndex][columnKey]);
        const outerDiv = checkingResults.outerDiv;
        const innerDivs = checkingResults.innerDivs;

        let colPositionObj = new TableService().getColumnPosition(S(this.props.appId).getState(), columnKey);
        let position = 'center';
        if (colPositionObj.bFirst) {
            position = 'left';
        } else if (colPositionObj.bLast) {
            position = 'right';
        }
        //here, we need to leve same extra space for +/-2

        let innerDivCounts = service.calCountForInerDivs(innerDivs, this.props.columnWidth - 50);

        let htmlCnt = outerDiv;
        for (let i = 0; i < innerDivCounts; i++) {
            if (innerDivs[i]) {
                htmlCnt += '<span style="float:left;margin-right:5px">' + innerDivs[i] + '</span>';
            }
        }
        htmlCnt += '</div>';
        let remainingCount = innerDivs.length - innerDivCounts;


        let htmlComps = [];
        for (let i = 0; i < innerDivCounts; i++) {
            htmlComps.push(<HtmlListSingleClickableItem key={i} contents={innerDivs[i]} {...this.props} ></HtmlListSingleClickableItem>)
        }

        this.setState({
            htmlCnt: htmlCnt,
            htmlComps: htmlComps,
            remainingCount: remainingCount,
            outerDiv: outerDiv,
            innerDivs: innerDivs,
            position: position
        });

    }

    render() {
        return (
            <Cell>
                <div className="htmlListCellWrapper">
                    {this.props.onListItemClick ? this.state.htmlComps : null}
                    {!this.props.onListItemClick ? <span
                        dangerouslySetInnerHTML={{
                            __html: this.state.htmlCnt
                        }}
                    /> : null}
                    {this.state.remainingCount > 0 ? (
                        <span onClick={this.toggleMore} className="moreHook tooltipWrapper htmlListToggler">
                            {this.state.showMore ? "-" : "+"}
                            {this.state.remainingCount}
                        </span>
                    ) : null}
                    <div className="toolTipDock toolTipDockHTML">
                        <BoundedTetherComp attachment={"middle " + this.state.position} appId={this.props.appId}>
                            <span className="tooltipAttachPoint" />
                            {this.state.showMore && (
                                <HtmlListCellItems {...this.props} close={this.toggleMore} htmlDivs={this.state.innerDivs} />
                            )}
                        </BoundedTetherComp>
                    </div>
                </div>
            </Cell>
        )
    }
}

class HtmlListSingleClickableItem extends React.PureComponent {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
    }
    onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.props.onListItemClick(this.props.contents)
    }
    render() {
        return <span
            className='clickable'
            onClick={this.onClick}
            dangerouslySetInnerHTML={{
                __html: this.props.contents
            }}
        />
    }
}

class HtmlListCellItems extends React.PureComponent {
    constructor() {
        super();
        this.close = this.close.bind(this);
        this.state = {
            theme: "light"
        };
    }
    componentWillMount() {
        this.state.theme = S(this.props.appId).getState().config.theme;
    }
    close() {
        this.props.close();
    }
    render() {

        let items = [];
        this.props.htmlDivs.map((item, index) => {
            items.push(<li key={index} className='listItem'> <span
                dangerouslySetInnerHTML={{
                    __html: item
                }}
            /> </li>);
        });

        return (
            <div className={ClassNames({
                dvClPopUpWrapper: true,
                htmlList: true,
                noir: this.state.theme == "noir",
                light: this.state.theme == "light"
            })}>
                <i className="material-icons closeIcon" onClick={this.close}>
                    clear
                </i>
                <ul>{items}</ul>
            </div>
        );
    }
}


export class ListCell extends React.PureComponent {
    constructor(props) {
        super(props);
        this.store = S(this.props.appId);
        this.toggleMore = this.toggleMore.bind(this);
        this.state = {
            showMore: false,
            textCnt: '',
            remainingCount: 0,
            position: 'center'
        };
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        this.unsubscriberCloseAllPopUp =  this.store.subscribeTo(this.store.CLOSE_ALL_POPUP, () => {
            this.setState({showMore: false})
        });
        //now, let's set up listener to customConfigUpdate
        this.unsubscriber = this.store.subscribeTo(this.store.CUSTOM_CONFIG_UPDATE, state => {
            this.store = S(this.props.appId);
            const service = new TableService();
            let innerDivCounts = service.calCountForInerDivs(this.state.innerDivs,
                this.store.getState().config.getColumnConfig(this.props.columnKey).width - 70);
            let textCnts = [];
            for (let i = 0; i < innerDivCounts; i++) {
                textCnts.push(this.state.innerDivs[i]);
            }
            let remainingCount = this.state.innerDivs.length - innerDivCounts;
            this.setState({
                textCnt: textCnts.join(","),
                remainingCount: remainingCount
            })
        });
        this.update(this.props.rowIndex);
    }
    componentWillUnmount() {
        this.unsubscriber();
        this.unsubscriberCloseAllPopUp();
    }

    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex)
            this.update(nextProps.rowIndex);
    }

    toggleMore(e) {
        // if there are other popups open, close them
        if (document.querySelector(".dvClPopUpWrapper")) {
            this.store.closeAllPopUp()
        }
        if (e) e.stopPropagation();
        this.setState({
            showMore: !this.state.showMore
        });
    }

    update(rowIndex) {
        const { columnKey } = this.props;
        const service = new TableService();
        const innerDivs = service.analyzeTextListContent(this.props.dataList[rowIndex][columnKey]);

        let colPositionObj = new TableService().getColumnPosition(S(this.props.appId).getState(), columnKey);
        let position = 'center';
        if (colPositionObj.bFirst) {
            position = 'left';
        } else if (colPositionObj.bLast) {
            position = 'right';
        }
        //here, we need to leve same extra space for +/-2

        let innerDivCounts = service.calCountForInerDivs(innerDivs, this.props.columnWidth - 70);

        let textCnts = [];
        for (let i = 0; i < innerDivCounts; i++) {
            textCnts.push(innerDivs[i]);
        }
        let remainingCount = innerDivs.length - innerDivCounts;

        this.setState({
            textCnt: textCnts.join(","),
            remainingCount: remainingCount,
            position: position,
            innerDivs: innerDivs
        });

    }

    render() {
        const { rowIndex, columnKey } = this.props;
        let items = [];
        let deliminator = S(this.props.appId).getState().config.listDeliminator;

        if (this.props.dataList[rowIndex][columnKey]) items = this.props.dataList[rowIndex][columnKey].split(deliminator);

        let colPositionObj = new TableService().getColumnPosition(S(this.props.appId).getState(), columnKey);
        let position = 'center';
        if (colPositionObj.bFirst) {
            position = 'left';
        } else if (colPositionObj.bLast) {
            position = 'right';
        }

        const partialListText = (this.state.remainingCount > 1)
            ? this.state.textCnt + ","
            : this.state.textCnt;

        return (
            <Cell>
                <div className="hookCell">
                    {partialListText}
                    {this.state.remainingCount >= 1 ? (
                        <span onClick={this.toggleMore} className="moreHook tooltipWrapper">
                            {this.state.showMore ? "-" : "+"}
                            {this.state.remainingCount}
                        </span>
                    ) : null}
                    <div className="toolTipDock">
                        <BoundedTetherComp attachment={"middle left"} appId={this.props.appId}>
                            <span className="tooltipAttachPoint" />
                            {this.state.showMore && (
                                <ListCellItems {...this.props} close={this.toggleMore} items={this.props.dataList[rowIndex][columnKey]} />
                            )}
                        </BoundedTetherComp>
                    </div>
                </div>
            </Cell>
        );
    }
}

class ListCellItems extends React.PureComponent {
    constructor() {
        super();
        this.close = this.close.bind(this);
        this.state = {
            theme: "light"
        };
    }
    componentWillMount() {
        this.state.theme = S(this.props.appId).getState().config.theme;
    }
    close() {
        this.props.close();
    }
    render() {
        let items = [];
        this.props.items.split(",").map((item, index) => {
            items.push(<li key={index}>{item}</li>);
        });

        return (
            <div className={ClassNames({
                dvClPopUpWrapper: true,
                noir: this.state.theme === "noir",
                light: this.state.theme === "light"
            })}>
                <i className="material-icons closeIcon" onClick={this.close}>
                    clear
                </i>
                <ul>{items}</ul>
            </div>
        );
    }
}

export class ToolTipTextCell extends React.PureComponent {
    constructor() {
        super();
        this.showToolTip = this.showToolTip.bind(this);
        this.hideToolTip = this.hideToolTip.bind(this);
        this.state = {
            openTooltip: false
        };
    }
    showToolTip() {
        this.setState({ openTooltip: true });
    }
    hideToolTip() {
        this.setState({ openTooltip: false });
    }

    render() {
        const { rowIndex, columnKey } = this.props;

        const colPositionObj = new TableService().getColumnPosition(S(this.props.appId).getState(), columnKey);
        let position = 'center';
        if (colPositionObj.bFirst) {
            position = 'left';
        } else if (colPositionObj.bLast) {
            position = 'right';
        }

        const textClass = ClassNames({
            autoEllipse: true,
            tooltipWrapper: true
        });

        return (
            <Cell>
                <div className='textCell textTooltipCell'>
                    <div className={textClass}
                        onMouseEnter={this.showToolTip}
                        onMouseLeave={this.hideToolTip}
                    >
                        {this.props.dataList[rowIndex][columnKey]}
                        <div className="toolTipDock">
                            <BoundedTetherComp className="dvTetheredToolTip" attachment={"middle " + position} appId={this.props.appId}>
                                <span className="tooltipAttachPoint" />
                                {this.state.openTooltip && <ToolTipComp {...this.props} content={this.props.dataList[rowIndex][columnKey]} />}
                            </BoundedTetherComp>
                        </div>
                    </div>
                </div>
            </Cell>
        );
    }
}

export class ToolTipComp extends React.PureComponent {
    render() {
        return <div className={ClassNames({
            dvClPopUpWrapper: true,
            htmlList: true,
            dvTooltipText: true,
            noir: S(this.props.appId).getState().config.theme == "noir",
            light: S(this.props.appId).getState().config.theme == "light"
        })} dangerouslySetInnerHTML={{
            __html: this.props.content
        }} />;
    }
}

export class TextCell extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            editing: false
        };
    }
    render() {
        const { rowIndex, columnKey } = this.props;
        const columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        return (
            <Cell>
                {!columnConfig.editable && <div className="textCell">{this.props.dataList[rowIndex][columnKey]}</div>}
                {columnConfig.editable &&
                    <div className='editableCellWrapper'>
                        <div className="textCell">{this.props.dataList[rowIndex][columnKey]}</div>
                    </div>
                }
            </Cell>
        );
    }
}

export class NumberCell extends React.PureComponent {
    constructor() {
        super();
    }

    render() {
        const { rowIndex, columnKey } = this.props;
        const columnConfig = S(this.props.appId)
            .getState()
            .config.getColumnConfig(this.props.columnKey);
        const svc =  new TableService();
        return (
            <Cell>
                <div className="textCell">
                    {this.props.dataList[rowIndex][columnKey] ? svc.formatNumber(this.props.dataList[rowIndex][columnKey],columnConfig)  : 0}
                </div>
            </Cell>
        );
    }
}

export class ToolTipHtmlCell extends React.PureComponent {

    constructor() {
        super();
        this.showToolTip = this.showToolTip.bind(this);
        this.hideToolTip = this.hideToolTip.bind(this);
        this.state = {
            openTooltip: false
        };
    }
    showToolTip() {
        this.setState({ openTooltip: true });
    }
    hideToolTip() {
        this.setState({ openTooltip: false });
    }

    render() {
        const { rowIndex, columnKey } = this.props;


        let colPositionObj = new TableService().getColumnPosition(S(this.props.appId).getState(), columnKey);
        let position = 'center';
        if (colPositionObj.bFirst) {
            position = 'left';
        } else if (colPositionObj.bLast) {
            position = 'right';
        }

        return (
            <Cell>
                <div className='htmlCell htmlTooltipCell'>
                    <div
                        className={ClassNames({
                            autoEllipse: true,
                            tooltipWrapper: true
                        })}
                        onMouseEnter={this.showToolTip}
                        onMouseLeave={this.hideToolTip}
                    >
                        <span dangerouslySetInnerHTML={{__html: this.props.dataList[rowIndex][columnKey]}}/>
                        <div className='toolTipDock'>
                            <BoundedTetherComp className="dvTetheredToolTip" attachment={"middle " + position} appId={this.props.appId}>
                                <span className="tooltipAttachPoint" />
                                {this.state.openTooltip && <ToolTipComp {...this.props} content={this.props.dataList[rowIndex][columnKey]} />}
                            </BoundedTetherComp>
                        </div>
                    </div>
                </div>
            </Cell>
        );
    }
}
export class HtmlCell extends React.PureComponent {
    render() {
        const { rowIndex, columnKey } = this.props;
        return (
            <Cell>
                <div
                    className="htmlCell"
                    dangerouslySetInnerHTML={{
                        __html: this.props.dataList[rowIndex][columnKey]
                    }}
                />
            </Cell>
        );
    }
}

export class PureClickableCell extends React.PureComponent {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
        this.updateClickable=this.updateClickable.bind(this);
        this.state = {
            unClickable: false
        };
        this.service = new TableService();
    }

    onClick(e) {
        e.stopPropagation();
        if (this.props.onCellClicked && !this.state.unClickable) {
            this.props.onCellClicked(this.props.dataList[this.props.rowIndex], this.props.columnKey);
        }
    }

    updateClickable(){
        const unClickableCells = this.store.getState().unClickableCells;
        this.setState({
            unClickable: this.props.columnKey in unClickableCells
                && unClickableCells[this.props.columnKey].includes(
                    this.service.getRowKeyValFromIndex(this.props.rowIndex, this.store.getState())
                )
        });
    }

    componentDidMount() {
        this.store = S(this.props.appId);
        this.unsubscriber = this.store.subscribeTo(this.store.UNCLICKABLE_CELLS_UPDATED, () => {
            this.updateClickable();
        });
        this.updateClickable();
    }
    componentWillUnmount() {
        this.unsubscriber();
    }
    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex) {
            // using nextProps.rowIndex as real rowIndex
            const unClickableCells = this.store.getState().unClickableCells;
            this.setState({
                unClickable: this.props.columnKey in unClickableCells
                    && unClickableCells[this.props.columnKey].includes(
                        this.service.getRowKeyValFromIndex(nextProps.rowIndex, this.store.getState())
                    )
            });
        }
    }
    render() {
        const { rowIndex, columnKey } = this.props;

        return (
            <Cell>
                <div
                    onClick={this.onClick}
                    dangerouslySetInnerHTML={{
                        __html: this.props.dataList[rowIndex][columnKey]
                    }}
                />
            </Cell>
        );
    }
}

export class ClickableCell extends React.PureComponent {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
        this.updateClickable=this.updateClickable.bind(this);
        this.state = {
            unClickable: false
        };
        this.service = new TableService();
    }

    onClick(e) {
        e.stopPropagation();
        if (this.props.onCellClicked && !this.state.unClickable) {
            this.props.onCellClicked(this.props.dataList[this.props.rowIndex], this.props.columnKey);
        }
    }

    updateClickable(){
        const unClickableCells = this.store.getState().unClickableCells;
        this.setState({
            unClickable: this.props.columnKey in unClickableCells
                && unClickableCells[this.props.columnKey].includes(
                    this.service.getRowKeyValFromIndex(this.props.rowIndex, this.store.getState())
                )
        });
    }

    componentDidMount() {
        this.store = S(this.props.appId);
        this.unsubscriber = this.store.subscribeTo(this.store.UNCLICKABLE_CELLS_UPDATED, () => {
            this.updateClickable();
        });
        this.updateClickable();
    }
    componentWillUnmount() {
        this.unsubscriber();
    }
    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex) {
            // using nextProps.rowIndex as real rowIndex
            const unClickableCells = this.store.getState().unClickableCells;
            this.setState({
                unClickable: this.props.columnKey in unClickableCells
                    && unClickableCells[this.props.columnKey].includes(
                        this.service.getRowKeyValFromIndex(nextProps.rowIndex, this.store.getState())
                    )
            });
        }
    }
    render() {
        const { rowIndex, columnKey } = this.props;

        return (
            <Cell>
                <div
                    className={ClassNames({
                        "autoEllipse": true,
                        "clickableCell": !this.state.unClickable
                    })}
                    onClick={this.onClick}
                    dangerouslySetInnerHTML={{
                        __html: this.props.dataList[rowIndex][columnKey]
                    }}
                />
            </Cell>
        );
    }
}

export class CollapseHeaderCell extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            allOpened: false
        };
        this._toggle = this._toggle.bind(this);
    }
    _toggle() {
        this.props.callback(!this.state.allOpened);
        this.setState({
            allOpened: !this.state.allOpened
        });
    }
    render() {
        return (
            <Cell>
                <div
                    onClick={e => {
                        e.stopPropagation();
                        this._toggle();
                    }}
                    className="collapseToggler headerControllerIcon">
                    <i
                        className={ClassNames({
                            "material-icons": true,
                            array_right: !this.state.allOpened,
                            array_right_down: this.state.allOpened
                        })}>
                        arrow_right
                    </i>
                </div>
            </Cell>
        );
    }
}

export class CollapseCell extends React.PureComponent {
    constructor() {
        super();
        this.service = new TableService();
        this._toggleRow = this._toggleRow.bind(this);
    }

    componentDidMount() {
        this.store = S(this.props.appId);
        this.unsubscriber = this.store.subscribeTo(this.store.TOGGLE_ALL_ROWS, () => {
            if (this.service.isRowSelected(this.props.rowIndex, this.store.getState())) this._toggleRow();
        });
    }

    _toggleRow() {
        this.props.callback(this.props.rowIndex);
    }

    componentWillUnmount() {
        this.unsubscriber();
    }

    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        // if(this.props.rowIndex !== nextProps.rowIndex &&
        //     this.store.getState().allOpened){
        //     this._toggleRow();
        // }
    }

    render() {
        const { collapsedRows, rowIndex, callback } = this.props;
        return (
            <Cell>
                <div
                    onClick={e => {
                        e.stopPropagation();
                        this._toggleRow();
                    }}
                    className="collapseToggler">
                    <i
                        className={ClassNames({
                            "material-icons": true,
                            array_right: !collapsedRows.has(rowIndex),
                            array_right_down: collapsedRows.has(rowIndex)
                        })}>
                        arrow_right
                    </i>
                </div>
            </Cell>
        );
    }
}

export class ColumnCheckBoxCell extends Component {
    constructor() {
        super();
        this.state = {
            checked: false
        };
        this._onChange = this._onChange.bind(this);
        this.service = new TableService();
    }

    componentDidMount() {
        this.store = S(this.props.appId);
        this.unSubscribeSelectAll = this.store.subscribeTo(this.store.ROW_ALL_SELECTED, () => {
            let stateObj = {};
            stateObj["checked"] = this.store.getState().rowAllSelected;
            this.setState(stateObj);
        });
        if (!this.store.getState().config.deCoupleRowSelectAndCheckbox) {
            this.setState({
                checked: this.service.isRowSelected(this.props.rowIndex, this.store.getState())
            });
            this.unSubscribRowSelected = this.store.subscribeTo(this.store.ROW_SELECTED, () => {
                this.setState({
                    checked: this.service.isRowSelected(this.props.rowIndex, S(this.props.appId).getState())
                });
            });
            this.unSubscribeSingleRowSelected = this.store.subscribeTo(this.store.SINGLE_ROW_SELECTED, () => {
                this.setState({
                    checked: this.service.isRowSelected(this.props.rowIndex, S(this.props.appId).getState())
                });
            });
        }
    }

    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex) {
            // using nextProps.rowIndex as real rowIndex
            this.setState({
                checked: this.service.isRowSelected(nextProps.rowIndex, S(this.props.appId).getState())
            });
        }
    }

    componentWillUnmount() {
        this.unSubscribeSelectAll();
        if (!this.store.getState().config.deCoupleRowSelectAndCheckbox) {
            this.unSubscribRowSelected();
            this.unSubscribeSingleRowSelected();
        }
    }

    _onChange(e) {
        this.setState({ checked: e.target.checked });
        if (!this.store.getState().config.deCoupleRowSelectAndCheckbox) {
            //we only toggle here if no decouple
            this.store.toggleRowSelected(this.props.rowIndex);
        } else {
            //otherwise, we will dispatch different event
            this.store.toggleCheckBoxChanged(this.props.rowIndex, e.target.checked);
        }
    }

    render() {
        return (
            <Cell>
                <Checkbox key={this.props.rowIndex}  onChange={this._onChange}/>
            </Cell>
        );
    }
}

export class ColumnRadioButtonCell extends Component {
    constructor() {
        super();
        this.state = {
            checked: false
        };
        this._onChange = this._onChange.bind(this);
        this.service = new TableService();
    }

    componentDidMount() {
        this.store = S(this.props.appId);
        if (!this.store.getState().config.deCoupleRowSelectAndCheckbox) {
            this.setState({
                checked: this.service.isRowSelected(this.props.rowIndex, this.store.getState())
            });
            this.unSubscribeRowSelected = this.store.subscribeTo(this.store.ROW_SELECTED, () => {
                this.setState({
                    checked: this.service.isRowSelected(this.props.rowIndex, S(this.props.appId).getState())
                });
            });
            this.unSubscribeSingleRowSelected = this.store.subscribeTo(this.store.SINGLE_ROW_SELECTED, () => {
                this.setState({
                    checked: this.service.isRowSelected(this.props.rowIndex, S(this.props.appId).getState())
                });
            });
        } else if (this.store.getState().config.enableRadioButton) {
            this.unSubscribeCheckBoxChecked = this.store.subscribeTo(this.store.CHECKBOX_CHECKED, () => {
                this.setState({
                    checked: this.service.isRowChecked(this.props.rowIndex, S(this.props.appId).getState())
                });
            });
        }
    }

    //must put here to prevent repeated display of checkbox, it is because reusing...
    componentWillReceiveProps(nextProps) {
        if (this.props.rowIndex !== nextProps.rowIndex) {
            // using nextProps.rowIndex as real rowIndex
            this.setState({
                checked: this.service.isRowSelected(nextProps.rowIndex, S(this.props.appId).getState())
            });
        }
    }

    componentWillUnmount() {
        if (!this.store.getState().config.deCoupleRowSelectAndCheckbox) {
            this.unSubscribeRowSelected();
            this.unSubscribeSingleRowSelected();
        } else if (this.store.getState().config.enableRadioButton) {
            this.unSubscribeCheckBoxChecked();
        }
    }

    _onChange(e) {
        this.setState({ checked: e.target.checked });
        if (!this.store.getState().config.deCoupleRowSelectAndCheckbox) {
            //we only toggle here if no decouple
            this.store.toggleRowSelected(this.props.rowIndex);
        } else {
            //otherwise, we will dispatch different event
            this.store.toggleCheckBoxChanged(this.props.rowIndex, e.target.checked);
        }
    }

    render() {
        const decoupleSelection = e => {
            if (this.store.getState().config.deCoupleRowSelectAndCheckbox) {
                e.stopPropagation();
            }
        };
        return (
            <Cell>
                <div onClick={e => decoupleSelection(e)}>
                    Radio
                </div>
            </Cell>
        );
    }
}
// <Radio key={this.props.rowIndex} checked={this.state.checked} value="null" onChange={this._onChange} />
export class ColumnHeaderCheckBoxCell extends Component {
    constructor() {
        super();
        this.state = {
            checked: false
        };
        this.service = new TableService();
        this._onChange = this._onChange.bind(this);
        this._rowChecked = this._rowChecked.bind(this);
    }

    componentDidMount() {
        this.store = S(this.props.appId);
        this.unSubscriberSelectOne = this.store.subscribeTo(this.store.ROW_SELECTED, state => {
            this._rowChecked();
        });
        //UI-2976-Clearn
        this.unSubscriberSelectAll = this.store.subscribeTo(this.store.ROW_ALL_SELECTED, state => {
            this._rowChecked();
        });
    }
    componentWillUnmount() {
        this.unSubscriberSelectOne();
        this.unSubscriberSelectAll();
    }
    _rowChecked() {
        this.setState({
            checked: this.service.isAllRowSelected(
                this.store.getState().dataList,
                this.store.getState().config,
                this.store.getState().selectedRowKeys
            )
        });
    }
    _onChange() {
        let newChecked = !this.state.checked;
        this.setState({ checked: newChecked });
        this.store.setRowAllSelected(newChecked);
        //this is to enable row hight
        setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 0);
    }

    render() {
        return (
            <Cell>
                <Checkbox
                    className="headerCellCheckbox headerControllerIcon"
                    key={this.props.rowIndex}
                    checked={this.state.checked}
                    onChange={this._onChange}
                />
            </Cell>
        );
    }
}
export class NavigateCell extends React.PureComponent {
    constructor() {
        super();
        this._click = this._click.bind(this);
        this.service = new TableService();
        this._rowChecked = this._rowChecked.bind(this);
        this.state = {
            rowSelected: false,
            height: 0,
            width: 0
        };
    }

    componentDidMount() {
        this.store = S(this.props.appId);
        this.setState({ width: 50, height: this.store.getState().config.rowHeight });
        this.unSubscriberSelectRow = this.store.subscribeTo(this.store.ROW_SELECTED, state => {
            this._rowChecked();
        });
        this.unSubscriberSelectAllRow = this.store.subscribeTo(this.store.ROW_ALL_SELECTED, state => {
            this._rowChecked();
        });
        this._rowChecked();
    }

    componentWillUnmount() {
        this.unSubscriberSelectRow();
        this.unSubscriberSelectAllRow();
    }

    _rowChecked() {
        this.setState({
            rowSelected: this.service.isRowSelected(this.props.rowIndex, this.store.getState())
        });
    }

    _click(e) {
        e.stopPropagation();
        if ("onNavigate" in this.props) {
            this.props.onNavigate(this.props.dataList[this.props.rowIndex]);
        }
    }

    render() {
        return (
            <Cell>
                <div
                    style={{
                        width: this.state.width,
                        height: this.state.height
                    }}
                    className={ClassNames({ navWrapper: true, navWrapperSelected: this.state.rowSelected })}
                    onClick={this._click}>
                    <i className="material-icons">arrow_forward</i>
                </div>
            </Cell>
        );
    }
}
