({
    doInit : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    //helper.getAccountsAndMembershipActivity(component,event);
                }            
            }, 5000);           
        }else{
            var iOS = parseFloat(
                ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                .replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
            
            if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){
                $A.util.addClass(component.find('sortEdit'),'iosBottom');
                $A.util.addClass(component.find('account_MemberShip_Activity'),'ipadBottomIos');
            }else{
                $A.util.addClass(component.find('account_MemberShip_Activity'),'ipadbottom');
            }
            component.set('v.isExpand',true);
            $A.util.toggleClass(component.find('account_MemberShip_Activity'),'slds-is-open');
        }
    },
    
    expandCompanies : function(component, event, helper){
        helper.toggleAccountSection(component, event);
    },
    
    expandMA : function(component, event, helper){
        helper.toggleMASection(component, event);
    },
    
    Accounts_Current_RelationShip_ShowFullList : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        var childData = {'accountId':component.get('v.recordId'),'isModalBody':true};
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'ModalBodyData':childData,'Modalheader':'Companies (Current Relationships)','ModalBody':'Accounts_Current_RelationShips_Modal'}]],
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
        }else{
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
            component.set("v.scrollStyleForDevice","");
            $A.createComponents([["c:Panel_Component",{attribute:true,'ModalBodyData':childData,'Modalheader':'Companies (Current Relationships)','ModalBody':'Accounts_Current_RelationShips_Modal'}]],
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
    
    MemberShip_Activity_ShowFullList: function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        var childData = {'accountId':component.get('v.recordId'),'isModalBody':true};
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'ModalBodyData':childData,'Modalheader':'Membership Activity History','ModalBody':'MemberShip_Activity_ShowFullList'}]],
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
        }else{
            
            $A.createComponents([["c:Panel_Component",{attribute:true,'ModalBodyData':childData,'Modalheader':'Membership Activity History','ModalBody':'MemberShip_Activity_ShowFullList'}]],
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
    
    expandCollapse: function(component, event, helper) {
        console.log('Expand Collapse');
        if(!component.get('v.isDesktop')){
            return;
        }
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){          
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
            
            var cmpTarget1 = component.find('account_section');
            var cmpTarget2 = component.find('ma_section');
            var myLabel1 = component.find('utilityToggle1').get("v.iconName");
            var myLabel2 = component.find('utilityToggle2').get("v.iconName");
            
            if(myLabel1=="utility:chevrondown"){          
                component.find('utilityToggle1').set("v.iconName","utility:chevronright");
                $A.util.toggleClass(cmpTarget1,'slds-is-open');
            }
            if(myLabel2=="utility:chevrondown"){          
                component.find('utilityToggle2').set("v.iconName","utility:chevronright");
                $A.util.toggleClass(cmpTarget2,'slds-is-open');
            }
            
            component.set('v.isCompaniesQueried', false);
            component.set('v.isMAQueried', false);
        }
    },
   
    modalClose : function(component, event, helper) {
        var modalComponent = component.find('Account_MemberShipActivity_Modal');
        for(var i = 0; i < modalComponent.length; i = i+1){
            $A.util.addClass(modalComponent[i], 'slds-backdrop--hide');
            $A.util.removeClass(modalComponent[i], 'slds-backdrop--open');
        }
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i = 0; i < ErrorMessage.length; i = i+1){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
  
    sortFields : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        // Modified By Gurjot
        var fieldItagsWithAuraAttrMap = '{"AccountFirm__r.Name":"sortAccountName","AccountFirm__r.Client_Reference_Status__c":"sortReferenceableAsc","RecordType":"sortAccountType","Owner":"sortAccountOwner","AccountFirm__r.NPS__c":"sortLRTAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        
        helper.sortAcc(component, event, fieldNameToBeSorted, sortFieldCompName);
    },
    
    sortFields1 : function(component, event, helper) {
        
        var selectedItem1 = event.currentTarget;
        var fieldNameToBeSorted1 = selectedItem1.dataset.record;
        
        var fieldItagsWithAuraAttrMap1 = '{"Opportunity.Name":"sortMAName","Opportunity.Account.Name":"sortAccName","Opportunity.Membership_Activity_Type__c":"sortMAType","Opportunity.EffectiveDate__c":"sortMAEffectDate","Opportunity.Owner.Name":"sortMAOwner","Opportunity.Status__c":"sortMAStatus","Opportunity.Disposition_Medical__c":"sortMADispoMed"}';
    
        var sortFieldCompNameMap1 = JSON.parse(fieldItagsWithAuraAttrMap1);
        var sortFieldCompName1 = sortFieldCompNameMap1[fieldNameToBeSorted1];
        
        helper.sortMA(component, event, fieldNameToBeSorted1, sortFieldCompName1);
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        console.log('modelCloseComponentEvent');
        if(!component.get('v.isDesktop')){
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
        }
        helper.modalGenericClose(component);
    },
    
    openSortingPopup : function(component, event, helper){
        console.log('Sorting initiate');
        var fieldsToSort = null;
        var selectedItem = event.currentTarget;
        var sortBtn = selectedItem.dataset.record;
        
        if(sortBtn === 'sortAcc'){
            component.set('v.accSort', true);
            //Modified By Gurjot
            fieldsToSort = [{"fieldName":"AccountFirm__r.Name","fieldDisplayName":"Company Name","fieldOrder":component.get("v.sortAccountName")},
                            {"fieldName":"AccountFirm__r.Client_Reference_Status__c","fieldDisplayName":"Referenceable Client","fieldOrder":component.get("v.sortReferenceableAsc")},
                            {"fieldName":"RecordType","fieldDisplayName":"Company Type","fieldOrder":component.get("v.sortAccountType")},
                            {"fieldName":"Owner","fieldDisplayName":"Owner","fieldOrder":component.get("v.sortAccountOwner")},
                            {"fieldName":"AccountFirm__r.NPS__c","fieldDisplayName":"LRT (Most Recent Score)","fieldOrder":component.get("v.sortLRTAsc")}
                           ];
        }else if(sortBtn === 'sortMA'){
            component.set('v.maSort', true);
            
            fieldsToSort = [{"fieldName":"Opportunity.Name","fieldDisplayName":"Membership Activity Name","fieldOrder":component.get("v.sortMAName")},
                            {"fieldName":"Opportunity.Account.Name","fieldDisplayName":"Company Name","fieldOrder":component.get("v.sortAccName")},                            
                            {"fieldName":"Opportunity.EffectiveDate__c","fieldDisplayName":"Effective Date","fieldOrder":component.get("v.sortMAEffectDate")},
                            {"fieldName":"Opportunity.Status__c","fieldDisplayName":"Status","fieldOrder":component.get("v.sortMAStatus")},
                            {"fieldName":"Opportunity.Owner.Name","fieldDisplayName":"Owner","fieldOrder":component.get("v.sortMAOwner")},
                            {"fieldName":"Opportunity.Disposition_Medical__c","fieldDisplayName":"Disposition(Medical)","fieldOrder":component.get("v.sortMADispoMed")}
                           ];
        }   
        
        if(!component.get('v.isDesktop')){
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }

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
    
    sortFieldsMobile: function(component, event, helper) {   
        if(event.getParam('isChildComponent')) {
            return; 
        }        
        var isApplyVal = event.getParam('isApply');
        if(isApplyVal) {
            var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
            component.set("v.lastSortField",fieldNameToBeSorted);
            var orderToBeSorted = event.getParam('orderToBeSorted');
            var fieldItagsWithAuraAttrMap = null;
            
            if(component.get('v.accSort')){
                component.set('v.accSort', true);
                // Modified By Gurjot
                fieldItagsWithAuraAttrMap = '{"AccountFirm__r.Name":"sortAccountName","AccountFirm__r.Client_Reference_Status__c":"sortReferenceableAsc","RecordType":"sortAccountType","Owner":"sortAccountOwner",,"AccountFirm__r.NPS__c":"sortLRTAsc"}';
                var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
                var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
                
                helper.sortAcc(component, event, fieldNameToBeSorted, sortFieldCompName);
                
            }else if(component.get('v.maSort')){
                component.set('v.maSort', true);
                
                fieldItagsWithAuraAttrMap = '{"Opportunity.Name":"sortMAName","Opportunity.Account.Name":"sortAccName",Opportunity.EffectiveDate__c":"sortMAEffectDate","Opportunity.Status__c":"sortMAStatus"}';
                
                var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
                var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted]; 
                if(orderToBeSorted === "DESC"){
                    component.set("v."+sortFieldCompName,true); 
                }else{
                    component.set("v."+sortFieldCompName,false); 
                }
                helper.sortMA(component, event, fieldNameToBeSorted,sortFieldCompName);
            }
            
            
        }else{
            if(!component.get('v.isDesktop')){
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            }
        }
    },
   
    scrollBottom: function(component, event, helper){	        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP" && $A.get("$Browser.isIOS")){            
        	var isScrollStop = component.get("v.isScrollStop");
        	component.set("v.isStop",component.get("v.isStop")+1);                    
        	if(isScrollStop){                       
            
            var actionBar = component.find("action-bar-mobile");               	           
            $A.util.addClass(actionBar,"slds-hide");    
                        
                component.set("v.isScrollStop",false); 
                var myInterval = window.setInterval(
                    $A.getCallback(function() {
                        console.log('inside interval')
                        component.set("v.nextLastCount",component.get("v.lastCount"));
                        component.set("v.lastCount",component.get("v.isStop"));                         
                        if(component.get("v.lastCount") === component.get("v.nextLastCount")){                        	component.set("v.isStopped",true);
                            $A.util.removeClass(actionBar,"slds-hide");
                            component.set("v.isScrollStop",true);
                            clearInterval(myInterval);
                        }
                    }), 250
                ); 
                                              
            }
        } 
    }
})