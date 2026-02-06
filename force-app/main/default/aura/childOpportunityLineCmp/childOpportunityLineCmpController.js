({
    doInitChildAction : function(component, event) {
        var dateTime = component.get('v.OpportunityLineData.Date_Submitted_for_Incentives__c');
        /*if(dateTime != null && dateTime != undefined && dateTime != ''){
            dateTime =  dateTime.replace('T',' ');
            dateTime = dateTime.replace('.000Z',''); 
            component.set('v.OpportunityLineData.uidateTime',dateTime);
        }*/
    },
    
    onSingleSelectChange: function(component, event) {
        var result = event.getSource().get('v.value');
        var childId = component.get('v.childId');
        var OppData = component.get('v.OpportunityLineData');
        var productId = component.get('v.OpportunityLineData.Id');
        var salesPerson1 = component.get('v.salesPerson1').valueOf('v.value')[0];
        component.set('v.OpportunityLineData.Will_Sales_Incentive_be_split__c',result);
        var isValidSalesIncentive = component.find("Will_Sales_Incentive_be_split__c");
        var isValidSalesPerson = component.find("Sales_Person_2__c");
        $A.util.removeClass(isValidSalesIncentive, 'slds-has-error');
        switch(result){
            case 'Yes' : 
                component.set('v.isIncentiveEdit',true);
                component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','');
                component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
                //component.set('v.OpportunityLineData.Sales_Person_2__r.Name','');
                $A.util.removeClass(component.find('Sales_Person_2__c'),'slds-hide');
                $A.util.removeClass(isValidSalesPerson, 'slds-has-error');
                break;
            case 'No' :  
                component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','100');
                component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
                component.set('v.OpportunityLineData.Sales_Person_2__c','');
                component.set('v.OpportunityLineData.Sales_Person_2__r','');
                component.set('v.SearchKeyWord','');
                component.set('v.isIncentiveEdit',false);
                break;
            case '' :  
                component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','');
                component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
                component.set('v.isIncentiveEdit',false);
                component.set('v.OpportunityLineData.Sales_Person_2__r','');
                component.set('v.OpportunityLineData.Sales_Person_2__c','');
                component.set('v.SearchKeyWord','');
                component.set('v.enableSalesPerson1',false);
                break;    
            default :
                component.set('v.isIncentiveEdit',false);
                component.set('v.isSplitEdit',true);
                component.set('v.isBulkEdit',true);
                break;
        }
        
        if(result == 'Yes' || result == 'No'){
            /* Pre Populating of SalesPerson1 on Click of Will Sales Incentives be Split Starts*/
            component.set('v.enableSalesPerson1',true);
            if(OppData.hasOwnProperty('Sales_Person_1__c') && OppData["Sales_Person_1__c"] != null && OppData["Sales_Person_1__c"] != '' && OppData["Sales_Person_1__c"] != undefined){
            var forclose = component.find("lookup-pillSalesPerson1");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("Sales_Person_1__c");
            $A.util.removeClass(forclose,'slds-has-error');
            
            var forclose = component.find("searchResSalesPerson1");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show'); 
            
            var lookUpTarget = component.find("removeSearchSalesPerson1");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var userLookUpField1SalesPerson1 = component.find("userLookUpField1SalesPerson1");
            $A.util.addClass(userLookUpField1SalesPerson1, 'slds-hide');
            $A.util.removeClass(userLookUpField1SalesPerson1, 'slds-show');
        } else{
            
            component.set('v.OpportunityLineData.Sales_Person_1__c',OppData.Opportunity.OwnerId);
            //component.set('v.OpportunityLineData.Sales_Person_1__r.Id',OppData.Opportunity.OwnerId);
            component.set('v.OpportunityLineData.Sales_Person_1__r',OppData.Opportunity.Owner_Name__c);
            //component.set('v.OpportunityLineData.Sales_Person_1__r.Name',OppData.Opportunity.Owner_Name__c);
            
           component.set('v.selectedRecordSalesPerson1.Name',salesPerson1);
            var forclose = component.find("lookup-pillSalesPerson1");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("Sales_Person_1__c");
            $A.util.removeClass(forclose,'slds-has-error');
            
            var forclose = component.find("searchResSalesPerson1");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show'); 
            
            var lookUpTarget = component.find("removeSearchSalesPerson1");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var userLookUpField1SalesPerson1 = component.find("userLookUpField1SalesPerson1");
            $A.util.addClass(userLookUpField1SalesPerson1, 'slds-hide');
            $A.util.removeClass(userLookUpField1SalesPerson1, 'slds-show');
        }
            /* Pre Populating of SalesPerson1 on Click of Ready to Will Sales Incentives be Split  Ends */
        }
        
        if(childId == productId){
            console.log('child Id Success');
            var OppDataEvent = component.getEvent('OppDataEvent');
            OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'Will_Sales_Incentive_be_split__c'});
            OppDataEvent.fire();
        }
    },
    
    onCheck : function(component, event, helper) {
        var check = event.getSource().get('v.value');
        var underWriterValidationRequired = component.get('v.removeUnderWriter');
        var OppData = component.get('v.OpportunityLineData');
        var OppId = component.get('v.OpportunityLineData.Id');
        var salesPerson1 = component.get('v.salesPerson1').valueOf('v.value')[0];

        //var currentDateTime= new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString();
        var currentDateTime= new Date().toISOString();
        component.set('v.OpportunityLineData.Date_Submitted_for_Incentives__c',currentDateTime);
        component.set('v.removeUnderWriter',true);
        if(component.get('v.salesPerson1') == '' || component.get('v.salesPerson1') == undefined){
            component.set('v.salesPerson1',component.get('v.OpportunityLineData.Opportunity.Owner_Name__c'));   
        }
        if(check == true){
            component.set('v.isSplitEdit',true);
            component.set('v.OpportunityLineData.VPCR_RVP__c',component.get('v.OpportunityLineData.Opportunity.CM_VPCR_RVP__c'));
            component.set('v.OpportunityLineData.Speciality_Benefits_SVP__c',component.get('v.OpportunityLineData.Opportunity.Specialty_Benefits_SVP__c'));
            component.set('v.OpportunityLineData.Opportunity.Owner_Name__c',salesPerson1);
            if(underWriterValidationRequired == true){
                if(OppData["Underwriting_Validation__c"] == 'Yes'){
                    component.set('v.underWriterEnable',true); 
                }
            }
            if(component.get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') != "" 
               && component.get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') != undefined
               && component.get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') != null
               && component.get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') == 'Yes'){
                component.set('v.isIncentiveEdit',true);
            }else{
                component.set('v.isIncentiveEdit',false);
            }
        } else{
            component.set('v.isSplitEdit',false);
            component.set('v.enableSalesPerson1',false);
            component.set('v.isIncentiveEdit',false);
            component.set('v.underWriterEnable',false);
            component.set('v.SearchKeyWord','');
            component.set('v.OpportunityLineData.Underwriter__c','');
            component.set('v.OpportunityLineData.Underwriter_Email__c','');
            //component.set('v.OpportunityLineData.Underwriter__r','');
            component.set('v.OpportunityLineData.Will_Sales_Incentive_be_split__c','');
            component.set('v.OpportunityLineData.Opportunity.Owner_Name__c','');
            component.set('v.OpportunityLineData.Sales_Person_1__c','');
            component.set('v.OpportunityLineData.Sales_Person_1__r','');
            component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','');
            //component.set('v.OpportunityLineData.Sales_Person_2__r.Name','');
            component.set('v.OpportunityLineData.Sales_Person_2__c','');
            component.set('v.OpportunityLineData.Sales_Person_2__r','');
            component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
            component.set('v.OpportunityLineData.Date_Submitted_for_Incentives__c','');
            component.set('v.OpportunityLineData.VPCR_RVP__c','');
            component.set('v.OpportunityLineData.Speciality_Benefits_SVP__c','');
            component.set('v.OpportunityLineData.Submit_for_sales_incentives__c',false);
            component.set('v.uidateTime','');
            component.set('v.checked',false);
            var removeUnderWriterHighlight = component.find("underWriterValidationCheck");
            $A.util.removeClass(removeUnderWriterHighlight, 'slds-has-error');
            var OppDataEvent = component.getEvent('OppDataEvent');
            OppDataEvent.setParams({'checked':false, 'OppId' : OppId});
            OppDataEvent.fire();
            
        }
    },
    onSelectChange : function(component, event, helper) {
        var evntsource = event.getSource();
        var PickListValue =evntsource.get("v.value"); 
        var removeHighlight = component.find("Sales_Person_1_split_percentage__c");
        $A.util.removeClass(removeHighlight, 'slds-has-error');
        component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c',PickListValue);
        var OppDataEvent = component.getEvent('OppDataEvent');
        OppDataEvent.setParams({'OpportunityLineData': component.get('v.OpportunityLineData')});
        OppDataEvent.fire();
    },
    
    onSelectChange2 : function(component, event, helper) {
        var evntsource = event.getSource();
        var PickListValue =evntsource.get("v.value"); 
        var removeHighlight = component.find("Sales_Person_2_split_percentage__c");
        $A.util.removeClass(removeHighlight, 'slds-has-error');
        component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c',PickListValue);
        var OppDataEvent = component.getEvent('OppDataEvent');
        OppDataEvent.setParams({'OpportunityLineData': component.get('v.OpportunityLineData')});
        OppDataEvent.fire();
    },
    
    onSelectUnderWriter : function(component, event, helper) {
        debugger;
        var getName = event.getParam("recordByEvent");
        var getId = event.getParam("getSelectedRecordID");
        var UnderwriterData = component.get('v.UnderwriterData');
        var otherBuyUpId = component.get('v.otherBuyUpId');
        
        var items = UnderwriterData;
        for(var i = 0; i < items.length; i++) {
            if(UnderwriterData[i].Id === getId){
                component.set('v.saveUnderWriterData',true);
                component.set('v.selectedUnderWriter',UnderwriterData[i]);
                console.log(' Name and its ID is '+UnderwriterData[i].Underwriter_Name__c+' '+UnderwriterData[i].Id+' '+UnderwriterData[i].Email_Address__c);
                component.set('v.OpportunityLineData.Underwriter__c',UnderwriterData[i].Underwriter_Name__c);
                component.set('v.OpportunityLineData.Underwriter_Email__c',UnderwriterData[i].Email_Address__c);
                //component.set('v.OpportunityLineData.Underwriter__c',UnderwriterData[i].Id);
                
                var removeHighlight = component.find("underWriterValidationCheck");
                $A.util.removeClass(removeHighlight, 'slds-has-error');
                
                
                var forclose = component.find("lookup-pillUW");
                $A.util.addClass(forclose, 'slds-show');
                $A.util.removeClass(forclose, 'slds-hide');
                
                var forclose = component.find("searchResUnderWriter");
                $A.util.addClass(forclose, 'slds-is-close');
                $A.util.removeClass(forclose, 'slds-is-open');
                
                var lookUpTarget = component.find("lookupField");
                $A.util.addClass(lookUpTarget, 'slds-hide');
                $A.util.removeClass(lookUpTarget, 'slds-show'); 
                
                var lookUpTarget = component.find("removeSearchUW");
                $A.util.addClass(lookUpTarget, 'slds-hide');
                $A.util.removeClass(lookUpTarget, 'slds-show');
                
                var userLookUpField2 = component.find("userLookUpField2");
                $A.util.addClass(userLookUpField2, 'slds-hide');
                $A.util.removeClass(userLookUpField2, 'slds-show');
                var childId = component.get('v.childId');
                var productId = component.get('v.OpportunityLineData.Id');
                if(childId == productId){
                    console.log('child Id Success');
                    var OppDataEvent = component.getEvent('OppDataEvent');
                    OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'initialUnderWriterDataFlow'});
                    OppDataEvent.fire();
                } else if(productId == otherBuyUpId){
                    console.log('child Id Success');
                    var OppDataEvent = component.getEvent('OppDataEvent');
                    OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'partialUnderWriterDataFlow'});
                    OppDataEvent.fire();
                }
                break;
                
            }
            component.set('v.saveUnderWriterData',false);
        }
        var saveUnderWriterData = component.get('v.saveUnderWriterData');
        if(saveUnderWriterData == false){
            component.set('v.OpportunityLineData.Underwriter_Email__c','');
            component.set('v.OpportunityLineData.Underwriter__c','');
        }
    },
    
    clearUnderWriter : function(component, event, helper){
        
        var pillTarget = component.find("lookup-pillUW");
        var lookUpTarget = component.find("lookupField"); 
        
        $A.util.addClass(pillTarget, 'slds-hide');
        $A.util.removeClass(pillTarget, 'slds-show');
        
        $A.util.addClass(lookUpTarget, 'slds-show');
        $A.util.removeClass(lookUpTarget, 'slds-hide');
        
        var userLookUpField2 = component.find("userLookUpField2");
        $A.util.addClass(userLookUpField2, 'slds-show');
        $A.util.removeClass(userLookUpField2, 'slds-hide');
        component.set('v.OpportunityLineData.Underwriter__c','');
        
        component.set("v.SearchUnderWriter",null);
        component.set("v.listOfUnderWriters", null );
        component.set("v.selectedUnderWriter", {} ); 
        var childId = component.get('v.childId');
        var productId = component.get('v.OpportunityLineData.Id');
        var otherBuyUpId = component.get('v.otherBuyUpId');
        if(childId == productId){
            console.log('child Id Success');
            var OppDataEvent = component.getEvent('OppDataEvent');
            OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'clearInitialUnderWriterData'});
            OppDataEvent.fire();
        } else if(productId == otherBuyUpId){
            console.log('child Id Success');
            var OppDataEvent = component.getEvent('OppDataEvent');
            OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'partialClearUnderWriterData'});
            OppDataEvent.fire();
        }
    },
    
    cancelOppData : function(component, event, helper) {
        component.set('v.isBulkEdit',false);
        component.set('v.isSplitEdit',false);
        component.set('v.isIncentiveEdit',false);
        
    },
    
    removeWarning : function(component, event, helper) {
        var removeHighlight = component.find("Sales_Person_1_split_percentage__c");
        var removeHighlight1 = component.find("Sales_Person_2_split_percentage__c");
        var salesPerson2value = '';
        $A.util.removeClass(removeHighlight, 'slds-has-error');
        var salesPerson1value = component.get('v.OpportunityLineData.Sales_Person_1_split_percentage__c');
        component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
        var salesPerson1value = component.find('Sales_Person_1_input').get('v.value');
        if(!isNaN(salesPerson1value)){
            if(salesPerson1value == ''){
                $A.util.removeClass(removeHighlight, 'slds-has-error');
                var salesPerson1value = component.get('v.OpportunityLineData.Sales_Person_1_split_percentage__c');
                //component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','0');
            } else if(salesPerson1value <= 100 && salesPerson1value >= 0 ){
                salesPerson2value = 100 - salesPerson1value;
                component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c',salesPerson2value.toString());
                $A.util.removeClass(removeHighlight1, 'slds-has-error');
            } else {
                component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
            }
        }else {
            var addHighlight = component.find("Sales_Person_1_split_percentage__c");
            //$A.util.addClass(addHighlight, 'slds-has-error');
            component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','');
        }
        
        var childId = component.get('v.childId');
        var productId = component.get('v.OpportunityLineData.Id');
        if(childId == productId){
            console.log('child Id Success');
            var OppDataEvent = component.getEvent('OppDataEvent');
            OppDataEvent.setParams({'childIdBoolean':true,'columnId':'Sales_Person_1_input'});
            OppDataEvent.fire();
        }
    },
    
    removeWarning1 : function(component, event, helper) {
        var removeHighlight = component.find("Sales_Person_2_split_percentage__c");
        var removeHighlight1 = component.find("Sales_Person_1_split_percentage__c");
        $A.util.removeClass(removeHighlight, 'slds-has-error');
        var salesPerson1value = '';
        //var salesPerson2value = component.get('v.OpportunityLineData.Sales_Person_2_split_percentage__c');
        var salesPerson2value = component.find('Sales_Person_2_input').get('v.value');
        if(!isNaN(salesPerson2value)){
            if(salesPerson2value == ''){
                $A.util.removeClass(removeHighlight, 'slds-has-error');
                var salesPerson2value = component.get('v.OpportunityLineData.Sales_Person_2_split_percentage__c');
                component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','');
            } else if(salesPerson2value <= 100 && salesPerson2value >= 0 ){
                salesPerson1value = 100 - salesPerson2value;
                component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c',salesPerson1value.toString());
                $A.util.removeClass(removeHighlight1, 'slds-has-error');
            } else {
                component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','');
            }
        }else {
            var addHighlight = component.find("Sales_Person_2_split_percentage__c");
            //$A.util.addClass(addHighlight, 'slds-has-error');
            component.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
        }
        var childId = component.get('v.childId');
        var productId = component.get('v.OpportunityLineData.Id');
        if(childId == productId){
            console.log('child Id Success');
            var OppDataEvent = component.getEvent('OppDataEvent');
            OppDataEvent.setParams({'childIdBoolean':true, 'columnId':'Sales_Person_2_input'});
            OppDataEvent.fire();
        }
    },
    
    checkValue : function(component,event,helper){
        var salesPerson1 = component.get('v.OpportunityLineData.Sales_Person_1_split_percentage__c');
        var salesPerson2 = component.get('v.OpportunityLineData.Sales_Person_2_split_percentage__c');
        if(salesPerson1 == ''){
            component.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c',0);
        }  else if(salesPerson2 == ''){
            component.get('v.OpportunityLineData.Sales_Person_2_split_percentage__c',0);
        }
    },
    
    onfocus : function(component,event,helper){
        $A.util.addClass(component.find("mySpinner"), "slds-show");
        var forOpen = component.find("searchRes");
        $A.util.addClass(forOpen, 'slds-is-open');
        $A.util.removeClass(forOpen, 'slds-is-close');
        helper.searchHelper(component,event,'');
    },
    
    onblur : function(component,event,helper){       
        component.set("v.listOfSearchRecords", null );
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },
    
    onfocusSalesPerson1 : function(component,event,helper){
        $A.util.addClass(component.find("mySpinner"), "slds-show");
        var forOpen = component.find("searchResSalesPerson1");
        $A.util.addClass(forOpen, 'slds-is-open');
        $A.util.removeClass(forOpen, 'slds-is-close');
        helper.searchHelperSalesPerson1(component,event,'');
    },
    
    onblurSalesPerson1 : function(component,event,helper){       
        component.set("v.listOfSearchRecordsSalesPerson1", null );
        var forclose = component.find("searchResSalesPerson1");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },
    
    keyPressController : function(component, event, helper) {
        var getInputkeyWord = component.get("v.SearchKeyWord");
        if( getInputkeyWord.length > 0 ){
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            $A.util.removeClass(forOpen, 'slds-has-error');
            var removeHighlight = component.find("Sales_Person_2__c");
            $A.util.removeClass(removeHighlight, 'slds-has-error');
            helper.searchHelper(component,event,getInputkeyWord);
        }
        else{  
            helper.searchHelper(component,event,'');
            /* var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');*/
        }
    },
    
    keyPressControllerSalesPerson1 : function(component, event, helper) {
        var getInputkeyWord = component.get("v.SearchKeyWordSalesPerson1");
        if( getInputkeyWord.length > 0 ){
            var forOpen = component.find("searchResSalesPerson1");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            $A.util.removeClass(forOpen, 'slds-has-error');
            var removeHighlight = component.find("Sales_Person_1__c");
            $A.util.removeClass(removeHighlight, 'slds-has-error');
            helper.searchHelperSalesPerson1(component,event,getInputkeyWord);
        }
        else{  
            helper.searchHelperSalesPerson1(component,event,'');
            /* var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');*/
        }
    },
    
    
    clear : function(component,event,heplper){
        var pillTarget = component.find("lookup-pill");
        var lookUpTarget = component.find("lookupField"); 
        
        $A.util.addClass(pillTarget, 'slds-hide');
        $A.util.removeClass(pillTarget, 'slds-show');
        
        $A.util.addClass(lookUpTarget, 'slds-show');
        $A.util.removeClass(lookUpTarget, 'slds-hide');
        
        var userLookUpField1 = component.find("userLookUpField1");
        $A.util.addClass(userLookUpField1, 'slds-show');
        $A.util.removeClass(userLookUpField1, 'slds-hide');
        component.set('v.OpportunityLineData.Sales_Person_2__c','');
        component.set('v.OpportunityLineData.Sales_Person_2__r','');
        
        component.set("v.SearchKeyWord",null);
        component.set("v.listOfSearchRecords", null );
        component.set("v.selectedRecord", {} );
        
        var childId = component.get('v.childId');
        var productId = component.get('v.OpportunityLineData.Id');
        if(childId == productId){
            console.log('child Id Success');
            var OppDataEvent = component.getEvent('OppDataEvent');
            OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'clear_Sales_Person_2'});
            OppDataEvent.fire();
        }
        
        
    },
    
    clearSalesPerson1 : function(component,event,heplper){
        var pillTarget = component.find("lookup-pillSalesPerson1");
        var lookUpTarget = component.find("lookupField"); 
        
        $A.util.addClass(pillTarget, 'slds-hide');
        $A.util.removeClass(pillTarget, 'slds-show');
        
        $A.util.addClass(lookUpTarget, 'slds-show');
        $A.util.removeClass(lookUpTarget, 'slds-hide');
        
        var userLookUpField1 = component.find("userLookUpField1SalesPerson1");
        $A.util.addClass(userLookUpField1, 'slds-show');
        $A.util.removeClass(userLookUpField1, 'slds-hide');
        component.set('v.OpportunityLineData.Sales_Person_1__c','');
        component.set('v.OpportunityLineData.Sales_Person_1__r','');
        
        component.set("v.SearchKeyWordSalesPerson1",null);
        component.set("v.listOfSearchRecordsSalesPerson1", null );
        component.set("v.selectedRecordSalesPerson1", {} );
        
        var childId = component.get('v.childId');
        var productId = component.get('v.OpportunityLineData.Id');
        if(childId == productId){
            console.log('child Id Success');
            var OppDataEvent = component.getEvent('OppDataEvent');
            OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'clear_Sales_Person_1'});
            OppDataEvent.fire();
        }
        
        
    },
    
    handleComponentEvent : function(component, event, helper) {
        var selectedAccountGetFromEvent = event.getParam("recordByEvent");
        var UserId = event.getParam("getSelectedRecordID");
        var isSalesPerson1 = event.getParam("isSalesPerson1");
        var isSalesPerson2 = event.getParam("isSalesPerson2");
        
        if(isSalesPerson1){
            component.set("v.selectedRecordSalesPerson1" , selectedAccountGetFromEvent); 
            var SalesPerson1name = component.get('v.selectedRecordSalesPerson1.Name');
            component.set('v.OpportunityLineData.Sales_Person_1__c',UserId);
            //component.set('v.OpportunityLineData.Sales_Person_1__r.Id',UserId);
            component.set('v.OpportunityLineData.Sales_Person_1__r',SalesPerson1name);
            component.set('v.OpportunityLineData.Sales_Person_1__r.Name',SalesPerson1name);
            
            var forclose = component.find("lookup-pillSalesPerson1");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("Sales_Person_1__c");
            $A.util.removeClass(forclose,'slds-has-error');
            
            var forclose = component.find("searchResSalesPerson1");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show'); 
            
            var lookUpTarget = component.find("removeSearchSalesPerson1");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            
            var userLookUpField1SalesPerson1 = component.find("userLookUpField1SalesPerson1");
            $A.util.addClass(userLookUpField1SalesPerson1, 'slds-hide');
            $A.util.removeClass(userLookUpField1SalesPerson1, 'slds-show');
            
            var childId = component.get('v.childId');
            var productId = component.get('v.OpportunityLineData.Id');
            if(childId == productId){
                console.log('child Id Success');
                var OppDataEvent = component.getEvent('OppDataEvent');
                OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'Sales_Person_1'});
                OppDataEvent.fire();
            }
        }
        
        if(isSalesPerson2){
            component.set("v.selectedRecord" , selectedAccountGetFromEvent); 
            var SalesPerson2name = component.get('v.selectedRecord.Name');
            component.set('v.OpportunityLineData.Sales_Person_2__c',UserId);
            component.set('v.OpportunityLineData.Sales_Person_2__r',SalesPerson2name);
            component.set('v.OpportunityLineData.Sales_Person_2__r.Name',SalesPerson2name);
            
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("Sales_Person_2__c");
            $A.util.removeClass(forclose,'slds-has-error');
            
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
            
            var childId = component.get('v.childId');
            var productId = component.get('v.OpportunityLineData.Id');
            if(childId == productId){
                console.log('child Id Success');
                var OppDataEvent = component.getEvent('OppDataEvent');
                OppDataEvent.setParams({'childIdBoolean':true, 'columnId' : 'Sales_Person_2'});
                OppDataEvent.fire();
            }
        }
        
    },
    
    onfocus1 : function(component,event,helper){
        $A.util.addClass(component.find("mySpinner1"), "slds-show");
        var forOpen = component.find("searchResUnderWriter");
        $A.util.addClass(forOpen, 'slds-is-open');
        $A.util.removeClass(forOpen, 'slds-is-close');
        //helper.searchHelper(component,event,'');
        var UnderwriterData = component.get('v.UnderwriterData');
        var listOfUnderWriters = [];
        for(var i= 0;i< 5;i++){
            listOfUnderWriters.push(UnderwriterData[i]['Underwriter_Name__c']);
        }
        component.set('v.listOfUnderWriters',listOfUnderWriters);
    },
    
    onblur1 : function(component,event,helper){       
        component.set("v.listOfUnderWriters", null );
        var forclose = component.find("searchResUnderWriter");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },
    
    searchUnderWriter : function(component, event, helper){
        var getInputkeyWord = component.get("v.SearchUnderWriter");
        var UnderwriterData = component.get('v.UnderwriterData');
        var UnderWriterList = [];
        if(getInputkeyWord != null && getInputkeyWord != undefined && getInputkeyWord.length > 0){
            if(UnderwriterData != null && UnderwriterData != undefined && UnderwriterData.length > 0){
                for(var i = 0; i < UnderwriterData.length; i++){
                    var underWriterName = UnderwriterData[i].Underwriter_Name__c.toUpperCase();
                    if(underWriterName.includes(getInputkeyWord.toLocaleUpperCase())){
                        var forOpen = component.find("searchResUnderWriter");
                        $A.util.addClass(forOpen, 'slds-is-open');
                        $A.util.removeClass(forOpen, 'slds-is-close');
                        $A.util.removeClass(forOpen, 'slds-has-error');
                        var removeHighlight = component.find("Underwriter_Name__c");
                        $A.util.removeClass(removeHighlight, 'slds-has-error');
                        UnderWriterList.push(UnderwriterData[i].Underwriter_Name__c);
                        
                    }
                }
                component.set("v.listOfUnderWriters",UnderWriterList);
            }
        }
    },    
    
})