import React, { Component } from "react";
import S from "../redux/store";
import Button from 'muicss/lib/react/button';
import CsvGenerator from "../../common/csv_generator";
import { Portal } from "react-portal";
import Radio from 'muicss/lib/react/radio';
import Input from 'muicss/lib/react/input';
// import { RadioGroup, Radio, Textfield } from "react-mdl";


class DownloadOptionComp extends Component {
    constructor() {
        super();
        this.setOffset = this.setOffset.bind(this);
        this.close = this.close.bind(this);
        this.download = this.download.bind(this);
        this.selectRecords = this.selectRecords.bind(this);
        this.state = {
            pageSize: 0,
            selectedCounts: "current",
            offset: 0,
            offsetError: false
        };
    }
    componentDidMount() {
        this.store = S(this.props.appId);
        const globalDownloadConfig = this.store.getState().globalDownloadConfig;
        if (globalDownloadConfig) {
            this.setState({
                offset: globalDownloadConfig.offset,
                selectedCounts: globalDownloadConfig.selectedCounts
            });
        }
        this.setState({
            pageSize: this.store.getState().page.pageSize
        })
    }
    close() {
        this.props.onClosePopup();
    }
    download() {
        if (!isNaN(this.state.selectedCounts) && this.state.offsetError) {
        } else {
            this.props.onConfirmDownload(this.state.selectedCounts, this.state.offset);
        }
    }
    selectRecords(e) {
        if (isNaN(e.target.value)) {
            this.setState({
                offsetError: false,
                offset: 0
            })
        }
        this.setState({
            selectedCounts: e.target.value
        })
    }
    setOffset(e) {
        const reg = /^\d+$/;
        if (!reg.test(e.target.value) && e.target.value.trim() !== '') {
            this.setState({
                offsetError: true,
                offset: e.target.value
            })
        } else {
            this.setState({
                offsetError: false,
                offset: e.target.value
            });
        }
    }
    render() {
        return (
            <div className="downloadContent">
                <div className="closeBtn" onClick={this.close}>
                    <i className="material-icons">clear</i>
                </div>
                <div>Download Options</div>

                <Radio name="numRecords" value="current" label="Current">Current</Radio>
                <Radio name="numRecords" value="100" label="100">100 Records</Radio>
                <Radio name="numRecords" value="200" label="200">200 Records</Radio>
                <Radio name="numRecords" value="300" label="300">300 Records</Radio>
                <Radio name="numRecords" value="400" label="400">400 Records</Radio>
                <Radio name="numRecords" value="500" label="500">500 Records</Radio>
                <Radio name="numRecords" value="1000" label="1000">1000 Records</Radio>
                <Radio name="numRecords" value="3000" label="3000">3000 Records</Radio>
                <Radio name="numRecords" value="5000" label="5000">5000 Records</Radio>
                <Radio name="numRecords" value="10000" label="10000">10000 Records</Radio>
                <Radio name="numRecords" value="20000" label="20000">20000 Records</Radio>
                    <Input
                        defaultValue={this.state.offset}
                        onChange={this.setOffset}
                        label="Offset Records"
                        floatingLabel
                    />
                    

                {this.state.offsetError && <div className='offsetError'>Invalid Offset Number</div>}
                {!this.state.offsetError && <div>
                    <Button variant="raised" color="primary" onClick={this.download}>
                        Confirm
                    </Button>

                </div>}

            </div>
        )
    }
}

// <RadioGroup container="ul" childContainer="li" name="otptionDownload" value={this.state.selectedCounts} onChange={this.selectRecords}>
//     <Radio value="current">Current</Radio>
//     <Radio value="100">100 Records</Radio>
//     <Radio value="200">200 Records</Radio>
//     <Radio value="300">300 Records</Radio>
//     <Radio value="400">400 Records</Radio>
//     <Radio value="500">500 Records</Radio>
//     <Radio value="1000">1000 Records</Radio>
//     <Radio value="3000">3000 Records</Radio>
//     <Radio value="5000">5000 Records</Radio>
//     <Radio value="10000">10000 Records</Radio>
//     <Radio value="20000">20000 Records</Radio>
// </RadioGroup>
// {!isNaN(this.state.selectedCounts) &&
//     <Textfield
//         value={this.state.offset}
//         onChange={this.setOffset}
//         label="Offset Records"
//         floatingLabel
//     />}


// <Button raised colored onClick={this.download}>
//     Confirm
//     </Button>
class DownloadComp extends Component {
    constructor() {
        super();
        this.download = this.download.bind(this);
        this.getDownloadColumns = this.getDownloadColumns.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.confirmDownload = this.confirmDownload.bind(this);
        this._download = this._download.bind(this);
        this.state = {
            isOpen: false,
            downloading: false,
            btnTitle: 'Export'
        }
    }
    componentDidMount() {
        this.store = S(this.props.appId);
        if (this.store.getState().config.global) {
            let _this = this;
            this.unSubscribeDownload = this.store.subscribeTo(this.store.SET_DOWNLOAD_DATA, () => {
                this.setState({
                    btnTitle: 'Export'
                });
                if (this.store.getState().downloadDataList.length > 0) {
                    this._download(this.store.getState().downloadDataList);
                }
            });
        }
    }
    componentWillUnmount() {
        if (this.unSubscribeDownload) {
            this.unSubscribeDownload();
        }
    }
    getDownloadColumns() {
        let state = this.store.getState();
        let columns = state.customConfig.columnsOrder;
        if (!columns || columns.length == 0) {
            columns = Object.keys(state.dataList[0]);
        }
        let outputColumns = [];
        columns.map((columnKey, i) => {
            if (state.config.columnToBeDownloaded(columnKey)) {
                outputColumns.push(columnKey);
            }
        });
        return outputColumns;
    }
    download() {
        //if it is global retrieval, we need to let user select rows
        if (this.store.getState().config.global) {
            this.setState({
                isOpen: true
            })
        } else {
            this._download();
        }
    }
    _download(dataList) {
        if (!dataList) {
            dataList = this.store.getState().dataList;
        }
        let csvGenerator = new CsvGenerator(dataList, 'export.csv', ",", true, this.getDownloadColumns());
        csvGenerator.download(true);
    }
    closePopup() {
        this.setState({
            isOpen: false
        })
    }
    confirmDownload(records, offset) {
        //saving to store
        this.store.setGlobalDownloadConfig({
            offset: offset,
            selectedCounts: records
        });
        if (records === 'current') {
            //this is current data view records, download directly
            this._download();
        } else {
            if (this.props.onGlobalDownload) {
                this.setState({
                    btnTitle: 'Exporting'
                });
                this.props.onGlobalDownload(records, offset);
            }
        }
        this.setState({
            isOpen: false
        })
    }
    render() {
        return (
            <div className='downloadBtnWrapper'>
                <Button variant="raised" color="primary" onClick={this.download}>
                    <i className='material-icons'>arrow_downward</i>
                    {this.state.btnTitle}
                </Button>
                <span id={"hook_download_" + this.props.appId} className="downlowOptionWrapper" />
                {this.state.isOpen && (
                    <Portal node={document && document.getElementById("hook_download_" + this.props.appId)}>
                        <DownloadOptionComp {...this.props} onClosePopup={this.closePopup} onConfirmDownload={this.confirmDownload} />
                    </Portal>
                )}
            </div>
        )
    }
}
// <Button className='downloadBtn' ripple raised colored onClick={this.download}>
//     <i className='material-icons'>arrow_downward</i>
//     {this.state.btnTitle}
// </Button>
export default DownloadComp;
