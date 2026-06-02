({
	doInit : function(component, event, helper) {     
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
        }
        var Child_Data = component.get('v.Child_Data');
        var page = component.get("v.page") || 1;
        //helper.getAccountsAndMembershipActivity(component,event,page,Child_Data);
        helper.getCompanies(component,event,Child_Data);
	},
    
    sortFields : function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        // Modified By Gurjot 
        var fieldItagsWithAuraAttrMap = '{"AccountFirm__r.Name":"sortAccountName","AccountFirm__r.Client_Reference_Status__c":"sortReferenceableAsc","RecordType":"sortAccountType","Owner":"sortAccountOwner","AccountFirm__r.NPS__c":"sortLRTAsc"}'; //Modified By Gurjot
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        
        helper.sortAcc(component, event, fieldNameToBeSorted, sortFieldCompName);
    },
    pageChange: function(component, event, helper) {
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
        }, 600); 
        
        var Child_Data = component.get('v.Child_Data');
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getAccountsAndMembershipActivity(component,event,page,Child_Data);
    },
    
    openSortingPopup : function(component, event, helper){
        // Modified By Gurjot 
        var fieldsToSort = [{"fieldName":"AccountFirm__r.Name","fieldDisplayName":"Account Name","fieldOrder":component.get("v.sortAccountName")},
                            {"fieldName":"AccountFirm__r.Client_Reference_Status__c","fieldDisplayName":"Referenceable Client","fieldOrder":component.get("v.sortReferenceableAsc")},
                            {"fieldName":"AccountFirm__r.RecordType.Name","fieldDisplayName":"Account Type","fieldOrder":component.get("v.sortAccountType")},
                            {"fieldName":"AccountFirm__r.Owner.Name","fieldDisplayName":"Owner","fieldOrder":component.get("v.sortAccountOwner")},
                            {"fieldName":"AccountFirm__r.NPS__c","fieldDisplayName":"LRT (Most Recent Score)","fieldOrder":component.get("v.sortLRTAsc")}
                           ];       
        $A.createComponents([["c:Panel_Component_Sorting",{attribute:true,'FieldsToSort':fieldsToSort,'lastSortField':component.get("v.lastSortField"),'isChildComponent':true}]],
                            function(newCmp, status){ 
                                if (component.isValid() && status === 'SUCCESS') {
                                    var dynamicComponentsByAuraId = {};
                                    for(var i=0; i < newCmp.length; i++) {
                                        var thisComponent = newCmp[i];
                                        dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                    }
                                    component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                    component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                    component.set("v.body", newCmp); 
                                } 
                            });        
    },
    
    sortFieldsMobile: function(component, event, helper) {      
        if(!event.getParam('isApply')) {
            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                return;
            }
        }
        var Child_Data = component.get('v.Child_Data');
        var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
        component.set("v.lastSortField",fieldNameToBeSorted);
        var orderToBeSorted = event.getParam('orderToBeSorted');
        // Modified By Gurjot 
        var fieldItagsWithAuraAttrMap = '{"AccountFirm__r.Name":"sortAccountName","AccountFirm__r.Client_Reference_Status__c":"sortReferenceableAsc","AccountFirm__r.RecordType.Name":"sortAccountType","AccountFirm__r.Owner.Name":"sortAccountOwner","AccountFirm__r.NPS__c":"sortLRTAsc"}'; //Modified By Gurjot
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted]; 
        if(orderToBeSorted === "DESC"){
            component.set("v."+sortFieldCompName,true); 
        }else{
            component.set("v."+sortFieldCompName,false); 
        }
        var page = 1;
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName,Child_Data);
    }
})