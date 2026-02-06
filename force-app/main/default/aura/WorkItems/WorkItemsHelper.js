/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Spoorthy
**/
({
    getData : function(component, event, columnName, sortFieldComp) {
        $A.util.removeClass(component.find("tableSpinner"), "slds-hide");
        
        if(component.find("VPCRRVPsDropDown") != undefined) {
            var selectedVPCRRVPVal = component.find("VPCRRVPsDropDown").get("v.value");
        }
        
        var action = component.get('c.getAccountsandOpportunities');
        if( sortFieldComp && component.get("mv."+sortFieldComp) ===  true){
            action.setParams({"OnLoad" : true,
                              "OnFilter" : false,
                              "cmvcpfilter": '',
                              "ownerfilter": '',
                              "columnName" : columnName,
                              "sortType" : 'DESC' });    
            component.set("v."+sortFieldComp, false);
        }else{
            action.setParams({"OnLoad" : true,
                              "OnFilter" : false,
                              "cmvcpfilter": '',
                              "ownerfilter": '',
                              "columnName" : columnName,
                              "sortType" : 'ASC' });    
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this, $A.getCallback(function (response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseObj = response.getReturnValue(); 
                console.log(' responseObj.loggedInUserRoleName '+responseObj.loggedInUserRoleName);
                component.set('v.loggedInUserRoleName', responseObj.loggedInUserRoleName);
                //Logic to check & provide tab accessability..
                //component.set('v.hasTabAccess', false);
                if(responseObj.loggedInUserRoleName == 'CM SCE' || responseObj.loggedInUserRoleName == 'Surest CM SCE' || responseObj.loggedInUserRoleName == 'Surest CM SVP') {                    
                    component.set('v.hasTabAccess', true);
                } /*else if(responseObj.loggedInUserRoleName == 'Specialty Benefits SCE') {                    
                    component.set('v.hasTabAccess', false);  //access removed as per 3344 requirement.
                } */else if(responseObj.loggedInUserRoleName == 'CM VPCR/RVP') {                    
                    component.set('v.hasTabAccess', true);
                }else if(responseObj.loggedInUserRoleName == 'CD SVP' || responseObj.loggedInUserRoleName == 'Surest CD SVP') {   
                    component.set('v.isCDSVP', true);
                    component.set('v.hasTabAccess', false); // access added as per #3332 requirement.
                }else{
                     component.set('v.hasTabAccess', false);
                }
                component.set('v.surveyContactsList', responseObj.getContacts);
                component.set('v.enableClientNPSSurvey', true);
                
                component.set('v.dueDate',responseObj.customSettingEndDate);
                component.set('v.softDate',responseObj.customSettingSoftDueDate);
                if(responseObj.customSettingSoftDueDate != undefined) {
                    component.set('v.tabLabel','Client Survey Contact Identification – Due: '+responseObj.customSettingSoftDueDate);
                } else {
                    component.set('v.tabLabel','Client Survey Contact Identification – Due: ');
                }
                
                if(responseObj.isCustomTabVisible != null) {
                    component.set('v.isCustomTabVisible',responseObj.isCustomTabVisible);
                }
                component.set('v.isMATabVisible',true);
                
                var allCMVPCRRVPsList = responseObj.oppCMVPCRRVPSetWrap;                
                var allCMVPCRRVPsArray = [];
                allCMVPCRRVPsArray.push({label:'All RVP\'s/VPCR\'s', value:'All RVP\'s/VPCR\'s'});
                if(allCMVPCRRVPsList != undefined && allCMVPCRRVPsList != null && allCMVPCRRVPsList.length > 0) {
                    allCMVPCRRVPsList.sort();
                    for(var i=0;i<allCMVPCRRVPsList.length;i++) {
                        allCMVPCRRVPsArray.push({label:allCMVPCRRVPsList[i], value:allCMVPCRRVPsList[i]});
                    }
                }
                if(component.find('VPCRRVPsDropDown') != undefined) {
                    component.find('VPCRRVPsDropDown').set("v.options", allCMVPCRRVPsArray);
                }
                
                var allSCEsList = responseObj.oppOwnweSetWrap;
                var allSCEsArray = [];
                allSCEsArray.push({label:'All SCE\'s', value:'All SCE\'s'});
                if(allSCEsList != undefined && allSCEsList != null && allSCEsList.length > 0) {       
                    allSCEsList.sort();
                    for(var i=0;i<allSCEsList.length;i++) {
                        allSCEsArray.push({label:allSCEsList[i], value:allSCEsList[i]});
                    }
                }
                component.set("v.allSCEsDefaultArray", allSCEsArray);
                if(component.find('SCEsDropDown') != undefined) {
                    component.find('SCEsDropDown').set("v.options", allSCEsArray);
                }                
                
                if(responseObj.vpcrSCEMapWrap != undefined && responseObj.vpcrSCEMapWrap != null) {
                    component.set('v.vpcrSceOwnerMap', responseObj.vpcrSCEMapWrap);
                }
                
                var oppList = responseObj.cmSceOppList;
                if(oppList != undefined && oppList != null && oppList.length > 0) {
                    for (var i = 0; i < oppList.length; i++) {
                        var oppObj = oppList[i];
                        if (oppObj.Account){
                            oppObj.AccountName = oppObj.Account.Name;
                        }
                        if (oppObj.CM_VPCR_RVP__r){
                            oppObj.CM_VPCR_RVP = oppObj.CM_VPCR_RVP__r.Name; 
                        }
                        if (oppObj.Owner){
                            oppObj.Owner = oppObj.Owner.Name; 
                        }
                    }
                    
                    if((component.get("v.loggedInUserRoleName") == 'CRM Administrator') || (component.get("v.loggedInUserRoleName") == 'CM CSAD')){
                        $A.util.removeClass(component.find("hideEntireFilter"), "slds-hide");
                        $A.util.removeClass(component.find("hideVPCRFilter"), "slds-hide");
                    } 
                    else if(component.get("v.loggedInUserRoleName") == 'CM VPCR/RVP'){
                        $A.util.removeClass(component.find("hideEntireFilter"), "slds-hide");
                    } else if(component.get("v.loggedInUserRoleName") == 'CM SCE' || component.get("v.loggedInUserRoleName") == 'Surest CM SCE' || component.get("v.loggedInUserRoleName") == 'Surest CM SVP' || component.get("v.loggedInUserRoleName") == 'Specialty Benefits SCE'){
                        $A.util.addClass(component.find("articleClass"), "opportunity-tab--wrapper");
                    }
                    component.set('v.WorkItemsDataArray', oppList);
                    //('oppList --> '+JSON.stringify(oppList));
                    $A.util.removeClass(component.find("dataProcessing"), "slds-hide");
                    $A.util.addClass(component.find("tableSpinner"), "slds-hide");
                }
                else{
                    component.set("v.WorkItemsEmptyList",true);
                    $A.util.removeClass(component.find("dataProcessing"), "slds-hide");
                    $A.util.addClass(component.find("tableSpinner"), "slds-hide");
                }
                
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
            }
        }));
        $A.enqueueAction(action);
    },
    
    updateopp : function(component,event) {
        
        var updateOppList = component.get("v.saveUpdatedWorkItemList");
        var updateOppRecods = component.get('c.updateOppRecods');
        updateOppRecods.setParams({
            "opplist" : updateOppList,
        });
        updateOppRecods.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            var isUpdated;
            
            if (state === "SUCCESS") {
                
                isUpdated = response.getReturnValue();
                if(isUpdated){ 
                    component.set("v.saveUpdatedWorkItemList", []);
                }
                
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type": "error",
                    "message":errors
                });
                toastEvent.fire();
            }
            
        }));
        $A.enqueueAction(updateOppRecods);
    },
    
    getFilteredData :function(component, event, columnName, sortFieldComp) {
        
        $A.util.removeClass(component.find("tableSpinner"), "slds-hide"); 
        var toBeExecuted = true;
        var selectedVPCRRVPVal = component.find("VPCRRVPsDropDown").get("v.value");
        var selectedSCEVal = component.find("SCEsDropDown").get("v.value");
        
        var vpcrRvpFilter = '';
        var sceFilter = '';
        
        if(selectedVPCRRVPVal != undefined && selectedVPCRRVPVal != null && selectedVPCRRVPVal != '') { 
            if(selectedVPCRRVPVal.indexOf('All') >= 0) {
                vpcrRvpFilter = 'All';
            } else {
                vpcrRvpFilter = selectedVPCRRVPVal;
            }
        }
        
        if(selectedSCEVal != undefined && selectedSCEVal != null && selectedSCEVal != '') { 
            if(selectedSCEVal.indexOf('All') >= 0) {
                sceFilter = 'All';
            } else {
                sceFilter = selectedSCEVal;
            }
        }
        if(component.get("v.loggedInUserRoleName") === 'CM VPCR/RVP'){
            vpcrRvpFilter = '';
        }
        if(toBeExecuted) {
            var action = component.get('c.getAccountsandOpportunities');
            if(component.get("v."+sortFieldComp) ===  true){
                action.setParams({"OnLoad" : false,
                                  "OnFilter" : true,
                                  "cmvcpfilter" : vpcrRvpFilter,
                                  "ownerfilter" : sceFilter,
                                  "columnName" : columnName,
                                  "sortType" : 'DESC'    
                                 });    
                component.set("v.sortedType", 'DESC');
                component.set("v.sortedColumn", columnName);
                component.set("v."+sortFieldComp, false);
            }else{
                action.setParams({"OnLoad" : false,
                                  "OnFilter" : true,
                                  "cmvcpfilter" : vpcrRvpFilter,
                                  "ownerfilter" : sceFilter,
                                  "columnName" : columnName,
                                  "sortType" : 'ASC'    
                                 });    
                component.set("v.sortedType", 'ASC');
                component.set("v.sortedColumn", columnName);
                component.set("v."+sortFieldComp, true);
            }
            
            action.setCallback(this, $A.getCallback(function (response) {
                
                var state = response.getState();
                if (state != undefined && state != null && state == "SUCCESS") {
                    var responseObj = response.getReturnValue();
                    component.set('v.loggedInUserRoleName', responseObj.loggedInUserRoleName);
                    
                    var oppList = responseObj.cmSceOppList;
                    if(oppList != undefined && oppList != null && oppList.length > 0) {
                        for (var i = 0; i < oppList.length; i++) {
                            var oppObj = oppList[i];
                            if (oppObj.Account){
                                oppObj.AccountName = oppObj.Account.Name;
                            }
                            if (oppObj.CM_VPCR_RVP__r){
                                oppObj.CM_VPCR_RVP = oppObj.CM_VPCR_RVP__r.Name; 
                            }
                            if (oppObj.Owner){
                                oppObj.Owner = oppObj.Owner.Name; 
                            }
                        }
                        component.set('v.WorkItemsDataArray', oppList);
                        $A.util.removeClass(component.find("dataProcessing"), "slds-hide");
                        $A.util.addClass(component.find("tableSpinner"), "slds-hide");
                    }
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    console.error(errors);
                }
            }));
            $A.enqueueAction(action);
        }
    },
    
    updateSCEDropDownList : function(component, event) {
        var selVPCRVal;
        if(component.find('VPCRRVPsDropDown') != undefined) {
         	selVPCRVal = component.find('VPCRRVPsDropDown').get('v.value');   
        }         
        if(selVPCRVal != undefined && selVPCRVal != null) {
            if(selVPCRVal == 'All RVP\'s/VPCR\'s') {
                var defaultSCEs = component.get("v.allSCEsDefaultArray");
                var allSCEsList = [] ;                
                for(i=0; i<defaultSCEs.length; i++){
                   defaultSCEs[i].selected = false;
                   allSCEsList.push({label:defaultSCEs[i].label, value:defaultSCEs[i].value});                                      
                }
                allSCEsList = (allSCEsList != undefined && allSCEsList != null) ? allSCEsList : [];
                component.find('SCEsDropDown').set("v.options", allSCEsList);
            } else {
                if(component.get('v.vpcrSceOwnerMap') != undefined && component.get('v.vpcrSceOwnerMap') != null) {
                    var sceOwnersArray = [];
                    var sceValues = component.get('v.vpcrSceOwnerMap.'+selVPCRVal);
                    if(sceValues != undefined && sceValues != null && sceValues.length > 0) {
                        sceOwnersArray.push({label:'All SCE\'s', value:'All SCE\'s'});
                        for(var i=0;i<sceValues.length;i++) {
                            sceOwnersArray.push({label:sceValues[i], value:sceValues[i]});
                        }
                        component.find('SCEsDropDown').set("v.options", sceOwnersArray);
                    }            
                }
            }
        }
    },
    
    getSurveyRecordsHelper : function(component, event, helper) {
        var tab = event.getSource();
        console.log('Work items second tab called ');
        if( tab.get('v.id') == 'ClientSurveyContactsValidation') {
            //Call apex method to fetch records....!!!
            var action = component.get('c.getContactRecords');
            action.setParams({});  
            action.setCallback(this, $A.getCallback(function (response){
                var state = response.getState();
                if (state === "SUCCESS") {
                    var responseObj = response.getReturnValue();
                    console.log('responseOj '+JSON.stringify(responseObj[0]));
                    component.set('v.surveyContactsList', responseObj);
                    component.set('v.enableClientNPSSurvey', true);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    console.error(errors);
                } 
            }));
            $A.enqueueAction(action);
            
        }
    }
    
})