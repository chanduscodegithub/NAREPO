({
    helperMethod : function() {		        
    },
    getConsultantHistory : function(component) {          
        var consultantHistoryAction = component.get('c.getConsultantHistoryFromController');
        consultantHistoryAction.setParams({
            "consultantHistoryId" : component.get('v.consultingHistoryData.Id')
        });
        consultantHistoryAction.setCallback(this, function(response) {
            var editItem = component.find('editItem');
            for(var i in editItem){
                $A.util.removeClass(editItem[i], 'slds-hide');
                $A.util.addClass(editItem[i], 'slds-show');
            }
            component.set('v.enableEditDeleteButton',true);
            var inlineEdit = component.find('inlineEdit');
            for(var i in inlineEdit){
                $A.util.removeClass(inlineEdit[i], 'slds-show');
                $A.util.addClass(inlineEdit[i], 'slds-hide');
            }
            var state = response.getState();
            if (state === "SUCCESS") {    
                var consultantHistoryResponseData = response.getReturnValue();
                if(consultantHistoryResponseData != null){                    
                    component.set("v.consultingHistoryData", consultantHistoryResponseData);                    
                    var divId = component.get("v.consultingHistoryIndex");
                    var startDate = component.find("StartDate");
                    var endDate = component.find("EndDate");
                    startDate.set("v.disabled","true");
                    endDate.set("v.disabled","true");
                }                
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                            var alertEvent = component.getEvent("alertEvent");            
                            alertEvent.setParams({"errorMessage":errors[0].message,"isShowFullListPage" : "true"});
                            alertEvent.fire();
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(consultantHistoryAction);
    },
    saveConsultantHistory : function(component,startDate,endDate,consultantHistoryObj) {       
        var consultantHistoryAction = component.get('c.saveConsultantHistoryFromController');        
        consultantHistoryAction.setParams({
             "consultantHistoryObj":consultantHistoryObj
        });
        consultantHistoryAction.setCallback(this, function(response) {
            component.set('v.enableEditDeleteButton',true);
             var inlineEdit = component.find('inlineEdit');
            for(var i in inlineEdit){
                $A.util.removeClass(inlineEdit[i], 'slds-show');
                $A.util.addClass(inlineEdit[i], 'slds-hide');
            }
             var editItem = component.find('editItem');
            for(var i in editItem){
                $A.util.removeClass(editItem[i], 'slds-hide');
                $A.util.addClass(editItem[i], 'slds-show');
            }
            var state = response.getState();
            if (state === "SUCCESS") {    
                var consultantHistoryResponseData = response.getReturnValue();
                if(consultantHistoryResponseData != null){                                               
                    var divId = component.get("v.consultingHistoryIndex");
                    var startDate = component.find("StartDate");
                    var endDate = component.find("EndDate");
                    startDate.set("v.disabled","true");
                    endDate.set("v.disabled","true");
                }                
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                            var alertEvent = component.getEvent("alertEvent");            
                            alertEvent.setParams({"errorMessage":errors[0].message,"isShowFullListPage" : "true"});       
                            alertEvent.fire();
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(consultantHistoryAction);
    },
    validatedate : function(component,event,valDate) {
        if(valDate == null)return false;
        if(valDate == "")return true;
        var valDateArray = valDate.split('-');  
        if(valDateArray.length ==3){
            var month = '';
            if(valDateArray[1] < 10 && !valDateArray[1].startsWith('0')){
               
                month = '0'+valDateArray[1];
            }
            var day = '';
            if(valDateArray[2] < 10 && !valDateArray[2].startsWith('0')){
                day = '0'+valDateArray[2];
                if(month==""){
                    valDate = valDateArray[0]+'-'+valDateArray[1]+'-'+day;
                }
                else{
                    valDate = valDateArray[0]+'-'+month+'-'+day;
                }
                
            }else{
                if(month==""){
                    valDate = valDateArray[0]+'-'+valDateArray[1]+'-'+valDateArray[2];   
                }
                 if(month!=""){
                    valDate = valDateArray[0]+'-'+month+'-'+valDateArray[2];   
                }
			             
            }
            
        }
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!valDate.match(regEx)){
            console.log('Date is invalid');
            //component.find('oDate').set('v.value', 'Date is invalid');
            return false;
        }
        else{
            var d = new Date(valDate);
            //component.find('oDate').set('v.value', 'Date is Valid');
             console.log('Date is valid');
            return d.toISOString().slice(0,10) === valDate;
        }        
    },
})