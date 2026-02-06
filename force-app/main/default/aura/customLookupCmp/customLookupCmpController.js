({
    selectRecord : function(component, event, helper){
        var getSelectRecord = component.get("v.recordName");
        var getSelectedRecordID;
        if(getSelectRecord.hasOwnProperty('User__c'))
        {
          getSelectedRecordID = component.get("v.recordName.User__c");  
        }
        else
        {
            getSelectedRecordID = component.get("v.recordName.Id");
        }
        var getLookupVal = component.get("v.LookupVal");
        var geticon = component.get("v.IconName");
        var isSalesPerson1 = false;
        var isSalesPerson2 = false;
        if(getLookupVal == 'SalesPerson1'){
            isSalesPerson1 = true;
        }else{
            isSalesPerson2 = true;
        }
        var compEvent = component.getEvent("onSelectedRecordEvent");
        compEvent.setParams({"recordByEvent" : getSelectRecord, "getSelectedRecordID" : getSelectedRecordID , "isSalesPerson1" : isSalesPerson1,"isSalesPerson2" : isSalesPerson2});  
        compEvent.fire();
    }
})