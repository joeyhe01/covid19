class MoreOptionItem{
    constructor(item){
        if(typeof item ==='string'){
            this['value'] = item;
            this['title'] = item;
        }else{
            this['value'] = item['value'];
            this['title'] = item['title'];
        }
    }
}
export default class MoreOptionItems{
    constructor(list){
        this['moreOptionItems'] = [];
        if(list){
            list.forEach(item=>{
                this['moreOptionItems'].push(new MoreOptionItem(item));
            });
        }
    }
    findByValue(value){
        let foundItem = null;
        this['moreOptionItems'].forEach(item=>{
            if(item.value == value){
                foundItem = item;
            }
        });
        return foundItem;
    }
}
