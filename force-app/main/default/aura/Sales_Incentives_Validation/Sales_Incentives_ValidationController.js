({
    doInit : function(component, event, helper) {
        
        // helper.getRenewalStatus(component,event);
        //helper.getUserInfo(component,event);
        
    },
    
    expandCollapseSection : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;
        var iconElement = selectedItem.getAttribute("id");
        var myLabel = component.find(iconElement).get("v.iconName");
        helper.getRenewalStatus(component,event);
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            $A.util.removeClass(component.find(divId), 'slds-hide');
        } else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.addClass(component.find(divId), 'slds-hide');
        }
    },
    
    editRenewalStatusRecords : function(component, event, helper) {
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != undefined && isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            $A.util.addClass(component.find("sortEdit"), 'hide');
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("saveCancel"), 'hide');
        } else {
            component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            $A.util.removeClass(component.find("cancelBtn"), 'slds-hide');
            component.find('printBtn').set("v.disabled", true);
        }
        component.set("v.enableSelectAllCheckBox",true);
        component.set("v.selectAllCheckBoxValue",false);
        
        /*var existingReadyToSendCheckedRecordsMap={};
        var selectAllReadyToSendRecordsMap={};
        var firstRecordFromWhichDataFlows=undefined;
        var renewalStatusList=component.get("v.renewalStatusList");
        for(var eachRecIndx in renewalStatusList)
        {
            if(renewalStatusList[eachRecIndx].Eligible_for_Sales_Incentives__c=='Yes' && renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c!=undefined &&
               renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c.indexOf($A.get("$Label.c.Renewal_Status_MemberSafe_field_trigger_value")) != -1 
              )
            {
                
                if(firstRecordFromWhichDataFlows==undefined && renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined)
                {
                    firstRecordFromWhichDataFlows={};
                    firstRecordFromWhichDataFlows=renewalStatusList[eachRecIndx];
                }
                
                if(renewalStatusList[eachRecIndx].Submit_For_Sales_Incentives__c==true)
                {
                    existingReadyToSendCheckedRecordsMap[renewalStatusList[eachRecIndx].Id] = renewalStatusList[eachRecIndx];
                }
                else if(renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c!=undefined && renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c.indexOf($A.get("$Label.c.Renewal_Status_MemberSafe_field_trigger_value")) != -1 
                        && renewalStatusList[eachRecIndx].Submit_For_Sales_Incentives__c!=true)
                {
                    selectAllReadyToSendRecordsMap[renewalStatusList[eachRecIndx].Id]= false;
                    
                }
                
            }
            
            
        }
        if(firstRecordFromWhichDataFlows!=undefined)
        {
            if(selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id]!=undefined)
            {
                delete selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id];
            }
            if(existingReadyToSendCheckedRecordsMap[firstRecordFromWhichDataFlows.Id]!=undefined)
            {
                delete existingReadyToSendCheckedRecordsMap[firstRecordFromWhichDataFlows.Id];
            }
            
        }
        
        component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
        component.set("v.existingReadyToSendCheckedRecordsMap",existingReadyToSendCheckedRecordsMap);
        component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);*/
        
        
        var existingReadyToSendCheckedRecordsMap={};
        var renewalStatusList=component.get("v.renewalStatusList");
        var isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk=false;
        var firstRecordFromWhichDataFlowsBeforeRecordEdit={};
        for(var eachRecIndx in renewalStatusList)
        {
            if(renewalStatusList[eachRecIndx].Eligible_for_Sales_Incentives__c=='Yes' && renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c!=undefined &&
               helper.isRenewalConfirmed(renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c))
            {
                if(helper.isMapEmpty(firstRecordFromWhichDataFlowsBeforeRecordEdit) && renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined)
                {
                    firstRecordFromWhichDataFlowsBeforeRecordEdit=renewalStatusList[eachRecIndx];
                    if(renewalStatusList[eachRecIndx].Submit_For_Sales_Incentives__c==true)
                    {
                        isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk=true;
                        
                    }
                }
                
                if(renewalStatusList[eachRecIndx].Submit_For_Sales_Incentives__c==true && 
                   (renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined || renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==null
                    || renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==''))
                {
                    existingReadyToSendCheckedRecordsMap[renewalStatusList[eachRecIndx].Id] = renewalStatusList[eachRecIndx];
                }
                
            }
            
        }
        
        component.set("v.existingReadyToSendCheckedRecordsMap",existingReadyToSendCheckedRecordsMap);
        component.set("v.isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk",isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk);
        component.set("v.firstRecordFromWhichDataFlowsBeforeRecordEdit",firstRecordFromWhichDataFlowsBeforeRecordEdit);
        
        var salesIncentivesChildComp = component.find('renewalStatusAuraId');        
        if(Array.isArray(salesIncentivesChildComp)) {
            for(var i=0;i<salesIncentivesChildComp.length;i++) {
                salesIncentivesChildComp[i].editFields();
            } 
        } else {
            salesIncentivesChildComp.editFields();
        } 
        
    },
    
    cancelChanges : function(component, event, helper) {
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != undefined && isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            $A.util.removeClass(component.find("sortEdit"), 'hide');
            $A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.addClass(component.find("saveCancel"), 'hide');
        } else {
            component.find('editBtn').set("v.disabled", false);
            $A.util.addClass(component.find("saveBtn"), 'slds-hide');
            $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
            component.find('printBtn').set("v.disabled", false);
        }
        
        component.set("v.enableSelectAllCheckBox",false);
        component.set("v.selectAllCheckBoxValue",false);
        
        var showErrorBanner = component.find('errorToastMessage');
        $A.util.removeClass(showErrorBanner,'slds-hide');
        $A.util.addClass(showErrorBanner, 'slds-hide');  
        
        var salesIncentivesChildComp = component.find('renewalStatusAuraId'); 
        
        if(Array.isArray(salesIncentivesChildComp)) {
            for(var i=0;i<salesIncentivesChildComp.length;i++) {
                salesIncentivesChildComp[i].set('v.isEdit', false);
            } 
        }
        else {
            salesIncentivesChildComp.set('v.isEdit', false);
        }
        //Added by Veera
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",{});
        component.set("v.renewalStatusRecordsTobeUpdatedMap",{});
        //
        helper.getRenewalStatus1(component, event, helper);
        
        
        
    },
    
    saveRenewalStatusRecords : function(component, event, helper){
        //debugger;
        var isValidationSuccess = true;
        var isMandatoryFieldValidationSuccess = true;
        var renewalStatusList=component.get('v.renewalStatusList');
        
        for(var i=0;i<renewalStatusList.length;i++)
        {
            //alert('renewalStatusList[i].Will_sales_incentives_be_split__c '+renewalStatusList[i].Will_sales_incentives_be_split__c);
            if((renewalStatusList[i].Date_sent_to_ISI_Site__c!=undefined && renewalStatusList[i].Date_sent_to_ISI_Site__c!='')
               && (renewalStatusList[i].Submit_For_Sales_Incentives__c!=undefined && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)){
                //validation logic skips,since record is not editable
            }
            else{
                var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                if(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c == '')
                    //&& (renewalStatusList[i].Date_sent_to_ISI_Site__c ==undefined || renewalStatusList[i].Date_sent_to_ISI_Site__c ==''))
                {
                    if(Array.isArray(salesIncentivesChildComp)) {
                        $A.util.addClass(salesIncentivesChildComp[i].find('Renewal_Confirmed_Members_Sale__c'), 'slds-has-error');
                    }
                    else
                    {
                        $A.util.addClass(salesIncentivesChildComp.find('Renewal_Confirmed_Members_Sale__c'), 'slds-has-error');
                    }
                    isValidationSuccess = false;
                    isMandatoryFieldValidationSuccess=false;
                }
                var isRenewalConfirmedValueContainsYes=false;
                
                if(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined && 
                   renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!='' &&
                   helper.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c))
                {
                    isRenewalConfirmedValueContainsYes=true;
                    
                }
                if(isRenewalConfirmedValueContainsYes==true && helper.isPrdctTypeEnabledForPrdctDtl(renewalStatusList[i].Product_Line__c)
                   && (renewalStatusList[i].Product_Confirmed__c == undefined || renewalStatusList[i].Product_Confirmed__c == ''))
                {
                    if(Array.isArray(salesIncentivesChildComp)) {
                        $A.util.addClass(salesIncentivesChildComp[i].find('main-div'), 'slds-has-error');
                    }
                    else
                    {
                        $A.util.addClass(salesIncentivesChildComp.find('main-div'), 'slds-has-error');
                    }
                    isValidationSuccess = false;
                    isMandatoryFieldValidationSuccess=false;
                }
                
                if(renewalStatusList[i].Eligible_for_Sales_Incentives__c!=undefined &&
                   renewalStatusList[i].Eligible_for_Sales_Incentives__c == 'Yes')
                {
                    
                    if((isRenewalConfirmedValueContainsYes==true))
                    {
                        if(renewalStatusList[i].Submit_For_Sales_Incentives__c == true){
                            if(renewalStatusList[i].Will_sales_incentives_be_split__c == 'Yes') {
                                if(renewalStatusList[i].Sales_person_1__c==''||
                                   renewalStatusList[i].Sales_person_1__c==undefined||
                                   renewalStatusList[i].Sales_Person_2__c=='' ||
                                   renewalStatusList[i].Sales_Person_2__c==undefined||
                                   renewalStatusList[i].Sales_Person_1_split_percentage__c==undefined ||
                                   (renewalStatusList[i].Sales_Person_1_split_percentage__c!=undefined && renewalStatusList[i].Sales_Person_1_split_percentage__c.toString()=='') ||
                                   renewalStatusList[i].Sales_Person_2_Split_percentage__c==undefined ||
                                   (renewalStatusList[i].Sales_Person_2_Split_percentage__c!=undefined && renewalStatusList[i].Sales_Person_2_Split_percentage__c.toString()=='') 
                                  )
                                { 
                                    
                                    if(renewalStatusList[i].Sales_person_1__c== undefined || renewalStatusList[i].Sales_person_1__c=='')
                                    {
                                        if(Array.isArray(salesIncentivesChildComp)) {
                                            $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_User__c'), 'slds-has-error');
                                        }
                                        else
                                        {
                                            $A.util.addClass(salesIncentivesChildComp.find('Sales_Person_1_User__c'), 'slds-has-error');
                                        }
                                        isValidationSuccess = false;
                                        isMandatoryFieldValidationSuccess=false;
                                    }
                                    if(renewalStatusList[i].Sales_Person_1_split_percentage__c==undefined || 
                                       (renewalStatusList[i].Sales_Person_1_split_percentage__c!=undefined && renewalStatusList[i].Sales_Person_1_split_percentage__c.toString()=='')) {
                                        
                                        if(Array.isArray(salesIncentivesChildComp)) {
                                            $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                        }
                                        else
                                        {
                                            $A.util.addClass(salesIncentivesChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error'); 
                                        }
                                        
                                        isValidationSuccess = false;
                                        isMandatoryFieldValidationSuccess=false;
                                        
                                    }
                                    if(renewalStatusList[i].Sales_Person_2__c== undefined || renewalStatusList[i].Sales_Person_2__c=='')
                                    {
                                        if(Array.isArray(salesIncentivesChildComp)) {
                                            $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_2__c'), 'slds-has-error');
                                        }
                                        else{
                                            $A.util.addClass(salesIncentivesChildComp.find('Sales_Person_2__c'), 'slds-has-error');  
                                        }
                                        
                                        isValidationSuccess = false;
                                        isMandatoryFieldValidationSuccess=false;
                                    }
                                    
                                    if(renewalStatusList[i].Sales_Person_2_Split_percentage__c==undefined ||
                                       (renewalStatusList[i].Sales_Person_2_Split_percentage__c!=undefined && renewalStatusList[i].Sales_Person_2_Split_percentage__c.toString()==''))
                                    {
                                        if(Array.isArray(salesIncentivesChildComp)) {
                                            $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                                        }
                                        else{
                                            $A.util.addClass(salesIncentivesChildComp.find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                                        }
                                        
                                        isValidationSuccess = false;
                                        isMandatoryFieldValidationSuccess=false;
                                        
                                    }
                                    
                                    
                                    
                                    
                                }
                                
                                if((renewalStatusList[i].Sales_Person_2_Split_percentage__c!= undefined && renewalStatusList[i].Sales_Person_2_Split_percentage__c!=null && renewalStatusList[i].Sales_Person_2_Split_percentage__c.toString()!='') 
                                   && (renewalStatusList[i].Sales_Person_1_split_percentage__c!=undefined && renewalStatusList[i].Sales_Person_1_split_percentage__c!=null && renewalStatusList[i].Sales_Person_1_split_percentage__c.toString()!=''))
                                {
                                    var salesPerson1SplitPercent=parseInt(renewalStatusList[i].Sales_Person_1_split_percentage__c);
                                    var salesPerson2SplitPercent=parseInt(renewalStatusList[i].Sales_Person_2_Split_percentage__c);
                                    var totalSplitPercentage=salesPerson1SplitPercent+salesPerson2SplitPercent;
                                    
                                    
                                    if(totalSplitPercentage!=100)
                                    {
                                        if(Array.isArray(salesIncentivesChildComp)) {
                                            $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                            $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                                        }
                                        else{
                                            $A.util.addClass(salesIncentivesChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                            $A.util.addClass(salesIncentivesChildComp.find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');  
                                        }
                                        
                                        isValidationSuccess = false;
                                    }
                                    
                                    
                                    
                                    
                                }
                                
                                
                            }
                            else if(renewalStatusList[i].Will_sales_incentives_be_split__c == 'No')
                            {
                                if(renewalStatusList[i].Sales_person_1__c== undefined || renewalStatusList[i].Sales_person_1__c=='')
                                {
                                    if(Array.isArray(salesIncentivesChildComp)) {
                                        $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_User__c'), 'slds-has-error');
                                    }
                                    else{
                                        $A.util.addClass(salesIncentivesChildComp.find('Sales_Person_1_User__c'), 'slds-has-error'); 
                                    }
                                    isValidationSuccess = false;
                                    isMandatoryFieldValidationSuccess=false;
                                } 
                            }          
                                else if(renewalStatusList[i].Will_sales_incentives_be_split__c == '' || renewalStatusList[i].Will_sales_incentives_be_split__c == undefined)
                                {
                                    var salesIncentivesChildComp = component.find('renewalStatusAuraId'); 
                                    if(Array.isArray(salesIncentivesChildComp)) {
                                        $A.util.addClass(salesIncentivesChildComp[i].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
                                    }
                                    else{
                                        $A.util.addClass(salesIncentivesChildComp.find('Will_sales_incentives_be_split__c'), 'slds-has-error');  
                                    }
                                    
                                    isValidationSuccess = false;
                                    isMandatoryFieldValidationSuccess=false;
                                    
                                }
                        }
                    }
                    
                }
            }  
        }
        
        if(isValidationSuccess== false)
        {
            //alert('Coming inside isValidationSuccess');
            if(isMandatoryFieldValidationSuccess== false)
            {
                //alert('Coming inside isMandatoryFieldValidationSuccess');
                component.set("v.bannerErrorMessage", "Please complete the fields that are highlighted in RED.");
            }
            else
            {
                //component.set("v.bannerErrorMessage", "Total Split percent cannot be greater than 100");
                component.set("v.bannerErrorMessage", "The Split Percents for Sales Person 1 and Sales Person 2 should total 100");
            }
            var showErrorBanner = component.find('errorToastMessage');
            $A.util.removeClass(showErrorBanner,'slds-hide');
            $A.util.addClass(showErrorBanner, 'slds-has-error');
        }
        
        else if(isValidationSuccess == true){
            var tableLoadingSpinner = component.find("tableLoadingSpinner");
            $A.util.removeClass(tableLoadingSpinner, 'slds-hide');
            $A.util.addClass(tableLoadingSpinner, 'slds-show');
            
            var showErrorBanner = component.find('errorToastMessage');
            $A.util.removeClass(showErrorBanner,'slds-hide');
            $A.util.addClass(showErrorBanner, 'slds-hide');
            
            var eachYearRenewalStatusListTobeUpdated=[];
            var eachYearRenewalStatusRecordsTobeUpdatedMap=component.get('v.eachYearRenewalStatusRecordsTobeUpdatedMap');
            
            //---------------------------------------------SAMARTH---------------------------------------------
            var rnwlcnfrmsmembers='';
            var rsListBeforeUpdate = component.get('v.rsDataBeforeSave');
            for(var key in eachYearRenewalStatusRecordsTobeUpdatedMap)
            {
                for(var i in rsListBeforeUpdate){
                    if(key == rsListBeforeUpdate[i].Id){
                        if(rsListBeforeUpdate[i].Renewal_Confirmed_Members_Sale__c != null && rsListBeforeUpdate[i].Renewal_Confirmed_Members_Sale__c != undefined && rsListBeforeUpdate[i].Renewal_Confirmed_Members_Sale__c != ''){
                            rnwlcnfrmsmembers = rsListBeforeUpdate[i].Renewal_Confirmed_Members_Sale__c;   
                        }
                        else{
                            rnwlcnfrmsmembers='';
                        }
                    }
                }
                var renewalStatusRecordTobeUpdate=eachYearRenewalStatusRecordsTobeUpdatedMap[key];

                if(renewalStatusRecordTobeUpdate.Renewal_Confirmed_Members_Sale__c.includes("Confirmed") && !rnwlcnfrmsmembers.includes("Confirmed")){
                    renewalStatusRecordTobeUpdate.VPCR_RVP__c=renewalStatusRecordTobeUpdate.Company__r.CMVPCRRVP__c;
                    var mapFromParent = component.get('v.sbMapFromParent');
                    for(var val in mapFromParent){
                        if(key == val){
                            renewalStatusRecordTobeUpdate.Specialty_Benefits_SCE__c =  mapFromParent[val];
                        }
                    }
                }
                else if(renewalStatusRecordTobeUpdate.Renewal_Confirmed_Members_Sale__c.includes("Confirmed") && rnwlcnfrmsmembers.includes("Confirmed")){
                    
                }
                else{
                    renewalStatusRecordTobeUpdate.VPCR_RVP__c='';
                    renewalStatusRecordTobeUpdate.Specialty_Benefits_SCE__c='';
                }
            //---------------------------------------------SAMARTH---------------------------------------------
                
                
                /*if(renewalStatusRecordTobeUpdate.Eligible_for_Sales_Incentives__c!=undefined
                   && renewalStatusRecordTobeUpdate.Eligible_for_Sales_Incentives__c=='Yes')
                {
                    
                    if(renewalStatusRecordTobeUpdate.Submit_For_Sales_Incentives__c!=undefined
                       && renewalStatusRecordTobeUpdate.Submit_For_Sales_Incentives__c==true)
                    {
                        renewalStatusRecordTobeUpdate.VPCR_RVP__c=renewalStatusRecordTobeUpdate.Company__r.CMVPCRRVP__c;
                        
                        //------------------------SAMARTH------------------------
                        var mapFromParent = component.get('v.sbMapFromParent');
                        for(var val in mapFromParent){
                            if(key == val){
                                renewalStatusRecordTobeUpdate.Specialty_Benefits_SCE__c =  mapFromParent[val];
                            }
                        }
                        //------------------------SAMARTH------------------------
                    }
                    else
                    {
                        renewalStatusRecordTobeUpdate.VPCR_RVP__c='';
                        renewalStatusRecordTobeUpdate.Specialty_Benefits_SCE__c=''; //SAMARTH
                    }
                }*/
                
                //eachYearRenewalStatusListTobeUpdated.push(eachYearRenewalStatusRecordsTobeUpdatedMap[key]);
                eachYearRenewalStatusListTobeUpdated.push(renewalStatusRecordTobeUpdate);
                
            }
            
            
            component.set('v.eachYearRenewalStatusRecordsTobeUpdatedMap',{});
            helper.updateRenewalStatusRecords(component,event,eachYearRenewalStatusListTobeUpdated);
        }
        
        
        
        //for data services//
        /*var saveRecordsEnabled  = component.find("saveBtn").saveRecord($A.getCallback(function(saveResult){
            // NOTE: If you want a specific behavior(an action or UI behavior) when this action is successful 
            // then handle that in a callback (generic logic when record is changed should be handled in recordUpdated event handler)
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                // handle component related logic in event handler
            } else if (saveResult.state === "INCOMPLETE") {
                console.log("User is offline, device doesn't support drafts.");
            } else if (saveResult.state === "ERROR") {
                console.log('Problem saving record, error: ' + JSON.stringify(saveResult.error));
            } else {
                console.log('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));
            }
        }));*/
    },
    
    
    salesCycleChangeHandler1: function(component, event, helper){
        var salesCycle=component.find('Sales_Cycle__c').get('v.value'); 
        var salesIncentivesValidationEvnt = component.getEvent("salesIncentivesValidationEvnt");
        salesIncentivesValidationEvnt.setParams({"salesCycleValue":salesCycle});
        salesIncentivesValidationEvnt.fire();
        
    },
    
    print:function (component, event, helper) 
    {
        helper.exportRecord(component, event, helper);
    },
    
    
    selectAllChangeHandler:function (component, event, helper) 
    {
        
        helper.selectAll(component, event, helper);
        
        
    },
    
    firstRecordDataChangeHandler:function (component, event, helper) 
    {
        helper.firstRecordDataChangeHelper(component, event, helper);
        
    },
    
    openHelpPopup : function(component, event, helper){
        component.set('v.openHelpPopUp',true);
    },
    
    onpresscancel : function(component, event, helper) {
        var buttonId = component.find('popup');
        $A.util.addClass(buttonId, 'slds-hide');
        $A.util.removeClass(buttonId, 'slds-show');
        component.set('v.openHelpPopUp',false);
        
    }
    
})