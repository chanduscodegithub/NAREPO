({
    doInit : function(component, event, helper) {
        
        //console.log('doInit QA');
        if(component.find("kanbanSteps") != null) {
            $A.util.addClass(component.find("kanbanSteps")[0], "slds-is-active");   
        }
        component.set('v.isOpp',component.get('v.Child_Data.isOpp'));
        var accountName = component.get('v.Child_Data.accountName');
        var recordTypeId = component.get('v.Child_Data.recordTypeId');
        //component.set('v.ProductsInvolvedInOppFlags', {'isMedical':false,'isPharmacy':false,'isDental':false,'isVision':false,'isOther':false});
        component.set('v.NavigationPages', {'Page': 1,'LastPage':10,'PageA1': 1,'LastPageA1':2,'Page5A': 1,'LastPage5A':4});
        component.set('v.SkippedScreensFlag', {'Screen6': false});
        component.set('v.isRequiredFields', {'Medical':false,'Pharmacy':false,'Dental':false,'Vision':false,'Other':false});
        component.set('v.ProductNavigationPages', {});
        component.set('v.stepwiseProductsFlag', {'Other':false});
        component.set('v.PrevSalesStages', {'Sales_Stage_Medical__c':'','Sales_Stage_Pharmacy__c':'','Sales_Stage_Dental__c':'','Sales_Stage_Vision__c':'','Sales_Stage_Other__c':''});
        
        var oppCategory = component.get('v.Child_Data.category');
        if(oppCategory == $A.get("$Label.c.Client_Management")) {
            component.set('v.maType', 'NBEA');
        }
        
        var category = component.get('v.Child_Data.category');
        var accountTypeAction = component.get('c.getAccountRelatedOpportunityDetails');	
        accountTypeAction.setParams({
            "accountId" : component.get('v.Child_Data.accountId'),
            "category" : category
        });
        accountTypeAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseObj = response.getReturnValue();
                component.set('v.OpportunityData', responseObj.opportunityData);
                component.set('v.OpportunityData.AccountName', accountName);
                component.set('v.OpportunityData.RecordTypeId', recordTypeId);
                component.set('v.MandatoryFieldsMap', responseObj.mandatoryFieldsMap);
                component.set('v.PicklistFieldsItags', responseObj.picklistFieldsItagsList);
                component.set('v.ConditionallyMandatoryFieldsMap', responseObj.conditionallyMandatoryFieldsMap);
                console.log('11111 = '+component.get('v.MandatoryFieldsMap'));
                /*
                 * The below logic sets the options for the SF Picklist fields dynamically.
                 * The SF Picklist fields is shown as SelectDropdown, CheckboxGroup, RadioButtonGroup ...
                 */  
                var picklistFieldsMap = responseObj.picklistFieldsMap;
                if(picklistFieldsMap != undefined && picklistFieldsMap != null) {
                    for(var i in picklistFieldsMap) {
                        var picklistValuesArray = [];
                        if(component.find(i) != undefined && component.find(i) != null && 
                           component.find(i).get('v.multiple') == false) {
                            picklistValuesArray.push({label:'', value:''});    
                        }
                        var picklistValues = picklistFieldsMap[i];
                        if(picklistValues != undefined && picklistValues != null && picklistValues.length > 0) {
                            for(var j=0; j<picklistValues.length; j++) {
                                picklistValuesArray.push({label:picklistValues[j], value:picklistValues[j]});
                            }
                        }
                        if(component.find(i) != null) {
                            if(component.find(i).get('v.Name') == 'dualListBox') {
                                component.set("v.dualListBoxOptions", picklistValuesArray); 
                            } else {
                                component.find(i).set("v.options", picklistValuesArray); 
                            }                              
                        }
                    }    
                }
                
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });        
        $A.enqueueAction(accountTypeAction);
    },
    
    handleChange : function (component, event, helper) {
        component.find(event.getSource().getLocalId()).set("v.value", event.getParam("value"));
        component.set('v.OpportunityData.'+event.getSource().getLocalId(), event.getParam("value"));
    },
    //Added - 3873
    handleLeadSourceChange : function(component, event, helper) {
        var leadSource = component.get("v.OpportunityData.Lead_Source__c");
        if(leadSource === "Direct Marketing Initiated") {
            component.set("v.DirectMarketing", true);
        } else {
            component.set("v.DirectMarketing", false);
        }
    },
    handleChangeForRadioButtonGroup : function (component, event, helper) {

        component.find(event.getSource().getLocalId()).set("v.value", event.getParam("value"));
        component.set('v.OpportunityData.'+event.getSource().getLocalId(), event.getParam("value"));
        var compObj = component.get('v.OpportunityData.'+event.getSource().getLocalId());
        if(compObj != undefined && compObj != null && Array.isArray(compObj)) {
            var value = '';
            if(compObj.length > 0) {
                value = compObj[0]; 
            }
            component.set('v.OpportunityData.'+event.getSource().getLocalId(), value);
        }

        var previousPageNo = component.get("v.NavigationPages.Page");
        previousPageNo = (previousPageNo != undefined || previousPageNo != null) ? previousPageNo : 0;

        if(previousPageNo == 2) {
            
            var isThereExistingMemAtRiskVal = event.getParam("value");
            if(isThereExistingMemAtRiskVal != undefined && isThereExistingMemAtRiskVal != null) {
                
                if(isThereExistingMemAtRiskVal == 'Yes') {
                    $A.util.removeClass(component.find("kanbanSteps")[previousPageNo], "slds-red");
                } else if(isThereExistingMemAtRiskVal == 'No') {
                    $A.util.addClass(component.find("kanbanSteps")[previousPageNo], "slds-red");
                }
            }
        }
    },
    
    onChangeOfUWDateTheQuoteNeededVal : function (component, event, helper) {
       
		var underWritingRelatedProductTypes = ['Dental','Vision','CI_APP_HIPP'];
        var dateTheQuoteNeededUWItag = event.getSource().getLocalId();
        dateTheQuoteNeededUWItag = (dateTheQuoteNeededUWItag != undefined && dateTheQuoteNeededUWItag != null) ? dateTheQuoteNeededUWItag : '';
        var productType = '';
        var pdtType = '';
        var updatedMandatoryEmptyFieldsArray = [];
        
        for(var i=0; i<underWritingRelatedProductTypes.length; i++) {
            if(dateTheQuoteNeededUWItag.indexOf(underWritingRelatedProductTypes[i]) > -1) {
                if(underWritingRelatedProductTypes[i] == 'CI_APP_HIPP') {
                    productType = 'Other';
                } else {
                    productType = underWritingRelatedProductTypes[i];
                    pdtType = underWritingRelatedProductTypes[i];
                }
                break;
            }
        }
        
        //var isValid = false;
        if(component.find(dateTheQuoteNeededUWItag) != undefined && component.find(dateTheQuoteNeededUWItag) != null) {
        	var dateTheQuoteNeededUWVal = component.find(dateTheQuoteNeededUWItag).get("v.value");
            if(dateTheQuoteNeededUWVal != undefined && dateTheQuoteNeededUWVal != null && dateTheQuoteNeededUWVal != '') {
                component.set('v.isRequired'+productType, false);
                $A.util.removeClass(component.find(dateTheQuoteNeededUWItag+'Div'), "slds-has-error");
                $A.util.addClass(component.find(dateTheQuoteNeededUWItag+'Div1'), "slds-hide");
                helper.validateDateFieldValues(component, event, dateTheQuoteNeededUWVal);
                
                var mandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                if(mandatoryEmptyFieldsArray != undefined && mandatoryEmptyFieldsArray != null) { 
                    for(var i=0; i<mandatoryEmptyFieldsArray.length; i++) {
                        if(mandatoryEmptyFieldsArray[i].Itag.indexOf(dateTheQuoteNeededUWItag) < 0) {
                            updatedMandatoryEmptyFieldsArray.push(mandatoryEmptyFieldsArray[i]);
                        }
                    }
                    component.set('v.MandatoryEmptyFieldsArray', updatedMandatoryEmptyFieldsArray);
                    if(updatedMandatoryEmptyFieldsArray != undefined && updatedMandatoryEmptyFieldsArray != null && 
                       		updatedMandatoryEmptyFieldsArray.length == 0) {
                        $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
                    }
                }
                
            } else {
                component.set('v.isRequired'+productType, true);
            }
        }
        
    },
    
    onChangeOfEmpOrRetInProposalValues : function(component, event, helper) { 
        
        var underWritingRelatedProductTypes = ['Dental','Vision','CI_AP_HI'];
        var empOrRetInProposalItag = event.getSource().getLocalId();
        empOrRetInProposalItag = (empOrRetInProposalItag != undefined && empOrRetInProposalItag != null) ? empOrRetInProposalItag : '';
        var empOrRetInProposalVal = component.find(event.getSource().getLocalId()).get("v.value");
        var productType = '';
        var pdtType = '';
        var underWritingRelatedItags = ['Employees_in_the_Proposal_','Retirees_in_the_Proposal_'];
        
        for(var i=0; i<underWritingRelatedProductTypes.length; i++) {
            if(empOrRetInProposalItag.indexOf(underWritingRelatedProductTypes[i]) > -1) {
                if(underWritingRelatedProductTypes[i] == 'CI_AP_HI') {
                    productType = 'Other';
                    pdtType = 'CI_AP_HI';
                } else {
                    productType = underWritingRelatedProductTypes[i];
                    pdtType = underWritingRelatedProductTypes[i];
                }
                break;
            }
        }

        
        if(empOrRetInProposalVal != undefined && empOrRetInProposalVal != null && empOrRetInProposalVal >= 0) {
            component.set('v.isRequired'+productType+'1', false);
            
            var updatedMandatoryEmptyFieldsArray = [];
            for(var i=0; i<underWritingRelatedItags.length; i++) {
               var uwItag = underWritingRelatedItags[i]+pdtType+'__c';
               $A.util.removeClass(component.find(uwItag+'Div'), "slds-has-error");
               $A.util.addClass(component.find(uwItag+'Div1'), "slds-hide");
            }
            
            var mandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
            if(mandatoryEmptyFieldsArray != undefined && mandatoryEmptyFieldsArray != null) { 
                for(var i=0; i<mandatoryEmptyFieldsArray.length; i++) {
                    var isToBeSkippped = false;
                    for(var j=0; j<underWritingRelatedItags.length; j++) {
                        var uwItag = underWritingRelatedItags[j]+pdtType+'__c';
                        if(mandatoryEmptyFieldsArray[i].Itag.indexOf(uwItag) > -1) {
                            $A.util.removeClass(component.find(uwItag+'Div'), "slds-has-error");
                            $A.util.addClass(component.find(uwItag+'Div1'), "slds-hide");
                            isToBeSkippped = true;
                        }
                    }
                    if(isToBeSkippped == false) {
                        updatedMandatoryEmptyFieldsArray.push(mandatoryEmptyFieldsArray[i]);
                    }
                }
            }
            component.set('v.MandatoryEmptyFieldsArray', updatedMandatoryEmptyFieldsArray);
            if(updatedMandatoryEmptyFieldsArray != undefined && updatedMandatoryEmptyFieldsArray != null && 
               		updatedMandatoryEmptyFieldsArray.length == 0) {
                $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
            }
            
        } else {
            var uwEngNotNeededItag = '';
            if(productType == 'Other') {
                uwEngNotNeededItag = 'U_W_Engagement_not_yet_Needed_CI_APP_HI__c';
            } else {
                uwEngNotNeededItag = 'U_W_Engagement_not_yet_Needed_'+productType+'__c';
            }
            var uwEngNotNeededval = '';
            if(component.find(uwEngNotNeededItag) != undefined && component.find(uwEngNotNeededItag) != null) {
                uwEngNotNeededval = component.find(uwEngNotNeededItag).get('v.value');
            }
            
            if(uwEngNotNeededval != undefined && uwEngNotNeededval != null && uwEngNotNeededval) {
            	component.set('v.isRequired'+productType+'1', false); 
            } else {
            	component.set('v.isRequired'+productType+'1', true); 
            }
        }
        
    },
    
    onChangeUWEngageVal : function(component, event, helper) {
        
        var productType = '';
        var pdtType = '';
        var pdtTypetoBeRemoved = '';
        var underWritingRelatedProductTypes = ['Dental','Vision','CI_APP_HI'];
        var underWritingRelatedItags = ['Employees_in_the_Proposal_','Retirees_in_the_Proposal_','Date_the_Dental_Quote_is_Needed_from_UW__c'];
        var uwEngagementItagVal = component.find(event.getSource().getLocalId()).get("v.value");
        var updatedMandatoryEmptyFieldsArray = [];
        var isStepWisePdtFlag = component.get('v.stepwiseProductsFlag.Other');
        isStepWisePdtFlag = (isStepWisePdtFlag != undefined && isStepWisePdtFlag != null) ? isStepWisePdtFlag : false;
        
        if(event.getSource().getLocalId() != null && event.getSource().getLocalId() != undefined) {
            for(var i=0; i<underWritingRelatedProductTypes.length; i++) {
                if(event.getSource().getLocalId().indexOf(underWritingRelatedProductTypes[i]) > -1) {
                    if(underWritingRelatedProductTypes[i] == 'CI_APP_HI') {
                        productType = 'Other';
                        pdtType = 'CI_AP_HI';
                        pdtTypetoBeRemoved = 'CI_AP';
                    } else {
                        productType = underWritingRelatedProductTypes[i];
                        pdtType = underWritingRelatedProductTypes[i];
                        pdtTypetoBeRemoved = underWritingRelatedProductTypes[i];
                    }
                    break;
                }
            }
        }
        if(uwEngagementItagVal != undefined && uwEngagementItagVal != null) {
            if(uwEngagementItagVal) {
                
                var mandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                if(mandatoryEmptyFieldsArray != undefined && mandatoryEmptyFieldsArray != null) { 
                    for(var i=0; i<mandatoryEmptyFieldsArray.length; i++) {
                        if(mandatoryEmptyFieldsArray[i].Itag.indexOf(pdtTypetoBeRemoved) < 0) {
                            updatedMandatoryEmptyFieldsArray.push(mandatoryEmptyFieldsArray[i]);
                        }
                    }
                }
                
                if(underWritingRelatedItags != undefined && underWritingRelatedItags != null) { 
                    for(var i=0; i<underWritingRelatedItags.length; i++) {
                        var uwItag = '';
                        if(i==2) {
                            if(productType == 'Other') {
                                uwItag = 'Date_the_CI_APP_HIPP_Quote_is_Needed__c';
                            } else {
                            	uwItag = underWritingRelatedItags[i].replace('Dental',productType);   
                            }
                        } else {
                        	uwItag = underWritingRelatedItags[i]+pdtType+'__c';
                        }
                        if(uwItag != undefined && uwItag != null && component.find(uwItag) != null) {
                            $A.util.removeClass(component.find(uwItag+'Div'), "slds-has-error");
                            $A.util.addClass(component.find(uwItag+'Div1'), "slds-hide");
                        }
                    }
                }
                
                if(updatedMandatoryEmptyFieldsArray != undefined && updatedMandatoryEmptyFieldsArray != null && 
                   updatedMandatoryEmptyFieldsArray.length == 0) {
                    $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
                }
                
                component.set('v.MandatoryEmptyFieldsArray', updatedMandatoryEmptyFieldsArray);
                component.set('v.isRequired'+productType, false);
                component.set('v.isRequired'+productType+'1', false);
            } else {
                if(productType == 'Other') {
                    if(isStepWisePdtFlag) {
                      component.set('v.isRequired'+productType, true);
                      component.set('v.isRequired'+productType+'1', true);
                    }   	 
                } else {
                	component.set('v.isRequired'+productType, true);
                    component.set('v.isRequired'+productType+'1', true);
                }
            }
        }
    },
    
    onChangeOfDate : function (component, event, helper) {
        
        var selectedDate = component.find(event.getSource().getLocalId()).get("v.value");
        if(selectedDate == undefined || selectedDate == null) {
            return false;
        }  else {
            helper.validateDateFieldValues(component, event, selectedDate);
        }
    },
    
    onChangeOfSalesStage : function(component, event, helper) {
        
        component.set('v.PrevSalesStages.'+event.getSource().getLocalId(), component.get('v.OpportunityData.'+event.getSource().getLocalId()));
        component.set('v.OpportunityData.'+event.getSource().getLocalId(), component.find(event.getSource().getLocalId()).get("v.value"));
        
        var currentPageNo = component.get("v.NavigationPages.Page");
        helper.updateInScreen2(component, event, currentPageNo, false);
    },
    
    nextPage : function(component, event, helper) { 

        var previousPageNo = component.get("v.NavigationPages.Page");
        var isMandatoryFieldsValuesAvailable = false;
        var mandatoryFieldsJSONMap = null;
        
        if(component.get('v.MandatoryFieldsMap') != null && component.get('v.MandatoryFieldsMap') != '') {
            mandatoryFieldsJSONMap = JSON.parse(component.get('v.MandatoryFieldsMap'));    
        }
        
        if(previousPageNo != null) {
            
            if(mandatoryFieldsJSONMap != null) {
                
                var prevMandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                
                var mandatoryFieldsJSONMap1 = mandatoryFieldsJSONMap[previousPageNo];
                /*if(previousPageNo == 1) {
                    var genInfoPrevPgNo = component.get('v.NavigationPages.PageA'+previousPageNo);
                    if(genInfoPrevPgNo != null) {
                        mandatoryFieldsJSONMap1 = mandatoryFieldsJSONMap["A"+genInfoPrevPgNo];
                    }
                } else {
                    
                    if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == undefined ||
                       		component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == null ||
                       			component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == '' ||
                          			component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Yes') {
                        
                        if(mandatoryFieldsJSONMap[previousPageNo] != null) {
                            mandatoryFieldsJSONMap1 = mandatoryFieldsJSONMap[previousPageNo];
                        }
                    }
                    
                    var conditionallyMandatoryFieldsJSONMap;
                    var conditionallyMandatoryFieldsJSONMap1;
                    if(component.get('v.ConditionallyMandatoryFieldsMap') != null && 
                       component.get('v.ConditionallyMandatoryFieldsMap') != '') {
                        conditionallyMandatoryFieldsJSONMap = JSON.parse(component.get('v.ConditionallyMandatoryFieldsMap'));    
                    }
                    if(conditionallyMandatoryFieldsJSONMap[previousPageNo] != null) {
                        conditionallyMandatoryFieldsJSONMap1 =  conditionallyMandatoryFieldsJSONMap[previousPageNo]; 
                    }
                }*/
                /*if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == undefined ||
                   component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == null ||
                   component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == '' ||
                   component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Yes') {
                    
                    if(mandatoryFieldsJSONMap[previousPageNo] != null) {
                        mandatoryFieldsJSONMap1 = mandatoryFieldsJSONMap[previousPageNo];
                    }
                }
                
                if(previousPageNo == 9) {
                    mandatoryFieldsJSONMap1 = mandatoryFieldsJSONMap[previousPageNo];
                }*/
                
                var conditionallyMandatoryFieldsJSONMap;
                var conditionallyMandatoryFieldsJSONMap1;
                if(component.get('v.ConditionallyMandatoryFieldsMap') != null && 
                   component.get('v.ConditionallyMandatoryFieldsMap') != '') {
                    conditionallyMandatoryFieldsJSONMap = JSON.parse(component.get('v.ConditionallyMandatoryFieldsMap'));    
                }
                if(conditionallyMandatoryFieldsJSONMap[previousPageNo] != null) {
                    conditionallyMandatoryFieldsJSONMap1 =  conditionallyMandatoryFieldsJSONMap[previousPageNo]; 
                }
                
                helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
                isMandatoryFieldsValuesAvailable = helper.checkForMandatoryFields(component,event,mandatoryFieldsJSONMap1, conditionallyMandatoryFieldsJSONMap1);   
                //Addedc -3873
            var isDirectMarketing = component.get("v.DirectMarketing");
            var directMarketingInitiator = component.get("v.OpportunityData.Direct_Marketing_Initiator__c");
            if (isDirectMarketing && (!directMarketingInitiator || directMarketingInitiator.trim() === '')) {
                $A.util.addClass(component.find("Direct_Marketing_Initiator__cDiv"), "slds-has-error");
                var errorDiv = component.find("Direct_Marketing_Initiator__cDiv1");
                if (errorDiv) {
                    $A.util.removeClass(errorDiv, "slds-hide");
                     $A.util.removeClass(component.find("errorToastMessage"), "slds-hide");
                }
                return;
            }else{
                var errorDiv = component.find("Direct_Marketing_Initiator__cDiv1");
                if (errorDiv) {
                    $A.util.addClass(errorDiv, "slds-hide");
                }
                $A.util.removeClass(component.find("Direct_Marketing_Initiator__cDiv"), "slds-has-error");
            }
            //Ended -3873
                
                if(previousPageNo == 3) {
                    
                    var emptyItagsArray = [];
                    var fieldsItagsJSONMap = {"Risk_Probability_Medical__c":"Risk Probability (Medical)","Risk_Probability_Pharmacy__c":"Risk Probability (Pharmacy)","Risk_Probability_Dental__c":"Risk Probability (Dental)","Risk_Probability_Vision__c":"Risk Probability (Vision)","Risk_Probability_Other__c":"Risk Probability (Other Buy Up)"};
                    var isMandatoryFieldsValuesAvailable1 = false;
                    var productsInvolvedInOppOrRiskValues = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
                    for(var i=0; i<productsInvolvedInOppOrRiskValues.length; i++) { 
                        var productType = '';
                        var productType = '';
                        if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                            productType = 'Other';
                        } else {
                            productType = productsInvolvedInOppOrRiskValues[i];
                        }
                        var riskProbabilityItag = 'Risk_Probability_'+productType+'__c';
                        var salesStageItag = 'Sales_Stage_'+productType+'__c'; 
                        var salesStageVal = component.find(salesStageItag).get('v.value');
                        if(salesStageVal != undefined && salesStageVal != null && salesStageVal == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                            if(component.find(riskProbabilityItag).get('v.value') == undefined || component.find(riskProbabilityItag).get('v.value') == null || 
                               component.find(riskProbabilityItag).get('v.value') == '') {
                                var obj = {'Name':fieldsItagsJSONMap[riskProbabilityItag],'Itag':riskProbabilityItag};
                                emptyItagsArray.push(obj);
                                isMandatoryFieldsValuesAvailable1 = true;
                            }
                        }
                    }
                    
                    if(isMandatoryFieldsValuesAvailable && isMandatoryFieldsValuesAvailable1) {
                        var mandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                        mandatoryEmptyFieldsArray = mandatoryEmptyFieldsArray.concat(emptyItagsArray);
                        component.set('v.MandatoryEmptyFieldsArray', mandatoryEmptyFieldsArray);
                    } else if(isMandatoryFieldsValuesAvailable == false && isMandatoryFieldsValuesAvailable1) {
                        isMandatoryFieldsValuesAvailable = true;
                        component.set('v.MandatoryEmptyFieldsArray', emptyItagsArray);
                    }
                }
            }
            
            if(isMandatoryFieldsValuesAvailable) {
                
                $A.util.removeClass(component.find("errorToastMessage"), "slds-hide");
                
                var mandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                if(mandatoryEmptyFieldsArray != undefined && mandatoryEmptyFieldsArray != null) {
                    for(var i=0; i<mandatoryEmptyFieldsArray.length; i++) {
                        if(component.find(mandatoryEmptyFieldsArray[i]) != null) {
                            $A.util.addClass(component.find(mandatoryEmptyFieldsArray[i].Itag+'Div'), "slds-has-error");
                            $A.util.removeClass(component.find(mandatoryEmptyFieldsArray[i].Itag+'Div1'), "slds-hide");    
                        }
                    }
                }
                
            } else {
                
                helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
                
                var doesOppInvolveConsultantAuraId = component.find("Does_this_Oppty_Risk_Involve_Consultant__c");
                var doesOppInvolveConsultantVal = '';
                if(doesOppInvolveConsultantAuraId != undefined && doesOppInvolveConsultantAuraId != null) {
                	doesOppInvolveConsultantVal = component.find("Does_this_Oppty_Risk_Involve_Consultant__c").get('v.value');  
                }
                
                var doesOppInvolveExchgsAuraId = component.find("Does_this_Oppty_Risk_Involve_Exchanges__c");
                var doesOppInvolveExchgsVal = '';
                if(doesOppInvolveExchgsAuraId != undefined && doesOppInvolveExchgsAuraId != null) {
                	doesOppInvolveExchgsVal = component.find("Does_this_Oppty_Risk_Involve_Exchanges__c").get('v.value');  
                }
                
                var currentPageNo;
                if(previousPageNo == 1) {
                    
                    /*currentPageNo = previousPageNo;
                    var genInfoCurrentPageNo;
                    var genInfoPrevPageNo = component.get('v.NavigationPages.PageA'+previousPageNo);
                    var genInfoLastPageNo = component.get('v.NavigationPages.LastPageA'+previousPageNo);
                    
                    if(genInfoPrevPageNo != null && genInfoLastPageNo != null) {
                        
                        if(genInfoPrevPageNo < genInfoLastPageNo) {
                            
                            genInfoCurrentPageNo = genInfoPrevPageNo + 1;
                            component.set('v.NavigationPages.PageA'+previousPageNo, genInfoCurrentPageNo);
                            $A.util.addClass(component.find("QAPageA"+genInfoPrevPageNo), "slds-hide");
                            $A.util.removeClass(component.find("QAPageA"+genInfoCurrentPageNo), "slds-hide"); 
                            $A.util.removeClass(component.find("BreadCrumb"+genInfoPrevPageNo), "active");
                            $A.util.addClass(component.find("BreadCrumb"+genInfoCurrentPageNo), "active"); 
                            
                        } else if(genInfoPrevPageNo == genInfoLastPageNo) {
                            
                            /*
                             * 1. Build the Opportunity Name in the format 
                             *   	AccountName - EffectiveDate - ProductsInvolvedInOpportunityOrRisk (Prodcut values seperated by comma)
                             * 2. Based on the selected types of ProductsInvolvedInOpportunityOrRisk - the Sales Stage, Risk Probability 
                             *    & the Anticipated/Actual Close Date fields is displayed on the respected Screens.Based on the deselection of the 
                             *    ProductsInvolvedInOpportunityOrRisk types, the values in these fields will be cleared.
                             *
                            
                            helper.returnTheDetailsToController(component,event);
                            
                            currentPageNo = previousPageNo + 1;
                            component.set('v.NavigationPages.Page', currentPageNo);
                            $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                            $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                        }
                    }*/
                    
                    /*
                    * 1. Build the Opportunity Name in the format 
                    *   	AccountName - EffectiveDate - ProductsInvolvedInOpportunityOrRisk (Prodcut values seperated by comma)
                    * 2. Based on the selected types of ProductsInvolvedInOpportunityOrRisk - the Sales Stage, Risk Probability 
                    *    & the Anticipated/Actual Close Date fields is displayed on the respected Screens.Based on the deselection of the 
                    *    ProductsInvolvedInOpportunityOrRisk types, the values in these fields will be cleared.
                    */
                    
                    helper.returnTheDetailsToController(component,event);
                    helper.updateInScreen2(component, event, previousPageNo+1, true);
                    
                    currentPageNo = previousPageNo + 1;
                    
                    if(component.find('Is_There_Existing_Membership_at_Risk__c') != undefined && 
                    		component.find('Is_There_Existing_Membership_at_Risk__c') != null &&
                    			component.find('Is_There_Existing_Membership_at_Risk__c').get('v.value') == 'No') { 
                        
                        if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[currentPageNo] != undefined &&
                           component.find("kanbanSteps")[currentPageNo] != null) {
                            $A.util.addClass(component.find("kanbanSteps")[currentPageNo], "slds-red");    
                        }
                        
                    }
                    
                    component.set('v.NavigationPages.Page', currentPageNo);
                    $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                    $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                    helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                    
                } else if(previousPageNo == 2) {
                    
                    /*var isEmergingRiskAvailable = false;
                    var productsInvolvedInOppOrRiskValues = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
                   	var productTypeValues = '';
                    for(var i=0; i<productsInvolvedInOppOrRiskValues.length; i++) {
                        var productType = '';
                        if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                            productType = 'Other';
                        } else {
                            productType = productsInvolvedInOppOrRiskValues[i];
                        }
                        var salesStageItag = 'Sales_Stage_'+productType+'__c';
                        var salesStageVal = component.find(salesStageItag).get('v.value');
                        if(salesStageVal != undefined && salesStageVal != null && salesStageVal == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                            isEmergingRiskAvailable = true;
                            component.set('v.isRequiredFields.'+productType, true);
                            if(productTypeValues.length == 0) {
                                productTypeValues = productType;
                            } else {
                                productTypeValues = productTypeValues+','+productType; 
                            }
                        } else {
                            component.set('v.isRequiredFields.'+productType, false);
                        }
                    }*/
                    
                    /*
                     * Screen 3 will be skipped if the value of IsThereExistingMembershipAtRisk is NO for the Opportunity record.
                     */ 
                    if(component.find('Is_There_Existing_Membership_at_Risk__c') != null &&
                       		component.find('Is_There_Existing_Membership_at_Risk__c').get('v.value') == 'No') {
                        
                        /* 
                 		 * Clear Screen 3 (Existing Membership Risk Detail) Fields - START               
                 		 */
                        
                        	var oppDataObj = component.get('v.OpportunityData');
                        	var screen3FieldsTobeSkipped = $A.get("$Label.c.Screen3_Fields_CM");
                        
                            if(screen3FieldsTobeSkipped != undefined && screen3FieldsTobeSkipped !=null) {
                                helper.clearsTheScreenFieldValues(component, event, screen3FieldsTobeSkipped, oppDataObj);
                                component.set('v.OpportunityData', oppDataObj);
                            }
                        
                        /* 
                 		 * Clear Screen 3 (Existing Membership Risk Detail) Fields - END               
                 		 */
                        
                        var isEmergingRiskAvailable = component.get('v.isExistingMemAtRiskFlag');
                        isEmergingRiskAvailable = (isEmergingRiskAvailable != undefined && isEmergingRiskAvailable != null) ? isEmergingRiskAvailable : false;
                        if(isEmergingRiskAvailable == false) {
                            currentPageNo = previousPageNo + 2; 
                            if(component.find("kanbanSteps") != null &&
                               component.find("kanbanSteps")[currentPageNo-2] != null) {
                                $A.util.addClass(component.find("kanbanSteps")[currentPageNo-2], "slds-red");    
                            }
                            component.set('v.NavigationPages.Page', currentPageNo);
                            $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                            $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                            helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                        } else if(isEmergingRiskAvailable == true) {
                            component.set('v.errorMessage', 'Since the Sales Stage for the selected Product Types is/are Emerging Risk\No Upside, please set "Is there Existing Membership at Risk" to YES to navigate to the Screen 3-Existing Membership Risk Information to fill the mandatory Risk Probability fields');
                            component.set('v.errorPopUpTitle', 'Prompt');
                            var confirmCancelForPromptList = component.find('reminderPopUp');
                            for(var i in confirmCancelForPromptList) {
                                $A.util.removeClass(confirmCancelForPromptList[i], 'slds-hide');
                            }
                        }
                        
                    } else {
                        currentPageNo = previousPageNo + 1;
                        component.set('v.NavigationPages.Page', currentPageNo);
                        $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                        $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                        helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                    }
                    
                } else if(previousPageNo == 4) {
                    
                    component.set('v.isProductsAndCompetitorsScreen', true);
                    
                    var navigationPagesJSONObj = component.get('v.ProductNavigationPages');
                    if(navigationPagesJSONObj != undefined && navigationPagesJSONObj != null) {
                        for(var i in navigationPagesJSONObj) {
                            if(component.find(navigationPagesJSONObj[i]+'Products') != undefined && component.find(navigationPagesJSONObj[i]+'Products') != null &&
								$A.util.hasClass(component.find(navigationPagesJSONObj[i]+'Products'), "slds-hide") == false) {
								$A.util.addClass(component.find(navigationPagesJSONObj[i]+'Products'), "slds-hide");   
                            }
                            if(component.find(navigationPagesJSONObj[i]+'BreadCrumb') != undefined && component.find(navigationPagesJSONObj[i]+'BreadCrumb') != null &&
                                $A.util.hasClass(component.find(navigationPagesJSONObj[i]+'BreadCrumb'), "slds-hide")) {
                                $A.util.removeClass(component.find(navigationPagesJSONObj[i]+'BreadCrumb'), "slds-hide");   
                            }
                        }
                    }
                    
                    currentPageNo = previousPageNo + 1;
                    component.set('v.NavigationPages.Page', currentPageNo);
                    $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                    $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                    component.set('v.NavigationPages.Page5A', 1);
                    $A.util.removeClass(component.find(navigationPagesJSONObj[1]+'Products'), "slds-hide");
                    $A.util.removeClass(component.find(navigationPagesJSONObj[1]+'BreadCrumb'), "slds-hide");
                    $A.util.addClass(component.find(navigationPagesJSONObj[1]+"BreadCrumb"), "active");
                    helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                                        
                } else if(previousPageNo == 5) {
                    
                    var navigationPagesJSONObj = component.get('v.ProductNavigationPages');
                    var productNavPageNo = component.get('v.NavigationPages.Page5A');
                    var productNavLastPageNo = component.get('v.NavigationPages.LastPage5A');
                    
                    if(productNavPageNo != null && productNavPageNo != undefined) {
                        
                        var isProductsValidated = true;
                        //var selectedProductType = navigationPagesJSONObj[productNavPageNo];
                        var productsComp = component.find('productsAndCompetitorsAuraId');
                        
                        //selectedProductType = (selectedProductType!= undefined && selectedProductType != null) ? selectedProductType : '';
                        
                        for(var i=0;i<productsComp.length;i++) {
                            var selectedProductType = productsComp[i].get('v.productTypesValues');
                            if(selectedProductType == 'Medical_And_Other_Buy_Up') {
                                selectedProductType = 'MedicalOther';
                            } else if(selectedProductType == 'Other_Buy_Up_Programs') {
                                selectedProductType = 'Other';
                            }
                            if(selectedProductType == navigationPagesJSONObj[productNavPageNo]) {
                                isProductsValidated = productsComp[i].validateRecrodsMethod();
                                break;
                            }
                        }
                        
                        if(isProductsValidated) {
                            if(productNavPageNo < productNavLastPageNo) {
                                $A.util.addClass(component.find(navigationPagesJSONObj[productNavPageNo]+'Products'), "slds-hide");
                                $A.util.removeClass(component.find(navigationPagesJSONObj[(productNavPageNo+1)]+'Products'), "slds-hide");
                                $A.util.removeClass(component.find(navigationPagesJSONObj[productNavPageNo]+"BreadCrumb"), "active");
                                $A.util.addClass(component.find(navigationPagesJSONObj[(productNavPageNo+1)]+"BreadCrumb"), "active");
                                component.set('v.NavigationPages.Page5A', (productNavPageNo+1));
                            } else if(productNavPageNo == productNavLastPageNo) {
                                helper.skipScreen6Data(component, event, currentPageNo, previousPageNo);
                            }
                        }
                    }
                    
                } else if(previousPageNo == 6) {
                    
                    console.log('6');
                    
                    var productsInvolvedInOppOrRiskValues = component.find('Product_Type_Involved_in_Opp__c').get("v.value");
                    var underWritingRelatedProductTypes = ['Dental','Vision','Other Buy Up Programs'];
                    var underWritingRelatedItags = ['Employees in the Proposal;Employees_in_the_Proposal_','Retirees in the Proposal;Retirees_in_the_Proposal_','Date the Dental Quote is Needed from UW;Date_the_Dental_Quote_is_Needed_from_UW'];
                    var validationForUnderWritingRelatedFields = {"Dental":false,"Vision":false,"Other Buy Up Programs":false};
                    var isEngagementNeededFlagsMap = {"Dental":false,"Vision":false,"Other Buy Up Programs":false};
                    
                    var emptyItagsArray = [];
                    var isMandatoryFieldsValuesAvailable = false;
                    
                    for(var i=0; i<productsInvolvedInOppOrRiskValues.length; i++) {
                        
                        var underWritingEngagementProductFlagVal = false;
                        var salesStageItag = ''; 
                        if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                            salesStageItag = 'Sales_Stage_Other__c';
                            underWritingEngagementProductFlagVal = component.get('v.stepwiseProductsFlag.Other');
                        } else {
                            salesStageItag = 'Sales_Stage_'+productsInvolvedInOppOrRiskValues[i]+'__c';
                            underWritingEngagementProductFlagVal = component.get('v.stepwiseProductsFlag.'+productsInvolvedInOppOrRiskValues[i]);
                        }
                        var salesStageVal = component.find(salesStageItag).get('v.value');
                        if(salesStageVal != undefined && salesStageVal != null && salesStageVal == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                            
                            if((productsInvolvedInOppOrRiskValues[i] != 'Other Buy Up Programs') ||
                              		(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs' && 
                                     	underWritingEngagementProductFlagVal != undefined && underWritingEngagementProductFlagVal != null &&
                                     		underWritingEngagementProductFlagVal )) {
                                
                                /*if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                           			productsInvolvedInOppOrRiskValues[i] = 'CI_AP_HI';
                        	  	}*/
                                var isValidationFlag = false;
                                var uwEngagementItag;
                                if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                                    uwEngagementItag = component.find('U_W_Engagement_not_yet_Needed_CI_APP_HI__c');
                                } else {
                                    uwEngagementItag = component.find('U_W_Engagement_not_yet_Needed_'+productsInvolvedInOppOrRiskValues[i]+'__c');
                                }
                                if(uwEngagementItag != undefined && uwEngagementItag != null && 
                                   uwEngagementItag.get('v.value') != null && uwEngagementItag.get('v.value')) {
                                    isEngagementNeededFlagsMap[productsInvolvedInOppOrRiskValues[i]] = true;
                                    if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                                        component.set('v.isRequiredOther', false);
                                    } else {
                                        component.set('v.isRequired'+productsInvolvedInOppOrRiskValues[i], false);
                                    }
                                }
                                if(isEngagementNeededFlagsMap[productsInvolvedInOppOrRiskValues[i]] != undefined &&
                                   isEngagementNeededFlagsMap[productsInvolvedInOppOrRiskValues[i]] != null && 
                                   isEngagementNeededFlagsMap[productsInvolvedInOppOrRiskValues[i]] == false) {
                                    if(underWritingRelatedProductTypes.includes(productsInvolvedInOppOrRiskValues[i])) {
                                        var noOfEmployess = 0;
                                        var noOfRetirees = 0;
                                        for(var j=0; j<underWritingRelatedItags.length; j++) {
                                            var itagArray = underWritingRelatedItags[j].split(';');
                                            var itagVal = '';
                                            var nameVal = '';
                                            if(j == 2) {
                                                if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                                                    itagVal = 'Date_the_CI_APP_HIPP_Quote_is_Needed__c';
                                                    //nameVal = 'Date the CI/APP/HIPP Quote is Needed'; Varun
                                                    nameVal = 'Date the SB-Other Quote is Needed';
                                                } else {
                                                    itagVal =  itagArray[1].replace('Dental', productsInvolvedInOppOrRiskValues[i])+'__c';
                                                    nameVal = itagArray[0].replace('Dental', productsInvolvedInOppOrRiskValues[i]);
                                                }
                                            } else  {
                                                if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') { 
                                                    itagVal = itagArray[1]+'CI_AP_HI__c';
                                                    //nameVal = itagArray[0]+' (CI/AP/HI)'; Varun
                                                    nameVal = itagArray[0]+' (SB-Other)';
                                                } else {
                                                    itagVal = itagArray[1]+productsInvolvedInOppOrRiskValues[i]+'__c';
                                                    nameVal = itagArray[0]+' ('+productsInvolvedInOppOrRiskValues[i]+')'; 
                                                }
                                            }
                                            
                                            var uwFieldComp = component.find(itagVal);
                                            if(uwFieldComp != undefined && uwFieldComp != null) {
                                                var uwFieldVal = uwFieldComp.get('v.value');
                                                if(uwFieldVal == undefined || uwFieldVal == null || 
                                                    	(uwFieldVal != undefined && uwFieldVal != null && (uwFieldVal == '' || uwFieldVal.length == 0))) {
                                                    
                                                    var obj = {Name:nameVal,Itag:itagVal};
                                                    emptyItagsArray.push(obj);
                                                    isMandatoryFieldsValuesAvailable = true;
                                                } else {
                                                    if(j==0) {
                                                        noOfEmployess = component.find(itagVal).get('v.value');
                                                    } else if(j==1) {
                                                        noOfRetirees = noOfEmployess + component.find(itagVal).get('v.value');
                                                    }
                                                }
                                            }
                                        }
                                        
                                        if(isMandatoryFieldsValuesAvailable) {
                                            var indexToBeRemoved;
                                            var itag = '';
                                            if(noOfEmployess <=0 && noOfRetirees > 0) {
                                                if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                                                	itag = 'Employees_in_the_Proposal_CI_AP_HI__c';
                                                } else {
                                                    itag = 'Employees_in_the_Proposal_'+productsInvolvedInOppOrRiskValues[i]+'__c';
                                                }
                                            } else if(noOfRetirees <=0 && noOfEmployess > 0) {
                                                if(productsInvolvedInOppOrRiskValues[i] == 'Other Buy Up Programs') {
                                                    itag = 'Retirees_in_the_Proposal_CI_AP_HI__c';
                                                } else {
                                                    itag = 'Retirees_in_the_Proposal_'+productsInvolvedInOppOrRiskValues[i]+'__c';
                                                }
                                            }
                                            for(var k=0; k<emptyItagsArray.length; k++) {
                                                if(itag == emptyItagsArray[k].Itag) {
                                                    indexToBeRemoved = k;
                                                }
                                            }
                                            if(indexToBeRemoved != undefined && indexToBeRemoved != null && indexToBeRemoved > -1) {
                                                emptyItagsArray.splice(indexToBeRemoved,1);
                                            }
                                            indexToBeRemoved = null;
                                        }
                                        
                                        if(isMandatoryFieldsValuesAvailable == false) {
                                            
                                            if(noOfRetirees <= 0) {
                                                isValidationFlag = true;
                                            }
                                            validationForUnderWritingRelatedFields[productsInvolvedInOppOrRiskValues[i]] = isValidationFlag;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    if(emptyItagsArray == undefined || emptyItagsArray == null ||
                        	(emptyItagsArray != undefined && emptyItagsArray != null && emptyItagsArray.length == 0)) {
                        isMandatoryFieldsValuesAvailable = false;
                    }
                    if(isMandatoryFieldsValuesAvailable) {
                        $A.util.removeClass(component.find("errorToastMessage"), "slds-hide");
                        if(emptyItagsArray != undefined && emptyItagsArray != null) {
                            component.set('v.MandatoryEmptyFieldsArray', emptyItagsArray);
                            for(var i=0; i<emptyItagsArray.length; i++) {
                                if(component.find(emptyItagsArray[i]) != null) {
                                    $A.util.addClass(component.find(emptyItagsArray[i].Itag+'Div'), "slds-has-error");
                                    $A.util.removeClass(component.find(emptyItagsArray[i].Itag+'Div1'), "slds-hide");    
                                }
                            }
                        }
                        
                    } else {
                        
                        var nextPage = true;
                        var productTypeValues = '';
                        for(var k=0; k<underWritingRelatedProductTypes.length; k++) {
                            if(isEngagementNeededFlagsMap[underWritingRelatedProductTypes[k]] != null && 
                               isEngagementNeededFlagsMap[underWritingRelatedProductTypes[k]] == false) {
                                if(validationForUnderWritingRelatedFields[underWritingRelatedProductTypes[k]] != null && 
                                   validationForUnderWritingRelatedFields[underWritingRelatedProductTypes[k]]) {
                                    if(productTypeValues.length == 0) {
                                        productTypeValues = underWritingRelatedProductTypes[k];
                                    } else {
                                        productTypeValues = productTypeValues+','+underWritingRelatedProductTypes[k]; 
                                    }
                                    nextPage = false;
                                }
                            }
                        }
                        if(nextPage) {
                            
                            currentPageNo = previousPageNo + 1;
                            if(doesOppInvolveConsultantVal != null) {
                                
                                if(doesOppInvolveConsultantVal == 'No' || doesOppInvolveConsultantVal == 'TBD') {
                                    
                                    /*
                 					 * Screen 8 will be skipped if the value of Does this Oppty/Risk Involve Consultants is NO/TBD for the Opportunity record.
                 					 */
                                    
                                    if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[currentPageNo] != undefined &&
                                       		component.find("kanbanSteps")[currentPageNo] != null) {
                                        $A.util.addClass(component.find("kanbanSteps")[currentPageNo], "slds-red");    
                                    }
                                    
                                } 
                            }
                            component.set('v.NavigationPages.Page', currentPageNo);
                            $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                            $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                            helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                            
                        } else {
                            component.set('v.errorMessage', 'For the '+productTypeValues+' Product Type(s)-> U/W Engagement not yet Needed box should be checked OR [Employees in the Proposal] + [Retirees in the Proposal] >0 AND Date the Quote is Needed is NOT NULL');
                            component.set('v.errorPopUpTitle', 'Prompt');
                            var confirmCancelForPromptList = component.find('reminderPopUp');
                            for(var i in confirmCancelForPromptList) {
                                $A.util.removeClass(confirmCancelForPromptList[i], 'slds-hide');
                            }
                        }
                    } 
                    
                } else if(previousPageNo == 7) {
                    
                    if(doesOppInvolveConsultantVal == 'No' || doesOppInvolveConsultantVal == 'TBD') {
                        if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[previousPageNo] != null) {
                            $A.util.addClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
                        }
                        if(doesOppInvolveExchgsVal == 'No' || doesOppInvolveExchgsVal == 'Not Yet Known') {
                            if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[previousPageNo + 2] != null) {
                                $A.util.addClass(component.find("kanbanSteps")[previousPageNo + 2], "slds-red");    
                            }
                            currentPageNo = previousPageNo + 2; 
                            component.set('v.NavigationPages.Page', component.get("v.NavigationPages.LastPage"));
                        } else {
                           currentPageNo = previousPageNo + 2; 
                           component.set('v.NavigationPages.Page', currentPageNo);
                        }                        
                    } else if(doesOppInvolveConsultantVal == 'Yes') {
                        if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[previousPageNo] != null) {
                            $A.util.removeClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
                        }
                        currentPageNo = previousPageNo + 1;
                        component.set('v.NavigationPages.Page', currentPageNo);
                    }
                        
                    //component.set('v.NavigationPages.Page', currentPageNo);
                    $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                    $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                    helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                    
                } else if(previousPageNo == 8 && doesOppInvolveConsultantVal == 'Yes') {
                    
                    var maConsultantObj = component.find('maConsultantsAuraId');
                    var consultantList = maConsultantObj.get('v.maConsultantList');
                    
                    if(consultantList != undefined && consultantList != null && consultantList.length > 0) {
                        
                        currentPageNo = previousPageNo + 1;
                        if(doesOppInvolveExchgsVal == 'No' || doesOppInvolveExchgsVal == 'Not Yet Known') {
                            component.set('v.NavigationPages.Page', component.get("v.NavigationPages.LastPage"));
                            if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null &&
                               component.find("kanbanSteps")[currentPageNo] != undefined && component.find("kanbanSteps")[currentPageNo] != null) {
                                $A.util.addClass(component.find("kanbanSteps")[currentPageNo], "slds-red");    
                            }
                        } else if(doesOppInvolveExchgsVal == 'Yes') {
                            component.set('v.NavigationPages.Page', currentPageNo);
                            if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null &&
                               component.find("kanbanSteps")[currentPageNo] != undefined && component.find("kanbanSteps")[currentPageNo] != null) {
                                $A.util.removeClass(component.find("kanbanSteps")[currentPageNo], "slds-red");    
                            }
                        }
                        
                        component.set('v.NavigationPages.Page', currentPageNo);
                        $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                        $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                        helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                        
                    } else {
                        
                        component.set('v.errorMessage', $A.get("$Label.c.Consultant_Mandatory_CM_QA"));
                        component.set('v.errorPopUpTitle', 'Consultant');
                        var confirmCancelForPromptList = component.find('reminderPopUp');
                        for(var i in confirmCancelForPromptList) {
                            $A.util.removeClass(confirmCancelForPromptList[i], 'slds-hide');
                        }
                    }                                        
                    
                } else if(previousPageNo == 9 && (doesOppInvolveExchgsVal == 'No' || doesOppInvolveExchgsVal == 'Not Yet Known')) {
                    
                    if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null &&
                    	component.find("kanbanSteps")[previousPageNo] != undefined && component.find("kanbanSteps")[previousPageNo] != null) {
                        $A.util.addClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
                    }
                    component.set('v.NavigationPages.Page', component.get("v.NavigationPages.LastPage"));
                    
                } else {
                    
                    currentPageNo = previousPageNo + 1;
                    component.set('v.NavigationPages.Page', currentPageNo);
                    $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                    $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                    helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                }                
            }
        }
    },
    
    previousPage : function(component, event, helper) { 

        $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
        
        var currentPageNo = component.get("v.NavigationPages.Page") != null ? component.get("v.NavigationPages.Page") : 0;
        var isScreen8Skipped = false;
        var isScreen3Skipped = false;
        
        if(currentPageNo != null) {
            
            var isNotProductScreenFlag = true;
            var previousPageNo;
            var oppInvolveExchgsVal = '';
            if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') != undefined && 
               		component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') != null) {
                if(oppInvolveExchgsVal != undefined && oppInvolveExchgsVal != null) {
                	oppInvolveExchgsVal = component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value');
                }
            }
            var oppInvolveConsultantsVal = '';
            if(component.find('Does_this_Oppty_Risk_Involve_Consultant__c') != undefined && 
               		component.find('Does_this_Oppty_Risk_Involve_Consultant__c') != null) {
                if(oppInvolveConsultantsVal != undefined && oppInvolveConsultantsVal != null) {
                	oppInvolveConsultantsVal = component.find('Does_this_Oppty_Risk_Involve_Consultant__c').get('v.value');
                }
            }
            
            /*
			 * Screen 3 will be skipped if the value of IsThereExistingMembershipAtRisk is NO for the Opportunity record.
			 */
            if(currentPageNo == 4 && component.find('Is_There_Existing_Membership_at_Risk__c') != null &&
               component.find('Is_There_Existing_Membership_at_Risk__c').get('v.value') == 'No') {
                previousPageNo = currentPageNo - 2;
                isScreen3Skipped = true;
            } else if(currentPageNo == 5) { 
                isNotProductScreenFlag = false;
                var navigationPagesJSONObj = component.get('v.ProductNavigationPages');
                var productNavPageNo = component.get('v.NavigationPages.Page5A');
                //var productNavLastPageNo = component.get('v.NavigationPages.LastPage5A');
                
                if(productNavPageNo != null && productNavPageNo != undefined) {
                    if(productNavPageNo == 1) {
                        previousPageNo = currentPageNo - 1;
                        isNotProductScreenFlag = true;
                    } else {
                        $A.util.addClass(component.find(navigationPagesJSONObj[productNavPageNo]+'Products'), "slds-hide");
                        $A.util.removeClass(component.find(navigationPagesJSONObj[(productNavPageNo-1)]+'Products'), "slds-hide");
                        $A.util.removeClass(component.find(navigationPagesJSONObj[productNavPageNo]+"BreadCrumb"), "active");
                        $A.util.addClass(component.find(navigationPagesJSONObj[(productNavPageNo-1)]+"BreadCrumb"), "active");
                        component.set('v.NavigationPages.Page5A', (productNavPageNo-1));
                    } 
                }
            } else if(currentPageNo == 6) { 
                var pageNo = component.get('v.NavigationPages.LastPage5A');
                component.set('v.NavigationPages.Page5A', pageNo);
                var navigationPagesJSONObj = component.get('v.ProductNavigationPages');
                //var totalNumberOfPagesInPdts = 0;
                if(navigationPagesJSONObj != undefined && navigationPagesJSONObj != null) {
                    for(var i in navigationPagesJSONObj) {
                        if(component.find(navigationPagesJSONObj[i]) != undefined && component.find(navigationPagesJSONObj[i]) != null &&
                           		$A.util.hasClass(component.find(navigationPagesJSONObj[i]+'Products'), "slds-hide") == false) {
                            $A.util.addClass(component.find(navigationPagesJSONObj[i]+'Products'), "slds-hide");   
                        }
                        //totalNumberOfPagesInPdts = totalNumberOfPagesInPdts+1;
                    }
                }
                $A.util.removeClass(component.find(navigationPagesJSONObj[pageNo]+'Products'), "slds-hide");
                $A.util.addClass(component.find(navigationPagesJSONObj[pageNo]+'BreadCrumb'), "active");
            	previousPageNo = currentPageNo - 1;
            } else if(currentPageNo == 7 && component.get('v.SkippedScreensFlag.Screen'+(currentPageNo-1)) != null &&
                      component.get('v.SkippedScreensFlag.Screen'+(currentPageNo-1))) {
                previousPageNo = currentPageNo - 2;
                if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[previousPageNo] != null) {
                    $A.util.removeClass(component.find("kanbanSteps")[previousPageNo], "slds-red");
                }
            } else if(currentPageNo == 9 && (oppInvolveConsultantsVal == 'No' || oppInvolveConsultantsVal == 'TBD')) {
                previousPageNo = currentPageNo - 2;
                isScreen8Skipped = true;
            } else if(currentPageNo == 10 && (oppInvolveExchgsVal == 'No' || oppInvolveExchgsVal == 'Not Yet Known')) {
                currentPageNo = currentPageNo - 1;
                if(oppInvolveConsultantsVal == 'No' || oppInvolveConsultantsVal == 'TBD') {
                   isScreen8Skipped = true;
                   previousPageNo = currentPageNo - 2; 
                } else {
                   previousPageNo = currentPageNo - 1;
                }
            } else {
                previousPageNo = currentPageNo - 1;
            }
            
            if(isNotProductScreenFlag) {
                
                /*
            	 * To highlight the stages in the Kanban Progression Branch
            	 */
                var kanbanBranchingList = component.get('v.kanbanBranchingList');
                if(kanbanBranchingList != null && kanbanBranchingList.length > 0) {
                    var totalNoOfProgressionSteps = kanbanBranchingList.length;
                    var kanbanStepsArray = component.find("kanbanSteps");
                    if(kanbanStepsArray != null) {
                        for(var i=1; i<=totalNoOfProgressionSteps; i++) {
                            if(previousPageNo == i) {
                                $A.util.removeClass(kanbanStepsArray[i-1], "slds-green");  
                                $A.util.addClass(kanbanStepsArray[i-1], "slds-is-active"); 
                                var progressionBarWidthPer = ((previousPageNo-1) * (100/(totalNoOfProgressionSteps-1)));
                                component.set('v.progressionBarWidth', 'width:'+progressionBarWidthPer+'%');
                            } else if(i < previousPageNo) {
                                $A.util.removeClass(kanbanStepsArray[i-1], "slds-is-active");
                                $A.util.addClass(kanbanStepsArray[i-1], "slds-green");
                            } else {
                                $A.util.removeClass(kanbanStepsArray[i-1], "slds-green");
                                $A.util.removeClass(kanbanStepsArray[i-1], "slds-red");
                                $A.util.removeClass(kanbanStepsArray[i-1], "slds-is-active");
                            }
                        }
                    }
                }
                
                var isScreen6Skipped = component.get('v.SkippedScreensFlag.Screen6');
                if((isScreen3Skipped) || (isScreen8Skipped) || (previousPageNo == 5 && isScreen6Skipped != undefined && 
						isScreen6Skipped != null && isScreen6Skipped)) {
                    if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[previousPageNo] != undefined &&
                       		component.find("kanbanSteps")[previousPageNo] != null) {
                        $A.util.addClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
                    }
                }
                
                component.set('v.NavigationPages.Page', previousPageNo);
                $A.util.addClass(component.find("QAPage"+currentPageNo), "slds-hide");
                $A.util.removeClass(component.find("QAPage"+previousPageNo), "slds-hide");
            }
        }
    },
    
    focusMandatoryFields : function(component, event, helper) { 
        
        var selectedItem = event.currentTarget;
        console.log('focusMandatoryFields');
        setTimeout(function() {
            var focusInputField = component.find(selectedItem.dataset.record);
            try{
                focusInputField.focus();    
            }catch(err){}
        }, 100);
    },
    
    fireComponentEvent : function(cmp, event) {
        
        var cmpEvent = cmp.getEvent("modalCmpCloseEvent");
        cmpEvent.setParams({
            "assistedMACreation" : false });
        cmpEvent.fire();
    },
    
    modalClose : function(component, event, helper) {
        
        var modalComponent = component.find('QASelection_Modal');
        for(var i=0; i<modalComponent.length; i++) {
            $A.util.addClass(modalComponent[i], 'slds-backdrop--hide');
            $A.util.removeClass(modalComponent[i], 'slds-backdrop--open');
        }        
    },
    
    confirmCancelForPrompt : function(component, event, helper) {
        var confirmCancelForPromptList = component.find('reminderPopUp');
        for(var i in confirmCancelForPromptList) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    saveRecord : function(component, event, helper) {

        var isToBeSaved = false;
        var doesOppInvolveExchgsVal = '';
        if(component.find("Does_this_Oppty_Risk_Involve_Exchanges__c") != undefined && 
				component.find("Does_this_Oppty_Risk_Involve_Exchanges__c") != null) {
            doesOppInvolveExchgsVal = component.find("Does_this_Oppty_Risk_Involve_Exchanges__c").get('v.value');  
        }
        if(doesOppInvolveExchgsVal == 'Yes') {
            
            var previousPageNo = component.get("v.NavigationPages.Page");
            var isMandatoryFieldsValuesAvailable = false;
            var mandatoryFieldsJSONMap = null;                        
                
            if(component.get('v.MandatoryFieldsMap') != null && component.get('v.MandatoryFieldsMap') != '') {
                mandatoryFieldsJSONMap = JSON.parse(component.get('v.MandatoryFieldsMap'));    
            }
            
            var prevMandatoryEmptyFieldsArray;
            if(mandatoryFieldsJSONMap != null) {
                var mandatoryFieldsJSONMap1;
                if(mandatoryFieldsJSONMap[previousPageNo] != null) {
                    mandatoryFieldsJSONMap1 = mandatoryFieldsJSONMap[previousPageNo];
                }
                prevMandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                isMandatoryFieldsValuesAvailable = helper.checkForMandatoryFields(component,event,mandatoryFieldsJSONMap1, null);   
            }
            
            if(isMandatoryFieldsValuesAvailable) {
                
                $A.util.removeClass(component.find("errorToastMessage"), "slds-hide");
                
                var mandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                if(mandatoryEmptyFieldsArray != undefined && mandatoryEmptyFieldsArray != null) {
                    for(var i=0; i<mandatoryEmptyFieldsArray.length; i++) {
                        if(component.find(mandatoryEmptyFieldsArray[i]) != null) {
                            $A.util.addClass(component.find(mandatoryEmptyFieldsArray[i].Itag+'Div'), "slds-has-error");
                            $A.util.removeClass(component.find(mandatoryEmptyFieldsArray[i].Itag+'Div1'), "slds-hide");    
                        }
                    }
                }
                
            } else {
                
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
                
                isToBeSaved = true;
            }
            
        } else if(doesOppInvolveExchgsVal == 'No' || doesOppInvolveExchgsVal == 'Not Yet Known') {
            
			isToBeSaved = true;
        } 
        
        if(isToBeSaved) {
                        
            helper.saveOpportunityRecord(component, event);
        }
        
    },
    
    selectAccount  : function(component, event, helper) {
        
        $A.createComponents([["c:Modal_Component",{attribute:true,'ModalBody':'QA_AccountSearch_PopUp',
                                                   'Modalheader':'Search for a Company',
                                                   'ModalBodyData':{
                                                       'isQA': false,
                                                       'isAccount':true,
                                                       'isAggregator':true}}]],
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
    },
    
    getAccountData : function(component, event, helper) {
        component.set('v.AccountData',event.getParam('AccountData'));
        var accountData = event.getParam('AccountData');
        if(accountData != undefined && accountData != null) {
            component.set('v.OpportunityData.Aggregator_Involved_in_the_Oppty_Risk__c', accountData.Id); 
            component.set('v.AggregatorInvolvedInOppName', accountData.Name); 
        }
        var cmpEvent = component.getEvent("modalCmpCloseEvent");
        cmpEvent.setParams({"isAccount":true});
        cmpEvent.fire();
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component, event);
    },
    
    handleChangeForOppRiskConsultant : function(component, event, helper) {
        
        component.find(event.getSource().getLocalId()).set("v.value", event.getParam("value"));
        component.set('v.OpportunityData.'+event.getSource().getLocalId(), event.getParam("value"));
        var compObj = component.get('v.OpportunityData.'+event.getSource().getLocalId());
        if(compObj != undefined && compObj != null && Array.isArray(compObj)) {
            var value = '';
            if(compObj.length > 0) {
                value = compObj[0]; 
            }
            component.set('v.OpportunityData.'+event.getSource().getLocalId(), value);
        }
        
        var previousPageNo = component.get("v.NavigationPages.Page");
        
        var doesOppInvolveExchgsVal = '';
        if(component.find("Does_this_Oppty_Risk_Involve_Exchanges__c") != undefined && 
				component.find("Does_this_Oppty_Risk_Involve_Exchanges__c") != null) {
            doesOppInvolveExchgsVal = component.find("Does_this_Oppty_Risk_Involve_Exchanges__c").get('v.value');  
        }
        
        var doesThisOppInvConsultantsVal = '';
        if(component.find('Does_this_Oppty_Risk_Involve_Consultant__c') != undefined && 
           component.find('Does_this_Oppty_Risk_Involve_Consultant__c') != null) {
            if(doesThisOppInvConsultantsVal != undefined && doesThisOppInvConsultantsVal != null) {
                doesThisOppInvConsultantsVal = component.find('Does_this_Oppty_Risk_Involve_Consultant__c').get('v.value');
            }
        }
        
        if(doesThisOppInvConsultantsVal != '') {
            
            var currentPageNo;
            
            if(doesThisOppInvConsultantsVal == 'No' || doesThisOppInvConsultantsVal == 'TBD') {
                
                var prevMandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
                
                if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null &&
                   	component.find("kanbanSteps")[previousPageNo] != undefined && component.find("kanbanSteps")[previousPageNo] != null) {
                    $A.util.addClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
                }
            	currentPageNo = previousPageNo + 2;
                
                var maConsultantObj = component.find('maConsultantsAuraId');
        		maConsultantObj.set('v.maConsultantList',[]);
                maConsultantObj.set('v.isMAConsultantListEmpty',true);
                
                if(doesOppInvolveExchgsVal == 'No' || doesOppInvolveExchgsVal == 'Not Yet Known') {
                    if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null &&
                       component.find("kanbanSteps")[currentPageNo] != undefined && component.find("kanbanSteps")[currentPageNo] != null) {
                        $A.util.addClass(component.find("kanbanSteps")[currentPageNo], "slds-red");    
                    }
                    component.set('v.NavigationPages.Page', component.get("v.NavigationPages.LastPage"));
                } else {
                    component.set('v.NavigationPages.Page', currentPageNo);
                }
                
                $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                
            } else if(doesThisOppInvConsultantsVal == 'Yes') {
                
                var prevMandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
                
                if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null &&
                   component.find("kanbanSteps")[previousPageNo] != undefined && component.find("kanbanSteps")[previousPageNo] != null) {
                    $A.util.removeClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
                }                           
            }          
        }        
    },       
    
    handleChangeForOppRiskExchanges : function(component, event, helper) {
        
        component.find(event.getSource().getLocalId()).set("v.value", event.getParam("value"));
        component.set('v.OpportunityData.'+event.getSource().getLocalId(), event.getParam("value"));
        var compObj = component.get('v.OpportunityData.'+event.getSource().getLocalId());
        if(compObj != undefined && compObj != null && Array.isArray(compObj)) {
            var value = '';
            if(compObj.length > 0) {
                value = compObj[0]; 
            }
            component.set('v.OpportunityData.'+event.getSource().getLocalId(), value);
        }
        
        var previousPageNo = component.get("v.NavigationPages.Page");
        previousPageNo = (previousPageNo != undefined || previousPageNo != null) ? previousPageNo : 0;
        var currentPageNo = 0;
        var lastPageNo = component.get("v.NavigationPages.LastPage");
        lastPageNo = (lastPageNo != undefined || lastPageNo != null) ? lastPageNo : 10;
        
        var doesOppInvolveExchgsVal = '';
        if(component.find("Does_this_Oppty_Risk_Involve_Exchanges__c") != undefined && 
				component.find("Does_this_Oppty_Risk_Involve_Exchanges__c") != null) {
            doesOppInvolveExchgsVal = component.find("Does_this_Oppty_Risk_Involve_Exchanges__c").get('v.value');  
        }
        doesOppInvolveExchgsVal = (doesOppInvolveExchgsVal != undefined && doesOppInvolveExchgsVal != null) ? doesOppInvolveExchgsVal : '';
            
        if(doesOppInvolveExchgsVal == 'No' || doesOppInvolveExchgsVal == 'Not Yet Known') {
            
            var prevMandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
            helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
            
            /* 
             * Clear Screen 8 (Private Exchange Detail) Fields              
             */
            
            var exchangesCompanyVal = component.find('Exchanges_the_Company_is_Looking_At__c');
            var isPEXTeamVal = component.find('Is_the_PEX_Team_Creating_this_Oppty_Risk__c');
            
            if(exchangesCompanyVal != undefined && exchangesCompanyVal != null) {
                component.find('Exchanges_the_Company_is_Looking_At__c').set('v.value', '');
            }
            
            if(isPEXTeamVal != undefined && isPEXTeamVal != null) {
                component.find('Is_the_PEX_Team_Creating_this_Oppty_Risk__c').set('v.value', '');
            }
            
            var oppDataObj = component.get('v.OpportunityData');
            if(oppDataObj != undefined && oppDataObj != null) {
                oppDataObj['Exchanges_the_Company_is_Looking_At__c'] = '';
                oppDataObj['Is_the_PEX_Team_Creating_this_Oppty_Risk__c'] = '';
                component.set('v.OpportunityData', oppDataObj)
            }
            
            /*
             * Screen 10 will be skipped if the value of Does this Oppty/Risk Involve Exchanges is N0/Not Yet Known for the Opportunity record.
             */
            if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null &&
               	component.find("kanbanSteps")[previousPageNo] != undefined && component.find("kanbanSteps")[previousPageNo] != null) {                
                 $A.util.addClass(component.find("kanbanSteps")[previousPageNo], "slds-red");  
            }
                        
            component.set('v.NavigationPages.Page', lastPageNo);            
            
        } else if(doesOppInvolveExchgsVal == 'Yes') {
            
            var prevMandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
            helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
            
            if(lastPageNo == previousPageNo) {
                previousPageNo = lastPageNo-1;
            }
            
            /*
             * Screen 10 will be shown if the value of Does this Oppty/Risk Involve Exchanges is Yes for the Opportunity record.
             */
            if(component.find("kanbanSteps") != undefined && component.find("kanbanSteps") != null &&
               	component.find("kanbanSteps")[previousPageNo] != undefined && component.find("kanbanSteps")[previousPageNo] != null) {
                $A.util.removeClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
            }
            component.set('v.NavigationPages.Page', previousPageNo);
        }
        
    }
    
})