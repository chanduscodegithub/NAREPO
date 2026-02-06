({ 
    tabChange: function(component, event, helper) {     
        var selectedItem = event.currentTarget;
        var selectedTab = selectedItem.dataset.record;
        var selectedTabId = selectedItem.dataset.tab;
        component.set("v.dynamicComponentsByAuraId", {});
        component.set("v.dynamicComponentAuraId", ''); 
        component.set("v.body", []);
        helper.selectTabHelper(component, event,selectedTab,selectedTabId);
    },
    refreshTab:  function(component, event, helper) {
        var selectedTab = event.getParam("selectedTab");
        var isTabDisable = event.getParam("isTabDisable");
        var isReset = event.getParam('isResetLink');
        if(isReset != null && isReset != undefined){
           component.set('v.isReset',isReset); 
        }
        if(event.getParam("isProdCatLink")){
            component.set('v.isProdCatLink',true);
            return;
        }
        if(event.getParam("cancelRecord")){
            helper.selectedTabHelper(component, event,selectedTab,event.getParam("cancelRecord"));
            helper.refreshTabs(component, event, selectedTab, false);
        }else if(isTabDisable !== undefined){
            helper.refreshTabs(component, event, selectedTab, isTabDisable);     
        }else{
            helper.refreshTabs(component, event, selectedTab, false);
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", ''); 
            component.set("v.body", []);
            helper.selectedTabHelper(component, event,selectedTab,false);       
        }        
    },
    handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        if(eventParams.changeType === "LOADED") {
            component.set('v.MAGlobalData',component.get('v.InitialOpportunityData'));
            if(component.get('v.MAGlobalData').Product_Type_Involved_in_Opp__c == null || component.get('v.MAGlobalData').Product_Type_Involved_in_Opp__c == undefined){
                $A.util.addClass(spinner, "slds-hide");
                component.set('v.isproductInvolvedEmpty',true);
                return;
            }else{
                component.set('v.isproductInvolvedEmpty',false);
            }
            console.log("Product Type"+component.get('v.MAGlobalData').Product_Type_Involved_in_Opp__c);
            var oppType;
            component.set('v.isDataLoaded',true);
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
            var maActivityType = component.get('v.MAGlobalData').Membership_Activity_Type__c;
            component.set('v.maActivityType',maActivityType);
            if(!isLocked){
                var action = component.get("c.getUserProfile");
                action.setParams({
                    accountId: component.get('v.recordId')                           
                });
                action.setCallback(this, function(response) { 
                    if(response.getState() === "SUCCESS") {
                        var access = response.getReturnValue();
                        component.set("v.accessObj", response.getReturnValue());
                        var readOnly = response.getReturnValue().readOnly;
                        component.set('v.isSystemAdmin',response.getReturnValue().isSystemAdmin);
                        if(readOnly){
                            component.set('v.accessVal','VIEW');   
                        }else{
                            component.set('v.accessVal','EDIT');   
                        }
                        if(component.get('v.productCategoryName') === '' || component.get('v.productCategoryName') == null){
                            var startLoad = setInterval(function(){ 
                                if(component.get('v.isRendered') === true){
                                    component.set("v.dynamicComponentsByAuraId", {});
                                    component.set("v.dynamicComponentAuraId", ''); 
                                    component.set("v.body", []);                       
                                    helper.handleMultiPickListEvent(component, event);                       
                                    clearInterval(startLoad);
                                }
                            }, 250);
                        }else{
                            if(component.get("v.isDataServiceTrasaction")){
                                component.set('v.isRefreshedMAData',true); 
                            }
                            if(component.get('v.isRefreshedMAData') && component.get('v.oldProductCategory') == component.get('v.MAGlobalData').Product_Type_Involved_in_Opp__c){
                                helper.selectedTabHelper(component, event,component.get('v.productCategoryName'),false);        
                            }else{
                                helper.handleMultiPickListEvent(component, event);
                            }
                        }
                    }
                }); 
                $A.enqueueAction(action);
            }else{
                var accessObj = {readOnly:true, fullAccess:false, readWrite:false};
                component.set("v.accessObj", accessObj);               
                component.set('v.accessVal','VIEW'); 
                helper.handleMultiPickListEvent(component, event);
            }            
        }else if(eventParams.changeType === "REMOVED") {
            
        }else if(eventParams.changeType === "ERROR") {
            
        }else if (eventParams.changeType === "CHANGED") {
            if(!component.get('v.isProdCat')){
                return;
            }
            $A.util.addClass(spinner, "slds-hide");
            if(component.get("v.isDataServiceTrasaction")){
                component.set('v.isRefreshedMAData',false);        
            }else{
                component.set('v.isRefreshedMAData',true);
            }
            var changedFields = eventParams.changedFields;
            if(changedFields.Product_Type_Involved_in_Opp__c != undefined && changedFields.Product_Type_Involved_in_Opp__c != null){
                if(changedFields.Product_Type_Involved_in_Opp__c.value != changedFields.Product_Type_Involved_in_Opp__c.oldvalue && component.get('v.isProdCatLink')){
                    helper.handleMultiPickListEvent(component, event);
                }
                console.log('Fields that are changed: ' + JSON.stringify(changedFields));
            }
            //component.find("MADataId").reloadRecord();
        }
    },
    handleMultiPickList: function(component, event, helper) {
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        helper.refreshTabs(component, event, component.get('v.productCategoryName'),false);
        if(component.get('v.isProdCatLink')){
            return; 
        }
        helper.handleMultiPickListEvent(component, event);
    }
})