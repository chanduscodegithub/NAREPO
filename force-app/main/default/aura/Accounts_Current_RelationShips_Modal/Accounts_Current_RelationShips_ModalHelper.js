({
    getCompanies : function(component, event, Child_Data){
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'), 'cScroll-table');
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.getAccountsAndMembershipActivityOnAppletLoad");
        action.setParams({
            "accountId" : Child_Data.accountId,
            "columnName" : 'AccountFirm__r.Name',
            "columnName1" : 'Opportunity.Name',
            "sortType" : 'ASC'
        });
        action.setCallback(this,function(response){
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {
                var contactAccountList  = response.getReturnValue();
                for(var j=0;j<contactAccountList.accountContactRel.length;j++){
                            if(contactAccountList.CSRList.length>0){
                                for(var i=0;i<contactAccountList.CSRList.length;i++){
                                    if(contactAccountList.CSRList[i].Account__c ==contactAccountList.accountContactRel[j].Account.Id){
                                        contactAccountList.accountContactRel[j].Account.NPS__c =contactAccountList.CSRList[i].LikelihoodtoRecommendScore__c;
                                    }
                                }
                            }                       
                        }
                 for(var j=0;j<contactAccountList.accountandMembershipActivity.length;j++){
                    if(contactAccountList.CSRList.length>0){
                        for(var i=0;i<contactAccountList.CSRList.length;i++){
                            if(contactAccountList.CSRList[i].Account__c ==contactAccountList.accountandMembershipActivity[j].AccountFirm__r.Id){
                                contactAccountList.accountandMembershipActivity[j].AccountFirm__r.NPS__c =contactAccountList.CSRList[i].LikelihoodtoRecommendScore__c;
                            }
                        }
                    }                       
                }
                component.set('v.allyearValue',response.getReturnValue().yearValue) ;                
                if(response.getReturnValue().accountandMembershipActivity != null && response.getReturnValue().accountandMembershipActivity.length > 0) {
                    component.set('v.accountDataArray', response.getReturnValue().accountandMembershipActivity);
                    component.set('v.allRecordsList', component.get('v.accountDataArray'));
                }else{
                    component.set('v.AccountsAndMAEmptyList', true);
                }
                
                if(response.getReturnValue().accountContactRel != null && response.getReturnValue().accountContactRel.length > 0) {
                    component.set('v.accountContactRelationArray', response.getReturnValue().accountContactRel);
                    
                    var junctionRec = component.get('v.allRecordsList');
                    var idSet = [];
                    for(var j = 0; j<junctionRec.length; j++){
                        idSet.push(junctionRec[j].AccountFirm__c);
                    }
                    
                    var responseArray = component.get('v.accountContactRelationArray');
                    
                    var uniqueContacts = [];
                    if(responseArray.length > 0){
                        uniqueContacts.push(responseArray[0]);
                    }
                    for(var i = 0;i < responseArray.length; i++){
                        var accId = responseArray[i].Account.Id; 
                        if(!this.isExist(component,event,accId,uniqueContacts)){                                                                             
                            uniqueContacts.push(responseArray[i]);                                         
                        }                       
                    }
                    
                    var response = [];
                    for(var k = 0; k<uniqueContacts.length; k++){
                        if(idSet.indexOf(uniqueContacts[k].Account.Id) == -1){
                            response.push(uniqueContacts[k]);
                        }
                    }
                    
                    //var response = component.get('v.accountContactRelationArray');
                    var finalACR = [];
                    for(var i = 0 ; i < response.length; i++){
                        var cfData = {};
                        
                        cfData["Id"] = response[i].Id;
                        cfData["AccountFirm__c"] = response[i].Account.Id;
                        cfData["AccountFirm__r"] = {};
                        var cf1 = cfData.AccountFirm__r;
                        cf1["Id"] = response[i].Account.Id;
                        cf1["Name"] = response[i].Account.Name;
                        cf1["Owner"] = {};
                        cf1["RecordType"] = {};
                        
                        // Added By Gurjot
                       if(response[i].Account.RecordType.DeveloperName === 'Existing_Client'){
                            cf1["NPS__c"] = response[i].Account.NPS__c;
                        } else {
                             cf1["NPS__c"] = '';
                        }
                        
                        
                        // Modifying Values to display on UI and display on Referenceable Field
                        if(response[i].Account.Client_Reference_Status__c === 'Red - Not Currently Suitable'){
                            cf1["Client_Reference_Status__c"] = 'Red';
                        }else if(response[i].Account.Client_Reference_Status__c === 'Green - Good Reference'){
                            cf1["Client_Reference_Status__c"] = 'Green';
                        }else if(response[i].Account.Client_Reference_Status__c === 'Yellow - Possible Reference (with qualifications)'){
                            cf1["Client_Reference_Status__c"] = 'Yellow';
                        }else if(response[i].Account.Client_Reference_Status__c === 'Unwilling to Provide Reference'){
                            cf1["Client_Reference_Status__c"] = 'Unwilling';
                        }else {
                            cf1["Client_Reference_Status__c"] = '';
                        }
                        
                        var cf2 = cf1.Owner;
                        cf2["Id"] = response[i].Account.Owner.Id;
                        cf2["Name"] = response[i].Account.Owner.Name;
                        
                        var cf3 = cf1.RecordType;
                        cf3["Id"] = '';
                        cf3["Name"] = response[i].Account.RecordType.Name;
                        
                        finalACR.push(cfData);
                    } 
                    
                    if(finalACR.length > 0){
                        //var junctionRec = component.get('v.allRecordsList'); //Commented on 5th Nov by Gurjot
                        //var entireList = junctionRec.concat(finalACR);	//Commented on 5th Nov by Gurjot
                        finalACR.sort(function(a,b){
                            var t1 = a['AccountFirm__r']['Name'] == b['AccountFirm__r']['Name'],
                                t2 = a['AccountFirm__r']['Name'] > b['AccountFirm__r']['Name'];
                            return t1? 0: (true?-1:1)*(t2?-1:1);
                        });
                        console.log('entireList-->>'+finalACR);
                        component.set('v.accountDataArray', finalACR);
                    }
                    
                }
                //Added if condition on 5th Nov by Gurjot
                if(component.get('v.allRecordsList') !=null){
                    // Handling accountandMembershipActivity if accountContactRel is empty
                    var junctionRec = component.get('v.allRecordsList');
                    var finalJunction = [];
                    for(var i = 0 ; i < junctionRec.length; i++){
                        var cfData = {};
                        
                        cfData["Id"] = junctionRec[i].Id;
                        cfData["AccountFirm__c"] = junctionRec[i].AccountFirm__c;
                        cfData["AccountFirm__r"] = {};
                        var cf1 = cfData.AccountFirm__r;
                        cf1["Id"] = junctionRec[i].AccountFirm__r.Id;
                        cf1["Name"] = junctionRec[i].AccountFirm__r.Name;
                        cf1["Owner"] = {};
                        cf1["RecordType"] = {};
                        
                        //Added By Gurjot
                       if(junctionRec[i].AccountFirm__r.RecordType.DeveloperName === 'Existing_Client'){
                            cf1["NPS__c"] = junctionRec[i].AccountFirm__r.NPS__c;
                        } else {
                            cf1["NPS__c"] = '';
                        }  
                         
                        //Added By Gurjot
                        if(junctionRec[i].AccountFirm__r.Client_Reference_Status__c === 'Red - Not Currently Suitable'){
                            cf1["Client_Reference_Status__c"] = 'Red';
                        }else if(junctionRec[i].AccountFirm__r.Client_Reference_Status__c === 'Green - Good Reference'){
                            cf1["Client_Reference_Status__c"] = 'Green';
                        }else if(junctionRec[i].AccountFirm__r.Client_Reference_Status__c === 'Yellow - Possible Reference (with qualifications)'){
                            cf1["Client_Reference_Status__c"] = 'Yellow';
                        }else if(junctionRec[i].AccountFirm__r.Client_Reference_Status__c === 'Unwilling to Provide Reference'){
                            cf1["Client_Reference_Status__c"] = 'Unwilling';
                        }else {
                            cf1["Client_Reference_Status__c"] = '';
                        }
                        
                        var cf2 = cf1.Owner;
                        cf2["Id"] = junctionRec[i].AccountFirm__r.Owner.Id;
                        cf2["Name"] = junctionRec[i].AccountFirm__r.Owner.Name;
                        
                        var cf3 = cf1.RecordType;
                        cf3["Id"] = '';
                        cf3["Name"] = '';
                        if(junctionRec[i].AccountFirm__r.RecordType !== null && junctionRec[i].AccountFirm__r.RecordType !== undefined){
                            cf3["Name"] = junctionRec[i].AccountFirm__r.RecordType.Name;
                        }                   
                        
                        finalJunction.push(cfData); 
                    }
                    
                    if(finalJunction.length > 0){
                        var junctionRec = component.get('v.accountDataArray');
                        var entireList = junctionRec.concat(finalJunction);
                        entireList.sort(function(a,b){
                            var t1 = a['AccountFirm__r']['Name'] == b['AccountFirm__r']['Name'],
                                t2 = a['AccountFirm__r']['Name'] > b['AccountFirm__r']['Name'];
                            return t1? 0: (true?-1:1)*(t2?-1:1);
                        });
                        component.set('v.accountDataArray', entireList);
                    }
                    component.set('v.AccountsAndMAEmptyList', true);
                }
                
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                if(!component.get('v.isDesktop')){
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
                if(!component.get('v.isDesktop')) {
                    $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                }
            } else {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                console.log("In getCompanies method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
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
    
    // Modified below function By Gurjot 
    // Ticket :- Consultant Dashboard Firm
    // Date :- 17th Oct 2024 -->
    sortAcc : function(component, event, sortOnField, fieldSortOrder, orderToBeSorted){
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        // Commented By Gurjot for resolving spinner issue
        /*setTimeout(function(){
            console.log('Time-out>>');
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        }, 500);*/
        
        if(sortOnField != 'Name'){
            var key2 = '';
            if(sortOnField === 'RecordType'){
                key2 = 'RecordType';
            }else if(sortOnField === 'Owner'){
                key2 = 'Owner';
            }else if(sortOnField === 'AccountFirm__r.Client_Reference_Status__c'){
                key2 = 'Client_Reference_Status__c';
            }else if(sortOnField === 'AccountFirm__r.NPS__c'){
                key2 = 'NPS__c';
            }
            if((orderToBeSorted != undefined) || (orderToBeSorted != null)){
                if(orderToBeSorted === "DESC"){
                    this.getSortedListHelper(component, event, 'AccountFirm__r', key2, 'Name');
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    this.getSortedListHelper(component, event, 'AccountFirm__r', key2, 'Name', true);
                    component.set('v.'+fieldSortOrder, true);
                }
            }else{
                if(component.get('v.'+fieldSortOrder)){
                    if(sortOnField === 'AccountFirm__r.Client_Reference_Status__c' || sortOnField === 'AccountFirm__r.NPS__c'){
                        this.getSortedListHelperNew(component, event, 'AccountFirm__r','', key2,'asc');
                    }else{
                        this.getSortedListHelper(component, event, 'AccountFirm__r', key2, 'Name');
                    }
                    
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    if(sortOnField === 'AccountFirm__r.Client_Reference_Status__c' || sortOnField === 'AccountFirm__r.NPS__c'){
                        this.getSortedListHelperNew(component, event, 'AccountFirm__r','', key2);
                    }else{
                        this.getSortedListHelper(component, event, 'AccountFirm__r', key2, 'Name', true);
                    }
                    
                    component.set('v.'+fieldSortOrder, true);
                }
            }
        }else{
            if((orderToBeSorted != undefined) || (orderToBeSorted != null)){
                if(orderToBeSorted === "DESC"){
                    this.getSortedListHelper(component, event, 'AccountFirm__r', '', sortOnField);
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    this.getSortedListHelper(component, event, 'AccountFirm__r', '', sortOnField, true);
                    component.set('v.'+fieldSortOrder, true);
                }
            }else{
                if(component.get('v.'+fieldSortOrder)){
                    this.getSortedListHelper(component, event, 'AccountFirm__r', '', sortOnField);
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    this.getSortedListHelper(component, event, 'AccountFirm__r', '', sortOnField, true);
                    component.set('v.'+fieldSortOrder, true);
                }
            }
        }
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
    },
    
    // Added By Gurjot for sorting LRT field and Referenceable columns and handling null
    // Ticket :- Consultant Dashboard Firm
    // Date :- 17th Oct 2024
    getSortedListHelperNew : function(component, event, prop, prop2, key, reverse){
        
        let isReverse = reverse === 'asc' ? 1 : -1;
        
        var sortField = key;
        var records = component.get('v.accountDataArray');
        if(prop2 === ''){
            records.sort(function(a,b){
                a = a[prop][key] ? a[prop][key] : ''; // Handle null values
                b = b[prop][key] ? b[prop][key] : '';
                
                return a > b ? 1 * isReverse : -1 * isReverse;
            }); 
        }else{
            records.sort(function(a,b){
                var aValue = a[prop][prop2][key];
                var bValue = b[prop][prop2][key];
                
                // Determine if the values are numbers or strings
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return (aValue - bValue) * (sortAsc ? 1 : -1);
                } else {
                    return (aValue > bValue ? 1 : -1) * (sortAsc ? 1 : -1);
                }
            });
        }
        
        component.set('v.accountDataArray', records);
        
    },
    
    getSortedListHelper : function(component, event, prop, prop2, key, reverse){
        
        var sortOrder = 1;
        if(reverse)sortOrder = -1;
        
        var sortAsc = reverse;
        var sortField = key;
        var records = component.get('v.accountDataArray');
        if(prop2 === ''){
            records.sort(function(a,b){
                var t1 = a[prop][key] == b[prop][key],
                    t2 = a[prop][key] > b[prop][key];
                return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
            }); 
        }else{
            records.sort(function(a,b){
                var t1 = a[prop][prop2][key] == b[prop][prop2][key],
                    t2 = a[prop][prop2][key] > b[prop][prop2][key];
                return t1? 0: (sortAsc?-1:1)*(t2?-1:1);
            });
        }
        
        component.set('v.accountDataArray', records);
        
    },
    isExist : function(component, event, accId,arr1){
        var isExist = false;
        for(var i=0;i<arr1.length;i++){           
            if(arr1[i].Account.Id === accId){
                isExist = true;
            }          
        }
        return isExist;
    }
    
})