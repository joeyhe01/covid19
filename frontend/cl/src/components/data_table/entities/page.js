export default class Page {
    constructor(data) {
        if (data) {
            this["total"] = "total" in data ? data["total"] : 0;
            this["pageSize"] = "pageSize" in data ? data["pageSize"] : 20;
            this["currentPage"] = "currentPage" in data ? data["currentPage"] : 1;
            this["totalPage"] = 0;
        } else {
            this["total"] = 0;
            this["pageSize"] = 20;
            this["currentPage"] = 1;
            this["totalPage"] = 0;
        }
    }
    reset() {
        this.total = 0;
        this.currentPage = 1;
        this.totalPage = 0;
    }
    setTotal(total) {
        this.total = total;
        if (total % this.pageSize === 0) {
            this.totalPage = total / this.pageSize;
        } else {
            this.totalPage = Math.ceil(total / this.pageSize);
        }
    }
    setCurrentPage(page) {
        this.currentPage = page;
    }
    getPageRange() {
        let start = this.pageSize * (this.currentPage - 1) + 1;
        let end = Math.min(this.pageSize * this.currentPage, this.total);
        return [start, end];
    }
    isFirstEnabled() {
        return this.currentPage !== 1;
    }
    isPreEnabled() {
        return this.currentPage > 1;
    }
    isNextEnabled() {
        return this.currentPage < this.totalPage;
    }
    isLastEnabled() {
        return this.currentPage !== this.totalPage;
    }

    first() {
        this.currentPage = 1;
    }
    pre() {
        this.currentPage--;
    }
    next() {
        if (this.currentPage < this.totalPage) this.currentPage++;
    }
    last() {
        this.currentPage = this.totalPage;
    }
}
