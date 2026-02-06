({
    updateOthersRecordMethod : function(component,event,helper) {	
        helper.caluculateTotalRecord(component);
    },
        updateOthersRecMethod: function(component,event,helper) {	
        helper.setMedTotalRecToChecked(component);  
    },
    changeBuyupValue:function(component,event,helper){
        component.set('v.OpportunityLineItemsObj.Buyup_Product_Selection__c',component.get('v.Buyup_Product_Selection__c'));
    },
    doInit : function(component, event, helper) {        
        var oppor = component.get('v.OpportunityLineItemsObj');
        if(oppor.ReadonlySurest__c){
            component.set('v.isReadonlyBuyup',true);
        }
        //delete oppor.ReadonlySurest__c;
        if(!(oppor.Annual_Revenue_Premium__c != undefined && oppor.Annual_Revenue_Premium__c != null)){
            oppor.Annual_Revenue_Premium__c = 0;
            component.set('v.OpportunityLineItemsObj',oppor);
        }
        var BuyupProductList =component.get('v.BuyupProductList');
        /*if(oppor.Product2.Surest_Applicable_Products__c=='Available for Surest only with UNET'){
                var options =[];
                for(var i=0;i<BuyupProductList.length;i++){
                    if(BuyupProductList[i]!='Surest Only')
                    options.push(BuyupProductList[i])
                }
                component.set("v.BuyupProductList", options);
        }*/
        if(BuyupProductList[0]=='')
            BuyupProductList.splice(0,1);

        component.set("v.options", BuyupProductList);
        
        var isQAVal = component.get('v.isQA');        
        var isQA = (isQAVal!=undefined && isQAVal!= null && isQAVal != false) ? true : false;
        component.set('v.isQA',isQA);
        // if(isQA == true){
        //     component.set('v.isQA',true);
        // }else{
        //     component.set('v.isQA',false);
        // }
        console.log('isQAVal>>>'+component.get('v.isQA'));
        
        if(oppor.Product2.Surest_Applicable_Products__c!=undefined){
            if(oppor.Product2.Surest_Applicable_Products__c=='Not Available for Surest'){
                component.set('v.isReadonlyBuyup',true);
                
            }
            if(oppor.Product2.Surest_Applicable_Products__c=='Available for Surest only'){
                component.set('v.isReadonlyBuyup',true);
            }
           /* if(oppor.Product2.Product_Line__c=='Dental' || oppor.Product2.Product_Line__c=='Vision'){
                if(oppor.Product2.Surest_Applicable_Products__c=='Available for Surest and/or UNET'){
                component.set('v.isReadonlyBuyup',true);
            }
            }*/
            if(oppor.Product2.Surest_Applicable_Products__c=='Available for Surest only with UNET'){
                var options =[];
                for(var i=0;i<BuyupProductList.length;i++){
                    if(BuyupProductList[i]!='Surest Only')
                    options.push(BuyupProductList[i])
                }
                component.set("v.options", options);
            }
        }
        
        if(oppor.Buyup_Product_Selection__c)
            component.set('v.Buyup_Product_Selection__c',oppor.Buyup_Product_Selection__c);
        
        if(component.get('v.isMedicalAndOthersTab')){
            helper.setMedTotalRecToChecked(component);
        }
        if(component.get('v.isPendingTransfer')){
            if(component.get('v.SalesStage')=='Transfer In/Out' || component.get('v.SalesStage')=='Pending Transfer In'){
                var options =[];
                options.push('');
                options.push('Transfer In');
                options.push('Transfer Out');	
                options.push('Dead Pending Transfer');
                component.set("v.dispositionPicklistVals", options);
            }
            if(component.get('v.SalesStage')=='Spin-Off' || component.get('v.SalesStage')=='Pending Spin-Off'){
                var options =[];
                options.push('');
                options.push('Spin-Off');
                options.push('Dead Spin-Off');
                component.set("v.dispositionPicklistVals", options);
            }
        }
        //helper.evaluateDispositionEditability(component);
        console.log('dispositionPicklistVals>>>'+component.get('v.dispositionPicklistVals'));
        console.log('dispositionselected>>>'+component.get('v.OpportunityLineItemsObj.Disposition_Other_Buy_Up_Programs__c'));
    },
	onAnnualRevenue : function(component, event, helper) {
        var oppor = component.get('v.OpportunityLineItemsObj');
        if(!(oppor.Annual_Revenue_Premium__c != undefined && oppor.Annual_Revenue_Premium__c != null)){
            oppor.Annual_Revenue_Premium__c = 0;
            component.set('v.OpportunityLineItemsObj',oppor);
        }   
        helper.caluculateTotalRecord(component);
    },   
    
	caluculateTotalRecord : function(component, event, helper) {
        var oppor = component.get('v.OpportunityLineItemsObj');
        var auraId = event.getSource().getLocalId();
        
        console.log('caluculateTotalRecord in modal');
        
        if(auraId != 'Sold_Retained_Members__c'){
            if(oppor[auraId] == undefined || oppor[auraId] == null || oppor[auraId] == ''){
                oppor[auraId] = 0;                
            }           
        }   
        component.set('v.OpportunityLineItemsObj',oppor);
        helper.caluculateTotalRecord(component,oppor);
	},  
    removeOpportunityLineItemsObj : function(component, event, helper) {                     
        var oppor = component.get('v.OpportunityLineItemsObj');
        var compEvent = component.getEvent("ProductsListCompEvent"); 
        var isDeleteFromSF = false;
        
        if(component.get('v.OpportunityLineItemsObj.Id') != null){
            isDeleteFromSF = true;           
        }
        console.log('Child isSpecialityProduct =>', component.get("v.isSpecialityProduct"));
        compEvent.setParams({
            "isDelete" : true,
            "isDeleteFromSF" : isDeleteFromSF,
            "index":component.get('v.index'),
            "productType":component.get('v.productType'),
            "OpportunityLineItemsObj" : component.get('v.OpportunityLineItemsObj'),
            "isSpeciality" : component.get("v.isSpecialityProduct")
        });
        
        compEvent.fire();
	},  
    onCheck: function(cmp, evt, helper) {	
        helper.setMedTotalRecToChecked(cmp);               
    },
    onFundingTypeChange : function(component, evt) {		   
        component.set('v.OpportunityLineItemsObj.Funding_Type__c',component.find("FundingType").get("v.value"));       
    }, 
    onDispositionChange : function(component, evt,helper) {		   
        component.set('v.OpportunityLineItemsObj.Disposition_Other_Buy_Up_Programs__c',component.find("DispositionAuraId").get("v.value"));       
        helper.caluculateTotalRecordDisposition(component);
    }, 
})