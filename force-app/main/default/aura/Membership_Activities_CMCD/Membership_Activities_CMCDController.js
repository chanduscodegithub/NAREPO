({
    doInit : function(component, event, helper) {
        console.log('MA Account');
        helper.checkEditAccesToThisUser(component, event);
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP") {
        	component.set('v.isDesktop', true);   
        } else {
            component.set('v.isDesktop', false);
            var page = component.get("v.page") || 1;
            helper.getMembershipActivities(component,page,event);                        
            $A.util.removeClass(component.find('action-bar-mobile'),'slds-hide');
            $A.util.toggleClass(component.find('MemberShip_Activity'),'slds-is-open');
            $A.util.addClass(component.find('newMemberBtn'),'slds-hide');
        }        
	},
    
    expandCollapse: function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var divId;
        var cmpTarget;
        var iconElement
        if(selectedItem == undefined || selectedItem == null) {
           divId = 'MemberShip_Activity'; 
           cmpTarget = component.find(divId);
           iconElement = 'utilityToggle';
        } else {
            divId = selectedItem.dataset.record;
            cmpTarget = component.find(divId);
        	iconElement = selectedItem.getAttribute("id");
        }
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            var page = component.get("v.page") || 1;
            helper.getMembershipActivities(component,page,event);
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }
    },
    
    createMARecord : function (component, event, helper) {
        
        if(component.get('v.isDesktop')) {
            $A.createComponents([["c:ModalComponent_MembershipActivityQA",{'ModalData':{'accountId':component.get('v.recordId')},'isDeskTop':true}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0;i<newCmp.length;i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        }else{            
         	$A.util.addClass(component.find("action-bar-mobile"),"slds-hide");  
            $A.createComponents([["c:ModalComponent_MembershipActivityQA",{'ModalData':{'accountId':component.get('v.recordId')},'isDeskTop':false}]],
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
            
        }
    },
    
    sortFields: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        var fieldItagsWithAuraAttrMap = '{"Name":"sortMAName","Membership_Activity_Type__c":"sortType","EffectiveDate__c":"sortEffectiveDate","Status__c":"sortStatus","Product_Type_Involved_in_Opp__c":"sortProducts"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = component.get("v.page") || 1;
        
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName);
    },
    
    pageChange: function(component, event, helper) {
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getMembershipActivities(component,page,event);
    },
    
     modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component, event);
    },
    
    modelCloseQAComponentEvent : function(component, event,helper) {
        helper.modalGenericClose1(component, event);
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    }
})