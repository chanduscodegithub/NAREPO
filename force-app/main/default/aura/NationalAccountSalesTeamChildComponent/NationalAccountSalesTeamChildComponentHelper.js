({
	/*enableFields : function(component, event) {
		var fieldsToBeEnabled = component.find('editableField');
        if(fieldsToBeEnabled != null && fieldsToBeEnabled != 'undefined') {
            if(Array.isArray(fieldsToBeEnabled)) {
                for(var i=0;i<fieldsToBeEnabled.length;i++) {
            		fieldsToBeEnabled[i].set("v.disabled", false);
        		}
            } else {
                fieldsToBeEnabled.set("v.disabled", false);
            }
        }
	},
    
    disableFields : function(component, event) {
		var fieldsToBeDisabled = component.find('editableField');
        if(fieldsToBeDisabled != null && fieldsToBeDisabled != 'undefined') {
            if(Array.isArray(fieldsToBeDisabled)) {
                for(var i=0;i<fieldsToBeDisabled.length;i++) {
            		fieldsToBeDisabled[i].set("v.disabled", true);
        		}
            } else {
                fieldsToBeDisabled.set("v.disabled", true);
            }
            var compEvent = component.getEvent("nationalAccountSalesTeamEvent");
            compEvent.fire();
        }
	},*/
    
    updateNationalAccountSalesTeamrecords : function(component, event) {
        
    	var editAuraparam = event.getParam('arguments');
        if(editAuraparam != null && editAuraparam.isStartDateField != null && 
           		editAuraparam.isStartDateField != undefined) {
            if(editAuraparam.isStartDateField == true) {
                component.set("v.accountTeamHistory.Case_Management_Start_Date__c", '');
            } else {
                component.set("v.accountTeamHistory.Case_Management_End_Date__c", '');
            }
        }
    },
    
    setDataToParentController : function(component, event) {
        
		var cmAccountTeamHistoryIdVal = component.get("v.accountTeamHistoryId");
		var compEvent = component.getEvent("nationalAccountSalesTeamEvent");
		compEvent.setParams({'editRecord':true,'cmAccountTeamHistoryId':cmAccountTeamHistoryIdVal});
		compEvent.fire();
    },
    
    validateStartDate : function(component, event) {
        
        var startDate = component.get("v.accountTeamHistory.Case_Management_Start_Date__c");
        var endDate = component.get("v.accountTeamHistory.Case_Management_End_Date__c");
        
        if(startDate != null && startDate != undefined && startDate != '' && startDate.indexOf('T00:00:00.000Z') < 0) {
            startDate = startDate+'T00:00:00.000Z';
        }
        if(endDate != null && endDate != undefined && endDate != '' && endDate.indexOf('T00:00:00.000Z') < 0) {
            endDate = endDate+'T00:00:00.000Z';
        }
        
        if(startDate != null && startDate != undefined && startDate != '' &&
        	endDate != null && endDate != undefined && endDate != '' && startDate > endDate) {
            
            var compEvent = component.getEvent("nationalAccountSalesTeamEvent");
            compEvent.setParams({'isStartDateValidation':true,'cmAccountTeamHistoryObjData':component.get("v.accountTeamHistory")});
            compEvent.fire();
            
        } else {
            
            var cmAccountTeamHistoryIdVal = component.get("v.accountTeamHistoryId");
            var compEvent = component.getEvent("nationalAccountSalesTeamEvent");
            compEvent.setParams({'editRecord':true,'cmAccountTeamHistoryId':cmAccountTeamHistoryIdVal});
            compEvent.fire();
        }
        
    },
    
    validateEndDate : function(component, event) {
    	
        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth();
        if(date < 10) {
            date = '0'+date
        }
        if(month < 10) {
            month = month + 1;
            month = '0'+month
        }
        
        var startDate = component.get("v.accountTeamHistory.Case_Management_Start_Date__c");
        var endDate = component.get("v.accountTeamHistory.Case_Management_End_Date__c");
        currentDate = currentDate.getFullYear()+'-'+month+'-'+date+'T00:00:00.000Z';
        
        if(startDate != null && startDate != undefined && startDate != '' && startDate.indexOf('T00:00:00.000Z') < 0) {
            startDate = startDate+'T00:00:00.000Z';
        }
        if(endDate != null && endDate != undefined && endDate != '' && endDate.indexOf('T00:00:00.000Z') < 0) {
            endDate = endDate+'T00:00:00.000Z';
        }

        if(endDate != null && endDate != undefined) {
            
            var compEvent = component.getEvent("nationalAccountSalesTeamEvent");
            
            if(endDate != '' && endDate > currentDate) {
                compEvent.setParams({'isStartDateValidation':false,'isCurrentDateValidation':true,'cmAccountTeamHistoryObjData':component.get("v.accountTeamHistory")});
            } else if(startDate != null && startDate != undefined && startDate != '' &&
                      endDate != '' && startDate > endDate) {
                compEvent.setParams({'isStartDateValidation':false,'cmAccountTeamHistoryObjData':component.get("v.accountTeamHistory")});                
            } else {               
                var cmAccountTeamHistoryIdVal = component.get("v.accountTeamHistoryId");
                compEvent.setParams({'editRecord':true,'cmAccountTeamHistoryId':cmAccountTeamHistoryIdVal});
            }
            
            compEvent.fire();
        }
    },
    
    validateSCEPlayerField : function(component, event) {

        var cmAccountTeamHistoryIdVal = component.get("v.accountTeamHistoryId");
        var isCheckedValue = component.get("v.accountTeamHistory.SCE_Player_Coach_Assigned_to_Case__c");
        var roleName = component.get('v.accountTeamHistory.Role__c');
        var currentDate = new Date();
            var date = currentDate.getDate();
            var month = currentDate.getMonth();
            if(date < 10) {
                date = '0'+date
            }
            if(month < 10) {
                month = month + 1;
                month = '0'+month
            }
        
        var startDate = component.get("v.accountTeamHistory.Case_Management_Start_Date__c");
        var endDate = component.get("v.accountTeamHistory.Case_Management_End_Date__c");
        currentDate = currentDate.getFullYear()+'-'+month+'-'+date+'T00:00:00.000Z';
        
        var isCheckedValue = component.get("v.accountTeamHistory.SCE_Player_Coach_Assigned_to_Case__c");
        if(roleName != null && (roleName == $A.get("$Label.c.CM_SCE") || roleName == $A.get("$Label.c.Specialty_Benefits_SCE")) && isCheckedValue != null && startDate != null &&
          		startDate != undefined && startDate.trim() != '') {
            if(endDate == null || endDate == undefined ||
               (endDate != null && endDate != undefined && endDate >= currentDate)) {
            	var compEvent = component.getEvent("nationalAccountSalesTeamEvent");
                compEvent.setParams({'editRecord':true,'cmAccountTeamHistoryId':cmAccountTeamHistoryIdVal,'isSCEPlayerCoach':isCheckedValue});     
                compEvent.fire();
            } else if(endDate != null && endDate != undefined && endDate < currentDate){
                var compEvent = component.getEvent("nationalAccountSalesTeamEvent");
                compEvent.setParams({'editRecord':true,'cmAccountTeamHistoryId':cmAccountTeamHistoryIdVal,'isSCEPlayerCoach':isCheckedValue});
                compEvent.fire();
            }
        }
        
    }
    
})