({
    getLoggedInUserRole : function(component){
        var accountId = component.get('v.recordId');
        var action  = component.get('c.getLoggedInUserRoles');
        if(action == undefined || action == null){
            return;
        }
        action.setParams({"accountId" : accountId});
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
    
    getaccountCategoryType : function(component,event) {
        component.set('v.isSpinnertoLoad', true);
        var accountTypeAction = component.get('c.getAccountType');
        if(accountTypeAction == undefined || accountTypeAction == null){
            return;
        }
        accountTypeAction.setParams({
            "accountId" : component.get('v.recordId'),
        });
        accountTypeAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {    
                var accountCategoryType  = response.getReturnValue();
                
                var pageSize = accountCategoryType.pageSize;
                component.set('v.pageSize', pageSize);
                
                if(accountCategoryType.contactTypeId != null){
                    component.set('v.contactRecordTypeId', accountCategoryType.contactTypeId); 
                }
                
                if(accountCategoryType.accountType != null){
                    if(accountCategoryType.accountType == 'Client Management'){
                        component.set('v.cmAccountType',true);
                        component.set('v.accountTypeCommonValues',{'colSpan':5,'AppletName':$A.get("$Label.c.Account_Consultants")});
                        component.set('v.isSpinnertoLoad', false);
                    }
                    
                    else if(accountCategoryType.accountType == 'Client Development' || accountCategoryType.accountType == 'Aggregator'){
                        component.set('v.accountTypeCommonValues',{'colSpan':7,'AppletName':$A.get("$Label.c.Consultants_Applet_Heading")});
                        component.set('v.cdAccountType',true); 
                        component.set('v.isSpinnertoLoad', false);
                    }
                }
                var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                	this.getConsultantsData(component, event);
                }
            }
            else if (state === "INCOMPLETE") {
			component.set('v.isSpinnertoLoad', false);                
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
            component.set('v.isSpinnertoLoad', false);
        });        
        $A.enqueueAction(accountTypeAction);
    },
    
    getConsultantsData : function(component, event, page, fieldNameToBeSorted, sortVal){
        
        component.set('v.isSpinnertoLoad', true);
        
        //component.set('v.displayListConsultant', []);
        var primaryConsultantId = '';
        component.set('v.primaryId', primaryConsultantId); 
        var accountId = component.get('v.recordId');
        var contactRecordType = component.get('v.contactRecordTypeId');
        var actionToGetConsultants = component.get('c.getAllConsultants');
        actionToGetConsultants.setParams({"accountId" : accountId, "contactRecordType" : contactRecordType});
        
        actionToGetConsultants.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                
                //alert(JSON.stringify(response.getReturnValue()));
                
                var listRecords = response.getReturnValue();
                
                component.set("v.accountConsultant",listRecords);
                component.set("v.accountConsultantsList",listRecords);
                
                for(var i = 0; i < listRecords.length; i++){
                    if(listRecords[i].Primary__c == true){
                        primaryConsultantId = listRecords[i].ContactId;
                        component.set('v.primaryId', primaryConsultantId); 
                    }
                }
                
                if(component.get('v.primaryId') != ''){
                    component.set('v.isPrimaryAccountExists', true); 
                }else{
                    component.set('v.isPrimaryAccountExists', false); 
                }
                
                this.getCFAccountData(component, listRecords, accountId);
                
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
        
        $A.enqueueAction(actionToGetConsultants);
        
    },
    
    getCFAccountData : function(component, listRecords, accountId){
        
        var consultantsList = component.get("v.accountConsultant");
        var accIds = [];
        if(consultantsList.length > 0){
            for(var i = 0; i < consultantsList.length; i++){
                var accId = consultantsList[i].Contact.Account.Id;
                accIds.push(accId);
            }
        }
        
        
        var actionToGetCFs = component.get('c.getPartnerAccounts');
        actionToGetCFs.setParams({"accountId" : accountId});
        
        actionToGetCFs.setCallback(this, function(response){
            
            var state = response.getState();
            
            if(state === "SUCCESS"){
                
                var resp = response.getReturnValue();
                var r1 = resp;
                var r2 = [];
                var responseAll = [];
                
                for(var i = 0; i<resp.length; i++){
                    if(accIds.indexOf(resp[i].Id) < 0){
                        r2.push(resp[i]);
                    }
                }
                
                if(r2.length > 0){
                    for(var ii = 0 ; ii < r2.length; ii++){
                        var cfData = {};
                        
                        cfData["Id"] = '';
                        cfData["Primary__c"] = false;
                        cfData["Contact"] = {};
                        var cf1 = cfData.Contact;
                        cf1["Id"] = '';
                        cf1["FirstName"] = 'Unassigned';
                        cf1["LastName"] = 'Unassigned';
                        cf1["MailingCity"] = 'Unassigned';
                        cf1["ConsultantTier__c"] = 'Unassigned';
                        cf1["Title"] = 'Unassigned';
                        cf1["Account"] = {};
                        var cf2 = cf1.Account;
                        cf2["Name"] = r2[ii].Name;
                        cf2["Id"] = r2[ii].Id;
                        
                        responseAll.push(cfData);
                    }  
                }
                
                
                if(listRecords.length != 0 && responseAll.length != 0){
                    
                    var entireList = listRecords.concat(responseAll);
                    var list1 = [];
                    var list2 = [];
                    
                    for(var i = 0; i < entireList.length; i++){
                        if(i == 0){
                            list1.push(entireList[i]);
                        }else{
                            list2.push(entireList[i]);
                        }
                    }
                    
                    //alert('list1 -- >>'+JSON.stringify(list1));
                    //alert('list2 -- >>'+JSON.stringify(list2));
                    
                    //For sorting the consultants data //true for asc order
                    list2.sort(function(a,b){
                        var t1 = a['Contact']['LastName'] == b['Contact']['LastName'],
                            t2 = a['Contact']['LastName'] > b['Contact']['LastName'];
                        return t1? 0: (true?-1:1)*(t2?-1:1);
                    });
                    
                    //alert('list2 -- after--->>'+JSON.stringify(list2));
                    
                    component.set('v.accountConsultant', list1.concat(list2));
                }
                if(listRecords.length == 0){
                    component.set('v.accountConsultant', responseAll);
                }
                if(responseAll.length == 0){
                    component.set('v.accountConsultant', listRecords);
                }
                
                
                
                if(component.get('v.accountConsultant').length == 0){
                    component.set('v.isAccountConsultantListEmpty', true);
                }
                else{
                    component.set('v.isAccountConsultantListEmpty', false);
                }
                
                var masterList = component.get('v.accountConsultant');     
                var pageSize = component.get('v.pageSize');
                
                component.set('v.page', 1);
                component.set('v.total', masterList.length);
                component.set('v.pages', Math.ceil(masterList.length/pageSize));
                
                var displayList = [];
                
                if(masterList.length > pageSize){
                    for(var i = 0; i< pageSize; i++){
                        displayList.push(masterList[i]);
                    }   
                    component.set('v.displayListConsultant', displayList);
                }
                
                else{
                    component.set('v.displayListConsultant', masterList);
                }
                
                if(component.get('v.accountConsultant').length > pageSize){
                    component.set('v.paginationRequired', true);
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
        
        $A.enqueueAction(actionToGetCFs);
        
    },
    
    relateRecords : function(component, event, contactId, recordNotExistsCheck) {
        component.set('v.isSpinnertoLoad', true);
        
        var recordsList = component.get('v.accountConsultantsList');
        var accIds = [];
        var markPrimary = false;
        
        if(recordsList.length > 0){
            for(var i = 0; i < recordsList.length; i++){
                var accId = recordsList[i].Contact.Id;
                accIds.push(accId);
            }
        }
        
        
        if(recordNotExistsCheck){
            markPrimary = true;
        }
        else if(!recordNotExistsCheck && recordNotExistsCheck != undefined){
            markPrimary = false;
        }
            else if(accIds.length == 0){
                markPrimary = true;
            }
        
        if(accIds.indexOf(contactId) < 0){
            
            var device = $A.get("$Browser.formFactor");
            if(device == "DESKTOP"){
                this.modalClosing(component, event);
            }else{
                this.modalClosing(component, event);
            }
            
            var action = component.get('c.relateContactToAccount');
            var accountId = component.get('v.recordId');
            
            action.setParams({"accountId" : accountId, "contactId" : contactId , "markPrimary" : markPrimary});
            action.setCallback(this, function(response){
                var state = response.getState();
                
                if(state === "SUCCESS"){
                    //alert(accIds.length+'---'+accIds+'----'+accIds[0].length+'---'+accIds[0]);
                    //var primaryConsultantId = component.get('v.primaryId');
                    //if(accIds != [] && (primaryConsultantId == '')){
                    if(markPrimary == true){
                        this.updatePrimaryId(component, event, contactId, false);
                        //this.getConsultantsData();
                    } 
                    else if(markPrimary == false){
                        
                        this.getConsultantsData(component, event);    
                    }
                    
                    /*if(primaryConsultantId == null || primaryConsultantId == undefined){
                //this.updatePrimaryId(component, contactId);
                //this.getConsultantsData();
            } */
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
                
                // component.set('v.isSpinnertoLoad', false);
            });
            $A.enqueueAction(action);	
        }
        else{
            var deleteAcc = component.find('DuplicateConsultantError');
            for(var i in deleteAcc){
                $A.util.removeClass(deleteAcc[i], 'slds-hide');
                $A.util.addClass(deleteAcc[i], 'slds-show');
            }
        }
    },
    
    relateAccounts : function(component, event, accToId){
        
        var recordsList = component.get('v.accountConsultant');
        var accIds = [];
        if(recordsList.length > 0){
            for(var i = 0; i < recordsList.length; i++){
                var accId = recordsList[i].Contact.Account.Id;
                accIds.push(accId);
            }
        }
        
        
        if(accIds.indexOf(accToId) < 0){
            
            var device = $A.get("$Browser.formFactor");
            if(device == "DESKTOP"){
                this.modalClosing(component, event);
            }else{
                this.modalClosing(component, event);
            }
            
            component.set('v.isSpinnertoLoad', true);
            var action = component.get('c.relateAccountToAccount');
            var accFromId = component.get('v.recordId');
            
            action.setParams({"accFromId" : accFromId, "accToId" : accToId, "operation" : "helper"});
            action.setCallback(this, function(response){
                var state = response.getState();
                //component.set('v.isSpinnertoLoad', false);
                
                if(response.getState() === "SUCCESS"){
                    this.getConsultantsData(component, event);
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
        }else{
            //alert('Already added');
            //component.set('v.isSpinnertoLoad', false);
            var deleteAcc = component.find('DuplicateCFError');
            for(var i in deleteAcc){
                $A.util.removeClass(deleteAcc[i], 'slds-hide');
                $A.util.addClass(deleteAcc[i], 'slds-show');
            }
        }
        
        
    },
    
    deleteRelation : function(component, event, recordId){
        
        component.set('v.isSpinnertoLoad', true);
        
        var action = component.get('c.deleteRelationship');
        
        var accountId = component.get('v.recordId');
        var primaryId = component.get('v.primaryId');
        
        action.setParams({"accountId" : accountId, "recordId" : recordId, "primaryId" : primaryId});
        action.setCallback(this, function(response){
            var state = response.getState();
            
            if(response.getState() === "SUCCESS"){
                
                this.getConsultantsData(component, event);
                
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
    
    markPrimaryRoleToAccount : function(component, consultantId){
        var accountId = component.get('v.recordId');
        
        var action = component.get('c.updatePrimaryId');
        action.setParams({"accountId" : accountId, "recordId" : consultantId, "clearPrimaryFields" : clearPrimaryFields});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(response.getState() === "SUCCESS"){
                this.getConsultantsData(component, event);
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            //component.set('v.isSpinnertoLoad', false);
        });
        $A.enqueueAction(action);
    },
    
    updatePrimaryId : function(component, event, recordIdToUpdate, markPrimary){
        component.set('v.isSpinnertoLoad', true);
        
        var checkAnyPrimary = component.get('v.accountConsultantsList');
        var clearPrimaryFields = markPrimary;
        /*var primaryRoleContactId = '';
        for(var i in checkAnyPrimary){
            if(checkAnyPrimary[i].Primary__c == true){
				primaryRoleContactId = checkAnyPrimary[i].ContactId;
                clearPrimaryFields = false;
            }
        }
        
        if(markPrimary == false){
            clearPrimaryFields = false;
        }*/
        //alert('clearPrimaryFields-->>'+clearPrimaryFields);
        
        var accountId = component.get('v.recordId');
        
        var action = component.get('c.updatePrimaryId');
        action.setParams({"accountId" : accountId, "recordId" : recordIdToUpdate, "clearPrimaryFields" : clearPrimaryFields, "operation" : "helper"});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(response.getState() === "SUCCESS"){
                this.getConsultantsData(component, event);
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
    
    sortByPrimaryId : function(component, event, helper, sortOnField, fieldSortOrder, orderToBeSorted){
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        }
        
        if((orderToBeSorted != undefined) || (orderToBeSorted != null)){
            if(orderToBeSorted === "DESC"){
                this.getSortedListHelper(component, event, '', '', sortOnField);
                component.set('v.'+fieldSortOrder, false);
            }else{
                this.getSortedListHelper(component, event, '', '', sortOnField, true);
                component.set('v.'+fieldSortOrder, true);
            }    
        }else{
            if(component.get('v.'+fieldSortOrder)){
                //this.keySrtPrimaryId(component, sortOnField);    
                this.getSortedListHelper(component, event, '', '', sortOnField);
                component.set('v.'+fieldSortOrder, false);
            }else{
                //this.keySrtPrimaryId(component, sortOnField, true);
                this.getSortedListHelper(component, event, '', '', sortOnField, true);
                component.set('v.'+fieldSortOrder, true);
            }   
        }
    },    
    
    keySrtPrimaryId : function (component, prop, reverse) {
        var sortOrder = 1;
        if(reverse)sortOrder = -1;
        
        var sortAsc = reverse;
        var sortField = prop;
        var records = component.get('v.accountConsultant');
        //sortAsc = key == sortField? !sortAsc: true;
        records.sort(function(a,b){
            var t1 = a[prop] == b[prop],
                t2 = a[prop] > b[prop];
            return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
        });
        
        //component.set('v.accountConsultant', records);
        //var masterList = component.get('v.accountConsultant');
        var pageSize = component.get('v.pageSize');
        
        component.set('v.page', 1);
        component.set('v.total', records.length);
        component.set('v.pages', Math.ceil(records.length/pageSize));
        
        var displayList = [];
        
        if(records.length > pageSize){
            for(var i = 0; i< pageSize; i++){
                displayList.push(records[i]);
            }   
            component.set('v.displayListConsultant', displayList);
        }else{
            component.set('v.displayListConsultant', records);
        }
    },
    
    sortByCFName : function(component, event, helper, sortOnField, fieldSortOrder, orderToBeSorted){
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        }
        
        if((orderToBeSorted != undefined) || (orderToBeSorted != null)){
            if(orderToBeSorted === "DESC"){
                this.getSortedListHelper(component, event, 'Contact', 'Account', sortOnField);
                component.set('v.'+fieldSortOrder, false);
            }else{
                this.getSortedListHelper(component, event, 'Contact', 'Account', sortOnField, true);
                component.set('v.'+fieldSortOrder, true);
            }    
        }else{
            if(component.get('v.'+fieldSortOrder)){
                //this.keysrtCFName(component, 'Contact', 'Account', sortOnField); 
                this.getSortedListHelper(component, event, 'Contact', 'Account', sortOnField);
                component.set('v.'+fieldSortOrder, false);
            }else{
                //this.keysrtCFName(component, 'Contact', 'Account', sortOnField, true);
                this.getSortedListHelper(component, event, 'Contact', 'Account', sortOnField, true);
                component.set('v.'+fieldSortOrder, true);
            }    
        }
    },
    
    keysrtCFName : function (component, prop, prop2, key, reverse) {
        var sortOrder = 1;
        if(reverse)sortOrder = -1;
        
        var sortAsc = reverse;
        var sortField = key;
        var records = component.get('v.accountConsultant');
        records.sort(function(a,b){
            var t1 = a[prop][prop2][key] == b[prop][prop2][key],
                t2 = a[prop][prop2][key] > b[prop][prop2][key];
            return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
        });
        
        //component.set('v.accountConsultant', records);
        //var masterList = component.get('v.accountConsultant');
        var pageSize = component.get('v.pageSize');
        
        component.set('v.page', 1);
        component.set('v.total', records.length);
        component.set('v.pages', Math.ceil(records.length/pageSize));
        
        var displayList = [];
        
        if(records.length > pageSize){
            for(var i = 0; i< pageSize; i++){
                displayList.push(records[i]);
            }   
            component.set('v.displayListConsultant', displayList);
        }else{
            component.set('v.displayListConsultant', records);
        }
        
    },       
    
    sortBy : function(component, event, helper, sortOnField, fieldSortOrder, orderToBeSorted){
        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        }
        
        if((orderToBeSorted != undefined) || (orderToBeSorted != null)){
            if(orderToBeSorted === "DESC"){
                this.getSortedListHelper(component, event, 'Contact', '', sortOnField);
                component.set('v.'+fieldSortOrder, false);
            }else{
                this.getSortedListHelper(component, event, 'Contact', '', sortOnField, true);
               	component.set('v.'+fieldSortOrder, true);
            }
        }else{
            if(component.get('v.'+fieldSortOrder)){
                //this.keysrt(component, 'Contact', sortOnField);    
                this.getSortedListHelper(component, event, 'Contact', '', sortOnField);
                component.set('v.'+fieldSortOrder, false);
            }else{
                //this.keysrt(component, 'Contact', sortOnField, true);
                this.getSortedListHelper(component, event, 'Contact', '', sortOnField, true);
                component.set('v.'+fieldSortOrder, true);
            }
        }
    },
    
    keysrt : function (component, prop, key, reverse) {
        var sortOrder = 1;
        if(reverse)sortOrder = -1;
        
        var sortAsc = reverse;
        var sortField = key;
        var records = component.get('v.accountConsultant');
        //sortAsc = key == sortField? !sortAsc: true;
        records.sort(function(a,b){
            var t1 = a[prop][key] == b[prop][key],
                t2 = a[prop][key] > b[prop][key];
            return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
        });
        
        //component.set('v.accountConsultant', records);
        
        //var masterList = component.get('v.accountConsultant');
        var pageSize = component.get('v.pageSize');
        
        component.set('v.page', 1);
        component.set('v.total', records.length);
        component.set('v.pages', Math.ceil(records.length/pageSize));
        
        var displayList = [];
        
        if(records.length > pageSize){
            for(var i = 0; i< pageSize; i++){
                displayList.push(records[i]);
            }   
            component.set('v.displayListConsultant', displayList);
        }else{
            component.set('v.displayListConsultant', records);
        }
        
        
        /*arr.sort(function(a, b) {
	        var x = a[prop][key];
            var y = b[prop][key];
        	sortOrder * ((x < y) ? -1 : ((x > y) ? 1 : 0));
	    });*/
        
        //alert('Sorted array-----'+JSON.stringify(records));
    },       
    
    desktopModal : function(component, event, header, cmp, accountId) {
        
        //alert('recordId-->>'+component.get('v.recordId'));
        
        var contactRecordType = component.get('v.contactRecordTypeId');
        var childData = {'accountId': accountId, 'contactRecordType' : contactRecordType, 'recordId' : component.get('v.recordId')};
        
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
        var childData = {'accountId': accountId, 'contactRecordType' : contactRecordType, 'recordId' : component.get('v.recordId')};
        
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
    
    getSortedListHelper : function(component, event, prop, prop2, key, reverse){
        
        component.set('v.isSpinnertoLoad', true);
        
        var primaryConsultantId = '';
        component.set('v.primaryId', primaryConsultantId); 
        var accountId = component.get('v.recordId');
        var contactRecordType = component.get('v.contactRecordTypeId');
        var actionToGetConsultants = component.get('c.getSortedList');
        actionToGetConsultants.setParams({"accountId" : accountId, "contactRecordType" : contactRecordType});
        
        actionToGetConsultants.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                
                var listRecords = response.getReturnValue();
                var consultantList = listRecords.consultantList;
                
                var accIds = [];
                if(consultantList.length > 0){
                    for(var i = 0; i < consultantList.length; i++){
                        var accId = consultantList[i].Contact.Account.Id;
                        accIds.push(accId);
                    }
                }
                
                
                var resp = listRecords.accountList;
                var r2 = [];
                var responseAll = [];
                
                for(var i = 0; i<resp.length; i++){
                    if(accIds.indexOf(resp[i].Id) < 0){
                        r2.push(resp[i]);
                    }
                }
                
                if(r2.length > 0){
                    for(var ii = 0 ; ii < r2.length; ii++){
                        var cfData = {};
                        
                        cfData["Id"] = '';
                        cfData["Primary__c"] = false;
                        cfData["Contact"] = {};
                        var cf1 = cfData.Contact;
                        cf1["Id"] = '';
                        cf1["FirstName"] = 'Unassigned';
                        cf1["LastName"] = 'Unassigned';
                        cf1["MailingCity"] = 'Unassigned';
                        cf1["ConsultantTier__c"] = 'Unassigned';
                        cf1["Title"] = 'Unassigned';
                        cf1["Account"] = {};
                        var cf2 = cf1.Account;
                        cf2["Name"] = r2[ii].Name;
                        cf2["Id"] = r2[ii].Id;
                        
                        responseAll.push(cfData);
                    }  
                }
                
                if(consultantList.length != 0 && responseAll.length != 0){
                    
                    component.set('v.accountConsultant', consultantList.concat(responseAll));
                }
                if(consultantList.length == 0){
                    component.set('v.accountConsultant', responseAll);
                }
                if(responseAll.length == 0){
                    component.set('v.accountConsultant', consultantList);
                }
				
                var sortOrder = 1;
                if(reverse)sortOrder = -1;
                
                var sortAsc = reverse;
                var sortField = key;
                var records = component.get('v.accountConsultant');
                if(prop == ''){
                    records.sort(function(a,b){
                        var t1 = a[sortField] == b[sortField],
                            t2 = a[sortField] > b[sortField];
                        return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
                    });
                }
                else if(prop2 == 'Account'){
                    records.sort(function(a,b){
                        var t1 = a[prop][prop2][key] == b[prop][prop2][key],
                            t2 = a[prop][prop2][key] > b[prop][prop2][key];
                        return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
                    });
                }
				else {
                    records.sort(function(a,b){
                        var t1 = a[prop][key] == b[prop][key],
                            t2 = a[prop][key] > b[prop][key];
                        return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
                    });    
                }
                
                
	            var pageSize = component.get('v.pageSize');
                
                component.set('v.page', 1);
                component.set('v.total', records.length);
                component.set('v.pages', Math.ceil(records.length/pageSize));
                
                var displayList = [];
                
                if(records.length > pageSize){
                    for(var i = 0; i< pageSize; i++){
                        displayList.push(records[i]);
                    }   
                    component.set('v.displayListConsultant', displayList);
                }else{
                    component.set('v.displayListConsultant', records);
                }	
                
               	component.set('v.isSpinnertoLoad', false); 
                
                var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.removeClass(component.find("sortEdit"),"hide");
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
        
        $A.enqueueAction(actionToGetConsultants);
        
    },
    
})