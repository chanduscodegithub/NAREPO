({
    selectRecord : function(component, event, helper){ 
        debugger;
        var getSelectRecord = component.get("v.recordName");
        var LookupValId = component.get("v.LookupValId");
        var isSalesPerson1 = false;
        var isSalesPerson2 = false;
        if(LookupValId == 'SalesPerson1Id'){
            isSalesPerson1 = true;
        }else{
            isSalesPerson2 = true;
        }
        
        
        if(getSelectRecord.hasOwnProperty('User__c')){
            var getSelectedRecordID = component.get("v.recordName.User__c");
        } else {
            var getSelectedRecordID = component.get("v.recordName.Id");
        }
        var compEvent = component.getEvent("onSelectedRecordEvent");
        compEvent.setParams({"recordByEvent" : getSelectRecord, "getSelectedRecordID" : getSelectedRecordID, "isSalesPerson1" : isSalesPerson1,"isSalesPerson2" : isSalesPerson2 });  
        compEvent.fire();
    },
})