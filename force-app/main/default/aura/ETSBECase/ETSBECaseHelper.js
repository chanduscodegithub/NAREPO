({
    getETSRecords : function(component,page,event,fieldName,sortOrder) {
        var spinner = component.find("userLoadingspinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var action = component.get("c.getETSCase");
        action.setParams({
            "accId":component.get('v.recordId'),
            "pageNumber":page,
            "columnName" : fieldName,
            "sortType" : sortOrder,
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    console.log('data');
                    var responseObj = response.getReturnValue();
                    if((responseObj != null && responseObj.length != 0 && responseObj != undefined)) {
                        component.set('v.isEmpty', false);
                        component.set('v.FilesCount',responseObj.etsList.length);
                        component.set("v.ETSBEdata", responseObj.etsList);
                        component.set("v.page", responseObj.page);
                        component.set("v.total", responseObj.total);
                        component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    } else {
                        component.set('v.FilesCount',0);
                        component.set('v.isEmpty', true);
                    }
                } else {
                    component.set('v.isEmpty', true);
                }
            } else {
                console.log("In getUserRecordDetails method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    
    newButtonOnclick : function(component, event){
        var action = component.get("c.getRecordType");
        action.setParams({
            'sobjectName':'Case'
        });
        action.setCallback(this,function(response){
            var device = $A.get("$Browser.formFactor");
            var state = response.getState();
            if(state == "SUCCESS") {
                var childData = response.getReturnValue().caseRecordTypeId;
                var defaultId = response.getReturnValue().DefaultId;
                var copuUrl = component.find('recordTypeModal');
                component.set('v.defaultId',defaultId);
                for(var i=0; i< copuUrl.length; i++){
                    $A.util.addClass(copuUrl[i], 'slds-show');
                    $A.util.removeClass(copuUrl[i], 'slds-hide');
                }
                var options = [];
                for(var i in childData){
                    options.push({'label':childData[i].Name,'value':childData[i].Id});  
                }
                component.set('v.options',options);
                component.set('v.caseRecordTypeList',childData);
                component.set('v.recordTypeId',defaultId); 

            }
        });
        $A.enqueueAction(action); 
    },
    sortBy : function(component, event, fieldName,page,sortFieldComp) {
        var spinner = component.find("userLoadingspinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var action = component.get("c.getETSCase");
        if(component.get("v."+sortFieldComp) ===  true) {
            action.setParams({
                "accId":component.get('v.recordId'),
                "pageNumber":page,
                "columnName" : fieldName,
                "sortType" : 'DESC',
            });
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, false);
        } else {
            action.setParams({
                "accId":component.get('v.recordId'),
                "pageNumber":page,
                "columnName" : fieldName,
                "sortType" : 'ASC'
            });
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    console.log('data');
                    var responseObj = response.getReturnValue();
                    if((responseObj != null && responseObj.length != 0 && responseObj != undefined)) {
                        component.set('v.isEmpty', false);
                        component.set('v.FilesCount',responseObj.etsList.length);
                        component.set("v.ETSBEdata", responseObj.etsList);
                        component.set("v.page", responseObj.page);
                        component.set("v.total", responseObj.total);
                        component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    } else {
                        component.set('v.FilesCount',0);
                        component.set('v.isEmpty', true);
                    }
                } else {
                    component.set('v.isEmpty', true);
                }
            } else {
                console.log("In getUserRecordDetails method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    }
})