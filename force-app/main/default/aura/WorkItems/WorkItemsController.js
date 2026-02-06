({
    init: function (component, event, helper) {
        debugger;
        //component.set("v.opportunityMap", {});
        //$A.util.removeClass(component.find("tableSpinner"), "slds-hide");
        helper.getData(component, event, null, null); 
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
        
        
        /*$A.util.removeClass(component.find("onEdit"),"no-edit");
        var saveCancelButton = event.getParam("enableSaveCancelButton");
        var opp = event.getParam("updatedOpp");
        if(saveCancelButton != null && saveCancelButton == true){
            $A.util.removeClass(component.find("saveCancelbuttons"), "slds-hide"); 
        }
        else if(opp != null && opp != undefined){
            var oppId = opp.Id;
            var oppMap =component.get("v.opportunityMap");
            oppMap[oppId] = opp;
            component.set("v.opportunityMap", oppMap);  
        }*/
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
        } else {
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
    }
})