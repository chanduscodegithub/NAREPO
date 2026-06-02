({
    getData: function (component, event, columnName, sortFieldComp) {
        
        component.set('v.hasTabAccess', false);
        $A.util.removeClass(component.find("tableSpinner"), "slds-hide");
        
        if (component.find("VPCRRVPsDropDown") != undefined) {
            var selectedVPCRRVPVal = component.find("VPCRRVPsDropDown").get("v.value");
        }
        
        var action = component.get('c.getAccountsandOpportunities');
        if (component.get("v." + sortFieldComp) === true) {
            action.setParams({
                "OnLoad": true,
                "OnFilter": false,
                "cmvcpfilter": '',
                "ownerfilter": '',
                "columnName": columnName,
                "sortType": 'DESC',
                'accId': component.get('v.recordId')
            });
            component.set("v." + sortFieldComp, false);
        } else {
            action.setParams({
                "OnLoad": true,
                "OnFilter": false,
                "cmvcpfilter": '',
                "ownerfilter": '',
                "columnName": columnName,
                "sortType": 'ASC',
                'accId': component.get('v.recordId')
            });
            component.set("v." + sortFieldComp, true);
        }
        action.setCallback(this, $A.getCallback(function (response) {
            let state = response.getState();
            if (state === "SUCCESS") {
                
                let responseObj = response.getReturnValue();
                console.log('Checking if check...', responseObj);
                this.processCommonLogic(component, event, response);
                component.set('v.businessLine', responseObj.businessLine);
                
                if (responseObj.customSettingSoftDueDate != undefined) {
                    component.set('v.tabLabel', 'Client Survey Contact Identification - Due: ' + responseObj.customSettingSoftDueDate);
                } else {
                    component.set('v.tabLabel', 'Client Survey Contact Identification - Due: ');
                }
                component.set('v.tabLabel', 'Client Survey Contact Identification');
                
                if (responseObj.isCustomTabVisible != null) {
                    component.set('v.isCustomTabVisible', responseObj.isCustomTabVisible);
                }
               //Added Vignesh CR-3847
               if(responseObj.isclientManagersCheck){
                   if(responseObj.isCMLoggedin)
                       component.set('v.isclientManagersCheck', true); 
                   else 
                       component.set('v.isclientManagersCheck', false); 
               }
               else if(responseObj.issurestClientManagersCheck){
                    if(responseObj.isSCMLoggedin)
                       component.set('v.isclientManagersCheck', true); 
                    else 
                       component.set('v.isclientManagersCheck', false); 
               } 
               else if(responseObj.isumrClientManagersCheck){     //Added Vignesh - 18/08/25
                    if(responseObj.isUMRLoggedin)
                       component.set('v.isclientManagersCheck', true); 
                    else 
                       component.set('v.isclientManagersCheck', false); 
               } 
               else if(responseObj.isspecialtyClientManagersCheck){ 
                    if(responseObj.isSBCMLoggedin)
                       component.set('v.isclientManagersCheck', true); 
                    else 
                       component.set('v.isclientManagersCheck', false); 
               }

               //Added Vignesh CR-3847 -- SCE Validation   
                 console.log('Checking if check...', responseObj.isSCECheck);           
                if(responseObj.iscmsceCheck){
                    console.log('Checking CM SCE condition...');
                    console.log('isCmsceLoggedin: ', responseObj.isCmsceLoggedin);
                    
                   if(responseObj.isCmsceLoggedin)
                       component.set('v.iscmsceCheck', true); 
                   else 
                       component.set('v.iscmsceCheck', false); 
               }
                else if(responseObj.issurestCmsceCheck){
                    console.log('Checking Surest CM SCE condition...');
                    console.log('isSurestCmsceLoggedin: ', responseObj.isSurestCmsceLoggedin);
                    
                    if(responseObj.isSurestCmsceLoggedin)
                       component.set('v.iscmsceCheck', true); 
                    else 
                       component.set('v.iscmsceCheck', false); 
               }
                
               else if(responseObj.isspecialtybenefitsSceCheck){ 
                   console.log('Checking Specialty Benefits SCE condition...');
                   console.log('isSpeBenSceLoggedin: ', responseObj.isSpeBenSceLoggedin);
                    if(responseObj.isSpeBenSceLoggedin)
                       component.set('v.iscmsceCheck', true); 
                    else 
                       component.set('v.iscmsceCheck', false); 
               }
               console.log('Final v.isSCECheck value: ', component.get('v.isSCECheck'));
                
                component.set('v.isMATabVisible', true);
                //Added Vignesh CR-3847
                if(responseObj.loggedInUserRoleName.Position__c == 'Client Management Consultant' ||
                   responseObj.loggedInUserRoleName.Position__c == 'Client Director' || responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator'){  
                    component.set('v.isclientManagersCheck', true);                   
                }
                
                if(responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SVP'
                    || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VP' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VPCR/RVP'){  
                    component.set('v.iscmsceCheck', true);                   
                }
                
                let allCMVPCRRVPsList = responseObj.oppCMVPCRRVPSetWrap;
                let allCMVPCRRVPsArray = [];
                allCMVPCRRVPsArray.push({ label: 'All RVP\'s/VPCR\'s', value: 'All RVP\'s/VPCR\'s' });
                
                if (allCMVPCRRVPsList != undefined && allCMVPCRRVPsList != null && allCMVPCRRVPsList.length > 0) {
                    allCMVPCRRVPsList.sort();
                    for (var i = 0; i < allCMVPCRRVPsList.length; i++) {
                        allCMVPCRRVPsArray.push({ label: allCMVPCRRVPsList[i], value: allCMVPCRRVPsList[i] });
                    }
                }
                
                if (component.find('VPCRRVPsDropDown') != undefined) {
                    component.find('VPCRRVPsDropDown').set("v.options", allCMVPCRRVPsArray);
                }
                
                let allSCEsList = responseObj.oppOwnweSetWrap;
                let allSCEsArray = [];
                allSCEsArray.push({ label: 'All SCE\'s', value: 'All SCE\'s' });
                
                if (allSCEsList != undefined && allSCEsList != null && allSCEsList.length > 0) {
                    allSCEsList.sort();
                    for (let i = 0; i < allSCEsList.length; i++) {
                        allSCEsArray.push({ label: allSCEsList[i], value: allSCEsList[i] });
                    }
                }
                
                component.set("v.allSCEsDefaultArray", allSCEsArray);
                if (component.find('SCEsDropDown') != undefined) {
                    component.find('SCEsDropDown').set("v.options", allSCEsArray);
                }
                
                if (responseObj.vpcrSCEMapWrap != undefined && responseObj.vpcrSCEMapWrap != null) {
                    component.set('v.vpcrSceOwnerMap', responseObj.vpcrSCEMapWrap);
                }
                
                let oppList = responseObj.cmSceOppList;
                if (oppList != undefined && oppList != null && oppList.length > 0) {
                    for (var i = 0; i < oppList.length; i++) {
                        var oppObj = oppList[i];
                        if (oppObj.Account) {
                            oppObj.AccountName = oppObj.Account.Name;
                        }
                        if (oppObj.CM_VPCR_RVP__r) {
                            oppObj.CM_VPCR_RVP = oppObj.CM_VPCR_RVP__r.Name;
                        }
                        if (oppObj.Owner) {
                            oppObj.Owner = oppObj.Owner.Name;
                        }
                    }
                    
                    if ((component.get("v.loggedInUserRoleName") == 'CRM Administrator') || (component.get("v.loggedInUserRoleName") == 'CM CSAD')) {
                        $A.util.removeClass(component.find("hideEntireFilter"), "slds-hide");
                        $A.util.removeClass(component.find("hideVPCRFilter"), "slds-hide");
                    }
                    else if (component.get("v.loggedInUserRoleName") == 'CM VPCR/RVP') {
                        $A.util.removeClass(component.find("hideEntireFilter"), "slds-hide");
                    } else if (component.get("v.loggedInUserRoleName") == 'CM SCE' || component.get("v.loggedInUserRoleName") == 'Surest CM SCE' || component.get("v.loggedInUserRoleName") == 'Surest CM SVP' || component.get("v.loggedInUserRoleName") == 'Specialty Benefits SCE') {
                        $A.util.addClass(component.find("articleClass"), "opportunity-tab--wrapper");
                    }
                    component.set('v.WorkItemsDataArray', oppList);
                    //('oppList --> '+JSON.stringify(oppList));
                    $A.util.removeClass(component.find("dataProcessing"), "slds-hide");
                    $A.util.addClass(component.find("tableSpinner"), "slds-hide");
                }
                else {
                    component.set("v.WorkItemsEmptyList", true);
                    $A.util.removeClass(component.find("dataProcessing"), "slds-hide");
                    $A.util.addClass(component.find("tableSpinner"), "slds-hide");
                }
                
            } else if (state === "ERROR") {
                this.showErrorMessage(response.getError());
            }
            component.set('v.isLoading', false);
            component.set('v.isDataLoaded', true);
            
            
        }));
        $A.enqueueAction(action);
    },
    
    getRefresh: function (component, event, columnName, sortFieldComp) {
        var action = component.get('c.getAccountsandOpportunities');
        action.setParams({
            "OnLoad": true,
            "OnFilter": false,
            "cmvcpfilter": '',
            "ownerfilter": '',
            "columnName": columnName,
            "sortType": 'ASC',
            'accId': component.get('v.recordId')
        });
        
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                this.processCommonLogic(component, event, response);
            } else if (state === "ERROR") {
                this.showErrorMessage(response.getError());
            }
            component.set('v.isLoading', false);
            component.set('v.isDataLoaded', true);
        }));
        $A.enqueueAction(action);
    },
    
    processCommonLogic: function (component, event, response) {
        let responseObj = response.getReturnValue();
        component.set('v.loggedInUserRoleName', responseObj.loggedInUserRoleName);
        let todayDate = new Date();
        component.set("v.excludeSpecialtyBenefitsSCESurvey", responseObj.getAMTList[0].Exclude_Specialty_Benefits_SCE_Survey__c);
       
        if (responseObj.clientSurveyDates) {
            for (let i = 0; i < responseObj.clientSurveyDates.length; i++) {
                var offset = new Date().getTimezoneOffset();
                let startDate = new Date(new Date(responseObj.clientSurveyDates[i].Start_Date__c).setUTCMinutes(offset));
                let endDate = new Date(new Date(responseObj.clientSurveyDates[i].End_Date__c).setUTCMinutes(offset));
                if (responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SVP' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VP' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VPCR/RVP' || responseObj.loggedInUserRoleName.UserRole.Name == 'Specialty Benefits SCE') {
                    if (responseObj.clientSurveyDates[i].DeveloperName == "SCE_Validation") {
                        //if (new Date(todayDate.toLocaleDateString()) >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) && new Date(todayDate.toLocaleDateString()) <= new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())) {
                        /*if ((new Date(todayDate).getFullYear()>=startDate.getFullYear() && 
                             new Date(todayDate).getMonth()>=startDate.getMonth() &&
                             new Date(todayDate).getDate()>=startDate.getDate()) && 
                            (new Date(todayDate).getFullYear()<=endDate.getFullYear() && 
                             new Date(todayDate).getMonth()<=endDate.getMonth() &&
                             new Date(todayDate).getDate()<=endDate.getDate()) 
                           ){//new Date(new Date(todayDate).toDateString()>= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) && new Date(new Date(todayDate).toDateString()) <= new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())) {
                            component.set('v.SCEValidationTime', true);
                            component.set('v.CMValidationTime', false);
                        }*/
                        if(new Date(new Date(todayDate).toDateString())>= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) && new Date(new Date(todayDate).toDateString()) <= new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())) {
                            component.set('v.SCEValidationTime', true);
                            component.set('v.CMValidationTime', false);
                        }
                    }
                }
                 if(responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator' ||
                        responseObj.loggedInUserRoleName.Position__c == 'Client Manager' ||
                        responseObj.loggedInUserRoleName.Position__c == 'Client Management Consultant' ||
                        responseObj.loggedInUserRoleName.Position__c == 'Client Director'){
                    
                    if (responseObj.clientSurveyDates[i].DeveloperName == "CM_Valiadation") {
                        if(new Date(new Date(todayDate).toDateString())>= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) && new Date(new Date(todayDate).toDateString()) <= new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())) {
                            component.set('v.SCEValidationTime', false);
                            component.set('v.CMValidationTime', true);
                        }
                    }
                }
                if (new Date(new Date(todayDate).toDateString()) >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) && new Date(new Date(todayDate).toDateString()) <= new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())) {
               /* if ((new Date(todayDate).getFullYear()>=startDate.getFullYear() && 
                     new Date(todayDate).getMonth()>=startDate.getMonth() &&
                     new Date(todayDate).getDate()>=startDate.getDate()) && 
                    (new Date(todayDate).getFullYear()<=endDate.getFullYear() && 
                     new Date(todayDate).getMonth()<=endDate.getMonth() &&
                     new Date(todayDate).getDate()<=endDate.getDate()) 
                   ){*/   
                    if (responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SVP' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VP' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VPCR/RVP' || responseObj.loggedInUserRoleName.UserRole.Name == 'Specialty Benefits SCE') {
                        if(responseObj.clientSurveyDates[i].Type__c=='SCE Time'){
                            component.set('v.displayMsgSCE',responseObj.clientSurveyDates[i].Message__c);
                            component.set('v.showMessage', true);
                        }
                    }
                    if(responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator' ||
                       responseObj.loggedInUserRoleName.Position__c == 'Client Manager' ||
                       responseObj.loggedInUserRoleName.Position__c == 'Client Management Consultant' ||
                       responseObj.loggedInUserRoleName.Position__c == 'Client Director'){
                        if(responseObj.clientSurveyDates[i].Type__c=='CSI Time'){
                            component.set('v.displayMsgCSI',responseObj.clientSurveyDates[i].Message__c);
                            component.set('v.showMessage', false);
                        }
                        
                    }
                }
                
            }
        }
        
        if (responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SVP' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VP' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VPCR/RVP' || responseObj.loggedInUserRoleName.UserRole.Name == 'Specialty Benefits SCE') {
            if (component.get('v.SCEValidationTime')) {
                component.set('v.styleColor','color:black');
                
                component.set('v.hasTabAccess', true);
                component.set('v.hasCPaccess', true);
                component.set('v.isSce', true);
                component.set('v.hasEditAccess', true); //SAMARTH
                component.set('v.hasEditAccessAdminOrSCE', true);
                if (responseObj.loggedInUserRoleName.UserRole.Name == 'CM SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'Surest CM SVP' || responseObj.loggedInUserRoleName.UserRole.Name == 'Specialty Benefits SCE' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VPCR/RVP' || responseObj.loggedInUserRoleName.UserRole.Name == 'CM VP') {
                    component.set('v.sce', true);
                }
                if (responseObj.loggedInUserRoleName.UserRole.Name == 'CM VPCR/RVP') {
                    component.set('v.vpcrrvp', true);
                }
            }
            else {
                component.set('v.styleColor','color:red');
                //component.set('v.showMessage', true);//SAMARTH
            }
            //component.set('v.hasEditAccess',true); COMMENTED BY SAMARTH
        }
        
        if (responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator' ||
            responseObj.loggedInUserRoleName.Position__c == 'Client Manager' ||
            responseObj.loggedInUserRoleName.Position__c == 'Client Management Consultant' ||
            responseObj.loggedInUserRoleName.Position__c == 'Client Director') {

            if (component.get('v.CMValidationTime')) {    
                component.set('v.styleColor','color:black');
                component.set('v.hasTabAccess', true);
                component.set('v.hasCPaccess', false);
                component.set('v.cmcmc', true);
                component.set('v.hasEditAccess', true);
                component.set('v.hasEditAccessAdminOrSCE', false);
                
                if (responseObj.loggedInUserRoleName.UserRole.Name == 'CRM Administrator') {
                    component.set('v.CMCMCADMIN', true);
                    component.set('v.cmcmc', false);
                    component.set('v.hasEditAccessAdminOrSCE', true);//SAMARTH
                }  
            }
            else {
                if (!component.get('v.SCEValidationTime')) 
                  
                component.set('v.styleColor','color:red');
                //component.set('v.showMessage', false);//SAMARTH
            }
        }
            
            
        
        //-------------------------------------SAMARTH-------------------------------------
        /*if(!component.get('v.SCEValidationTime') && !component.get('v.CMValidationTime')){
            component.set('v.hasEditAccess',false);
            component.set('v.showMessage',true);
        }*/
        /*else if(component.get('v.SCEValidationTime') || component.get('v.CMValidationTime')){
            component.set('v.hasEditAccess',true);
        }*/
        //-------------------------------------SAMARTH-------------------------------------
        
        
        component.set('v.surveyContactsList', responseObj.getContacts);
        component.set('v.surveyAMTList', responseObj.getAMTList[0].Service_AMT__r);
        component.set('v.cpList', responseObj.getCurrentProduct);
        
        if (responseObj.getAMTList[0].CM_CMC_Validation_By__r != undefined) {
            component.set('v.CM_CMC_Validation_By__c', responseObj.getAMTList[0].CM_CMC_Validation_By__r.Name);
        }
        if (responseObj.getAMTList[0].CM_CMC_Validation_DateTime__c != undefined && responseObj.getAMTList[0].CM_CMC_Validation_DateTime__c != null) {
            component.set('v.CM_CMC_Validation_DateTime__c', responseObj.getAMTList[0].CM_CMC_Validation_DateTime__c);
        }
        if (responseObj.getAMTList[0].SCE_Validation_By__r != undefined) {
            component.set('v.SCE_Validation_By__c', responseObj.getAMTList[0].SCE_Validation_By__r.Name);
        }
        if (responseObj.getAMTList[0].SCE_Validation_DateTime__c != undefined && responseObj.getAMTList[0].SCE_Validation_DateTime__c != null) {
            component.set('v.SCE_Validation_DateTime__c', responseObj.getAMTList[0].SCE_Validation_DateTime__c);
        }
        component.set('v.UMR_Client_Platform', responseObj.getAMTList[0].UMR_Client_Platform__c);
        
        if (responseObj.getAMTList[0].CM_SCE__r != undefined) {
            component.set('v.cmsceId', responseObj.getAMTList[0].CM_SCE__c);
            component.set('v.cmsceFirstName', responseObj.getAMTList[0].CM_SCE__r.FirstName);
            component.set('v.cmsceLastName', responseObj.getAMTList[0].CM_SCE__r.LastName);
        }
        
        if (responseObj.getAMTList[0].Specialty_SCE__c != undefined) {
            component.set('v.specialitySCE', responseObj.getAMTList[0].Specialty_SCE__r.Name);
        }
        
        component.set('v.enableClientNPSSurvey', true);
        /*Removed Client Survey Tab visibility from Client Subsidiary Record Type as per Case No :00003464 *******SHRUTI*******/
        //if(responseObj.getAMTList[0].RecordType.Name =="Existing Client" || responseObj.getAMTList[0].RecordType.Name =="Client Subsidiary"){
        if (responseObj.getAMTList[0].RecordType.Name == "Existing Client" || responseObj.getAMTList[0].RecordType.Name =="Client Subsidiary") {
            component.set('v.isVisible', true);
        } else {
            component.set('v.isVisible', false);
        }
        
        component.set('v.dueDate', responseObj.customSettingEndDate);
        component.set('v.softDate', responseObj.customSettingSoftDueDate);
        if (responseObj.clientSurveyCustomPermission) {
            component.set('v.hasTabAccess', true);
            component.set('v.hasEditAccess', true);
            component.set('v.clientSurveyCustomPermission', true)
        }
    },
    
    getFormattedDate: function (today) {
        var dateV = today.split('T');
        var dateVTime = dateV[1].split(':');
        var timeStamp = '';
        if (parseInt(dateVTime[0]) > 12) {
            timeStamp = parseInt(dateVTime[0]) - 12 + ':' + dateVTime[1] + ' PM';
        } 
        else if (parseInt(dateVTime[0]) == 12)
            timeStamp = parseInt(dateVTime[0]) + ':' + dateVTime[1] + ' PM';
            else if (parseInt(dateVTime[0]) == 0)
                timeStamp = '12' + ':' + dateVTime[1] + ' AM';
                else
                    timeStamp = parseInt(dateVTime[0]) + ':' + dateVTime[1] + ' AM';
        var dDate = new Date(dateV[0]);
        var dd = dDate.getDate();
        var mm = dDate.getMonth() + 1;
        var yyyy = dDate.getFullYear();
        return mm + '/' + dd + '/' + yyyy + ' ' + timeStamp + ' EST';
    },
    
    updateopp: function (component, event) {
        var updateOppList = component.get("v.saveUpdatedWorkItemList");
        var updateOppRecods = component.get('c.updateOppRecods');
        updateOppRecods.setParams({
            "opplist": updateOppList,
        });
        updateOppRecods.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            var isUpdated;
            
            if (state === "SUCCESS") {
                
                isUpdated = response.getReturnValue();
                if (isUpdated) {
                    component.set("v.saveUpdatedWorkItemList", []);
                }
                
            } else if (state === "ERROR") {
                var errors = response.getError();
                this.showErrorMessage(errors);
            }
            
        }));
        $A.enqueueAction(updateOppRecods);
    },
    
    getFilteredData: function (component, event, columnName, sortFieldComp) {
        $A.util.removeClass(component.find("tableSpinner"), "slds-hide");
        var toBeExecuted = true;
        var selectedVPCRRVPVal = component.find("VPCRRVPsDropDown").get("v.value");
        var selectedSCEVal = component.find("SCEsDropDown").get("v.value");
        
        var vpcrRvpFilter = '';
        var sceFilter = '';
        
        if (selectedVPCRRVPVal != undefined && selectedVPCRRVPVal != null && selectedVPCRRVPVal != '') {
            if (selectedVPCRRVPVal.indexOf('All') >= 0) {
                vpcrRvpFilter = 'All';
            } else {
                vpcrRvpFilter = selectedVPCRRVPVal;
            }
        }
        
        if (selectedSCEVal != undefined && selectedSCEVal != null && selectedSCEVal != '') {
            if (selectedSCEVal.indexOf('All') >= 0) {
                sceFilter = 'All';
            } else {
                sceFilter = selectedSCEVal;
            }
        }
        if (component.get("v.loggedInUserRoleName") === 'CM VPCR/RVP') {
            vpcrRvpFilter = '';
        }
        if (toBeExecuted) {
            var action = component.get('c.getAccountsandOpportunities');
            if (component.get("v." + sortFieldComp) === true) {
                action.setParams({
                    "OnLoad": false,
                    "OnFilter": true,
                    "cmvcpfilter": vpcrRvpFilter,
                    "ownerfilter": sceFilter,
                    "columnName": columnName,
                    "sortType": 'DESC'
                });
                component.set("v.sortedType", 'DESC');
                component.set("v.sortedColumn", columnName);
                component.set("v." + sortFieldComp, false);
            } else {
                action.setParams({
                    "OnLoad": false,
                    "OnFilter": true,
                    "cmvcpfilter": vpcrRvpFilter,
                    "ownerfilter": sceFilter,
                    "columnName": columnName,
                    "sortType": 'ASC'
                });
                component.set("v.sortedType", 'ASC');
                component.set("v.sortedColumn", columnName);
                component.set("v." + sortFieldComp, true);
            }
            
            action.setCallback(this, $A.getCallback(function (response) {
                
                var state = response.getState();
                if (state != undefined && state != null && state == "SUCCESS") {
                    var responseObj = response.getReturnValue();
                    component.set('v.loggedInUserRoleName', responseObj.loggedInUserRoleName);
                    
                    var oppList = responseObj.cmSceOppList;
                    if (oppList != undefined && oppList != null && oppList.length > 0) {
                        for (var i = 0; i < oppList.length; i++) {
                            var oppObj = oppList[i];
                            if (oppObj.Account) {
                                oppObj.AccountName = oppObj.Account.Name;
                            }
                            if (oppObj.CM_VPCR_RVP__r) {
                                oppObj.CM_VPCR_RVP = oppObj.CM_VPCR_RVP__r.Name;
                            }
                            if (oppObj.Owner) {
                                oppObj.Owner = oppObj.Owner.Name;
                            }
                        }
                        component.set('v.WorkItemsDataArray', oppList);
                        $A.util.removeClass(component.find("dataProcessing"), "slds-hide");
                        $A.util.addClass(component.find("tableSpinner"), "slds-hide");
                    }
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    this.showErrorMessage(errors);
                }
            }));
            $A.enqueueAction(action);
        }
    },
    
    updateSCEDropDownList: function (component, event) {
        var selVPCRVal;
        if (component.find('VPCRRVPsDropDown') != undefined) {
            selVPCRVal = component.find('VPCRRVPsDropDown').get('v.value');
        }
        if (selVPCRVal != undefined && selVPCRVal != null) {
            if (selVPCRVal == 'All RVP\'s/VPCR\'s') {
                var defaultSCEs = component.get("v.allSCEsDefaultArray");
                var allSCEsList = [];
                for (i = 0; i < defaultSCEs.length; i++) {
                    defaultSCEs[i].selected = false;
                    allSCEsList.push({ label: defaultSCEs[i].label, value: defaultSCEs[i].value });
                }
                allSCEsList = (allSCEsList != undefined && allSCEsList != null) ? allSCEsList : [];
                component.find('SCEsDropDown').set("v.options", allSCEsList);
            } else {
                if (component.get('v.vpcrSceOwnerMap') != undefined && component.get('v.vpcrSceOwnerMap') != null) {
                    var sceOwnersArray = [];
                    var sceValues = component.get('v.vpcrSceOwnerMap.' + selVPCRVal);
                    if (sceValues != undefined && sceValues != null && sceValues.length > 0) {
                        sceOwnersArray.push({ label: 'All SCE\'s', value: 'All SCE\'s' });
                        for (var i = 0; i < sceValues.length; i++) {
                            sceOwnersArray.push({ label: sceValues[i], value: sceValues[i] });
                        }
                        component.find('SCEsDropDown').set("v.options", sceOwnersArray);
                    }
                }
            }
        }
    },
    
    getSurveyRecordsHelper: function (component, event, helper) {
        var tab = event.getSource();
        console.log('Work items second tab called ');
        if (tab.get('v.id') == 'ClientSurveyContactsValidation') {
            
            var action = component.get('c.getContactRecords');
            action.setParams({});
            action.setCallback(this, $A.getCallback(function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var responseObj = response.getReturnValue();
                    
                    component.set('v.surveyContactsList', responseObj);
                    component.set('v.enableClientNPSSurvey', true);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    this.showErrorMessage(errors);
                }
            }));
            $A.enqueueAction(action);
            
        }
    },
    
    CMCMCValidation: function (component, event) {
        let contactLst = component.get("v.surveyContactsList");
        let proceedWithoutSurveyContact = component.get("v.proceedWithoutSurveyContact");
        let surveyList;
        let isSurveyContactExists = false;
        
        if (!proceedWithoutSurveyContact) {
            contactLst.forEach(element => {
                if (element.CSI_Survey_Contact__c) {
                isSurveyContactExists = true
            }
                               });
        }
        
        if (!isSurveyContactExists && !proceedWithoutSurveyContact) {
            component.set("v.showNoSurveyContactDialog", true);
            return;
        }
        
        component.set('v.isLoading', true);
        var action = component.get('c.fetchServiceAMT');
        action.setParams({ 'accId': component.get('v.recordId') });
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                surveyList = response.getReturnValue();
                
                console.log('surveyList Value inside If >>>> ' + JSON.stringify(surveyList));
                
                var mapOfValues = {};
                
                for (var i = 0; i < surveyList.length; i++) {
                    var role = surveyList[i].Contact_Role__c;
                    var primaryValue = surveyList[i].Primary__c;
                    if (mapOfValues[role]) {
                        mapOfValues[role].push(primaryValue);
                    } else {
                        mapOfValues[role] = [primaryValue];
                    }
                    console.log('Satisfied cond--->' + mapOfValues[role].every(value => value === false));
                }
                if (Object.keys(mapOfValues).some(key => mapOfValues[key].length > 1 && mapOfValues[key].every(value => value === false))) {
                    component.set('v.isLoading', false);
                    const sameRole = Object.keys(mapOfValues).filter(key => mapOfValues[key].length > 1 && mapOfValues[key].every(value => value === false));
                    const sameroleWithSpace = sameRole.join(', ');
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'There are two or more members with same role (' + (sameroleWithSpace) + '), please flag one AMT member as a main for this role.',
                        duration: '10000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'dismissible'
                    });
                    toastEvent.fire();
                    return false;
                }               
                else {
                    component.set('v.isLoading', true);
                    var action = component.get('c.saveCMCValidation');
                    action.setParams({ 'accId': component.get('v.recordId') });
                    action.setCallback(this, $A.getCallback(function (response) {
                        var state = response.getState();
                        if (state === "SUCCESS") {
                            var responseObj = response.getReturnValue();
                            component.set('v.CM_CMC_Validation_By__c', responseObj.userName);
                            component.set('v.CM_CMC_Validation_DateTime__c', responseObj.validatedDate);
                            component.set('v.isLoading', false);
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "title": "Success!",
                                "message": "The record has been validated successfully.",
                                variant: 'success'
                            });
                            toastEvent.fire();
                        } else if (state === "ERROR") {
                            var errors = response.getError();
                            this.showErrorMessage(errors);
                        }
                    }));
                    $A.enqueueAction(action);
                }
            }
        }));
        $A.enqueueAction(action);
    },
    
    SCEValidation: function (component, event) {
        let proceedWithoutPrimaryContact = component.get("v.proceedWithoutPrimaryContact");
        let contactLst = component.get("v.surveyContactsList");
        
        let isPrimayExists = false;
        let isInvalidContactExists = false;
        
        contactLst.forEach(element =>{
            if (element.Correspondence_Type__c.includes('Customer Survey - Primary')) {
            isPrimayExists = true
        }
                           if (!element.Correspondence_Type__c || !element.Survey_Type__c || !element.Email) {
            isInvalidContactExists = true;
        }
    });
        if(isInvalidContactExists){
            component.set('v.showInvalidContactPopup', true);
            return;
        }
        
        if (!this.validateCurrentProd(component)) {
            return;
        }
        
        
        if (!isPrimayExists && !proceedWithoutPrimaryContact) {
            component.set('v.noPrimaryContact', true);
            return;
        }
        
        
        let surveyList;
        
        component.set('v.isLoading', true);
        var action = component.get('c.fetchServiceAMT');
        action.setParams({ 'accId': component.get('v.recordId') });
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                surveyList = response.getReturnValue();
                
                console.log('surveyList Value inside If >>>> ' + JSON.stringify(surveyList));
                
                var mapOfValues = {};
                
                for (var i = 0; i < surveyList.length; i++) {
                    var role = surveyList[i].Contact_Role__c;
                    var primaryValue = surveyList[i].Primary__c;
                    if (mapOfValues[role]) {
                        mapOfValues[role].push(primaryValue);
                    } else {
                        mapOfValues[role] = [primaryValue];
                    }
                    console.log('Satisfied cond--->' + mapOfValues[role].every(value => value === false));
                }
                if (Object.keys(mapOfValues).some(key => mapOfValues[key].length > 1 && mapOfValues[key].every(value => value === false))) {
                    component.set('v.isLoading', false);
                    const sameRole = Object.keys(mapOfValues).filter(key => mapOfValues[key].length > 1 && mapOfValues[key].every(value => value === false));
                    const sameroleWithSpace = sameRole.join(', ');
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'There are two or more members with same role (' + (sameroleWithSpace) + '), please flag one AMT member as a main for this role.',
                        duration: '10000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'dismissible'
                    });
                    toastEvent.fire();
                    return false;
                }
                else {
                    component.set('v.isLoading', true);
                    var action = component.get('c.saveSCEValidation');
                    action.setParams({ 'accId': component.get('v.recordId') });
                    action.setCallback(this, $A.getCallback(function (response) {
                        var state = response.getState();
                        if (state === "SUCCESS") {
                            var responseObj = response.getReturnValue();
                            component.set('v.SCE_Validation_By__c', responseObj.userName);
                            component.set('v.SCE_Validation_DateTime__c', responseObj.validatedDate);
                            component.set('v.isLoading', false);
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "title": "Success!",
                                "message": "The record has been validated successfully.",
                                variant: 'success'
                            });
                            toastEvent.fire();
                        } else if (state === "ERROR") {
                            var errors = response.getError();
                            this.showErrorMessage(errors);
                        }
                    }));
                    $A.enqueueAction(action);
                }
            }
        }));
        $A.enqueueAction(action);
    },
    
    validateCurrentProd: function (component) {
        return component.find('currentProductCmp').validateOnSCEValidation();
    },
    
    showErrorMessage: function (errors) {
        console.log(errors);
        let toastParams = {
            title: "Error",
            message: "Error",
            type: "error"
        };
        let message = '';
        if (errors && Array.isArray(errors) && errors.length > 0) {
            for (let i = 0; i < errors.length; i++) {
                message = message + 'Error' + i + ':' + errors[i].message;
            }
            toastParams.message = message;
        }
        
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams(toastParams);
        toastEvent.fire();
        
    }
    
    
})