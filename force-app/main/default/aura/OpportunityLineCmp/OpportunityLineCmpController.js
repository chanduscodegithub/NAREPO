({
    doInitAction : function(component, event, helper) {
        var spinner = component.find("loadingSpinner");
        var recordId = component.get("v.recordId");
        component.set('v.recordId',recordId);
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
        helper.getOpportunityDataHelper(component, event, helper);
    },
    
    handleRecordUpdated: function(component, event, helper) {
        debugger;
        var eventParams = event.getParams();
        if(eventParams.changeType === "LOADED") {
            //component.set('v.MA_Data',component.get('v.oppRecord'));                                  
        }
        if(eventParams.refresh_ES === true) {
            //setTimeout(function())
            //component.find("recordLoader").reloadRecord();
        }
        console.log("Sales Incentives reload Table Starts");
        //var spinner = component.find("mySpinner");
        //$A.util.removeClass(spinner, "slds-hide");      
        helper.getOpportunityDataHelper(component, event, helper);
    },
    
    handleMyComponentEvent : function(component, event, helper) {
        var value = event.getParam("OpportunityLineData");
        component.set('v.OppData',value);
        /* var checked = event.getParam("checked");
        component.set('v.checked',checked); */
        var childIdBoolean = event.getParam("childIdBoolean");
        var columnId = event.getParam("columnId");
        var OppId = event.getParam("OppId");
        var selectedCheckBoxList = component.get('v.selectedCheckBoxList');
        if(selectedCheckBoxList[OppId] == true){
            //component.set('v.selectedCheckBoxList[OppId]',false);
            delete selectedCheckBoxList[OppId];
        }
        component.set('v.selectedCheckBoxList',selectedCheckBoxList);
        if(childIdBoolean == true){
            var checkSendAll = component.get('v.checked');
            if(checkSendAll == true){
                if(columnId == 'Sales_Person_1_input' || columnId == 'Sales_Person_2_input' ||columnId == 'Sales_Person_1' ||columnId == 'clear_Sales_Person_1'||columnId == 'Sales_Person_2' || columnId == 'clear_Sales_Person_2' || columnId == 'initialUnderWriterDataFlow' || columnId == 'clearInitialUnderWriterData' || columnId == 'partialUnderWriterDataFlow' || columnId == 'partialClearUnderWriterData' || columnId == 'Will_Sales_Incentive_be_split__c' || columnId == 'Will_Sales_Incentive_be_split__c'){
                    helper.copyColumnData(component, event, helper, columnId);
                } else{
                    /* var callDataCopy = component.get('c.selectAll');
                $A.enqueueAction(callDataCopy); */
                    helper.selectAll(component, event, helper);
                }
            }
        }
    },
    
    editRecord :function(component, event, helper) {
        var oppLineData = component.get('v.OpportunityLineData');
        if(oppLineData.length > 0){
            component.set('v.isBulkEdit',true);
            component.set('v.enableAllCheckBox',true);
            component.set('v.checked',false);
            var childComp = component.find('childComp');
            
            if(!Array.isArray(childComp)){
                childComp.set('v.isBulkEdit',true);
                // for(var i=0; i<childComp.length; i++){
                for(var k=0; k<childComp.find('nonEditableFields').length; k++){
                    $A.util.addClass(childComp.find('nonEditableFields')[k], 'slds-theme_shade');
                } 
                if(oppLineData[0]['Submit_for_sales_incentives__c'] == true){
                    if(oppLineData[0].Product2['Product_Line__c'] == 'Other'){
                        childComp.set('v.underWriterEnable',true);
                    }
                    if(oppLineData[0]['Submit_for_sales_incentives__c'] == true && (oppLineData[0]['Date_sent_to_ISI_Site__c'] == undefined ||oppLineData[0]['Date_sent_to_ISI_Site__c'] == null)){                        
                        childComp.set('v.isSplitEdit',true);
                        if(oppLineData[0]['Will_Sales_Incentive_be_split__c'] == 'Yes'){
                            childComp.set('v.isIncentiveEdit',true);
                            $A.util.removeClass(childComp.find('lookup-pill'),'slds-hide');
                            childComp.set('v.selectedRecord.Name',oppLineData[0]["Sales_Person_2__r"]["Name"]);
                            $A.util.addClass(childComp.find('searchRes'),'slds-is-close');
                            $A.util.removeClass(childComp.find('searchRes'),'slds-is-open');
                            $A.util.addClass(childComp.find('userLookUpField1'),'slds-hide');
                            $A.util.removeClass(childComp.find('userLookUpField1'),'slds-show');
                            $A.util.removeClass(childComp.find('removeSearch'),'slds-show');
                            $A.util.addClass(childComp.find('removeSearch'),'slds-hide');
                            
                            
                            
                            /* Pre-populating Sales Person 1 on click of edit Starts */
                            if(oppLineData[0].hasOwnProperty('Sales_Person_1__c')){
                                childComp.set('v.enableSalesPerson1',true);
                                $A.util.removeClass(childComp.find('lookup-pillSalesPerson1'),'slds-hide');
                                childComp.set('v.selectedRecordSalesPerson1.Name',oppLineData[0]["Sales_Person_1__r"]["Name"]);
                                $A.util.addClass(childComp.find('searchResSalesPerson1'),'slds-is-close');
                                $A.util.removeClass(childComp.find('searchResSalesPerson1'),'slds-is-open');
                                $A.util.addClass(childComp.find('userLookUpField1SalesPerson1'),'slds-hide');
                                $A.util.removeClass(childComp.find('userLookUpField1SalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp.find('removeSearchSalesPerson1'),'slds-show');
                                $A.util.addClass(childComp.find('removeSearchSalesPerson1'),'slds-hide');
                            } else {
                                childComp.set('v.enableSalesPerson1',true);
                                $A.util.addClass(childComp.find('lookup-pillSalesPerson1'),'slds-hide');
                                //$A.util.removeClass(childComp.find('searchResSalesPerson1'),'slds-is-close');
                                //$A.util.addClass(childComp.find('searchResSalesPerson1'),'slds-is-open');
                                $A.util.removeClass(childComp.find('userLookUpField1SalesPerson1'),'slds-hide');
                                $A.util.addClass(childComp.find('userLookUpField1SalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp.find('removeSearchSalesPerson1'),'slds-show');
                                $A.util.addClass(childComp.find('removeSearchSalesPerson1'),'slds-hide');
                            }
                            /* Pre-populating Sales Person 1 on click of edit Ends  */
                        } else if(oppLineData[0]['Will_Sales_Incentive_be_split__c'] == 'No'){
                            /* Pre-populating Sales Person 1 on click of edit Starts */
                            /*  childComp.set('v.enableSalesPerson1',true);
                            $A.util.removeClass(childComp.find('lookup-pillSalesPerson1'),'slds-hide');
                            childComp.set('v.selectedRecordSalesPerson1.Name',oppLineData[0]["Sales_Person_1__r"]["Name"]);
                            $A.util.addClass(childComp.find('searchResSalesPerson1'),'slds-is-close');
                            $A.util.removeClass(childComp.find('searchResSalesPerson1'),'slds-is-open');
                            $A.util.addClass(childComp.find('userLookUpField1SalesPerson1'),'slds-hide');
                            $A.util.removeClass(childComp.find('userLookUpField1SalesPerson1'),'slds-show');
                            $A.util.removeClass(childComp.find('removeSearchSalesPerson1'),'slds-show');
                            $A.util.addClass(childComp.find('removeSearchSalesPerson1'),'slds-hide'); */
                            if(oppLineData[0].hasOwnProperty('Sales_Person_1__c')){
                                childComp.set('v.enableSalesPerson1',true);
                                $A.util.removeClass(childComp.find('lookup-pillSalesPerson1'),'slds-hide');
                                childComp.set('v.selectedRecordSalesPerson1.Name',oppLineData[0]["Sales_Person_1__r"]["Name"]);
                                $A.util.addClass(childComp.find('searchResSalesPerson1'),'slds-is-close');
                                $A.util.removeClass(childComp.find('searchResSalesPerson1'),'slds-is-open');
                                $A.util.addClass(childComp.find('userLookUpField1SalesPerson1'),'slds-hide');
                                $A.util.removeClass(childComp.find('userLookUpField1SalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp.find('removeSearchSalesPerson1'),'slds-show');
                                $A.util.addClass(childComp.find('removeSearchSalesPerson1'),'slds-hide');
                            } else {
                                childComp.set('v.enableSalesPerson1',true);
                                $A.util.addClass(childComp.find('lookup-pillSalesPerson1'),'slds-hide');
                                //$A.util.removeClass(childComp.find('searchResSalesPerson1'),'slds-is-close');
                                //$A.util.addClass(childComp.find('searchResSalesPerson1'),'slds-is-open');
                                $A.util.removeClass(childComp.find('userLookUpField1SalesPerson1'),'slds-hide');
                                $A.util.addClass(childComp.find('userLookUpField1SalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp.find('removeSearchSalesPerson1'),'slds-show');
                                $A.util.addClass(childComp.find('removeSearchSalesPerson1'),'slds-hide');
                            }
                            /* Pre-populating Sales Person 1 on click of edit Ends  */
                        }
                    }else {
                        childComp.set('v.isBulkEdit',false);
                        for(var k=0; k<childComp.find('addThemeShade').length; k++){
                            $A.util.addClass(childComp.find('addThemeShade')[k], 'slds-theme_shade');
                            childComp.set('v.underWriterEnable',false);
                        } 
                    }
                } else {
                    childComp.set('v.isBulkEdit',true);
                }
                if((oppLineData[0]['Product2']['Product_Line__c'] == 'Other' && (oppLineData[0]["Underwriting_Validation__c"] == undefined || oppLineData[0]["Underwriting_Validation__c"] == 'No')) || (oppLineData[0]['Product2']['Product_Line__c']== 'Medical' || oppLineData[0]['Product2']['Product_Line__c']== 'Dental' || oppLineData[0]['Product2']['Product_Line__c']== 'Pharmacy' || oppLineData[0]['Product2']['Product_Line__c'] == 'Vision')){
                    childComp.set('v.removeUnderWriter',false);
                    childComp.set('v.underWriterEnable',false);
                    $A.util.addClass(childComp.find('UnderWriterThemeShade'), 'slds-theme_shade');
                } else {
                    childComp.set('v.removeUnderWriter',true);
                    $A.util.removeClass(childComp.find('lookup-pillUW'),'slds-hide');
                    childComp.set('v.selectedUnderWriter.Underwriter_Name__c',oppLineData[0]["Underwriter__c"]);
                    $A.util.addClass(childComp.find('searchResUnderWriter'),'slds-is-close');
                    $A.util.removeClass(childComp.find('searchResUnderWriter'),'slds-is-open');
                    $A.util.addClass(childComp.find('userLookUpField2'),'slds-hide');
                    $A.util.removeClass(childComp.find('userLookUpField2'),'slds-show');
                    $A.util.removeClass(childComp.find('removeSearchUW'),'slds-show');
                    $A.util.addClass(childComp.find('removeSearchUW'),'slds-hide');
                }
                
                // }
            } else {
                
                for(var i=0; i<childComp.length; i++){
                    childComp[i].set('v.isBulkEdit',true);
                }
                
                for(var i=0; i<childComp.length; i++){
                    for(var k=0; k<childComp[i].find('nonEditableFields').length; k++){
                        $A.util.addClass(childComp[i].find('nonEditableFields')[k], 'slds-theme_shade');
                    } 
                    if(oppLineData[i]['Submit_for_sales_incentives__c'] == true){
                        if(oppLineData[i].Product2['Product_Line__c'] == 'Other'){
                            childComp[i].set('v.underWriterEnable',true);
                        }
                        if(oppLineData[i]['Submit_for_sales_incentives__c'] == true && (oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined ||oppLineData[i]['Date_sent_to_ISI_Site__c'] == null)){                        
                            childComp[i].set('v.isSplitEdit',true);
                            if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'Yes'){
                                childComp[i].set('v.isIncentiveEdit',true);
                                $A.util.removeClass(childComp[i].find('lookup-pill'),'slds-hide');
                                childComp[i].set('v.selectedRecord.Name',oppLineData[i]["Sales_Person_2__r"]["Name"]);
                                $A.util.addClass(childComp[i].find('searchRes'),'slds-is-close');
                                $A.util.removeClass(childComp[i].find('searchRes'),'slds-is-open');
                                $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('userLookUpField1'),'slds-show');
                                $A.util.removeClass(childComp[i].find('removeSearch'),'slds-show');
                                $A.util.addClass(childComp[i].find('removeSearch'),'slds-hide');
                                
                                
                                /* Pre-populating Sales Person 1 on click of edit Starts */ 
                                if(oppLineData[i].hasOwnProperty('Sales_Person_1__c')){
                                    childComp[i].set('v.enableSalesPerson1',true);
                                    $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                    childComp[i].set('v.selectedRecordSalesPerson1.Name',oppLineData[i]["Sales_Person_1__r"]["Name"]);
                                    $A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                    $A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                    $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                    $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                    $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                                } else {
                                    childComp[i].set('v.enableSalesPerson1',true);
                                    $A.util.addClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                    //$A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                    //$A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                    $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                    $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                    $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                                }
                            } else if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'No'){
                                /*  childComp[i].set('v.enableSalesPerson1',true);
                                $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                childComp[i].set('v.selectedRecordSalesPerson1.Name',oppLineData[i]["Sales_Person_1__r"]["Name"]);
                                $A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                $A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide'); */
                                if(oppLineData[i].hasOwnProperty('Sales_Person_1__c')){
                                    childComp[i].set('v.enableSalesPerson1',true);
                                    $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                    childComp[i].set('v.selectedRecordSalesPerson1.Name',oppLineData[i]["Sales_Person_1__r"]["Name"]);
                                    $A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                    $A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                    $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                    $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                    $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                                } else {
                                    childComp[i].set('v.enableSalesPerson1',true);
                                    $A.util.addClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                    //$A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                    //$A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                    $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                    $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                    $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                                }
                                /* Pre-populating Sales Person 1 on click of edit Ends  */
                            }
                        }else {
                            childComp[i].set('v.isBulkEdit',false);
                            for(var k=0; k<childComp[i].find('addThemeShade').length; k++){
                                $A.util.addClass(childComp[i].find('addThemeShade')[k], 'slds-theme_shade');
                                childComp[i].set('v.underWriterEnable',false);
                            } 
                        }
                    } else {
                        childComp[i].set('v.isBulkEdit',true);
                    }
                    if((oppLineData[i].Product2['Product_Line__c'] == 'Other' && (oppLineData[i]["Underwriting_Validation__c"] == undefined || oppLineData[i]["Underwriting_Validation__c"] == 'No')) || (oppLineData[i].Product2['Product_Line__c'] == 'Medical' || oppLineData[i].Product2['Product_Line__c'] == 'Dental' || oppLineData[i].Product2['Product_Line__c'] == 'Pharmacy' || oppLineData[i].Product2['Product_Line__c'] == 'Vision')){
                        childComp[i].set('v.removeUnderWriter',false);
                        childComp[i].set('v.underWriterEnable',false);
                        $A.util.addClass(childComp[i].find('UnderWriterThemeShade'), 'slds-theme_shade');
                    } else {
                        childComp[i].set('v.removeUnderWriter',true);
                        $A.util.removeClass(childComp[i].find('lookup-pillUW'),'slds-hide');
                        childComp[i].set('v.selectedUnderWriter.Underwriter_Name__c',oppLineData[i]["Underwriter__c"]);
                        $A.util.addClass(childComp[i].find('searchResUnderWriter'),'slds-is-close');
                        $A.util.removeClass(childComp[i].find('searchResUnderWriter'),'slds-is-open');
                        $A.util.addClass(childComp[i].find('userLookUpField2'),'slds-hide');
                        $A.util.removeClass(childComp[i].find('userLookUpField2'),'slds-show');
                        $A.util.removeClass(childComp[i].find('removeSearchUW'),'slds-show');
                        $A.util.addClass(childComp[i].find('removeSearchUW'),'slds-hide');
                    }
                    
                }
            }
        } else{
            console.log('No records found');
        }
        
    },
    
    cancelRecord: function(component, event, helper) {
        component.set('v.isBulkEdit',false);
        component.set('v.enableAllCheckBox',true);
        var childComp = component.find('childComp');
        for(var i=0; i<childComp.length; i++){
            childComp[i].set('v.isBulkEdit',false);
        }
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
        helper.getOpportunityDataHelper(component, event, helper);
    },
    closeModel: function(component, event, helper) {
        component.set("v.failureRecords",[]); 
        component.set("v.isModalOpen", false);
        
    },
    saveRecord: function(component, event, helper) {
        
        var isSalesInceniveSubmitFailed = '' ;
        var failureRecords = [];
        var errorItem = {};
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var ChildComp = component.find('childComp');
        var currentDateTime= new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString();
        var OpportunityLineData = component.get('v.OpportunityLineData');
        
        var selectedCheckBoxList = component.get('v.selectedCheckBoxList');
        var selectAllBox = component.get('v.checked'); 
        var childComp = component.find('childComp');
        /*   if(selectAllBox == true){
            for(var i=1; i<childComp.length; i++){
                
                if(selectedCheckBoxList[OpportunityLineData[i]['Id']] != true ){
                    if(OpportunityLineData[i]['Date_sent_to_ISI_Site__c'] == null && OpportunityLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                        childComp[i].set('v.OpportunityLineData.Sales_Person_1_split_percentage__c',childComp[0].get('v.OpportunityLineData.Sales_Person_1_split_percentage__c'));
                        //childComp[i].set('v.OpportunityLineData.Sales_Person_2__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2__c'));
                        //childComp[i].set('v.OpportunityLineData.Sales_Person_2_split_percentage__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2_split_percentage__c'));
                        childComp[i].set('v.OpportunityLineData.Will_Sales_Incentive_be_split__c',childComp[0].get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c'));
                        if((childComp[0].get('v.OpportunityLineData.Sales_Person_2__c') == undefined) && (childComp[0].get('v.OpportunityLineData.Sales_Person_2_split_percentage__c') == undefined)){
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__r','');
                        } else {
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2__c'));
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2_split_percentage__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2_split_percentage__c'));
                        }
                        childComp[i].set('v.OpportunityLineData.Date_Submitted_for_Incentives__c', currentDateTime);
                    }
                }
                
            }
        } */
        if(Array.isArray(childComp)){
            if(selectAllBox == true){
                childComp[0].set('v.OpportunityLineData.Sales_Person_2__r','');
            } 
        } else {
            if(selectAllBox == true){
                childComp.set('v.OpportunityLineData.Sales_Person_2__r','');
            }
        }
        var oppLineData = component.get('v.OpportunityLineData');
        for(var i in oppLineData){
            
            if(!Array.isArray(childComp)){
                /*    var errorItem = {};
                if((oppLineData[i].Product2['Product_Line__c'] == 'Other') && (oppLineData[i]['Underwriter__c'] == '' || oppLineData[i]['Underwriter__c'] == undefined)){
                    if(oppLineData[i]['Submit_for_sales_incentives__c'] == true && oppLineData[i]['Underwriting_Validation__c'] == 'Yes'){
                        $A.util.addClass(ChildComp.find('underWriterValidationCheck'), 'slds-has-error');
                        $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                        component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                        errorItem.rowNumber = parseInt(i)+1;
                    }
                } else {
                    $A.util.addClass(component.find("errorToastMessage"), 'slds-hide');
                    $A.util.removeClass(ChildComp.find('underWriterValidationCheck'), 'slds-has-error');
                }
                if(oppLineData[i]['Submit_for_sales_incentives__c'] == true && (oppLineData[i]['Will_Sales_Incentive_be_split__c'] == '' || oppLineData[i]['Will_Sales_Incentive_be_split__c'] == undefined)){
                    $A.util.addClass(ChildComp.find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                    $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                    component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                    errorItem.rowNumber = parseInt(i)+1;
                }
                else if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'Yes'){
                    
                    if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() == '' 
                       || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() == ''
                       || oppLineData[i]['Sales_Person_2__c'] == '' || oppLineData[i]['Sales_Person_2__c'] == undefined){
                        errorItem.rowNumber = parseInt(i)+1;
                        //errorItem.failureReason = 'If Will Sales Incentive be Split field selected as Yes then Split Percent 1, Split Percent 2 and Sales Person 2 is Mandatrory.';
                        if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() == '' || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() == ''){
                            $A.util.addClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            $A.util.addClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                            //component.set('v.errorMessage','Split Percents for Sales Person 1 and Sales Person 2 should total 100.');
                            errorItem.rowNumber = parseInt(i)+1;
                            //$A.util.addClass(ChildComp.find('Sales_Person_2__c'), 'slds-has-error');
                        }
                        if(oppLineData[i]['Sales_Person_2__c'] == '' || oppLineData[i]['Sales_Person_2__c'] == undefined){
                            $A.util.addClass(ChildComp.find('Sales_Person_2__c'), 'slds-has-error');
                            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                            component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                        }
                    }    
                    
                    else if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() != '' 
                            || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() != ''){
                        var split1 = oppLineData[i]['Sales_Person_1_split_percentage__c'].toString();
                        var Split2 = oppLineData[i]['Sales_Person_2_split_percentage__c'].toString();
                        if((parseInt(split1) >= 0) && parseInt(Split2) >= 0){
                            if(parseInt(split1) + parseInt(Split2) != 100){
                                errorItem.rowNumber = parseInt(i)+1;
                                $A.util.addClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.addClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                component.set('v.errorMessage','Split Percents for Sales Person 1 and Sales Person 2 should total 100.');
                                //errorItem.failureReason = 'Sum of split percent should be 100.';
                            } else {
                                $A.util.removeClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.addClass(component.find("errorToastMessage"), 'slds-hide');
                            }
                        } else {
                            errorItem.rowNumber = parseInt(i)+1;
                            $A.util.addClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            $A.util.addClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                        }
                    }
                } else if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == ''){
                    $A.util.addClass(ChildComp.find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                    component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                }
                if(Object.entries(errorItem).length != 0 && errorItem.constructor === Object){
                    failureRecords.push(errorItem);
                } */
                var errorItem = {};
                if((oppLineData[i].Product2['Product_Line__c'] == 'Other') && (oppLineData[i]['Underwriter__c'] == '' || oppLineData[i]['Underwriter__c'] == undefined)){
                    if(oppLineData[i]['Submit_for_sales_incentives__c'] == true && oppLineData[i]['Underwriting_Validation__c'] == 'Yes'){
                        $A.util.addClass(ChildComp.find('underWriterValidationCheck'), 'slds-has-error');
                        $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                        component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                        errorItem.rowNumber = parseInt(i)+1;
                    }
                } else {
                    $A.util.addClass(component.find("errorToastMessage"), 'slds-hide');
                    $A.util.removeClass(ChildComp.find('underWriterValidationCheck'), 'slds-has-error');
                }
                if(oppLineData[i]['Submit_for_sales_incentives__c'] == true && (oppLineData[i]['Will_Sales_Incentive_be_split__c'] == '' || oppLineData[i]['Will_Sales_Incentive_be_split__c'] == undefined)){
                    $A.util.addClass(ChildComp.find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                    $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                    component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                    errorItem.rowNumber = parseInt(i)+1;
                }
                
                /* Validation for Sales Person 1 starts */
                if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'Yes' || oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'No'){
                    if(oppLineData[i]['Sales_Person_1__c'] == '' || oppLineData[i]['Sales_Person_1__c'] == undefined){
                        errorItem.rowNumber = parseInt(i)+1;
                        $A.util.addClass(ChildComp.find('Sales_Person_1__c'), 'slds-has-error');
                        $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                        component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                    }
                }
                /* Validation for Sales Person 1 starts */
                if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'Yes'){
                    
                    if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() == '' 
                       || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() == ''
                       || oppLineData[i]['Sales_Person_2__c'] == '' || oppLineData[i]['Sales_Person_2__c'] == undefined){
                        errorItem.rowNumber = parseInt(i)+1;
                        //errorItem.failureReason = 'If Will Sales Incentive be Split field selected as Yes then Split Percent 1, Split Percent 2 and Sales Person 2 is Mandatrory.';
                        if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() == '' || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() == ''){
                            
                            if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() == ''){
                                $A.util.addClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                                errorItem.rowNumber = parseInt(i)+1;
                            }
                            if(oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() == ''){
                                $A.util.addClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                                errorItem.rowNumber = parseInt(i)+1;
                            }
                            
                            /*  $A.util.addClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            $A.util.addClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                            //component.set('v.errorMessage','Total Split Percent cannot be greater than 100.');
                            errorItem.rowNumber = parseInt(i)+1;
                            //$A.util.addClass(ChildComp.find('Sales_Person_2__c'), 'slds-has-error'); */
                        }
                        if(oppLineData[i]['Sales_Person_2__c'] == '' || oppLineData[i]['Sales_Person_2__c'] == undefined){
                            $A.util.addClass(ChildComp.find('Sales_Person_2__c'), 'slds-has-error');
                            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                            component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                        }
                    }    
                     
                     else if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() != '' 
                             || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() != ''){
                         var split1 = oppLineData[i]['Sales_Person_1_split_percentage__c'].toString();
                         var Split2 = oppLineData[i]['Sales_Person_2_split_percentage__c'].toString();
                         if((parseInt(split1) >= 0) && (parseInt(Split2) >= 0)){
                             if(parseInt(split1) + parseInt(Split2) > 100){
                                 errorItem.rowNumber = parseInt(i)+1;
                                 $A.util.addClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                 $A.util.addClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                 $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                 component.set('v.errorMessage','Split Percents for Sales Person 1 and Sales Person 2 should total 100.');
                                 //errorItem.failureReason = 'Sum of split percent should be 100.';
                             } else if(parseInt(split1) + parseInt(Split2) < 100){
                                 $A.util.addClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                 $A.util.addClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                 $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                 component.set('v.errorMessage','Split Percents for Sales Person 1 and Sales Person 2 should total 100.');
                             }else {
                                 $A.util.removeClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                 $A.util.removeClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                 $A.util.addClass(component.find("errorToastMessage"), 'slds-hide');
                             }
                         } else {
                             errorItem.rowNumber = parseInt(i)+1;
                             $A.util.addClass(ChildComp.find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                             $A.util.addClass(ChildComp.find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                             component.set('v.errorMessage','Split Percents for Sales Person 1 and Sales Person 2 should total 100.');
                             $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                         }
                     }
                 } 
                if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == ''){
                    $A.util.addClass(ChildComp.find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                    component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                }
                if(Object.entries(errorItem).length != 0 && errorItem.constructor === Object){
                    failureRecords.push(errorItem);
                }
                
            } else{
                var errorItem = {};
                if((oppLineData[i].Product2['Product_Line__c'] == 'Other') && (oppLineData[i]['Underwriter__c'] == '' || oppLineData[i]['Underwriter__c'] == undefined)){
                    if(oppLineData[i]['Submit_for_sales_incentives__c'] == true && oppLineData[i]['Underwriting_Validation__c'] == 'Yes'){
                        $A.util.addClass(ChildComp[i].find('underWriterValidationCheck'), 'slds-has-error');
                        $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                        component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                        errorItem.rowNumber = parseInt(i)+1;
                    }
                } else {
                    $A.util.addClass(component.find("errorToastMessage"), 'slds-hide');
                    $A.util.removeClass(ChildComp[i].find('underWriterValidationCheck'), 'slds-has-error');
                }
                if(oppLineData[i]['Submit_for_sales_incentives__c'] == true && (oppLineData[i]['Will_Sales_Incentive_be_split__c'] == '' || oppLineData[i]['Will_Sales_Incentive_be_split__c'] == undefined)){
                    $A.util.addClass(ChildComp[i].find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                    $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                    component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                    errorItem.rowNumber = parseInt(i)+1;
                }
                
                
                /* Validation for Sales Person 1 starts */
                if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'Yes' || oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'No'){
                    if(oppLineData[i]['Sales_Person_1__c'] == '' || oppLineData[i]['Sales_Person_1__c'] == undefined){
                        errorItem.rowNumber = parseInt(i)+1;
                        $A.util.addClass(ChildComp[i].find('Sales_Person_1__c'), 'slds-has-error');
                        $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                        component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                    }
                }
                /* Validation for Sales Person 1 starts */
                
                
                if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'Yes'){
                    
                    if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() == '' 
                       || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() == ''
                       || oppLineData[i]['Sales_Person_2__c'] == '' || oppLineData[i]['Sales_Person_2__c'] == undefined){
                        errorItem.rowNumber = parseInt(i)+1;
                        //errorItem.failureReason = 'If Will Sales Incentive be Split field selected as Yes then Split Percent 1, Split Percent 2 and Sales Person 2 is Mandatrory.';
                        if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() == '' || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() == ''){
                            
                            if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() == ''){
                                $A.util.addClass(ChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                                errorItem.rowNumber = parseInt(i)+1;
                            }
                            if(oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() == ''){
                                $A.util.addClass(ChildComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                                errorItem.rowNumber = parseInt(i)+1;
                            }
                            
                            /*  $A.util.addClass(ChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            $A.util.addClass(ChildComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                            //component.set('v.errorMessage','Total Split Percent cannot be greater than 100.');
                            errorItem.rowNumber = parseInt(i)+1;
                            //$A.util.addClass(ChildComp[i].find('Sales_Person_2__c'), 'slds-has-error'); */
                        }
                        if(oppLineData[i]['Sales_Person_2__c'] == '' || oppLineData[i]['Sales_Person_2__c'] == undefined){
                            $A.util.addClass(ChildComp[i].find('Sales_Person_2__c'), 'slds-has-error');
                            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                            component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                        }
                    }    
                    
                    else if(oppLineData[i]['Sales_Person_1_split_percentage__c'].toString() != '' 
                            || oppLineData[i]['Sales_Person_2_split_percentage__c'].toString() != ''){
                        var split1 = oppLineData[i]['Sales_Person_1_split_percentage__c'].toString();
                        var Split2 = oppLineData[i]['Sales_Person_2_split_percentage__c'].toString();
                        if((parseInt(split1) >= 0) && (parseInt(Split2) >= 0)){
                            if(parseInt(split1) + parseInt(Split2) > 100){
                                errorItem.rowNumber = parseInt(i)+1;
                                $A.util.addClass(ChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.addClass(ChildComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                component.set('v.errorMessage','Split Percents for Sales Person 1 and Sales Person 2 should total 100.');
                                //errorItem.failureReason = 'Sum of split percent should be 100.';
                            } else if(parseInt(split1) + parseInt(Split2) < 100){
                                $A.util.addClass(ChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.addClass(ChildComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                                component.set('v.errorMessage','Split Percents for Sales Person 1 and Sales Person 2 should total 100.');
                            }else {
                                $A.util.removeClass(ChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(ChildComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.addClass(component.find("errorToastMessage"), 'slds-hide');
                            }
                        } else {
                            errorItem.rowNumber = parseInt(i)+1;
                            $A.util.addClass(ChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            $A.util.addClass(ChildComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                            component.set('v.errorMessage','Split Percents for Sales Person 1 and Sales Person 2 should total 100.');
                            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
                        }
                    }
                }
                if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == ''){
                    $A.util.addClass(ChildComp[i].find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                    component.set('v.errorMessage','Please complete the fields that are highlighted in RED.');
                }
                if(Object.entries(errorItem).length != 0 && errorItem.constructor === Object){
                    failureRecords.push(errorItem);
                }
            }
            
            
            
        } 
        
        component.set("v.failureRecords",failureRecords);
        
        if(component.get('v.failureRecords').length > 0){
            //component.set('v.ShowErrorTable',true);
            //component.set("v.isModalOpen", true);
            $A.util.removeClass(component.find("errorToastMessage"), 'slds-hide');
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            return false;
        }
        
        component.set('v.isBulkEdit',false);
        var childComp = component.find('childComp');
        for(var i=0; i<childComp.length; i++){
            childComp[i].set('v.isBulkEdit',false);
        }
        helper.saveOppProductLineItemData(component, event, helper);
    },
    
    closePopUp : function(component, event, helper) {
        debugger;
        var buttonId = component.find('popup');
        $A.util.addClass(buttonId, 'slds-hide');
        $A.util.removeClass(buttonId, 'slds-show');
        component.set('v.isModalOpen',false);
        component.set('v.ShowErrorTable',false);
    },
    
    download : function(component, event, helper) 
    {
        helper.exportRecord(component, event, helper);        
    },
    
    selectAll : function(component, event, helper) {
        helper.selectAll(component, event, helper);
    },
    
    /*Underwriter Email functionality starts */
    openMailPopup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        
        if(device == "DESKTOP"){
            helper.openMailPopup(component, event, 'Send an Email to the CRM Help Desk', 'MA_UnderwriterEmail_Send_Mail_Popup');
        }else{
            helper.openMailPopup(component, event, 'Send an Email to the CRM Help Desk', 'MA_UnderwriterEmail_Send_Mail_Popup');  
        }
        
        event.stopPropagation();
    },
    
    
    sendMail : function(component, event, helper){
        
        var isEmptyValExists = false;
        var itagList = $A.get("$Label.c.MA_Consultants_fieldNames");
        var itagListarray = itagList.split(',');
        console.log(itagListarray);
        
        for(var i=0;i<itagListarray.length;i++){
            var fieldComp = component.find(itagListarray[i]);
            if(fieldComp != undefined && fieldComp != null ){
                var fieldvalue = fieldComp.get('v.value');
                
                if(fieldvalue == undefined || fieldvalue == null || 
                   (fieldvalue != undefined && fieldvalue != null && fieldvalue == '')) {
                    $A.util.addClass(component.find(itagListarray[i]), "mandatoryFields");
                    $A.util.addClass(component.find(itagListarray[i]+'Div'), "slds-has-error");
                    $A.util.removeClass(component.find(itagListarray[i]+'Div1'), "slds-hide");
                    isEmptyValExists = true;
                } else {
                    $A.util.removeClass(component.find(itagListarray[i]), "mandatoryFields");
                    $A.util.removeClass(component.find(itagListarray[i]+'Div'), "slds-has-error");
                    $A.util.addClass(component.find(itagListarray[i]+'Div1'), "slds-hide");
                }
            } 
        }
        
        if(isEmptyValExists == false) {
            
            helper.sendMailToHelpDesk(component, event);
        }  
        
    },
    
    cancelNClose : function(component, event) {
        component.set('v.invokeUnderWriterHelpEmailCmp',false);
    },
    
    onChange : function(component, event) {
        
        var fieldItag = event.getSource().getLocalId();
        var fieldComp = component.find(fieldItag);
        if(fieldComp != undefined && fieldComp != null ){
            var fieldvalue = fieldComp.get('v.value');
            if(fieldvalue == undefined || fieldvalue == null || 
               (fieldvalue != undefined && fieldvalue != null && fieldvalue == '')) {
                $A.util.addClass(component.find(fieldItag), "mandatoryFields");
                $A.util.addClass(component.find(fieldItag+'Div'), "slds-has-error");
                $A.util.removeClass(component.find(fieldItag+'Div1'), "slds-hide");
            } else {
                $A.util.removeClass(component.find(fieldItag), "mandatoryFields");
                $A.util.removeClass(component.find(fieldItag+'Div'), "slds-has-error");
                $A.util.addClass(component.find(fieldItag+'Div1'), "slds-hide");
            }
        }
    },
    
    closeErrorModal : function(component,helper,event){
        helper.handlehide(component, event);
    },
    
    modelCloseComponentEvent : function(component, event,helper){
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
    /*End of Underwriter Email functionality */
    
    /* Help popup component functionality starts */
    
    openHelpPopup : function(component, event, helper){
        component.set('v.invokeHelpPopUp',true);
    },
    
    onpresscancel : function(component, event, helper) {
        var buttonId = component.find('popup');
        $A.util.addClass(buttonId, 'slds-hide');
        $A.util.removeClass(buttonId, 'slds-show');
    	component.set('v.invokeHelpPopUp',false);
        
    }
    /* End of Help popup component functionality */
})