({
    doInit : function(component, event, helper) {
        helper.getUserInfo(component,event);
    },
    
    expandCollapseSection : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;
        var iconElement = selectedItem.getAttribute("id");
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            $A.util.removeClass(component.find(divId), 'slds-hide');
        } else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.addClass(component.find(divId), 'slds-hide');
        }
        var loggedInUserInfoObj=component.get("v.loggedInUserInfoObj");
        if(!helper.isMapEmpty(loggedInUserInfoObj) ){
            if(!loggedInUserInfoObj.isLggdInUsrHsViewAccessToRnwlStatusSctn
              && loggedInUserInfoObj.isLggdInUsrHsViewAccessToKeyRnwlDtSctn){
                helper.getAccountFieldInfo(component,event);
            }
            else if(loggedInUserInfoObj.isLggdInUsrHsViewAccessToRnwlStatusSctn){
           helper.getRenewalStatus(component,event);
           helper.getDataBeforeSave(component,event); //SAMARTH - for getting data before save
           component.set('v.salesCycle','');
        }
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
        }
        
        var salesIncentiveValidationMainChildComp = component.find('salesIncentivesValidationCmpAuraId'); 
        if(Array.isArray(salesIncentiveValidationMainChildComp)) 
        {
            for(var i=0;i<salesIncentiveValidationMainChildComp.length;i++) 
            {
                var salesIncentivesChildComp = salesIncentiveValidationMainChildComp[i].find('renewalStatusAuraId');        
                if(Array.isArray(salesIncentivesChildComp)) 
                {
                    for(var j=0;j<salesIncentivesChildComp.length;j++) 
                    {
                        salesIncentivesChildComp[j].editFields();
                    } 
                } 
                else 
                {
                    salesIncentivesChildComp.editFields();
                }  
            }
        }
        else
        {
            var salesIncentivesChildComp =salesIncentiveValidationMainChildComp[0].find('renewalStatusAuraId');
            if(Array.isArray(salesIncentivesChildComp)) 
            {
                for(var i=0;i<salesIncentivesChildComp.length;i++) 
                {
                    salesIncentivesChildComp[i].editFields();
                } 
            } 
            else 
            {
                salesIncentivesChildComp.editFields();
            }  
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
        }
        
        var salesIncentiveValidationMainChildComp = component.find('salesIncentivesValidationCmpAuraId');
        
        for(var i=0;i<salesIncentiveValidationMainChildComp.length;i++) 
        {
            var salesIncentivesChildComp = salesIncentiveValidationMainChildComp[i].find('renewalStatusAuraId');        
            
            for(var j=0;j<salesIncentivesChildComp.length;j++) 
            {
                salesIncentivesChildComp[j].set('v.isEdit', false);
            } 
            
            
        }
        
        helper.getRenewalStatus(component, event);
        //helper.getDataBeforeSave(component,event); //SAMARTH - for getting data before save
        
    },
    
    
    
    saveRenewalStatusRecords : function(component, event, helper){
        
        var isValidationSuccess = true;
        var renewalStatusList;
        //var renewalStatusList=component.get('v.renewalStatusList');
        
        
        
        
        var eachYearRenewalStatusList=component.get('v.eachYearRenewalStatusList');
        
        for(var indx in eachYearRenewalStatusList)
        {
            renewalStatusList=eachYearRenewalStatusList[indx].eachYearRenewalStatusList;
            {
                for(var i=0;i<renewalStatusList.length;i++)
                {
                    if(renewalStatusList[i].Name != 'Medical')
                    {
                        if(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c != 'Yes') {
                            //isValidationSuccess=true;
                        }
                        else {
                            if(renewalStatusList[i].Will_sales_incentives_be_split__c == 'Yes') {
                                if(renewalStatusList[i].Sales_Person_1_split_percentage__c != ''
                                   //&& renewalStatusList[i].Sales_Person_2__c!= undefined
                                   // && renewalStatusList[i].Sales_Person_2__c!=''
                                   && renewalStatusList[i].Sales_Person_2_Split_percentage__c!='') {
                                    //isValidationSuccess=true;
                                } else{ 
                                    
                                    if(renewalStatusList[i].Sales_Person_1_split_percentage__c=='' 
                                       && renewalStatusList[i].Sales_Person_2_Split_percentage__c=='') {
                                        
                                        var salesIncentiveValidationMainChildComp = component.find('salesIncentivesValidationCmpAuraId');
                                        var salesIncentivesChildComp = salesIncentiveValidationMainChildComp[indx].find('renewalStatusAuraId');                         
                                        $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                        $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                                        for(var k=i+1;k<renewalStatusList.length;k++)
                                        {
                                            if(renewalStatusList[k].Sales_Person_1_split_percentage__c == '')
                                            {
                                                $A.util.addClass(salesIncentivesChildComp[k].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                                $A.util.addClass(salesIncentivesChildComp[k].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                                            }
                                        }
                                        
                                    }
                                    if(renewalStatusList[i].Sales_Person_1_split_percentage__c=='') {
                                        var salesIncentiveValidationMainChildComp = component.find('salesIncentivesValidationCmpAuraId');
                                        
                                        var salesIncentivesChildComp = salesIncentiveValidationMainChildComp[indx].find('renewalStatusAuraId');                         
                                        
                                        $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                        
                                        for(var k=i+1;k<renewalStatusList.length;k++)
                                        {
                                            if(renewalStatusList[k].Sales_Person_1_split_percentage__c == '')
                                            {
                                                $A.util.addClass(salesIncentivesChildComp[k].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                            }
                                        }
                                        
                                        
                                        isValidationSuccess=false;
                                        //return;
                                    }
                                    /*if(renewalStatusList[i].Sales_Person_2__c== undefined || renewalStatusList[i].Sales_Person_2__c=='')
                        {
                                helper.showToast('Please choose any user for \'Sales Person 2 \' field before saving the record '
                                                 ,'Error'); 
                                return;
                        }*/
                            
                            if(renewalStatusList[i].Sales_Person_2_Split_percentage__c=='')
                            {
                                var salesIncentiveValidationMainChildComp = component.find('salesIncentivesValidationCmpAuraId');
                                
                                var salesIncentivesChildComp = salesIncentiveValidationMainChildComp[indx].find('renewalStatusAuraId');                         
                                
                                $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                                
                                for(var k=i+1;k<renewalStatusList.length;k++)
                                {
                                    if(renewalStatusList[k].Sales_Person_2_Split_percentage__c == '')
                                    {
                                        $A.util.addClass(salesIncentivesChildComp[k].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                                    }
                                }
                                isValidationSuccess=false;
                                //return;
                            }
                        }
                        
                    }
                    else if(renewalStatusList[i].Will_sales_incentives_be_split__c == 'No')
                    {
                        //isValidationSuccess=true;
                    }
                        else
                        {
                            var salesIncentiveValidationMainChildComp = component.find('salesIncentivesValidationCmpAuraId');
                            
                            var salesIncentivesChildComp = salesIncentiveValidationMainChildComp[indx].find('renewalStatusAuraId');                         
                            
                            $A.util.addClass(salesIncentivesChildComp[i].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
                            
                            for(var k=i+1;k<renewalStatusList.length;k++)
                            {
                                if(renewalStatusList[k].Will_sales_incentives_be_split__c == '')
                                {
                                    $A.util.addClass(salesIncentivesChildComp[k].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
                                }
                            }
                            isValidationSuccess=false;
                            //return;
                        }
                }
                
            }
            else
            {
                //isValidationSuccess=true;          
            }
        }
        
        
        
    }
    
}        
        
        
        
        
        if(isValidationSuccess == true){
            var tableLoadingSpinner = component.find("tableLoadingSpinner");
            $A.util.removeClass(tableLoadingSpinner, 'slds-hide');
            $A.util.addClass(tableLoadingSpinner, 'slds-show');
            
            var renewalStatusListTobeUpdated=[];
            /*var renewalStatusList=component.get('v.eachYearRenewalStatusList');
            for(var renewalStatusListIndx in renewalStatusList)
            {
                var eachYearRenewalStatusList= renewalStatusList[renewalStatusListIndx];
                for(var eachYearRenewalStatusListIndx in eachYearRenewalStatusList)
                {
                   renewalStatusListTobeUpdated.push(eachYearRenewalStatusList[eachYearRenewalStatusListIndx]); 
                }
                
            }*/
            
            
            var renewalStatusRecordsTobeUpdatedMap=component.get('v.renewalStatusRecordsTobeUpdatedMap');
            for(var key in renewalStatusRecordsTobeUpdatedMap)
            {
                renewalStatusListTobeUpdated.push(renewalStatusRecordsTobeUpdatedMap[key]);
            }
            
            
            helper.updateRenewalStatusRecords(component,event,renewalStatusListTobeUpdated);
        }
        
    },
    
    salesCycleChangeHandler: function(component, event, helper){
       // var salesCycle=component.find('Sales_Cycle__c').get('v.value'); 
       var salesCycle = event.getParam('salesCycleValue');
        component.set('v.salesCycle',salesCycle);
        helper.getRenewalStatus(component, event);
        helper.getDataBeforeSave(component,event); //SAMARTH - for getting data before save
        
    }
    
})