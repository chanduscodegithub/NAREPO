({
    handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        if(eventParams.changeType === "LOADED") {
            console.log('test CSAD');
            var oppType;
            component.set('v.isDataLoaded',true);
            component.set('v.MAGlobalData',component.get('v.MACommentData'));
            var MA_Type = component.get('v.MAGlobalData').MACategory__c;
            if(MA_Type === 'Client Management'){
                component.set('v.MA_Type','NBEA');
                oppType = 'NBEA';
            }else if(MA_Type === 'Client Development'){
                component.set('v.MA_Type','NB');
                oppType = 'NB';
            }else{
                component.set('v.MA_Type','NBEA');
                oppType = 'NBEA';
            }
            var isLocked = component.get('v.MAGlobalData').Reconciliation_Complete_Record_Locked__c;
            if(!isLocked){
                var maActivityType = component.get('v.MAGlobalData').Membership_Activity_Type__c;
                var action = component.get("c.getUserProfile");
                action.setParams({
                    accountId: component.get('v.recordId')                           
                });
                action.setCallback(this, function(response) { 
                    if(response.getState() === "SUCCESS") {
                        var access = response.getReturnValue();
                        component.set("v.accessObj", response.getReturnValue());
                        var readOnly = response.getReturnValue().readOnly;
                        if(readOnly){
                            component.set('v.accessVal','VIEW');   
                        }else{
                            component.set('v.accessVal','EDIT');   
                        }
                        helper.getFeildSets_RelatedListData(component, event);
                    }
                }); 
                $A.enqueueAction(action);
            }else{
                var accessObj = {readOnly:true, fullAccess:false, readWrite:false};
                component.set("v.accessObj", accessObj);               
                component.set('v.accessVal','VIEW'); 
                helper.getFeildSets_RelatedListData(component, event);
            }            
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
        var isAdditionalInfo = event.getParam("isAdditionalInfo");
        if(isAdditionalInfo){
            component.find("AdditionalDataId").reloadRecord(); 
        }
        if(event.getParam("cancelRecord")){
            component.find("AdditionalDataId").reloadRecord(); 
        }
    }
})