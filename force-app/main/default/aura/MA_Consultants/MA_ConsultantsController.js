({
    doInit : function(component, event, helper) {
        
        var isQA = component.get('v.isFromQA');
        isQA = (isQA != null && isQA !=undefined) ? isQA : false;
        component.set('v.isFromQA', isQA);
        if(isQA == false) {
            var device = $A.get("$Browser.formFactor");
            if(device == "DESKTOP"){
                component.set('v.isDesktop',true);
                helper.getLoggedInUserRole(component, event, helper);
                helper.getMAConsultants(component, event);
            }else{
                component.set('v.isSpinnertoLoad', true);
                helper.getLoggedInUserRole(component, event, helper);
            }
        }
    },
    
    openConsultantsPopup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        
        if(device == "DESKTOP"){
            helper.desktopModal(component, event, 'Search for Consultant', 'MA_Consultants_Modal_Popup','');
        }else{
            $A.util.addClass(component.find("sortEdit"),"hide");
            helper.panelModal(component, event, 'Search for Consultant', 'MA_Consultants_Modal_Popup', '');  
        }
        
        event.stopPropagation();
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
            helper.getMAConsultants(component, event); 
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
        }
    },
    
    saveConsultants : function(component, event, helper){
        var records = component.get('v.maConsultantList');
        records.sort(function(a,b){
            var t1 = a['IsPrimary'] == b['IsPrimary'],
                t2 = a['IsPrimary'] > b['IsPrimary'];
            return t1? 0: (false?-1:1)*(t2?-1:1);
        }); 
        //component.set('v.maConsultantList', records);
        
        var updatedContactIds = [];
        for(var j = 0; j<records.length; j++){
            updatedContactIds.push(records[j].Id);
        }
        console.log('updatedContactIds--'+updatedContactIds);
    },
    
    addSelectedConsultant : function(component, event, helper){
        //helper.modalClosing(component);
        
        if(event.getParam('clicked')){
            helper.modalClosing(component);
            var device = $A.get("$Browser.formFactor");
            
            if(device != "DESKTOP"){ 
                $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");      
                $A.util.addClass(component.find("sortEdit"),"hide");
            }   
            
            var MAConsultantList = component.get('v.maConsultantList');
            if(MAConsultantList.length > 0){
                component.set('v.maConsultantList', MAConsultantList);
            }else{
                component.set('v.isMAConsultantListEmpty', true);
            }
        }else{
            var selectedConsultantList = null;
            var isAllContact = event.getParam('isAllContactList');
            var selectedConsultantList = event.getParam('selectedContactIdList'); 
            component.set('v.finalConsultantIds', selectedConsultantList);
            component.set('v.isAllContacts', isAllContact);
            if(component.get('v.isFromQA')){
                
                component.set('v.isSpinnertoLoad', true);
                
                setTimeout(function(){
                    component.set('v.isSpinnertoLoad', false);
                }, 500);
                
                var selectedConsultantArray = event.getParam('consultantsArrayForQA');
                if(selectedConsultantArray.length > 0){
                    var finalArray = component.get('v.maConsultantList').concat(selectedConsultantArray);
                    component.set('v.maConsultantList', []);
                    finalArray.sort(function(a,b){
                        var t1 = a['IsPrimary'] == b['IsPrimary'],
                            t2 = a['IsPrimary'] > b['IsPrimary'];
                        return t1? 0: (false?-1:1)*(t2?-1:1);
                    }); 
                    
                    var isPrimaryExists = false;
                    if(finalArray[0].IsPrimary == true){
                        isPrimaryExists = true;
                    }
                    
                    var list1 = [];
                    var list2 = [];
                    for(var j = 0; j<finalArray.length; j++){
                        if(j == 0){
                            if(isPrimaryExists){
                                list1.push(finalArray[j]);    
                            }else{
                                list2.push(finalArray[j]);
                            }
                        }else{
                            list2.push(finalArray[j]);   
                        }
                    }
                    
                    list2.sort(function(a,b){
                        var t1 = a['LastName'] == b['LastName'],
                            t2 = a['LastName'] > b['LastName'];
                        return t1? 0: (true?-1:1)*(t2?-1:1);
                    });
                    
                    var finalList = list1.concat(list2);
                    
                    component.set('v.maConsultantList', finalList);
                    component.set('v.isMAConsultantListEmpty', false);
                }else{
                    component.set('v.isMAConsultantListEmpty', true);
                }
                
                helper.modalClosing(component);
            }else{
                helper.addConsultants(component, event, selectedConsultantList, isAllContact);
            }
            
            
        }
    },
    
    removeConsultant : function(component, event, helper) {
        var recordId = event.getParam('consultantId');
        
        component.set('v.maConsulatantIndex', recordId);
        
        if(component.get('v.isFromQA')){
            var records = component.get('v.maConsultantList');
            for(var i = 0; i<records.length; i++){
                if(records[i].Id === recordId){
                    if(records[i].IsPrimary == true){
                        component.set('v.deletePrimary', true);
                    }else{
                        component.set('v.deletePrimary', false);
                    }
                }
            }
        }else{
            if(component.get('v.primaryId') === recordId){
                component.set('v.deletePrimary', true);
            }else{
                component.set('v.deletePrimary', false);
            }   
        }
        
        var deleteAcc = component.find('AccountConsultant');
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },
    
    updatePrimaryConsultant : function(component, event, helper){
        
        if(component.get('v.isFromQA')){
            component.set('v.isSpinnertoLoad', true);
            
            setTimeout(function(){
                component.set('v.isSpinnertoLoad', false);
            }, 200);
            var selectedIdForQA = event.getParam('selectedIdForQA');
            var records = component.get('v.maConsultantList');
            for(var i = 0; i<records.length; i++){
                if(records[i].Id != selectedIdForQA){
                    records[i].IsPrimary = false;
                }else{
                    records[i].IsPrimary = true;
                }
            }
            records.sort(function(a,b){
                var t1 = a['IsPrimary'] == b['IsPrimary'],
                    t2 = a['IsPrimary'] > b['IsPrimary'];
                return t1? 0: (false?-1:1)*(t2?-1:1);
            }); 
            var list1 = [];
            var list2 = [];
            for(var j = 0; j<records.length; j++){
                if(j == 0){
                    list1.push(records[j]);    
                    
                }else{
                    list2.push(records[j]);   
                }
            }
            
            list2.sort(function(a,b){
                var t1 = a['LastName'] == b['LastName'],
                    t2 = a['LastName'] > b['LastName'];
                return t1? 0: (true?-1:1)*(t2?-1:1);
            });
            
            var finalList = list1.concat(list2);
            component.set('v.maConsultantList', finalList);
            
        }else{
            if(event.getParam('sameRecordSave')){
                helper.revertTheClassForColumn(component);
            }else{
                
                var tableName = 'MA_Consultants_Table';
                
                if(event.getParam('removeClass')){
                    var editTH = component.find('editTH');
                    $A.util.removeClass(editTH,'slds-cell-shrink');
                    $A.util.addClass(editTH,'widthForFirstCol');
                }
                else{
                    var editTH = component.find('editTH');
                    $A.util.removeClass(editTH,'widthForFirstCol');
                    $A.util.addClass(editTH,'slds-cell-shrink');
                }
                
                var checkingEdit = event.getParam('checkingEdit');
                var checkingCancel = event.getParam('checkingCancel');
                var indexForEdit = event.getParam('index');
                var MA_Consultants = component.find(tableName);
                
                if(checkingEdit){
                    
                    if(MA_Consultants != null && MA_Consultants != undefined) {
                        if(Array.isArray(MA_Consultants)) {
                            for(var i = 0; i < MA_Consultants.length; i++) {
                                if(i != indexForEdit){
                                    MA_Consultants[i].remvEditCancel();
                                }
                                if(component.get('v.isPrimaryAccountExists')){
                                    if(i == 0){
                                        if(component.get('v.checkPreviousEnabled')){
                                            MA_Consultants[i].remvEditCancel(false,true,false);
                                        }else{
                                            MA_Consultants[i].remvEditCancel(true,true,false);
                                        }
                                        
                                    }else{
                                        MA_Consultants[i].remvEditCancel(false,true,false);
                                    }    
                                }else{
                                    MA_Consultants[i].remvEditCancel(false,true,false);
                                }
                            } 
                        }
                        
                        else {
                            
                            if(component.get('v.isPrimaryAccountExists') == true){
                                
                                MA_Consultants.remvEditCancel(true,true,false);
                                
                            }else{
                                MA_Consultants.remvEditCancel(false,true,false);
                            }
                            
                        }
                    } 
                }
                else if(checkingCancel){
                    
                    if(MA_Consultants != null && MA_Consultants != undefined) {
                        if(Array.isArray(MA_Consultants)) {
                            for(var i = 0; i < MA_Consultants.length; i++){
                                if(component.get('v.isPrimaryAccountExists')){
                                    if(i == 0){
                                        if(component.get('v.checkPreviousEnabled')){
                                            MA_Consultants[i].remvEditCancel(false,true,false);
                                        }else{
                                            MA_Consultants[i].remvEditCancel(true,true,false);
                                        }
                                    }else{
                                        MA_Consultants[i].remvEditCancel(false,false,true);
                                    }    
                                }else{
                                    MA_Consultants[i].remvEditCancel(false,false,true);
                                }
                                
                            }
                        }
                        
                        else {
                            
                            if(component.get('v.isPrimaryAccountExists') == true){
                                
                                MA_Consultants.remvEditCancel(true,false,true);
                                
                            }else{
                                MA_Consultants.remvEditCancel(false,false,true);
                            }
                            
                        }
                    }
                    
                }
                    else{
                        var device = $A.get("$Browser.formFactor");
                        if(device != "DESKTOP"){ 
                            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");      
                            $A.util.addClass(component.find("sortEdit"),"hide");
                        }
                        var consultantId = event.getParam('consultantId');
                        var primaryChecked = event.getParam('primaryCheck');
                        
                        console.log('--->>'+consultantId+'---'+primaryChecked);
                        
                        helper.updatePrimaryId(component, event, consultantId, primaryChecked);        
                    }
            }
        }
    },
    
    sortFields : function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"IsPrimary" : "sortFirmPrimaryAsc", "Contact.LastName" : "sortLastNameAsc", "Contact.FirstName" : "sortFirstNameAsc", "Contact.Account.Name" : "sortCFNameAsc"}';
        
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = 1;
        
        if(component.get('v.isFromQA')){
            var mapForJSSort = '{"IsPrimary" : "IsPrimary", "Contact.LastName" : "LastName", "Contact.FirstName" : "FirstName", "Contact.Account.Name" : "Account"}';
            var sortFieldJS = JSON.parse(mapForJSSort);
            var sortJSField = sortFieldJS[fieldNameToBeSorted];
            
            helper.sortAcc(component, event, page, sortJSField, sortFieldCompName);
        }else{
            helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);   
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
        helper.getMAConsultants(component, event, page, component.get('v.sortField'),component.get('v.sortOrder'));
    },
    
    confirmDelete: function(component, event, helper) {
        
        component.set('v.isSpinnertoLoad', true);
        
        setTimeout(function(){
            component.set('v.isSpinnertoLoad', false);
        }, 800);
        
        var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.addClass(component.find("sortEdit"),"hide");
                }
        var deleteAcc = component.find('AccountConsultant');
        var recordId =  component.get('v.maConsulatantIndex');
        
        if(component.get('v.isFromQA')){
            var records = component.get('v.maConsultantList');
            var newRecordList = [];
            for(var i = 0; i<records.length; i++){
                if(records[i].Id != recordId){
                    newRecordList.push(records[i]);
                }
            }
            newRecordList.sort(function(a,b){
                var t1 = a['IsPrimary'] == b['IsPrimary'],
                    t2 = a['IsPrimary'] > b['IsPrimary'];
                return t1? 0: (false?-1:1)*(t2?-1:1);
            }); 
            component.set('v.maConsultantList', newRecordList);
            if(newRecordList == undefined || newRecordList == null || 
               		(newRecordList != undefined && newRecordList != null && newRecordList.length == 0)) {
            	component.set('v.isMAConsultantListEmpty', true); 
            }
        }else{
            helper.deleteRelation(component, event, recordId);
        }
        
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
    },
    
    confirmCancel: function(component, event, helper) {
        var tableName = 'MA_Consultants_Table';
        
        var childCmp = component.find(tableName);
            if(childCmp != null && childCmp != undefined) {
                if(Array.isArray(childCmp)) {
                    for(var j=0; j<childCmp.length; j++) {
                        childCmp[j].removeProcessingIcon();
                    } 
                } else {
                    childCmp.removeProcessingIcon();
                }
            }
        
        var deleteAcc = component.find('AccountConsultant');
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
    },
    
    confirmCancel1: function(component, event, helper) {
        var tableName = 'MA_Consultants_Table';
        
        var childCmp = component.find(tableName);
            if(childCmp != null && childCmp != undefined) {
                if(Array.isArray(childCmp)) {
                    for(var j=0; j<childCmp.length; j++) {
                        childCmp[j].removeProcessingIcon();
                    } 
                } else {
                    childCmp.removeProcessingIcon();
                }
            }
        
        var deleteAcc = component.find('OneConsultantDeleteError');
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
    },
    
    closeConsultantError: function(component, event, helper) {
        var deleteAcc = component.find('DuplicateConsultantError');
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
    },
    
    //Modal Popup closing functions
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalClosing(component);
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");      
            $A.util.removeClass(component.find("sortEdit"),"hide");
        }
    },
    
    openSortingPopup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        }  
        
        var fieldsToSort = [{"fieldName":"IsPrimary","fieldDisplayName":"Company Primary","fieldOrder":component.get("v.sortFirmPrimaryAsc")},
                            {"fieldName":"Contact.LastName","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"Contact.FirstName","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"Contact.Account.Name","fieldDisplayName":"Consulting Firm","fieldOrder":component.get("v.sortCFNameAsc")}];  
        
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
        if(!event.getParam('isApply')){
            var device = $A.get("$Browser.formFactor");
            if(device != "DESKTOP"){ 
                $A.util.removeClass(component.find("sortEdit"),"hide");
            }  
        }else if(event.getParam('isApply')){
            var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
            component.set("v.lastSortField",fieldNameToBeSorted);
            
            var orderToBeSorted = event.getParam('orderToBeSorted');
            var fieldItagsWithAuraAttrMap = '{"IsPrimary" : "sortFirmPrimaryAsc", "Contact.LastName" : "sortLastNameAsc", "Contact.FirstName" : "sortFirstNameAsc", "Contact.Account.Name" : "sortCFNameAsc"}';
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
                        //console.log('inside interval')
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
    },
    
})