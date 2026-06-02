/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-25-2024
 * @last modified by  : Spoorthy
**/
({
	getMAProductsAndCompetitorsFromSF : function(component,event, isDoInit) {
        //this.startProcessing(component);
        this.stopProcessing(component);   
        var spinner = component.find("mySpinnerProd");
		$A.util.removeClass(spinner, "slds-hide");        
        var action = component.get('c.getProductsAndCompetitorsDetails');	    
        action.setParams({
            "opportunityId" : component.get('v.MArecordId'),
            'accountId' : component.get('v.accountId'),
            "opportunityCategory" : component.get('v.maType'),
            "selectedProductTypes" : component.get('v.productTypesValues'),
            "prevSalesStage" : component.get('v.previousSalesStage'),
            "currentSalesStage" : component.get('v.SalesStage'),
            "opportunityObj" : component.get('v.opportunityRecord'),
            "isReadOnly" : component.get('v.isReadOnly'),
            "isOnLoad" : isDoInit
        });
        
        action.setCallback(this, function(response) {
            this.stopProcessing(component);
            var state = response.getState();       
            if (state === "SUCCESS") {                
                var responseResult = response.getReturnValue();    
                if(responseResult != null){        
                    //console.log('Resoponse '+responseResult);
                    console.log('get products and competitors');
                    if(responseResult.BuyupProductList!=null){
                        component.set('v.BuyupProductList',responseResult.BuyupProductList);
                    }
                    var responseObjForOppPdts = responseResult.productsAppletWrapperClassObj;
					component.set('v.isMedicalAndOthersTab',responseObjForOppPdts.isMedicalAndOthersTab);                                      
                    component.set('v.account',responseObjForOppPdts.account);
                    component.set('v.fundingTypePicklistVals',responseObjForOppPdts.fundingTypePicklistVals);
                    component.set('v.dispositionPicklistVals',responseObjForOppPdts.dispositionPicklistVals);                     
                    component.set('v.totalRecordId',responseObjForOppPdts.totalOppLineItemObj);
                    component.set('v.productsList',responseObjForOppPdts.productsDetailsList); 
                    var productTypesValues = component.get('v.productTypesValues');
                    if(!component.get('v.isReadOnly') && (productTypesValues.indexOf('Other') !== -1 || component.get('v.hasMedical'))){   
                        var opportunityRecord = component.get('v.opportunityRecord');
                    	opportunityRecord['CI_AP_HII__c'] = responseObjForOppPdts.isStepWiseProduct; 
                        component.set('v.opportunityRecord',opportunityRecord);
                        this.triggerStepWiseProductEvent(component,responseObjForOppPdts.isStepWiseProduct);
                    }                    
                    
                    var responseObjForCompetitors = responseResult.competitorsWrapperClassObj;
                    //component.set('v.isMedicalAndOthersTab',responseObjForCompetitors.isMedicalAndOthersTab);
                    component.set('v.CompetitorsListObject',responseObjForCompetitors.competitorsList);
                    var isDoInitVal = isDoInit;
                    if(isDoInitVal != undefined && isDoInitVal != null && isDoInitVal) {
                     	this.setTotalToCompetitors(component); 
                    }                                                          
                }              
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            //alert("Error message: " + errors[0].message);
                            this.showAlert(component,errors[0].message,component.get('v.exceptionType'));
                        }
                    } else {
                        //console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
	},
    restButton : function(component, event, helper,ResetSalesStage) {     
        console.log('restButton*********************');
        component.set('v.isReset',true);
        var SalesStage = '';        
        var products = component.get('v.productsList');       
        if(products != null){
            if(products.length != null && products.length > 0 && products.length != 'undefined'){
                for(var i = 0 ; i < products.length ; i++){
                    var productObject = products[i];  
                    if(component.get('v.isMedicalAndOthersTab')){
                        if(productObject.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program")){                            
                            SalesStage = component.get('v.SalesStageOther');
                        }else{                            
                            SalesStage = component.get('v.SalesStage');
                        }
                    }else{
                        SalesStage = component.get('v.SalesStage');
                    }                                        
                    if(ResetSalesStage.indexOf(productObject.MA_Category) >= 0 &&  (SalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside") || SalesStage == 'Lead')){
                        var opportunityList = productObject.opportunityLineList;
                        var opportunitySpecialityList = productsObj.opportunitySpecialityLineList;
                        var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];
                        for(var j= 0 ; j < opportunityLineList.length; j++){
                            var eachProducts = opportunityLineList[j];
                            eachProducts.Existing_Members_Involved_in_the_Bid__c = 0;
                            eachProducts.Existing_Membership_at_Risk__c = 0;
                            eachProducts.Mbrs_Transferred_From_To_Another_Segment__c = 0;
                            eachProducts.Estimated_Additional_New_Members__c = 0;  
                        }   
                    }        
                    if(ResetSalesStage.indexOf('Medical') >= 0){
                        var opportunityRecord = component.get('v.opportunityRecord');
                        //opportunityRecord['Sold_New_Members__c'] = 0;
                        //opportunityRecord['Termed_Members__c'] = 0;
                        opportunityRecord['Net_Results__c'] = 0;
                        opportunityRecord['Members_QUOTED_in_the_Proposal_Medical__c'] = 0;
                        opportunityRecord['Estimated_Members_Existing_New__c'] = 0;
                        opportunityRecord['Existing_Members_Retained__c'] = 0;
                        opportunityRecord['Existing_Members_Retained_Pinnacle__c'] = 0;                
                        opportunityRecord['Sold_Retained_Members__c'] = 0;
                        opportunityRecord['Estimated_Additional_New_Members__c'] = 0;
                        opportunityRecord['Existing_Members_Involved_in_the_Bid__c'] =0;     
                        opportunityRecord['Existing_Membership_at_Risk__c'] = 0;
                        opportunityRecord['Members_Trans_From_or_To_Another_Segment__c'] = 0;
                        opportunityRecord['Overall_New_Membership_Impact__c'] = 0;
                        component.set('v.opportunityRecord',opportunityRecord);
                    }
                }
            }
            component.set('v.productsList',products);
            this.setTotalToCompetitors(component);
        }                       
    },  
		saveMAProductsAndCompetitorsInSF : function(component,event) {
        console.log('Save Competitors');
        //this.startProcessing(component); 
        var productObjList = component.get('v.productsList');
        var productList = [];
        for(var i=0; i<productObjList.length; i++) {
            console.log('productObjList[i].opportunitySpecialityLineList>>'+productObjList[i].opportunitySpecialityLineList);
            productList.push.apply(productList, productObjList[i].opportunityLineList);    
            productList.push.apply(productList, productObjList[i].opportunitySpecialityLineList)     
        }
        
        var totalOppLineRecords = [];
        var eachProductAuraId = component.find('eachProductAuraId');
        var totalOppLineItem = component.get('v.totalRecordId');

        if(eachProductAuraId != null){             
            if(eachProductAuraId.length != undefined && eachProductAuraId.length != null && eachProductAuraId.length > 0){
                for(var i = 0; i < eachProductAuraId.length; i++){
                    var productObj = eachProductAuraId[i];		
                    var totalObj  = productObj.get('v.totalRecordObj');
                    var productType  = productObj.get('v.productType');
                    var SalesStageValue  = productObj.get('v.SalesStage');                    
                    var lineList  = productObj.get('v.productObject.opportunityLineList');
                    var specialityList = productObj.get('v.productObject.opportunitySpecialityLineList');
                    var productObject = [...lineList, ...specialityList];
                                                        console.log('productList for save if>>'+productObject);
                    if(productType != $A.get("$Label.c.Other_Buy_Up_Program") && !(productObject != null && productObject.length != null && productObject.length > 0)){
                        if(totalOppLineItem != null && totalOppLineItem.Id != null){
                            totalOppLineItem.Estimated_Additional_New_Members__c = 0;
                            totalOppLineItem.Existing_Members_Involved_in_the_Bid__c = 0;
                            totalOppLineItem.Existing_Membership_at_Risk__c = 0;
                            totalOppLineItem.Members_Quoted_in_the_Proposal__c = 0;
                            totalOppLineItem.Net_Results__c = 0;
                            totalOppLineItem.Sold_Retained_Members__c = 0;
                            totalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = 0;
                            totalOppLineItem.Annual_Revenue_Premium__c = 0;
                            totalOppLineItem.Termed_Members__c = 0;
                            totalOppLineItem.Sold_New_Members__c = 0;                                                        
                            totalOppLineItem.Existing_Members_Retained_Pinnacle__c = 0;
                            totalOppLineItem.Existing_Members_Retained__c = 0;    
                            
                            totalOppLineRecords.push(totalOppLineItem);
                            continue;
                        }
                    }
                    
                    
                    if(productType != $A.get("$Label.c.Other_Buy_Up_Program") && productObject != null && productObject.length != null && productObject.length > 0){                                                                                                                                                                       
                        
                        if(!(totalOppLineItem != null && totalOppLineItem.Id != null)){
                            totalOppLineItem = {'sobjectType':'OpportunityLineItem','OpportunityId':component.get('v.MArecordId'),'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Product_Conversion__c':totalObj.Product_Conversion__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Mbrs_Transferred_From_To_Another_Segment__c':totalObj.Mbrs_Transferred_From_To_Another_Segment__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0};
                        }else{
                            totalOppLineItem.Estimated_Additional_New_Members__c = totalObj.Estimated_Additional_New_Members__c;
                            totalOppLineItem.Existing_Members_Involved_in_the_Bid__c = totalObj.Existing_Members_Involved_in_the_Bid__c;
                            totalOppLineItem.Existing_Membership_at_Risk__c = totalObj.Existing_Membership_at_Risk__c;
                            totalOppLineItem.Members_Quoted_in_the_Proposal__c = totalObj.Members_Quoted_in_the_Proposal__c;
                            totalOppLineItem.Net_Results__c = totalObj.Net_Results__c;
                            totalOppLineItem.Sold_Retained_Members__c = totalObj.Sold_Retained_Members__c;
                            totalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = totalObj.Mbrs_Transferred_From_To_Another_Segment__c;
                            totalOppLineItem.Annual_Revenue_Premium__c = totalObj.Annual_Revenue_Premium__c;
                            totalOppLineItem.Termed_Members__c = totalObj.Termed_Members__c;
                            totalOppLineItem.Sold_New_Members__c = totalObj.Sold_New_Members__c;  
                            totalOppLineItem.Product_Conversion__c = totalObj.Product_Conversion__c;  
                        }                                                                         
                        if(SalesStageValue == 'Notified'){
                            
                            var disposition = component.get('v.Disposition');
                            disposition = (disposition != undefined && disposition != null) ? disposition : '';
                            var soldRetained = totalObj.Sold_Retained_Members__c;
                            soldRetained = (soldRetained != undefined && soldRetained != null ) ? soldRetained : 0;                                
                            
                            if(disposition == 'Closed Emerging Risk') { 
                                totalOppLineItem['Existing_Members_Retained__c'] = soldRetained;
                            } else {
                                if(soldRetained >= totalObj.Existing_Members_Involved_in_the_Bid__c){
                                    totalOppLineItem['Existing_Members_Retained__c'] = totalObj.Existing_Members_Involved_in_the_Bid__c;
                                } else{
                                    totalOppLineItem['Existing_Members_Retained__c'] = soldRetained;
                                }
                            }
                            
                            if(soldRetained >= totalObj.Existing_Membership_at_Risk__c){
                                totalOppLineItem['Existing_Members_Retained_Pinnacle__c'] = totalObj.Existing_Membership_at_Risk__c;
                            }else{
                                totalOppLineItem['Existing_Members_Retained_Pinnacle__c'] = soldRetained;
                            }
                            
                            if(totalObj.Net_Results__c != null && totalObj.Net_Results__c != undefined){
                                if(totalOppLineItem['Net_Results__c'] >= 0){
                                    totalOppLineItem['Sold_New_Mbrs__c'] = totalObj.Net_Results__c;
                                    totalOppLineItem['Termed_Mbrs__c'] = 0;
                                }else{
                                    totalOppLineItem['Termed_Mbrs__c'] = totalObj.Net_Results__c;
                                    totalOppLineItem['Sold_New_Mbrs__c'] = 0;
                                }
                            }else{
                                totalOppLineItem['Sold_New_Mbrs__c'] = 0;
                                totalOppLineItem['Termed_Mbrs__c'] = 0;
                            } 
                        }else{
                            totalOppLineItem.Net_Results__c = 0;
                            totalOppLineItem.Sold_Retained_Members__c = 0;                                                        ;
                            totalOppLineItem.Termed_Members__c = 0;
                            totalOppLineItem.Sold_New_Members__c = 0;                                                        
                            totalOppLineItem.Existing_Members_Retained_Pinnacle__c = 0;
                            totalOppLineItem.Existing_Members_Retained__c = 0; 
                            //totalOppLineItem.Product_Conversion__c = 0;  
                        }                                                  
                        totalOppLineRecords.push(totalOppLineItem);
                    } 
                }                
            }
            else{   
                var productObj = eachProductAuraId;		
                var totalObj  = productObj.get('v.totalRecordObj');
                var productType  = productObj.get('v.productType');
                var SalesStageValue  = productObj.get('v.SalesStage');                    
                var lineList  = productObj.get('v.productObject.opportunityLineList');
                var specialityList = productObj.get('v.productObject.opportunitySpecialityLineList');
                var productObject = [...lineList, ...specialityList];
                                    console.log('productList for save else>>'+productObject);
                if(productType != $A.get("$Label.c.Other_Buy_Up_Program") && !(productObject != null && productObject.length != null && productObject.length > 0)){
                    if(totalOppLineItem != null && totalOppLineItem.Id != null){
                        totalOppLineItem.Estimated_Additional_New_Members__c = 0;
                        totalOppLineItem.Existing_Members_Involved_in_the_Bid__c = 0;
                        totalOppLineItem.Existing_Membership_at_Risk__c = 0;
                        totalOppLineItem.Members_Quoted_in_the_Proposal__c = 0;
                        totalOppLineItem.Net_Results__c = 0;
                        totalOppLineItem.Sold_Retained_Members__c = 0;
                        totalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = 0;
                        totalOppLineItem.Annual_Revenue_Premium__c = 0;
                        totalOppLineItem.Termed_Members__c = 0;
                        totalOppLineItem.Sold_New_Members__c = 0;                                                        
                        totalOppLineItem.Existing_Members_Retained_Pinnacle__c = 0;
                        totalOppLineItem.Existing_Members_Retained__c = 0;  
                        totalOppLineItem.Product_Conversion__c = totalObj.Product_Conversion__c;
                        totalOppLineRecords.push(totalOppLineItem);                 
                    }
                }
                                
                if(productType != $A.get("$Label.c.Other_Buy_Up_Program")  && productObject != null && productObject.length != null && productObject.length > 0){
                    
                    if(!(totalOppLineItem != null && totalOppLineItem.Id != null)){
                        totalOppLineItem = {'sobjectType':'OpportunityLineItem','OpportunityId':component.get('v.MArecordId'),'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Product_Conversion__c':totalObj.Product_Conversion__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Mbrs_Transferred_From_To_Another_Segment__c':totalObj.Mbrs_Transferred_From_To_Another_Segment__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0};
                    }else{
                        totalOppLineItem.Estimated_Additional_New_Members__c = totalObj.Estimated_Additional_New_Members__c;
                        totalOppLineItem.Existing_Members_Involved_in_the_Bid__c = totalObj.Existing_Members_Involved_in_the_Bid__c;
                        totalOppLineItem.Existing_Membership_at_Risk__c = totalObj.Existing_Membership_at_Risk__c;
                        totalOppLineItem.Members_Quoted_in_the_Proposal__c = totalObj.Members_Quoted_in_the_Proposal__c;
                        totalOppLineItem.Net_Results__c = totalObj.Net_Results__c;
                        totalOppLineItem.Sold_Retained_Members__c = totalObj.Sold_Retained_Members__c;
                        totalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = totalObj.Mbrs_Transferred_From_To_Another_Segment__c;
                        totalOppLineItem.Annual_Revenue_Premium__c = totalObj.Annual_Revenue_Premium__c;
                        totalOppLineItem.Termed_Members__c = totalObj.Termed_Members__c;
                        totalOppLineItem.Sold_New_Members__c = totalObj.Sold_New_Members__c;
                        totalOppLineItem.Product_Conversion__c = totalObj.Product_Conversion__c;                          
                    } 
                    
                    if(SalesStageValue == 'Notified'){
                        
                        var disposition = component.get('v.Disposition');
                        disposition = (disposition != undefined && disposition != null) ? disposition : '';
                        var soldRetained = totalObj.Sold_Retained_Members__c;
                        soldRetained = (soldRetained != undefined && soldRetained != null ) ? soldRetained : 0;                                
                        
                        if(disposition == 'Closed Emerging Risk') { 
                            totalOppLineItem['Existing_Members_Retained__c'] = soldRetained;
                        } else {
                            if(soldRetained >= totalObj.Existing_Members_Involved_in_the_Bid__c) {
                                totalOppLineItem['Existing_Members_Retained__c'] = totalObj.Existing_Members_Involved_in_the_Bid__c;
                            } else {
                                totalOppLineItem['Existing_Members_Retained__c'] = soldRetained;
                            }
                        }
                        
                        if(soldRetained >= totalObj.Existing_Membership_at_Risk__c){
                            totalOppLineItem['Existing_Members_Retained_Pinnacle__c'] = totalObj.Existing_Membership_at_Risk__c;
                        } else {
                            totalOppLineItem['Existing_Members_Retained_Pinnacle__c'] = soldRetained;
                        }
                        
                        if(totalObj.Net_Results__c != null && totalObj.Net_Results__c != undefined){
                            if(totalOppLineItem['Net_Results__c'] >= 0){
                                totalOppLineItem['Sold_New_Mbrs__c'] = totalObj.Net_Results__c;
                                totalOppLineItem['Termed_Mbrs__c'] = 0;
                            }else{
                                totalOppLineItem['Termed_Mbrs__c'] = totalObj.Net_Results__c;
                                totalOppLineItem['Sold_New_Mbrs__c'] = 0;
                            }
                        }else{
                            totalOppLineItem['Sold_New_Mbrs__c'] = 0;
                            totalOppLineItem['Termed_Mbrs__c'] = 0;
                        } 
                    }else{
                        totalOppLineItem.Net_Results__c = 0;
                        totalOppLineItem.Sold_Retained_Members__c = 0;                                                        ;
                        totalOppLineItem.Termed_Members__c = 0;
                        totalOppLineItem.Sold_New_Members__c = 0;                                                        
                        totalOppLineItem.Existing_Members_Retained_Pinnacle__c = 0;
                        totalOppLineItem.Existing_Members_Retained__c = 0;   
                        //totalOppLineItem.Product_Conversion__c = 0;  
                    }  
                    totalOppLineRecords.push(totalOppLineItem);
                }
            }               
        }
        productList.push.apply(productList, totalOppLineRecords);
        
        var listOfMACompetitorsArray = [];
        var competitorsListObject = component.get('v.CompetitorsListObject');
        var isTotalAccIdNotFoundVal = false;
        for(var i in competitorsListObject) {
            var competitorsDetailsListObj = competitorsListObject[i].competitorsDetailsList;
            for(var j in competitorsDetailsListObj) {
                listOfMACompetitorsArray.push(competitorsDetailsListObj[j]);
            }
            var totalCompetitorObj = competitorsListObject[i].totalCompetitorRecordObj;
            if(totalCompetitorObj != undefined && totalCompetitorObj != null) {
                var totalCompetitorRowId = totalCompetitorObj.Id;
                if(totalCompetitorRowId != undefined && totalCompetitorRowId != null) {
                    listOfMACompetitorsArray.push(totalCompetitorObj);
                } else {
                    isTotalAccIdNotFoundVal = true;
                    totalCompetitorObj['sobjectType'] = 'MA_Competitor__c';
                    totalCompetitorObj['Opportunity__c'] = component.get('v.MArecordId');
                    totalCompetitorObj['Competitor_Classification__c'] = competitorsListObject[i].productTypesInvolvedInMA;
                    listOfMACompetitorsArray.push(totalCompetitorObj);
                }
            }
        }
                    console.log('productList for save>>'+productList);
        var action = component.get('c.saveProductsAndCompetitorsDetails');	    
        action.setParams({           
            "opportunityId" : component.get('v.MArecordId'),
            'accountId' : component.get('v.accountId'),
            "opportunityCategory" : component.get('v.maType'),
            "selectedProductTypes" : component.get('v.productTypesValues'),
            "prevSalesStage" : component.get('v.previousSalesStage'),
            "currentSalesStage" : component.get('v.SalesStage'),
            "opportunityObj" : component.get('v.opportunityRecord'),
            'productsListToBeUpserted': productList,
            'competitorsListToBeUpserted': listOfMACompetitorsArray,
            "isReadOnly" : component.get('v.isReadOnly'),
            "isTotalAccIdNotFound" : isTotalAccIdNotFoundVal
        }); 
        
        action.setCallback(this, function(response) {
            
            //console.log('Resoponse ');         
            component.set('v.isEditRecord',false);  
            var state = response.getState();       
            if (state === "SUCCESS") {                
                var responseResult = response.getReturnValue();                       
                //console.log('Resoponse '+responseResult);                                       
                this.saveEvent(component);                                     
            }
            else if (state === "INCOMPLETE") { 
                this.stopProcessing(component); 
            }
                else if (state === "ERROR") {                    
                    this.stopProcessing(component); 
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            //alert("Error message: " + errors[0].message);
                            this.showAlert(component,errors[0].message,component.get('v.exceptionType'));
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
	},
    removeCompetitorRecord : function(component) {
        
        var event = component.get('v.deleteEvent');
        
        var competitorDataToBeRemoved = event.getParam("competitorDataToBeRemoved");
        var competitorRecordIndexVal = event.getParam("competitorRecordIndex");
        var productTypeInvolvedInMA = event.getParam("competitorClassificationName");
        
        var competitorsListObj = component.get('v.CompetitorsListObject');
        for(var i in competitorsListObj) {
            if(competitorsListObj[i].productTypesInvolvedInMA != null && productTypeInvolvedInMA != null &&
              		productTypeInvolvedInMA == competitorsListObj[i].productTypesInvolvedInMA) {
					
                var competitorsListData = competitorsListObj[i].competitorsDetailsList;
                for(var j in competitorsListData) {
                    if(j == competitorRecordIndexVal) {
                        competitorsListData.splice(competitorRecordIndexVal, 1);  
                        break;
                    }
                }
                competitorsListObj[i].competitorsDetailsList = competitorsListData;
                break;
            }
        }
        component.set('v.CompetitorsListObject', competitorsListObj);
        
        var childCmp = component.find("eachCompetitorAuraId");
        if(childCmp != null && childCmp != undefined) {
            if(Array.isArray(childCmp)) {
                for(var i=0;i<childCmp.length;i++) {
                    childCmp[i].reCalculateTotalRecords();
                } 
            } else {
                childCmp.reCalculateTotalRecords();
            }
        }
        
        if(competitorDataToBeRemoved != null && competitorDataToBeRemoved.Id != null) {
            
        	var action = component.get('c.deleteCompetitorRecord');	    
            action.setParams({
                "competitorDataToBeRemoved":competitorDataToBeRemoved,
                "isEdit":component.get('v.isEditRecord'),
                "opportunityId" : component.get('v.MArecordId'),
                "accountId" : component.get('v.accountId'),
                "opportunityCategory" : component.get('v.maType'),
                "selectedProductTypes" : component.get('v.productTypesValues'),
                "prevSalesStage" : component.get('v.previousSalesStage'),
                "currentSalesStage" : component.get('v.SalesStage'),
                "opportunityObj" : component.get('v.opportunityRecord'),
                "isReadOnly" : component.get('v.isReadOnly')
            });
            action.setCallback(this, function(response) {
                var state = response.getState();       
                if (state === "SUCCESS") {                                    
                    if(!component.get('v.isEditRecord')){
                        this.clickSaveButton(component);	
                    }
                    var responseResult = response.getReturnValue();
                    if(responseResult != null) {
                        
                        var responseObjForOppPdts = responseResult.productsAppletWrapperClassObj;
                        if(responseObjForOppPdts != null) {
                            component.set('v.isMedicalAndOthersTab',responseObjForOppPdts.isMedicalAndOthersTab);                                            
                            component.set('v.account',responseObjForOppPdts.account);
                            component.set('v.fundingTypePicklistVals',responseObjForOppPdts.fundingTypePicklistVals);
                            component.set('v.dispositionPicklistVals',responseObjForOppPdts.dispositionPicklistVals);                     
                            component.set('v.productsList',responseObjForOppPdts.productsDetailsList);    
                        }
                        var responseObjForCompetitors = responseResult.competitorsWrapperClassObj;
                        if(responseObjForCompetitors != null) {
                            component.set('v.isMedicalAndOthersTab',responseObjForCompetitors.isMedicalAndOthersTab);
                        	component.set('v.CompetitorsListObject',responseObjForCompetitors.competitorsList);
                        }
                    }              
                }
                else if (state === "INCOMPLETE") {   
                    
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            this.showAlert(component,errors[0].message,component.get('v.exceptionType'));
                            //alert("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                } 
            });
			$A.enqueueAction(action);
        }
    },
    addOppProductsRecords : function(component,event){
        
        if(!component.get('v.isEditRecord')){
            component.set('v.isEditRecord',true);
        }
        if(!component.get('v.isExapand')){
            component.set('v.isExapand',true);
        }
        
        var addProductsList = event.getParam('Products');
        var addProductsMap = {};
        
        var productTypesValues = component.get('v.productTypesValues');
        var isFoundStepWiseProduct = false;
        var opportunityRecord = component.get('v.opportunityRecord');
        
        var medPrdField = opportunityRecord['Medical_Products_Involved__c'];
        var medPrdList = [];
        if(medPrdField != null){
        	medPrdList = medPrdField.split(';');    
        }
        
        for(var i = 0 ; i < addProductsList.length; i++){
            if(addProductsMap[addProductsList[i].Product2.Product_Line__c] != null){
                var productsEachStageList = addProductsMap[addProductsList[i].Product2.Product_Line__c];
                
                var productSobj = {'sobjectType':'Product2','Surest_Applicable_Products__c':addProductsList[i].Product2.Surest_Applicable_Products__c,'Name':addProductsList[i].Product2.Name,'Id':addProductsList[i].Product2.Id,'Funding_Type__c':addProductsList[i].Product2.Funding_Type__c,'Considered_For_StepWise_Integration__c':addProductsList[i].Product2.Considered_For_StepWise_Integration__c,'Distribution_Type_Flag__c':addProductsList[i].Product2.Distribution_Type_Flag__c,'Product_Line__c':addProductsList[i].Product2.Product_Line__c, 'Do_Not_Include_in_Total__c':addProductsList[i].Product2.Do_Not_Include_in_Total__c, 'Family': addProductsList[i].Product2.Family, 'Reporting_Product_Type__c': addProductsList[i].Product2.Reporting_Product_Type__c};
                var fundingType = 'ASO';
                if(productSobj.Funding_Type__c != null && productSobj.Funding_Type__c.length > 0){
               		 fundingType = productSobj.Funding_Type__c;  
                }
                if(addProductsList[i].Product2.Product_Line__c == 'Other' && addProductsList[i].Product2.Considered_For_StepWise_Integration__c == 'Yes'){
                    isFoundStepWiseProduct = true;
                }
                var eachProduct = {'sobjectType':'OpportunityLineItem','ReadonlySurest__c':addProductsList[i].isReadonly,'Buyup_Product_Selection__c':addProductsList[i].Buyup_Product_Selection__c,'Product2':productSobj,'ProductName':addProductsList[i].Product2.Name,'PricebookEntryId':addProductsList[i].Id,'Product2Id':addProductsList[i].Product2.Id,'OpportunityId':component.get('v.MArecordId'),'Estimated_Additional_New_Members__c':0,'Disposition_Other_Buy_Up_Programs__c':'','Existing_Members_Involved_in_the_Bid__c':0,'Product_Conversion__c':0,'Existing_Membership_at_Risk__c':0,'Funding_Type__c':fundingType,'Members_Quoted_in_the_Proposal__c':0,'Net_Results__c':0,'Sold_Retained_Members__c':null,'Mbrs_Transferred_From_To_Another_Segment__c':0,'Copy_the_Membership_from_Medical__c':false,'Quantity':1,'Annual_Revenue_Premium__c':0,'TotalPrice':200,"Termed_Members__c":0,"Sold_New_Members__c":0,"Eligible_for_Sales_Incentives__c":addProductsList[i].Product2.Eligible_for_Sales_Incentives__c,"Underwriting_Validation__c":addProductsList[i].Product2.Underwriting_Validation__c};
                productsEachStageList.push(eachProduct);
                addProductsMap[addProductsList[i].Product2.Product_Line__c] = productsEachStageList;
            }else{
                var productsEachStageList = [];        
                var productSobj = {'sobjectType':'Product2','Surest_Applicable_Products__c':addProductsList[i].Product2.Surest_Applicable_Products__c,'Name':addProductsList[i].Product2.Name,'Id':addProductsList[i].Product2.Id,'Funding_Type__c':addProductsList[i].Product2.Funding_Type__c,'Considered_For_StepWise_Integration__c':addProductsList[i].Product2.Considered_For_StepWise_Integration__c,'Distribution_Type_Flag__c':addProductsList[i].Product2.Distribution_Type_Flag__c,'Product_Line__c':addProductsList[i].Product2.Product_Line__c,'Do_Not_Include_in_Total__c':addProductsList[i].Product2.Do_Not_Include_in_Total__c, 'Family': addProductsList[i].Product2.Family, 'Reporting_Product_Type__c': addProductsList[i].Product2.Reporting_Product_Type__c};
                var fundingType = 'ASO'; 
                if(productSobj.Funding_Type__c != null && productSobj.Funding_Type__c.length > 0){
               		 fundingType = productSobj.Funding_Type__c;  
                }
                if(addProductsList[i].Product2.Product_Line__c == 'Other' && addProductsList[i].Product2.Considered_For_StepWise_Integration__c == 'Yes'){
                    isFoundStepWiseProduct = true;
                }
                
                var eachProduct = {'sobjectType':'OpportunityLineItem','ReadonlySurest__c':addProductsList[i].isReadonly,'Buyup_Product_Selection__c':addProductsList[i].Buyup_Product_Selection__c,'Product2':productSobj,'ProductName':addProductsList[i].Product2.Name,'PricebookEntryId':addProductsList[i].Id,'Product2Id':addProductsList[i].Product2.Id,'OpportunityId':component.get('v.MArecordId'),'Estimated_Additional_New_Members__c':0,'Disposition_Other_Buy_Up_Programs__c':'','Existing_Members_Involved_in_the_Bid__c':0,'Product_Conversion__c':0,'Existing_Membership_at_Risk__c':0,'Funding_Type__c':fundingType,'Members_Quoted_in_the_Proposal__c':0,'Net_Results__c':0,'Sold_Retained_Members__c':null,'Mbrs_Transferred_From_To_Another_Segment__c':0,'Copy_the_Membership_from_Medical__c':false,'Quantity':1,'Annual_Revenue_Premium__c':0,'TotalPrice':200,"Termed_Members__c":0,"Sold_New_Members__c":0,"Eligible_for_Sales_Incentives__c":addProductsList[i].Product2.Eligible_for_Sales_Incentives__c,"Underwriting_Validation__c":addProductsList[i].Product2.Underwriting_Validation__c};
                productsEachStageList.push(eachProduct);
                addProductsMap[addProductsList[i].Product2.Product_Line__c] = productsEachStageList;
            }
                                              
            /* --- Case 2235 adding all Medical products related to opportunity in the "Medical Products Involved" field  ---- */
            var isMedicalProduct = addProductsList[i].Product2.Product_Line__c;            
            if(isMedicalProduct != null && isMedicalProduct == 'Medical'){            	
                var productName = addProductsList[i].Product2.Name;
                medPrdList.push(productName);
            }            
        }
        opportunityRecord['Medical_Products_Involved__c'] = medPrdList.join(';');
        component.set('v.opportunityRecord',opportunityRecord);
        /* --- END Case 2235 --- */
        var isExistingMemRiskValChanged = false;
        var isCopyMemCheckBoxVal = false;
        var products = component.get('v.productsList');       
        if(products != null){
            if(products.length != null && products.length > 0 && products.length != 'undefined') {
                for(var i = 0 ; i < products.length ; i++){
                    var productObject = products[i];                                             
                    if(addProductsMap[productObject.MA_Category] != null) {
                        var addProducts = addProductsMap[productObject.MA_Category];
                        for(var j = 0; j < addProducts.length ; j++){
                            var eachNewProduct = addProducts[j];
                            var maType = component.get('v.maType');  
                            var Disposition = component.get('v.Disposition');
                            var SalesStage = component.get('v.SalesStage'); 
                            if(SalesStage == 'Notified' && productObject.MA_Category != 'Other'){
                                if(maType == $A.get("$Label.c.MA_CM_TYPE")){
                                    if(Disposition != null && !(Disposition == 'Sold' || Disposition == 'Closed Emerging Risk')){
                                        eachNewProduct.Sold_Retained_Members__c = 0;                                        
                                    }
                                }else{
                                    if(Disposition != null && Disposition != 'Sold'){
                                        eachNewProduct.Sold_Retained_Members__c = 0;                                        
                                    }
                                }
                            }
                            
                            /*
         					 * Case 1563 - Products-CM Prepopulate Membership Based on "Current UHC Members" - START
         				     */ 
                           
                            if(component.get("v.isMedicalAndOthersTab") && productObject.MA_Category == 'Other') {
                                SalesStage = component.get('v.SalesStageOther'); 
                            }
                            var opportunityObj = component.get('v.opportunityRecord');
                            var estimatedMemImpact = opportunityObj.Estimated_Membership_Impact__c;
                            estimatedMemImpact = (estimatedMemImpact != undefined && estimatedMemImpact != null) ? estimatedMemImpact : '';
                             if(maType == $A.get("$Label.c.MA_CM_TYPE") && (SalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside") || SalesStage == $A.get("$Label.c.Lead")) && 
                               estimatedMemImpact == 'Full') {
                                
                                if(component.get("v.isMedicalAndOthersTab") && productObject.MA_Category == 'Other') {
                                    isCopyMemCheckBoxVal = true;
                                    eachNewProduct.Copy_the_Membership_from_Medical__c = true;
                                } else if(productObject.MA_Category != 'Other') {
                                    var accObj = component.get('v.account');
                                    var competitorClassificationNamesJSONMap = {"Medical":"UHC_Medical_Members__c",
                                                                                "Pharmacy":"Optum_Rx_Members__c",
                                                                                "Dental":"UHC_Dental_Members__c",
                                                                                "Vision":"UHC_Vision_Members__c"};
                                    var uhcMembers = accObj[competitorClassificationNamesJSONMap[productObject.MA_Category]];
                                    uhcMembers = (uhcMembers != undefined && uhcMembers != null) ? uhcMembers : 0;
                                    eachNewProduct.Existing_Membership_at_Risk__c = uhcMembers;
                                    if(SalesStage == $A.get("$Label.c.Lead")) {
                                        eachNewProduct.Existing_Members_Involved_in_the_Bid__c = uhcMembers;
                                    }
                                    if(uhcMembers > 0) {
                                        isExistingMemRiskValChanged = true;
                                    }
                                }                                
                            }
                            
                            /*
         					 * Case 1563 - Products-CM Prepopulate Membership Based on "Current UHC Members" - END
         				     */
                        }
                        var combinedProducts = [];
                        combinedProducts.push.apply(combinedProducts, addProducts);
                        combinedProducts.push.apply(combinedProducts, productObject.opportunityLineList);
                        combinedProducts.push.apply(combinedProducts, productObject.opportunitySpecialityLineList);

                        productObject.opportunityLineList = [];
                        productObject.opportunitySpecialityLineList = [];
                        productObject.isSpecialityProduct = false;

                        for (var j = 0; j < combinedProducts.length; j++) {
                            var prod = combinedProducts[j];

                            if (productObject.MA_Category == 'Other' && prod.Product2 && prod.Product2.Family === 'Specialty Products') {
                                productObject.opportunitySpecialityLineList.push(prod);
                                productObject.isSpecialityProduct = true;
                            } else {
                                productObject.opportunityLineList.push(prod);
                            }
                        }

                        //addProducts.push.apply(addProducts, productObject.opportunityLineList);
                        //addProducts.push.apply(addProducts, productObject.opportunitySpecialityLineList);
                        //productObject.opportunityLineList = addProducts;
                        // for (var j = 0; j < addProducts.length; j++) {
                        //     var prod = addProducts[j];
                    
                        //     if (prod.Product2.Family === 'Specialty Products') {
                        //         productObject.opportunitySpecialityLineList.push(prod);
                        //         productObject.isSpecialityProduct = true;
                        //     } else {
                        //         productObject.opportunityLineList.push(prod);
                        //     }
                        // }
                    //    products[i] = Object.assign({}, productObject);
                     }                                                    
                }
            }   
            component.set('v.productsList',products);                        
            
            if(isExistingMemRiskValChanged) {
                this.setTotalRecords(component);
                this.setTotalToCompetitors(component);
            }
            if(isCopyMemCheckBoxVal) {
				this.setMedicalTotalRecToOthers(component);               
            }
            if(productTypesValues.indexOf('Other') !== -1 || component.get('v.isMedicalAndOthersTab')){     
                var opportunityRecord = component.get('v.opportunityRecord');            
                opportunityRecord['CI_AP_HII__c'] = isFoundStepWiseProduct;
                component.set('v.opportunityRecord',opportunityRecord);
                this.triggerStepWiseProductEvent(component,true);                
            }          
        }
        this.modalGenericClose(component);      
        this.clickEditButton(component);
    },
    addNewCompetitorRecords : function(component,event){
        
        if(!component.get('v.isEditRecord')){
            component.set('v.isEditRecord',true);
        }
        
        var competitorsList = event.getParam('CompetitorsList');
        var competitorsListMap = {};
        
        for(var i = 0 ; i < competitorsList.length; i++) {
            if(competitorsList[i].prodCat != null && competitorsList[i].prodCat == 'Other Buy Up') {
                competitorsList[i].prodCat = 'Other';
            }
            var competitorGroup = '';
            if(competitorsList[i].CompetitorGroup__c != undefined && competitorsList[i].CompetitorGroup__c != null) {
                competitorGroup = competitorsList[i].CompetitorGroup__c;
            }
            if(competitorsListMap[competitorsList[i].prodCat] != null){
                var newCompetitorList = competitorsListMap[competitorsList[i].prodCat];
                var newCompetitor = {'sobjectType':'MA_Competitor__c','Competitor_Account__c':competitorsList[i].Id,'Competitor_Account__r':competitorsList[i],'Opportunity__c':component.get('v.MArecordId'),'Number_of_Members_Held__c':0,'Number_of_Members_Awarded__c':0,'Competitor_Classification__c':competitorsList[i].prodCat,'Competitor_Group__c':competitorGroup};
                newCompetitorList.push(newCompetitor);
                competitorsListMap[competitorsList[i].prodCat] = newCompetitorList;
            } else {
                var productsEachStageList = [];                
                var eachProduct = {'sobjectType':'MA_Competitor__c','Competitor_Account__c':competitorsList[i].Id,'Competitor_Account__r':competitorsList[i],'Opportunity__c':component.get('v.MArecordId'),'Number_of_Members_Held__c':0,'Number_of_Members_Awarded__c':0,'Competitor_Classification__c':competitorsList[i].prodCat,'Competitor_Group__c':competitorGroup};
                productsEachStageList.push(eachProduct);
                competitorsListMap[competitorsList[i].prodCat] = productsEachStageList;
            }
        }
        
        var competitorsListObj = component.get('v.CompetitorsListObject');
        if(competitorsListObj != null){
            if(competitorsListObj != null && competitorsListObj != undefined) {
                for(var i = 0 ; i < competitorsListObj.length ; i++) {
                    if(competitorsListMap[competitorsListObj[i].productTypesInvolvedInMA] != null &&
                      competitorsListMap[competitorsListObj[i].productTypesInvolvedInMA].length > 0) {
                        var updatedCompetitorsList =  competitorsListObj[i].competitorsDetailsList;
                        updatedCompetitorsList.push.apply(updatedCompetitorsList, competitorsListMap[competitorsListObj[i].productTypesInvolvedInMA]);                                
                        competitorsListObj[i].competitorsDetailsList = updatedCompetitorsList;
                    }
                }
            } 
            component.set('v.CompetitorsListObject',competitorsListObj);
        }
        this.modalGenericClose(component); 
        this.clickEditButton(component);
    },
    removeOpportunityLineItemsInApex : function(component,opportunityLineItemsObj,medProductsInvolvedInMA) {
        
        //this.startProcessing(component); 
        
        var action = component.get('c.deleteOpportunityLineItem');	
        action.setParams({
            "opportunityLineItemsObj" : opportunityLineItemsObj,
            "MArecordId" : component.get('v.MArecordId'),
            "productTypesValues" : component.get('v.productTypesValues'),
            "medicalProductsInvolved" : medProductsInvolvedInMA
        });
        
        action.setCallback(this, function(response) {

            this.stopProcessing(component); 
            var state = response.getState();       
            if (state === "SUCCESS") {               
                if(!component.get('v.isEditRecord')){
                    this.clickSaveButton(component);	
                }                                
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            this.showAlert(component,errors[0].message,component.get('v.exceptionType'));
                           // alert("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
	},
    validationProducts : function(component,products) { 
        
        var alertType = 'Alert';
        
        console.log('validationProducts');
        var maType = component.get('v.maType');        
        
        var productsObj = products.get('v.productObject');
        var disposition = component.get('v.Disposition');
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        
        var hasRegularProducts = productsObj.opportunityLineList && productsObj.opportunityLineList.length > 0;

        var hasSpecialityProducts = productsObj.opportunitySpecialityLineList && productsObj.opportunitySpecialityLineList.length > 0;

        if (!hasRegularProducts && !hasSpecialityProducts) {
            return true;
        }                                                                         
        
        var salesStage = '';
        if(isMedicalAndOthersTab && productsObj.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program")) {
            salesStage = component.get('v.SalesStageOther');
        } else {
            salesStage = component.get('v.SalesStage');
        }

        if(productsObj.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program") && (salesStage == '' || salesStage != 'Notified') && productsObj.isSpecialityProduct){
            var opportunityList = productsObj.opportunityLineList;
            var opportunitySpecialityList = productsObj.opportunitySpecialityLineList;
            var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];
            for(var j= 0 ; j < opportunityLineList.length; j++){
                var eachProducts = opportunityLineList[j];    
                    disposition =  eachProducts.Disposition_Other_Buy_Up_Programs__c;                            
                    if(disposition == 'Sold' || disposition == 'Closed Emerging Risk'){
                        if((eachProducts.Sold_Retained_Members__c == undefined || eachProducts.Sold_Retained_Members__c == null && eachProducts.Sold_Retained_Members__c == '')){                                
                            var alertMessage ='A Disposition should be entered for each Product in the Products section. If the Disposition is Sold or Closed Emerging Risk, then Sold/Retained Members should also be entered for that Product.'; 
                            if(isMedicalAndOthersTab){
                                alertMessage = 'A Disposition should be entered for each Other Buy Up Program. If the Disposition is Sold or Closed Emerging Risk, then Sold/Retained Members should also be entered for that Other Buy Up Program. Click OK and go to the Products section to update.'; 
                            }
                            this.showAlert(component,alertMessage,alertType);
                            return false;                                                                        
                        }    
                    } 
                }
        }
       
        /*
         * Case 2201 (MA Products - Changes to the Pharmacy Tab) -
         *  -> Pharmacy Buy Up Products not to be included in the Total Opportunity Line Item Record
         *  -> Edit checks not to be triggered only if the Pharmacy Buy Up Products are added.
         */
        var isCorePharmacyProductsAvailable = false;
        if(productsObj.MA_Category == 'Pharmacy') {
            var opportunityLineList = productsObj.opportunityLineList;
            for(var j=0 ; j < opportunityLineList.length; j++) {
                var eachProductDataObj = opportunityLineList[j];                
                if(eachProductDataObj != undefined && eachProductDataObj != null) {
                   var oppLineItemDoNotIncTotalVal = eachProductDataObj.Product2.Do_Not_Include_in_Total__c;
                    if(oppLineItemDoNotIncTotalVal != undefined && oppLineItemDoNotIncTotalVal != null && oppLineItemDoNotIncTotalVal == false) {
                        isCorePharmacyProductsAvailable = true;
                        break;
                    }
                }
            }
        } else {
            isCorePharmacyProductsAvailable = true;
        }
        
        if(isCorePharmacyProductsAvailable == true && ((productsObj.MA_Category != $A.get("$Label.c.Other_Buy_Up_Program") || salesStage == 'Notified') || ((productsObj.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program") &&( salesStage == 'Spin-Off' ||salesStage == 'Pending Spin-Off'||salesStage == 'Transfer In/Out' || salesStage == 'Pending Transfer In'))))) {
            var totalRecordObj = products.get('v.totalRecordObj');                        
            if(maType == $A.get("$Label.c.MA_CM_TYPE")){
                if(salesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                    if(totalRecordObj.Existing_Membership_at_Risk__c <= 0){     
                        var alertMessage = 'An estimate for Existing Membership at Risk should be entered for at least one product.'; 
                        if(isMedicalAndOthersTab){
                            alertMessage = 'An estimate for Existing Membership at Risk should be entered for at least one Medical product. Estimates for Existing Membership at Risk for the Other Buy Up Programs should be entered as appropriate.'; 
                        }
                        this.showAlert(component,alertMessage,alertType);
                        return false;
                    }
                }else if(salesStage == 'Lead' || salesStage == 'Proposal' || salesStage == 'In Review' || salesStage == 'Finalist') {
                    if(totalRecordObj.Estimated_Additional_New_Members__c+totalRecordObj.Existing_Members_Involved_in_the_Bid__c <= 0){                        
                        var alertMessage = 'The number of Existing Members Involved in the Bid or the number of Estimated Additional New Members should be entered for at least one product.'; 
                        if(isMedicalAndOthersTab){
                            alertMessage = 'The number of Existing Members Involved in the Bid or the number of Estimated Additional New Members should be entered for at least one Medical product. Membership information for the Other Buy Up Programs should be entered as appropriate.'; 
                        }
                        this.showAlert(component,alertMessage,alertType);
                        return false;
                    }
                    if(component.get('v.RiskProbability') != null && component.get('v.RiskProbability').length > 0){                        
                        if(totalRecordObj.Existing_Membership_at_Risk__c <= 0){
                            var alertMessage = 'An estimate for Existing Membership at Risk should be entered for at least one product.'; 
                            if(isMedicalAndOthersTab){
                                alertMessage = 'An estimate for Existing Membership at Risk should be entered for at least one Medical product. Estimates for Existing Membership at Risk for the Other Buy Up Programs should be entered as appropriate.'; 
                            }
                            this.showAlert(component,alertMessage,alertType);
                            return false;
                        }                        
                    }
                }else if(salesStage == 'Pending Transfer In' || salesStage == 'Pending Transfer Out' || salesStage == 'Pending Spin-Off'){
                    var opportunityList = productsObj.opportunityLineList;
                    var opportunitySpecialityList = productsObj.opportunitySpecialityLineList;
                    var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];
                    for(var j= 0 ; j < opportunityLineList.length; j++){
                        var eachProducts = opportunityLineList[j];                            
                        if(eachProducts.Mbrs_Transferred_From_To_Another_Segment__c == undefined || eachProducts.Mbrs_Transferred_From_To_Another_Segment__c == null || eachProducts.Mbrs_Transferred_From_To_Another_Segment__c == '' || eachProducts.Mbrs_Transferred_From_To_Another_Segment__c == 0){                                
                           
                            var alertMessage ='Within the Products section, Members Transferred From or To Another Segment for each individual product should be greater than 0.'; 
                            if(salesStage == 'Pending Spin-Off'){
                                alertMessage ='Within the Products section, Members Transferred Or Spin-Off for each individual product should be greater than 0.'; 
                            }
                            if(isMedicalAndOthersTab){
                                alertMessage ='Within the Products section, Members Transferred From or To Another Segment for each individual Medical product should be greater than 0.'; 
                                if(salesStage == 'Pending Spin-Off'){
                                    alertMessage ='Within the Products section, Members Transferred Or Spin-Off for each individual Medical product should be greater than 0.'; 
                                }
                            }
                            
                            this.showAlert(component,alertMessage,alertType);
                            return false;                            
                        }                            
                    }                    
                }else if(salesStage == 'Notified' || salesStage=='Transfer In/Out' || salesStage=='Spin-Off'){
                    if(salesStage == 'Notified')
                        if(totalRecordObj.Existing_Membership_at_Risk__c <= 0 && productsObj.MA_Category != $A.get("$Label.c.Other_Buy_Up_Program") && component.get('v.RiskProbability') != null && component.get('v.RiskProbability').length > 0){
                            var alertMessage = 'An estimate for Existing Membership at Risk should be entered for at least one product.'; 
                            if(isMedicalAndOthersTab){
                                alertMessage = 'An estimate for Existing Membership at Risk should be entered for at least one Medical product. Estimates for Existing Membership at Risk for the Other Buy Up Programs should be entered as appropriate.'; 
                            }
                            this.showAlert(component,alertMessage,alertType);
                            return false;
                        }

                    var opportunityList = productsObj.opportunityLineList;
                    var opportunitySpecialityList = productsObj.opportunitySpecialityLineList;
                    var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];
                    for(var j= 0 ; j < opportunityLineList.length; j++){
                        var eachProducts = opportunityLineList[j]; 
                        if(productsObj.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program")){
                            disposition =  eachProducts.Disposition_Other_Buy_Up_Programs__c;                            
                            if(!(disposition != null && disposition != undefined && disposition.length > 0)){
                                var alertMessage ='A Disposition should be entered for each Product in the Products section. If the Disposition is Sold or Closed Emerging Risk, then Sold/Retained Members should also be entered for that Product.'; 
                                if(isMedicalAndOthersTab){
                                    alertMessage = 'A Disposition should be entered for each Other Buy Up Program. If the Disposition is Sold or Closed Emerging Risk, then Sold/Retained Members should also be entered for that Other Buy Up Program. Click OK and go to the Products section to update.'; 
                                }
                                this.showAlert(component,alertMessage,alertType);
                                return false;   
                            }
                            if(disposition == 'Sold' || disposition == 'Closed Emerging Risk'){
                                if((eachProducts.Sold_Retained_Members__c == undefined || eachProducts.Sold_Retained_Members__c == null && eachProducts.Sold_Retained_Members__c == '')){                                
                                    var alertMessage ='A Disposition should be entered for each Product in the Products section. If the Disposition is Sold or Closed Emerging Risk, then Sold/Retained Members should also be entered for that Product.'; 
                                    if(isMedicalAndOthersTab){
                                        alertMessage = 'A Disposition should be entered for each Other Buy Up Program. If the Disposition is Sold or Closed Emerging Risk, then Sold/Retained Members should also be entered for that Other Buy Up Program. Click OK and go to the Products section to update.'; 
                                    }
                                    this.showAlert(component,alertMessage,alertType);
                                    return false;                                                                        
                                }    
                            } 
                            /*if(disposition == 'Sold'){
                                if((eachProducts.Buyup_Product_Selection__c == '' || eachProducts.Buyup_Product_Selection__c == undefined)){                                
                                    alertMessage = 'A Disposition should be entered for each Other Buy Up Program. If the Disposition is Sold, then Sold/Retained Members and Product Selection should also be entered for that Other Buy Up Program. Click OK and go to the Products section to update.'; 
                                    this.showAlert(component,alertMessage,alertType);
                                    return false;                                                                        
                                }    
                            } */
                            
                        }else{
                            
                            var oppLineItemDoNotIncTotalVal = false;
                            if(productsObj.MA_Category == 'Pharmacy') {
                            	oppLineItemDoNotIncTotalVal = eachProducts.Product2.Do_Not_Include_in_Total__c;    
                            }                             
                            if(oppLineItemDoNotIncTotalVal == false && (disposition == 'Sold' || disposition == 'Closed Emerging Risk')) {
                                if(eachProducts.Sold_Retained_Members__c == undefined || eachProducts.Sold_Retained_Members__c == null && eachProducts.Sold_Retained_Members__c == ''){                                
                                    var alertMessage ='Sold/Retained Members should be entered for each Product. Click OK and go to the Products section to update.'; 
                                    if(isMedicalAndOthersTab){
                                        alertMessage ='Sold/Retained Members should be entered for each Medical Product. Click OK and go to the Products section to update.'; 
                                    }
                                    this.showAlert(component,alertMessage,alertType);
                                    return false;                                    
                                }    
                            } 
                        }
                    }

                    if(disposition == 'Closed Emerging Risk' && productsObj.MA_Category != $A.get("$Label.c.Other_Buy_Up_Program")){                        
                        if(totalRecordObj.Sold_Retained_Members__c == undefined && totalRecordObj.Existing_Membership_at_Risk__c == undefined){                        
                            if(!(totalRecordObj.Sold_Retained_Members__c <= totalRecordObj.Existing_Membership_at_Risk__c)){                                
                                this.showAlert(component,'Within the Products section, the total Sold Retained Members Should be less than total Existing Membership at Risk Value',alertType);
                                return false;   
                            }                       
                        }    
                    }

                    if (salesStage === 'Notified' || salesStage=='Transfer In/Out' || salesStage=='Spin-Off') {
                        var opportunityRecord = component.get('v.opportunityRecord');
                        var productTypesPresent = new Set();
                        var allowedProductTypes = new Set([
                            'APP', 'CI', 'HI', 'Life', 'STD', 'LTD', 'Leave'
                        ]);

                        var opportunityList = productsObj.opportunityLineList;
                        var opportunitySpecialityList = productsObj.opportunitySpecialityLineList;
                        var allProducts = [...opportunityList, ...opportunitySpecialityList];
                      
                        allProducts.forEach(function(prod) {
                            if(prod.Existing_Members_Involved_in_the_Bid__c >0){
                                var rptType = prod.Product2.Reporting_Product_Type__c;
                                
                                if (rptType && allowedProductTypes.has(rptType)) {
                                    productTypesPresent.add(rptType);
                                    
                                }
                            }
                        });
                        var riskOutcomeMap = {
                            'APP'   : opportunityRecord.Existing_Members_Risk_Outcome_APP__c,
                            'CI'    : opportunityRecord.Existing_Members_Risk_Outcome_CI__c,
                            'HI'    : opportunityRecord.Existing_Members_Risk_Outcome_HI__c,
                            'Life'  : opportunityRecord.Existing_Members_Risk_Outcome_Life__c,
                            'STD'   : opportunityRecord.Existing_Members_Risk_Outcome_STD__c,
                            'LTD'   : opportunityRecord.Existing_Members_Risk_Outcome_LTD__c,
                            'Leave' : opportunityRecord.Existing_Members_Risk_Outcome_Leave__c
                        };
                        for (let productType of productTypesPresent) {
                            if (!riskOutcomeMap.hasOwnProperty(productType)) {
                                continue;
                            }

                            var fieldVal = riskOutcomeMap[productType];

                            if (fieldVal === null || fieldVal === undefined || (typeof fieldVal === 'string' && fieldVal.trim().length === 0)) {
                                this.showAlert(
                                    component,
                                    'Existing Members Risk Outcome ('
                                    +productType+
                                    ') must be entered when Sales Stage is Notified and Existing Other Buy Up Members Involved in the Bid is greater than zero',
                                    alertType
                                );
                                return false;
                            }
                        }
                    }

                }   
            }else if(maType == $A.get("$Label.c.MA_CD_TYPE")){
                if((salesStage == 'Lead' || salesStage == 'Proposal' || salesStage == 'In Review' || salesStage == 'Finalist' || salesStage == 'Notified') && productsObj.MA_Category != $A.get("$Label.c.Other_Buy_Up_Program")){
                    if(totalRecordObj.Estimated_Additional_New_Members__c+totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c <= 0){                        
                        var alertMessage ='The number of Members Transferred From or To Another Segment or the number of Estimated Additional New Members should be entered for at least one product in the Products section.'; 
                        if(isMedicalAndOthersTab){
                            alertMessage ='The number of Members Transferred From or To Another Segment or the number of Estimated Additional New Members should be entered for at least one Medical product in the Products section.  Membership information for the Other Buy Up Programs should be entered as appropriate.'; 
                        }
                        this.showAlert(component,alertMessage,alertType);
                        return false;                        
                    }
                }
                if(salesStage == 'Proposal'){                         
                    if(!(totalRecordObj.Members_Quoted_in_the_Proposal__c >= 0)){                        
                        var alertMessage ='Within the Products section, the total number of Members Quoted in the Proposal Should be greater than or equal 0'; 
                        if(isMedicalAndOthersTab){
                            alertMessage ='Within the Products section, the total number of Members Quoted in the Proposal Should be greater than or equal 0'; 
                        }
                        this.showAlert(component,alertMessage,alertType);
                        return false;  
                    }
                    
                    if(!(totalRecordObj.Members_Quoted_in_the_Proposal__c >= (totalRecordObj.Estimated_Additional_New_Members__c+totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c))){                        
                        var alertMessage = 'The total number of Members Quoted in the Proposal for all Products should not be less than the total Estimated Members (Existing + New). Click OK and go to the Products section to update.'; 
                        if(isMedicalAndOthersTab){
                            alertMessage = 'The total number of Members Quoted in the Proposal for all Medical Products should not be less than the total Estimated Members (Existing + New). Membership information for the Other Buy Up Programs should be entered as appropriate. Click OK and go to the Products section to update.';
                        }
                        this.showAlert(component,alertMessage,alertType);
                        return false;                                                    
                    }
                }
                if(salesStage == 'In Review' || salesStage == 'Finalist'){                     
                    if(!(totalRecordObj.Members_Quoted_in_the_Proposal__c >= (totalRecordObj.Estimated_Additional_New_Members__c+totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c))){                        
                        var alertMessage = 'The total number of Members Quoted in the Proposal for all Products should not be less than the total Estimated Members (Existing + New). Click OK and go to the Products section to update.'; 
                        if(isMedicalAndOthersTab){
                            alertMessage = 'The total number of Members Quoted in the Proposal for all Medical Products should not be less than the total Estimated Members (Existing + New). Membership information for the Other Buy Up Programs should be entered as appropriate. Click OK and go to the Products section to update.'; 
                        }
                        this.showAlert(component,alertMessage,alertType);
                        return false;   
                    }
                }
                if(salesStage == 'Notified' || salesStage=='Transfer In/Out' || salesStage=='Spin-Off'){                    
                     var opportunityList = productsObj.opportunityLineList;
                    var opportunitySpecialityList = productsObj.opportunitySpecialityLineList;
                    var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];
                    for(var j= 0 ; j < opportunityLineList.length; j++){
                        var eachProducts = opportunityLineList[j];    
                        if(productsObj.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program") ){
                            disposition =  eachProducts.Disposition_Other_Buy_Up_Programs__c;                            
                            if(!(disposition != null && disposition != undefined && disposition.length > 0)){
                                var alertMessage = 'A Disposition should be entered for each Product in the Products section. If the Disposition is Sold, then Sold/Retained Members should also be entered for that Product.'; 
                                if(isMedicalAndOthersTab){
                                    alertMessage = 'A Disposition should be entered for each Other Buy Up Program. If the Disposition is Sold, then Sold/Retained Members should also be entered for that Other Buy Up Program. Click OK and go to the Products section to update.'; 
                                }
                                this.showAlert(component,alertMessage,alertType);
                                return false;   
                            }
                            if(disposition == 'Sold'){
                                if(eachProducts.Sold_Retained_Members__c == undefined || eachProducts.Sold_Retained_Members__c == null && eachProducts.Sold_Retained_Members__c == ''){                                
                                    var alertMessage ='A Disposition should be entered for each Product in the Products section. If the Disposition is Sold, then Sold/Retained Members should also be entered for that Product.'; 
                                    if(isMedicalAndOthersTab){
                                        alertMessage = 'A Disposition should be entered for each Other Buy Up Program. If the Disposition is Sold, then Sold/Retained Members should also be entered for that Other Buy Up Program. Click OK and go to the Products section to update.'; 
                                    }
                                    this.showAlert(component,alertMessage,alertType);
                                    return false;   
                                }    
                            }
                        }else{
                            var oppLineItemDoNotIncTotalVal = false;
                            if(productsObj.MA_Category == 'Pharmacy') {
                            oppLineItemDoNotIncTotalVal = eachProducts.Product2.Do_Not_Include_in_Total__c;    
                            }
                            if(oppLineItemDoNotIncTotalVal == false && disposition == 'Sold'){
                                if((eachProducts.Sold_Retained_Members__c == undefined || eachProducts.Sold_Retained_Members__c == null && eachProducts.Sold_Retained_Members__c == '')){                                
                                    var alertMessage = 'Sold/Retained Members should be entered for each Product. Click OK and go to the Products section to update.'; 
                                    if(isMedicalAndOthersTab){
                                        alertMessage = 'Sold/Retained Members should be entered for each Medical Product. Click OK and go to the Products section to update.'; 
                                    }
                                  
                                    this.showAlert(component,alertMessage,alertType);
                                    return false; 
                                }    
                            }   
                        }                        
                    }
                }   
            }                    
        }

        return true;
    },
    validateCompetitors : function(component, competitorsComp) { 
        var alertType = 'Alert';
        var competitorObj = competitorsComp.get('v.competitorObject');
        
        if(competitorObj != null && competitorsComp.get('v.MACompetitorTotalList') != null) {
            if(competitorObj.productTypesInvolvedInMA != undefined && competitorObj.productTypesInvolvedInMA != null &&
               competitorObj.productTypesInvolvedInMA == 'Other') {
                return true;
            }
            var totalNoOfMembersHeld = competitorsComp.get('v.MACompetitorTotalList').Number_of_Members_Held__c;
            var totalNoOfMembersAwarded = competitorsComp.get('v.MACompetitorTotalList').Number_of_Members_Awarded__c;
            var membersInvolvedInMA = competitorObj.membersInvolvedInMA;
            if(membersInvolvedInMA != undefined && membersInvolvedInMA != null) {
                membersInvolvedInMA = Math.round(membersInvolvedInMA);
            }
            
            /* Case 1538 - Make Medical Members Held\Awarded Required -- CM START 
             * In the "In Review" Stage, Total Number of Members Held = Medical Members Involved in the Membership Activity.
             * In the "Notified" Stage, Total Number of Members Awarded  = Medical Members Involved in the Membership Activity.
             */
            
            var salesStage = component.get("v.SalesStage");
            salesStage = (salesStage != undefined && salesStage != null) ? salesStage : '';
            var isMedical = component.get("v.hasMedical");
            isMedical = (isMedical != undefined && isMedical != null) ? isMedical : false;
            var isMedicalAndOthersTab = component.get("v.isMedicalAndOthersTab");
            isMedicalAndOthersTab = (isMedicalAndOthersTab != undefined && isMedicalAndOthersTab != null)?isMedicalAndOthersTab : false;
            var disposition = component.get("v.Disposition");
            disposition = (disposition != undefined && disposition != null)?disposition : '';
            var oppType  = component.get("v.opportunityRecord").Membership_Activity_Type__c;
            oppType = (oppType != undefined && oppType != null)?oppType : '';
            var maType = component.get('v.maType'); 
            maType = (maType != undefined && maType != null) ? maType : '';
            var oppEffDate  = component.get("v.opportunityRecord").EffectiveDate__c;
            oppEffDate = (oppEffDate != undefined && oppEffDate != null) ? oppEffDate : null;
			var dateToBeComparedWithEffDate = '2018-02-01';
            
            if(maType == $A.get("$Label.c.MA_CM_TYPE") && salesStage == 'In Review' && oppType == 'Traditional' && 
					(isMedical == true || isMedicalAndOthersTab == true) && (totalNoOfMembersHeld < membersInvolvedInMA)) {
				var alertMsg = '';
                if(isMedicalAndOthersTab == true) {
                   alertMsg = $A.get("$Label.c.Competitor_InReview_NoOfMemHeldEditCheck_MedOther");
                } else if(isMedical == true) {
                   alertMsg = $A.get("$Label.c.Competitor_InReview_NoOfMemHeldEditCheck");
                }
                this.showAlert(component,alertMsg,alertType);
                return false;
                
            } else if(maType == $A.get("$Label.c.MA_CM_TYPE") && salesStage == 'Notified' && oppType == 'Traditional' &&
						(isMedical == true || isMedicalAndOthersTab == true) && (disposition == 'Sold' || 
							disposition == 'Lost: Finalist' || disposition == 'Lost: Non-Finalist' || disposition == 'Closed Emerging Risk') && 
                      			(totalNoOfMembersAwarded < membersInvolvedInMA) && oppEffDate >= dateToBeComparedWithEffDate) {
                
                var alertMsg = '';
                if(isMedicalAndOthersTab == true) {
                   alertMsg = $A.get("$Label.c.Competitor_Notified_NoOfMemAwaEditCheck_MedOther");
                } else if(isMedical == true) {
                   alertMsg = $A.get("$Label.c.Competitor_Notified_NoOfMemAwaEditCheck");
                }
                this.showAlert(component,alertMsg,alertType);
                return false; 
                
            } else {
                
			/* Case 1538 - Make Medical Members Held\Awarded Required -- CM END */
                
                if(totalNoOfMembersHeld != undefined && totalNoOfMembersHeld != null && membersInvolvedInMA != undefined &&
                   membersInvolvedInMA != null && totalNoOfMembersHeld > membersInvolvedInMA) {                
                    this.showAlert(component,$A.get("$Label.c.Competitor_NoOfMemHeldEditCheck"),alertType);
                    return false;
                }
                if(totalNoOfMembersAwarded != undefined && totalNoOfMembersAwarded != null && membersInvolvedInMA != undefined &&
                   membersInvolvedInMA != null && totalNoOfMembersAwarded > membersInvolvedInMA) {                
                    this.showAlert(component,$A.get("$Label.c.Competitor_NoOfAwaHeldEditCheck"),alertType);
                    return false;
                } 
            }
        }
        return true;
    },
    modalGenericClose : function(component) {
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;	-webkit-overflow-scrolling: touch !important ;}}");
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
        }
    },
    setMedicalTotalRecToOthers : function(component) {
        //console.log('Caluculate others records');
        var products = component.get('v.productsList');   
        var maType = component.get('v.maType');                        
        if(products != null){
            if(products.length != null && products.length > 0 && products.length != 'undefined'){
                for(var i = 0 ; i < products.length ; i++){
                    var productObject = products[i];
                    if(productObject.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program")){
                        var LineRecords = productObject.opportunityLineList;
                        var SpecialtyRecords = productObject.opportunitySpecialityLineList;
                        var ProductRecords =  [...LineRecords, ...SpecialtyRecords];
                        var totalRecordObj = component.get('v.totalRecordObj');                            
                        for(var j=0 ; j < ProductRecords.length; j++){
                            var eachProduct = ProductRecords[j];
                            if(eachProduct.Copy_the_Membership_from_Medical__c){                                
                                eachProduct.Mbrs_Transferred_From_To_Another_Segment__c = totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c;
                                eachProduct.Members_Quoted_in_the_Proposal__c = totalRecordObj.Members_Quoted_in_the_Proposal__c;   
                                eachProduct.Estimated_Additional_New_Members__c = totalRecordObj.Estimated_Additional_New_Members__c;                                       
                                eachProduct.Existing_Members_Involved_in_the_Bid__c = totalRecordObj.Existing_Members_Involved_in_the_Bid__c;                                
                                eachProduct.Existing_Membership_at_Risk__c = totalRecordObj.Existing_Membership_at_Risk__c;                                      
                            }
                        }
                    }
                }
            } 
            component.set('v.productsList',products);
        }
        console.log('*********updateMedicalToOthersRecord****************');
        this.updateMedicalToOthersRecord(component);
    },
    setTotalRecords : function(component) {
    	var productsObjList = component.find("eachProductAuraId");
        if(productsObjList != null){
            if(productsObjList.length != null && productsObjList.length > 0){
                for(var i = 0; i< productsObjList.length ; i++){
                    productsObjList[i].caluculateTotalRecords();
                }
            }else{
                productsObjList.caluculateTotalRecords();
            }
        }
    },
    validateOpportunitiesProducts : function(component){
        var isDataValid = true;
        var products = component.find('eachProductAuraId');     
        //console.log('products : '+products);
        isDataValid = this.checkMandatoryProductsForCM(component);
        if(products != null && isDataValid) {
            if(products.length != undefined && products.length != null && products.length > 0) {                
                for(var i = 0 ; i < products.length ; i++) {                    
                    if(!this.validationProducts(component,products[i])){
                        isDataValid = false;
                        break;
                    }                    
                }
            }else{
                if(!this.validationProducts(component,products)){
                    isDataValid = false;
                }                  
            }            
        }  
        return isDataValid;
    },
    checkMandatoryProductsForCM : function(component) {

        /* Case 1539 -> Products -- Make Adding a Product REQUIRED in Lead & Emerging Risk Stage START */
        
        var alertType = 'Alert';
        var products = component.find('eachProductAuraId');        
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        var maType = component.get('v.maType');    
        var isProductExistsMap = {"Pharmacy":true,"Dental":true,"Vision":true,"Medical":true,"Other":true};
        var salesStageOther = '';
        
        if(products != null) {
            if(products.length != undefined && products.length != null && products.length > 0) { 
                for(var i = 0 ; i < products.length ; i++) {                    
                    var productsObj = products[i].get('v.productObject');
                    var opportunityList = productsObj.opportunityLineList;
                    var opportunitySpecialityList = productsObj.opportunitySpecialityLineList;
                    var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];
                    if(opportunityLineList != undefined && opportunityLineList != null && opportunityLineList.length == 0) {
                        isProductExistsMap[productsObj.MA_Category] = false;
                    }    
                    if(isMedicalAndOthersTab && productsObj.MA_Category == $A.get("$Label.c.Other_Buy_Up_Program")) {
                        salesStageOther = component.get('v.SalesStageOther');
                    }
                }
            } else {
                var productsObj = products.get('v.productObject');
                var opportunityList = productsObj.opportunityLineList;
                var opportunitySpecialityList = productsObj.opportunitySpecialityLineList;
                var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];
                if(opportunityLineList != undefined && opportunityLineList != null && opportunityLineList.length == 0) {
                    isProductExistsMap[productsObj.MA_Category] = false;                            
                }
            } 
        } 
        
        var salesStage = component.get('v.SalesStage');        
        salesStage = (salesStage != undefined && salesStage != null) ? salesStage  : '';
        
        if((salesStage == 'Lead' || salesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) && maType == $A.get("$Label.c.MA_CM_TYPE")) {
            
            if(isMedicalAndOthersTab && isProductExistsMap['Medical'] == false && isProductExistsMap[$A.get("$Label.c.Other_Buy_Up_Program")] == false) {
                if(salesStage == 'Lead') {
                    var alertMessage = 'Please complete the product and membership information in the Medical Products and Other Buy Up Programs sections. At least one Medical product and one Other Buy Up Program should be added. After adding the products, the number of Existing Members Involved in the Bid or the number of Estimated Additional New Members should be entered for at least one Medical product. If applicable, an estimate for Existing Membership at Risk should also be entered. Membership information for the Other Buy Up Programs should be entered as appropriate.';                     
                    this.showAlert(component,alertMessage,alertType);
                    return false;
                } else if(salesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                    var alertMessage = 'Please complete the product and membership information in the Medical Products and Other Buy Up Programs sections. At least one Medical product and one Other Buy Up Program should be added. After adding the products, an estimate for Existing Membership at Risk should be entered for at least one Medical product. Membership information for the Other Buy Up Programs should be entered as appropriate.';                     
                    this.showAlert(component,alertMessage,alertType);
                    return false; 
                }                
            } else {                
                for(var pdtType in isProductExistsMap) {
                    if(isProductExistsMap[pdtType] == false) {
                        if(pdtType == $A.get("$Label.c.Other_Buy_Up_Program")) {
                            var alertMessage = 'Please complete the product and membership information in the Other Buy Up Programs section. At least one Other Buy Up Program should be added. Membership information for the Other Buy Up Programs should be entered as appropriate.';
                            this.showAlert(component,alertMessage,alertType);
                            return false;
                        } else if(salesStage == 'Lead') {
                            var alertMessage = 'Please complete the product and membership information in the '+pdtType+' Products section. At least one product should be added, and the number of Existing Members Involved in the Bid or the number of Estimated Additional New Members should be entered for at least one product. If applicable, an estimate for Existing Membership at Risk should also be entered.';                     
                            this.showAlert(component,alertMessage,alertType);
                            return false;
                        } else if(salesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                            var alertMessage = 'Please complete the product and membership information in the '+pdtType+' Products section. At least one product should be added, and an estimate for Existing Membership at Risk should be entered for at least one product.'; 
                            this.showAlert(component,alertMessage,alertType);
                            return false; 
                        } 
                    }
                }               
            }
        }                     
        
        /* Case 1539 -> Products -- Make Adding a Product REQUIRED in Lead & Emerging Risk Stage END */
        return true;
        
    },
    setTotalToCompetitors : function(component){
        console.log('setTotalToCompetitors');
        var eachProductAuraId = component.find('eachProductAuraId');
        if(eachProductAuraId != null){
            if(eachProductAuraId.length != undefined && eachProductAuraId.length != null && eachProductAuraId.length > 0){
                for(var i = 0; i < eachProductAuraId.length; i++){
                    var productObj = eachProductAuraId[i];		
                    var totalObj  = productObj.get('v.totalRecordObj');
                    var productType  = productObj.get('v.productType');
                    if(productType == $A.get("$Label.c.Other_Buy_Up_Program"))return;  
                    
                    var opportunityList = productObj.get('v.productObject.opportunityLineList');                            
                    var opportunitySpecialityList = productObj.get('v.productObject.opportunitySpecialityLineList');
                    var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];
                    // Reseting the Total Records values to 0
                    for(var i in totalObj) {
                        if (totalObj.hasOwnProperty(i)) {
                            totalObj[i] = parseInt(0);
                        }
                    }
                    
                    // Setting the for Total Records
                    for(var i=0; i< opportunityLineList.length; i++){
                        var opportunityLineObj = opportunityLineList[i];  
                        for(var j in opportunityLineObj) {
                            if (totalObj.hasOwnProperty(j)) {
                                if(opportunityLineObj[j] != null && opportunityLineObj[j] != undefined){
                                    totalObj[j] += parseInt(opportunityLineObj[j])
                                }
                            }
                        }
                    }
                    productObj.set('v.totalRecordObj',totalObj);           
                    
                    var eachCompetitorAuraId = component.find('eachCompetitorAuraId');  
                    if(eachCompetitorAuraId != undefined && eachCompetitorAuraId != null){
                        if(eachCompetitorAuraId.length > 0) {
                            for(var j = 0; j < eachCompetitorAuraId.length; j++){
                                var competitorObj = eachCompetitorAuraId[j];
                                if(competitorObj != undefined && competitorObj != null && competitorObj.get('v.productType') != undefined &&
                                   competitorObj.get('v.productType') != null && productType == competitorObj.get('v.productType')) { 
                                    competitorObj.setTotalRecord(totalObj, component.get('v.opportunityRecord.Members_in_the_Proposal_Medical__c'));
                                    break;
                                }
                            }   
                        } else {
                            var competitorObj = component.find('eachCompetitorAuraId');
                            if(competitorObj != undefined && competitorObj != null && competitorObj.get('v.productType') != undefined &&
                               competitorObj.get('v.productType') != null && productType == competitorObj.get('v.productType')) {
                                competitorObj.setTotalRecord(totalObj, component.get('v.opportunityRecord.Members_in_the_Proposal_Medical__c'));
                            } 
                        }
                    }
                }
            }else{   
                var productObj = eachProductAuraId;		
                var totalObj  = productObj.get('v.totalRecordObj');
                var productType  = productObj.get('v.productType');
                if(productType == $A.get("$Label.c.Other_Buy_Up_Program"))return;
                var competitorObj = component.find('eachCompetitorAuraId');
                if(competitorObj != undefined && competitorObj != null && competitorObj.get('v.productType') != undefined &&
                   competitorObj.get('v.productType') != null && productType == competitorObj.get('v.productType')) {
                    competitorObj.setTotalRecord(totalObj, component.get('v.opportunityRecord.Members_in_the_Proposal_Medical__c'));
                }               
            }
        }
    },  
    startProcessing : function(component){
        var cmpEvent = component.getEvent("productsAndCompetitorsEvent"); 
        cmpEvent.setParams({             
            "startProcessing":true
        });
        cmpEvent.fire();
    },
    stopProcessing : function(component){
        var cmpEvent = component.getEvent("productsAndCompetitorsEvent"); 
        cmpEvent.setParams({             
            "stopProcessing":true
        });
        cmpEvent.fire();
    },
    clickSaveButton : function(component){
        var cmpEvent = component.getEvent("productsAndCompetitorsEvent"); 
        cmpEvent.setParams({             
            "clickSaveButton":true
        });
        cmpEvent.fire();
    },
    triggerStepWiseProductEvent : function(component,isStepWiseProductFound){
        var salesStage = component.get('v.SalesStage');
        if(component.get('v.isMedicalAndOthersTab')){
            salesStage = component.get('v.SalesStageOther');
        }
        
        var cmpEvent = component.getEvent("NBEAOtherBuyUpValidation");
        cmpEvent.setParams({             
            "isStepWiseProductFound":isStepWiseProductFound,
            "selectedITag":'Sales_Stage_Other__c',
            "sales_Stage_Name":salesStage
        });
        cmpEvent.fire();        
    },
    saveEvent : function(component){
        var cmpEvent = component.getEvent("productsAndCompetitorsEvent"); 
        cmpEvent.setParams({             
            "stopProcessing":true,
            "isSaveSuccess":true
        });
        cmpEvent.fire();
    },
    clickEditButton : function(component){
        var cmpEvent = component.getEvent("productsAndCompetitorsEvent"); 
        cmpEvent.setParams({            
            "clickEditButton":true
        });
        cmpEvent.fire();
    },
    enableCancelSaveButton : function(component){
        var cmpEvent = component.getEvent("productsAndCompetitorsEvent"); 
        cmpEvent.setParams({             
            "enableCancelSave":true,            
        });
        cmpEvent.fire();
    },
    showAlert  : function(component,alertMessage,alertType){
        
        var alertClass = component.find('alertClass');        
        if(alertType == 'Reminder'){            
            $A.util.removeClass(alertClass, 'slds-theme--error');
            $A.util.addClass(alertClass, 'slds-theme_warning');
        }else{
            component.set('v.isProductsReminderToReview', false);
        component.set('v.isProductsReminderToAdd', false);
        component.set('v.isProductsReminderToUpdate', false);
            $A.util.addClass(alertClass, 'slds-theme--error');
            $A.util.removeClass(alertClass, 'slds-theme_warning');
        }
        
        console.log('show alert');
        component.set('v.alertType',alertType);
        component.set('v.alertMessage',alertMessage);
        var alertMessageComp = component.find('alertAuraId');
        for(var j = 0; j < alertMessageComp.length ; j=j+1){                
            $A.util.addClass(alertMessageComp[j], 'slds-show');
            $A.util.removeClass(alertMessageComp[j], 'slds-hide');
        }  
    },
    hideAlert  : function(component){        
        var alertMessageComp = component.find('alertAuraId');
        for(var j = 0; j < alertMessageComp.length ; j=j+1){                
            $A.util.removeClass(alertMessageComp[j], 'slds-show');
            $A.util.addClass(alertMessageComp[j], 'slds-hide');
        }  
    },    
    removeOpportunityLineItemsInHelper : function(component) {
        var opportunityRecord = component.get('v.opportunityRecord');
        var medPrdField = opportunityRecord['Medical_Products_Involved__c'];
        var medPrdList = [];
        if(medPrdField != null){
        	medPrdList = medPrdField.split(';');    
        }        
        var medProducts = medPrdField;
        var event = component.get("v.deleteEvent");
        if(event.getParam('isDelete')){                           
            var products = component.get('v.productsList');            
            if(products != null){
                if(products.length != null && products.length > 0 && products.length != 'undefined'){
                    for(var i = 0 ; i < products.length ; i++){
                        var productObject = products[i];
                        if(productObject.MA_Category == event.getParam("productType")){   
                            var isSpeciality = event.getParam('isSpeciality');
                            if (isSpeciality) {
                                productObject.opportunitySpecialityLineList.splice(event.getParam('index'), 1 );
                            } else {
                           productObject.opportunityLineList.splice(event.getParam('index'), 1 );                                
                            }
                           // productObject.opportunityLineList.splice(event.getParam('index'), 1 );                                
                        }
                        var isStepWiseFound = false;                       
                        if(event.getParam("productType") == 'Other') {
                            for(var k = 0; k < productObject.opportunityLineList.length; k++){
                                if(productObject.opportunityLineList[k].Product2.Considered_For_StepWise_Integration__c == 'Yes'){
                                    isStepWiseFound = true;        
                                }                                                                                                                                                   
                            }                                                                                                
                            opportunityRecord['CI_AP_HII__c'] = isStepWiseFound;
                            component.set('v.opportunityRecord',opportunityRecord); 
                            this.triggerStepWiseProductEvent(component,true);
                        }                        
                    }
                }
            } 
            component.set('v.productsList',products);
            this.setTotalRecords(component);
            this.setTotalToCompetitors(component);
            if(component.get("v.isMedicalAndOthersTab")){                    
                this.setMedicalTotalRecToOthers(component);
            }
            
            var opportunityLineItemsObj = event.getParam('OpportunityLineItemsObj');
            /* --- Case 2235  remove the deleted Medical products from the field "Medical Products Involved" ---*/
            var isMedicalProduct = opportunityLineItemsObj.Product2.Product_Line__c;            
            if(isMedicalProduct != null && isMedicalProduct == 'Medical'){            	
                var productName = opportunityLineItemsObj.Product2.Name; 
                if(medPrdList != undefined && medPrdList != null && medPrdList.length > 0){
                    if(medPrdList.length == 1){
                        medProducts = medProducts.replace(productName, ""); 
                    }else{
                        if(medPrdList[0] == productName){
                           	medProducts  = medProducts.replace(productName+";", ""); 
                        }else{
                        	medProducts  = medProducts.replace(";"+productName, "");    
                        }                        
                    } 
                }                
            }
            
            opportunityRecord['Medical_Products_Involved__c'] = medProducts;
            component.set('v.opportunityRecord',opportunityRecord);
            /* --- END Case 2235 --*/
            if(event.getParam('isDeleteFromSF')){
                this.removeOpportunityLineItemsInApex(component,opportunityLineItemsObj,medProducts);                  
            }                                 
        }            
    },
    changeSalesStagesEvent : function(component,SalesStage,previousSalesStage,MA_Category,needFocus,isDispositionalChange,isRiskProbabilityChange) {  
        console.log('changeSalesStagesEvent helper');          
        var Disposition = component.get('v.Disposition');
        var maType = component.get('v.maType');  
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        var otherStage =  $A.get("$Label.c.Other_Buy_Up_Program"); 
		var maTypeNameVal = component.get("v.opportunityRecord").Membership_Activity_Type__c;           
        if(!component.get('v.isExapand'))return;
        
        var products = component.get('v.productsList');       
        if(products != null){
            if(products.length != null && products.length > 0 && products.length != 'undefined'){                
                for(var i = 0 ; i < products.length ; i++){
                    var productObject = products[i];                                                                                                                
                    if(productObject.MA_Category == MA_Category){ 
                        //var isExistingMemRiskValChanged = false;
                        var isCopyMemCheckBoxVal = false;
                        var opportunityList = productObject.opportunityLineList;  
                        var opportunitySpecialityList = productObject.opportunitySpecialityLineList;
                        var opportunityLineList = [...opportunityList, ...opportunitySpecialityList];     
                        var isSpeciality = productObject.isSpecialityProduct;                                             
                        for(var j= 0 ; j < opportunityLineList.length; j++) {
                            var eachProducts = opportunityLineList[j];
                            
                            if (eachProducts.Product2 && eachProducts.Product2.Product_Line__c == 'Other' && eachProducts.Product2.Family == 'Specialty Products') {
                                continue;
                            }

                            if(maType == $A.get("$Label.c.MA_CM_TYPE")){

                                if(SalesStage == 'Pending Transfer In' || SalesStage == 'Pending Transfer Out' || SalesStage == 'Pending Spin-Off'){
                                    eachProducts.Existing_Members_Involved_in_the_Bid__c = 0;
                                    eachProducts.Existing_Membership_at_Risk__c = 0;
                                    eachProducts.Mbrs_Transferred_From_To_Another_Segment__c = 0;
									eachProducts.Estimated_Additional_New_Members__c = 0;                                    
                                }
                                
                                if(MA_Category.substring(0,otherStage.length) == otherStage){
                                    
                                }
                                
                                if(SalesStage != 'Notified'){  
                                    eachProducts.Sold_Retained_Members__c = 0;
                                    eachProducts.Net_Results__c = 0;
                                    eachProducts.Sold_Retained_Members__c = undefined;
                                    eachProducts.Termed_Members__c = 0;
                                    eachProducts.Sold_New_Members__c = 0;
                                    eachProducts.Existing_Members_Retained__c = 0;
                                    eachProducts.Existing_Members_Retained_Pinnacle__c = 0;
                                    eachProducts.Disposition_Other_Buy_Up_Programs__c = '';                                        
                                }
                                
                                if(SalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")){                                                                        
                                    eachProducts.Existing_Members_Involved_in_the_Bid__c = 0;
                                    eachProducts.Estimated_Additional_New_Members__c = 0;
                                }        
                                
                                if(SalesStage != 'Notified'){                                     
                                    eachProducts.Sold_Retained_Members__c = undefined;
                                    if(eachProducts.Net_Results__c != undefined && eachProducts.Net_Results__c != null){
                                        eachProducts.Net_Results__c = 0;
                                    }
                                }
                                
                                if((previousSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside") && SalesStage == 'Proposal') || SalesStage == 'Notified'){
                                    if(previousSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside") && SalesStage == 'Proposal'){
                                        if(eachProducts.Existing_Membership_at_Risk__c != undefined && eachProducts.Existing_Membership_at_Risk__c != null){
                                            eachProducts.Existing_Members_Involved_in_the_Bid__c = eachProducts.Existing_Membership_at_Risk__c;   
                                        }else{
                                            eachProducts.Existing_Members_Involved_in_the_Bid__c = 0;
                                        }                                    
                                    }else if(SalesStage == 'Notified'){
                                        //ghanshyam c 1493 check Disposition is dead and salesStage is notified
                                        
                                        if(Disposition == 'Dead'){											 
                                            eachProducts.Sold_Retained_Members__c = eachProducts.Existing_Members_Involved_in_the_Bid__c;
											//alert(' eachProducts.Sold_Retained_Members__c @@@'+ eachProducts.Sold_Retained_Members__c );
										}                                        
                                        if(isMedicalAndOthersTab){
                                            if(Disposition != 'Sold'){
                                                // if(isSpeciality && eachProducts.Disposition_Other_Buy_Up_Programs__c){
                                                // }
                                                // else{
                                                eachProducts.Disposition_Other_Buy_Up_Programs__c = Disposition;   
                                                //}
                                            }                                            
                                        }else if(MA_Category.substring(0,otherStage.length) == otherStage){
                                            Disposition = eachProducts.Disposition_Other_Buy_Up_Programs__c;
                                        }
                                        
                                        if(isDispositionalChange){                                                                                      
                                            if(Disposition == 'Sold'|| Disposition == 'Closed Emerging Risk' || ((Disposition == null || Disposition == ''))){
                                                eachProducts.Sold_Retained_Members__c = undefined;
                                                eachProducts.Net_Results__c = 0;
                                            }else{
                                               // eachProducts.Sold_Retained_Members__c = 0;
                                                eachProducts.Net_Results__c = 0;
                                            }
                                        }
                                        
                                        if(Disposition == 'Sold'){
                                            if(eachProducts.Sold_Retained_Members__c != undefined && eachProducts.Existing_Members_Involved_in_the_Bid__c != undefined && eachProducts.Sold_Retained_Members__c != null && eachProducts.Existing_Members_Involved_in_the_Bid__c != null){
                                                eachProducts.Net_Results__c = eachProducts.Sold_Retained_Members__c - eachProducts.Existing_Members_Involved_in_the_Bid__c;   
                                            }else{
                                                eachProducts.Sold_Retained_Members__c = undefined;
                                                eachProducts.Net_Results__c = 0;
                                            }                                        
                                        }else if(Disposition == 'Closed Emerging Risk'){
                                            if(eachProducts.Sold_Retained_Members__c != undefined && eachProducts.Existing_Membership_at_Risk__c != undefined && eachProducts.Sold_Retained_Members__c != null && eachProducts.Existing_Membership_at_Risk__c != null){
                                                eachProducts.Net_Results__c = eachProducts.Sold_Retained_Members__c - eachProducts.Existing_Membership_at_Risk__c;   
                                            }else{
                                                eachProducts.Sold_Retained_Members__c = undefined;
                                                eachProducts.Net_Results__c = 0;
                                            }                                        
                                        }else if(Disposition == 'Lost: Finalist' || Disposition == 'Lost: Non-Finalist'){
                                            eachProducts.Sold_Retained_Members__c = 0;
                                            if(eachProducts.Sold_Retained_Members__c != undefined && eachProducts.Existing_Members_Involved_in_the_Bid__c != undefined && eachProducts.Sold_Retained_Members__c != null && eachProducts.Existing_Members_Involved_in_the_Bid__c != null){
                                                eachProducts.Net_Results__c = eachProducts.Sold_Retained_Members__c - eachProducts.Existing_Members_Involved_in_the_Bid__c;   
                                            }else{
                                                eachProducts.Net_Results__c = 0;
                                            }  
                                        }else if(Disposition == 'Dead Lead' || Disposition == 'Dead RFI' || Disposition == 'Declined' || Disposition == 'Passed to Another Segment'){
                                            eachProducts.Sold_Retained_Members__c = 0;
                                            eachProducts.Net_Results__c = 0;                                            
                                        }  
                                        
                                        //Case 1226 - Existing Members Retained, Existing Members Retained Pinnacle
                                        var soldRetained = eachProducts.Sold_Retained_Members__c;
                                        soldRetained = (soldRetained != undefined && soldRetained != null) ? soldRetained : 0;
                                        
                                        if(Disposition == 'Closed Emerging Risk') { 
                                            eachProducts['Existing_Members_Retained__c'] = soldRetained;
                                        } else {
                                            if(soldRetained >= eachProducts.Existing_Members_Involved_in_the_Bid__c) {
                                                eachProducts['Existing_Members_Retained__c'] = eachProducts.Existing_Members_Involved_in_the_Bid__c;
                                            } else {
                                                eachProducts['Existing_Members_Retained__c'] = soldRetained;
                                            }
                                        }
                                        
                                        if(soldRetained >= eachProducts.Existing_Membership_at_Risk__c){
                                            eachProducts['Existing_Members_Retained_Pinnacle__c'] = eachProducts.Existing_Membership_at_Risk__c;
                                        }else{
                                            eachProducts['Existing_Members_Retained_Pinnacle__c'] = soldRetained;
                                        }
                                    }
                                    
                                }

                                if(previousSalesStage == 'Notified' && SalesStage != 'Notified'){
                                    eachProducts.Sold_Retained_Members__c = 0;
                                    eachProducts.Net_Results__c = 0;
                                    eachProducts.Disposition_Other_Buy_Up_Programs__c = '';
                                }
                                
                                
                                /*
         						 * Case 1563 - Products-CM Prepopulate Membership Based on "Current UHC Members" - START
         						 */                               
                                
                                if(component.get("v.isMedicalAndOthersTab") && productObject.MA_Category == 'Other') {
                                    SalesStage = component.get('v.SalesStageOther'); 
                                }
                                var isToBeExecuted = true;
                                var isQAVal = component.get('v.isQA');        
                                var isQA = (isQAVal!=undefined && isQAVal!= null && isQAVal != false) ? true : false;
                                var prevSalesStage = component.get('v.previousSalesStage');
                                prevSalesStage = (prevSalesStage != undefined && prevSalesStage != null) ? prevSalesStage : '';
                                
                                if(isQA) {
                                    isToBeExecuted = false;
                                    var prevSalesStage = component.get('v.previousSalesStage');
                                    prevSalesStage = (prevSalesStage != undefined && prevSalesStage != null) ? prevSalesStage : '';
                                    if(prevSalesStage == 'Lead' && SalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                                        isToBeExecuted = true;
                                    }
                                }
                                
                                isRiskProbabilityChange = (isRiskProbabilityChange != undefined && isRiskProbabilityChange != null) ? 
                                    isRiskProbabilityChange : false;
                                if(isToBeExecuted && isRiskProbabilityChange == false) {
                                    var opportunityObj = component.get('v.opportunityRecord');
                                    var estimatedMemImpact = opportunityObj.Estimated_Membership_Impact__c;
                                    estimatedMemImpact = (estimatedMemImpact != undefined && estimatedMemImpact != null) ? estimatedMemImpact : '';
                                    if(maType == $A.get("$Label.c.MA_CM_TYPE") && SalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside") && 
                                       (prevSalesStage == 'Lead' || prevSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside") || prevSalesStage == '') && estimatedMemImpact == 'Full') {
                                        
                                        if(component.get("v.isMedicalAndOthersTab") && productObject.MA_Category == 'Other') {
                                            isCopyMemCheckBoxVal = true;
                                            eachProducts.Copy_the_Membership_from_Medical__c = true;
                                        } else if(productObject.MA_Category != 'Other') {
                                            var accObj = component.get('v.account');
                                            var competitorClassificationNamesJSONMap = {"Medical":"UHC_Medical_Members__c",
                                                                                        "Pharmacy":"Optum_Rx_Members__c",
                                                                                        "Dental":"UHC_Dental_Members__c",
                                                                                        "Vision":"UHC_Vision_Members__c"};
                                            var uhcMembers = accObj[competitorClassificationNamesJSONMap[productObject.MA_Category]];
                                            uhcMembers = (uhcMembers != undefined && uhcMembers != null) ? uhcMembers : 0;
                                            eachProducts.Existing_Membership_at_Risk__c = uhcMembers;
                                            /*if(uhcMembers > 0) {
                                            		isExistingMemRiskValChanged = true; 
                                        		}*/
                                        }                                
                                    }
                                }
                                isToBeExecuted = false;                                                   
                                
                                /*
         						 * Case 1563 - Products-CM Prepopulate Membership Based on "Current UHC Members" - END
         						 */
                                
                            }else if(maType == $A.get("$Label.c.MA_CD_TYPE")){
                                
                                if(SalesStage != 'Notified'){                                     
                                    eachProducts.Sold_Retained_Members__c = undefined;
                                    eachProducts.Termed_Members__c = 0;
                                    eachProducts.Sold_New_Members__c = 0;
                                    eachProducts.Existing_Members_Retained__c = 0;
                                    eachProducts.Existing_Members_Retained_Pinnacle__c = 0;
                                    eachProducts.Disposition_Other_Buy_Up_Programs__c = '';
                                    if(eachProducts.Net_Results__c != undefined && eachProducts.Net_Results__c != null){
                                        eachProducts.Net_Results__c = 0;                                        
                                    }
                                }                                
                                
                                if(MA_Category.substring(0,otherStage.length) == otherStage){
                                    if(SalesStage != 'Notified' && previousSalesStage == 'Notified'){                                        
                                        eachProducts.Sold_Retained_Members__c = 0;
                                        eachProducts.Net_Results__c = 0;
                                    }
                                }
                                
                                if((previousSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside") && SalesStage == 'Proposal') || SalesStage == 'Notified'){
                                    if(SalesStage == 'Notified'){                 
                                        
                                        if(isMedicalAndOthersTab){
                                            if(Disposition != 'Sold'){
                                                // if(isSpeciality && eachProducts.Disposition_Other_Buy_Up_Programs__c){
                                                // }
                                                // else{
                                                eachProducts.Disposition_Other_Buy_Up_Programs__c = Disposition;   
                                               // }
                                            }                                            
                                        }else if(MA_Category.substring(0,otherStage.length) == otherStage){
                                            Disposition = eachProducts.Disposition_Other_Buy_Up_Programs__c;
                                        }
                                        
                                        if(isDispositionalChange){                                            
                                            if(Disposition == 'Sold' || (Disposition == null || Disposition == '')){
                                                eachProducts.Sold_Retained_Members__c = undefined;
                                                eachProducts.Net_Results__c = 0;
                                            }else{
                                                eachProducts.Sold_Retained_Members__c = 0;
                                                eachProducts.Net_Results__c = 0;
                                            }                                                
                                        }                                      
                                        
                                        if(Disposition == 'Sold'){                                          
                                            if(eachProducts.Sold_Retained_Members__c != undefined && eachProducts.Mbrs_Transferred_From_To_Another_Segment__c != undefined && eachProducts.Sold_Retained_Members__c != null && eachProducts.Mbrs_Transferred_From_To_Another_Segment__c != null){
                                                eachProducts.Net_Results__c = eachProducts.Sold_Retained_Members__c - eachProducts.Mbrs_Transferred_From_To_Another_Segment__c;
                                            }else{
                                                eachProducts.Net_Results__c = 0;
                                            }                                        
                                        }else if(Disposition != 'Sold' && !(Disposition == null || Disposition == undefined || Disposition == '')){
                                            eachProducts.Sold_Retained_Members__c = 0;                                    
                                            eachProducts.Net_Results__c = 0;
                                        }     
                                    }
                                }
                                if(previousSalesStage == 'Notified' && SalesStage != 'Notified'){
                                    eachProducts.Sold_Retained_Members__c = 0;
                                    eachProducts.Net_Results__c = 0;
                                    eachProducts.Disposition_Other_Buy_Up_Programs__c = '';
                                }
                            }
                        }	 
                                                
                        component.set('v.productsList',products);  
                        //if(isExistingMemRiskValChanged) {  
                        this.setTotalRecords(component);
                        this.setTotalToCompetitors(component);
                        //}
                        if(isCopyMemCheckBoxVal) {
                            this.setMedicalTotalRecToOthers(component);               
                        }
                    }                     
                }                                               
            }                             
        }  
        
        /* Case 1538 - Make Medical Members Held\Awarded Required -- CM START
         * Add Unknown Competitor in the Medical Competitors section at Proposal Stage for CM MA Record
         */ 
        SalesStage = (SalesStage != undefined && SalesStage != null) ? SalesStage : '';
        MA_Category = (MA_Category != undefined && MA_Category != null) ? MA_Category : '';
        maType = (maType != undefined && maType != null) ? maType : '';
        maTypeNameVal = (maTypeNameVal != undefined && maTypeNameVal != null) ? maTypeNameVal : '';
        if(maType == $A.get("$Label.c.MA_CM_TYPE") && MA_Category == $A.get("$Label.c.Medical") && maTypeNameVal == 'Traditional' &&
           SalesStage == 'Proposal') {
            var competitorsListObject = component.get('v.CompetitorsListObject');             
            for(var i in competitorsListObject) {
                var isUnkownCompetitorExists = false;
                var competitorsDetailsListObj = competitorsListObject[i].competitorsDetailsList;
                var productType = competitorsListObject[i].productTypesInvolvedInMA;
                productType = (productType != undefined && productType != null) ? productType : '';
                if(productType == $A.get("$Label.c.Medical")) {
                    for(var j in competitorsDetailsListObj) {
                        if(competitorsDetailsListObj[j] != undefined && competitorsDetailsListObj[j] != null &&
                           competitorsDetailsListObj[j].Competitor_Account__r.Name != null) {
                            var competitorName = competitorsDetailsListObj[j].Competitor_Account__r.Name;
                            if(competitorName == $A.get("$Label.c.Unknown_Competitor_In_Proposal")) {
                                isUnkownCompetitorExists = true;
                            }
                        }
                    }
                    if(isUnkownCompetitorExists == false) {
                        this.returnUnknownCompetitorData(component, competitorsDetailsListObj, competitorsListObject, i, MA_Category);
                    } 
                }
            }
        }
        /* Case 1538 - Make Medical Members Held\Awarded Required -- CM END */     
        
        this.setTotalToCompetitors(component); 
        if(needFocus)this.focusProducts(component,SalesStage,previousSalesStage,MA_Category);
    },
    updateMedicalToOthersRecord : function(component){        
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        if(!isMedicalAndOthersTab)return;
        console.log('updateOthersRecord');
        var eachProductAuraId = component.find('eachProductAuraId');        
        if(eachProductAuraId != null){
            if(Array.isArray(eachProductAuraId) && eachProductAuraId[1] != null){
                this.updateOthersRecord(component,eachProductAuraId[1]);
            }
        }
    },
    updateOthersRecord : function(component,eachProductAuraId){
        var eachProductRecordAuraId = eachProductAuraId.find('eachProductRecordAuraId');
        if(eachProductRecordAuraId != null && Array.isArray(eachProductRecordAuraId)){
            for(var i = 0; i < eachProductRecordAuraId.length; i++){                    
                if(eachProductRecordAuraId[i] != null){
                    eachProductRecordAuraId[i].updateOthersRecord();
                }
            }
        }else{
            if(eachProductRecordAuraId != null){
                eachProductRecordAuraId.updateOthersRecord();
            }
        }        
    },    
    focusProducts : function(component,SalesStage,previousSalesStage,MA_Category){        
        console.log('focusProducts');
        var eachProductAuraId = component.find('eachProductAuraId');
        if(eachProductAuraId != null){
            if(Array.isArray(eachProductAuraId)){
                for(var i = 0; i < eachProductAuraId.length; i++){                    
                    if(eachProductAuraId[i].get('v.productType') == MA_Category){
                     this.focusProductsColumn(component,eachProductAuraId[i],SalesStage,previousSalesStage,MA_Category);                       
                    }                    
                }
            }else{                                                  
                this.focusProductsColumn(component,eachProductAuraId,SalesStage,previousSalesStage,MA_Category);
            }
        }
    },
    focusProductsColumn : function(component,eachProductRecordAuraId,SalesStage,previousSalesStage,MA_Category){     
		var maType = component.get('v.maType');           
        var maTypeName = component.get('v.maTypeName');
        
        var isPendingTransfer = component.get('v.isPendingTransfer');
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        if(isMedicalAndOthersTab){
            if(MA_Category == 'Other'){
               isPendingTransfer =  component.get('v.isPendingTransferforOther');
            }
        }
        
        var Disposition = component.get('v.Disposition');
        
        this.clearHighLightBgColor(eachProductRecordAuraId);
        
        if(maType == $A.get("$Label.c.MA_CM_TYPE")){            
            if(SalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")){                    
                var focusColumn = eachProductRecordAuraId.find('Class_'+'Existing_Membership_at_Risk__c'); 
                this.setHightLightBgColor(focusColumn);
                //ghanshyam c added to highlight column
                var focusColumn = eachProductRecordAuraId.find('Class_'+'check_to_synch_with_medical'); 
                this.setHightLightBgColor(focusColumn);
            }else if(SalesStage == 'Lead'){                    
                var focusColumn = eachProductRecordAuraId.find('Class_'+'Existing_Members_Involved_in_the_Bid__c'); 
                this.setHightLightBgColor(focusColumn);                      
                focusColumn = eachProductRecordAuraId.find('Class_'+'Estimated_Additional_New_Members__c'); 
                this.setHightLightBgColor(focusColumn);  
                focusColumn = eachProductRecordAuraId.find('Class_'+'Existing_Membership_at_Risk__c'); 
                this.setHightLightBgColor(focusColumn);
                //ghanshyam c added to highlight column
                focusColumn = eachProductRecordAuraId.find('Class_'+'check_to_synch_with_medical'); 
                this.setHightLightBgColor(focusColumn);
            }else if(SalesStage == 'Notified'){
                if(Disposition == 'Sold' || Disposition == 'Closed Emerging Risk'){                        
                    var focusColumn = eachProductRecordAuraId.find('Class_'+'Sold_Retained_Members__c'); 
                    this.setHightLightBgColor(focusColumn);   
                }                   
            }else if(isPendingTransfer){                    
                var focusColumn = eachProductRecordAuraId.find('Class_'+'Mbrs_Transferred_From_To_Another_Segment__c'); 
                this.setHightLightBgColor(focusColumn);                
            }            
        }else if(maType == $A.get("$Label.c.MA_CD_TYPE")){
            if(SalesStage == 'Lead'){
                var focusColumn = eachProductRecordAuraId.find('Class_'+'Mbrs_Transferred_From_To_Another_Segment__c'); 
                this.setHightLightBgColor(focusColumn);                      
                focusColumn = eachProductRecordAuraId.find('Class_'+'Estimated_Additional_New_Members__c'); 
                this.setHightLightBgColor(focusColumn);
                //ghanshyam c added to highlight column
                focusColumn = eachProductRecordAuraId.find('Class_'+'check_to_synch_with_medical'); 
                this.setHightLightBgColor(focusColumn);
            }else if(SalesStage == 'Proposal'){
                var focusColumn = eachProductRecordAuraId.find('Class_'+'Members_Quoted_In_Proposal'); 
                this.setHightLightBgColor(focusColumn);                                       
            }else if(SalesStage == 'Notified'){
                if(Disposition == 'Sold'){                   
                    var focusColumn = eachProductRecordAuraId.find('Class_'+'Sold_Retained_Members__c'); 
                    this.setHightLightBgColor(focusColumn);   
                }                
            }             
        }        
        
    },
    setHightLightBgColor : function(focusColumn){
        $A.util.addClass(focusColumn, 'focusColor');
    }, 
    clearHighLightBgColor : function(eachProductRecordAuraId){
        var columnNames = ['Class_check_to_synch_with_medical','Existing_Membership_at_Risk__c','Existing_Members_Involved_in_the_Bid__c','Estimated_Additional_New_Members__c','Sold_Retained_Members__c','Mbrs_Transferred_From_To_Another_Segment__c','Mbrs_Transferred_From_To_Another_Segment__c','Members_Quoted_In_Proposal'];
        for(var i = 0; i < columnNames.length ; i++){
            var focusColumn = eachProductRecordAuraId.find('Class_'+columnNames[i]);
            if(focusColumn != undefined && focusColumn != null){
                $A.util.removeClass(focusColumn, 'focusColor');      
            }        	 
        }        
    }, 
    focusProductsRecords : function(component,eachProductRecordAuraId){        
        if(eachProductRecordAuraId != null){
            if(Array.isArray(eachProductRecordAuraId)){
                for(var i= 0; i< eachProductRecordAuraId.length > 0 ; i++){
                    this.focusProductFields(component,eachProductRecordAuraId[i]);
                    break;
                }
            }else{
                this.focusProductFields(component,eachProductRecordAuraId);   
            }
        }        
    },
    focusProductFields : function(component,eachProductComponent){       
        setTimeout(function(){                         
            eachProductComponent.find('Existing_Members_Involved_in_the_Bid__c').focus();            
        }, 500); 
        
    },    
    showAlertInformations : function(component){

        if(component.get('v.isReset')){
            this.saveMAProductsAndCompetitorsInSF(component);
            component.set('v.isReset',false);
            return;
        }
        
        var isCompetitorPopUpToBeShownVal = component.get('v.isCompetitorReminderToBeShown');
        if(isCompetitorPopUpToBeShownVal == undefined || isCompetitorPopUpToBeShownVal == null || isCompetitorPopUpToBeShownVal == false) {
            isCompetitorPopUpToBeShownVal = false;
            component.set('v.isCompetitorReminderToBeShown',false);
        }    
        
        var productTypesValues = component.get('v.productTypesValues');        
        var SalesStage = component.get('v.SalesStage');
        var previousSalesStage = component.get('v.previousSalesStage');             
        
        var SalesStageOther = component.get('v.SalesStageOther');
        var previousSalesStageOther = component.get('v.previousSalesStageOther');  
        
        var isMedicalAndOthersTab = component.get('v.isMedicalAndOthersTab');
        
        var Disposition = component.get('v.Disposition');
        
        var maType = component.get('v.maType');
        var maTypeName = component.get('v.maTypeName');
        
        component.set('v.isAlertShowned',false);
        
        component.set('v.isMedOthrsProductsReminder', '');
        var productsList = component.get('v.productsList');
        if(productsList != null){
            for(var i = 0; i < productsList.length ; i++){
                var productObj = productsList[i];
                var opportunityLineList = productObj.opportunityLineList;
               
                if(productObj.MA_Category == 'Other'){
                    continue;
                }
                if(component.get('v.needToShowAlertInformation') && (previousSalesStage == 'Lead' || previousSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) && SalesStage == 'Proposal' && component.get('v.isChangeStageFromEmrgToProposal')) {                          	              
                    if(maType != undefined && maType != null && maType == $A.get("$Label.c.MA_CM_TYPE")) {
                        //this.showReminderWhenNoCompetitors(component, true);
                        component.set('v.isCompAndPdtsReminderToReview', true);
                    }
                    this.stopProcessing(component); 
                    component.set('v.isAlertShowned',true);
                    component.set('v.isProductsReminderToReview', true);
                    if(!(maType == $A.get("$Label.c.MA_CD_TYPE") && component.get('v.isCompAndPdtsReminderToReview') == false && 
                         component.get('v.isCompetitorReminderToBeShown') == false)) {
                    this.showAlert(component,'','Reminder');
                        return;
                    }                    
                }
                
                if(isMedicalAndOthersTab && productObj.MA_Category == 'Other'){  
                    SalesStage = SalesStageOther;
                }
                
                if(maType == $A.get("$Label.c.MA_CD_TYPE")){                    
                    if(SalesStage == 'Lead' && opportunityLineList.length == 0){
                        component.set('v.isAlertShowned',true);
                        this.stopProcessing(component); 
                        component.set('v.isProductsReminderToAdd', true);
                        this.showAlert(component,'','Reminder');
                        return;
                    }else if(SalesStage == 'Proposal'){
							var totalMembersQuoted = 0;                     
                        for(var j = 0; j < opportunityLineList.length ; j++){
                            var optyProduct = opportunityLineList[j];
                            if(optyProduct.Members_Quoted_in_the_Proposal__c != null && optyProduct.Members_Quoted_in_the_Proposal__c != undefined){
                                totalMembersQuoted += optyProduct.Members_Quoted_in_the_Proposal__c;    
                            }                                 
                        }
                        if(totalMembersQuoted == 0 && opportunityLineList.length > 0) {
                            var isMedicalAndOthersTabVal = component.get('v.isMedicalAndOthersTab');
                            if(isMedicalAndOthersTabVal != undefined && isMedicalAndOthersTabVal != null && isMedicalAndOthersTabVal &&
                               productObj.MA_Category != undefined && productObj.MA_Category != null)  {
                                if(productObj.MA_Category == 'Medical') {
                                    component.set('v.isMedOthrsProductsReminder', 'Medical');  
                                } else if(productObj.MA_Category == 'Other') {
                                    component.set('v.isMedOthrsProductsReminder', 'Other');
                                    } else {
                                      component.set('v.isMedOthrsProductsReminder', '');
                                    }
                                } else {
                                    component.set('v.isMedOthrsProductsReminder', '');
                                }
                                component.set('v.isAlertShowned',true);
                            this.stopProcessing(component);
                            component.set('v.isProductsReminderToUpdate', true);
                            this.showAlert(component,'','Reminder');
                            return;
                        }
                    }                                      
                }else{
                    if((SalesStage == 'Lead' || SalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) && opportunityLineList.length == 0) {
                        var isMedicalAndOthersTabVal = component.get('v.isMedicalAndOthersTab');
                        if(isMedicalAndOthersTabVal != undefined && isMedicalAndOthersTabVal != null && isMedicalAndOthersTabVal &&
                           productObj.MA_Category != undefined && productObj.MA_Category != null && productObj.MA_Category == 'Other') {
                         component.set('v.isMedOthrsProductsReminder', 'Other');
                        } else {
                            component.set('v.isMedOthrsProductsReminder', '');
                        }
                        component.set('v.isAlertShowned',true);
                        this.stopProcessing(component); 
                        component.set('v.isProductsReminderToAdd', true);
                        this.showAlert(component,'','Reminder');
                        return;
                    }
                }
                break;
            }
        }
        if(isCompetitorPopUpToBeShownVal){
            component.set('v.isProductsReminderToReview', false);
            component.set('v.isProductsReminderToAdd', false);
            component.set('v.isProductsReminderToUpdate', false);
            component.set('v.isAlertShowned',true);
            this.stopProcessing(component); 
            this.showAlert(component,'','Reminder');
            return;
        }
        //component.set('v.isCompetitorReminderToBeShown', false);
        this.saveMAProductsAndCompetitorsInSF(component);
    },
    returnIncumbentRecords : function(component,event, opportunityRecord) {
        
        //Incumbent Records START
        var noOfMembersHeldArray = ['Number_of_Members_Held__c','Number_of_Members_Awarded__c'];
        
        var productTypesJSONData = $A.get("$Label.c.Competitors_Backend_Fields");
        productTypesJSONData = '{"'+productTypesJSONData+'"}';
        var productTypeData = JSON.parse(productTypesJSONData);
        
        var competitorsListObj = component.get('v.CompetitorsListObject');
        
        for(var k=0; k<competitorsListObj.length; k++) {
            var productType = competitorsListObj[k].productTypesInvolvedInMA;
            var competitorObj = competitorsListObj[k].competitorsDetailsList;
            for(var j=0;j<noOfMembersHeldArray.length;j++) {
                var largestRetirees = 0;                
                var secLargestRetirees = 0;
                var incumbentPrimary = null;
                var incumbentSecondary = null;
                var incumbentPrimaryRowId = null;                
                var incumbentSecondaryRowId = null;
                var noOfMembersHeld = noOfMembersHeldArray[j];
                for(var i=0; i<competitorObj.length; i++) {
                    var noOfMem = competitorObj[i][noOfMembersHeld];
                    var sortList = [];
                    if(competitorObj[i].Competitor_Account__r.Name != 'TOTAL' && competitorObj[i][noOfMembersHeld] != undefined &&
                       competitorObj[i][noOfMembersHeld] != null) {
                        if(competitorObj[i][noOfMembersHeld] > 0 && competitorObj[i][noOfMembersHeld] >= largestRetirees) {
                            
                            if(incumbentPrimary != null) {
                                sortList.push(incumbentPrimary.toUpperCase());
                            }
                            sortList.push((competitorObj[i].Competitor_Account__r.Name).toUpperCase());                            
                            if(competitorObj[i][noOfMembersHeld] == largestRetirees && incumbentPrimary != null && 
                               this.compareNames(sortList,incumbentPrimary.toUpperCase())) {
                                secLargestRetirees = largestRetirees;
                                incumbentSecondary = incumbentPrimary;
                                incumbentSecondaryRowId = incumbentPrimaryRowId;
                                largestRetirees = competitorObj[i][noOfMembersHeld];
                                incumbentPrimary = competitorObj[i].Competitor_Account__r.Name;
                                incumbentPrimaryRowId = competitorObj[i].Competitor_Account__c;
                            } else if(competitorObj[i][noOfMembersHeld] > largestRetirees) {
                                secLargestRetirees = largestRetirees;
                                incumbentSecondary = incumbentPrimary;
                                incumbentSecondaryRowId = incumbentPrimaryRowId;
                                largestRetirees = competitorObj[i][noOfMembersHeld];
                                incumbentPrimary = competitorObj[i].Competitor_Account__r.Name;
                                incumbentPrimaryRowId = competitorObj[i].Competitor_Account__c;
                            } else if(competitorObj[i][noOfMembersHeld] >= secLargestRetirees){
                                sortList = [];
                                if(incumbentSecondary != null){
                                    sortList.push(incumbentSecondary.toUpperCase());
                                } 
                                sortList.push((competitorObj[i].Competitor_Account__r.Name).toUpperCase());
                                if(competitorObj[i][noOfMembersHeld] == secLargestRetirees && incumbentSecondary != null && 
                                   this.compareNames(sortList,incumbentSecondary.toUpperCase())){
                                    secLargestRetirees = competitorObj[i][noOfMembersHeld];
                                    incumbentSecondary = competitorObj[i].Competitor_Account__r.Name;                                
                                    incumbentSecondaryRowId = competitorObj[i].Competitor_Account__c;
                                }else if(competitorObj[i][noOfMembersHeld] > secLargestRetirees){
                                    secLargestRetirees = competitorObj[i][noOfMembersHeld];
                                    incumbentSecondary = competitorObj[i].Competitor_Account__r.Name;
                                    incumbentSecondaryRowId = competitorObj[i].Competitor_Account__c;
                                }                    
                            }
                            
                        } else if(competitorObj[i][noOfMembersHeld] && competitorObj[i][noOfMembersHeld] >= secLargestRetirees) {
                            if(incumbentSecondary != null){
                                sortList.push(incumbentSecondary.toUpperCase());
                            } 
                            sortList.push((competitorObj[i].Competitor_Account__r.Name).toUpperCase());
                            if(competitorObj[i][noOfMembersHeld] == secLargestRetirees && incumbentSecondary != null && 
                               this.compareNames(sortList,incumbentSecondary.toUpperCase())){
                                secLargestRetirees = competitorObj[i][noOfMembersHeld];
                                incumbentSecondary = competitorObj[i].Competitor_Account__r.Name;                                
                                incumbentSecondaryRowId = competitorObj[i].Competitor_Account__c;
                            }else if(competitorObj[i][noOfMembersHeld] > secLargestRetirees){
                                secLargestRetirees = competitorObj[i][noOfMembersHeld];
                                incumbentSecondary = competitorObj[i].Competitor_Account__r.Name;
                                incumbentSecondaryRowId = competitorObj[i].Competitor_Account__c;
                            }
                        }                          
                    }
                }

                if(productTypeData != undefined && productTypeData != null && productTypeData[productType+'-'+noOfMembersHeld] != undefined &&
                   productTypeData[productType+'-'+noOfMembersHeld] != null) {
                    var incumbentDataArray = productTypeData[productType+'-'+noOfMembersHeld].split(',');
                    if(incumbentDataArray != undefined && incumbentDataArray != null && incumbentDataArray.length == 2) {
                        opportunityRecord[incumbentDataArray[0]] = incumbentPrimaryRowId;
                        opportunityRecord[incumbentDataArray[1]] = incumbentSecondaryRowId;
                    }
                }
            }
        }
        //Incumbent Records END
        
        return opportunityRecord;
    },
    compareNames : function(sortList, incumbentSecondary) {
        var retVal = false;
        sortList.sort();
        var sortedName = sortList[0];
        console.log('After Sorting '+sortList[0]+','+sortList[1]);
        if(sortedName != incumbentSecondary){
            retVal = true;
        }
        return retVal;
    },
    showReminderWhenNoCompetitors : function(component,isProducts) {
        //console.log('showReminderWhenNoCompetitors');
        var competitorsListObj = component.get('v.CompetitorsListObject');
        component.set('v.isCompetitorReminderToBeShown', false);
        if(competitorsListObj != undefined && competitorsListObj != null && competitorsListObj.length > 0) {
            for(var k=0; k<competitorsListObj.length; k++) {
                var competitorObj = competitorsListObj[k].competitorsDetailsList;
                var productType = competitorsListObj[k].productTypesInvolvedInMA;
                if(productType != undefined && productType != null && productType != 'Other' && 
                   competitorObj != undefined && competitorObj != null && competitorObj.length < 2) {
                    if(competitorObj[0] != null && competitorObj[0].Competitor_Account__r != undefined &&
                       competitorObj[0].Competitor_Account__r != null && 
                       competitorObj[0].Competitor_Account__r.Name == 'National Accounts') {
                        if(isProducts != undefined && isProducts != null && isProducts) {
                            component.set('v.isCompAndPdtsReminderToReview', true);
                        } else {
                            component.set('v.isCompetitorReminderToBeShown', true);
                        }
                    }
                }
            }
        }
    },
    returnUnknownCompetitorData : function(component, competitorsDetailsListObj, competitorsListObject, i, MA_Category) {
        var action = component.get('c.returnUnknownAccountCompetitor');                        
        action.setCallback(this, function(response) {
            var state = response.getState();       
            if (state === "SUCCESS") { 
                var unknownCompAccObj = response.getReturnValue();
                var maCompObj =  {'sobjectType':'MA_Competitor__c','Competitor_Account__c':unknownCompAccObj.Id,'Competitor_Account__r':unknownCompAccObj,'Opportunity__c':component.get('v.MArecordId'),'Number_of_Members_Held__c':0,'Number_of_Members_Awarded__c':0,'Competitor_Classification__c':MA_Category,'Competitor_Group__c':unknownCompAccObj.CompetitorGroup__c};
                competitorsDetailsListObj.push(maCompObj);
                competitorsListObject[i].competitorsDetailsList = competitorsDetailsListObj;
                component.set('v.CompetitorsListObject',competitorsListObject);
            }
        });        
        $A.enqueueAction(action);
    }
})