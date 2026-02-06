({
    handleSaveRecord: function(component, event, helper) { 
        helper.handelSaveRecordHelper(component, event,false);
        //helper.handelSaveRecordHelper(component, event);
    },
    
    /**
     * Control the component behavior here when record is changed (via any component)
     */
    handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        var disPosItag = '';
        var risProbItag = '';
        if(eventParams.changeType === "CHANGED") {
            // get the fields that changed for this record
            if(component.get('v.MAChildAttrObj.accessVal') == 'EDIT'){
                var changedFields = eventParams.changedFields;
                for(var i in changedFields){
                    component.get('v.simpleRecord')[i] = changedFields[i].value;
                }
            }
            var resultsToast = $A.get("e.force:showToast");
            resultsToast.setParams({
                "title": "Saved",
                "message": "The record was updated."
            });
            //resultsToast.fire(); 
        } else if(eventParams.changeType === "LOADED") {           
            console.log(component.get('v.simpleRecord'));  
            if(component.get('v.MAChildAttrObj.isComments')){
                component.set('v.CheckCommentValueChanged',component.get('v.simpleRecord')['Comments__c']);
            }
            if(component.get('v.isMedOth')){
                component.set('v.MedOthSelcSalesStgNme',component.get('v.simpleRecord')[component.get('v.MedOthsalesStageItag')]);
                component.set('v.GenSelcSalesStgNme',component.get('v.simpleRecord')[component.get('v.salesStageItag')]);
            }else{
                component.set('v.GenSelcSalesStgNme',component.get('v.simpleRecord')[component.get('v.salesStageItag')]);
            }
            
            for (var key in component.get('v.MAChildAttrObj').selectedCategoryMap) {
                disPosItag = 'Disposition_'+key+'__c'
                risProbItag = 'Risk_Probability_'+key+'__c'
                if(key == 'Other'){
                    component.set('v.selectedRiskOther',component.get('v.simpleRecord')[risProbItag]);
                }else{
                    component.set('v.selectedRiskProb',component.get('v.simpleRecord')[risProbItag]);
                    component.set('v.selectedDispostion',component.get('v.simpleRecord')[disPosItag]);
                }                
            }
            component.set('v.isDataLoaded',true);
            var spinner = component.find("mySpinner");
        	$A.util.addClass(spinner, "slds-hide");
            component.set('v.isLoadCompleted',true);
            if(component.get('v.MAChildAttrObj').isReset && !component.get('v.MAChildAttrObj.accessObj.readOnly')){
                component.set('v.isReset',false);
                component.set('v.isEdit',true);
                $A.util.addClass(component.find("edit_ActionBar"),'slds-hide');            
                $A.util.addClass(component.find("Edit_Mode_risen"),'risen');                
                $A.util.removeClass(component.find("save_cancel_ActionBar"),'slds-hide');
                $A.util.addClass(component.find("editBtn"),'slds-hide');
                var cmpEvent = component.getEvent("refreshTab");
                cmpEvent.setParams({
                    "selectedTab":component.get('v.MAChildAttrObj').selectedProductTab,
                    "isTabDisable":true,
                });
                cmpEvent.fire();
            }
        } else if(eventParams.changeType === "REMOVED") {
            // record is deleted and removed from the cache
        } else if(eventParams.changeType === "ERROR") {
            // there’s an error while loading, saving or deleting the record
        }
    },
    handleCancelRecord: function(component, event, helper) {      
        
        console.log('handleCancelRecord');
        
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        component.set("v.isEdit",false);
        $A.util.removeClass(component.find("edit_ActionBar"),'slds-hide');
        $A.util.addClass(component.find("error_Msg"),'hideEl');
        $A.util.addClass(component.find("error_Popup"),'hide');        
        $A.util.removeClass(component.find("Edit_Mode_risen"),'risen');
        $A.util.addClass(component.find("save_cancel_ActionBar"),'slds-hide');
        $A.util.removeClass(component.find("editBtn"),'slds-hide');
        setTimeout(function(){ 
            $A.util.addClass(spinner, "slds-hide");
        }, 1000);     
        
        /*
        // code written by Harshavardhan Y R, To cancel the OpportunityLineItems and Competitors
        var maProductCategoryDetails = component.find('MA_Product_Category_Details_Id');
        var  productsAndCompetitors = maProductCategoryDetails.find('productsAndCompetitorsAuraId');
        if(productsAndCompetitors != null){
           productsAndCompetitors.cancelRecordsMethod(); 
        } */
        
        var cmpEvent = component.getEvent("refreshTab");
        cmpEvent.setParams({
            "selectedTab":component.get('v.MAChildAttrObj').selectedProductTab,
            "cancelRecord":true,
            "isResetLink":false
        });
        cmpEvent.fire();
        
    },
    makeFieldsEditable: function(component, event, helper) {
        console.log('Inside MA_CUSTOM');
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        component.set("v.isEdit",true);        
        setTimeout(function(){ 
            $A.util.addClass(spinner, "slds-hide");
        }, 1000);
        if(component.get("v.MAChildAttrObj.isAdditionalInfo") === false && component.get("v.MAChildAttrObj.isAdditionalInfo2") === false && component.get("v.MAChildAttrObj.isAdditionalInfo2") !== true){
            $A.util.addClass(component.find("edit_ActionBar"),'slds-hide');            
            $A.util.addClass(component.find("Edit_Mode_risen"),'risen');                
            $A.util.removeClass(component.find("save_cancel_ActionBar"),'slds-hide');
            $A.util.addClass(component.find("editBtn"),'slds-hide');
            var cmpEvent = component.getEvent("refreshTab");
            cmpEvent.setParams({
                "selectedTab":component.get('v.MAChildAttrObj').selectedProductTab,
                "isTabDisable":true,
            });
            cmpEvent.fire();
        }                  
    },
    focusSelectedFeild: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var selectedFeild = selectedItem.dataset.record;
        var MA_Product_Category_Details_Id = component.find('MA_Product_Category_Details_Id');
        MA_Product_Category_Details_Id.focusOnErrorField(selectedFeild);
    },
    errorPopup: function(component, event, helper) {
        $A.util.toggleClass(component.find("error_Popup"),'hide');
    },
    generrorPopup: function(component, event, helper) {
        $A.util.toggleClass(component.find("generror_Popup"),'hide');
    },
    productsAndCompetitorsEventMethod: function(component, event, helper) { 
        var spinner = component.find("mySpinner"); 
        if(event.getParam('startProcessing')){
            if(component.get("v.MAChildAttrObj.isAdditionalInfo") === false){
                $A.util.removeClass(spinner, "slds-hide");
            }
        }else if(event.getParam('stopProcessing')){            
            $A.util.addClass(spinner, "slds-hide");
        }   
        
        if(event.getParam('isSaveSuccess')){           
            var cmpEvent = component.getEvent("refreshTab");
            cmpEvent.setParams({
                "selectedTab":component.get('v.MAChildAttrObj').selectedProductTab,
                "isResetLink":component.get('v.isReset')
            });
            cmpEvent.fire();
            if(!component.get('v.MAChildAttrObj.isDataServiceTrasaction')){
                var resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": "Saved",
                    "message": "The record was updated."
                });
                resultsToast.fire();
                $A.get('e.force:refreshView').fire(); 
            }
            var appEvent =  $A.get("e.c:MA_SAVE_SUCCESS");
            appEvent.setParams({
                "refresh_ES":true
            });
            setTimeout(function(){
                appEvent.fire();
            },2000);
            if(component.find('pubsub') != undefined) {
             component.find('pubsub').fireEvent('successEvent',true);    
            }
        }        
        else if(event.getParam('clickEditButton')){
            component.makeFieldsEditable();
        }
            else if(event.getParam('clickSaveButton')){
                component.handleSaveRecord();
            }
        
        if(event.getParam('enableCancelSave')){            
            var scrollAttr = component.find('MA_CUSTOM');                                 
            $A.util.removeClass(spinner, "slds-hide");
            $A.util.addClass(component.find("Edit_Mode_risen"),'risen');                
            $A.util.removeClass(component.find("save_cancel_ActionBar"),'slds-hide');            
            $A.util.addClass(component.find("editBtn"),'slds-hide');
            setTimeout(function(){ 
                $A.util.addClass(spinner, "slds-hide");
            }, 1000); 
        }            
    },
    resetSalesStage: function(component, event, helper) {
        var resetConfirm = component.find('resetConfirm');
        for(var i = 0; i < resetConfirm.length ; i=i+1){
            $A.util.removeClass(resetConfirm[i], 'slds-hide');
            $A.util.addClass(resetConfirm[i], 'slds-show');
        }         
        component.set('v.resetMessage','Do you want to reset the starting Sales Stage');
        var SalesStageItag =  event.getParam('SalesStageItag');
        component.set('v.resetItag',SalesStageItag);
    },
    confirmCancel: function(component, event, helper) {
        var resetConfirm = component.find('resetConfirm');
        for(var i = 0; i < resetConfirm.length ; i=i+1){
            $A.util.removeClass(resetConfirm[i], 'slds-show');
            $A.util.addClass(resetConfirm[i], 'slds-hide');
        }  
        component.set('v.isReset',false);
    },
    confirmReset: function(component, event, helper) {
        var resetConfirm = component.find('resetConfirm');
        for(var i = 0; i < resetConfirm.length ; i=i+1){
            $A.util.removeClass(resetConfirm[i], 'slds-show');
            $A.util.addClass(resetConfirm[i], 'slds-hide');
        }  
        var SalesStageItag =  component.get('v.resetItag');
        var intialItag = '';
        var possItag = '';
        intialItag = 'Inital_Selected_'+SalesStageItag;
        possItag = 'Progression_'+SalesStageItag;
        component.get('v.simpleRecord')[SalesStageItag] = '';
        component.get('v.simpleRecord')[intialItag] = '';
        component.get('v.simpleRecord')[possItag] = '';
        //helper.handelSaveRecordHelper(component, event);             
        component.set('v.isReset',true);
        if(SalesStageItag.indexOf('Medical') >= 0){
            var opportunityRecord = component.get('v.simpleRecord');
            opportunityRecord['Sold_New_Mbrs__c'] = 0;
            opportunityRecord['Termed_Mbrs__c'] = 0;
            opportunityRecord['Net_Results__c'] = 0;
            opportunityRecord['Members_QUOTED_in_the_Proposal_Medical__c'] = 0;
            opportunityRecord['Estimated_Members_Existing_New__c'] = 0;
            opportunityRecord['Existing_Members_Retained__c'] = 0;
            opportunityRecord['Existing_Members_Retained_Pinnacle__c'] = 0;                
            opportunityRecord['Sold_Retained_Members__c'] = 0;
            opportunityRecord['Estimated_Additional_New_Members__c'] = 0;
            opportunityRecord['Existing_Members_Involved_in_the_Bid__c'] =0;     
            opportunityRecord['Existing_Membership_at_Risk__c'] = 0;
            opportunityRecord['Members_Trans_From_or_To_Another_Segment__c'] = 0;
            opportunityRecord['Overall_New_Membership_Impact__c'] = 0;            
        }
        var maProductCategoryDetails = component.find('MA_Product_Category_Details_Id');  
        if(maProductCategoryDetails != null){
            var  productsAndCompetitors = maProductCategoryDetails.find('productsAndCompetitorsAuraId');    
            if(productsAndCompetitors != null){
                productsAndCompetitors.resetProductAndComp(SalesStageItag);              
            }
        }  
        helper.handelSaveRecordHelper(component, event,true);
    },
    focusCompetitors : function(component, event, helper) {
        setTimeout(function() { 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
        }, 100);
    },
    showHidecomponent : function(component, event, helper) {
        console.log("In product category showHide Component");
        console.log(component.get('v.simpleRecord').Id);
        var MA_ProductsInvolvedObj = {'OppId':component.get('v.simpleRecord').Id};
        $A.createComponents([["c:MA_ProductsInvolvedLink",{attribute:true,MA_ProductsInvolvedObj:MA_ProductsInvolvedObj}]],
                            function(newCmp, status, errorMessage){
                                //Add the new button to the body array
                                if (status === "SUCCESS") {
                                    console.log(" Success in show hide component of product category")
                                    component.set("v.body", newCmp);
                                    var cmpEvent = component.getEvent("refreshTab");
                                    cmpEvent.setParams({
                                        "isProdCatLink":true
                                    });
                                    cmpEvent.fire();
                                }
                                else if (status === "INCOMPLETE") {
                                    console.log("No response from server or client is offline.")
                                    // Show offline error
                                }
                                    else if (status === "ERROR") {
                                        console.log("Error: " + errorMessage);
                                        // Show error message
                                    }
                            }
                           );
        
    }
})