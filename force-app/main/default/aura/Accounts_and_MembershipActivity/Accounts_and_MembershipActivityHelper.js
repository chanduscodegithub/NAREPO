({
    toggleHelper : function(component,event) {
        var toggleText = component.find("tooltip1");
        $A.util.toggleClass(toggleText, "toggle");
    },
    
    toggleAccountSection : function(component, event){
        var cmpTarget1 = component.find('account_section');
        var selectedItem = event.currentTarget;
        var iconElement1 = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement1).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement1).set("v.iconName","utility:chevrondown");
            component.set('v.isCompaniesQueried', true);
            this.getCompanies(component,event);
        }else if(myLabel=="utility:chevrondown"){          
            component.find(iconElement1).set("v.iconName","utility:chevronright");
            component.set('v.isCompaniesQueried', false);
        }
        
        $A.util.toggleClass(cmpTarget1,'slds-is-open');
    },
    
    toggleMASection : function(component, event){
        var cmpTarget2 = component.find('ma_section');
        var selectedItem = event.currentTarget;
        var iconElement2 = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement2).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement2).set("v.iconName","utility:chevrondown");
            component.set('v.isMAQueried', true);
            this.getMembershipActivity(component, event);
        }else if(myLabel=="utility:chevrondown"){          
            component.find(iconElement2).set("v.iconName","utility:chevronright");
            component.set('v.isMAQueried', false);
        }
        
        $A.util.toggleClass(cmpTarget2,'slds-is-open');
    },
    
    getMembershipActivity : function(component, event){
        
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'), 'cScroll-table');
        }
        var spinnerForMA = component.find('spinnerForMA');
        var background_dark1 = component.find('background_dark2');
        
        $A.util.removeClass(spinnerForMA, 'slds-hide');
        $A.util.removeClass(background_dark1, 'slds-hide');
        
        var action = component.get("c.getMembersipActivities");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "columnName" : 'Opportunity.Account.Name',
            "sortType" : 'ASC'
        });
        action.setCallback(this,function(response){
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {
                
                if(response.getReturnValue().MembershipActivityList!=null && response.getReturnValue().MembershipActivityList.length > 0){
                    component.set('v.membershipActivitiesDataArray', response.getReturnValue().MembershipActivityList);
                    component.set('v.MembershipActivityEmptyList', false);
                    
                    var responseArray = response.getReturnValue().MembershipActivityList;
                    
                    var uniqueContacts = [];
                    if(responseArray.length > 0){
                        uniqueContacts.push(responseArray[0]);
                    }
                    for(var i = 0;i < responseArray.length; i++){
                        var accId = responseArray[i].Opportunity.Id; 
                        if(!this.isExistMA(component,event,accId,uniqueContacts)){                                                                             
                            uniqueContacts.push(responseArray[i]);                                         
                        }                       
                    }
                    
                    var membershipActivitiesDataArray = uniqueContacts;
                    var maData = [];
                    var totalMAs = membershipActivitiesDataArray.length;
                    var indexToGo = 0;
                    if(membershipActivitiesDataArray.length >= 5){
                        indexToGo = 5;
                    }else{
                        indexToGo = membershipActivitiesDataArray.length;
                    }
                    
                    for(var i = 0; i<indexToGo; i++){
                        maData.push(membershipActivitiesDataArray[i]);
                    }
                    
                    component.set('v.maDataToDisplay', maData);
                    //alert(JSON.stringify(component.get('v.maDataToDisplay')));
                    
                    //Added as a part of CR on 09th Oct 2024
                    component.set('v.totalMACount', totalMAs);
                    //CR changes ends
                    
                    
                }else{
                    component.set('v.membershipActivitiesDataArray',[]);
                    component.set('v.maDataToDisplay', []);
                    component.set('v.MembershipActivityEmptyList', true);
                }
                
                if(!component.get('v.isDesktop')) {
                    $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                }
                
                $A.util.addClass(spinnerForMA, 'slds-hide');
                $A.util.addClass(background_dark1, 'slds-hide');
            } else {
                $A.util.addClass(spinnerForMA, 'slds-hide');
                $A.util.addClass(background_dark1, 'slds-hide');
                
                console.log("In getMembershipActivity method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
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
    
    getCompanies : function(component, event){
        
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'), 'cScroll-table');
        }
        
        var spinnerForMA = component.find('spinnerForAcc');
        var background_dark1 = component.find('background_dark1');
        
        $A.util.removeClass(spinnerForMA, 'slds-hide');
        $A.util.removeClass(background_dark1, 'slds-hide');
        
        var action = component.get("c.getAccountsAndMembershipActivityOnAppletLoad");
        action.setParams({
            "accountId" : component.get('v.recordId'),
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
                console.log('actionToGetRelatedAccounts@@@'+JSON.stringify(response.getReturnValue()));
                component.set('v.allyearValue',response.getReturnValue().yearValue) ;
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
                
                //Added as a part of CR on 09th Oct 2024
                if(response.getReturnValue().existingClientCompanies != null){
                    component.set('v.existingClientCount',response.getReturnValue().existingClientCompanies);                    
                }
                //CR changes ends
                 // Added Vignesh 8/11/24 -- Start
                if(response.getReturnValue().prospectCompanies != null){
                    component.set('v.prospectCount',response.getReturnValue().prospectCompanies);    
                }
                 // Added Vignesh 8/11/24 -- End
                
                if(response.getReturnValue().accountandMembershipActivity != null && response.getReturnValue().accountandMembershipActivity.length > 0) {
                    component.set('v.accountDataArray', response.getReturnValue().accountandMembershipActivity);
                    component.set('v.allRecordsList', component.get('v.accountDataArray'));
                }else{
                    component.set('v.accountDataArray', []);
                    component.set('v.allRecordsList',[]);                 
                }
                
                if(response.getReturnValue().accountContactRel != null && response.getReturnValue().accountContactRel.length > 0) {
                    component.set('v.accountContactRelationArray', response.getReturnValue().accountContactRel);
                }else{
                    component.set('v.accountContactRelationArray',[]);
                }
                
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
                
                var response1 = [];
                for(var k = 0; k<uniqueContacts.length; k++){
                    if(idSet.indexOf(uniqueContacts[k].Account.Id) == -1){
                        response1.push(uniqueContacts[k]);
                    }
                }
                var finalACR = [];
                for(var i = 0 ; i < response1.length; i++){
                    var cfData = {};
                    
                    cfData["Id"] = response1[i].Id;
                    cfData["AccountFirm__c"] = response1[i].Account.Id;
                    cfData["AccountFirm__r"] = {};
                    var cf1 = cfData.AccountFirm__r;
                    cf1["Id"] = response1[i].Account.Id;
                    cf1["Name"] = response1[i].Account.Name;
                    cf1["Owner"] = {};
                    cf1["RecordType"] = {};
                    
                    //Added By Gurjot
                    if(response1[i].Account.RecordType.DeveloperName === 'Existing_Client'){
                        cf1["NPS__c"] = response1[i].Account.NPS__c;
                    } else{
                        cf1["NPS__c"] = '';
                    }
                     
                    //Added By Gurjot
                    if(response1[i].Account.Client_Reference_Status__c === 'Red - Not Currently Suitable'){
                        cf1["Client_Reference_Status__c"] = 'Red';
                    }else if(response1[i].Account.Client_Reference_Status__c === 'Green - Good Reference'){
                        cf1["Client_Reference_Status__c"] = 'Green';
                    }else if(response1[i].Account.Client_Reference_Status__c === 'Yellow - Possible Reference (with qualifications)'){
                        cf1["Client_Reference_Status__c"] = 'Yellow';
                    }else if(response1[i].Account.Client_Reference_Status__c === 'Unwilling to Provide Reference'){
                        cf1["Client_Reference_Status__c"] = 'Unwilling';
                    }else {
                        cf1["Client_Reference_Status__c"] = '';
                    }
                    
                    var cf2 = cf1.Owner;
                    cf2["Id"] = response1[i].Account.Owner.Id;
                    cf2["Name"] = response1[i].Account.Owner.Name;
                    
                    var cf3 = cf1.RecordType;
                    cf3["Id"] = '';
                    cf3["Name"] = '';
                    if(response1[i].Account.RecordType !== null && response1[i].Account.RecordType !== undefined){
                        cf3["Name"] = response1[i].Account.RecordType.Name;
                    }                   
                    
                    finalACR.push(cfData); 
                }
                
                // Handling accountandMembershipActivity if accountContactRel is empty
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
                    
                    if(junctionRec[i].AccountFirm__r.RecordType.DeveloperName == 'Existing_Client'){
                        cf1["NPS__c"] = junctionRec[i].AccountFirm__r.NPS__c;
                    } else{
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
                
                if(junctionRec.length > 0 && finalACR.length > 0){
                    var entireList = junctionRec.concat(finalACR);
                    component.set('v.allCompaniesList', entireList);
                    component.set('v.listToDisplay', entireList);
                }
                if(junctionRec.length > 0 && finalJunction.length > 0){
                    var entireList = finalJunction;
                    // Added if condition by Gurjot on 5th Nov 2024
                    if(finalACR.length>0){
                      var entireList = finalJunction.concat(finalACR);  
                    }
                    component.set('v.allCompaniesList', entireList);
                    component.set('v.listToDisplay', entireList);
                }
                if(junctionRec.length == 0){
                    component.set('v.listToDisplay', finalACR);
                    component.set('v.allCompaniesList', finalACR);
                }
                if(finalACR.length == 0 && finalJunction.length ==0){
                    component.set('v.listToDisplay', junctionRec);
                    component.set('v.allCompaniesList', junctionRec);
                }
                
                var accDataArray = component.get('v.listToDisplay');
                var accData = [];                               
                
                for(var i = 0; i<accDataArray.length; i++){
                    accData.push(accDataArray[i]);
                }
                
                accData.sort(function(a,b){
                    var t1 = a['AccountFirm__r']['Name'] == b['AccountFirm__r']['Name'],
                        t2 = a['AccountFirm__r']['Name'] > b['AccountFirm__r']['Name'];
                    return t1? 0: (true?-1:1)*(t2?-1:1);
                });
                
                var indexToGo = 0;
                if(accDataArray.length >= 5){
                    indexToGo = 5;
                }else{
                    indexToGo = accDataArray.length;
                }
                
                var accDataFinal = [];                               
                
                for(var i = 0; i<indexToGo; i++){
                    accDataFinal.push(accData[i]);
                }
                
                component.set('v.accountDataToDisplay', accDataFinal);
                
                component.set('v.listToDisplay', component.get('v.accountDataToDisplay'));
                //Added Vignesh 8/11/24 Start 
                component.set('v.allAccountCount', component.get('v.allCompaniesList').length);
                //Added Vignesh 8/11/24 End
                if(component.get('v.allCompaniesList').length == 0){
                    component.set('v.AccountsAndMAEmptyList', true);
                }else{
                    component.set('v.AccountsAndMAEmptyList', false);
                }
                
                if(!component.get('v.isDesktop')) {
                    $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                }
                
                $A.util.addClass(spinnerForMA, 'slds-hide');
                $A.util.addClass(background_dark1, 'slds-hide');
                
            } else {
                $A.util.addClass(spinnerForMA, 'slds-hide');
                $A.util.addClass(background_dark1, 'slds-hide');
                
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
        
    getAccountsAndMembershipActivity : function(component, event) {
        
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.getAccountsAndMembershipActivityOnAppletLoad");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "columnName" : 'AccountFirm__r.Name',
            "columnName1" : 'Opportunity.Name',
            "sortType" : 'Asc'
        });
        action.setCallback(this,function(response){
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {                
                if(response.getReturnValue().accountandMembershipActivity != null && response.getReturnValue().accountandMembershipActivity.length > 0) {
                    component.set('v.accountDataArray', response.getReturnValue().accountandMembershipActivity);                	
                    component.set('v.membershipActivitiesDataArray', response.getReturnValue().membershipActivityShowFullList);
                }else{
                    component.set('v.AccountsAndMAEmptyList', true);
                }
                
                if(response.getReturnValue().accountContactRel != null && response.getReturnValue().accountContactRel.length > 0) {
                    component.set('v.accountContactRelationArray', response.getReturnValue().accountContactRel);
                }else{
                    component.set('v.AccountsAndMAEmptyList', true);
                }
                
                //component.get('allRecordsList').push();
                
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
                
                console.log("In getAccountsAndMembershipActivity method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
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
            //  $A.util.removeClass(spinner, 'slds-show');
            //  $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
        // Modified by Gurjot for Consultant Dashboard ticket
        sortAcc : function(component, event, sortOnField, fieldSortOrder, orderToBeSorted){
            
            var spinnerForMA = component.find('spinnerForAcc');
            var background_dark1 = component.find('background_dark1');
           
            $A.util.removeClass(spinnerForMA, 'slds-hide');
            $A.util.removeClass(background_dark1, 'slds-hide');
           
            // Commented by Gurjot to fix spinner issue
            /*setTimeout(function(){
            $A.util.addClass(spinnerForMA, 'slds-hide');
            $A.util.addClass(background_dark1, 'slds-hide');
        }, 500); */
            
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
                            this.getSortedListHelper(component, event, 'AccountFirm__r','', key2,true);
                        }else{
                            this.getSortedListHelper(component, event, 'AccountFirm__r', key2, 'Name');
                        }
                        component.set('v.'+fieldSortOrder, false);
                    }else{
                        if(sortOnField === 'AccountFirm__r.Client_Reference_Status__c' || sortOnField === 'AccountFirm__r.NPS__c'){
                            this.getSortedListHelper(component, event, 'AccountFirm__r','', key2,false);
                        }else{
                            this.getSortedListHelper(component, event, 'AccountFirm__r', key2, 'Name', true);
                        }
                        component.set('v.'+fieldSortOrder, true);
                    }
                }
                $A.util.addClass(spinnerForMA, 'slds-hide');
                $A.util.addClass(background_dark1, 'slds-hide');
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
           $A.util.addClass(spinnerForMA, 'slds-hide');
           $A.util.addClass(background_dark1, 'slds-hide');
        },
    
    
            
            getSortedListHelper : function(component, event, prop, prop2, key, reverse){
                
                var sortOrder = 1;
                if(reverse)sortOrder = -1;
                
                var sortAsc = reverse;
                var sortField = key;
                //var records = component.get('v.allCompaniesList');
                var records = component.get('v.listToDisplay'); // Sorting only 5 records on the UI
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
                
                var accData = [];
                
                var indexToGo = 0;
                if(records.length >= 5){
                    indexToGo = 5;
                }else{
                    indexToGo = records.length;
                }
                
                for(var i = 0; i<indexToGo; i++){
                    accData.push(records[i]);
                }
                
                component.set('v.accountDataToDisplay', accData);
                //alert(JSON.stringify(component.get('v.accountDataToDisplay')));
                
                component.set('v.listToDisplay', component.get('v.accountDataToDisplay'));
                
                
            },
                
                sortMA : function(component, event, fieldName,sortFieldComp) {
                    
                    if($A.get("$Browser.isIOS")){
                        $A.util.removeClass(component.find('articleClass'),'cScroll-table');
                    }
                    var spinnerForMA = component.find('spinnerForMA');
                    var background_dark1 = component.find('background_dark2');
                    $A.util.removeClass(spinnerForMA, 'slds-hide');
                    $A.util.removeClass(background_dark1, 'slds-hide');
                    
                    var action = component.get("c.getMembersipActivities");
                    if(component.get("v."+sortFieldComp) ===  true) {
                        action.setParams({
                            "accountId" : component.get('v.recordId'),
                            "columnName" : fieldName,
                            "sortType" : 'DESC'
                        });
                        component.set("v."+sortFieldComp, false);
                    } else {
                        action.setParams({
                            "accountId" : component.get('v.recordId'),
                            "columnName" : fieldName,
                            "sortType" : 'ASC'
                        });
                        component.set("v."+sortFieldComp, true);
                    }
                    
                    action.setCallback(this,function(response) {
                        if($A.get("$Browser.isIOS")){
                            $A.util.addClass(component.find('articleClass'),'cScroll-table');
                        }
                        var state = response.getState();
                        if(state == "SUCCESS") {                
                            if(response.getReturnValue().MembershipActivityList!=null && response.getReturnValue().MembershipActivityList.length > 0){
                                component.set('v.membershipActivitiesDataArray', response.getReturnValue().MembershipActivityList);
                                
                                var responseArray = component.get('v.membershipActivitiesDataArray');
                                
                                var uniqueContacts = [];
                                if(responseArray.length > 0){
                                    uniqueContacts.push(responseArray[0]);
                                }
                                for(var i = 0;i < responseArray.length; i++){
                                    var accId = responseArray[i].Opportunity.Id; 
                                    if(!this.isExistMA(component,event,accId,uniqueContacts)){                                                                             
                                        uniqueContacts.push(responseArray[i]);                                         
                                    }                       
                                }                    
                                var membershipActivitiesDataArray = uniqueContacts;
                                var maData = [];
                                
                                var indexToGo = 0;
                                if(membershipActivitiesDataArray.length >= 5){
                                    indexToGo = 5;
                                }else{
                                    indexToGo = membershipActivitiesDataArray.length;
                                }
                                
                                for(var i = 0; i<indexToGo; i++){
                                    maData.push(membershipActivitiesDataArray[i]);
                                }
                                
                                component.set('v.maDataToDisplay', maData);
                                //alert(JSON.stringify(component.get('v.maDataToDisplay')));
                                
                            }else{
                                component.set('v.MembershipActivityEmptyList', true);
                            }
                            
                            $A.util.addClass(spinnerForMA, 'slds-hide');
                            $A.util.addClass(background_dark1, 'slds-hide');
                            
                            if(!component.get('v.isDesktop')){
                                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                            }
                        } else {
                            $A.util.addClass(spinnerForMA, 'slds-hide');
                            $A.util.addClass(background_dark1, 'slds-hide');
                            
                            console.log("In sortBy method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
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
                    
                    modalGenericClose : function(component) {
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
                        }
                    },
                        isExist : function(component, event, accId,arr1){
                            var isExist = false;
                            for(var i=0;i<arr1.length;i++){           
                                if(arr1[i].Account.Id === accId){
                                    isExist = true;
                                }          
                            }
                            return isExist;
                        },
                            isExistMA : function(component, event, accId,arr1){
                                var isExist = false;
                                for(var i=0;i<arr1.length;i++){           
                                    if(arr1[i].Opportunity.Id === accId){
                                        isExist = true;
                                    }          
                                }
                                return isExist;
                            }
})