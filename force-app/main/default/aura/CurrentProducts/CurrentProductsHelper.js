({
    CurrentProductHelper : function(component, page, event, helper) {
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        page = page || 1;
        
        var action = component.get("c.fetchdata");
        action.setParams({
            "recordId" : component.get("v.recordId"),
        	"pageNumber" : page
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                
                var responseData = response.getReturnValue();

                component.set('v.paginationrequired', false);
                component.set('v.CurrentProductsData', responseData.currentProductsList);
                component.set('v.currentProductLength', responseData.total);
                
                if(responseData != null && responseData != undefined && responseData.currentProductsList != null && 
						responseData.currentProductsList != undefined && responseData.currentProductsList.length > 0) {

                    if(responseData.total >= 6){
                        component.set('v.paginationrequired',true);
                    }
                                        
                    if(responseData.total != undefined && responseData.total != null && 
                       		responseData.pageSize != undefined && responseData.pageSize != null) {
                        component.set("v.page", responseData.page);
                    	component.set("v.total", responseData.total);
                        component.set("v.pages", Math.ceil(responseData.total/responseData.pageSize));
                    }                    
                    
                    /*if(responseData.currentProductsList[0].AccountFirm__c != null && responseData.currentProductsList[0].AccountFirm__c != undefined && 
                       		responseData.currentProductsList[0].AccountFirm__r.Name != undefined && responseData.currentProductsList[0].AccountFirm__r.Name != null) {
                        component.set('v.CompanyName',responseData.currentProductsList[0].AccountFirm__r.Name);                        
                    } else if(responseData.currentProductsList[0].Name != null && responseData.currentProductsList[0].Name != undefined) {
                        component.set('v.CompanyName',responseData.currentProductsList[0].Name);
                    }*/
                    if(responseData.currentProductsList[0].Name != null && responseData.currentProductsList[0].Name != undefined &&
							responseData.currentProductsList.length == 1 && isNaN(responseData.currentProductsList[0].Name)) {
                        component.set('v.concat',false); 
                    } else {
                        component.set('v.concat',true);
                    }                  
                    component.set("v.isEmpty",false);
                } else {
                    component.set("v.isEmpty",true);
                }                
            } else if (state === "INCOMPLETE") {
                console.log('Incomplete');
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    
    Edit: function(component, event, helper, tempid){
        var selectedMenuItemValue = event.getParam("value");
        var editRecordEvent = $A.get("e.force:editRecord");
        editRecordEvent.setParams({
            "recordId": tempid
        });
        editRecordEvent.fire();
       
    },
    
    Delete : function(component, event, helper,tempId){
        //var tempid = event.getSource().get("v.class");
        console.log('calling CP component Delete function');
        var action = component.get('c.DeleteRecord');
        action.setParams({"tempId" : tempId,
                          "accountId" : component.get('v.recordId'),
                         });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                // component.set('v.CurrentProductsData',responseData);
                // component.set('v.currentProductLength',responseData.length);
                component.set('v.ShowComponent',false);
                this.CurrentProductHelper(component, event, helper);
                
                var page = component.get('v.page');
                var length = component.get('v.currentProductLength');
                if((length % 5) == 1){
                    page = page - 1;
                }
                this.CurrentProductHelper(component, page, event, helper);
                
                if(response.getReturnValue() === true){
                    helper.showToast({
                        "title": "Record Deleted Successfully",
                        "type": "Success",
                    });
                    helper.reloadDataTable();
                } 
            } else if (state === "INCOMPLETE") {
                // do something
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        
        $A.enqueueAction(action);
    },
    
    showToast : function(params){
        var toastEvent = $A.get("e.force:showToast");
        if(toastEvent){
            toastEvent.setParams(params);
            toastEvent.fire();
            //helper.reloadDataTable();
        } else{
            alert(params.message);
        }
    },
    
    
    reloadDataTable : function(){
        var refreshEvent = $A.get("e.force:refreshView");
        if(refreshEvent){
            refreshEvent.fire();
        }
        
    },
    
    ReloadTable : function(component, event, helper){
        var action = component.get("c.fetchdata");
        action.setParams({ recordId : component.get("v.recordId")});
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                component.set('v.CurrentProductsData',responseData);
                component.set('v.currentProductLength',responseData.length);
                
            if(response.getReturnValue() === true){
                    helper.showToast({
                        "title": "Record Update",
                        "type": "success",
                        "message": totalRecordEdited+" MA Records Updated"
                    });
                    helper.reloadDataTable();
                } 
            } else {
                var errors = response.getError();
                helper.showToast({
                    "title": "Error!!",
                    "type": "error",
                    "message": errors[0].message
                });
                console.log('Error-'+errors);
            }
        });
        $A.enqueueAction(action);
    },
    
    LoggedInUser : function(component, event, helper){
        var action = component.get("c.getUserRole");
        action.setParams({ recordId : component.get("v.recordId")});
        action.setCallback(this, function(response){
            console.log('Logged in user State '+response.getState());
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                component.set('v.isAdmin',responseData);
            } else if (state === "INCOMPLETE") { 
                // do something
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }

        });
        $A.enqueueAction(action);
       
    }
    
})