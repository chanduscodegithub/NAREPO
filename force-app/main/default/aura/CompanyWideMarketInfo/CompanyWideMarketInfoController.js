({
    handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        if(eventParams.changeType === "LOADED") {
            console.log('test');
            var oppType;
            component.set('v.isDataLoaded',true);            
            component.set('v.MAGlobalData',component.get('v.MACommentData'));
            if(component.get('v.MAGlobalData').Category__c === 'Client Management'){
                component.set('v.MA_Type','NBEA');
            }else{
                component.set('v.MA_Type','NB');
            }
            var action = component.get("c.getLoggedInUerRoleInfo");
            action.setParams({
                accountId: component.get('v.recordId'),
                accType: component.get('v.MAGlobalData').Category__c
            });
            action.setCallback(this, function(response) { 
                if(response.getState() === "SUCCESS") {
                    var access = response.getReturnValue();
                    var readonly = true;
                    if(access){
                        readonly = false;
                        component.set('v.accessVal','EDIT');
                    }else{
                        readonly = true;
                        component.set('v.accessVal','VIEW');
                    }
                    var accessObj = {readOnly:readonly, fullAccess:false, readWrite:false};
                    component.set("v.accessObj", accessObj);                                                    
                    helper.getFeildSets_RelatedListData(component, event);
                }else{
                    var accessObj = {readOnly:true, fullAccess:false, readWrite:false};
                    component.set("v.accessObj", accessObj);               
                    component.set('v.accessVal','VIEW');
                    helper.getFeildSets_RelatedListData(component, event);       
                }
            });
            $A.enqueueAction(action);
        }else if(eventParams.changeType === "REMOVED") {
            
        }else if(eventParams.changeType === "ERROR") {
            
        }else if (eventParams.changeType === "CHANGED") {
            $A.util.addClass(spinner, "slds-hide");
            if(!component.get('v.isAdditionalInfo')){
                return;
            }
            //component.find("CommentsDataId").reloadRecord();
        }
    },
    refreshTab: function(component, event, helper) {
        var isCompanyWideMarket = event.getParam("isAdditionalInfo");
        if(isCompanyWideMarket){
            component.find("AdditionalDataId").reloadRecord(); 
        }
        if(event.getParam("cancelRecord")){
            component.find("AdditionalDataId").reloadRecord(); 
        }
    }
})