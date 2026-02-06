({
   /* init: function (component, event, helper) {
        //debugger;
        component.set("v.opportunityMap", {});
        //$A.util.removeClass(component.find("tableSpinner"), "slds-hide");
        helper.getData(component, event, null, null); 
    },*/
    refresh:function(component, event, helper) {
       
        component.set("v.opportunityMap", {});
        component.set("v.isLoading", true);
        component.set("v.isDataLoaded", false);
        component.set('v.surveyContactsList',[]);
        helper.getRefresh(component, event, null, null);
    },
    sortFields : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"Account.Name" : "sortCompanyAsc", "CM_VPCR_RVP__r.Name" : "sortRVPVPCRAsc", "Owner.Name" : "sortSCEAsc", "Name" : "sortMANameAsc", "Comments_Last_Modified__c" : "sortCommentsLastModifiedAsc", "Comments__c" : "sortMAComments"}';
        
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        console.log('sortFieldCompName >>>'+sortFieldCompName);
        component.set("v.sortedColumn", fieldNameToBeSorted);
        component.set("v.sortedType", sortFieldCompName);
        if(component.get("v.isFiltered") == true){
            helper.getFilteredData(component, event, fieldNameToBeSorted, sortFieldCompName);
        }
        else{
            helper.getData(component, event, fieldNameToBeSorted, sortFieldCompName);
        } 
    },
    
    handleSave: function (component, event,helper) {
        $A.util.addClass(component.find("onEdit"),"no-edit");
        $A.util.addClass(component.find("saveCancelbuttons"), "slds-hide");
        var updatedOppList = component.get("v.saveUpdatedWorkItemList");
        var childCmp = component.find("childComponent");
        if(childCmp != null && childCmp != undefined) {
            if(Array.isArray(childCmp)) {
                for(var i=0;i<childCmp.length;i++) {
                    childCmp[i].closeEditPopup();
                } 
            } else {
                childCmp.closeEditPopup();
            } 
        }
        
        var oppMap = component.get("v.opportunityMap");
        for(var key in oppMap){
            updatedOppList.push(oppMap[key]);
        }
        component.set("v.saveUpdatedWorkItemList",updatedOppList);
        helper.updateopp(component,event);
        var fieldNameToBeSorted = component.get("v.sortedColumn");
        var sortFieldCompName = component.get("v.sortedType");
        
        if(component.get("v."+sortFieldCompName) == true){
            component.set(("v."+sortFieldCompName),false);
        }
        else{
            component.set(("v."+sortFieldCompName),true);
        }
        
        if(component.get("v.isFiltered") == true ){
            helper.getFilteredData(component, event, fieldNameToBeSorted, sortFieldCompName);
        }
        else{
            helper.getData(component, event, fieldNameToBeSorted, sortFieldCompName); 
        } 
    },
    
    handleFilters: function(component, event, helper) {
        var fieldNameToBeSorted = component.get("v.sortedColumn");
        var sortFieldCompName = component.get("v.sortedType");
        component.set("v.isFiltered",true);
        helper.getFilteredData(component, event, fieldNameToBeSorted, sortFieldCompName);
    },
    
    changeOnVPCRList : function(component, event, helper) {
        if(component.find('VPCRRVPsDropDown') != undefined) {
            var selVPCRVal = component.find('VPCRRVPsDropDown').get('v.value');
        }
        //component.set("v.selectedVPCR",selVPCRVal );
        helper.updateSCEDropDownList(component, event);
    },
    
    changeOnSCEList : function(component, event, helper) {
        var selSCEVal = component.find('SCEsDropDown').get('v.value');
        //component.set("v.selectedSCE",selSCEVal ); 
    },
    
    handleCancel :function (component, event, helper){
        $A.util.addClass(component.find("onEdit"),"no-edit");
        $A.util.addClass(component.find("saveCancelbuttons"), "slds-hide");
        
        var fieldNameToBeSorted = component.get("v.sortedColumn");
        var sortFieldCompName = component.get("v.sortedType");
        
        if(component.get("v."+sortFieldCompName) == true){
            component.set(("v."+sortFieldCompName),false);
        }
        else{
            component.set(("v."+sortFieldCompName),true);
        }
        
        if(component.get("v.isFiltered") == true ){
            helper.getFilteredData(component, event, fieldNameToBeSorted, sortFieldCompName);
        }
        else{
            helper.getData(component, event, fieldNameToBeSorted, sortFieldCompName); 
        }   
    },    
    
    handleUpdatedOppAndSave : function (component, event, helper) {
      
        var editedRow = event.getParam("editOnlyOneRecord");
        if(editedRow != undefined && editedRow != null && editedRow) {
            var childCmp = component.find("childComponent");
            if(editedRow == true){
                if(childCmp != null && childCmp != undefined) {
                    if(Array.isArray(childCmp)) {
                        for(var i=0;i<childCmp.length;i++) {
                            childCmp[i].closeEditPopup();
                        } 
                    } else {
                        childCmp.closeEditPopup();
                    } 
                }
            }
        }else {
            var fieldNameToBeSorted = component.get("v.sortedColumn");
            var sortFieldCompName = component.get("v.sortedType");
            
            if(component.get("v."+sortFieldCompName) == true) {
                component.set(("v."+sortFieldCompName),false);
            } else {
                component.set(("v."+sortFieldCompName),true);
            }
            
            if(component.get("v.isFiltered") == true ) {
                helper.getFilteredData(component, event, fieldNameToBeSorted, sortFieldCompName);
            } else {
                helper.getData(component, event, fieldNameToBeSorted, sortFieldCompName); 
            }
        }        
    },
    
    getSurveyRecords : function(component, event, helper) {
        helper.getSurveyRecordsHelper(component, event, helper);
    },
    
    handleUpdateMAComment : function(component, event, helper) {
        helper.getData(component, event, null, null);
    },
    
    
    handleCMCMCValidation:function(component,event,helper){
        if(!component.get("v.inputValueLwc") && !component.get("v.inputValueLwcContact") && !component.get("v.inputValueLwcAMT") ){
			 helper.CMCMCValidation(component,event);
			 console.log("Inside If");            
        }   
        else {
            console.log("Inside else");  
           component.set('v.showConfirmDialog', true); 
        }
    },
    
    handleSCEValidation:function(component,event,helper){
        if(!component.get("v.inputValueLwc") && !component.get("v.inputValueLwcContact") && !component.get("v.inputValueLwcAMT") )
            helper.SCEValidation(component,event);
        else
            component.set('v.showConfirmDialog', true);
    },

    closeSCEAlert : function(component,event,helper){
        component.set("v.noPrimaryContact",false);
    },
    closeCSIAlret:function(component,event,helper){
        component.set("v.showNoSurveyContactDialog",false);
    },
    closeSurveyContactAlret : function(component,event,helper){
        component.set("v.proceedWithoutSurveyContact",true);
        component.set("v.showNoSurveyContactDialog",false);
    },

    closeInvalidContactAlret : function(component,event,helper){
        component.set("v.showInvalidContactPopup",false);
        helper.validateCurrentProd(component);
    },
    
    proceedWithoutPrimaryContactCtrl: function(component,event,helper){
        component.set("v.proceedWithoutPrimaryContact",true);
        component.set("v.noPrimaryContact",false);
    },
    
    getValueFromLwcContact : function(component, event, helper) {
		component.set("v.inputValueLwcContact",event.getParam('value'));
		console.log(event.getParam('value'));
        
	},
     getValueFromLwc : function(component, event, helper) {
		component.set("v.inputValueLwc",event.getParam('value'));
		console.log(event.getParam('value'));
        
	},
     getValueFromLwcAMT : function(component, event, helper) {
		component.set("v.inputValueLwcAMT",event.getParam('value'));
    },
    
     continueValidation : function(component, event, helper) {
        component.set('v.showConfirmDialog', false);
         if(component.get('v.cmcmc')){
              helper.CMCMCValidation(component,event);
         }else if(component.get('v.isSce')){
             helper.SCEValidation(component,event);
         }
    },
    
    cancelValidation : function(component, event, helper) {
        component.set('v.showConfirmDialog', false);
    },
    
    
})