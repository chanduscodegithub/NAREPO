({
	doInit : function(component, event, helper) {
        //console.log('doInit QA');
        if(component.find("kanbanSteps") != null) {
            $A.util.addClass(component.find("kanbanSteps")[0], "slds-is-active");   
        }
        component.set('v.isOpp',component.get('v.Child_Data.isOpp'));
        var accountName = component.get('v.Child_Data.accountName');
        var recordTypeId = component.get('v.Child_Data.recordTypeId');
        component.set('v.NavigationPages', {'Page': 1,'LastPage':7,'Page4A': 1,'LastPage4A':4});
        component.set('v.isRequiredFields', {'ExpectedDateOfRFP':false});
        component.set('v.ProductNavigationPages', {});
        
        var oppCategory = component.get('v.Child_Data.category');
        if(oppCategory == $A.get("$Label.c.Client_Development")) {
            component.set('v.maType', 'NB');
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
                console.log('responseObj',responseObj);
                component.set('v.OpportunityData', responseObj.opportunityData);
                component.set('v.OpportunityData.OwnerId', component.get('v.Child_Data.ownerId'));
                component.set('v.OpportunityData.AccountName', accountName);
                component.set('v.OpportunityData.RecordTypeId', recordTypeId);
                component.set('v.MandatoryFieldsMap', responseObj.mandatoryFieldsMap);
                component.set('v.PicklistFieldsItags', responseObj.picklistFieldsItagsList);
                component.set('v.ConditionallyMandatoryFieldsMap', responseObj.conditionallyMandatoryFieldsMap);
                component.set('v.ValidateDateFieldsMap', responseObj.validateDateFieldsMap);
                console.log('11111');
                /*
                 * The below logic sets the options for the SF Picklist fields dynamically.
                 * The SF Picklist fields is shown as SelectDropdown, CheckboxGroup, RadioButtonGroup ...
                 */  
                var salesStageItags = ['Sales_Stage_Medical__c','Sales_Stage_Pharmacy__c','Sales_Stage_Dental__c','Sales_Stage_Vision__c','Sales_Stage_Other__c'];
                var picklistFieldsMap = responseObj.picklistFieldsMap;
                if(picklistFieldsMap != undefined && picklistFieldsMap != null) {
                    for(var i in picklistFieldsMap) {
                        var picklistValuesArray = [];
                        if(component.find(i) != undefined && component.find(i) != null && component.find(i).get('v.multiple') == false) {
                                picklistValuesArray.push({label:'', value:''});
                        }
                        var picklistValues = picklistFieldsMap[i];
                        if(picklistValues != undefined && picklistValues != null && picklistValues.length > 0) {
                            for(var j=0; j<picklistValues.length; j++) {
                                picklistValuesArray.push({label:picklistValues[j], value:picklistValues[j]});
                                if(salesStageItags.includes(i) && component.find(i) != undefined && component.find(i) != null) {
                                    component.find(i).set("v.value", picklistValues[j]);  
                                }
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
    
    onChangeOfDate : function(component, event, helper) {
       
        var selectedDate = component.find(event.getSource().getLocalId()).get("v.value");
        if(selectedDate == undefined || selectedDate == null) {
            return false;
        }  else {
            helper.validateDateFieldValues(component, event, selectedDate);
        }
        
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

    handleChangeForSelect : function (component, event, helper) { 
    	var currentPageNo = component.get("v.NavigationPages.Page");
        if(currentPageNo != undefined && currentPageNo != null && currentPageNo == 1) {
            var reasonForOppOrRisk = component.get('v.OpportunityData.Reason_for_the_Opportunity_Risk__c');
            if(reasonForOppOrRisk != undefined && reasonForOppOrRisk != null && reasonForOppOrRisk == 'Confirmed or Likely RFP') {
                component.set('v.isRequiredFields.ExpectedDateOfRFP', true);
            } else {
                component.set('v.isRequiredFields.ExpectedDateOfRFP', false);
            }
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
        
        var prevMandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
        helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
        
        var onDoesThisOppFieldChange = event.getSource().getLocalId();
        var previousPageNo = component.get("v.NavigationPages.Page");
        if(onDoesThisOppFieldChange != undefined && onDoesThisOppFieldChange != null && onDoesThisOppFieldChange == 'Does_this_Oppty_Risk_Involve_Exchanges__c' &&
           		(previousPageNo == 6 || previousPageNo == 7) && component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') != null) {
            
            var lastPage = component.get('v.NavigationPages.LastPage');
            lastPage = (lastPage != undefined && lastPage != null) ? lastPage : 7;
            
            if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') != null && 
               		(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'No' || 
              			component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Not Yet Known')) {
                
                /* 
                 * Clear Screen 7 (Private Exchange Detail) Fields - START               
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
                 * Clear Screen 7 (Private Exchange Detail) Fields - END               
                 */
                
                /*
                 * Screen 7 will be skipped if the value of Does this Oppty/Risk Involve Exchanges is NO for the Opportunity record.
                 */ 
                component.set('v.NavigationPages.Page', lastPage);
                //helper.updateKanbanBranchingProgression(component, event, component.get('v.NavigationPages.Page'));	
                if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[previousPageNo] != undefined &&
                   component.find("kanbanSteps")[previousPageNo] != null) {
                    $A.util.addClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
                }
                
            } else if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Yes') {
                
                //component.set('v.NavigationPages.Page', previousPageNo);
                var currentPageNo = 0;
                if(lastPage == previousPageNo) {
                	currentPageNo = previousPageNo - 1;
                } else {
                    currentPageNo = previousPageNo;
                }
                currentPageNo = (currentPageNo != undefined || currentPageNo != null) ? currentPageNo : 0;
                component.set('v.NavigationPages.Page', currentPageNo);
                //helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[lastPage-1] != undefined &&
                   		component.find("kanbanSteps")[lastPage-1] != null) {
                    $A.util.removeClass(component.find("kanbanSteps")[lastPage-1], "slds-red");    
                }
            }
            
        }
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
                
                var mandatoryFieldsJSONMap1;
                
                if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == undefined ||
                   component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == null ||
                   component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == '' ||
                   component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Yes') {
                    
                    if(mandatoryFieldsJSONMap[previousPageNo] != null) {
                        mandatoryFieldsJSONMap1 = mandatoryFieldsJSONMap[previousPageNo];
                    }
                    
                    /*if(previousPageNo == 1) {
                        
                        /*
                         *  If the value for the Reason for the Opportunity/Risk is 'Confirmed or Likely RFP' then 
                         * 	make the Expected Date of RFP as Mandatory field.
                         *
                        var reasonForOppOrRisk = component.get('v.OpportunityData.Reason_for_the_Opportunity_Risk__c');
                        if(reasonForOppOrRisk != undefined && reasonForOppOrRisk != null && reasonForOppOrRisk == 'Confirmed or Likely RFP') {
                            mandatoryFieldsJSONMap1 = mandatoryFieldsJSONMap1 + ',Expected Date of RFP;Expected_Date_of_RFP__c';
                        }
                    }*/
                }
                var conditionallyMandatoryFieldsJSONMap;
                var conditionallyMandatoryFieldsJSONMap1;
                if(component.get('v.ConditionallyMandatoryFieldsMap') != null && component.get('v.ConditionallyMandatoryFieldsMap') != '') {
                    conditionallyMandatoryFieldsJSONMap = JSON.parse(component.get('v.ConditionallyMandatoryFieldsMap'));    
                }
                if(conditionallyMandatoryFieldsJSONMap[previousPageNo] != null) {
                    conditionallyMandatoryFieldsJSONMap1 =  conditionallyMandatoryFieldsJSONMap[previousPageNo]; 
                }

                helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
                isMandatoryFieldsValuesAvailable = helper.checkForMandatoryFields(component,event,mandatoryFieldsJSONMap1, conditionallyMandatoryFieldsJSONMap1);   
                
            }
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
            
            if(isMandatoryFieldsValuesAvailable) {
                
                $A.util.removeClass(component.find("errorToastMessage"), "slds-hide");
                
                var mandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
                if(mandatoryEmptyFieldsArray != undefined && mandatoryEmptyFieldsArray != null) {
                    for(var i=0; i<mandatoryEmptyFieldsArray.length; i++) {
                        if(component.find(mandatoryEmptyFieldsArray[i]) != null) {
                            if(mandatoryEmptyFieldsArray[i].Itag == 'Name') {
                               $A.util.addClass(component.find(mandatoryEmptyFieldsArray[i].Itag), "mandatoryFields");
                            }
                            $A.util.addClass(component.find(mandatoryEmptyFieldsArray[i].Itag+'Div'), "slds-has-error");
                            $A.util.removeClass(component.find(mandatoryEmptyFieldsArray[i].Itag+'Div1'), "slds-hide");    
                        }
                    }
                }
                
            } else {
                
				var currentPageNo;
                helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
                
                var doesOppInvolveExchgsVal = '';
                if(component.find("Does_this_Oppty_Risk_Involve_Exchanges__c") != undefined && 
                   		component.find("Does_this_Oppty_Risk_Involve_Exchanges__c") != null) {
                	doesOppInvolveExchgsVal = component.find("Does_this_Oppty_Risk_Involve_Exchanges__c").get('v.value');  
                }
                doesOppInvolveExchgsVal = (doesOppInvolveExchgsVal != undefined && doesOppInvolveExchgsVal != null) ? doesOppInvolveExchgsVal : '';
                
                if(previousPageNo == 1) { 
                    
                	helper.returnTheDetailsToController(component,event);
                    currentPageNo = previousPageNo + 1;
                    component.set('v.NavigationPages.Page', currentPageNo);
                    $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                    $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                    
                    /*
                     * To highlight the stages in the Kanban Progression Branch
                     */
                    helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                    
                } else if(previousPageNo == 3) {
                    
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
                    component.set('v.NavigationPages.Page4A', 1);
                    $A.util.removeClass(component.find(navigationPagesJSONObj[1]+'Products'), "slds-hide");
                    $A.util.removeClass(component.find(navigationPagesJSONObj[1]+'BreadCrumb'), "slds-hide");
                    $A.util.addClass(component.find(navigationPagesJSONObj[1]+"BreadCrumb"), "active");
                    helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                    
                } else if(previousPageNo == 4) { 

                    var navigationPagesJSONObj = component.get('v.ProductNavigationPages');
                    var productNavPageNo = component.get('v.NavigationPages.Page4A');
                    var productNavLastPageNo = component.get('v.NavigationPages.LastPage4A');
                    
                    if(productNavPageNo != null && productNavPageNo != undefined) {
                        
                        var isProductsValidated = true;
                        //var selectedProductType = navigationPagesJSONObj[productNavPageNo];
                        var productsComp = component.find('productsAndCompetitorsAuraId');
                        
                        //selectedProductType = (selectedProductType!= undefined && selectedProductType != null) ? selectedProductType : '';
                        
                        for(var i=0;i<productsComp.length;i++) {
                            var selectedProductType = productsComp[i].get('v.productTypesValues');
                            if(selectedProductType == 'Medical_And_Other_Buy_Up') {
                                selectedProductType = 'MedicalOther';
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
                                component.set('v.NavigationPages.Page4A', (productNavPageNo+1));
                            } else if(productNavPageNo == productNavLastPageNo) {
                                helper.displayScreen5Data(component, event, currentPageNo, previousPageNo);
                            }
                        }
                    }
                
                } else if(previousPageNo == 5 && (doesOppInvolveExchgsVal == 'No' || doesOppInvolveExchgsVal == 'Not Yet Known')) { 
                
                    var lastPage = component.get('v.NavigationPages.LastPage');
                    lastPage = (lastPage != undefined && lastPage != null) ? lastPage : 7;
                    
                    if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[lastPage-1] != undefined &&
                       		component.find("kanbanSteps")[lastPage-1] != null) {
                        $A.util.addClass(component.find("kanbanSteps")[lastPage-1], "slds-red");    
                    }
                    
                    currentPageNo = previousPageNo + 1;
                    component.set('v.NavigationPages.Page', lastPage);
                    $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                    $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                    helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                
                } else {

                    /*if(previousPageNo == 5) {
                        var mAActivityType = component.find('Membership_Activity_Type__c').get("v.value");
                        if(mAActivityType == undefined || mAActivityType == null || mAActivityType == '') {
                            component.find('Membership_Activity_Type__c').set("v.value", 'Traditional'); 
                        }
                    }
                    component.set('v.OpportunityData.Membership_Activity_Type__c', component.find('Membership_Activity_Type__c').get("v.value"));*/
                    
                    currentPageNo = previousPageNo + 1;
                    component.set('v.NavigationPages.Page', currentPageNo);
                    $A.util.addClass(component.find("QAPage"+previousPageNo), "slds-hide");
                    $A.util.removeClass(component.find("QAPage"+currentPageNo), "slds-hide");
                    
                    /*
                     * To highlight the stages in the Kanban Progression Branch
                     */
                    helper.updateKanbanBranchingProgression(component, event, currentPageNo);
                }
            }
        }
    },
    
    previousPage : function(component, event, helper) { 
        
        var prevMandatoryEmptyFieldsArray = component.get('v.MandatoryEmptyFieldsArray');
        helper.clearMandatoryErrorData(component, event, prevMandatoryEmptyFieldsArray);
        
        $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
        
        var currentPageNo = component.get("v.NavigationPages.Page") != null ? component.get("v.NavigationPages.Page") : 0;
        var isScreen6Skipped = false;
        
        if(currentPageNo != null) {
            
            var isNotProductScreenFlag = true;
            var previousPageNo;

            if(currentPageNo == 4) { 
                
                isNotProductScreenFlag = false;
                var navigationPagesJSONObj = component.get('v.ProductNavigationPages');
                var productNavPageNo = component.get('v.NavigationPages.Page4A');
                
                if(productNavPageNo != null && productNavPageNo != undefined) {
                    if(productNavPageNo == 1) {
                        previousPageNo = currentPageNo - 1;
                        isNotProductScreenFlag = true;
                        component.set('v.NavigationPages.Page', previousPageNo);
                        $A.util.addClass(component.find("QAPage"+currentPageNo), "slds-hide");
                        $A.util.removeClass(component.find("QAPage"+previousPageNo), "slds-hide");
                    } else {
                        $A.util.addClass(component.find(navigationPagesJSONObj[productNavPageNo]+'Products'), "slds-hide");
                        $A.util.removeClass(component.find(navigationPagesJSONObj[(productNavPageNo-1)]+'Products'), "slds-hide");
                        $A.util.removeClass(component.find(navigationPagesJSONObj[productNavPageNo]+"BreadCrumb"), "active");
                        $A.util.addClass(component.find(navigationPagesJSONObj[(productNavPageNo-1)]+"BreadCrumb"), "active");
                        component.set('v.NavigationPages.Page4A', (productNavPageNo-1));
                    } 
                }                                
                
            } /*else if(currentPageNo == 7 && (component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') != null &&
            			component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'No' || 
                     		component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Not Yet Known')) {
                
                var pageNo = component.get('v.NavigationPages.LastPage4A');
                component.set('v.NavigationPages.Page4A', pageNo);
                var navigationPagesJSONObj = component.get('v.ProductNavigationPages');

                if(navigationPagesJSONObj != undefined && navigationPagesJSONObj != null) {
                    for(var i in navigationPagesJSONObj) {
                        if(component.find(navigationPagesJSONObj[i]) != undefined && component.find(navigationPagesJSONObj[i]) != null &&
                           		$A.util.hasClass(component.find(navigationPagesJSONObj[i]+'Products'), "slds-hide") == false) {
                            $A.util.addClass(component.find(navigationPagesJSONObj[i]+'Products'), "slds-hide");   
                        }
                    }
                }
                $A.util.removeClass(component.find(navigationPagesJSONObj[pageNo]+'Products'), "slds-hide");
                $A.util.addClass(component.find(navigationPagesJSONObj[pageNo]+'BreadCrumb'), "active");
                
                /*
			 	 * Screen 6 will be skipped if the value of Does this Oppty/Risk Involve Exchanges is NO for the Opportunity record.
			 	 */
                
                /*$A.util.addClass(component.find("QAPage5"), "slds-hide");
               	previousPageNo = currentPageNo - 2; 
            } */else if(currentPageNo == 7 && (component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') != null &&
                      	component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'No' || 
                      		component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Not Yet Known')) {
                
                previousPageNo = currentPageNo - 2;
                //isScreen6Skipped = true;
                
                component.set('v.NavigationPages.Page', previousPageNo);
                $A.util.addClass(component.find("QAPage"+(currentPageNo-1)), "slds-hide");
                $A.util.removeClass(component.find("QAPage"+previousPageNo), "slds-hide");
                
            } else {
                previousPageNo = currentPageNo - 1;
                component.set('v.NavigationPages.Page', previousPageNo);
                $A.util.addClass(component.find("QAPage"+currentPageNo), "slds-hide");
                $A.util.removeClass(component.find("QAPage"+previousPageNo), "slds-hide");
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
                
                if(isScreen6Skipped) {
                    if(component.find("kanbanSteps") != null && component.find("kanbanSteps")[previousPageNo] != undefined &&
                       		component.find("kanbanSteps")[previousPageNo] != null) {
                        $A.util.addClass(component.find("kanbanSteps")[previousPageNo], "slds-red");    
                    }
                }                
            }
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
    
    saveRecord : function(component, event, helper) {
        
        var previousPageNo = component.get("v.NavigationPages.Page");
        var isMandatoryFieldsValuesAvailable = false;
        var mandatoryFieldsJSONMap = null;
        
        if(component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') == undefined ||
           component.find('Does_this_Oppty_Risk_Involve_Exchanges__c') == null ||
           component.find('Does_this_Oppty_Risk_Involve_Exchanges__c').get('v.value') == 'Yes') { 
            
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
            helper.saveOpportunityRecord(component, event);
        }
    },
    
    focusMandatoryFields : function(component, event, helper) { 
        
        var selectedItem = event.currentTarget;
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
        if(modalComponent != undefined && modalComponent != null) {
            for(var i=0; i<modalComponent.length; i++) {
                $A.util.addClass(modalComponent[i], 'slds-backdrop--hide');
                $A.util.removeClass(modalComponent[i], 'slds-backdrop--open');
            } 
        }
    },
    
    confirmCancelForPrompt : function(component, event, helper) {
        var confirmCancelForPromptList = component.find('reminderPopUp');
        for(var i in confirmCancelForPromptList) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component, event);
    }
    
})