const stripHtml = function (html) {
    var temporalDivElement = document.createElement("div");
    temporalDivElement.innerHTML = html;
    var pureText= temporalDivElement.textContent || temporalDivElement.innerText || "";
    var pureText = pureText.replace(/\"/g, "'");
    return pureText;
}

const CsvGenerator = function (dataArrayObj, fileName, separator, addQuotes, downloadColumns) {
    if (downloadColumns) {
        this.titles = downloadColumns;
    } else {
        this.titles = Object.keys(dataArrayObj[0]);
    }

    this.dataArray = [];
    this.fileName = fileName;
    this.separator = separator || ',';
    this.addQuotes = !!addQuotes;
    if (this.addQuotes) {
        this.separator = '"' + this.separator + '"';
    }
    this.getDownloadLink = function () {
        var separator = this.separator;
        var addQuotes = this.addQuotes;
        var rows = [];
        var rowData;

        //adding title first
        let row = [];
        this.titles.forEach(title => {
            row.push(title);
        });
        rowData = row.join(separator);
        rows.push('"' + rowData + '"');

        dataArrayObj.forEach(dataItem => {
            row = [];
            //if passed is list of array, then no key exists
            if (Array.isArray(dataItem)) {
                dataItem.forEach(val => {
                    row.push(val);
                });
            } else {
                this.titles.forEach(title => {
                    row.push(stripHtml(dataItem[title]));
                });
            }
            rowData = row.join(separator);
            if (rowData.length && addQuotes) {
                rows.push('"' + rowData + '"');
            }
        });

        var type = 'data:text/csv;charset=utf-8';
        var data = rows.join('\n');

        if (typeof btoa === 'function') {
            type += ';base64';
            data = btoa(unescape(encodeURIComponent(data)));
        } else {
            data = encodeURIComponent(data);
        }

        return this.downloadLink = this.downloadLink || type + ',' + data;
    };

    this.getLinkElement = function (linkText) {
        var downloadLink = this.getDownloadLink();
        var fileName = this.fileName;
        this.linkElement = this.linkElement || (function () {
            var a = document.createElement('a');
            a.innerHTML = linkText || '';
            a.href = downloadLink;
            a.download = fileName;
            return a;
        }());
        return this.linkElement;
    };
    // call with removeAfterDownload = true if you want the link to be removed after downloading
    this.download = function (removeAfterDownload) {
        var linkElement = this.getLinkElement();
        linkElement.style.display = 'none';
        document.body.appendChild(linkElement);
        linkElement.click();
        if (removeAfterDownload) {
            document.body.removeChild(linkElement);
        }
    };
};
export default CsvGenerator;
