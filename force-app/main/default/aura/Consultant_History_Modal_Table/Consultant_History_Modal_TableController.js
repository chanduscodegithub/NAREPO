({
	cancelInlineEdit: function(component, event, helper) {        
        helper.getConsultantHistory(component);        
    },
    saveInlineEdit: function(component, event, helper) {         
        var startDate = component.get("v.consultingHistoryData.StartDate__c");
        var endDate = component.get("v.consultingHistoryData.EndDate__c");                        
         if(startDate!==undefined){
            if(startDate.includes('T') ){
            var t = startDate.indexOf("T");
            var startDate = startDate.substring(0, t);
            if(!helper.validatedate(component,event,startDate)){
                var alertEvent = component.getEvent("alertEvent");
                alertEvent.setParams({"alertMessage":'Dates must be entered in m/d/yyyy format'});            
                alertEvent.fire();
                return;
            }
        }else{
		if(!helper.validatedate(component,event,startDate)){
                var alertEvent = component.getEvent("alertEvent");
                alertEvent.setParams({"alertMessage":'Dates must be entered in m/d/yyyy format'});            
                alertEvent.fire();
                return;
            }
        } 
        }
        if(endDate!==undefined){
          if(endDate.includes('T') && endDate!==undefined){
            var t = endDate.indexOf("T");
            var endDate = endDate.substring(0, t);
			if(!helper.validatedate(component,event,endDate)){
                var alertEvent = component.getEvent("alertEvent");
                alertEvent.setParams({"alertMessage":'Dates must be entered in m/d/yyyy format'});            
                alertEvent.fire();
                return;
            }
        }else{
			if(!helper.validatedate(component,event,endDate)){
                var alertEvent = component.getEvent("alertEvent");
                alertEvent.setParams({"alertMessage":'Dates must be entered in m/d/yyyy format'});            
                alertEvent.fire();
                return;
            }
        }  
        }
        var today = new Date();               
        			        
        if(endDate != null && Date.parse(endDate) > Date.parse(today)){                        
            var alertEvent = component.getEvent("alertEvent");
            alertEvent.setParams({"alertMessage":$A.get("$Label.c.Consultant_History_End_Date_Alert"),"isShowFullListPage" : "true"});            
            alertEvent.fire();
        }
        else if((Date.parse(startDate) > Date.parse(endDate)) && endDate != null) {            
            var alertEvent = component.getEvent("alertEvent");            
            alertEvent.setParams({"alertMessage":$A.get("$Label.c.Consultant_History_Alert_Message"),"isShowFullListPage" : "true"});            
            alertEvent.fire();
        }        
        else{
            helper.saveConsultantHistory(component,startDate,endDate,component.get("v.consultingHistoryData"));   
        }        
    },
    edit: function(component, event, helper) {
        var startDate = component.find("StartDate");
        var endDate = component.find("EndDate");
        startDate.set("v.disabled","false");
        endDate.set("v.disabled","false");
        component.set('v.enableEditDeleteButton',false);
        var inlineEdit = component.find("inlineEdit");
        for(var i = 0; i < inlineEdit.length ; i=i+1){        
            $A.util.addClass(inlineEdit[i], 'slds-show');
            $A.util.removeClass(inlineEdit[i], 'slds-hide');
        }
        
        var editItem = component.find('editItem');
        for(var i = 0; i < editItem.length ; i=i+1){        
            $A.util.removeClass(editItem[i], 'slds-show');
            $A.util.addClass(editItem[i], 'slds-hide');
        }
    },
    remove: function(component, event, helper) {        
        var cmpEvent = component.getEvent("consultantHistoryModalTable");        
        cmpEvent.setParams({"consultingHistoryModalIndx":component.get('v.consultingHistoryData.Id')});
        cmpEvent.fire();
        
    },
    navigateToContactPage: function(component, event, helper) {                  
        var cmpEvent = component.getEvent("navigateToObject");        
        cmpEvent.setParams({
            "recordId": component.get('v.consultingHistoryData.Consultant_ID__c'),
        });
        cmpEvent.fire();       
    }
})