({
    getLoggedInUserRole : function(component){
        
        var action  = component.get('c.getLoggedInUserRoles');
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                component.set('v.isLoggedInUserValid', response.getReturnValue());
            }else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    
                }
            
        });
        
        $A.enqueueAction(action); 
        
    },
    
    getMAConsultants : function(component, event, page, columnName, sortType){
       var isFromQA = component.get('v.isFromQA');
        if(!isFromQA){
            component.set('v.isSpinnertoLoad', true);
            
            var primaryConsultantId = '';
            component.set('v.primaryId', primaryConsultantId);
            console.log(component.get('v.recordId')+'component.get');
            page = page || 1;
            columnName = columnName || 'IsPrimary';
            sortType = sortType || 'DESC';
            
            var action = component.get('c.fetchMAConsultants');
            action.setParams({'maId' : component.get('v.recordId'),
                              "pageNumber": page,
                              "columnName" : columnName,
                              "sortType" : sortType,
                             });
            
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === "SUCCESS"){
                    var responseObj = response.getReturnValue();
                    //console.log(JSON.stringify(response.getReturnValue().maConsultants));
                    if(response.getReturnValue().maConsultants != null && response.getReturnValue().maConsultants.length > 0) {
                        component.set('v.maConsultantList', responseObj.maConsultants);
                        component.set("v.page", responseObj.page);
                        component.set("v.total", responseObj.total);
                        component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                        component.set('v.isMAConsultantListEmpty', false);
                        
                        var listRecords = responseObj.maConsultants;
                        
                        for(var i = 0; i < listRecords.length; i++){
                            if(listRecords[i].IsPrimary == true){
                                primaryConsultantId = listRecords[i].ContactId;
                                component.set('v.primaryId', primaryConsultantId); 
                            }
                        }
                        
                        if(component.get('v.primaryId') != ''){
                            component.set('v.isPrimaryAccountExists', true); 
                        }else{
                            component.set('v.isPrimaryAccountExists', false); 
                        }
                        
                        
                    }else{
                        component.set('v.isMAConsultantListEmpty', true);
                    } 
                    
                    component.set('v.isSpinnertoLoad', false);
                    
                    var device = $A.get("$Browser.formFactor");
                    if(device != "DESKTOP"){ 
                        var iOS = parseFloat(
                            ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                            .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                        ) || false;  
                        
                        if($A.get("$Browser.isIOS")){
                            $A.util.addClass(component.find('articleClass'),'cScroll-table');
                        }
                        
                        $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");      
                        $A.util.removeClass(component.find("sortEdit"),"hide");
                        
                        if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){
                            $A.util.addClass(component.find('saveCancel'),'iosBottom');
                            $A.util.addClass(component.find('sortEdit'),'iosBottom');
                            $A.util.addClass(component.find('account_Consultant'),'ipadBottomIos');
                        }else{
                            $A.util.addClass(component.find('account_Consultant'),'ipadbottom');
                        }
                        $A.util.addClass(component.find('account_Consultant'),'slds-is-open');
                        
                    }   
                    var editTH = component.find('editTH');
                    $A.util.removeClass(editTH,'widthForFirstCol');
                    $A.util.addClass(editTH,'slds-cell-shrink');
                }
                else if (state === "INCOMPLETE") {                
                    
                }
                    else if (state === "ERROR") {
                        var errors = response.getError();
                        if (errors) {
                            if (errors[0] && errors[0].message) {
                                component.set('v.ErrorMessage',errors[0].message);
                                var ErrorMessage = component.find('ErrorMessage');
                                for(var i in ErrorMessage){
                                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                                }
                            }
                        } else {
                            console.log("Unknown error");
                        }
                        component.set('v.isSpinnertoLoad', false);
                    }
            });
            
            $A.enqueueAction(action);
        }
    },
    
    sortBy : function(component, event, columnName, page, sortFieldComp){
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1;
        
        var action = component.get('c.fetchMAConsultants');
        if(component.get("v."+sortFieldComp) ===  true){
            action.setParams({'maId' : component.get('v.recordId'),
                              "pageNumber": page,
                              "columnName" : columnName,
                              "sortType" : 'DESC'    
                             });    
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", columnName);
            component.set("v."+sortFieldComp, false);
        }else{
            action.setParams({'maId' : component.get('v.recordId'),
                              "pageNumber": page,
                              "columnName" : columnName,
                              "sortType" : 'ASC'    
                             });    
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", columnName);
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                var responseObj = response.getReturnValue();
                //console.log(JSON.stringify(response.getReturnValue().maConsultants));
                if(response.getReturnValue().maConsultants != null && response.getReturnValue().maConsultants.length > 0) {
                    component.set('v.maConsultantList', responseObj.maConsultants);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    component.set('v.isMAConsultantListEmpty', false);
                }else{
                    component.set('v.isMAConsultantListEmpty', true);
                } 
                
                component.set('v.isSpinnertoLoad', false);
                
                var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                    ) || false;  
                    
                    if($A.get("$Browser.isIOS")){
                        $A.util.addClass(component.find('articleClass'),'cScroll-table');
                    }
                    
                    $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");      
                    $A.util.removeClass(component.find("sortEdit"),"hide");
                    
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){
                        $A.util.addClass(component.find('saveCancel'),'iosBottom');
                        $A.util.addClass(component.find('sortEdit'),'iosBottom');
                        $A.util.addClass(component.find('account_Consultant'),'ipadBottomIos');
                    }else{
                        $A.util.addClass(component.find('account_Consultant'),'ipadbottom');
                    }
                    $A.util.addClass(component.find('account_Consultant'),'slds-is-open');
                    
                }   
                var editTH = component.find('editTH');
                $A.util.removeClass(editTH,'widthForFirstCol');
                $A.util.addClass(editTH,'slds-cell-shrink');
            }
            else if (state === "INCOMPLETE") {                
                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        
        $A.enqueueAction(action);
    },
    
    addConsultants : function(component, event, selectedConsultantList, isAllContact) {
        component.set('v.isSpinnertoLoad', true);
        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            this.modalClosing(component, event);
        }else{
            this.modalClosing(component, event);
        }
        
        var action = component.get('c.relateContactToMA');
        var maId = component.get('v.recordId');
        
        action.setParams({"maId" : maId,
                          "consultantIds" : selectedConsultantList,
                          "isAllContacts" : isAllContact});
        action.setCallback(this, function(response){
            var state = response.getState();
            
            if(state === "SUCCESS"){
                this.getMAConsultants(component, event);    
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        $A.enqueueAction(action);	
    },
    
    deleteRelation : function(component, event, consultantId){
        
        component.set('v.isSpinnertoLoad', true);
        
        var action = component.get('c.deleteRelationship');
        
        var maId = component.get('v.recordId');
        //var primaryId = component.get('v.primaryId');
        
        action.setParams({"maId" : maId, "consultantId" : consultantId});
        action.setCallback(this, function(response){
            var state = response.getState();
            
            if(response.getState() === "SUCCESS"){
                
                if(component.get('v.primaryId') === consultantId){
                    this.updatePrimaryId(component, event, consultantId, true);    
                }else{
                    this.getMAConsultants(component, event);    
                }
                
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
            
        });
        $A.enqueueAction(action);
    },
    
    updatePrimaryId : function(component, event, consultantId, primaryChecked){
        component.set('v.isSpinnertoLoad', true);
        
        var oldPrimaryConsId = component.get('v.primaryId');
        var checkAnyPrimary = component.get('v.accountConsultantsList');
        
        var action = component.get('c.updatePrimaryId');
        action.setParams({"maId" : component.get('v.recordId'), "consultantId" : consultantId, "clearPrimaryFields" : primaryChecked, "operation" : "helper"});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(response.getState() === "SUCCESS"){
                this.getMAConsultants(component, event);
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
            //component.set('v.isSpinnertoLoad', false);
        });
        $A.enqueueAction(action);
    },
    
    sortAcc : function(component, event, page, sortOnField, fieldSortOrder, orderToBeSorted){
        component.set('v.isSpinnertoLoad', true);
        
        setTimeout(function(){
            component.set('v.isSpinnertoLoad', false);
        }, 500);
        
        if(sortOnField == 'Account'){
            var key2 = 'Name';
            
            if((orderToBeSorted != undefined) || (orderToBeSorted != null)){
                if(orderToBeSorted === "DESC"){
                    this.getSortedListHelper(component, event, 'Account', 'Name');
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    this.getSortedListHelper(component, event, 'Account', 'Name', true);
                    component.set('v.'+fieldSortOrder, true);
                }
            }else{
                if(component.get('v.'+fieldSortOrder)){
                    this.getSortedListHelper(component, event, 'Account', 'Name');
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    this.getSortedListHelper(component, event, 'Account', 'Name', true);
                    component.set('v.'+fieldSortOrder, true);
                }
            }
        }else{
            if((orderToBeSorted != undefined) || (orderToBeSorted != null)){
                if(orderToBeSorted === "DESC"){
                    this.getSortedListHelper(component, event, sortOnField, '');
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    this.getSortedListHelper(component, event, sortOnField, '', true);
                    component.set('v.'+fieldSortOrder, true);
                }
            }else{
                if(component.get('v.'+fieldSortOrder)){
                    this.getSortedListHelper(component, event, sortOnField, '');
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    this.getSortedListHelper(component, event, sortOnField, '', true);
                    component.set('v.'+fieldSortOrder, true);
                }
            }
        }
    },
    
    getSortedListHelper : function(component, event, prop, key, reverse){
        
        var sortOrder = 1;
        if(reverse)sortOrder = -1;
        
        var sortAsc = reverse;
        var sortField = key;
        var records = component.get('v.maConsultantList');
        if(key === ''){
            records.sort(function(a,b){
                var t1 = a[prop] == b[prop],
                    t2 = a[prop] > b[prop];
                return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
            }); 
        }else{
            records.sort(function(a,b){
                var t1 = a[prop][key] == b[prop][key],
                    t2 = a[prop][key] > b[prop][key];
                return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
            });
        }
        
        component.set('v.maConsultantList', records);
    },
    
    revertTheClassForColumn : function(component){
        var editTH = component.find('editTH');
        $A.util.removeClass(editTH,'widthForFirstCol');
        $A.util.addClass(editTH,'slds-cell-shrink');  
    },
    
    desktopModal : function(component, event, header, cmp, accountId) {
        debugger;
        var contactRecordType = component.get('v.contactRecordTypeId');
        var childData = null;
        
        if(component.get('v.isFromQA')){
            
            var existingIds = [];
            var existingConIds = component.get('v.maConsultantList');
            for(var i = 0; i<existingConIds.length; i++){
                existingIds.push(existingConIds[i].Id);
            }
         //   alert('hello '+component.get('v.OpportunityDataChildComp'));
            childData = {'contactRecordType' : contactRecordType, 'maRecordId' : component.get('v.accountId'), 'isFromQA' : component.get('v.isFromQA'), 'existingConIds' : existingIds ,'opportunityData' : component.get('v.OpportunityDataChildComp')};
        }else{
            childData = {'contactRecordType' : contactRecordType, 'maRecordId' : component.get('v.recordId'), 'isFromQA' : component.get('v.isFromQA'),'opportunityData' : component.get('v.OpportunityDataChildComp')};
        }
        
        $A.createComponents([["c:Modal_Component",{attribute:true, 'ModalBodyData':childData, 'Modalheader':header,'ModalBody':cmp}]],
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
    
    panelModal : function(component, event,header,cmp, accountId) {
        
        component.set("v.scrollStyleForDevice","");
        
        var contactRecordType = component.get('v.contactRecordTypeId');
        var childData = {'contactRecordType' : contactRecordType, 'maRecordId' : component.get('v.recordId')};
        
        $A.createComponents([["c:Panel_Component",{attribute:true, 'ModalBodyData':childData,'Modalheader':header,'ModalBody':cmp}]],
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
    
    modalClosing : function(component, event) {
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        }else{
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []); 
            $A.util.removeClass(component.find("sortEdit"),"hide");
        }
    },
    
})