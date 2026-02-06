({
    doInit : function(component, event, helper) {
        
        component.set('v.Helper', helper);
        var totalRecordObj = { "Existing_Members_Involved_in_the_Bid__c":0,"Mbrs_Transferred_From_To_Another_Segment__c":0, "Estimated_Additional_New_Members__c":0,"Estimated_Members_Existing_New__c":0,"Members_Quoted_in_the_Proposal__c":0,"Existing_Membership_at_Risk__c":0,"Sold_Retained_Members__c":0,"Net_Results__c":0,"Annual_Revenue_Premium__c":0,"Termed_Members__c":0,"Sold_New_Members__c":0,"Product_Conversion__c":0};
        component.set('v.totalRecordObj',totalRecordObj); 
        var isQAVal = component.get('v.isQA');        
        var isQA = (isQAVal!=undefined && isQAVal!= null && isQAVal != false) ? true : false;
        
        if(isQA) {
            component.set('v.isEditRecordForCompetitors', false);   
        } else {
            component.set('v.isEditRecordForCompetitors', component.get('v.isEditRecord'));   
        }
        
        if(!component.get('v.isExapand')){
            component.set('v.isExapand',true);            
            helper.getMAProductsAndCompetitorsFromSF(component,event, true);
        }
        
        var SalesStage = component.get('v.SalesStage');                        
        var previousSalesStage = component.get('v.previousSalesStage');                  
        
        var productTypesValues = component.get('v.productTypesValues');
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        
        var SalesStageOther = component.get('v.SalesStageOther');
        var previousSalesStageOther = component.get('v.previousSalesStageOther');
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        var otherStage =  $A.get("$Label.c.Other_Buy_Up_Program");      
        
        if(productTypesValues != undefined && productTypesValues != null && productTypesValues.substring(0,'Medical'.length) == 'Medical'){
            component.set('v.hasMedical',true);
        }
        
        if(SalesStage != undefined && SalesStage != null && SalesStage != '' && SalesStage.length > 0){            
            if(SalesStage == 'Pending Transfer In' || SalesStage == 'Pending Spin-Off' || SalesStage == 'Spin-Off' || SalesStage == 'Pending Transfer Out' || SalesStage == 'Transfer In/Out'){
                component.set('v.isPendingTransfer',true); 
                component.set('v.isCompetitorsShown', false); 
                if(SalesStage == 'Pending Spin-Off' || SalesStage == 'Spin-Off')
                    component.set('v.isPendingSpinOff',true); 
                else
                    component.set('v.isPendingSpinOff',false); 

            }else{
                component.set('v.isPendingTransfer',false);
                component.set('v.isCompetitorsShown', true); 
            }            
        }        
        if(isMedicalAndOthersTab){
            if(SalesStageOther != undefined && SalesStageOther != null && SalesStageOther != '' && SalesStageOther.length > 0){            
                if(SalesStageOther == 'Pending Transfer In' || SalesStageOther == 'Pending Spin-Off' || SalesStageOther == 'Spin-Off'  || SalesStageOther == 'Pending Transfer Out' || SalesStageOther == 'Transfer In/Out'){
                    component.set('v.isPendingTransferforOther',true); 
                    if(SalesStageOther == 'Pending Spin-Off' || SalesStageOther == 'Spin-Off')
                        component.set('v.isPendingSpinOff',true); 
                    else
                        component.set('v.isPendingSpinOff',false); 
                }else{
                    component.set('v.isPendingTransferforOther',false);
                }
                var isPendingTransferVal = component.get('v.isPendingTransfer');
                var isPendingTransferforOtherVal = component.get('v.isPendingTransferforOther');
                if(isPendingTransferVal != undefined && isPendingTransferVal != null && isPendingTransferVal == true && 
                   isPendingTransferforOtherVal != undefined && isPendingTransferforOtherVal != null && isPendingTransferforOtherVal == true) { 
                    component.set('v.isCompetitorsShown', false);
                } else {
                    component.set('v.isCompetitorsShown', true);
                }
            }            
        }
    },
    chageEditEvent : function(component, event, helper) {
        component.set('v.isEditRecordForCompetitors', component.get('v.isEditRecord'));   
        if(!component.get('v.isExapand')){
            component.set('v.isExapand',true);            
            helper.getMAProductsAndCompetitorsFromSF(component,event);
        }
    },             
    onSelectSalesStage : function(component, event, helper) {
        var selected = component.find("salesStageAuraId");
        component.set('v.SalesStage',selected.get("v.value"));
    },
    editRecords : function(component, event, helper) {
        component.set('v.isEditRecord',true);
        component.set('v.isEditRecordForCompetitors', component.get('v.isEditRecord'));
    },    
    cancelRecords : function(component, event, helper) {        
        //component.set('v.isExapand',false);    
        helper.getMAProductsAndCompetitorsFromSF(component,event);
    },
    toggleExpandCollapse : function(component, event, helper) {        
        component.set('v.isExapand',!component.get('v.isExapand'));
        if(component.get('v.isExapand')){
            helper.getMAProductsAndCompetitorsFromSF(component);
        }
    },
    openProductsAndCompetitorMethod : function(component, event, helper) {
        if(!component.get('v.isExapand')){
            helper.getMAProductsAndCompetitorsFromSF(component,event);
        }
    },
    productActionEventsMethod : function(component, event, helper) {     
        //console.log('productActionEventsMethod');
        if(event.getParam('isDelete')) { 
            
            var productType = event.getParam('productType');
            productType = (productType != undefined && productType != null) ? productType : '';
            var isAlertForOnlyOnePdt = component.get('v.alertForOnlyOnePdt');
            isAlertForOnlyOnePdt = (isAlertForOnlyOnePdt != undefined && isAlertForOnlyOnePdt != null) ? isAlertForOnlyOnePdt : false;
            var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
            
            /* Case 1539 -> Products -- Make Adding a Product REQUIRED in Lead & Emerging Risk Stage START *
            
            var products = component.get('v.productsList');       
            if(products != undefined && products != null && products.length != undefined && products.length != null && products.length > 0) {
                for(var i = 0 ; i < products.length ; i++) {
                    var productObject = products[i];                    
                    var alertType = 'Alert';
                    var salesStage = '';
                    if(isMedicalAndOthersTab && productObject.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program")) {
                        salesStage = component.get('v.SalesStageOther');
                    } else {
                        salesStage = component.get('v.SalesStage');
                    }
                    salesStage = (salesStage != undefined && salesStage != null) ? salesStage  : '';
                    var maType = component.get('v.maType');
                    maType = (maType != undefined && maType != null) ? maType  : '';                    
                    if((salesStage == 'Lead' || salesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) && 
                       		maType == $A.get("$Label.c.MA_CM_TYPE") && productObject.MA_Category == productType && 
                       			productObject.opportunityLineList != undefined && productObject.opportunityLineList != null && 
                       				productObject.opportunityLineList.length == 1) {
                        var alertMessage ='Atleast one product to be available in the '+productObject.MA_Category+' Products section.'; 
                        if(productObject.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program")) {
                            alertMessage ='Atleast one product to be available in the Other Buy Up Products section.';
                        }
                        component.set('v.alertForOnlyOnePdt', true);                        
                        helper.showAlert(component,alertMessage,alertType);
                        return false;
                    } 
                }
            }
            
            /* Case 1539 -> Products -- Make Adding a Product REQUIRED in Lead & Emerging Risk Stage END */
            
            if(isAlertForOnlyOnePdt == false) {
                var deleteAlert = component.find('deleteAlert');
                for(var i = 0; i < deleteAlert.length ; i=i+1){
                    $A.util.removeClass(deleteAlert[i], 'slds-hide');
                    $A.util.addClass(deleteAlert[i], 'slds-show');
                }        
                component.set('v.isOpptyLineItems',true);            
                component.set('v.deleteEvent',event);  
                component.set('v.deleteMessage','Do you want to delete this Product');
            }            
        }            
    },
    validateOpportunitiesProductsAndCompetitors : function(component, event, helper) { 
        console.log('validateOpportunitiesProductsAndCompetitors');
        component.set('v.isAlertShowned',false);
        var oppId = component.get('v.MArecordId');
        var isNotQA = (oppId!=undefined && oppId!= null) ? true : false;
        var isDataValid = helper.validateOpportunitiesProducts(component);
        if(isDataValid && isNotQA) {
            var competitorsListComponent = component.find('eachCompetitorAuraId');
            if(competitorsListComponent != undefined && competitorsListComponent != null){
                if(competitorsListComponent.length > 0) {
                    for(var i = 0 ; i < competitorsListComponent.length ; i++){
                        if(!helper.validateCompetitors(component,competitorsListComponent[i])){
                            isDataValid = false;
                            break;
                        }                    
                    }
                } else {
                    if(!helper.validateCompetitors(component,competitorsListComponent)){
                        isDataValid = false;
                    }                  
                }            
            }
        }
        if(isNotQA == false) {
        	component.set('v.previousSalesStage', '');
            component.set('v.previousSalesStageOther', '');
        }
        if(isDataValid){                                           
            if(component.get('v.hasMedical')){
                var opportunityRecord = component.get('v.opportunityRecord');
                opportunityRecord['Sold_New_Mbrs__c'] = 0;
                opportunityRecord['Termed_Mbrs__c'] = 0;
                opportunityRecord['Net_Results__c'] = 0;
                //opportunityRecord['Members_QUOTED_in_the_Proposal_Medical__c'] = 0;
                opportunityRecord['Estimated_Members_Existing_New__c'] = 0;
                
                opportunityRecord['Existing_Members_Retained__c'] = 0;
                opportunityRecord['Existing_Members_Retained_Pinnacle__c'] = 0;                
                
                opportunityRecord['Sold_Retained_Members__c'] = 0;
                var totalRecordObj = component.get('v.totalRecordObj');
                opportunityRecord['Estimated_Additional_New_Members__c'] = totalRecordObj.Estimated_Additional_New_Members__c;
                opportunityRecord['Existing_Members_Involved_in_the_Bid__c'] = totalRecordObj.Existing_Members_Involved_in_the_Bid__c;            
                opportunityRecord['Existing_Membership_at_Risk__c'] = totalRecordObj.Existing_Membership_at_Risk__c;
                opportunityRecord['Members_Trans_From_or_To_Another_Segment__c'] = totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c;
                
                
                var maType = component.get('v.maType');        
                
                if(maType == $A.get("$Label.c.MA_CD_TYPE")){
                    opportunityRecord['Estimated_Members_Existing_New__c'] = totalRecordObj.Estimated_Additional_New_Members__c+totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c;                        	
                    opportunityRecord['Members_QUOTED_in_the_Proposal_Medical__c'] = totalRecordObj.Members_Quoted_in_the_Proposal__c;
                }else{
                    opportunityRecord['Estimated_Members_Existing_New__c'] = totalRecordObj.Estimated_Additional_New_Members__c+totalRecordObj.Existing_Members_Involved_in_the_Bid__c;                               
                    if(component.get('v.SalesStage') == 'Notified'){
                        opportunityRecord['Net_Results__c'] = totalRecordObj.Net_Results__c;
                        opportunityRecord['Sold_Retained_Members__c'] = totalRecordObj.Sold_Retained_Members__c;
                        var soldRetained = 0;
                        if(totalRecordObj.Sold_Retained_Members__c != undefined || totalRecordObj.Sold_Retained_Members__c != null )soldRetained = totalRecordObj.Sold_Retained_Members__c;                                
                        if(component.get('v.Disposition') == 'Closed Emerging Risk') {
                            opportunityRecord['Existing_Members_Retained__c'] = soldRetained;
                        } else {
                            if(soldRetained >= totalRecordObj.Existing_Members_Involved_in_the_Bid__c){
                                opportunityRecord['Existing_Members_Retained__c'] = totalRecordObj.Existing_Members_Involved_in_the_Bid__c;
                            }else{
                                opportunityRecord['Existing_Members_Retained__c'] = soldRetained;
                            }                            
                        }
                        if(soldRetained >= totalRecordObj.Existing_Membership_at_Risk__c){
                            opportunityRecord['Existing_Members_Retained_Pinnacle__c'] = totalRecordObj.Existing_Membership_at_Risk__c;
                        }else{
                            opportunityRecord['Existing_Members_Retained_Pinnacle__c'] = soldRetained;
                        }
                    }                
                }            
                
                if(component.get('v.SalesStage') == 'Notified'){
                    opportunityRecord['Net_Results__c'] = totalRecordObj.Net_Results__c;
                    opportunityRecord['Sold_Retained_Members__c'] = totalRecordObj.Sold_Retained_Members__c;
                    if(component.get('v.Disposition') == 'Sold'){
                        if(totalRecordObj.Net_Results__c != undefined && totalRecordObj.Net_Results__c > 0){
                            opportunityRecord['Overall_New_Membership_Impact__c'] = totalRecordObj.Net_Results__c;                    
                        }else{
                            opportunityRecord['Overall_New_Membership_Impact__c'] = 0;
                        }
                        
                    }else{
                        opportunityRecord['Overall_New_Membership_Impact__c'] = totalRecordObj.Estimated_Additional_New_Members__c;                    
                    }
                    
                    if(totalRecordObj.Net_Results__c != null && totalRecordObj.Net_Results__c != undefined){
                        if(opportunityRecord['Net_Results__c'] >= 0){
                            opportunityRecord['Sold_New_Mbrs__c'] = totalRecordObj.Net_Results__c;
                            opportunityRecord['Termed_Mbrs__c'] = 0;
                        }else{
                            opportunityRecord['Termed_Mbrs__c'] = totalRecordObj.Net_Results__c;
                            opportunityRecord['Sold_New_Mbrs__c'] = 0;
                        }
                    }else{
                        opportunityRecord['Sold_New_Mbrs__c'] = 0;
                        opportunityRecord['Termed_Mbrs__c'] = 0;
                    }
                    
                }else{
                    opportunityRecord['Overall_New_Membership_Impact__c'] = totalRecordObj.Estimated_Additional_New_Members__c;
                    opportunityRecord['Existing_Members_Retained_Pinnacle__c']  = 0;
                    opportunityRecord['Existing_Members_Retained__c'] = 0;
                }
                
                component.set('v.opportunityRecord',opportunityRecord); 
            }  
            
            var otherStage =  $A.get("$Label.c.Other_Buy_Up_Program");      
            var productTypesValues = component.get('v.productTypesValues');
            var isFoundStepWiseProduct = false;   
            var distributionTypeList = [];
            
            if(productTypesValues.indexOf(otherStage) !== -1 || component.get('v.hasMedical')){                
                var products = component.get('v.productsList');       
                if(products != null){
                    if(products.length != null && products.length > 0 && products.length != 'undefined'){
                        for(var i = 0 ; i < products.length ; i++){
                            var productObject = products[i];                                                                                                                
                            if(productObject.MA_Category.indexOf(otherStage) !== -1 || component.get('v.hasMedical')){                                   
                                var opportunityLineList = productObject.opportunityLineList;                                                    
                                for(var j= 0 ; j < opportunityLineList.length; j++){
                                    var eachProducts = opportunityLineList[j];
                                    if(productObject.MA_Category == 'Medical'){
                                        if(eachProducts.Product2.Distribution_Type_Flag__c != null && eachProducts.Product2.Distribution_Type_Flag__c == true){
                                            distributionTypeList.push(eachProducts.Product2.Name);
                                        }
                                    }else{
                                        if(eachProducts.Product2.Considered_For_StepWise_Integration__c != null && eachProducts.Product2.Considered_For_StepWise_Integration__c == 'Yes'){
                                            isFoundStepWiseProduct = true;
                                            break;
                                        }   
                                    }                                    
                                }
                            }
                        }
                    }
                }
                
                var opportunityRecord = component.get('v.opportunityRecord');                
                
                if(component.get('v.hasMedical')){                    
                    var DistributionType = opportunityRecord['DistributionTypecalculated__c'];
                    console.log('distributionTypeList'+distributionTypeList);                    
                    var distributionTypeArray = [];
                    if(DistributionType != null && DistributionType.length > 0){
                        DistributionType = DistributionType.replace('Normal Distribution','');
                        if(DistributionType != null && DistributionType.length > 0){
                            distributionTypeArray = DistributionType.split('#@');                           
                        }                        
                    }                                        
                    for(var k = 0; k < distributionTypeList.length ; k++){
                        if(distributionTypeArray.indexOf(distributionTypeList[k]) <= -1){
                            distributionTypeArray.push(distributionTypeList[k]);                            
                        }
                    }
                    if(distributionTypeList != null && distributionTypeList.length != null && distributionTypeList.length > 0){
                        opportunityRecord['DistributionTypecalculated__c'] = distributionTypeArray.join('#@');                      
                    }                    
                }
                if(productTypesValues.indexOf(otherStage) !== -1){
                    opportunityRecord['CI_AP_HII__c'] = isFoundStepWiseProduct;   
                }                
            }
            
            if(isNotQA) { 
                var opportunityRecord = component.get('v.opportunityRecord');
                opportunityRecord = helper.returnIncumbentRecords(component, event, opportunityRecord);
                component.set('v.opportunityRecord',opportunityRecord);
            }
        }                        
        return isDataValid;
    },    
    saveOpptyPrdssAndCompetitorsRecordsMethod : function(component, event, helper) {   
        //console.log('saveOpptyPrdssAndCompetitorsRecordsMethod');
        var prevSalesStage = component.get('v.previousSalesStage');
        var salesStage = component.get('v.SalesStage');
        var maType = component.get('v.maType');      
        maType = (maType != undefined && maType != null) ? maType : '';
        //if(component.get('v.needToShowAlertInformation') && maType != undefined && maType != null && maType == $A.get("$Label.c.MA_CM_TYPE") && 
        if(component.get('v.needToShowAlertInformation') && salesStage != undefined && salesStage != null && salesStage == 'Proposal' && 
           		component.get('v.isChangeStageFromEmrgToProposal')) {
            /*if(prevSalesStage == 'Lead') {
                helper.showReminderWhenNoCompetitors(component, false); 
            } else */ if(prevSalesStage == 'Lead' || prevSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                if(maType == $A.get("$Label.c.MA_CD_TYPE")) {
					helper.showReminderWhenNoCompetitors(component, false);                  
                } else {
                    component.set('v.isCompAndPdtsReminderToReview', true);
                }                
            }
        }
        component.set('v.isProductsReminderToReview', false);
        component.set('v.isProductsReminderToAdd', false);
        component.set('v.isProductsReminderToUpdate', false);        
        helper.showAlertInformations(component); 
        
        //helper.saveMAProductsAndCompetitorsInSF(component);   
    },
    changeMA_TypeMethod : function(component, event, helper) {
        var maType = component.get('v.maType');        
        if(maType == $A.get("$Label.c.MA_CD_TYPE")){
            maType = $A.get("$Label.c.MA_CM_TYPE")
        }
        else if(maType == $A.get("$Label.c.MA_CM_TYPE")){
            maType = $A.get("$Label.c.MA_CD_TYPE")
        }
        component.set('v.maType',maType);
    },
    resetProductAndComp : function(component, event, helper) {
        var params = event.getParam('arguments');
        if (params) {
            var ResetSalesStage = params.ResetSalesStage;            
            helper.restButton(component, event,helper,ResetSalesStage);
        }		
        helper.saveMAProductsAndCompetitorsInSF(component, event,helper,ResetSalesStage);
    },
    eachProductEventsFromProductList : function(component, event, helper) {
                
        if(component.get("v.isMedicalAndOthersTab") && event.getParam('isCaluculateOtherProducts')) {            
            helper.setMedicalTotalRecToOthers(component);
        }
        if(event.getParam('isCaluculateOtherProducts')) {
            helper.setTotalToCompetitors(component);
        }
    },
    openProductSearchComponent : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Search Products','ModalBodyData':{'productTypesValues':component.get('v.productTypesValues'),'ModalPagination':true},'ModalBody':'ProductSearch_Component'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        }else{         
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Search Products','ModalBodyData':{'productTypesValues':component.get('v.productTypesValues'),'ModalPagination':true},'ModalBody':'ProductSearch_Component'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
            
        }
        event.stopPropagation();
    },
    addCompetitorsRecords : function(component, event, helper) {
        
        var productValues = component.get('v.productTypesValues');
        productValues = (productValues != undefined && productValues != null) ? productValues : '';
        if(productValues == 'Medical_And_Other_Buy_Up') {
            var isPendingTransferVal = component.get('v.isPendingTransfer');
            var isPendingTransferforOtherVal = component.get('v.isPendingTransferforOther');
            isPendingTransferVal = (isPendingTransferVal!= undefined && isPendingTransferVal != null) ? isPendingTransferVal : false;
            isPendingTransferforOtherVal = (isPendingTransferforOtherVal!= undefined && isPendingTransferforOtherVal != null) ? isPendingTransferforOtherVal : false;
            if(isPendingTransferVal == false && isPendingTransferforOtherVal == false) { 
                productValues = 'Medical and Others';  
            } else if(isPendingTransferVal == false && isPendingTransferforOtherVal == true) {
                productValues = 'Medical'; 
            } else if(isPendingTransferVal == true && isPendingTransferforOtherVal == false) {
                productValues = 'Other Buy Up'; 
            }
        } else {
            if(productValues == 'Other_Buy_Up_Programs') {
                productValues = 'Other Buy Up';  
            } else {
                productValues = component.get('v.productTypesValues');  
            }
        }
        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Search Competitors','ModalBodyData':{'productTypesValues':productValues,'ModalPagination':true},'ModalBody':'CompetitorSearch_Component'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        }else{         
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Search Products','ModalBodyData':{'productTypesValues':component.get('v.productTypesValues'),'ModalPagination':true},'ModalBody':'CompetitorSearch_Component'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
            
        }
        event.stopPropagation();
    },
    modelCloseComponentEvent : function(component, event,helper) {        
        helper.modalGenericClose(component);
    },
    addProductsToOpportunityProducts : function(component, event,helper) {            
        //console.log('add products');       
        var isCancelVal = event.getParam('isCancel');
        if(isCancelVal != undefined && isCancelVal != null && isCancelVal) {
            helper.modalGenericClose(component);
        } else {
            helper.enableCancelSaveButton(component);
            helper.addOppProductsRecords(component,event);   
        }
    },    
    salesStageChangeEvent : function(component, event,helper) {                   
        
        console.log('changeSalesStagesEvent');
        component.set('v.needToShowAlertInformation',true);
        
        var SalesStage = component.get('v.SalesStage');                        
        var previousSalesStage = component.get('v.previousSalesStage');                  
        
        var productTypesValues = component.get('v.productTypesValues');
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        
        if(SalesStage != undefined && SalesStage != null && SalesStage != '' && SalesStage.length > 0){            
            if(SalesStage == 'Pending Transfer In' || SalesStage == 'Pending Spin-Off' || SalesStage == 'Spin-Off'  || SalesStage == 'Pending Transfer Out' || SalesStage == 'Transfer In/Out'){
                component.set('v.isPendingTransfer',true);
                component.set('v.isCompetitorsShown', false);
                if(SalesStage == 'Pending Spin-Off' || SalesStage == 'Spin-Off')
                        component.set('v.isPendingSpinOff',true); 
                    else
                        component.set('v.isPendingSpinOff',false); 
            }else{
                component.set('v.isPendingTransfer',false);
                component.set('v.isCompetitorsShown', true); 
            }
        }else{
            return;
        }                
        if(isMedicalAndOthersTab){
            helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,$A.get("$Label.c.Medical"),true,false,false);
            var isPendingTransferVal = component.get('v.isPendingTransfer');
            var isPendingTransferforOtherVal = component.get('v.isPendingTransferforOther');
            if(isPendingTransferVal != undefined && isPendingTransferVal != null && isPendingTransferVal == true && 
               isPendingTransferforOtherVal != undefined && isPendingTransferforOtherVal != null && isPendingTransferforOtherVal == true) { 
                component.set('v.isCompetitorsShown', false);
            } else {
                component.set('v.isCompetitorsShown', true);
            }
        }else{
            var otherStage =  $A.get("$Label.c.Other_Buy_Up_Program");            
            if(productTypesValues.substring(0,otherStage.length) == otherStage){
                helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,$A.get("$Label.c.Other_Buy_Up_Program"),true,false,false);   
            }else{
                helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,productTypesValues,true,false,false);   
            }  
        }  
        component.set('v.isProductsReminderToReview', false);
        component.set('v.isProductsReminderToAdd', false);
        component.set('v.isProductsReminderToUpdate', false);
        if(previousSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside") && SalesStage == 'Proposal') {          
            component.set('v.isChangeStageFromEmrgToProposal',true);
            /*var maType = component.get('v.maType');        
            if(maType != undefined && maType != null && maType == $A.get("$Label.c.MA_CM_TYPE")) {
            	helper.showReminderWhenNoCompetitors(component, event, true);     
            }
            component.set('v.isAlertShowned',false);
            component.set('v.isProductsReminderToReview', true);            
            helper.showAlert(component,'','Reminder'); */
            helper.setTotalRecords(component);
            helper.setTotalToCompetitors(component);
        }else{
            component.set('v.isChangeStageFromEmrgToProposal',true);
        }
        //ghanshyam c live effect on other buy up when stage changes
        if(component.find('eachProductAuraId') != undefined && component.find('eachProductAuraId') != null) {
            if(Array.isArray(component.find('eachProductAuraId'))){
                if(component.find('eachProductAuraId')[1] != undefined && component.find('eachProductAuraId')[1] != null){
                    if(component.find('eachProductAuraId')[1].find('eachProductRecordAuraId') != undefined && component.find('eachProductAuraId')[1].find('eachProductRecordAuraId') != null){
                        if(Array.isArray(component.find('eachProductAuraId')[1].find('eachProductRecordAuraId'))){
                            for(var i=0; i<component.find('eachProductAuraId')[1].find('eachProductRecordAuraId').length; i++){
                                component.find('eachProductAuraId')[1].find('eachProductRecordAuraId')[i].updateOthersRec();
                            }
                        }else{
                            component.find('eachProductAuraId')[1].find('eachProductRecordAuraId').updateOthersRec();
                        }
                    }
                }
            }
        }
    },
    salesStageOtherChangeEvent : function(component, event,helper) {                            
        var SalesStageOther = component.get('v.SalesStageOther');
        var previousSalesStageOther = component.get('v.previousSalesStageOther');
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        if(isMedicalAndOthersTab){
            if(SalesStageOther != undefined && SalesStageOther != null && SalesStageOther != '' && SalesStageOther.length > 0){            
                if(SalesStageOther == 'Pending Transfer In' || SalesStageOther == 'Pending Spin-Off' || SalesStageOther == 'Spin-Off'  || SalesStageOther == 'Pending Transfer Out' || SalesStageOther == 'Transfer In/Out'){
                    component.set('v.isPendingTransferforOther',true);
                    if(SalesStageOther == 'Pending Spin-Off' || SalesStageOther == 'Spin-Off')
                        component.set('v.isPendingSpinOff',true); 
                    else
                        component.set('v.isPendingSpinOff',false); 
                }else{
                    component.set('v.isPendingTransferforOther',false);
                }
                var isPendingTransferVal = component.get('v.isPendingTransfer');
                var isPendingTransferforOtherVal = component.get('v.isPendingTransferforOther');
                if(isPendingTransferVal != undefined && isPendingTransferVal != null && isPendingTransferVal == true && 
                   isPendingTransferforOtherVal != undefined && isPendingTransferforOtherVal != null && isPendingTransferforOtherVal == true) { 
                    component.set('v.isCompetitorsShown', false);
                } else {
                    component.set('v.isCompetitorsShown', true);
                }
            }else{
                return;
            } 
        }     
        helper.changeSalesStagesEvent(component,SalesStageOther,previousSalesStageOther,$A.get("$Label.c.Other_Buy_Up_Program"),true,false,false);                
        component.set('v.isProductsReminderToReview', false);
        component.set('v.isProductsReminderToAdd', false);
        component.set('v.isProductsReminderToUpdate', false);
        if(previousSalesStageOther == $A.get("$Label.c.EmergingRiskOrNoUpside") && SalesStageOther == 'Proposal'){
            //component.set('v.isAlertShowned',false);
            //component.set('v.isProductsReminderToReview', true);
            //helper.showAlert(component,'','Reminder');
            helper.setTotalRecords(component);
            helper.setTotalToCompetitors(component);
        } 
        //ghanshyam c live effect on other buy up when stage changes
        if(component.find('eachProductAuraId') != undefined && component.find('eachProductAuraId') != null){
            if(Array.isArray(component.find('eachProductAuraId'))){
                if(component.find('eachProductAuraId')[1] != undefined && component.find('eachProductAuraId')[1] != null){
                    if(component.find('eachProductAuraId')[1].find('eachProductRecordAuraId') != undefined && component.find('eachProductAuraId')[1].find('eachProductRecordAuraId') != null){
                        if(Array.isArray(component.find('eachProductAuraId')[1].find('eachProductRecordAuraId'))){
                            for(var i=0; i<component.find('eachProductAuraId')[1].find('eachProductRecordAuraId').length; i++){
                                component.find('eachProductAuraId')[1].find('eachProductRecordAuraId')[i].updateOthersRec();
                            }
                        }else{
                            component.find('eachProductAuraId')[1].find('eachProductRecordAuraId').updateOthersRec();
                        }
                    }
                }
            }
        }
    },
    changeSalesStagesGeneralEvent : function(component, event,helper) {                   
        
        console.log('changeSalesStagesEvent');
        
        var SalesStage = component.get('v.SalesStage');                        
        var previousSalesStage = component.get('v.previousSalesStage');                  
        
        var productTypesValues = component.get('v.productTypesValues');
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        
        if(isMedicalAndOthersTab){
            helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,$A.get("$Label.c.Medical"),false,false,true);                        
        }else{
            var otherStage =  $A.get("$Label.c.Other_Buy_Up_Program");            
            if(productTypesValues.substring(0,otherStage.length) == otherStage){
                helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,$A.get("$Label.c.Other_Buy_Up_Program"),false,false,true);   
            }else{
                helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,productTypesValues,false,false,true);   
            }  
        }                
    },
    changeGenericEvent : function(component, event,helper) {        
        console.log('Disposition change event ******************************');
        var productTypesValues = component.get('v.productTypesValues');        
        var SalesStage = component.get('v.SalesStage');
        var previousSalesStage = component.get('v.previousSalesStage');             
        
        var SalesStageOther = component.get('v.SalesStageOther');
        var previousSalesStageOther = component.get('v.previousSalesStageOther');  
        
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        
        if(isMedicalAndOthersTab){
            helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,$A.get("$Label.c.Medical"),true,true);
            if(SalesStageOther == 'Notified'){
                helper.changeSalesStagesEvent(component,SalesStageOther,previousSalesStageOther,$A.get("$Label.c.Other_Buy_Up_Program"),true,true,false);   
            }else{
                helper.changeSalesStagesEvent(component,SalesStageOther,previousSalesStageOther,$A.get("$Label.c.Other_Buy_Up_Program"),false,true,false);   
            }            
        }else{
            var otherStage =  $A.get("$Label.c.Other_Buy_Up_Program");            
            if(productTypesValues.substring(0,otherStage.length) == otherStage){
                helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,$A.get("$Label.c.Other_Buy_Up_Program"),true,true,false);   
            }else{
                helper.changeSalesStagesEvent(component,SalesStage,previousSalesStage,productTypesValues,true,true,false);   
            }  
        } 
        helper.setTotalRecords(component);
        
    },
    changeSalesStagesOtherEvent : function(component, event,helper) {
        return;
        var SalesStageOther = component.get('v.SalesStageOther');
        var previousSalesStageOther = component.get('v.previousSalesStageOther');
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        if(isMedicalAndOthersTab){
            if(SalesStageOther != undefined && SalesStageOther != null && SalesStageOther != '' && SalesStageOther.length > 0){            
                if(SalesStageOther == 'Pending Transfer In' || SalesStageOther == 'Pending Spin-Off' || SalesStageOther == 'Spin-Off'  || SalesStageOther == 'Pending Transfer Out' || SalesStageOther == 'Transfer In/Out'){
                    component.set('v.isPendingTransferforOther',true);   
                    if(SalesStageOther == 'Pending Spin-Off' || SalesStageOther == 'Spin-Off')
                        component.set('v.isPendingSpinOff',true); 
                    else
                        component.set('v.isPendingSpinOff',false); 
                }else{
                    component.set('v.isPendingTransferforOther',false);  
                }            
            }else{
                return;
            } 
        }         
        helper.changeSalesStagesEvent(component,SalesStageOther,previousSalesStageOther,$A.get("$Label.c.Other_Buy_Up_Program"),false,false,true);        
    },  
    removeCompetitorsData : function(component, event,helper) { 
        
        if(event.getParam("competitorDataToBeRemoved") != null || 
           event.getParam("competitorRecordIndex") != null) {
            component.set('v.isOpptyLineItems',false);
            component.set('v.deleteEvent',event);
            component.set('v.deleteMessage','Do you want to delete this Competitor');
            var deleteAlert = component.find('deleteAlert');
            for(var i = 0; i < deleteAlert.length ; i=i+1){
                $A.util.removeClass(deleteAlert[i], 'slds-hide');
                $A.util.addClass(deleteAlert[i], 'slds-show');
            } 
        }
    },
    addAccountCompetitors : function(component, event,helper) { 
        var isCancelVal = event.getParam('isCancel');
        if(isCancelVal != undefined && isCancelVal != null && isCancelVal) {
            helper.modalGenericClose(component);
        } else {
            helper.enableCancelSaveButton(component);
            helper.addNewCompetitorRecords(component, event);
        }
    },
    closeAlert : function(component, event,helper) { 
        helper.hideAlert(component);      
        if(component.get('v.isAlertShowned')){
            component.set('v.isAlertShowned',false);
            var isAlertForOnlyOnePdt = component.get('v.alertForOnlyOnePdt');         
            isAlertForOnlyOnePdt = (isAlertForOnlyOnePdt != undefined && isAlertForOnlyOnePdt != null) ? isAlertForOnlyOnePdt : false;
            if(isAlertForOnlyOnePdt != undefined && isAlertForOnlyOnePdt != null && isAlertForOnlyOnePdt) {
				component.set('v.alertForOnlyOnePdt', false); 
            } else {
				helper.saveMAProductsAndCompetitorsInSF(component);    
            }
        }
    },
    confirmDelete: function(component, event, helper) {                        
        var deleteAlert = component.find('deleteAlert');
        for(var i = 0; i < deleteAlert.length ; i=i+1){
            $A.util.removeClass(deleteAlert[i], 'slds-show');
            $A.util.addClass(deleteAlert[i], 'slds-hide');
        }      
        if(component.get('v.isOpptyLineItems')){
            helper.removeOpportunityLineItemsInHelper(component);   
        }else{
            helper.removeCompetitorRecord(component);
        }        
    },
    updateMembersInvolvedInProposalInCompetitors : function(component, event,helper) {
        
        var maTypeVal = component.get('v.maType');
        var currentSalesStage = component.get('v.SalesStage');
        var prevSalesStage = component.get('v.previousSalesStage');
        
        var childCmp = component.find("eachCompetitorAuraId");
        if(childCmp != null && childCmp != undefined) {
            if(Array.isArray(childCmp)) {
                for(var i=0;i<childCmp.length;i++) {
                    var obj = childCmp[i];
                    var productType = obj.get('v.productType');
                    var isToBeTriggerred = false;
                    if(productType != undefined && productType != null && productType == 'Medical') {
                        if(maTypeVal != null && maTypeVal == 'NBEA') {
                            if(currentSalesStage != undefined && currentSalesStage != null) {
                                if(currentSalesStage == 'Notified') {
                                    if(prevSalesStage != undefined && prevSalesStage != null) {
                                        var stageVal = prevSalesStage+'->'+currentSalesStage;
                                        if(stageVal=='Proposal->Notified' || stageVal=='In Review->Notified' || 
                                           stageVal=='Finalist->Notified' || (stageVal=='Lead->Notified' && component.get('v.Disposition') == 'Sold')) {
                                            isToBeTriggerred = true;
                                        }
                                    } 
                                } else {
                                    if((currentSalesStage=='Proposal' || currentSalesStage=='In Review' || 
                                        currentSalesStage=='Finalist')) {
                                        isToBeTriggerred = true;
                                    }
                                } 
                            }
                        } else if(maTypeVal != null && maTypeVal == 'NB') {
                            isToBeTriggerred = true;
                        }
                        if(isToBeTriggerred != null && isToBeTriggerred) {
                            childCmp[i].updateMembersInvolvedInMA(component.get('v.SelectedMemInPropsal')); 
                        }
                    }
                } 
            } else {
                var productType = childCmp.get('v.productType');
                var isToBeTriggerred = false;
                if(productType != undefined && productType != null && productType == 'Medical') {
                    if(maTypeVal != null && maTypeVal == 'NBEA') {
                        if(currentSalesStage != undefined && currentSalesStage != null) {
                            if(currentSalesStage == 'Notified') {
                                if(prevSalesStage != undefined && prevSalesStage != null) {
                                    var stageVal = prevSalesStage+'->'+currentSalesStage;
                                    if(stageVal=='Proposal->Notified' || stageVal=='In Review->Notified' || 
                                        stageVal=='Finalist->Notified' || (stageVal=='Lead->Notified' && component.get('v.Disposition') == 'Sold')) {
                                        isToBeTriggerred = true;
                                    }
                                } 
                            } else {
                                if((currentSalesStage=='Proposal' || currentSalesStage=='In Review' || 
                                    currentSalesStage=='Finalist')) {
                                    isToBeTriggerred = true;
                                }
                            } 
                        }
                    } else if(maTypeVal != null && maTypeVal == 'NB') {
                        isToBeTriggerred = true;
                    }
                    if(isToBeTriggerred != null && isToBeTriggerred) {
                        childCmp.updateMembersInvolvedInMA(component.get('v.SelectedMemInPropsal')); 
                    }
                }
            }
        }
    },
    confirmCancel: function(component, event, helper) {
        var deleteAlert = component.find('deleteAlert');
        for(var i = 0; i < deleteAlert.length ; i=i+1){
            $A.util.removeClass(deleteAlert[i], 'slds-show');
            $A.util.addClass(deleteAlert[i], 'slds-hide');
        }
    },    
    focusCompetitorsSection : function(component, event, helper) {
        
        component.set('v.opportunityRecord.isProductCompValidated__c',false);
        component.set('v.needToShowAlertInformation',false);
        
        helper.stopProcessing(component);
        //console.log('focusCompetitorsSection');
        helper.hideAlert(component);
        helper.clickEditButton(component);
        helper.enableCancelSaveButton(component);
        
        component.set('v.isCompetitorReminderToBeShown', false);
        component.set('v.isCompAndPdtsReminderToReview', false);
        component.set('v.isProductsReminderToReview', false);
        component.set('v.isProductsReminderToAdd', false);
        component.set('v.isProductsReminderToUpdate', false);
        
        var isMedicalAndOtherTab = component.get('v.isMedicalAndOthersTab');
        if(isMedicalAndOtherTab != undefined && isMedicalAndOtherTab != null && isMedicalAndOtherTab) { 
            var childCmp = component.find("eachCompetitorAuraId");
            if(childCmp != null && childCmp != null && childCmp.length > 0) {
                childCmp[1].focusCompetitorsSection(); 
            }
        } else {
            var cmpEvent = component.getEvent("focusCompetitorsSectionEvent"); 
            cmpEvent.fire();
        }
    },    
    focusProductsSection : function(component, event, helper) {
        
        component.set('v.opportunityRecord.isProductCompValidated__c',false);
        component.set('v.needToShowAlertInformation',false);
        
        helper.stopProcessing(component);
        console.log('focusProductsSection');
        helper.hideAlert(component);
        helper.clickEditButton(component);
        helper.enableCancelSaveButton(component);
        
        var isProductsReminderToReviewVal = component.get('v.isProductsReminderToReview');
        var isProductsReminderToAddVal = component.get('v.isProductsReminderToAdd');
        var isProductsReminderToUpdateVal = component.get('v.isProductsReminderToUpdate');
        var isMedicalAndOtherTab = component.get('v.isMedicalAndOthersTab');
        
        if(isProductsReminderToReviewVal != undefined && isProductsReminderToReviewVal != null && isProductsReminderToReviewVal) {
            
            component.set('v.isCompetitorReminderToBeShown', false);
            component.set('v.isCompAndPdtsReminderToReview', false);
            component.set('v.isProductsReminderToReview', false);
            component.set('v.isProductsReminderToAdd', false);
            component.set('v.isProductsReminderToUpdate', false);
            var isMedOrOthrsVal = component.get('v.isMedOthrsProductsReminder');
            var childCmp = component.find("eachProductAuraId");
            if(childCmp != null && childCmp != undefined) {
                if(Array.isArray(childCmp)) {
                    if(isMedOrOthrsVal != undefined && isMedOrOthrsVal != null && isMedOrOthrsVal == 'Other') {
                        setTimeout(function() { 
                            var focusInputField = component.find("focusInputFieldForProducts");
                            $A.util.removeClass(focusInputField, 'slds-hide');            	 
                            focusInputField.focus();
                            $A.util.addClass(focusInputField, 'slds-hide');
                        }, 100);  
                    } else {
                        childCmp[0].focusProductsSection(true); 
                    }
                } else {
                    childCmp.focusProductsSection(true); 
                }
            }
        } else if(isProductsReminderToAddVal != undefined && isProductsReminderToAddVal != null && isProductsReminderToAddVal) {
            
            component.set('v.isCompetitorReminderToBeShown', false);
            component.set('v.isCompAndPdtsReminderToReview', false);
            component.set('v.isProductsReminderToReview', false);
            component.set('v.isProductsReminderToAdd', false);
            component.set('v.isProductsReminderToUpdate', false);
            if(isMedicalAndOtherTab != undefined && isMedicalAndOtherTab != null && isMedicalAndOtherTab) {
                var isMedOrOthrsVal = component.get('v.isMedOthrsProductsReminder');
                if(isMedOrOthrsVal != undefined && isMedOrOthrsVal != null && isMedOrOthrsVal == 'Other') {
                    setTimeout(function() { 
                        var focusInputField = component.find("focusInputFieldForProducts");
                        $A.util.removeClass(focusInputField, 'slds-hide');            	 
                        focusInputField.focus();
                        $A.util.addClass(focusInputField, 'slds-hide');
                    }, 100);  
                } else {
                    var childCmp = component.find("eachProductAuraId");
                    if(childCmp != null && childCmp != null && childCmp.length > 0) {
                        childCmp[1].focusProductsSection(true); 
                    } 
                }
            } else {
                setTimeout(function() { 
                    var focusInputField = component.find("focusInputFieldForProducts");
                    $A.util.removeClass(focusInputField, 'slds-hide');            	 
                    focusInputField.focus();
                    $A.util.addClass(focusInputField, 'slds-hide');
                }, 100);
            }
        } else if(isProductsReminderToUpdateVal != undefined && isProductsReminderToUpdateVal != null && isProductsReminderToUpdateVal) {
            
            component.set('v.isCompetitorReminderToBeShown', false);
            component.set('v.isCompAndPdtsReminderToReview', false);
            component.set('v.isProductsReminderToReview', false);
            component.set('v.isProductsReminderToAdd', false);
            component.set('v.isProductsReminderToUpdate', false);
            if(isMedicalAndOtherTab != undefined && isMedicalAndOtherTab != null && isMedicalAndOtherTab) { 
                var isMedOrOthrsVal = component.get('v.isMedOthrsProductsReminder');
                if(isMedOrOthrsVal != undefined && isMedOrOthrsVal != null) {
                    if(isMedOrOthrsVal == 'Medical') {
                        var childCmp = component.find("eachProductAuraId");
                        if(childCmp != null && childCmp != null && childCmp.length > 0) {
                            childCmp[1].focusProductsSection(); 
                        } 
                    } else if(isMedOrOthrsVal == 'Other' || isMedOrOthrsVal == '') {
                        setTimeout(function() { 
                            var focusInputField = component.find("focusInputFieldForProducts");
                            $A.util.removeClass(focusInputField, 'slds-hide');            	 
                            focusInputField.focus();
                            $A.util.addClass(focusInputField, 'slds-hide');
                        }, 100);
                    }
                }
            }
        }
    }
})