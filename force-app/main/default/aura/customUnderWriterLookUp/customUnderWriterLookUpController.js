({
   selectRecord : function(component, event, helper){ 
       debugger;
      	var getSelectRecord = component.get("v.recordName");
       	var UnderwriterData = component.get("v.UnderwriterData");
       
       for(var i = 0; i < UnderwriterData.length; i++) {
           var underWriterName = UnderwriterData[i].Underwriter_Name__c;
            if(underWriterName === getSelectRecord){
                var getSelectedRecordID = UnderwriterData[i].Id;
                component.set('v.getSelectedRecordID',UnderwriterData[i].Id);
                break;
            }
       }
                
      	var compEvent = component.getEvent("UnderWriterEvent");
       compEvent.setParams({"recordByEvent" : getSelectRecord, "getSelectedRecordID" : getSelectedRecordID});  
        compEvent.fire();
    },
})