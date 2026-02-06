({
    doInit : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    helper.getaccountCategoryType(component, event);
                    helper.getLoggedInUserRole(component, event, helper);
                }            
            }, 500);           
        }else{
            component.set('v.isSpinnertoLoad', true);
            helper.getLoggedInUserRole(component, event, helper);
            helper.getaccountCategoryType(component, event);
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
    
    setGeneralValues: function(component, event, helper){			
        if(component.get('v.isGenericEventTriggered')) return;
        component.set('v.isSpinnertoLoad', true);
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                //if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['AccountConsultants'] != null){
					if(generalObj.HasEditAccess != null){     
                    component.set('v.isLoggedInUserValid',generalObj.HasEditAccess);
                    //console.log('accountType '+generalObj.accountType);
                    //console.log('contactTypeIdforAccConsultant  '+generalObj.contactTypeIdforAccConsultant );
                    //console.log('pageSize-->>'+generalObj.pageSize);
                    
                    var pageSize = generalObj.pageSize;
                	component.set('v.pageSize', pageSize);
                    
                    if(generalObj.contactTypeIdforAccConsultant != null){
                        component.set('v.contactRecordTypeId', generalObj.contactTypeIdforAccConsultant); 
                    }
                    var accountType = generalObj.accountType;
                    if(accountType != null){
                        if(accountType == 'Client Management'){
                            component.set('v.cmAccountType',true);
                            component.set('v.accountTypeCommonValues',{'colSpan':5,'AppletName':$A.get("$Label.c.Account_Consultants")});
                            component.set('v.isSpinnertoLoad', false);
                        }
                        
                        else if(accountType == 'Client Development' || accountType == 'Aggregator'){
                            component.set('v.cdAccountType',true);
                            component.set('v.accountTypeCommonValues',{'colSpan':7,'AppletName':$A.get("$Label.c.Consultants_Applet_Heading")});
                            component.set('v.isSpinnertoLoad', false);
                        }
                    }
                    
                }else{
                    helper.getaccountCategoryType(component, event);
                    helper.getLoggedInUserRole(component, event, helper);
                }
            }else{
                helper.getaccountCategoryType(component, event);
                helper.getLoggedInUserRole(component, event, helper);
            }  
        }else{            
            helper.getaccountCategoryType(component, event);
            helper.getLoggedInUserRole(component, event, helper);
        }              
    },	
    
    accountConsultant : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        
        if(device == "DESKTOP"){
            helper.desktopModal(component, event, 'Search for Consultant/Consulting Firm', 'Account_consultant_Search_Consultant','');
        }else{
            $A.util.addClass(component.find("sortEdit"),"hide");
            helper.panelModal(component, event, 'Search for Consultant/Consulting Firm', 'Account_consultant_Search_Consultant', '');  
        }
        
        event.stopPropagation();
    },
    
    expandCollapse: function(component, event, helper) {
        console.log('expnad');
         if(!component.get('v.isDesktop')){
            return;
        }
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        //alert(JSON.stringify(component.set('v.displayListConsultant')));
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            helper.getConsultantsData(component, event); 
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
        }
    },
    
    confirmDelete: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.addClass(component.find("sortEdit"),"hide");
                }
        var deleteAcc = component.find('AccountConsultant');
        var consultingFirm = component.get('v.consultingFirm');
        var recordId =  component.get('v.accConsulatantIndex');
        if(consultingFirm){
            for(var i in deleteAcc){
                $A.util.removeClass(deleteAcc[i], 'slds-show');
                $A.util.addClass(deleteAcc[i], 'slds-hide');
            }
            helper.deleteRelation(component, event, recordId);
        }else{
            for(var i in deleteAcc){
                $A.util.removeClass(deleteAcc[i], 'slds-show');
                $A.util.addClass(deleteAcc[i], 'slds-hide');
            }
            helper.deleteRelation(component, event, recordId);
        }
    },
    
    confirmCancel: function(component, event, helper) {
        var tableName = '';
        if(component.get('v.cdAccountType')){
            tableName = 'CDAccount_Consultants';
        }else if(component.get('v.cmAccountType')){
            tableName = 'AccountConsultants_Table';
        }
        
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
        var deleteAcc = component.find('DuplicateCFError');
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
    
    addSelectedConsultantComponent : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");      
                    $A.util.addClass(component.find("sortEdit"),"hide");
                }   
        var contactId = event.getParams('contactId');
        component.set('v.isPrimaryExists', contactId.primaryConsultantExists);
        var recordNotExistsCheck = component.get('v.isPrimaryExists');
        helper.relateRecords(component, event, contactId.contactId, recordNotExistsCheck);
        var myLabel = component.find('utilityToggle').get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            var cmpTarget = component.find('account_Consultant');
            $A.util.addClass(cmpTarget,'slds-is-open');
            component.find('utilityToggle').set("v.iconName","utility:chevrondown");
        }
    },
    
    addSelectedComsultantingFirmComponent : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");      
                    $A.util.addClass(component.find("sortEdit"),"hide");
                }   
        
        var accountId = event.getParams('accountId');
        
        helper.relateAccounts(component, event, accountId.accountId);
        
        var myLabel = component.find('utilityToggle').get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            var cmpTarget = component.find('account_Consultant');
            $A.util.addClass(cmpTarget,'slds-is-open');
            component.find('utilityToggle').set("v.iconName","utility:chevrondown");
        }
    },
    
    removeRecordsandFindPopUp: function(component, event, helper) {
        var recordId = event.getParam('accConsulatantIndex');
        
        var consultingFirm = event.getParam('consultingFirm');
        component.set('v.accConsulatantIndex', recordId);
        component.set('v.consultingFirm', consultingFirm);
        var removeVal = event.getParam('Remove');
        var findVal = event.getParam('Find');
        
        if(findVal){
            var device = $A.get("$Browser.formFactor");
            if(device == "DESKTOP"){
                helper.desktopModal(component, event,'Search for a Consultant','Account_Consultant_Find_Modal', recordId); 
            }else{
            	$A.util.addClass(component.find("sortEdit"),"hide");
                helper.panelModal(component, event,'Search for a Consultant','Account_Consultant_Find_Modal', recordId);   
            }
        }else{
            if(consultingFirm){
                var deleteAcc = component.find('AccountConsultant');
                for(var i in deleteAcc){
                    $A.util.removeClass(deleteAcc[i], 'slds-hide');
                    $A.util.addClass(deleteAcc[i], 'slds-show');
                }
            }else{
                var deleteAcc = component.find('AccountConsultant');
                for(var i in deleteAcc){
                    $A.util.removeClass(deleteAcc[i], 'slds-hide');
                    $A.util.addClass(deleteAcc[i], 'slds-show');
                }
            } 
        }  
    },
    
    SelectedSearchModal: function(component, event, helper) {
        var accountConsultantSelectSearch = event.getParam('SelectSearch');
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            helper.modalClosing(component, event);
            if(accountConsultantSelectSearch == 'Consulting Firm'){
                helper.desktopModal(component, event,'Search for Consultant/Consulting Firm','Account_Consultant_Search_Consultants_Firm');                
            }else{
                helper.desktopModal(component, event,'Search for Consultant/Consulting Firm','Account_consultant_Search_Consultant');
            }
        }else{
            helper.modalClosing(component, event);
            if(accountConsultantSelectSearch == 'Consulting Firm'){
                helper.panelModal(component, event,'Search for Consultant/Consulting Firm','Account_Consultant_Search_Consultants_Firm');                
            }else{
                helper.panelModal(component, event,'Search for Consultant/Consulting Firm','Account_consultant_Search_Consultant');
            }
        }
    },
    
    addSelectedConsultingFindData: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");      
            $A.util.addClass(component.find("sortEdit"),"hide");
        }   
        var consultantId = event.getParam('consultantId');
        helper.relateRecords(component, event, consultantId);
        var primaryConsultantId = component.get('v.primaryId');
        if(primaryConsultantId == null || primaryConsultantId == undefined){
            helper.updatePrimaryId(component, event, consultantId);
        } 
        else{
            helper.getConsultantsData(component, event);     
        }
    },
    
    updatePrimaryConsultantData : function(component, event, helper){
         
        var tableName = '';
        if(component.get('v.cdAccountType')){
            tableName = 'CDAccount_Consultants';
        }else if(component.get('v.cmAccountType')){
            tableName = 'AccountConsultants_Table';
        }
        var checkingEdit = event.getParam('checkingEdit');
        var checkingCancel = event.getParam('checkingCancel');
        var indexForEdit = event.getParam('index');
        var CDAccount_Consultants = component.find(tableName);
        
        if(checkingEdit){
            
            if(CDAccount_Consultants != null && CDAccount_Consultants != undefined) {
                if(Array.isArray(CDAccount_Consultants)) {
                    for(var i = 0; i < CDAccount_Consultants.length; i++) {
                        if(i != indexForEdit){
                            CDAccount_Consultants[i].remvEditCancel();
                        }
                        if(component.get('v.isPrimaryAccountExists')){
                            if(i == 0){
                                if(component.get('v.checkPreviousEnabled')){
                                    CDAccount_Consultants[i].remvEditCancel(false,true,false);
                                }else{
                                    CDAccount_Consultants[i].remvEditCancel(true,true,false);
                                }
                                
                            }else{
                                CDAccount_Consultants[i].remvEditCancel(false,true,false);
                            }    
                        }else{
                            CDAccount_Consultants[i].remvEditCancel(false,true,false);
                        }
                    } 
                }
                
                else {
                    
                    if(component.get('v.isPrimaryAccountExists') == true){
                        
                        CDAccount_Consultants.remvEditCancel(true,true,false);
                        
                    }else{
                        CDAccount_Consultants.remvEditCancel(false,true,false);
                    }
                    
                }
            } 
            
        }else if(checkingCancel){
            
            if(CDAccount_Consultants != null && CDAccount_Consultants != undefined) {
                if(Array.isArray(CDAccount_Consultants)) {
                    for(var i = 0; i < CDAccount_Consultants.length; i++){
                        if(component.get('v.isPrimaryAccountExists')){
                            if(i == 0){
                                if(component.get('v.checkPreviousEnabled')){
                                    CDAccount_Consultants[i].remvEditCancel(false,true,false);
                                }else{
                                    CDAccount_Consultants[i].remvEditCancel(true,true,false);
                                }
                            }else{
                                CDAccount_Consultants[i].remvEditCancel(false,false,true);
                            }    
                        }else{
                            CDAccount_Consultants[i].remvEditCancel(false,false,true);
                        }
                        
                    }
                }
                
                else {
                    
                    if(component.get('v.isPrimaryAccountExists') == true){
                        
                        CDAccount_Consultants.remvEditCancel(true,false,true);
                        
                    }else{
                        CDAccount_Consultants.remvEditCancel(false,false,true);
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
                var consultantId = event.getParams('consultantId');
                var oldPrimaryConsultantId = component.get('v.primaryId');
                
                helper.updatePrimaryId(component, event, consultantId.consultantId, consultantId.primaryCheck);        
            }
    },
    
    cancelPrimaryConsultantData : function(component, event, helper){
        helper.getConsultantsData(component, event); 
    },
    
    //Sorting Table Columns functions
    sortByLastName : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldSortOrder = 'sortLastNameAsc';
        
        helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder);
    },
    
    sortByFirstName : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldSortOrder = 'sortFirstNameAsc';
        
        helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder);
    },
    
    sortByMailingCountry : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldSortOrder = 'sortMailingCityAsc';
        
        helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder);
    },
    
    sortByAccountPrimary : function(component, event, helper) {
        
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldSortOrder = 'sortFirmPrimaryAsc';
        
        helper.sortByPrimaryId(component, event, helper, fieldNameToBeSorted, fieldSortOrder);
    },
    
    sortByCFName : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldSortOrder = 'sortCFNameAsc';
        
        helper.sortByCFName(component, event, helper, fieldNameToBeSorted, fieldSortOrder);
    },
    
    sortByJobTitle : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldSortOrder = 'sortJobTitleAsc';
        
        helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder);
    },
    
    sortByConsultantTier : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldSortOrder = 'sortConsultantTierAsc';
        
        helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder);
    },
    
    //Custom pagination functions
    goNext : function(component, event, helper) {
        var pageNumber = component.get('v.page');
        var pageSize = component.get('v.pageSize');
        var total = component.get('v.total');
        
        pageNumber = pageNumber+1;
        if(pageNumber > 1){
            component.set('v.checkPreviousEnabled',true);
        }else if(pageNumber == 1){
            component.set('v.checkPreviousEnabled',false);
        }
        component.set('v.page', pageNumber);
        
        var fromIndex = ((pageSize*pageNumber)-pageSize);
        var toIndex = fromIndex+pageSize;
        
        if(toIndex > total){
            toIndex = total;
        }
        
        var masterList = component.get('v.accountConsultant');
        var displayList = [];
        
        for(var i = fromIndex; i< toIndex; i++){
            displayList.push(masterList[i]);
        }
        component.set('v.displayListConsultant', displayList);
        
    },
    
    goPrevious : function(component, event, helper) {
        var pageNumber = component.get('v.page');
        var pageSize = component.get('v.pageSize');
        
        pageNumber = pageNumber-1;
        component.set('v.page', pageNumber);
        
        if(pageNumber == 1){
            component.set('v.checkPreviousEnabled',false);
        }
        
        var fromIndex = ((pageSize*pageNumber)-pageSize);
        var toIndex = fromIndex+pageSize;
        
        var masterList = component.get('v.accountConsultant');
        var displayList = [];
        
        for(var i = fromIndex; i< toIndex; i++){
            displayList.push(masterList[i]);
        }
        component.set('v.displayListConsultant', displayList);
        
    },
    
    //Modal/ Popup closing functions
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
        
        var fieldsToSort = [];
        
        if(component.get('v.cmAccountType')){
            fieldsToSort = [{"fieldName":"Primary__c","fieldDisplayName":"Company Primary","fieldOrder":component.get("v.sortFirmPrimaryAsc")},
                            {"fieldName":"LastName","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"FirstName","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"Name","fieldDisplayName":"Consulting Firm","fieldOrder":component.get("v.sortCFNameAsc")}];  
        }else{
            fieldsToSort = [{"fieldName":"Primary__c","fieldDisplayName":"Company Primary","fieldOrder":component.get("v.sortFirmPrimaryAsc")},
                            {"fieldName":"LastName","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"FirstName","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"Title","fieldDisplayName":"Job Title","fieldOrder":component.get("v.sortJobTitleAsc")},
                            {"fieldName":"ConsultantTier__c","fieldDisplayName":"Consultant Tier","fieldOrder":component.get("v.sortConsultantTierAsc")},
                            {"fieldName":"Name","fieldDisplayName":"Consulting Firm","fieldOrder":component.get("v.sortCFNameAsc")}];        
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
        
        if(!event.getParam('isApply')){
            var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.removeClass(component.find("sortEdit"),"hide");
                }  
        }
        else if(event.getParam('isApply')){
            var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
            component.set("v.lastSortField",fieldNameToBeSorted);
            var orderToBeSorted = event.getParam('orderToBeSorted');
            component.set('v.isSpinnertoLoad', true);
            
            if(fieldNameToBeSorted == 'Primary__c'){
        	var fieldSortOrder = 'sortFirmPrimaryAsc';
        
        	helper.sortByPrimaryId(component, event, helper, fieldNameToBeSorted, fieldSortOrder, orderToBeSorted);
        }
        
        else if(fieldNameToBeSorted == 'LastName'){
        	var fieldSortOrder = 'sortLastNameAsc';
        
        	helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder, orderToBeSorted);    
        }
        
        else if(fieldNameToBeSorted == 'FirstName'){
        	var fieldSortOrder = 'sortFirstNameAsc';
        
        	helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder, orderToBeSorted);    
        }
        
        else if(fieldNameToBeSorted == 'Title'){
        	var fieldSortOrder = 'sortJobTitleAsc';
        
        	helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder, orderToBeSorted);    
        }
        
        else if(fieldNameToBeSorted == 'ConsultantTier__c'){
        	var fieldSortOrder = 'sortConsultantTierAsc';
        
        	helper.sortBy(component, event, helper, fieldNameToBeSorted, fieldSortOrder, orderToBeSorted);    
        }

        else if(fieldNameToBeSorted == 'Name'){
             var fieldSortOrder = 'sortCFNameAsc';
                
             helper.sortByCFName(component, event, helper, fieldNameToBeSorted, fieldSortOrder, orderToBeSorted);
        }

        //setTimeout(function(){ component.set('v.isSpinnertoLoad', false); }, 1000);
        }
        
        
    }
    
})