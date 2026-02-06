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
            for(var i=0; i<productsInvolvedInOppOrRiskValues.length; i++) {
                var mandatoryFieldArray = conditionallyMandatoryDataMap[productsInvolvedInOppOrRiskValues[i]].split(";");
                if(component.find(mandatoryFieldArray[1]) != null && (component.find(mandatoryFieldArray[1]).get('v.value') == null ||
                                                                      component.find(mandatoryFieldArray[1]).get('v.value') == '')) {
                    var obj = {Name: mandatoryFieldArray[0], Itag:mandatoryFieldArray[1]};
                    mandatoryEmptyFieldsArray.push(obj);
                    isMandatoryFieldsValuesAvailable = true;
                }
            }
        }
        component.set('v.MandatoryEmptyFieldsArray', mandatoryEmptyFieldsArray);
        return isMandatoryFieldsValuesAvailable;
    },
    
    returnTheDetailsToController : function(component, event) {
        
        var opportunityName = '';
        /*
             * To Build the Opp Name in a format -> AccName - EffDate - ProductsInvolvedInOpportunityOrRisk (Product values seperated by comma)
             * -> Get the AccountName
             */
        if(component.get('v.OpportunityData.AccountName') != null) {
            opportunityName = component.get('v.OpportunityData.AccountName') + ' - ';  
        }
        
        /*
             * To Build the Opp Name in a format -> AccName - EffDate - ProductsInvolvedInOpportunityOrRisk (Product values seperated by comma)
             * -> Get the EffectiveDate details
             */
        if(component.get('v.OpportunityData.EffectiveDate__c') != null) {
            var effectiveDate = component.get('v.OpportunityData.EffectiveDate__c');
            if(effectiveDate != undefined && effectiveDate != null) {
                var effectiveDateArray = effectiveDate.split('-');
                opportunityName = opportunityName + (effectiveDateArray[1]+'/'+effectiveDateArray[2]+'/'+effectiveDateArray[0]) + ' - '; 
            }
        }
        
        var productsInvolvedInOppOrRiskValues = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
        if(productsInvolvedInOppOrRiskValues != undefined && productsInvolvedInOppOrRiskValues != null && 
           		productsInvolvedInOppOrRiskValues.length > 0) {
            
            component.set('v.NavigationPages.LastPage5A', productsInvolvedInOppOrRiskValues.length); 
            var productsInvolvedInOppOrRiskJSONMap = {"Medical":"Med","Pharmacy":"Rx","Dental":"De","Vision":"Vi","Other Buy Up Programs":"Other"};
            /*Added By Chandrika - 3873 */
            component.set("v.showLeadSourceField", productsInvolvedInOppOrRiskValues.includes("Medical"));
            
            
            //component.set('v.ProductsInvolvedInOppFlags', {'isMedical':false,'isPharmacy':false,'isDental':false,'isVision':false,'isOther':false});
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
                
                var fieldsToBeHidden = component.find(i+'_UW');
                if(fieldsToBeHidden != null && fieldsToBeHidden != undefined) {
                    if(Array.isArray(fieldsToBeHidden)) {
                        for(var k=0; k<fieldsToBeHidden.length; k++) {
                            if($A.util.hasClass(fieldsToBeHidden[k], "slds-hide") == false) {
                                $A.util.addClass(fieldsToBeHidden[k], "slds-hide");    
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
                 * Sales Stage, Risk Probability & Anticipated/Actual Close Date fields.
				 */
                
                var productType = '';
                if(i == 'Other Buy Up Programs') {
                	productType = 'Other';
                } else {
                    productType = i;
                }
                
                var breadCrumbsCompToBeHidden = component.find(productType+'BreadCrumb');
                
                if(!productsInvolvedInOppOrRiskValues.includes(i)) {
                    
                    if(i == 'Other Buy Up Programs') {
                        if(component.find('Sales_Stage_Other__c') != null) {
                            component.find('Sales_Stage_Other__c').set('v.value','');  
                            component.set('v.OpportunityData.Sales_Stage_Other__c', '');
                        }   
                        if(component.find('Risk_Probability_Other__c') != null) {
                            component.find('Risk_Probability_Other__c').set('v.value','');
                        }
                        if(component.find('Anticipated_Actual_Close_Date_Other__c') != null) {
                            component.find('Anticipated_Actual_Close_Date_Other__c').set('v.value', null);
                        }
                        if(component.find('Date_the_CI_APP_HIPP_Quote_is_Needed__c') != null) {
                            component.find('Date_the_CI_APP_HIPP_Quote_is_Needed__c').set('v.value', null);
                        }
                        if(component.find('Employees_in_the_Proposal_CI_AP_HI__c') != null) {
                            component.find('Employees_in_the_Proposal_CI_AP_HI__c').set('v.value', null);
                        }
                        if(component.find('Retirees_in_the_Proposal_CI_AP_HI__c') != null) {
                            component.find('Retirees_in_the_Proposal_CI_AP_HI__c').set('v.value', null);
                        }
                        if(component.find('U_W_Engagement_not_yet_Needed_CI_APP_HI__c') != null) {
                            component.find('U_W_Engagement_not_yet_Needed_CI_APP_HI__c').set('v.value', false);
                        }
                        
                    } else {
                        if(component.find('Sales_Stage_'+i+'__c') != null) {
                            component.find('Sales_Stage_'+i+'__c').set('v.value',''); 
                            component.set('v.OpportunityData.Sales_Stage_'+i+'__c', '');
                        }   
                        if(component.find('Risk_Probability_'+i+'__c') != null) {
                            component.find('Risk_Probability_'+i+'__c').set('v.value','');
                        }
                        if(component.find('Anticipated_Actual_Close_Date_'+i+'__c') != null) {
                            component.find('Anticipated_Actual_Close_Date_'+i+'__c').set('v.value', null);
                        }
                        if(component.find('Date_the_'+i+'_Quote_is_Needed_from_UW__c') != null) {
                            component.find('Date_the_'+i+'_Quote_is_Needed_from_UW__c').set('v.value', null);
                        }
                        if(component.find('Employees_in_the_Proposal_'+i+'__c') != null) {
                            component.find('Employees_in_the_Proposal_'+i+'__c').set('v.value', null);
                        }
                        if(component.find('Retirees_in_the_Proposal_'+i+'__c') != null) {
                            component.find('Retirees_in_the_Proposal_'+i+'__c').set('v.value', null);
                        }
                        if(component.find('U_W_Engagement_not_yet_Needed_'+i+'__c') != null) {
                            component.find('U_W_Engagement_not_yet_Needed_'+i+'__c').set('v.value', false);
                        }
                    }
                    
                    var pdtsCmptrsCompToBeHidden = component.find(productType+'Products');
                    
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
                
            }
            
            component.set('v.SelectedProductsInvolvedIntheOpportunityOrRisk', []);
            component.set('v.SelectedProductsInvolvedIntheOpportunityOrRisk', productsInvolvedInOppOrRiskValues);
            
            var productsInvolvedInOppOrRiskVal = '';
            component.set('v.ProductNavigationPages', {});
            var navigationPagesJSONObj = component.get('v.ProductNavigationPages');
            
            var isMedicalOtherTab = false;
            if(productsInvolvedInOppOrRiskValues.includes('Medical') && productsInvolvedInOppOrRiskValues.includes('Other Buy Up Programs')){
                isMedicalOtherTab = true;
                navigationPagesJSONObj[1]='MedicalOther';
                component.set('v.isMedicalOtherTab', true);
            } else {
                component.set('v.isMedicalOtherTab', false);
            }
            
            var hasValue = false;
            var isExistingMemAtRiskFlag = false;
            for(var i=0; i<productsInvolvedInOppOrRiskValues.length; i++) {
                
                /*
				 * Based on the selected types of ProductsInvolvedInOpportunityOrRisk, the Sales Stage, Risk Probability & 
                 * Anticipated/Actual Close Date fields is dispalyed on the respected Screens. 
				 */
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
                
                /*
               	 * To Build the Opp Name in a format -> AccName - EffDate - ProductsInvolvedInOpportunityOrRisk
             	 * -> Get the Products Involved In Opportunity Or Risk details and build the selected Product values seperated by comma
             	 */
                if(i>0 && i<productsInvolvedInOppOrRiskValues.length) {
                    productsInvolvedInOppOrRiskVal = productsInvolvedInOppOrRiskVal + ', ' + 
                        productsInvolvedInOppOrRiskJSONMap[productsInvolvedInOppOrRiskValues[i]]; 
                } else {
                    productsInvolvedInOppOrRiskVal = productsInvolvedInOppOrRiskVal + 
                        productsInvolvedInOppOrRiskJSONMap[productsInvolvedInOppOrRiskValues[i]];
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
                
                /*
                 * Reset the value in the IsThereExistingMembershipAtRisk based on the selected Product Types.
                 */ 
                var productType = '';
                if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                    productType = 'Other';
                } else {
                    productType = productsInvolvedInOppOrRiskValues[i];
                }
                var salesStageItag = 'Sales_Stage_'+productType+'__c';
                var salesStageVal = component.find(salesStageItag).get("v.value");
                if(salesStageVal != undefined && salesStageVal != null && salesStageVal != '') {
                    hasValue = true;
                    if(salesStageVal == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                        isExistingMemAtRiskFlag = true;
                        component.set('v.isRequiredFields.'+productType, true);
                    } else {
                        component.set('v.isRequiredFields.'+productType, false);
                    }
                }
            }
            
            component.set('v.ProductNavigationPages', navigationPagesJSONObj);
            if(isMedicalOtherTab) { 
            	component.set('v.NavigationPages.LastPage5A', (productsInvolvedInOppOrRiskValues.length-1));
            } else {
                component.set('v.NavigationPages.LastPage5A', productsInvolvedInOppOrRiskValues.length);
            }
            
            if(hasValue) {
                if(isExistingMemAtRiskFlag != undefined && isExistingMemAtRiskFlag != null && isExistingMemAtRiskFlag) {
                    component.find('Is_There_Existing_Membership_at_Risk__c').set('v.value', 'Yes');  
                } else {
                    component.find('Is_There_Existing_Membership_at_Risk__c').set('v.value', 'No'); 
                }
            } else {
                component.find('Is_There_Existing_Membership_at_Risk__c').set('v.value', ''); 
            }
            
            /*
             * Build the Opportunity Name in the format 
             *   AccountName - EffectiveDate - ProductsInvolvedInOpportunityOrRisk (Prodcut values seperated by comma)
             */
            opportunityName = opportunityName + productsInvolvedInOppOrRiskVal;
        }
        
        component.set('v.OpportunityData.Name',opportunityName);
        
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
        var salesStagesArray = []
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
            salesStagesArray.push(productType+';;'+salesStageVal);
            if(salesStageVal != undefined && salesStageVal != null) {
            	salesStageVal = salesStageVal.replace(/ /g, '_');  
                oppDataObj[oppFieldItag] = 'Initial_NBEA_'+salesStageVal;
                oppDataObj[oppFieldItag1] = 'NBEA_'+salesStageVal;
            }
        }
        oppDataObj.Is_There_Existing_Membership_at_Risk__c = component.find("Is_There_Existing_Membership_at_Risk__c").get('v.value');
        component.set('v.OpportunityData', oppDataObj);
        component.set('v.SalesStageList', salesStagesArray);

        var action = component.get('c.saveOpportunityDetails');	    
        action.setParams({
            "opportunityData" : component.get('v.OpportunityData')
        });
        action.setCallback(this, function(response) {
            var state = response.getState(); 
            if (state === "SUCCESS") {  
                var oppId = response.getReturnValue();
                if(oppId !=null && oppId != undefined) {
					this.saveMAProductsInSF(component, event, oppId);
                }
                /*var cmpEvent = component.getEvent("modalCmpCloseEvent");
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
            /*$A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');*/
        });        
        $A.enqueueAction(action);
    },
    
    saveMAProductsInSF : function(component,event, opportunityId) {

        /*var spinner = component.find("userLoadingspinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');*/
            
        //console.log('Save Products');
        /*var productComponents = component.find('productsAndCompetitorsAuraId');
        var allProductsList = [];
        if(productComponents != null && productComponents != undefined) {
            if(Array.isArray(productComponents)) {
                for(var i=0; i<productComponents.length; i++) {
                    var productsListinQA = productComponents[i].get('v.productsList');
                    if(productsListinQA != undefined && productsListinQA != null) {
                        for(var j=0; j<productsListinQA.length; j++) {
                            allProductsList.push.apply(allProductsList, productsListinQA[j].opportunityLineList);         
                        }
                    }
                }
            } else {
                var productsListinQA = productComponents.get('v.productsList');
                if(productsListinQA != undefined && productsListinQA != null) {
                    for(var j=0; j<productsListinQA.length; j++) {
                        allProductsList.push.apply(allProductsList, productsListinQA[j].opportunityLineList);         
                    }
                }
            }
        }
        console.log('productList-'+allProductsList);*/
        
        //this.startProcessing(component); 
        var action = component.get('c.saveOpportunityLineItemsAndCompetitors');	    
        action.setParams({ 
            'productsList': component.get('v.AllProductsList'),
            'competitorsList' : null,
            'oppId' : opportunityId,
            'totalRecordsList' : component.get('v.TotalPdtsRecordsList'),
            'selectedProductTypes' : component.get('v.OpportunityData.Product_Type_Involved_in_Opp__c'),
            'oppType' : $A.get("$Label.c.NBEA"),
            'salesStagesList' : component.get('v.SalesStageList'),
            'accountId' : component.get('v.Child_Data.accountId')
        }); 
        
        action.setCallback(this, function(response) {
            
            component.set('v.isEditRecord',false);  
            var state = response.getState();       
            if (state === "SUCCESS") { 

                this.saveMAConsultantsInSF(component,event, opportunityId);
                /*var cmpEvent = component.getEvent("modalCmpCloseEvent");
                cmpEvent.setParams({
                        "isRecordCreated": true,
                    	"isAccount":false
                    });
                cmpEvent.fire();
                if(component.get('v.isOpp') != undefined && component.get('v.isOpp') != null && component.get('v.isOpp')) {
                    var navEvt = $A.get("e.force:navigateToSObject");
                    navEvt.setParams({
                        "recordId": opportunityId,
                        "slideDevName": "related"
                    });
                    navEvt.fire();
                } else {
                    var cmpEvent1 = component.getEvent("AccountMA_QAEvent");
                	cmpEvent1.fire();
                }  
                $A.util.removeClass(spinner, 'slds-show');
            	$A.util.addClass(spinner, 'slds-hide');*/
            }
            else if (state === "INCOMPLETE") { 
                //this.stopProcessing(component); 
            } else if (state === "ERROR") {                    
                //this.stopProcessing(component); 
                //$A.util.removeClass(spinner, 'slds-show');
            	//$A.util.addClass(spinner, 'slds-hide');
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

       	var oppInvolveConsultantVal = component.find("Does_this_Oppty_Risk_Involve_Consultant__c").get("v.value");
        var maConsultantObj = component.find('maConsultantsAuraId');
        var maConsultantRecordsList = maConsultantObj.get('v.maConsultantList');
        var spinner = component.find("userLoadingspinner");
        /*$A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');*/
                
        if(maConsultantObj != undefined && maConsultantObj != null) {
            var isprimaryExists = false;
            var updatedContactIds = [];
            if(maConsultantRecordsList != null && maConsultantRecordsList != undefined ) {
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
                    /*$A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');*/
                    
                }
                else if (state === "INCOMPLETE") { 
                    //this.stopProcessing(component); 
                } else if (state === "ERROR") {                    
                    //this.stopProcessing(component); 
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
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

    checkForStepwiseProducts : function(component,event) {

        component.set('v.stepwiseProductsFlag', {'Other':false});
        component.set('v.AllProductsList', []);
        var productComponents = component.find('productsAndCompetitorsAuraId');
        var allProductsList = [];
        var selectedPdtTypes = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
        selectedPdtTypes = (selectedPdtTypes != undefined && selectedPdtTypes != null) ? selectedPdtTypes : '';
        var totalRecordsDataArray = [];
        if(productComponents != null && productComponents != undefined) {
            if(Array.isArray(productComponents)) {
                for(var i=0; i<productComponents.length; i++) {
                    var productsListinQA = productComponents[i].get('v.productsList');
                    if(productsListinQA != undefined && productsListinQA != null) {
                        for(var j=0; j<productsListinQA.length; j++) {
                            allProductsList.push.apply(allProductsList, productsListinQA[j].opportunityLineList);
                            allProductsList.push.apply(allProductsList, productsListinQA[j].opportunitySpecialityLineList);
                            var opportunityList = productsListinQA[j].opportunityLineList;
                            var opportunitySpecialityLineList = productsListinQA[j].opportunitySpecialityLineList; 
                            var opportunityLineList = [...opportunityList, ...opportunitySpecialityLineList];
                            var productTypeOffered = productsListinQA[j].MA_Category;
                            if(productTypeOffered != undefined && productTypeOffered != null) {
                                if(productTypeOffered == 'Other') {
                                    for(var k=0;k<opportunityLineList.length;k++) {
                                        var eachProducts = opportunityLineList[k];
                                        if(eachProducts.Product2.Considered_For_StepWise_Integration__c != undefined && 
                                           eachProducts.Product2.Considered_For_StepWise_Integration__c != null && 
                                           eachProducts.Product2.Considered_For_StepWise_Integration__c == 'Yes') {
                                            component.set('v.stepwiseProductsFlag.'+productsListinQA[j].MA_Category, true);
                                            break;
                                        }   
                                    }
                                } else {
                                    if(selectedPdtTypes.includes(productTypeOffered)) {
                                        var productListObj = productComponents[i].find('eachProductAuraId');
                                        if(productListObj != undefined && productListObj != null) {
                                            if(Array.isArray(productListObj)) {
                                                for(var k=0;k<productListObj.length;k++) {
                                                    var productTypeVal = productListObj[k].get('v.productType');
                                                    if(productTypeVal != undefined && productTypeVal != null && productTypeVal != 'Other') {
                                                        var totalObj = productListObj[k].get('v.totalRecordObj');
                                                        //totalOppLineItem = {'sobjectType':'OpportunityLineItem','Product2.Product_Line__c':productType,'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Members_Transferred_From_to_Another_Segm__c':totalObj.Members_Transferred_From_to_Another_Segm__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0};
                                                    	/* Description field in OppLineItem obj is used to carry the Product Type value from Helper to Apex class */
                                                        totalRecordsDataArray.push({'sobjectType':'OpportunityLineItem','Product_Conversion__c':totalObj.Product_Conversion__c,'Description':productsListinQA[j].MA_Category,'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Mbrs_Transferred_From_To_Another_Segment__c':totalObj.Mbrs_Transferred_From_To_Another_Segment__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0});
                                                    }
                                                }
                                            } else {
                                                var totalObj = productListObj.get('v.totalRecordObj'); 
                                                /* Description field in OppLineItem obj is used to carry the Product Type value from Helper to Apex class */
                                                totalRecordsDataArray.push({'sobjectType':'OpportunityLineItem','Product_Conversion__c':totalObj.Product_Conversion__c,'Description':productsListinQA[j].MA_Category,'Estimated_Additional_New_Members__c':totalObj.Estimated_Additional_New_Members__c,'Existing_Members_Involved_in_the_Bid__c':totalObj.Existing_Members_Involved_in_the_Bid__c,'Existing_Membership_at_Risk__c':totalObj.Existing_Membership_at_Risk__c,'Members_Quoted_in_the_Proposal__c':totalObj.Members_Quoted_in_the_Proposal__c,'Net_Results__c':totalObj.Net_Results__c,'Sold_Retained_Members__c':totalObj.Sold_Retained_Members__c,'Mbrs_Transferred_From_To_Another_Segment__c':totalObj.Mbrs_Transferred_From_To_Another_Segment__c,'Quantity':1,'Annual_Revenue_Premium__c':totalObj.Annual_Revenue_Premium__c,'TotalPrice':200,"Termed_Members__c":totalObj.Termed_Members__c,"Sold_New_Members__c":totalObj.Sold_New_Members__c,"Existing_Members_Retained__c":0,"Existing_Members_Retained_Pinnacle__c":0,"Sold_New_Mbrs__c":0,"Termed_Mbrs__c":0});
                                            }
                                        }  
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                var productsListinQA = productComponents.get('v.productsList');
                if(productsListinQA != undefined && productsListinQA != null) {
                    for(var j=0; j<productsListinQA.length; j++) {
                        allProductsList.push.apply(allProductsList, productsListinQA[j].opportunityLineList);     
                        allProductsList.push.apply(allProductsList, productsListinQA[j].opportunitySpecialityLineList);             
                    }
                }
            }
        }
        if(allProductsList != undefined && allProductsList != null && allProductsList.length > 0) {
            component.set('v.AllProductsList', allProductsList);
        }
        if(totalRecordsDataArray != undefined && totalRecordsDataArray != null) {
            component.set('v.TotalPdtsRecordsList', totalRecordsDataArray);
        }
    },
    
    skipScreen6Data : function(component, event, currentPageNo, previousPageNo) {
        
        console.log('previousPageNo-'+previousPageNo);
        
        /*
		 * Screen 6 will be shown only if one of the Product Types (Dental, Vision, Other) is selected along with the businees logic
         */ 
        
        var underWritingRelatedProductTypes = ['Dental','Vision','Other Buy Up Programs'];
        var productsInvolvedInOppOrRiskValues = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
        var isToBeSkipped = true;
        
        this.checkForStepwiseProducts(component, event);
        
        for(var i=0; i<productsInvolvedInOppOrRiskValues.length; i++) {
            
            if(underWritingRelatedProductTypes.includes(productsInvolvedInOppOrRiskValues[i])) {
                
                var underWritingEngagementProductFlagVal = false;
                var salesStageVal = '';
                var oppDataObj = component.get('v.OpportunityData');
                
                if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                    salesStageVal = component.find('Sales_Stage_Other__c').get('v.value');
                    underWritingEngagementProductFlagVal = component.get('v.stepwiseProductsFlag.Other');
                    if(salesStageVal != undefined && salesStageVal != null && salesStageVal == $A.get("$Label.c.EmergingRiskOrNoUpside") &&
                      		underWritingEngagementProductFlagVal != null && underWritingEngagementProductFlagVal) {
                        isToBeSkipped = false;
                        var fieldsToBeShown = component.find(productsInvolvedInOppOrRiskValues[i]+'_UW');
                        if(fieldsToBeShown != null && fieldsToBeShown != undefined) {
                            if(Array.isArray(fieldsToBeShown)) {
                                for(var k=0; k<fieldsToBeShown.length; k++) {
                                    $A.util.removeClass(fieldsToBeShown[k], "slds-hide");    
                                }
                            } else {
                                $A.util.removeClass(fieldsToBeShown, "slds-hide");    
                            }
                        }
                        var uwEngNotNeededItag = 'U_W_Engagement_not_yet_Needed_CI_APP_HI__c';
                        var uwEngNotNeededval;
                        if(component.find(uwEngNotNeededItag) != undefined && component.find(uwEngNotNeededItag) != null) {
                            uwEngNotNeededval = component.find(uwEngNotNeededItag).get('v.value');
                        }
                        uwEngNotNeededval = (uwEngNotNeededval != undefined && uwEngNotNeededval != null) ? uwEngNotNeededval : false;
                        
                    	//if(underWritingEngagementProductFlagVal != null && underWritingEngagementProductFlagVal) {
                            
                           //component.set('v.isRequiredOther', true);
                           //component.set('v.isRequiredOther1', true);
                            
                            var isDateTheQuoteNeededItag = 'Date_the_CI_APP_HIPP_Quote_is_Needed__c';
                            var isDateTheQuoteNeededComp = component.find(isDateTheQuoteNeededItag);
                            if(isDateTheQuoteNeededComp != undefined && isDateTheQuoteNeededComp != null) {
                                var isDateTheQuoteNeededVal = isDateTheQuoteNeededComp.get('v.value');
                                if(isDateTheQuoteNeededVal != undefined && isDateTheQuoteNeededVal != null) {
                                    component.set('v.isRequiredOther', false); 
                                } else {
                                    component.set('v.isRequiredOther', true);
                                }
                            }
                            
                            var uwEmpRetItags = ['Employees_in_the_Proposal_','Retirees_in_the_Proposal_'];
                            var isnoOfEmpOrRetValExists = false;
                            for(var m=0; m<uwEmpRetItags.length; m++) {
                                var uwItag = uwEmpRetItags[m]+'CI_AP_HI__c';
                                if(component.find(uwItag) != undefined && component.find(uwItag) != null && isnoOfEmpOrRetValExists == false) {
                                    var noOfEmpOrRet = component.find(uwItag).get("v.value");
                                    if(noOfEmpOrRet != undefined && noOfEmpOrRet != null && noOfEmpOrRet > 0) {
                                        component.set('v.isRequiredOther1', false);
                                        isnoOfEmpOrRetValExists = true;
                                    } else {
                                        component.set('v.isRequiredOther1', true);
                                    }
                                } else {
                                    if(isnoOfEmpOrRetValExists == false) { 
                                   		component.set('v.isRequiredOther1', true);
                                    }
                                }
                            }
                            if(oppDataObj['CI_AP_HII__c'] != undefined && oppDataObj['CI_AP_HII__c'] != null) { 
                                oppDataObj['CI_AP_HII__c'] = true;
                            }
                            if(uwEngNotNeededval) {
                                component.set('v.isRequiredOther', false); 
                                component.set('v.isRequiredOther1', false);
                                if(oppDataObj['CI_AP_HII__c'] != undefined && oppDataObj['CI_AP_HII__c'] != null) {
                                    oppDataObj['CI_AP_HII__c'] = false; 
                                }
                            }
                        /*} else {
                            
                            component.set('v.isRequiredOther', false); 
                            component.set('v.isRequiredOther1', false);
                            if(oppDataObj['CI_AP_HII__c'] != undefined && oppDataObj['CI_AP_HII__c'] != null) {
                                oppDataObj['CI_AP_HII__c'] = false; 
                            }
                        }*/
                        
                    } else {
                        
                        component.set('v.isRequiredOther', false); 
                        component.set('v.isRequiredOther1', false);
                        if(oppDataObj['CI_AP_HII__c'] != undefined && oppDataObj['CI_AP_HII__c'] != null) {
                        	oppDataObj['CI_AP_HII__c'] = false;   
                        }
                        component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i], false);
                        component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i]+'1', false);
                        var fieldsToBeHidden = component.find(productsInvolvedInOppOrRiskValues[i]+'_UW');
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
                    }
                    component.set('v.OpportunityData', oppDataObj);
                } else {
                    salesStageVal = component.find('Sales_Stage_'+productsInvolvedInOppOrRiskValues[i]+'__c').get('v.value');
                    if(salesStageVal != undefined && salesStageVal != null && salesStageVal == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                        isToBeSkipped = false;
                        var fieldsToBeShown = component.find(productsInvolvedInOppOrRiskValues[i]+'_UW');
                        if(fieldsToBeShown != null && fieldsToBeShown != undefined) {
                            if(Array.isArray(fieldsToBeShown)) {
                                for(var k=0; k<fieldsToBeShown.length; k++) {
                                    $A.util.removeClass(fieldsToBeShown[k], "slds-hide");    
                                }
                            } else {
                                $A.util.removeClass(fieldsToBeShown, "slds-hide");    
                            }
                        }
                        var uwEngNotNeededItag = 'U_W_Engagement_not_yet_Needed_'+productsInvolvedInOppOrRiskValues[i]+'__c';
                        var uwEngNotNeededval;
                        if(component.find(uwEngNotNeededItag) != undefined && component.find(uwEngNotNeededItag) != null) {
                            uwEngNotNeededval = component.find(uwEngNotNeededItag).get('v.value');
                        }
                        uwEngNotNeededval = (uwEngNotNeededval != undefined && uwEngNotNeededval != null) ? uwEngNotNeededval : false;
                        
                        if(uwEngNotNeededval != undefined && uwEngNotNeededval != null && uwEngNotNeededval) {
                            component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i], false);
                        	component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i]+'1', false);
                        } else {
                            
                            var isDateTheQuoteNeededItag = 'Date_the_'+productsInvolvedInOppOrRiskValues[i]+'_Quote_is_Needed_from_UW__c';
                            var isDateTheQuoteNeededComp = component.find(isDateTheQuoteNeededItag);
                            if(isDateTheQuoteNeededComp != undefined && isDateTheQuoteNeededComp != null) {
                               var isDateTheQuoteNeededVal = isDateTheQuoteNeededComp.get('v.value');
                               if(isDateTheQuoteNeededVal != undefined && isDateTheQuoteNeededVal != null && isDateTheQuoteNeededVal != "") {
									component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i], false); 
                               } else {
                               		component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i], true); 
                               }
                            }
                            
                            var uwEmpRetItags = ['Employees_in_the_Proposal_','Retirees_in_the_Proposal_'];
                            var isnoOfEmpOrRetValExists = false;
                            for(var m=0; m<uwEmpRetItags.length; m++) {
                                var uwItag = uwEmpRetItags[m]+productsInvolvedInOppOrRiskValues[i]+'__c';
                                if(component.find(uwItag) != undefined && component.find(uwItag) != null && isnoOfEmpOrRetValExists == false) {
                                    var noOfEmpOrRet = component.find(uwItag).get("v.value");
                                    if(noOfEmpOrRet != undefined && noOfEmpOrRet != null && noOfEmpOrRet > 0) {
                                        component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i]+'1', false);
                                        isnoOfEmpOrRetValExists = true;
                                    } else {
                                        component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i]+'1', true);
                                    }
                                } else {
                                    if(isnoOfEmpOrRetValExists == false) {
                                    	component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i]+'1', true);
                                    }
                                }
                            }
                        }
                    } else {
                        component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i], false);
                        component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i]+'1', false);
                        var fieldsToBeHidden = component.find(productsInvolvedInOppOrRiskValues[i]+'_UW');
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
                    }
                }
            }
        }
        
        if(isToBeSkipped) {
            
            component.set('v.SkippedScreensFlag.Screen'+(previousPageNo+1), true);
            currentPageNo = previousPageNo + 2;
            
            if(component.find('Does_this_Oppty_Risk_Involve_Consultant__c') != undefined && 
               		component.find('Does_this_Oppty_Risk_Involve_Consultant__c') != null) { 
            
                if(component.find('Does_this_Oppty_Risk_Involve_Consultant__c').get('v.value') == 'No' || 
                  		component.find('Does_this_Oppty_Risk_Involve_Consultant__c').get('v.value') == 'TBD') {
                    
                     /*
                      * Screen 8 will be skipped if the value of Does this Oppty/Risk Involve Consultants is NO/TBD for the Opportunity record.
                      */
                    if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null && 
                       		component.find("kanbanSteps")[currentPageNo] != undefined && component.find("kanbanSteps")[currentPageNo] != null) {
                        $A.util.addClass(component.find("kanbanSteps")[currentPageNo], "slds-red");    
                    }

                                        
                } else if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Yes') {
                    
                    /*
                      * Screen 8 will be shown if the value of Does this Oppty/Risk Involve Consultants is YES for the Opportunity record.
                      */
                    if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null && 
                       		component.find("kanbanSteps")[currentPageNo] != undefined && component.find("kanbanSteps")[currentPageNo] != null) {
                        $A.util.removeClass(component.find("kanbanSteps")[currentPageNo], "slds-red");    
                    }
                }                
            } 
            
            /*
             * Screen 6 will be skipped as based on the businees logic implemented above
             */
            if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null && 
               	component.find("kanbanSteps")[currentPageNo-2] != undefined && component.find("kanbanSteps")[currentPageNo-2] != null) {
                $A.util.addClass(component.find("kanbanSteps")[currentPageNo-2], "slds-red");    
            } 
            
            /* 
			 * Clear Screen 6 (Underwriting Engagement for Specialty Benefits Products') Fields - START               
			 */
                        
            var oppDataObj = component.get('v.OpportunityData');
            var screen6FieldsTobeSkipped = $A.get("$Label.c.Screen6_Fields_CM");
            
            if(screen6FieldsTobeSkipped != undefined && screen6FieldsTobeSkipped !=null) {
                this.clearsTheScreenFieldValues(component, event, screen6FieldsTobeSkipped, oppDataObj);
                component.set('v.OpportunityData', oppDataObj);
            }
                        
            /* 
             * Clear Screen 6 (Underwriting Engagement for Specialty Benefits Products') Fields - END               
             */
            
        } else {

			currentPageNo = previousPageNo + 1; 
            component.set('v.SkippedScreensFlag.Screen'+currentPageNo, false);
            
            /*
             * Screen 6 will be shown as based on the businees logic implemented above
             */
            if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null && 
               	component.find("kanbanSteps")[previousPageNo] != undefined && component.find("kanbanSteps")[previousPageNo] != null) {
                $A.util.removeClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
            }            
        }
        
        component.set('v.NavigationPages.Page', currentPageNo);
        $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
        $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
        this.updateKanbanBranchingProgression(component, event, currentPageNo);
        
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
    },
    
    clearsTheScreenFieldValues : function(component, event, screenFieldsTobeSkipped, oppDataObj) {
        
        var screenFieldsTobeSkippedArray = screenFieldsTobeSkipped.split(',');
        if(screenFieldsTobeSkippedArray != undefined && screenFieldsTobeSkippedArray != null && 
           screenFieldsTobeSkippedArray.length > 0) {
            
            for(var i in screenFieldsTobeSkippedArray) {
                
                var componentItag = component.find(screenFieldsTobeSkippedArray[i]);
                if(componentItag != undefined && componentItag != null) {
                    componentItag.set('v.value', ''); 
                    oppDataObj[screenFieldsTobeSkippedArray[i]] = ''
                }
            }
        }
        
    },
    
    updateInScreen2 : function(component, event, currentPageNo, isprevPage) {
        
        var pdtsInvInOpp = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
        if(pdtsInvInOpp != undefined && pdtsInvInOpp != null && pdtsInvInOpp.length > 0) {
            
            var isExistingMemAtRiskFlag = false;
            var hasValue = false;
            for(var i=0; i<pdtsInvInOpp.length; i++) {
                var productType = '';
                if(pdtsInvInOpp[i] == 'Other Buy Up Programs') {
                    productType = 'Other';
                } else {
                    productType = pdtsInvInOpp[i];
                }
                var salesStageItag = 'Sales_Stage_'+productType+'__c';
                var salesStageVal = component.find(salesStageItag).get("v.value");
                if(salesStageVal != undefined && salesStageVal != null && salesStageVal != '') {
                    hasValue = true;
                    if(salesStageVal == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                        isExistingMemAtRiskFlag = true;
                        component.set('v.isRequiredFields.'+productType, true);
                    } else {
                        component.set('v.isRequiredFields.'+productType, false);
                    }
                }
            }   
            
            if(hasValue) {
                if(isExistingMemAtRiskFlag != undefined && isExistingMemAtRiskFlag != null && isExistingMemAtRiskFlag) {
                    component.set('v.isExistingMemAtRiskFlag', true);
                    component.find('Is_There_Existing_Membership_at_Risk__c').set('v.value', 'Yes');
                    $A.util.removeClass(component.find("kanbanSteps")[currentPageNo], "slds-red");
                } else {
                    component.set('v.isExistingMemAtRiskFlag', false);
                    if(isprevPage != undefined && isprevPage != null && isprevPage == false) {
                        component.find('Is_There_Existing_Membership_at_Risk__c').set('v.value', '');
                        $A.util.removeClass(component.find("kanbanSteps")[currentPageNo], "slds-red");
                    }                     
                    //$A.util.addClass(component.find("kanbanSteps")[currentPageNo], "slds-red");
                }
            } else {
                component.set('v.isExistingMemAtRiskFlag', false);
                component.find('Is_There_Existing_Membership_at_Risk__c').set('v.value', '');
                $A.util.removeClass(component.find("kanbanSteps")[currentPageNo], "slds-red");
            }
        }
    }
    
})