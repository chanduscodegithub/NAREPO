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
                        
                        var cf2 = cf1.Owner;
                        cf2["Id"] = response[i].Account.Owner.Id;
                        cf2["Name"] = response[i].Account.Owner.Name;
                        
                        var cf3 = cf1.RecordType;
                        cf3["Id"] = '';
                        cf3["Name"] = response[i].Account.RecordType.Name;
                        
                        finalACR.push(cfData);
                    } 
                    
                    if(finalACR.length > 0){
                        var junctionRec = component.get('v.allRecordsList');
                        var entireList = junctionRec.concat(finalACR);
                        entireList.sort(function(a,b){
                            var t1 = a['AccountFirm__r']['Name'] == b['AccountFirm__r']['Name'],
                                t2 = a['AccountFirm__r']['Name'] > b['AccountFirm__r']['Name'];
                            return t1? 0: (true?-1:1)*(t2?-1:1);
                        });
                        console.log('entireList-->>'+entireList);
                        component.set('v.accountDataArray', entireList);
                    }
                    
                }else{
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
    
    sortAcc : function(component, event, sortOnField, fieldSortOrder, orderToBeSorted){
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        setTimeout(function(){
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        }, 500);
        
        if(sortOnField != 'Name'){
            var key2 = '';
            if(sortOnField === 'RecordType'){
                key2 = 'RecordType';
            }else if(sortOnField === 'Owner'){
                key2 = 'Owner';
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
                    this.getSortedListHelper(component, event, 'AccountFirm__r', key2, 'Name');
                    component.set('v.'+fieldSortOrder, false);
                }else{
                    this.getSortedListHelper(component, event, 'AccountFirm__r', key2, 'Name', true);
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