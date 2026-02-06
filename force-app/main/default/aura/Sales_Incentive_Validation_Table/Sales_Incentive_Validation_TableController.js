({
    editSalesIncentiveRecords: function(component,event,helper) {
        
        component.set('v.isEdit', true);
        var renewalStatusRecord = component.get("v.renewalStatus");
        console.log('ISI Date'+renewalStatusRecord.Date_sent_to_ISI_Site__c);
        if((renewalStatusRecord.Date_sent_to_ISI_Site__c!=undefined && renewalStatusRecord.Date_sent_to_ISI_Site__c!='')
          && (renewalStatusRecord.Submit_For_Sales_Incentives__c!=undefined && renewalStatusRecord.Submit_For_Sales_Incentives__c==true))
       {
           $A.util.addClass(component.find('renewalStatusEachRow'), 'slds-theme_shade');
       }
        
        
        var productsConfirmedPicklistValueMap=component.get("v.productsConfirmedPicklistValueMap");
        var productConfirmedPicklist=[''];
        if(productsConfirmedPicklistValueMap!= undefined && productsConfirmedPicklistValueMap!= ''
           && productsConfirmedPicklistValueMap!= null)
        {
            if(productsConfirmedPicklistValueMap.hasOwnProperty(renewalStatusRecord.Product_Line__c))
            {
                
                for(var i in productsConfirmedPicklistValueMap[renewalStatusRecord.Product_Line__c])
                {
                    productConfirmedPicklist.push(productsConfirmedPicklistValueMap[renewalStatusRecord.Product_Line__c][i]);   
                }
                
            }
            
        }
        component.set("v.productConfirmedPicklist",productConfirmedPicklist);
        
        var renewalConfirmedPicklistValueMap=component.get("v.renewalConfirmedPicklistValueMap");
        var renewalConfirmedPicklist=[];
        if(renewalConfirmedPicklistValueMap!= undefined && renewalConfirmedPicklistValueMap!= ''
           && renewalConfirmedPicklistValueMap!= null)
        {
            if(renewalConfirmedPicklistValueMap.hasOwnProperty(renewalStatusRecord.Product_Line__c))
            {
                
                for(var  p in renewalConfirmedPicklistValueMap[renewalStatusRecord.Product_Line__c])
                {
                    renewalConfirmedPicklist.push(renewalConfirmedPicklistValueMap[renewalStatusRecord.Product_Line__c][p]);   
                }
                
            }
            
        }
        component.set("v.renewalConfirmedPicklist",renewalConfirmedPicklist);
        
        
        
        
        
        
        
        
        
        component.set("v.dropdownLength",productConfirmedPicklist.length);
        var productConfirmedSelectedPicklist=component.get("v.productConfirmedSelectedPicklist");
        productConfirmedSelectedPicklist=[];
        var productConfirmedVal=renewalStatusRecord.Product_Confirmed__c;
        if(productConfirmedVal!=undefined)
        {
            if(productConfirmedVal.indexOf(';')==-1)
            {
                productConfirmedSelectedPicklist.push(productConfirmedVal);
            }
            else
            {
                productConfirmedSelectedPicklist=productConfirmedVal.split(';');
            }
        }
        component.set("v.productConfirmedSelectedPicklist",productConfirmedSelectedPicklist);
        var renewalConfirmedValue=renewalStatusRecord.Renewal_Confirmed_Members_Sale__c;
        //if(renewalConfirmedValue!=undefined && renewalConfirmedValue.indexOf('Yes')!=-1)
        if(renewalConfirmedValue!=undefined && helper.isRenewalConfirmed(renewalConfirmedValue))
        {
            component.set("v.isRenewalConfirmedValueContainsYes",true);
        }
        else
        {
            component.set("v.isRenewalConfirmedValueContainsYes",false);
        }
        
        
        var options_=[];
        for(var m in productConfirmedPicklist)
        {
            var isSelected=false;
            for(var n in productConfirmedSelectedPicklist)
            {
                if(productConfirmedPicklist[m]==productConfirmedSelectedPicklist[n])
                {
                    isSelected=true;
                }
                
            }
            var optionObj={};
            optionObj.value=productConfirmedPicklist[m];
            optionObj.label=productConfirmedPicklist[m];
            optionObj.selected=isSelected;
            options_.push(optionObj);
        }
        
        component.set("v.options_",options_);
        var labels = helper.getSelectedLabels(component);
        helper.setInfoText(component, labels);
        
        component.set("v.selectedRecord",renewalStatusRecord.Sales_person_1__c);
        component.set("v.selectedRecord2",renewalStatusRecord.Sales_Person_2__c);
        
        if(renewalStatusRecord.Sales_person_1__c!=undefined)
        {
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'sldcloses-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var lookUpTarget = component.find("removeSearch");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var userLookUpField1 = component.find("userLookUpField1");
            $A.util.addClass(userLookUpField1, 'slds-hide');
            $A.util.removeClass(userLookUpField1, 'slds-show');
            component.set("v.selectedRecordName" ,renewalStatusRecord.Sales_person_1__r.Name);
        }
        
        if(renewalStatusRecord.Sales_Person_2__c!=undefined)
        {
            var forclose = component.find("lookup-pill2");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("searchRes2");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField2");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var removesearch = component.find("removeSearch2");
            $A.util.addClass(removesearch, 'slds-hide');
            $A.util.removeClass(removesearch, 'slds-show');
            
            var userLookUpField1 = component.find("userLookUpField2");
            $A.util.addClass(userLookUpField1, 'slds-hide');
            $A.util.removeClass(userLookUpField1, 'slds-show');
            
            var removeSearchIcn = component.find("removeSearchIcn");
            $A.util.addClass(removeSearchIcn, 'slds-hide');
            
            component.set("v.selectedRecord2Name" ,renewalStatusRecord.Sales_Person_2__r.Name);
        }
        
        
        
    },
    renewalConfirmedChangeHandler:function(component,event,helper) {
        var renewalConfirmedVal=component.find('Renewal_Confirmed_Members_Sale__c').get('v.value'); 
        var renewalStatusRecord = component.get("v.renewalStatus");
        
        if(renewalConfirmedVal!= undefined && renewalConfirmedVal!='')
        {
            var loggedInUserInfoObj=component.get('v.loggedInUserInfoObj');
            if(!helper.isMapEmpty1(loggedInUserInfoObj)){
               renewalStatusRecord.Confirmed_By__c=loggedInUserInfoObj.loggedInUserId; 
            }
            //renewalStatusRecord.Confirmed_By__c=component.get('v.loggedInUserName');
            renewalStatusRecord.Confirmed_Date__c =new Date().toISOString();

            $A.util.removeClass(component.find('Renewal_Confirmed_Members_Sale__c'), 'slds-has-error');
        }
        //if(renewalConfirmedVal != 'Yes' )
        
        //if(renewalConfirmedVal=='' || renewalConfirmedVal.indexOf('Yes') == -1)
        if(renewalConfirmedVal=='' || !helper.isRenewalConfirmed(renewalConfirmedVal))
        {
            /*var productConfirmedCmp=component.find('Product_Confirmed__c');
            if(productConfirmedCmp!=undefined && productConfirmedCmp!='' &&
               productConfirmedCmp!=null)
            {
                component.find('Product_Confirmed__c').set('v.value','');
            }*/
            var options = component.get("v.options_");
            
            for(var i in options)
            {
                options[i].selected=false;
            }
            
            component.set("v.options_",options);
            var labels = helper.getSelectedLabels(component);
            helper.setInfoText(component, labels);
            renewalStatusRecord.Product_Confirmed__c='';
            var willSalesIncentivesBeSplitCmp=component.find('Will_sales_incentives_be_split__c');
            if(willSalesIncentivesBeSplitCmp!=undefined && willSalesIncentivesBeSplitCmp!='' &&
               willSalesIncentivesBeSplitCmp!=null)
            {
                component.find('Will_sales_incentives_be_split__c').set('v.value','');
            }
            renewalStatusRecord.Will_sales_incentives_be_split__c='';
            renewalStatusRecord.Sales_person_1__c='';
            //component.find('Sales_Person_1_User__c').set('v.value','');
            var salesPerson1SplitPercentageCmp=component.find('Sales_Person_1_split_percentage__c');
            if(salesPerson1SplitPercentageCmp!=undefined && salesPerson1SplitPercentageCmp!='' &&
               salesPerson1SplitPercentageCmp!=null)
            {
                component.find('Sales_Person_1_split_percentage__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_1_split_percentage__c='';
            var SalesPerson2Cmp=component.find('Sales_Person_2__c');
            if(SalesPerson2Cmp!=undefined && SalesPerson2Cmp!='' &&
               SalesPerson2Cmp!=null)
            {
                component.find('Sales_Person_2__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_2__c='';
            var salesPerson2SplitPercentageCmp=component.find('Sales_Person_2_Split_percentage__c');
            if(salesPerson2SplitPercentageCmp!=undefined && salesPerson2SplitPercentageCmp!='' &&
               salesPerson2SplitPercentageCmp!=null)
            {
                component.find('Sales_Person_2_Split_percentage__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_2_Split_percentage__c='';
            if(renewalStatusRecord.Date_sent_to_ISI_Site__c==undefined || 
               renewalStatusRecord.Date_sent_to_ISI_Site__c==null
               || renewalStatusRecord.Date_sent_to_ISI_Site__c=='')
            {
                renewalStatusRecord.Submit_For_Sales_Incentives__c=false;
                renewalStatusRecord.Date_Submitted_For_Incentives__c=''; 
            }
            
            var productsRenewedVal=component.find('main-div');
            
            if(productsRenewedVal!= undefined && productsRenewedVal!='')
            {
                $A.util.removeClass(component.find('main-div'), 'slds-has-error');
            }
            
            component.set("v.isRenewalConfirmedValueContainsYes",false);
        }
        //if(renewalConfirmedVal.indexOf('Yes') != -1)
        if(helper.isRenewalConfirmed(renewalConfirmedVal))
        {
            var options = component.get("v.options_");
            
            for(var i in options)
            {
                options[i].selected=false;
            }
            
            component.set("v.options_",options);
            var labels = helper.getSelectedLabels(component);
            helper.setInfoText(component, labels);
            renewalStatusRecord.Product_Confirmed__c='';
            var willSalesIncentivesBeSplitCmp=component.find('Will_sales_incentives_be_split__c');
            if(willSalesIncentivesBeSplitCmp!=undefined && willSalesIncentivesBeSplitCmp!='' &&
               willSalesIncentivesBeSplitCmp!=null)
            {
                component.find('Will_sales_incentives_be_split__c').set('v.value','');
            }
            renewalStatusRecord.Will_sales_incentives_be_split__c='';
            renewalStatusRecord.Sales_person_1__c='';
            //component.find('Sales_Person_1_User__c').set('v.value','');
            var salesPerson1SplitPercentageCmp=component.find('Sales_Person_1_split_percentage__c');
            if(salesPerson1SplitPercentageCmp!=undefined && salesPerson1SplitPercentageCmp!='' &&
               salesPerson1SplitPercentageCmp!=null)
            {
                component.find('Sales_Person_1_split_percentage__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_1_split_percentage__c='';
            var SalesPerson2Cmp=component.find('Sales_Person_2__c');
            if(SalesPerson2Cmp!=undefined && SalesPerson2Cmp!='' &&
               SalesPerson2Cmp!=null)
            {
                component.find('Sales_Person_2__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_2__c='';
            var salesPerson2SplitPercentageCmp=component.find('Sales_Person_2_Split_percentage__c');
            if(salesPerson2SplitPercentageCmp!=undefined && salesPerson2SplitPercentageCmp!='' &&
               salesPerson2SplitPercentageCmp!=null)
            {
                component.find('Sales_Person_2_Split_percentage__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_2_Split_percentage__c='';
            if(renewalStatusRecord.Date_sent_to_ISI_Site__c==undefined || 
               renewalStatusRecord.Date_sent_to_ISI_Site__c==null
               || renewalStatusRecord.Date_sent_to_ISI_Site__c=='')
            {
                renewalStatusRecord.Submit_For_Sales_Incentives__c=false;
                renewalStatusRecord.Date_Submitted_For_Incentives__c=''; 
            }
            
            
            
            
            
            component.set("v.isRenewalConfirmedValueContainsYes",true);
        }
        
        
        
        component.set("v.renewalStatus",renewalStatusRecord);
        
        component.set("v.SearchKeyWord",'');
        component.set("v.SearchKeyWord2",'');
        
        var renewalStatusRecordsTobeUpdatedMap= component.get("v.renewalStatusRecordsTobeUpdatedMap");
        
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
           && renewalStatusRecordsTobeUpdatedMap!= '')
        {
            
            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
        
        var selectAllReadyToSendRecordsMap=component.get("v.selectAllReadyToSendRecordsMap");
        if(!helper.isMapEmpty1(selectAllReadyToSendRecordsMap) && component.get("v.isRenewalConfirmedValueContainsYes")==false
          && renewalStatusRecord.Eligible_for_Sales_Incentives__c=='Yes')
        {
           if(selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]!=undefined)
           {
               delete selectAllReadyToSendRecordsMap[renewalStatusRecord.Id];
           }
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
        }
        /*if(component.get("v.isRenewalConfirmedValueContainsYes") &&
           component.get("v.selectAllCheckBoxValue")==false && renewalStatusRecord.Eligible_for_Sales_Incentives__c=='Yes')
        {
            if(selectAllReadyToSendRecordsMap!=undefined)
            {
                selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]=false;
            }
            else
            {
                selectAllReadyToSendRecordsMap={};
                selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]=false;
            }
            
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
            
            var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
            salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"Renewal_Confirmed_Members_Sale__c"});
            salesIncentivesValidationTableEvnt.fire();
        }*/
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        if(component.get("v.isRenewalConfirmedValueContainsYes")==false &&
           component.get("v.selectAllCheckBoxValue")==true && renewalStatusRecord.Eligible_for_Sales_Incentives__c=='Yes'
           && !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && firstRecordFromWhichDataFlows.Id== renewalStatusRecord.Id )
        {
            firstRecordFromWhichDataFlows={};
            component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
        }
        
        
        

        
    },
    
    salesIncentivesBeSplitChangeHandler:function(component,event,helper) {
        var willSalesIncentivesBeSplitVal=component.find('Will_sales_incentives_be_split__c').get('v.value');
        var renewalStatusRecord = component.get("v.renewalStatus");
        if(willSalesIncentivesBeSplitVal == 'No' )
        {
            //component.find('Sales_Person_1_User__c').set('v.value','');
            renewalStatusRecord.Sales_person_1__c=renewalStatusRecord.Company__r.OwnerId;
            
            renewalStatusRecord.Sales_Person_1_split_percentage__c='100';
            renewalStatusRecord.Sales_Person_2__c='';
            renewalStatusRecord.Sales_Person_2_Split_percentage__c='';
            $A.util.removeClass(component.find('Will_sales_incentives_be_split__c'), 'slds-has-error');
        }
        if(willSalesIncentivesBeSplitVal == 'Yes' )
        {
            renewalStatusRecord.Sales_person_1__c=renewalStatusRecord.Company__r.OwnerId;
            renewalStatusRecord.Sales_Person_1_split_percentage__c='';
            renewalStatusRecord.Sales_Person_2__c='';
            renewalStatusRecord.Sales_Person_2_Split_percentage__c='';
            $A.util.removeClass(component.find('Will_sales_incentives_be_split__c'), 'slds-has-error');
            
        }
        if(willSalesIncentivesBeSplitVal == '')
        {
            renewalStatusRecord.Sales_person_1__c='';
            renewalStatusRecord.Sales_Person_1_split_percentage__c='';
            renewalStatusRecord.Sales_Person_2__c='';
            renewalStatusRecord.Sales_Person_2_Split_percentage__c='';
        }
        
        if(willSalesIncentivesBeSplitVal == 'Yes' || willSalesIncentivesBeSplitVal == 'No')
        {
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var lookUpTarget = component.find("removeSearch");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var userLookUpField1 = component.find("userLookUpField1");
            $A.util.addClass(userLookUpField1, 'slds-hide');
            $A.util.removeClass(userLookUpField1, 'slds-show');
            component.set("v.selectedRecordName" ,renewalStatusRecord.Company__r.Owner.Name);
        }
        
        component.set("v.renewalStatus",renewalStatusRecord);
        
        component.set("v.selectedRecord",renewalStatusRecord.Sales_person_1__c);
        
        component.set("v.SearchKeyWord",'');
        component.set("v.SearchKeyWord2",'');
        
        var renewalStatusRecordsTobeUpdatedMap= component.get("v.renewalStatusRecordsTobeUpdatedMap");
        
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
           && renewalStatusRecordsTobeUpdatedMap!= '')
        {
            
            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
		
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        if(component.get("v.selectAllCheckBoxValue") && !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
        var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
        salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"Will_sales_incentives_be_split__c"});
        salesIncentivesValidationTableEvnt.fire();
        }
        
        var selectAllReadyToSendRecordsMap=component.get("v.selectAllReadyToSendRecordsMap");
        if(!helper.isMapEmpty1(selectAllReadyToSendRecordsMap) && selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]!=undefined)
        {
            selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]=true;
        }
        component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
    },
    
    renewalStatusRecordChangeHandler:function(component,event,helper) {
        
        var isRenStatusRecValue=component.find('isRenStatusRec').get('v.value'); 
        var renewalStatusRecord = component.get("v.renewalStatus");
        if(isRenStatusRecValue == false)
        {
            var renewalConfirmedMembersSaleCmp=component.find('Renewal_Confirmed_Members_Sale__c');
            if(renewalConfirmedMembersSaleCmp!=undefined && renewalConfirmedMembersSaleCmp!='' &&
               renewalConfirmedMembersSaleCmp!=null)
            {
                component.find('Renewal_Confirmed_Members_Sale__c').set('v.value','');
            }
            var productConfirmedCmp=component.find('Product_Confirmed__c');
            if(productConfirmedCmp!=undefined && productConfirmedCmp!='' &&
               productConfirmedCmp!=null)
            {
                component.find('Product_Confirmed__c').set('v.value','');
            }
            var willSalesIncentivesBeSplitCmp=component.find('Will_sales_incentives_be_split__c');
            if(willSalesIncentivesBeSplitCmp!=undefined && willSalesIncentivesBeSplitCmp!='' &&
               willSalesIncentivesBeSplitCmp!=null)
            {
                component.find('Will_sales_incentives_be_split__c').set('v.value','');
            }
            renewalStatusRecord.Sales_person_1__c='';
            //component.find('Sales_Person_1_User__c').set('v.value','');
            var salesPerson1SplitPercentageCmp=component.find('Sales_Person_1_split_percentage__c');
            if(salesPerson1SplitPercentageCmp!=undefined && salesPerson1SplitPercentageCmp!='' &&
               salesPerson1SplitPercentageCmp!=null)
            {
                component.find('Sales_Person_1_split_percentage__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_1_split_percentage__c='';
            var SalesPerson2Cmp=component.find('Sales_Person_2__c');
            if(SalesPerson2Cmp!=undefined && SalesPerson2Cmp!='' &&
               SalesPerson2Cmp!=null)
            {
                component.find('Sales_Person_2__c').set('v.value','');
            }
            var salesPerson2SplitPercentageCmp=component.find('Sales_Person_2_Split_percentage__c');
            if(salesPerson2SplitPercentageCmp!=undefined && salesPerson2SplitPercentageCmp!='' &&
               salesPerson2SplitPercentageCmp!=null)
            {
                component.find('Sales_Person_2_Split_percentage__c').set('v.value','');
            }
            
            renewalStatusRecord.Confirmed_By__c='';
            renewalStatusRecord.Confirmed_Date__c='';
            renewalStatusRecord.Date_sent_to_ISI_Site__c='';
            renewalStatusRecord.Current_Deal_Next_Renewal_Date__c='';
            
            component.set("v.renewalStatus",renewalStatusRecord);
            
        }
        var renewalStatusRecordsTobeUpdatedMap= component.get("v.renewalStatusRecordsTobeUpdatedMap");
        
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
           && renewalStatusRecordsTobeUpdatedMap!= '')
        {
            
            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
        
    },
    
    /*splitPercentChangeHandler:function(component,event,helper) {
        
        var renewalStatusRecord = component.get("v.renewalStatus");
        var salesPerson1SplitPercentCmp=component.find('Sales_Person_1_split_percentage__c');
        if(salesPerson1SplitPercentCmp!=undefined && salesPerson1SplitPercentCmp!='' &&
           salesPerson1SplitPercentCmp!=null)
        {
            if(component.find('Sales_Person_1_split_percentage__c').get('v.value') != '')
            {
                $A.util.removeClass(component.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
            }
            
        }
        
        var salesPerson2SplitPercentCmp=component.find('Sales_Person_2_Split_percentage__c');
        if(salesPerson2SplitPercentCmp!=undefined && salesPerson2SplitPercentCmp!='' &&
           salesPerson2SplitPercentCmp!=null)
        {
            if(component.find('Sales_Person_2_Split_percentage__c').get('v.value') != '')
            {
                $A.util.removeClass(component.find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
            }
            
        }
        
        /*if((renewalStatusRecord.Sales_Person_2_Split_percentage__c!='' && renewalStatusRecord.Sales_Person_2_Split_percentage__c!= undefined && renewalStatusRecord.Sales_Person_2_Split_percentage__c!=null) 
           && (renewalStatusRecord.Sales_Person_1_split_percentage__c!='' && renewalStatusRecord.Sales_Person_1_split_percentage__c!=undefined && renewalStatusRecord.Sales_Person_1_split_percentage__c!=null))
        {
            var salesPerson1SplitPercent=parseInt(renewalStatusRecord.Sales_Person_1_split_percentage__c);
            var salesPerson2SplitPercent=parseInt(renewalStatusRecord.Sales_Person_2_Split_percentage__c);
            var totalSplitPercentage=salesPerson1SplitPercent+salesPerson2SplitPercent;
            
            
            if(totalSplitPercentage!=100)
            {
                $A.util.addClass(component.find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                $A.util.addClass(component.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                
            }
            else
            {
                $A.util.removeClass(component.find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                $A.util.removeClass(component.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
            }
            
            
            
            
        }*/
    
    
    
    /* var renewalStatusRecordsTobeUpdatedMap= component.get("v.renewalStatusRecordsTobeUpdatedMap");
        
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
          			&& renewalStatusRecordsTobeUpdatedMap!= '')
        {

            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
         var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
         eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;

        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);        
    },*/
    
    productsConfirmedChangeHandler:function(component,event,helper) {
        var productsRenewedVal=component.find('Product_Confirmed__c').get('v.value');
        var renewalStatusRecord = component.get("v.renewalStatus");
        
        if(productsRenewedVal!= undefined && productsRenewedVal!='')
        {
            $A.util.removeClass(component.find('Product_Confirmed__c'), 'slds-has-error');
        }
        
        
        var renewalStatusRecordsTobeUpdatedMap= component.get("v.renewalStatusRecordsTobeUpdatedMap");
        
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
           && renewalStatusRecordsTobeUpdatedMap!= '')
        {
            
            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
        
    },
    
    submitForSalesIncentivesChangeHandler:function(component,event,helper) {
        var submitForSalesIncentivesValue=component.find('submitForSalesIncentives').get('v.value'); 
        var renewalStatusRecord = component.get("v.renewalStatus");
        
        if(submitForSalesIncentivesValue == false)
        {
            var willSalesIncentivesBeSplitCmp=component.find('Will_sales_incentives_be_split__c');
            if(willSalesIncentivesBeSplitCmp!=undefined && willSalesIncentivesBeSplitCmp!='' &&
               willSalesIncentivesBeSplitCmp!=null)
            {
                component.find('Will_sales_incentives_be_split__c').set('v.value','');
            }
            renewalStatusRecord.Will_sales_incentives_be_split__c='';
            renewalStatusRecord.Sales_person_1__c='';
            //component.find('Sales_Person_1_User__c').set('v.value','');
            var salesPerson1SplitPercentageCmp=component.find('Sales_Person_1_split_percentage__c');
            if(salesPerson1SplitPercentageCmp!=undefined && salesPerson1SplitPercentageCmp!='' &&
               salesPerson1SplitPercentageCmp!=null)
            {
                component.find('Sales_Person_1_split_percentage__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_1_split_percentage__c='';
            var SalesPerson2Cmp=component.find('Sales_Person_2__c');
            if(SalesPerson2Cmp!=undefined && SalesPerson2Cmp!='' &&
               SalesPerson2Cmp!=null)
            {
                component.find('Sales_Person_2__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_2__c='';
            var salesPerson2SplitPercentageCmp=component.find('Sales_Person_2_Split_percentage__c');
            if(salesPerson2SplitPercentageCmp!=undefined && salesPerson2SplitPercentageCmp!='' &&
               salesPerson2SplitPercentageCmp!=null)
            {
                component.find('Sales_Person_2_Split_percentage__c').set('v.value','');
            }
            renewalStatusRecord.Sales_Person_2_Split_percentage__c='';
            renewalStatusRecord.Date_Submitted_For_Incentives__c='';                   
        }
        if(submitForSalesIncentivesValue == true)
        {
            
            //var currentDateTime= new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString();
            var currentDateTime= new Date().toISOString();
            renewalStatusRecord.Date_Submitted_For_Incentives__c=currentDateTime;
            
            
        }
        component.set("v.renewalStatus",renewalStatusRecord); 
        component.set("v.SearchKeyWord",'');
        component.set("v.SearchKeyWord2",'');
        
        var renewalStatusRecordsTobeUpdatedMap=component.get("v.renewalStatusRecordsTobeUpdatedMap");
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
           && renewalStatusRecordsTobeUpdatedMap!= '')
        {
            
            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
    	
        var selectAllReadyToSendRecordsMap=component.get("v.selectAllReadyToSendRecordsMap");
        var existingReadyToSendCheckedRecordsMap=component.get("v.existingReadyToSendCheckedRecordsMap");
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        if(!helper.isMapEmpty1(selectAllReadyToSendRecordsMap) && submitForSalesIncentivesValue == false
          && component.get("v.selectAllCheckBoxValue")==true)
        {
            if(selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]!=undefined)
            {
                delete selectAllReadyToSendRecordsMap[renewalStatusRecord.Id];
            }
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
        }
        if(!helper.isMapEmpty1(existingReadyToSendCheckedRecordsMap) && submitForSalesIncentivesValue == false
          && component.get("v.selectAllCheckBoxValue")==false)
        {
            if(existingReadyToSendCheckedRecordsMap[renewalStatusRecord.Id]!=undefined)
            {
                delete existingReadyToSendCheckedRecordsMap[renewalStatusRecord.Id];
            }
            component.set("v.existingReadyToSendCheckedRecordsMap",existingReadyToSendCheckedRecordsMap);
        }
        /*if(submitForSalesIncentivesValue == false
          && component.get("v.selectAllCheckBoxValue")==false)
        {
            if(selectAllReadyToSendRecordsMap!=undefined)
            {
                selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]=false;
            }
            else
            {
                selectAllReadyToSendRecordsMap={};
                selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]=false;
            }
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
        }*/
        if(submitForSalesIncentivesValue == true
           && component.get("v.selectAllCheckBoxValue")==true && !helper.isMapEmpty1(firstRecordFromWhichDataFlows))
        {
            if(!helper.isMapEmpty1(selectAllReadyToSendRecordsMap))
            {
                selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]=false;
            }
            else
            {
                selectAllReadyToSendRecordsMap={};
                selectAllReadyToSendRecordsMap[renewalStatusRecord.Id]=false;
            }
            /*if(firstRecordFromWhichDataFlows!=undefined)
            {
                renewalStatusRecord.Will_sales_incentives_be_split__c=firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                renewalStatusRecord.Sales_Person_1_split_percentage__c=firstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                renewalStatusRecord.Sales_Person_2_Split_percentage__c=firstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
            }*/
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
            /*var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
            if(component.get("v.selectAllCheckBoxValue") && !helper.isMapEmpty1(firstRecordFromWhichDataFlows)){
                var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
                salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"submitForSalesIncentives"});
                salesIncentivesValidationTableEvnt.fire();
            }*/
            
        }
        
        //component.set("v.renewalStatus",renewalStatusRecord);
    
    },
    
    crntDlNxtRnwlDtChangeHandler:function(component,event,helper) {
        
        var currentDealNextRenewalDateValue=component.find('Current_Deal_Next_Renewal_Date__c').get('v.value'); 
        if(currentDealNextRenewalDateValue!=undefined || currentDealNextRenewalDateValue!=null 
           || currentDealNextRenewalDateValue!= '' )
        {
            var renewalStatusRecord = component.get("v.renewalStatus");
            
            var renewalStatusRecordsTobeUpdatedMap=component.get("v.renewalStatusRecordsTobeUpdatedMap");
            if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
               && renewalStatusRecordsTobeUpdatedMap!= '')
            {
                
                renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
            }
            
            
            component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
            
            var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
            
            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
            
            component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
            
            
        }
        
        
        
    },
    
    handleClick: function(component, event, helper) {
        var mainDiv = component.find('main-div');
        $A.util.addClass(mainDiv, 'slds-is-open');
    },
    
    handleMouseLeave: function(component, event, helper) {
        component.set("v.dropdownOver",false);
        var mainDiv = component.find('main-div');
        $A.util.removeClass(mainDiv, 'slds-is-open');
    },
    
    handleMouseEnter: function(component, event, helper) {
        component.set("v.dropdownOver",true);
    },
    
    handleMouseOutButton: function(component, event, helper) {
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    //if dropdown over, user has hovered over the dropdown, so don't close.
                    if (component.get("v.dropdownOver")) {
                        return;
                    }
                    var mainDiv = component.find('main-div');
                    $A.util.removeClass(mainDiv, 'slds-is-open');
                }
            }), 200
        );
    },
    
    
    handleSelection:function(component, event, helper) 
    {
        var renewalStatusRecord = component.get("v.renewalStatus");
        
        
        var item = event.currentTarget;
        if (item && item.dataset) {
            var value = item.dataset.value;
            var selected = item.dataset.selected;
            
            var options = component.get("v.options_");
            
            options.forEach(function(element) {
                if (element.value == value) {
                    element.selected = selected == "true" ? false : true;
                }
            });
            component.set("v.options_", options);
            var values = helper.getSelectedValues(component);
            var labels = helper.getSelectedLabels(component);
            
            helper.setInfoText(component,values);
            //helper.despatchSelectChangeEvent(component,labels);
            var productRenewedValue='';
            for(var i=0;i<values.length;i++)
            {
                if(i==0)
                {
                    productRenewedValue=values[i];
                }
                else
                {
                    productRenewedValue=productRenewedValue+';'+values[i];
                }
                
            }
            renewalStatusRecord.Product_Confirmed__c=productRenewedValue;
        }
        
        
        component.set("v.renewalStatus",renewalStatusRecord);
        
        if(renewalStatusRecord.Product_Confirmed__c!=undefined || renewalStatusRecord.Product_Confirmed__c!='')
        {
            var productsRenewedVal=component.find('main-div');
            var renewalStatusRecord = component.get("v.renewalStatus");
            
            if(productsRenewedVal!= undefined && productsRenewedVal!='')
            {
                $A.util.removeClass(component.find('main-div'), 'slds-has-error');
            }
        }
        
        var renewalStatusRecordsTobeUpdatedMap= component.get("v.renewalStatusRecordsTobeUpdatedMap");
        
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
           && renewalStatusRecordsTobeUpdatedMap!= '')
        {
            
            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
        
        
        
    },
    
    onfocus : function(component,event,helper){
        $A.util.addClass(component.find("mySpinner"), "slds-show");
        var forOpen = component.find("searchRes");
        $A.util.addClass(forOpen, 'slds-is-open');
        $A.util.removeClass(forOpen, 'slds-is-close');
        helper.searchHelper(component,event,'');
    },
    onfocus2 : function(component,event,helper){
        $A.util.addClass(component.find("mySpinner"), "slds-show");
        var forOpen2 = component.find("searchRes2");
        $A.util.addClass(forOpen2, 'slds-is-open');
        $A.util.removeClass(forOpen2, 'slds-is-close');
        helper.searchHelper2(component,event,'');
    },
    
    onblur : function(component,event,helper){
        component.set("v.listOfSearchRecords", null );
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },
    onblur2 : function(component,event,helper){
        component.set("v.listOfSearchRecords2", null );
        var forclose2 = component.find("searchRes2");
        $A.util.addClass(forclose2, 'slds-is-close');
        $A.util.removeClass(forclose2, 'slds-is-open');
    },
    
    keyPressController : function(component, event, helper) {
        var getInputkeyWord = component.get("v.SearchKeyWord");
        if( getInputkeyWord.length > 0 ){
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            $A.util.removeClass(forOpen, 'slds-has-error');
            var removeHighlight = component.find("Sales_Person_1_User__c");
            $A.util.removeClass(removeHighlight, 'slds-has-error');
            helper.searchHelper(component,event,getInputkeyWord);
        }
        else{ 
            
            /*component.set("v.listOfSearchRecords", null );
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');*/
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            $A.util.removeClass(forOpen, 'slds-has-error');
            var removeHighlight = component.find("Sales_Person_1_User__c");
            $A.util.removeClass(removeHighlight, 'slds-has-error');
            helper.searchHelper(component,event,'');
        }
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var renewalStatusRecord=component.get("v.renewalStatus");
        if(component.get("v.selectAllCheckBoxValue") && !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
            var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
            salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"keyPressSalesPerson1"});
            salesIncentivesValidationTableEvnt.fire();
        }  
    },
    keyPressController2 : function(component, event, helper) {
        var getInputkeyWord2 = component.get("v.SearchKeyWord2");
        if( getInputkeyWord2.length > 0 ){
            var forOpen2 = component.find("searchRes2");
            $A.util.addClass(forOpen2, 'slds-is-open');
            $A.util.removeClass(forOpen2, 'slds-is-close');
            $A.util.removeClass(forOpen2, 'slds-has-error');
            var removeHighlight2 = component.find("Sales_Person_2__c")
            $A.util.removeClass(removeHighlight2, 'slds-has-error');
            helper.searchHelper2(component,event,getInputkeyWord2);
        }else{  
            /*component.set("v.listOfSearchRecords2", null );
            var forclose2 = component.find("searchRes2");
            $A.util.addClass(forclose2, 'slds-is-close');
            $A.util.removeClass(forclose2, 'slds-is-open');*/
            var forOpen2 = component.find("searchRes2");
            $A.util.addClass(forOpen2, 'slds-is-open');
            $A.util.removeClass(forOpen2, 'slds-is-close');
            $A.util.removeClass(forOpen2, 'slds-has-error');
            var removeHighlight2 = component.find("Sales_Person_2__c")
            $A.util.removeClass(removeHighlight2, 'slds-has-error');
            helper.searchHelper2(component,event,'');
        }
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var renewalStatusRecord=component.get("v.renewalStatus");
        if(component.get("v.selectAllCheckBoxValue") && !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
            var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
            salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"keyPressSalesPerson2"});
            salesIncentivesValidationTableEvnt.fire();
        }  
        
    },
    
    clear :function(component,event,helper){
        var pillTarget = component.find("lookup-pill");
        var lookUpTarget = component.find("lookupField");
        //var keepsearch = component.find("keepSearch");
        var removesearch = component.find("removeSearch");
        
        $A.util.addClass(pillTarget, 'slds-hide');
        $A.util.removeClass(pillTarget, 'slds-show');
        
        $A.util.addClass(lookUpTarget, 'slds-show');
        $A.util.removeClass(lookUpTarget, 'slds-hide');
        
        $A.util.addClass(removesearch, 'slds-show');
        $A.util.removeClass(removesearch, 'slds-hide');
        
        /*$A.util.addClass(keepsearch, 'slds-show');
        $A.util.removeClass(keepsearch, 'slds-hide');*/
        
        var userLookUpField1 = component.find("userLookUpField1");
        $A.util.addClass(userLookUpField1, 'slds-show');
        $A.util.removeClass(userLookUpField1, 'slds-hide');
        component.set('v.renewalStatus.Sales_person_1__c','');
        
        component.set("v.SearchKeyWord",null);
        component.set("v.listOfSearchRecords", null );
        component.set("v.selectedRecord", {} );
        
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var renewalStatusRecord=component.get("v.renewalStatus");
        if(component.get("v.selectAllCheckBoxValue") && !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
        var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
        salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"clear_Sales_Person_1"});
        salesIncentivesValidationTableEvnt.fire();
        }
    },
    clear2 :function(component,event,helper){
        var pillTarget2 = component.find("lookup-pill2");
        var lookUpTarget2 = component.find("lookupField2");
        var removesearch2 = component.find("removeSearchIcn");
        
        $A.util.addClass(pillTarget2, 'slds-hide');
        $A.util.removeClass(pillTarget2, 'slds-show');
        
        $A.util.addClass(lookUpTarget2, 'slds-show');
        $A.util.removeClass(lookUpTarget2, 'slds-hide');
        
        $A.util.addClass(removesearch2, 'slds-show');
        $A.util.removeClass(removesearch2, 'slds-hide');
        
        var userLookUpField2 = component.find("userLookUpField2");
        $A.util.addClass(userLookUpField2, 'slds-show');
        $A.util.removeClass(userLookUpField2, 'slds-hide');
        component.set('v.renewalStatus.Sales_Person_2__c','');
        
        component.set("v.SearchKeyWord2",null);
        component.set("v.listOfSearchRecords2", null );
        component.set("v.selectedRecord2", {} );
        
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var renewalStatusRecord=component.get("v.renewalStatus");
        if(component.get("v.selectAllCheckBoxValue") && !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
        var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
        salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"clear_Sales_Person_2"});
        salesIncentivesValidationTableEvnt.fire();
        }
    },
    
    handleComponentEvent : function(component, event, helper) {
        
        
        
        
        var renewalStatusRecord=component.get('v.renewalStatus');
        var isSalesPerson1=event.getParam("isSalesPerson1");
        var isSalesPerson2=event.getParam("isSalesPerson2");
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        if(isSalesPerson1)
        {
            var removeHighlight = component.find("Sales_Person_1_User__c");
            $A.util.removeClass(removeHighlight,'slds-has-error');
            
            var selectedAccountGetFromEvent = event.getParam("recordByEvent");
            var UserId = event.getParam("getSelectedRecordID");
            renewalStatusRecord.Sales_person_1__c=UserId;
            component.set("v.selectedRecord" , selectedAccountGetFromEvent);
            
            if(selectedAccountGetFromEvent.hasOwnProperty('User__c'))
            {
                component.set("v.selectedRecordName" ,selectedAccountGetFromEvent.Name +' '+selectedAccountGetFromEvent.Last_Name__c);
                
            }
            else
            {
                component.set("v.selectedRecordName" ,selectedAccountGetFromEvent.Name);
            }
            component.set('v.renewalStatus',renewalStatusRecord);
            
            
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var lookUpTarget = component.find("removeSearch");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var userLookUpField1 = component.find("userLookUpField1");
            $A.util.addClass(userLookUpField1, 'slds-hide');
            $A.util.removeClass(userLookUpField1, 'slds-show');
        }
        
        if(isSalesPerson2)
        {
            var removeHighlight2 = component.find("Sales_Person_2__c");
            $A.util.removeClass(removeHighlight2,'slds-has-error');
            
            var selectedAccountGetFromEvent = event.getParam("recordByEvent");
            var UserId = event.getParam("getSelectedRecordID");
            renewalStatusRecord.Sales_Person_2__c=UserId;
            
            
            component.set("v.selectedRecord1" , selectedAccountGetFromEvent);  
            if(selectedAccountGetFromEvent.hasOwnProperty('User__c'))
            {
                component.set("v.selectedRecord2Name" ,selectedAccountGetFromEvent.Name+' '+selectedAccountGetFromEvent.Last_Name__c);
                
            }
            else
            {
                component.set("v.selectedRecord2Name" ,selectedAccountGetFromEvent.Name);
            }
            component.set('v.renewalStatus',renewalStatusRecord);
            
            
            var forclose = component.find("lookup-pill2");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("searchRes2");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField2");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var lookUpTarget = component.find("removeSearch2");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var userLookUpField1 = component.find("userLookUpField2");
            $A.util.addClass(userLookUpField1, 'slds-hide');
            $A.util.removeClass(userLookUpField1, 'slds-show');
        }
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
        
        if(isSalesPerson1)
        {
            var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
            if(component.get("v.selectAllCheckBoxValue") &&  !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
                var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
                salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"Sales_person_1__c"});
                salesIncentivesValidationTableEvnt.fire();
            }  
        }
        if(isSalesPerson2)
        {
            var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
            if(component.get("v.selectAllCheckBoxValue") && !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
                var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
                salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"Sales_Person_2__c"});
                salesIncentivesValidationTableEvnt.fire();
            }  
        }
        
    },
    
    splitPercentChangeHandler:function(component,event,helper) {
        
        var renewalStatusRecord = component.get("v.renewalStatus");
        var salesPerson1SplitPercentCmp=component.find('Sales_Person_1_split_percentage__c');
        if(salesPerson1SplitPercentCmp!=undefined && salesPerson1SplitPercentCmp!='' &&
           salesPerson1SplitPercentCmp!=null)
        {
            if(component.find('Sales_Person_1_split_percentage__c').get('v.value') != '')
            {
                
                $A.util.removeClass(component.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                $A.util.removeClass(component.find('Sales_Person_2_Split_percentage__c'),'slds-has-error');
            }
            /*if(component.find('Sales_Person_1_split_percentage__c').get('v.value') == ''){*/
            
            var salesPerson2value = "";
            var salesPerson1value = component.find('Sales_Person_1_split_percentage__c').get('v.value');
            if(!isNaN( salesPerson1value)){
            if(salesPerson1value > 100){
                
                $A.util.addClass(component.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                component.find('Sales_Person_2_Split_percentage__c').set('v.value','');
                
            }else if(salesPerson1value <= 100 && salesPerson1value >= 0){
                salesPerson2value = 100 - salesPerson1value;
                component.find('Sales_Person_2_Split_percentage__c').set('v.value',salesPerson2value);
                
            }else if(salesPerson2value =='')
            {
                var salesPerson2value = component.find('Sales_Person_2_Split_percentage__c').get('v.value');
                /*var clear = component.find('Sales_Person_1_split_percentage__c').get('v.value');
                    if(clear != ''){}*/
            }
            if(salesPerson1value == ''){
                component.find('Sales_Person_2_Split_percentage__c').set('v.value','');
            }
            }else{
                
                /*$A.util.addClass(component.find('Sales_Person_1_split_percentage__c'), 'slds-has-error'); */
                 component.find('Sales_Person_1_split_percentage__c').set('v.value','');               
            }
            /*}*/
        }
        
        
        var renewalStatusRecordsTobeUpdatedMap= component.get("v.renewalStatusRecordsTobeUpdatedMap");
        
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
           && renewalStatusRecordsTobeUpdatedMap!= '')
        {
            
            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
		
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        if(component.get("v.selectAllCheckBoxValue") && !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
        var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
        salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"Sales_Person_1_split_percentage__c"});
        salesIncentivesValidationTableEvnt.fire();
        }
        
    },
    splitPercentChangeHandler2 : function(component,event,helper){

        var renewalStatusRecord = component.get("v.renewalStatus");
        var salesPerson2SplitPercentCmp=component.find('Sales_Person_2_Split_percentage__c');
        if(salesPerson2SplitPercentCmp!=undefined && salesPerson2SplitPercentCmp!='' &&
           salesPerson2SplitPercentCmp!=null)
        {
            if(component.find('Sales_Person_2_Split_percentage__c').get('v.value') != '')
            {
                $A.util.removeClass(component.find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                $A.util.removeClass(component.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
            }
            /*if(component.find('Sales_Person_2_Split_percentage__c').get('v.value') == '')
            {*/
            var salesPerson1value = "";
            var salesPerson2value = component.find('Sales_Person_2_Split_percentage__c').get('v.value');
            if(!isNaN( salesPerson2value)){
            if(salesPerson2value > 100){
                
                $A.util.addClass(component.find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                component.find('Sales_Person_1_split_percentage__c').set('v.value','');
                
            }else if(salesPerson2value <= 100 && salesPerson2value >= 0){
                salesPerson1value = 100 - salesPerson2value;
                component.find('Sales_Person_1_split_percentage__c').set('v.value',salesPerson1value);
            }else if(salesPerson1value =='')
            {
                var salesPerson1value = component.find('Sales_Person_1_split_percentage__c').get('v.value');
                /*var clear = component.find('Sales_Person_1_split_percentage__c').get('v.value');
                    if(clear != ''){}*/
            }
            if(salesPerson2value == ''){
                component.find('Sales_Person_1_split_percentage__c').set('v.value','');
            }
                }else{
                
                /*$A.util.addClass(component.find('Sales_Person_2_Split_percentage__c'), 'slds-has-error'); */
                 component.find('Sales_Person_2_Split_percentage__c').set('v.value','');               
            }
            /*}*/
        }
        var renewalStatusRecordsTobeUpdatedMap= component.get("v.renewalStatusRecordsTobeUpdatedMap");
        
        if(renewalStatusRecordsTobeUpdatedMap!= undefined && renewalStatusRecordsTobeUpdatedMap!= null
           && renewalStatusRecordsTobeUpdatedMap!= '')
        {
            
            renewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        }
        
        
        component.set("v.renewalStatusRecordsTobeUpdatedMap",renewalStatusRecordsTobeUpdatedMap);
        
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusRecord.Id]=renewalStatusRecord;
        
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
		
		var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        if(component.get("v.selectAllCheckBoxValue") &&  !helper.isMapEmpty1(firstRecordFromWhichDataFlows) && renewalStatusRecord.Id==firstRecordFromWhichDataFlows.Id){
        var salesIncentivesValidationTableEvnt = component.getEvent("salesIncentivesValidationTableEvnt");
        salesIncentivesValidationTableEvnt.setParams({"editedRecordId":renewalStatusRecord.Id,"editedColumnName":"Sales_Person_2_Split_percentage__c"});
        salesIncentivesValidationTableEvnt.fire();
        }        
        
    },
    
    onRender:function(component,event,helper){
        var renewalStatusRecord = component.get("v.renewalStatus");
        if(renewalStatusRecord!=undefined){
            component.set("v.isPrdctTypeEnabledForPrdctDtl",helper.isPrdctTypeEnabledForPrdctDtl(renewalStatusRecord.Product_Line__c));
            component.set("v.isRenewalConfirmedValueContainsYes",helper.isRenewalConfirmed(renewalStatusRecord.Renewal_Confirmed_Members_Sale__c));
        }
        
    }
    
    
    
})