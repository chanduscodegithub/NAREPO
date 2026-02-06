({
	checkForMandatoryFields : function(component, event, mandatoryFieldsData, conditionallyMandatoryData) {
        
        var isMandatoryFieldsValuesAvailable = false;
        var mandatoryFieldsArray;
        if(mandatoryFieldsData != undefined && mandatoryFieldsData != null) {
            mandatoryFieldsArray = mandatoryFieldsData.split(",");   
        }
        var mandatoryEmptyFieldsArray = [];
        
        if(mandatoryFieldsArray != undefined && mandatoryFieldsArray != null) {
            for(var i=0;i<mandatoryFieldsArray.length;i++) {
                var mandatoryFieldArray = mandatoryFieldsArray[i].split(";");
                if(component.find(mandatoryFieldArray[1]) != null && (component.find(mandatoryFieldArray[1]).get('v.value') == null ||
                                                                      component.find(mandatoryFieldArray[1]).get('v.value') == '')) {
                    var obj = {Name: mandatoryFieldArray[0], Itag:mandatoryFieldArray[1]};
                    mandatoryEmptyFieldsArray.push(obj);
                    isMandatoryFieldsValuesAvailable = true;
                }
            }
        }
        
        if(conditionallyMandatoryData != null) {
            conditionallyMandatoryData = conditionallyMandatoryData.replace(/@/g, '{"');
            conditionallyMandatoryData = conditionallyMandatoryData.replace(/\%/g,'"}');
            conditionallyMandatoryData = conditionallyMandatoryData.replace(/;;/g,'":"');
            conditionallyMandatoryData = conditionallyMandatoryData.replace(/#/g,'"');
            var conditionallyMandatoryDataMap = JSON.parse(conditionallyMandatoryData);
            var productsInvolvedInOppOrRiskValues = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
            for(var j=0; j<productsInvolvedInOppOrRiskValues.length; j++) {
                var multipleFieldsArray = conditionallyMandatoryDataMap[productsInvolvedInOppOrRiskValues[j]].split(",");
                if(multipleFieldsArray != undefined && multipleFieldsArray != null) {
                    for(var i=0; i<multipleFieldsArray.length; i++) {
                        var mandatoryFieldArray = multipleFieldsArray[i].split(";");
                        if(component.find(mandatoryFieldArray[1]) != null && (component.find(mandatoryFieldArray[1]).get('v.value') == null ||
                                                                              component.find(mandatoryFieldArray[1]).get('v.value') == '')) {
                            var obj = {Name: mandatoryFieldArray[0], Itag:mandatoryFieldArray[1]};
                            mandatoryEmptyFieldsArray.push(obj);
                            isMandatoryFieldsValuesAvailable = true;
                        }
                    }
                }
            }
        }
        component.set('v.MandatoryEmptyFieldsArray', mandatoryEmptyFieldsArray);
        return isMandatoryFieldsValuesAvailable;
    },
    
    returnTheDetailsToController : function(component, event) {
        
        var productsInvolvedInOppOrRiskValues = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
        
        
        if(productsInvolvedInOppOrRiskValues != undefined && productsInvolvedInOppOrRiskValues != null && 
           		productsInvolvedInOppOrRiskValues.length > 0) {
            
            var productsInvolvedInOppOrRiskJSONMap = {"Medical":"Me","Pharmacy":"Rx","Dental":"De","Vision":"Vi","Other Buy Up Programs":"Other"};
             /*Added  - 3873 */
            //var showLeadSource = productsInvolvedInOppOrRiskValues.includes("Medical");
            component.set("v.showLeadSourceField", productsInvolvedInOppOrRiskValues.includes("Medical"));
           
            
            for(var i in productsInvolvedInOppOrRiskJSONMap) {
                
                /*
				 * Initially hide all the Sales Stage, Risk Probability & Anticipated/Actual Close Date fields. 
                 * Later based on the selection, hide or show these fields.
				 */
                var fieldsToBeHidden = component.find(i);
                if(fieldsToBeHidden != null && fieldsToBeHidden != undefined) {
                    if(Array.isArray(fieldsToBeHidden)) {
                        for(var j=0; j<fieldsToBeHidden.length; j++) {
                            if($A.util.hasClass(fieldsToBeHidden[j], "slds-hide") == false) {
                                $A.util.addClass(fieldsToBeHidden[j], "slds-hide");    
                            }
                        }
                    } else {
                        if($A.util.hasClass(fieldsToBeHidden, "slds-hide") == false) {
                            $A.util.addClass(fieldsToBeHidden, "slds-hide");    
                        }
                    }
                }
                
                /*
				 * On deselection of any of the ProductsInvolvedInOpportunityOrRisk, empty the values in the 
                 * Sales Stage & Anticipated/Actual Close Date fields.
                 * Also, set the default value as Lead to the selected Sales Stage fields.
				 */
                
                if(i == 'Other Buy Up Programs') {
                    if(component.find('Sales_Stage_Other__c') != undefined && component.find('Sales_Stage_Other__c') != null) {
                        if(!productsInvolvedInOppOrRiskValues.includes(i)) {
                            component.find('Sales_Stage_Other__c').set('v.value','');
                            component.set('v.OpportunityData.Sales_Stage_Other__c', '');
                        } else if(productsInvolvedInOppOrRiskValues.includes(i)) { 
                        	component.find('Sales_Stage_Other__c').set('v.value', 'Lead');
                            component.set('v.OpportunityData.Sales_Stage_Other__c', 'Lead');
                        }
                    }
                    if(!productsInvolvedInOppOrRiskValues.includes(i) && 
                       		component.find('Anticipated_Actual_Close_Date_Other__c') != undefined && 
                       			component.find('Anticipated_Actual_Close_Date_Other__c') != null) {
                        component.find('Anticipated_Actual_Close_Date_Other__c').set('v.value','');
                    }
                    
                } else {
                    if(component.find('Sales_Stage_'+i+'__c') != undefined && component.find('Sales_Stage_'+i+'__c') != null) {
                        if(!productsInvolvedInOppOrRiskValues.includes(i)) {
                            component.find('Sales_Stage_'+i+'__c').set('v.value','');
                        	component.set('v.OpportunityData.'+'Sales_Stage_'+i+'__c', '');
                        } else if(productsInvolvedInOppOrRiskValues.includes(i)) { 
                        	component.find('Sales_Stage_'+i+'__c').set('v.value','Lead');
                            component.set('v.OpportunityData.'+'Sales_Stage_'+i+'__c', 'Lead');
                        }
                    }
                    if(!productsInvolvedInOppOrRiskValues.includes(i) &&  
                       		component.find('Anticipated_Actual_Close_Date_'+i+'__c')  != undefined && 
                       			component.find('Anticipated_Actual_Close_Date_'+i+'__c') != null) {
                        component.find('Anticipated_Actual_Close_Date_'+i+'__c').set('v.value','');
                    }
                }
                
                /*
                 *  For Products & Competitors Data - START
                 */
                
                var productType = '';
                if(i == 'Other Buy Up Programs') {
                	productType = 'Other';
                } else {
                    productType = i;
                }
                
                var pdtsCmptrsCompToBeHidden = component.find(productType+'Products');
                var breadCrumbsCompToBeHidden = component.find(productType+'BreadCrumb');
                
                if(!productsInvolvedInOppOrRiskValues.includes(i)) {
                    
                    if(breadCrumbsCompToBeHidden != undefined && breadCrumbsCompToBeHidden != null) { 
                        
                        $A.util.removeClass(breadCrumbsCompToBeHidden, "active");
                        $A.util.addClass(breadCrumbsCompToBeHidden, "slds-hide");
                    }
                    
                    if(pdtsCmptrsCompToBeHidden != undefined && pdtsCmptrsCompToBeHidden != null) {
                        
                        if(Array.isArray(pdtsCmptrsCompToBeHidden)) {
                            for(var k=0; k<pdtsCmptrsCompToBeHidden.length; k++) {
                                $A.util.addClass(pdtsCmptrsCompToBeHidden[k], "slds-hide");
                            }
                        } else {
                            $A.util.addClass(pdtsCmptrsCompToBeHidden, "slds-hide");    
                        }
                    }
                    
                    /*
                     * Empty the Products & Competitors Data - START
                     */ 
                    
                    var productComponents = component.find('productsAndCompetitorsAuraId');
                    
                    if(productComponents != null && productComponents != undefined) {
                        if(Array.isArray(productComponents)) {
                            for(var i=0; i<productComponents.length; i++) {
                                var productsListinQA = productComponents[i].get('v.productsList');
                                if(productsListinQA != undefined && productsListinQA != null) {
                                    for(var j=0; j<productsListinQA.length; j++) {
                                        var productTypeOffered = productsListinQA[j].MA_Category;
                                        if(productType == productTypeOffered) {
                                            productsListinQA[j].opportunityLineList = [];
                                            productsListinQA[j].opportunitySpecialityLineList = [];
                                        }      
                                    }
                                }
                                var competitorsListInQA = productComponents[i].get('v.CompetitorsListObject');
                                if(competitorsListInQA != undefined && competitorsListInQA != null) {
                                    for(var k=0; k<competitorsListInQA.length; k++) {
                                        var productTypeOffered = competitorsListInQA[k].productTypesInvolvedInMA;
                                        if(productType == productTypeOffered) {
                                            competitorsListInQA[k].competitorsDetailsList = [];
                                        }         
                                    }
                                }
                            }
                        }
                    }
                    
                    /*
                     * Empty the Products & Competitors Data - END
                     */ 
                    
                } else {
                    
                    if(breadCrumbsCompToBeHidden != undefined && breadCrumbsCompToBeHidden != null) { 
                        $A.util.removeClass(breadCrumbsCompToBeHidden, "active");
                    }
                }
                
                /*
                 *  For Products & Competitors Data - END
                 */
                
            }
            
            component.set('v.SelectedProductsInvolvedIntheOpportunityOrRisk', []);
            component.set('v.SelectedProductsInvolvedIntheOpportunityOrRisk', productsInvolvedInOppOrRiskValues);
            
            /*
             * Generating Page numbers for the Products & Competitors Pages - START
             */ 
            component.set('v.ProductNavigationPages', {})
            var navigationPagesJSONObj = component.get('v.ProductNavigationPages');
            var isMedicalOtherTab = false;
            if(productsInvolvedInOppOrRiskValues.includes('Medical') && productsInvolvedInOppOrRiskValues.includes('Other Buy Up Programs')){
                isMedicalOtherTab = true;
                navigationPagesJSONObj[1]='MedicalOther';
                component.set('v.isMedicalOtherTab', true);
            } else {
                component.set('v.isMedicalOtherTab', false);
            }
            
            for(var i=0; i<productsInvolvedInOppOrRiskValues.length; i++) {
                
                var fieldsToBeShown = component.find(productsInvolvedInOppOrRiskValues[i]);
                if(fieldsToBeShown != null && fieldsToBeShown != undefined) {
                    if(Array.isArray(fieldsToBeShown)) {
                        for(var k=0; k<fieldsToBeShown.length; k++) {
                        	$A.util.removeClass(fieldsToBeShown[k], "slds-hide"); 
                        }
                    } else {
                        $A.util.removeClass(fieldsToBeShown, "slds-hide");
                    }
                }
                
                if(isMedicalOtherTab == false && productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') { 
                    navigationPagesJSONObj[i+1]='Other';
                } else {
                    if(isMedicalOtherTab && productsInvolvedInOppOrRiskValues[i] != 'Medical') {
                        navigationPagesJSONObj[i+1]=productsInvolvedInOppOrRiskValues[i];
                    } else if(isMedicalOtherTab == false) {
                    	navigationPagesJSONObj[i+1]=productsInvolvedInOppOrRiskValues[i];
                    }
                }
            }
            
            component.set('v.ProductNavigationPages', navigationPagesJSONObj);
            if(isMedicalOtherTab) { 
            	component.set('v.NavigationPages.LastPage4A', (productsInvolvedInOppOrRiskValues.length-1));
                
                /*
                 * If both Medical & Other are selected then hide the individual Component data.
                 */  
                var fieldsToBeHiddenArray = ['MedicalProducts','OtherProducts'];
                if(fieldsToBeHiddenArray != undefined && fieldsToBeHiddenArray != null) {
                    for(var m=0; m<fieldsToBeHiddenArray.length; m++) {
                        var fieldsToBeHidden = component.find(fieldsToBeHiddenArray[i]);
                        if(Array.isArray(fieldsToBeHidden)) {
                            for(var k=0; k<fieldsToBeHidden.length; k++) {
                                $A.util.addClass(fieldsToBeHidden[k], "slds-hide");
                            }
                        } else {
                            $A.util.addClass(fieldsToBeHidden, "slds-hide");    
                        }
                    }
                }
                
            } else {
                component.set('v.NavigationPages.LastPage4A', productsInvolvedInOppOrRiskValues.length);
            }
            
           /*
            * Generating Page numbers for the Products & Competitors Pages - START
            */ 
            
        }
    },
    
    displayScreen5Data : function(component, event, currentPageNo, previousPageNo) {
        
        currentPageNo = previousPageNo + 1;
        /*if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') != undefined && 
           		component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') != null &&
               		(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'No' ||
                    	component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Not Yet Known')) { 
        
            if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[currentPageNo] != undefined &&
               		component.find("kanbanSteps")[currentPageNo] != null) {
                $A.util.addClass(component.find("kanbanSteps")[currentPageNo], "slds-red");    
            }
        
        } */
        
        component.set('v.NavigationPages.Page', currentPageNo);
        $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
        $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
        /*
         * To highlight the stages in the Kanban Progression Branch
         */
        this.updateKanbanBranchingProgression(component, event, currentPageNo);
        
    },
    
    updateKanbanBranchingProgression : function(component, event, currentPageNo) {
        
        /*
             * The below logic updates the Progression of the Kanban Branching Stages.
             * Based on the current Page No- the completed steps in Green, the Skipped steps in Red Cross mark
             * and the steps to be completed in Grey.
             */
        
        var kanbanBranchingList = component.get('v.kanbanBranchingList');
        if(kanbanBranchingList != null && kanbanBranchingList.length > 0) {
            var totalNoOfProgressionSteps = kanbanBranchingList.length;
            var kanbanStepsArray = component.find("kanbanSteps");
            if(kanbanStepsArray != null) {
                for(var i=1; i<=totalNoOfProgressionSteps; i++) {
                    if(currentPageNo == i) {
                        if(kanbanStepsArray[i-1] != null) {
                            $A.util.addClass(kanbanStepsArray[i-1], "slds-is-active");
                            var progressionBarWidthPer = ((currentPageNo-1) * (100/(totalNoOfProgressionSteps-1)));
                            component.set('v.progressionBarWidth', 'width:'+progressionBarWidthPer+'%');
                        }
                    } else if(i < currentPageNo) {
                        if(kanbanStepsArray[i-1] != null) { 
                            $A.util.addClass(kanbanStepsArray[i-1], "slds-green");
                        }
                    } else {
                        if(kanbanStepsArray[i-1] != null) {
                            $A.util.removeClass(kanbanStepsArray[i-1], "slds-green");
                            $A.util.removeClass(kanbanStepsArray[i-1], "slds-is-active");   
                        }
                    }
                }
            }
        }
        
    },
    
    saveOpportunityRecord : function(component, event, currentPageNo) {
        
        var spinner = component.find("userLoadingspinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var oppDataObj = component.get('v.OpportunityData');
        var productsInvolvedInOppOrRiskValues = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
        for(var i=0; i<productsInvolvedInOppOrRiskValues.length; i++) {
            var productType = '';
            if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                productType = 'Other';
            } else {
                productType = productsInvolvedInOppOrRiskValues[i];
            }
            var oppFieldItag = 'Inital_Selected_Sales_Stage_'+productType+'__c';
            var oppFieldItag1 = 'Progression_Sales_Stage_'+productType+'__c';
            var salesStageItag = 'Sales_Stage_'+productType+'__c';
            var salesStageVal = oppDataObj[salesStageItag];
            if(salesStageVal != undefined && salesStageVal != null) {
            	salesStageVal = salesStageVal.replace(/ /g, '_');  
                oppDataObj[oppFieldItag] = 'Initial_NB_'+salesStageVal;
                oppDataObj[oppFieldItag1] = 'NB_'+salesStageVal;
            }
        }
        component.set('v.OpportunityData', oppDataObj);

        var action = component.get('c.saveOpportunityDetails');	    
        action.setParams({
            "opportunityData" : component.get('v.OpportunityData')
        });
        action.setCallback(this, function(response) {
            var state = response.getState(); 
            if (state === "SUCCESS") { 
                var oppId = response.getReturnValue();
                if(oppId !=null && oppId != undefined) {
					this.saveMAProductsAndCompetitorsInSF(component, event, oppId);
                }
                /*var oppId = response.getReturnValue();
                var cmpEvent = component.getEvent("modalCmpCloseEvent");
                cmpEvent.setParams({
                        "isRecordCreated": true,
                    	"isAccount":false
                    });
                cmpEvent.fire();
                if(component.get('v.isOpp') != undefined && component.get('v.isOpp') != null && component.get('v.isOpp')) {
                    var navEvt = $A.get("e.force:navigateToSObject");
                    navEvt.setParams({
                        "recordId": oppId,
                        "slideDevName": "related"
                    });
                    navEvt.fire();
                } else {
                    var cmpEvent1 = component.getEvent("AccountMA_QAEvent");
                	cmpEvent1.fire();
                }*/
            }
            else if (state === "INCOMPLETE") { 
                //this.stopProcessing(component); 
            } else if (state === "ERROR") {                   
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.errorMessage', errors[0].message);
                        component.set('v.errorPopUpLabel', 'Exception');
                        var confirmCancelForPromptList = component.find('reminderPopUp');
                        for(var i in confirmCancelForPromptList) {
                            $A.util.removeClass(confirmCancelForPromptList[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            //$A.util.removeClass(spinner, 'slds-show');
            //$A.util.addClass(spinner, 'slds-hide');
        });        
        $A.enqueueAction(action);
    },
    
    saveMAProductsAndCompetitorsInSF : function(component,event, opportunityId) {
        
        //var spinner = component.find("userLoadingspinner");
        //$A.util.removeClass(spinner, 'slds-hide');
        //$A.util.addClass(spinner, 'slds-show');
        
        //console.log('Save Products');
        /* 
         * Building the Products List which is to be inserted in SF
         */
        var productComponents = component.find('productsAndCompetitorsAuraId');
        var allProductsList = [];
        var listOfMACompetitorsArray = [];
        var totalRecordsDataArray = [];
        var selPdtTypes = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
        selPdtTypes = (selPdtTypes != undefined && selPdtTypes != null) ? selPdtTypes : '';
        
        if(productComponents != null && productComponents != undefined) {
            if(Array.isArray(productComponents)) {
                for(var i=0; i<productComponents.length; i++) {
                    var productsListinQA = productComponents[i].get('v.productsList');
                    if(productsListinQA != undefined && productsListinQA != null) {
                        for(var j=0; j<productsListinQA.length; j++) {
                            allProductsList.push.apply(allProductsList, productsListinQA[j].opportunityLineList);
                            allProductsList.push.apply(allProductsList, productsListinQA[j].opportunitySpecialityLineList);
                            var productTypeOffered = productsListinQA[j].MA_Category;
                            productTypeOffered = (productTypeOffered != undefined && productTypeOffered != null) ? productTypeOffered : '';
                            if(selPdtTypes.includes(productTypeOffered)) {
                                var productListObj = productComponents[i].find('eachProductAuraId');
                                if(productTypeOffered != undefined && productTypeOffered != null && productTypeOffered != 'Other' &&
                                   productListObj != undefined && productListObj != null) {
                                    if(Array.isArray(productListObj)) {
                                        for(var k=0;k<productListObj.length;k++) {
                                            var productTypeVal = productListObj[k].get('v.productType');
                                            if(productTypeVal != undefined && productTypeVal != null && productTypeVal != 'Other') {
                                                var totalObj = productListObj[k].get('v.totalRecordObj');
                                                /* Description field in OppLineItem obj is used to carry the Product Type value from Helper to Apex class */
                                                totalRecordsDataArray.push({'sobjectType':'OpportunityLineItem','Description':productsListinQA[j].MA_Category,'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Mbrs_Transferred_From_To_Another_Segment__c':totalObj.Mbrs_Transferred_From_To_Another_Segment__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0});
                                            }
                                        }
                                    } else {
                                        var totalObj = productListObj.get('v.totalRecordObj'); 
                                        /* Description field in OppLineItem obj is used to carry the Product Type value from Helper to Apex class */
                                        totalRecordsDataArray.push({'sobjectType':'OpportunityLineItem','Description':productsListinQA[j].MA_Category,'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Mbrs_Transferred_From_To_Another_Segment__c':totalObj.Mbrs_Transferred_From_To_Another_Segment__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0});
                                    }
                                }                                   
                            }                            
                        }                           
                    }
                    var competitorsListInQA = productComponents[i].get('v.CompetitorsListObject');
                    if(competitorsListInQA != undefined && competitorsListInQA != null) {
                        for(var k=0; k<competitorsListInQA.length; k++) {
                            listOfMACompetitorsArray.push.apply(listOfMACompetitorsArray, competitorsListInQA[k].competitorsDetailsList);         
                        }
                    }                    
                }
            } else {
                var productsListinQA = productComponents.get('v.productsList');
                if(productsListinQA != undefined && productsListinQA != null) {
                    for(var j=0; j<productsListinQA.length; j++) {
                        allProductsList.push.apply(allProductsList, productsListinQA[j].opportunityLineList); 
                        allProductsList.push.apply(allProductsList, productsListinQA[j].opportunitySpecialityLineList);
                        var productTypeOffered = productsListinQA[j].MA_Category;
                        productTypeOffered = (productTypeOffered != undefined && productTypeOffered != null) ? productTypeOffered : '';
                        if(selPdtTypes.includes(productTypeOffered)) {
                            var productListObj = productComponents.find('eachProductAuraId');
                            if(productTypeOffered != undefined && productTypeOffered != null && productTypeOffered != 'Other' &&
                               productListObj != undefined && productListObj != null) {
                                if(Array.isArray(productListObj)) {
                                    for(var k=0;k<productListObj.length;k++) {
                                        var productTypeVal = productListObj[k].get('v.productType');
                                        if(productTypeVal != undefined && productTypeVal != null && productTypeVal != 'Other') {
                                            var totalObj = productListObj[k].get('v.totalRecordObj');
                                            /* Description field in OppLineItem obj is used to carry the Product Type value from Helper to Apex class */
                                            totalRecordsDataArray.push({'sobjectType':'OpportunityLineItem','Description':productsListinQA[j].MA_Category,'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Mbrs_Transferred_From_To_Another_Segment__c':totalObj.Mbrs_Transferred_From_To_Another_Segment__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0});
                                        }
                                    }
                                } else {
                                    var totalObj = productListObj.get('v.totalRecordObj'); 
                                    /* Description field in OppLineItem obj is used to carry the Product Type value from Helper to Apex class */
                                    totalRecordsDataArray.push({'sobjectType':'OpportunityLineItem','Description':productsListinQA[j].MA_Category,'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Mbrs_Transferred_From_To_Another_Segment__c':totalObj.Mbrs_Transferred_From_To_Another_Segment__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0});
                                }
                            }
                        }
                    }
                }
                var competitorsListInQA = productComponents.get('v.CompetitorsListObject');
                if(competitorsListInQA != undefined && competitorsListInQA != null) {
                    for(var k=0; k<competitorsListInQA.length; k++) {
                        listOfMACompetitorsArray.push.apply(listOfMACompetitorsArray, competitorsListInQA[k].competitorsDetailsList);         
                    }
                }
            }
            if(totalRecordsDataArray != undefined && totalRecordsDataArray != null) {
                component.set('v.TotalPdtsRecordsList', totalRecordsDataArray);
            }
        }
        //console.log('productList-'+allProductsList);
                
        //this.startProcessing(component); 
        var action = component.get('c.saveOpportunityLineItemsAndCompetitors');	    
        action.setParams({ 
            'productsList': allProductsList,
            'competitorsList': listOfMACompetitorsArray,
            'oppId' : opportunityId,
            'totalRecordsList' : component.get('v.TotalPdtsRecordsList'),
            'selectedProductTypes' : component.get('v.OpportunityData.Product_Type_Involved_in_Opp__c'),
            'oppType' : $A.get("$Label.c.NB")
        }); 
        
        action.setCallback(this, function(response) {
            
            component.set('v.isEditRecord',false);  
            var state = response.getState();       
            if (state === "SUCCESS") {                
                this.saveMAConsultantsInSF(component,event, opportunityId);
            }
            else if (state === "INCOMPLETE") { 
                //this.stopProcessing(component); 
            } else if (state === "ERROR") {                    
                //this.stopProcessing(component); 
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //this.showAlert(component,errors[0].message,component.get('v.exceptionType'));
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });        
        $A.enqueueAction(action);
	},
    
    saveMAConsultantsInSF : function(component,event, opportunityId) {
        
        var spinner = component.find("userLoadingspinner");
        //$A.util.removeClass(spinner, 'slds-hide');
        //$A.util.addClass(spinner, 'slds-show');
        
        var maConsultantObj = component.find('maConsultantsAuraId');
        if(maConsultantObj != undefined && maConsultantObj != null) {
            var maConsultantRecordsList = maConsultantObj.get('v.maConsultantList');
            var isprimaryExists = false;
            var updatedContactIds = [];
            if(maConsultantRecordsList != null && maConsultantRecordsList != undefined) {
                maConsultantRecordsList.sort(function(a,b) {
                    var t1 = a['IsPrimary'] == b['IsPrimary'],
                        t2 = a['IsPrimary'] > b['IsPrimary'];
                    return t1? 0: (false?-1:1)*(t2?-1:1);
                });
                if(maConsultantRecordsList.length > 0) {
                    
                    if(maConsultantRecordsList[0].IsPrimary) {
                        isprimaryExists = true; 
                    }
                    
                    for(var j = 0; j<maConsultantRecordsList.length; j++) {
                        updatedContactIds.push(maConsultantRecordsList[j].Id);
                    }
                }
            }
            
            var action = component.get('c.saveOpportunityContacts');	    
            action.setParams({ 
                'consultantIds': updatedContactIds,
                'oppId' : opportunityId,
                'accountId' : component.get('v.Child_Data.accountId'),
                'isprimaryExistsVal' : isprimaryExists
            }); 
            
            action.setCallback(this, function(response) {
                
                component.set('v.isEditRecord',false);  
                var state = response.getState();       
                if (state === "SUCCESS") { 
                    var cmpEvent = component.getEvent("modalCmpCloseEvent");
                    cmpEvent.setParams({
                        "isRecordCreated": true,
                        "isAccount":false
                    });
                    cmpEvent.fire();
                    if(component.get('v.isOpp') != undefined && component.get('v.isOpp') != null && component.get('v.isOpp')) {
                        var navEvt = $A.get("e.force:navigateToSObject");
                        navEvt.setParams({
                            "recordId": opportunityId,
                            "slideDevName": "related",
                            "isRedirect":true
                        });
                       navEvt.fire();
                    } else {
                        var cmpEvent1 = component.getEvent("AccountMA_QAEvent");
                        cmpEvent1.fire();
                    }  
                    //$A.util.removeClass(spinner, 'slds-show');
                    //$A.util.addClass(spinner, 'slds-hide');
                }
                else if (state === "INCOMPLETE") { 
                    //this.stopProcessing(component); 
                } else if (state === "ERROR") {                    
                    //this.stopProcessing(component);                     
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            //this.showAlert(component,errors[0].message,component.get('v.exceptionType'));
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
            });        
            $A.enqueueAction(action);
        }
    },
    
    clearMandatoryErrorData : function(component, event, prevMandatoryEmptyFieldsArray) {
        
        $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
        
        var mandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
        if(mandatoryEmptyFieldsArray == undefined || mandatoryEmptyFieldsArray == null || 
           mandatoryEmptyFieldsArray.length == 0) {
            mandatoryEmptyFieldsArray = prevMandatoryEmptyFieldsArray;
        }
        if(mandatoryEmptyFieldsArray != undefined && mandatoryEmptyFieldsArray != null) { 
            for(var i=0; i<mandatoryEmptyFieldsArray.length; i++) {
                if(component.find(mandatoryEmptyFieldsArray[i]) != null) {
                    if(mandatoryEmptyFieldsArray[i].Itag == 'Name') {
                        $A.util.removeClass(component.find(mandatoryEmptyFieldsArray[i].Itag), "mandatoryFields");
                    }
                    $A.util.removeClass(component.find(mandatoryEmptyFieldsArray[i].Itag+'Div'), "slds-has-error");
                    $A.util.addClass(component.find(mandatoryEmptyFieldsArray[i].Itag+'Div1'), "slds-hide");
                }
            }
        }
        component.set('v.MandatoryEmptyFieldsArray', []);
    },
    
    modalGenericClose : function(component, event) {
        if(event.getParam('isAccount')){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            if(modalComponent != undefined && modalComponent != null) {
                modalComponent.modalClosing();
                component.set("v.dynamicComponentsByAuraId", {});
                component.set("v.dynamicComponentAuraId", '');
                component.set("v.body", []);
            }
        }
        
    },
    
    validateDateFieldValues : function(component, event, selectedDate) {
        
        var selectedDateArray = selectedDate.split('-');

        if(selectedDateArray != undefined && selectedDateArray != null && selectedDateArray.length == 3) {
            
            var month = '';
            if(selectedDateArray[1] < 10 && !selectedDateArray[1].startsWith('0')){
                month = '0'+selectedDateArray[1];
            }
            var day = '';
            if(selectedDateArray[2] < 10 && !selectedDateArray[2].startsWith('0')){
                day = '0'+selectedDateArray[2];
                if(month == "") {
                    selectedDate = selectedDateArray[0]+'-'+selectedDateArray[1]+'-'+day;
                }
                else {
                    selectedDate = selectedDateArray[0]+'-'+month+'-'+day;
                }
            } else {
                if(month == ""){
                    selectedDate = selectedDateArray[0]+'-'+selectedDateArray[1]+'-'+selectedDateArray[2];   
                }
                 if(month!=""){
                    selectedDate = selectedDateArray[0]+'-'+month+'-'+selectedDateArray[2];   
                }
            }
        }
        
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        var selectedDateItag = event.getSource().getLocalId();
        selectedDateItag = (selectedDateItag != undefined && selectedDateItag != null) ? selectedDateItag : '';
        
        if(!selectedDate.match(regEx)) {
            $A.util.addClass(component.find(selectedDateItag+'Div'), "slds-has-error");
            $A.util.removeClass(component.find(selectedDateItag+'Div2'), "slds-hide");
            component.find('nextBtn').set("v.disabled", true);
            return false;
        }  else {
        	$A.util.removeClass(component.find(selectedDateItag+'Div'), "slds-has-error");
        	$A.util.addClass(component.find(selectedDateItag+'Div2'), "slds-hide");
            component.find('nextBtn').set("v.disabled", false);
        } 
    }

})