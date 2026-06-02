({
    doInit : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        
        if(device != "DESKTOP"){
            component.set('v.isDesktop', false);
            helper.getRelatedAccounts(component, event);
        }else{
            component.set('v.isDesktop', true);
        }
    },
    
    expandCollapse: function(component, event, helper) {
        if(!component.get('v.isDesktop')){
            return;
        }
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            helper.getRelatedAccounts(component, event);
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
        }
    },
    
    pageChange: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        } 
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getRelatedAccounts(component, event, page, component.get('v.sortField'),component.get('v.sortOrder'));
    },
    
    openSortingPopup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        }  
        
        var fieldsToSort = [{"fieldName":"Primary__c","fieldDisplayName":"Company Primary","fieldOrder":component.get("v.sortFirmPrimaryAsc")},
                            {"fieldName":"Account.Name","fieldDisplayName":"Company Name","fieldOrder":component.get("v.sortCFNameAsc")},
                            {"fieldName":"Account.Client_Reference_Status__c","fieldDisplayName":"Referenceable Client","fieldOrder":component.get("v.sortReferenceableAsc")},
                            {"fieldName":"Account.RecordType.Name","fieldDisplayName":"Company Type","fieldOrder":component.get("v.sortTypeAsc")},
                            {"fieldName":"Account.Owner.Name","fieldDisplayName":"Owner","fieldOrder":component.get("v.sortOwnerAsc")},
                            {"fieldName":"Account.NPS__c","fieldDisplayName":"LRT (Most Recent Score) ","fieldOrder":component.get("v.sortLRTAsc")}
                           ];
        $A.createComponents([["c:Panel_Component_Sorting",{attribute:true,'FieldsToSort':fieldsToSort,'lastSortField':component.get("v.lastSortField")}]],
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
    
    sortFields: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        }
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        var fieldItagsWithAuraAttrMap = '{"Primary__c":"sortFirmPrimaryAsc","Account.Name":"sortCFNameAsc","Account.Client_Reference_Status__c":"sortReferenceableAsc","Account.RecordType.Name":"sortTypeAsc","Account.Owner.Name":"sortOwnerAsc","Account.NPS__c":"sortLRTAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        //var page = 1;
        var page = component.get('v.page'); // Based on pagination sorting the data
        console.log('page::'+component.get('v.page'));
        
        helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
        
    },
    
    sortFieldsMobile: function(component, event, helper) {      
        
        if(!event.getParam('isApply')){
            var device = $A.get("$Browser.formFactor");
            if(device != "DESKTOP"){ 
                $A.util.removeClass(component.find("sortEdit"),"hide");
            }  
        }else if(event.getParam('isApply')){
            var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
            component.set("v.lastSortField",fieldNameToBeSorted);
            
            var orderToBeSorted = event.getParam('orderToBeSorted');
            var fieldItagsWithAuraAttrMap = '{"Primary__c":"sortFirmPrimaryAsc","Account.Name":"sortCFNameAsc","Account.Client_Reference_Status__c":"sortReferenceableAsc","Account.RecordType.Name":"sortTypeAsc","Account.Owner.Name":"sortOwnerAsc","Account.NPS__c":"sortLRTAsc"}';
            var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
            var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted]; 
            if(orderToBeSorted === "DESC"){
                component.set("v."+sortFieldCompName,true); 
            }else{
                component.set("v."+sortFieldCompName,false); 
            }
            var page = 1;
            helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
        }
        
        
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    }
})