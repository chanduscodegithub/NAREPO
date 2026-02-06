/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 03-06-2024
 * @last modified by  : Spoorthy
**/
({
    getUserInfo1 : function(component, event) { 
    	
        var action = component.get("c.getLoggedInUerRoleInfo");
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state === "SUCCESS") {
                var userInfoMap=response.getReturnValue();
                if(userInfoMap!=undefined || userInfoMap!= null || userInfoMap!= '' )
                {
                    if(userInfoMap["isLoggedInUserAnAdmin"]!=undefined && 
                      userInfoMap["isLoggedInUserAnAdmin"]!='' && userInfoMap["isLoggedInUserAnAdmin"]!=null){
                        var isLoggedInUserAnAdmin=false;
                        if(userInfoMap["isLoggedInUserAnAdmin"]=='true'){
                            isLoggedInUserAnAdmin=true;
                        }
                        if(userInfoMap["isLoggedInUserAnAdmin"]=='false'){
                            isLoggedInUserAnAdmin=false;
                        }
                        
                        component.set("v.isLoggedInUserAnAdmin",isLoggedInUserAnAdmin);
                    }
                     
                     component.set("v.loggedInUserName", userInfoMap["loggedInUserName"]);   
                    component.set("v.loggedInUserTimeZone",userInfoMap["loggedInUserTimeZone"]);
                    component.set("v.loggedInUserProfile",userInfoMap["loggedInUserProfile"]);

                }
                
               
                
                
                
            }
            else if( state === "ERROR") {
                
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    getUserInfo : function(component, event) { 
    	
        var action = component.get("c.getLoggedInUserInfo");
        action.setParams({
            accountId : component.get('v.recordId'),         
        });
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state === "SUCCESS") {
                var loggedInUserInfo=response.getReturnValue();
                
                if(this.isMapEmpty(loggedInUserInfo)){
                    loggedInUserInfo=undefined;
                }
                
                component.set("v.loggedInUserInfoObj",loggedInUserInfo);
               
                
                
                
            }
            else if( state === "ERROR") {
                
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    //-----------------------SAMARTH - for getting data before save-----------------------
    getDataBeforeSave : function(component,event,helper){
        //alert('Coming Inside getDataBeforeSave');
        var action = component.get("c.getRenewalStatus");
        action.setParams({
            accountId : component.get('v.recordId'),
            year:component.get('v.salesCycle'),
            isLoggedInUserAnAdmin:component.get('v.isLoggedInUserAnAdmin')           
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(response.getState() === "SUCCESS") {
                var salesIncentivesObj = response.getReturnValue(); 
             	var rsDataOnLoad = salesIncentivesObj.renewalStatusList;
                var rsDataBeforeSave = [...rsDataOnLoad];
                component.set("v.renewalDataBeforeSave",rsDataBeforeSave);
            } 
            else if( response .getState() === "ERROR") {
                alert('Error :'+response.getError()[0].message);
            }
        });
        $A.enqueueAction(action);
    },
    //-----------------------SAMARTH - for getting data before save-----------------------
    
    getRenewalStatus : function(component, event) {
        
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var action = component.get("c.getRenewalStatus");
        action.setParams({
            accountId : component.get('v.recordId'),
            //accountId : '001g00000220DApAAM',
            //year:'',
            year:component.get('v.salesCycle'),
            isLoggedInUserAnAdmin:component.get('v.isLoggedInUserAnAdmin')           
        });
        action.setCallback(this, function(response){
            
            var state = response.getState();
            if(response.getState() === "SUCCESS") {
                
                var salesIncentivesObj = response.getReturnValue();
                
                var sbSCEData = salesIncentivesObj.specialityBenefitMap; //SAMARTH
                component.set("v.sbSCEData",sbSCEData);//SAMARTH
                
                //component.set("v.renewalStatusList", salesIncentivesObj.renewalStatusList);
                component.set("v.picklistFieldsMapData", salesIncentivesObj.picklistFieldsMap); 
                //component.set("v.fieldSetMap", salesIncentivesObj.FieldSetMap);
                var fieldSetMap={};
                var accountKeyRenewalDateFieldNames = $A.get("$Label.c.Account_KeyRenewalDate_Field_Names").split(','); 
                
                for(var echFldStIndx in accountKeyRenewalDateFieldNames)
                {
                    fieldSetMap[accountKeyRenewalDateFieldNames[echFldStIndx]]=salesIncentivesObj.FieldSetMap[accountKeyRenewalDateFieldNames[echFldStIndx]];
                }
                
                component.set("v.fieldSetMap", fieldSetMap);
                console.log('fieldSetMap>>'+JSON.stringify(fieldSetMap));
                
                
                var salesCyclePickListValues=[];
                for(var m=0;m<salesIncentivesObj.picklistFieldsMap["Sales_Cycle__c"].length;m++)
                 {
                     salesCyclePickListValues.push(salesIncentivesObj.picklistFieldsMap["Sales_Cycle__c"][m]);
                 }
				component.set("v.salesCyclePickListValues",salesCyclePickListValues);
                
                component.set("v.renewalConfirmedPicklistValueMap",
                              salesIncentivesObj.renewalConfirmedPicklistBasedOnPdtTypeMap);
                
                
                var renewalStatusListOfTwoYear=component.get("v.renewalStatusListOfTwoYear");
                renewalStatusListOfTwoYear=[];
                
               /* var renewalStatusMap=salesIncentivesObj.renewalStatusMap;
                
                var yearList=['2019','2018'];
                
                for(var i in yearList)
                {
                    
                    renewalStatusListOfTwoYear.push(renewalStatusMap[yearList[i]]); 
                } */
                
                
                var eachYearRenewalStatusList=component.get("v.eachYearRenewalStatusList");
                eachYearRenewalStatusList=[];
                
                /*var sortOrder=['Medical','Pharmacy','Dental','Vision','Financial Protection'
                               ,'Stop Loss','Financial Accounts','Group Retiree (URS)'];*/
                var renewalStatusProductTypesDisplayOrder=$A.get("$Label.c.RenewalStatus_ProductTypes_DisplayOrder");
                var sortOrder=renewalStatusProductTypesDisplayOrder.split(',');
                
                for(var j in salesIncentivesObj.EachYearSalesIncentiveDataList)
                {
                    var eachYearRenewalStatusDataObj=salesIncentivesObj.EachYearSalesIncentiveDataList[j];
                    
                   /* eachYearRenewalStatusDataObj.eachYearRenewalStatusList=this.sortRecords(eachYearRenewalStatusDataObj.eachYearRenewalStatusList
                                                                                            ,'Name',sortOrder)*/
                    eachYearRenewalStatusDataObj.eachYearRenewalStatusList=this.sortRecords(eachYearRenewalStatusDataObj.eachYearRenewalStatusList
                                                                                            ,'Product_Line__c',sortOrder)
                    eachYearRenewalStatusList.push(eachYearRenewalStatusDataObj);
                    
                    if(eachYearRenewalStatusDataObj.eachYearRenewalStatusList.length==0)
                    {
                        eachYearRenewalStatusDataObj.isRenewalStatusListEmpty=true;
                    }
                    else
                    {
                         eachYearRenewalStatusDataObj.isRenewalStatusListEmpty=false;
                    }
                    
                }
                
                
                component.set("v.renewalStatusListOfTwoYear",renewalStatusListOfTwoYear);
                component.set("v.eachYearRenewalStatusList",eachYearRenewalStatusList);
                
                var renewalStatusRecordsTobeUpdatedMap=component.get("v.renewalStatusRecordsTobeUpdatedMap");
                renewalStatusRecordsTobeUpdatedMap={};
                component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
                component.set("v.productsConfirmedPicklistValueMap",
                              this.setPrdctsConfirmedPicklistValuesBasedOnPrdctType(component));
                
                
                //component.set("v.loggedInUserName",salesIncentivesObj.loggedInUserName);
                

                var accountKeyRenewalDateFieldNames1=['Current_Deal_Start_Date__c','Current_Deal_Next_Renewal_Date__c','Surest_Current_Deal_Start_Date__c','Surest_Next_Renewal_Date__c','Proposed_New_Deal_Start_Date__c','Proposed_New_Deal_End_Date__c','Surest_Med_Proposed_New_Deal_Start_Date__c','Surest_Med_Proposed_New_Deal_End_Date__c'];
                var accountKeyRenewalDateFieldNames2=['Pharmacy_Current_Deal_Next_Renewal_Date__c','Dental_Current_Deal_Next_Renewal_Date__c','Vision_Current_Deal_Next_Renewal_Date__c','APP_CI_HI_Current_Deal_Next_Renewal_Date__c'];
				var accountKeyRenewalDateFieldNames3=['Stop_Loss_Next_Renewal_Date__c','Financial_Accounts_Next_Renewal_Date__c','Group_Retiree_URS_Next_Renewal_Date__c'];
                component.set("v.accountKeyRenewalDateFieldNames1",accountKeyRenewalDateFieldNames1);
                component.set("v.accountKeyRenewalDateFieldNames2",accountKeyRenewalDateFieldNames2);
                component.set("v.accountKeyRenewalDateFieldNames3",accountKeyRenewalDateFieldNames3);
                
                
                
				
                var accountKeyRenewalDateFieldNamesLst=[];
                for(var j in accountKeyRenewalDateFieldNames)
                {
                    accountKeyRenewalDateFieldNamesLst.push("'"+accountKeyRenewalDateFieldNames[j]+"'");
                }
                component.set("v.accountKeyRenewalDateFieldNames",accountKeyRenewalDateFieldNamesLst);
                component.set("v.accountKeyRenewalDateFieldNamesStr",$A.get("$Label.c.Account_KeyRenewalDate_Field_Names"));
            
            } else if( response .getState() === "ERROR") {
                
                alert('Error :'+response.getError()[0].message);
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            
            
            
        });
        $A.enqueueAction(action);
    },
    
    updateRenewalStatusRecords : function (component, event, renewalStatusListTobeUpdated){
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show')
        
        var action = component.get("c.updateRenewalStatusRecords");
        action.setParams({
            renewalStatusRecordsTobeUpdated : renewalStatusListTobeUpdated,
            accountId:component.get('v.recordId'),
            year:''
            
        });
        action.setCallback(this, function(response){
            
            var state = response.getState();
            if(state === "SUCCESS") {
                
                var salesIncentiveValidationMainChildComp = component.find('salesIncentivesValidationCmpAuraId');
                
                for(var i=0;i<salesIncentiveValidationMainChildComp.length;i++) 
                {
                    var salesIncentivesChildComp = salesIncentiveValidationMainChildComp[i].find('renewalStatusAuraId');        
                    
                    for(var j=0;j<salesIncentivesChildComp.length;j++) 
                    {
                        salesIncentivesChildComp[j].set('v.isEdit', false);
                    } 
                    
                    
                }
                
                
                var salesIncentivesObj = response.getReturnValue();
                component.set("v.renewalStatusList", salesIncentivesObj.renewalStatusList);
                component.set("v.picklistFieldsMapData", salesIncentivesObj.picklistFieldsMap);
                
                var eachYearRenewalStatusList=component.get("v.eachYearRenewalStatusList");
                eachYearRenewalStatusList=[];
                
                var sortOrder=['Medical','Pharmacy','Dental','Vision','Financial Protection'
                               ,'Stop Loss','Financial Accounts','Retiree'];
                
                for(var j in salesIncentivesObj.EachYearSalesIncentiveDataList)
                {
                    var eachYearRenewalStatusDataObj=salesIncentivesObj.EachYearSalesIncentiveDataList[j];
                    
                    eachYearRenewalStatusDataObj.eachYearRenewalStatusList=this.sortRecords(eachYearRenewalStatusDataObj.eachYearRenewalStatusList
                                                                                            ,'Name',sortOrder)
                    eachYearRenewalStatusList.push(eachYearRenewalStatusDataObj); 
                }
                
                
                
                component.set("v.eachYearRenewalStatusList",eachYearRenewalStatusList);
                var renewalStatusRecordsTobeUpdatedMap=component.get("v.renewalStatusRecordsTobeUpdatedMap");
                renewalStatusRecordsTobeUpdatedMap={};
                component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
                component.set("v.productsConfirmedPicklistValueMap",
                              this.setPrdctsConfirmedPicklistValuesBasedOnPrdctType(component));
                
            } else if( state === "ERROR") {
                
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            
            component.find('editBtn').set("v.disabled", false);
            $A.util.addClass(component.find("saveBtn"), 'slds-hide');
            $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    
    sortRecords: function (renewalStatusListTobeSorted,sortBy,sortOrder)
    {
        var sortedrenewalStatusList=[];
        var renewalStatusRecordsMap={};
        for(var i in renewalStatusListTobeSorted)
        {
            renewalStatusRecordsMap[renewalStatusListTobeSorted[i][sortBy]]=renewalStatusListTobeSorted[i];
        } 
        for(var i in sortOrder)
        {
            if(renewalStatusRecordsMap.hasOwnProperty(sortOrder[i]))
            {
                
                sortedrenewalStatusList.push(renewalStatusRecordsMap[sortOrder[i]]);

            }
            
            
        }
        return sortedrenewalStatusList;        
    },
    
    setPrdctsConfirmedPicklistValuesBasedOnPrdctType: function(component)
    {
        var prdctsConfirmedBasedOnPdtTypeFinalMap={};
        var renewalStatusPdtTypes = $A.get("$Label.c.PdtsConfirmed_PdtTypes_ToBeEnabled");
        var renewalStatusPdtTypesList=[];
        if(renewalStatusPdtTypes!='' && renewalStatusPdtTypes!=undefined 
           && renewalStatusPdtTypes!=null)
        {
            if(renewalStatusPdtTypes.indexOf(',') !== -1)
            {
                renewalStatusPdtTypesList=renewalStatusPdtTypes.split(',');
            }
            else
            {
                renewalStatusPdtTypesList = renewalStatusPdtTypes;
            }  
        }
        var prdctsConfirmedByPdtType = $A.get("$Label.c.PdtsConfirmed_PicklistValues_BasedOnPdtType");
        var prdctsConfirmedByPdtTypeList=[];
        var prdctsConfirmedBasedOnPdtTypeMap={};
        if(prdctsConfirmedByPdtType!='' && prdctsConfirmedByPdtType!=undefined 
           && prdctsConfirmedByPdtType!=null)
        {
            if(prdctsConfirmedByPdtType.indexOf(';') !== -1)
            {
                prdctsConfirmedByPdtTypeList=prdctsConfirmedByPdtType.split(';');
            }
            else
            {
                prdctsConfirmedByPdtTypeList = prdctsConfirmedByPdtType;
            }
            
        }
        for(var i in prdctsConfirmedByPdtTypeList)
        {
            var eachPrdctTypeWithPrdctCnfrmdPicklistValues=prdctsConfirmedByPdtTypeList[i].split('=');
            prdctsConfirmedBasedOnPdtTypeMap[eachPrdctTypeWithPrdctCnfrmdPicklistValues[0]]=eachPrdctTypeWithPrdctCnfrmdPicklistValues[1];     
        }
        
        
        for(var j in renewalStatusPdtTypesList)
        {
            if(!this.isMapEmpty(prdctsConfirmedBasedOnPdtTypeMap) && prdctsConfirmedBasedOnPdtTypeMap.hasOwnProperty(renewalStatusPdtTypesList[j]))
            {
                var productCnfrmdPicklistValues=[];
                if(prdctsConfirmedBasedOnPdtTypeMap[renewalStatusPdtTypesList[j]].indexOf(',') !== -1)
                {
                    productCnfrmdPicklistValues=prdctsConfirmedBasedOnPdtTypeMap[renewalStatusPdtTypesList[j]].split(',');
                }
                else
                {
                    productCnfrmdPicklistValues = prdctsConfirmedBasedOnPdtTypeMap[renewalStatusPdtTypesList[j]];
                }
                prdctsConfirmedBasedOnPdtTypeFinalMap[renewalStatusPdtTypesList[j]]=productCnfrmdPicklistValues;
                
            }
            
        }
        
      	return prdctsConfirmedBasedOnPdtTypeFinalMap;     
    },
    
    
    setPicklistValuesBasedOnPrdctType: function(prdctTypesStr,pickListValuesBasedOnPrdctTypeStr)
    {
        var picklistValuesBasedOnPdtTypeFinalMap={};
        var renewalStatusPdtTypes = prdctTypesStr;
        var renewalStatusPdtTypesList=[];
        if(renewalStatusPdtTypes!='' && renewalStatusPdtTypes!=undefined 
           && renewalStatusPdtTypes!=null)
        {
            if(renewalStatusPdtTypes.indexOf(',') !== -1)
            {
                renewalStatusPdtTypesList=renewalStatusPdtTypes.split(',');
            }
            else
            {
                renewalStatusPdtTypesList = renewalStatusPdtTypes;
            }  
        }
        
        var pickListValuesByPdtType = pickListValuesBasedOnPrdctTypeStr;
        var pickListValuesByPdtTypeList=[];
        var pickListValuesBasedOnPdtTypeMap={};
        if(pickListValuesByPdtType!='' && pickListValuesByPdtType!=undefined 
           && pickListValuesByPdtType!=null)
        {
            if(pickListValuesByPdtType.indexOf(';') !== -1)
            {
                pickListValuesByPdtTypeList=pickListValuesByPdtType.split(';');
            }
            else
            {
                pickListValuesByPdtTypeList = pickListValuesByPdtType;
            }
            
        }
        for(var i in pickListValuesByPdtTypeList)
        {
            var eachPrdctTypeWithPicklistValues=pickListValuesByPdtTypeList[i].split('=');
            pickListValuesBasedOnPdtTypeMap[eachPrdctTypeWithPicklistValues[0]]=eachPrdctTypeWithPicklistValues[1];     
        }
        
        
        for(var j in renewalStatusPdtTypesList)
        {
            if(pickListValuesBasedOnPdtTypeMap.hasOwnProperty(renewalStatusPdtTypesList[j]))
            {
                var picklistValues=[];
                if(pickListValuesBasedOnPdtTypeMap[renewalStatusPdtTypesList[j]].indexOf(',') !== -1)
                {
                    picklistValues=pickListValuesBasedOnPdtTypeMap[renewalStatusPdtTypesList[j]].split(',');
                }
                else
                {
                    picklistValues = pickListValuesBasedOnPdtTypeMap[renewalStatusPdtTypesList[j]];
                }
                picklistValuesBasedOnPdtTypeFinalMap[renewalStatusPdtTypesList[j]]=picklistValues;
                
            }
            
        }
        
      	return picklistValuesBasedOnPdtTypeFinalMap;     
    },
    
    isMapEmpty:function(map1)
    {
        var isMapEmpty=true;
        if(map1!=undefined)
        {
            for ( var key in map1 ) {
                isMapEmpty=false;
            }
        }
        
        return isMapEmpty;
    },
    
    
    getAccountFieldInfo : function(component, event) { 
    	var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var action = component.get("c.getAccountFieldInfo");
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state === "SUCCESS") {
                var accountFieldInfoMap=response.getReturnValue();
                
                var fieldSetMap={};
                var accountKeyRenewalDateFieldNames = $A.get("$Label.c.Account_KeyRenewalDate_Field_Names").split(','); 
                
                if(!this.isMapEmpty(accountFieldInfoMap)){
                    for(var echFldStIndx in accountKeyRenewalDateFieldNames){
                        fieldSetMap[accountKeyRenewalDateFieldNames[echFldStIndx]]=accountFieldInfoMap[accountKeyRenewalDateFieldNames[echFldStIndx]];
                    }
                } 
                component.set("v.fieldSetMap", fieldSetMap);
               
                
                
                
            }
            else if( state === "ERROR") {
                
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    
})