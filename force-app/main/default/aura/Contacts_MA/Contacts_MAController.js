({
    doInit : function(component, event, helper) {
        
        var device = $A.get("$Browser.formFactor");
        
        var iOS = parseFloat(
            ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
            .replace('undefined', '3_2').replace('_', '.').replace('_', '')
        ) || false;  
        
        if(device != "DESKTOP"){
            
            if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){                
                $A.util.addClass(component.find('sortEdit'),'iosBottom');
                $A.util.addClass(component.find('contact_MA'),'ipadBottomIos');
            }else{
                $A.util.addClass(component.find('contact_MA'),'ipadbottom');
            }
            
            component.set('v.isDesktop', false);
            helper.getRelatedMA(component, event);
            $A.util.toggleClass(component.find('contact_MA'),'slds-is-open');    
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
            helper.getRelatedMA(component, event);
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
        }
    },
    
    navToRecord : function (component, event, helper) {
        var selectedItem = event.currentTarget;
        var accountId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": accountId
        });
        navEvt.fire();
    },
    
    pageChange: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        } 
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getRelatedMA(component, event, page, component.get('v.sortField'),component.get('v.sortOrder'));
    },
    
    openSortingPopup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        }  
        
        var fieldsToSort = [{"fieldName":"IsPrimary","fieldDisplayName":"Membership Activity Primary","fieldOrder":component.get("v.sortFirmPrimaryMA")},
                            {"fieldName":"Opportunity.Name","fieldDisplayName":"Membership Activity Name","fieldOrder":component.get("v.sortMANameAsc")},
                            {"fieldName":"Opportunity.Account.Name","fieldDisplayName":"Company Name","fieldOrder":component.get("v.sortCompanyNameAsc")},
                            {"fieldName":"Opportunity.EffectiveDate__c","fieldDisplayName":"Effective Date","fieldOrder":component.get("v.sortMAEffectiveDateAsc")},
                            {"fieldName":"Opportunity.Status__c","fieldDisplayName":"Status","fieldOrder":component.get("v.sortStatusAsc")},
                            {"fieldName":"Opportunity.Owner.Name","fieldDisplayName":"Owner","fieldOrder":component.get("v.sortOwner")},
                            {"fieldName":"Opportunity.Disposition_Medical__c","fieldDisplayName":"Disposition(Medical)","fieldOrder":component.get("v.sortDispMed")}
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
        var fieldItagsWithAuraAttrMap = '{"IsPrimary" : "sortFirmPrimaryMA","Opportunity.Name" : "sortMANameAsc","Opportunity.Account.Name" : "sortCompanyNameAsc","Opportunity.EffectiveDate__c" : "sortMAEffectiveDateAsc", "Opportunity.Status__c" : "sortStatusAsc","Opportunity.Owner.Name":"sortOwner","Opportunity.Disposition_Medical__c":"sortDispMed"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = 1;
        
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
            var fieldItagsWithAuraAttrMap = '{"IsPrimary" : "sortFirmPrimaryMA","Opportunity.Name" : "sortMANameAsc","Opportunity.Account.Name" : "sortCompanyNameAsc","Opportunity.EffectiveDate__c" : "sortMAEffectiveDateAsc", "Opportunity.Status__c" : "sortStatusAsc"}';
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
        
        
    }
})