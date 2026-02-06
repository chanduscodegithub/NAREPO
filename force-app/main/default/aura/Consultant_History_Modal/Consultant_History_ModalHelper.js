({
    toggleHelper : function(component,event) {
        var toggleText = component.find("tooltip");
        $A.util.toggleClass(toggleText, "toggle");
    },
    getConsultantHistoryDataFromController : function(component,page,event) {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        page = page || 1;
        var sortType = 'DESC';
        if(component.get('v.isLastFieldNameSortedAsc')){
            sortType = 'Asc';
        }
        var consultantHistoryAction = component.get('c.getConsultantHistoryData');	
        consultantHistoryAction.setParams({
            "accountId" : component.get('v.Child_Data').accountId,
            "pageNumber": page,
            "columnName" : component.get('v.lastFieldNameToBeSorted'),
            "sortType" : sortType,
            "isPopUp" : true
        });
        consultantHistoryAction.setCallback(this, function(response) {
            var state = response.getState();
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            if (state === "SUCCESS") {    
                var consultantHistoryResponseData = response.getReturnValue();                
                if(consultantHistoryResponseData != null && consultantHistoryResponseData.consultantList != null && consultantHistoryResponseData.consultantList.length > 0){
                    console.log('history modal data '+consultantHistoryResponseData);
                    component.set('v.isConsultantNoData',false);
                    component.set("v.consultingHistoryList", consultantHistoryResponseData.consultantList);
                    component.set("v.isEditAccess", consultantHistoryResponseData.isEditAccess);                    
                    component.set("v.page", consultantHistoryResponseData.page);
                    component.set("v.total", consultantHistoryResponseData.total);
                    component.set("v.pages", Math.ceil(consultantHistoryResponseData.total/consultantHistoryResponseData.pageSize));
                }else{
                    component.set('v.isConsultantNoData',true);   
                }                
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){        
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                            component.set('v.isConsultantNoData',true);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(consultantHistoryAction);
    },
    sortBy : function(component, event, fieldName,page,sortFieldComp) {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        page = page || 1;        
        var action = component.get("c.getConsultantHistoryData");
        var isAscending = false;
        if(component.get("v."+sortFieldComp) ===  true) {
            isAscending = true;
            action.setParams({
                "accountId" : component.get('v.Child_Data').accountId,
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC',
                "isPopUp" : true
            });
            component.set("v."+sortFieldComp, false);
        } else {
            action.setParams({
                "accountId" : component.get('v.Child_Data').accountId,
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC',
				"isPopUp" : true                
            });
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this,function(response) {
            var state = response.getState();
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            if (state === "SUCCESS") {    
                var consultantHistoryResponseData = response.getReturnValue();               
                if(consultantHistoryResponseData != null && consultantHistoryResponseData.consultantList != null && consultantHistoryResponseData.consultantList.length > 0){
                    component.set('v.isConsultantNoData',false);
                    component.set('v.lastFieldNameToBeSorted',fieldName);
                    component.set('v.isLastFieldNameSortedAsc',isAscending);
                    console.log('history modal data '+consultantHistoryResponseData);
                    component.set("v.consultingHistoryList", consultantHistoryResponseData.consultantList);
                    component.set("v.page", consultantHistoryResponseData.page);
                    component.set("v.total", consultantHistoryResponseData.total);
                    component.set("v.pages", Math.ceil(consultantHistoryResponseData.total/consultantHistoryResponseData.pageSize));
                }else{
                    component.set('v.isConsultantNoData',true);
                }               
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){        
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                            component.set('v.isConsultantNoData',true);
                            component.set("v.page", 1);
                            component.set("v.total", 1);
                            component.set("v.pages", 1);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    deleteOrUpdateConsultantRecordInController : function(component, event,objId,operation) {        
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var consultantHistoryAction = null;
        
        var sortType = 'DESC';
        if(component.get('v.isLastFieldNameSortedAsc')){
            sortType = 'Asc';
        }
        
        if(operation == 'DELETE'){
            consultantHistoryAction = component.get('c.deleteConsultantHistory');
            consultantHistoryAction.setParams({
                "accountId" : component.get('v.Child_Data').accountId,
                "objId" : objId,
                "pageNumber" : component.get("v.page"),
                "isPopUp" : true,
                "columnName" : component.get('v.lastFieldNameToBeSorted'),
                "sortType" : sortType,
            });
        }else if(operation == 'UPDATE'){
            consultantHistoryAction = component.get('c.createConsultantHistory');	
            consultantHistoryAction.setParams({
                "accountId" : component.get('v.Child_Data').accountId,
                "objId" : objId,
                "pageNumber" : component.get("v.page"),
                "isPopUp" : true
            });
        }
               
        consultantHistoryAction.setCallback(this, function(response) {
            var state = response.getState();
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            if (state === "SUCCESS") {    
                var consultantHistoryResponseData = response.getReturnValue();
                if(consultantHistoryResponseData != null){
                    component.set("v.page", consultantHistoryResponseData.page);
                    component.set("v.total", consultantHistoryResponseData.total);                     
                    component.set("v.pages", Math.ceil(consultantHistoryResponseData.total/consultantHistoryResponseData.pageSize));
                }
                if(consultantHistoryResponseData != null && consultantHistoryResponseData.consultantList != null && consultantHistoryResponseData.consultantList.length > 0){
                    component.set('v.isConsultantNoData',false);                    
                    component.set("v.consultingHistoryList", consultantHistoryResponseData.consultantList);                    
                }else{
                    component.set('v.isConsultantNoData',true);
                }
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){        
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }                            
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(consultantHistoryAction);
    },
})