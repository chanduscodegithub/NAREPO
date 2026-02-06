({    
    getUserInfo : function(component,event) {
        
        var action = component.get("c.getLoggedInUerRoleInfo");
        if(action == undefined || action == null){
            return;
        }
         action.setParams({
            "accountId" : component.get('v.recordId')
        });
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state == "SUCCESS") {
                component.set('v.isEditSaveDeleteButtonsEnabled', response.getReturnValue());
                this.getaccountCategoryType(component, event);
            }
        });
        $A.enqueueAction(action);
    },

    setAccountType : function(component, accountType) {
        
        if(accountType != null) {
            if(accountType === $A.get("$Label.c.Client_Management")) {
                component.set('v.accountTypeAttributes',{'AccountType' : accountType, 'AppletName':$A.get("$Label.c.Competitive_Landscape_Pharmacy_Specialty_Other_Products")});
            }else if(accountType === $A.get("$Label.c.Client_Development")  || accountType === $A.get("$Label.c.Aggregator")){
                component.set('v.accountTypeAttributes',{'AccountType' : accountType, 'AppletName':$A.get("$Label.c.Competitive_Landscape_Pharmacy_Specialty_Other_Products")});
            }
            component.set('v.isExpand',true);
        }
    },
    
    getaccountCategoryType : function(component,event) {
        
        var accountTypeAction = component.get('c.getAccountType');	
        accountTypeAction.setParams({
            "accountId" : component.get('v.recordId')
        });
        accountTypeAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {    
                var accountResultData  = response.getReturnValue();
                if(accountResultData.accountType != null){
                    if(accountResultData.accountType === $A.get("$Label.c.Client_Management")) {
                        component.set('v.accountTypeAttributes',{'AccountType' : accountResultData.accountType, 'AppletName':$A.get("$Label.c.Competitive_Landscape_Pharmacy_Specialty_Other_Products")});
                    }else if(accountResultData.accountType === $A.get("$Label.c.Client_Development")  || 
                      			accountResultData.accountType === $A.get("$Label.c.Aggregator")){
                        component.set('v.accountTypeAttributes',{'AccountType' : accountResultData.accountType, 'AppletName':$A.get("$Label.c.Competitive_Landscape_Pharmacy_Specialty_Other_Products")});
                    }
                }
                
                var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                component.set('v.isExpand',true);
                if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                    this.getCompetitorsData(component, event, 'OnLoad');
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
    
    getCompetitorsData : function(component, event, operationVal) {
		console.log('getCompetitorsData');
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        if(component.find('addBtn') != undefined && component.find('addBtn') != null) {
        	component.find('addBtn').set("v.disabled", false);    
        }
        if(component.find('editBtn') != undefined && component.find('editBtn') != null) {
        	component.find('editBtn').set("v.disabled", false);    
        }
        if(component.find('saveBtn') != undefined && component.find('saveBtn') != null) {
            $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        }
        if(component.find('cancelBtn') != undefined && component.find('cancelBtn') != null) {
            $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        }
        
        /*if(component.find('SearchDropDownForBusinessModel') != undefined && component.find('SearchDropDownForBusinessModel') != null) {
        	component.find("SearchDropDownForBusinessModel").set('v.disabled', true);	
        }
        if(component.find('SearchDropDownForFundingTypeDental') != undefined && component.find('SearchDropDownForFundingTypeDental') != null) {
        	component.find("SearchDropDownForFundingTypeDental").set('v.disabled', true);
        }
        if(component.find('SearchDropDownForFundingTypeVision') != undefined && component.find('SearchDropDownForFundingTypeVision') != null) {
        	component.find("SearchDropDownForFundingTypeVision").set('v.disabled', true);
        }*/
        
        var accountCompetitorsAction = component.get('c.getAccountCompetitorRecords');	
        accountCompetitorsAction.setParams({
            "accountId" : component.get('v.recordId'),
            "accountType" : component.get('v.accountTypeAttributes.AccountType'),
            "operation" : operationVal,
            "isButtonsEnabled" : component.get('v.isEditSaveDeleteButtonsEnabled')
        });
        accountCompetitorsAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                
                var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                var competitorResultData  = response.getReturnValue();
                
                if(competitorResultData != null && component.get('v.isEdit') == false) { //&& component.get('v.isEdit') == false SAMARTH
                    
                    var isEditButtonEnabled = true;
                    if(competitorResultData.pharmacyCompetitorList == null || 
                       		competitorResultData.pharmacyCompetitorList.length == 0) {
                    	component.set('v.isPharmacyCompetitorsCDEmptyList', true);
                        component.set('v.PharmacyCompetitorsList', []);
                        isEditButtonEnabled = false;
                    } else if(competitorResultData.pharmacyCompetitorList != null) {
                        isEditButtonEnabled = true;
                        component.set('v.isPharmacyCompetitorsCDEmptyList', false);
                    	component.set('v.PharmacyCompetitorsList', competitorResultData.pharmacyCompetitorList); 
                    }
                    if(competitorResultData.dentalCompetitorList == null || 
                       		competitorResultData.dentalCompetitorList.length == 0) {
                    	component.set('v.isDentalCompetitorsCDEmptyList', true);
                        component.set('v.DentalCompetitorsList', []); 
                        if(!isEditButtonEnabled) {
                        	isEditButtonEnabled = false;    
                        }
                    } else if(competitorResultData.dentalCompetitorList != null) {
                        isEditButtonEnabled = true;
                        component.set('v.isDentalCompetitorsCDEmptyList', false);    
                    	component.set('v.DentalCompetitorsList', competitorResultData.dentalCompetitorList);   
                    }
                    if(competitorResultData.visionCompetitorList == null || 
                       		competitorResultData.visionCompetitorList.length == 0) {
                    	component.set('v.isVisionCompetitorsCDEmptyList', true);
                        component.set('v.VisionCompetitorsList', []);   
                        if(!isEditButtonEnabled) {
                        	isEditButtonEnabled = false;    
                        }
                    } else if(competitorResultData.visionCompetitorList != null) {
                        isEditButtonEnabled = true;
                        component.set('v.isVisionCompetitorsCDEmptyList', false);  
                    	component.set('v.VisionCompetitorsList', competitorResultData.visionCompetitorList);   
                    }
                    if(competitorResultData.otherproductsCompetitorList == null || 
                       		competitorResultData.otherproductsCompetitorList.length == 0) {
                    	component.set('v.isOthersCompetitorsCDEmptyList', true);
                        component.set('v.OtherProductsCompetitorsList', []);
                        component.set('v.OtherProductsCompetitorsListBackup',[]);
                        if(!isEditButtonEnabled) {
                        	isEditButtonEnabled = false;    
                        }
                    } else if(competitorResultData.otherproductsCompetitorList != null) {
                        isEditButtonEnabled = true;
                        component.set('v.isOthersCompetitorsCDEmptyList', false);
                        //Setting the data to the below variable for Save functionality saveCompetitorsRecords();
                        var OtherProductsCompetitorsListBackup = [];
                        //var OtherProductsCompetitorsListBackup1 = [];
                        //OtherProductsCompetitorsListBackup1 = [...competitorResultData.otherproductsCompetitorList];
                        component.set('v.OtherProductsCompetitorsListBackup',competitorResultData.OtherProductsCompetitorsListBackup);
                        /* Check if the same Competitor has multiple Other Products and merge to Single Record - START */
                        var otherProductsCompetitorsList = [];
                        if(competitorResultData.otherproductsCompetitorList.length > 1) {
                            for(var i = 1; i< competitorResultData.otherproductsCompetitorList.length; i++) {
                                var recordExist = false;
                                if(otherProductsCompetitorsList.length == 0) {
                                    otherProductsCompetitorsList.push(competitorResultData.otherproductsCompetitorList[0]);
                                }
                                for(var j = 0; j< otherProductsCompetitorsList.length; j++) {
                                    if(otherProductsCompetitorsList.length > 0 && competitorResultData.otherproductsCompetitorList[i].hasOwnProperty('CompetitorAccount__r')
                                       && otherProductsCompetitorsList[j].hasOwnProperty('CompetitorAccount__r')) {
                                        if(otherProductsCompetitorsList[j].CompetitorAccount__r.Id == competitorResultData.otherproductsCompetitorList[i].CompetitorAccount__r.Id) {
                                            recordExist = true;
                                            if(otherProductsCompetitorsList[j].Type_of_Products_Services_Provided__c != '' && competitorResultData.otherproductsCompetitorList[i].Type_of_Products_Services_Provided__c != '') {
                                                otherProductsCompetitorsList[j].Type_of_Products_Services_Provided__c = otherProductsCompetitorsList[j].Type_of_Products_Services_Provided__c.concat(';',competitorResultData.otherproductsCompetitorList[i].Type_of_Products_Services_Provided__c);
                                            } else if(otherProductsCompetitorsList[j].Type_of_Products_Services_Provided__c == '') {
                                                otherProductsCompetitorsList[j].Type_of_Products_Services_Provided__c = otherProductsCompetitorsList[j].Type_of_Products_Services_Provided__c.concat(competitorResultData.otherproductsCompetitorList[i].Type_of_Products_Services_Provided__c);
                                            }
                                        }
                                    }
                                }
                                if(!recordExist) {
                                    otherProductsCompetitorsList.push(competitorResultData.otherproductsCompetitorList[i]);
                                }
                            } 
                        } else if(competitorResultData.otherproductsCompetitorList.length == 1) {
                            otherProductsCompetitorsList.push(competitorResultData.otherproductsCompetitorList[0]);
                        }
                        console.log('otherProductsCompetitorsList after Merge '+otherProductsCompetitorsList);
                        component.set('v.OtherProductsCompetitorsList', otherProductsCompetitorsList); 
                        /* Check if the same Competitor has multiple Other Products and merge to Single Record - END */
                        //component.set('v.OtherProductsCompetitorsList', competitorResultData.otherproductsCompetitorList);   
                    }
                    
                    if(isEditButtonEnabled == false) {
                        $A.util.addClass(component.find("editBtn"), 'slds-hide'); 
                    } else if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                    	$A.util.removeClass(component.find("editBtn"), 'slds-hide'); 
                    }                   
                    
                    component.set('v.competitorsAttributes',
                       {'TypeOfOtherProductsOrServicesProvided' : competitorResultData.typeOfOtherProductsProvided,
                        'PharmacyTotalCompetitorList' : competitorResultData.pharmacyTotalCompetitorObj,
                        'DentalTotalCompetitorList' : competitorResultData.dentalTotalCompetitorObj,
                        'VisionTotalCompetitorList' : competitorResultData.visionTotalCompetitorObj,
                        'AssociatedMedicalCarriers' : competitorResultData.medicalCompetitorList});
                    
                    /* Logic to build data which is required to pass multipicklist values to multiPicklistGenericComponent - START */
                        if(competitorResultData.medicalCompetitorList != null && competitorResultData.medicalCompetitorList != undefined && competitorResultData.medicalCompetitorList.length > 0) {
                            var associatedMedicalCarrierPicklistValues = [];
                            var associatedMedicalCarrierValue;
                            for(var i = 0 ; i < competitorResultData.medicalCompetitorList.length ; i++) {
                                associatedMedicalCarrierValue = Object.assign({}, { label: competitorResultData.medicalCompetitorList[i].CompetitorAccount__r.Name, value: competitorResultData.medicalCompetitorList[i].CompetitorAccount__r.Name });
                                associatedMedicalCarrierPicklistValues.push(associatedMedicalCarrierValue);
                            }
                            component.set('v.associatedMedicalCarrierPicklistValues',associatedMedicalCarrierPicklistValues);
                        }
                    /* Logic to build data which is required to pass multipicklist values to multiPicklistGenericComponent - END */
                    
                    /*
                     * Set the Business Model picklist values to the Dropdown dynamically in Pharmacy Section.
                     */ 
                    var businessModelArrayValues = [];
                    var businessModelValuesListFromSF = competitorResultData.businessModelPicklistValuesList;
                    businessModelArrayValues.push({text:'',value:''});
                    if(businessModelValuesListFromSF != null && businessModelValuesListFromSF != undefined &&
                      		businessModelValuesListFromSF.length > 0) {
                    	for(var i=0;i<businessModelValuesListFromSF.length;i++) {
                            var businessModelValueToBeAdded = { text:businessModelValuesListFromSF[i], value:businessModelValuesListFromSF[i]};                            
                            businessModelArrayValues.push(businessModelValueToBeAdded);
                    	}
                    }
                    //component.find("SearchDropDownForBusinessModel").set("v.options", businessModelArrayValues);
                    
                     /*
                     * Set the Pharmacy Coalition picklist values to the Dropdown dynamically in Pharmacy Section.
                     */ 
                    var pharmacyCoalitionArrayValues = [];
                    var pharmacyCoalitionPicklistValuesListFromSF = competitorResultData.pharmacyCoalitionPicklistValuesList;
                    pharmacyCoalitionArrayValues.push({text:'',value:''});
                    if(pharmacyCoalitionPicklistValuesListFromSF != null && pharmacyCoalitionPicklistValuesListFromSF != undefined &&
                      		pharmacyCoalitionPicklistValuesListFromSF.length > 0) {
                    	for(var i=0;i<pharmacyCoalitionPicklistValuesListFromSF.length;i++) {
                            var pharmacyCoalitionPicklistValuesToBeAdded = { text:pharmacyCoalitionPicklistValuesListFromSF[i], value:pharmacyCoalitionPicklistValuesListFromSF[i]};                            
                            pharmacyCoalitionArrayValues.push(pharmacyCoalitionPicklistValuesToBeAdded);
                    	}
                    }
                    component.set('v.pharmacyCoalitionPicklistValuesList',pharmacyCoalitionArrayValues);
                    
                    /*
                     * Set the Funding Type picklist values to the Dropdown dynamically in Dental Section.
                     */ 
                    var fundingTypeDentalArrayValues = [];
                    var fundingTypeDentalValuesListFromSF = competitorResultData.dentalFundingTypePicklistValuesList;
                    fundingTypeDentalArrayValues.push({text:'',value:''});
                    if(fundingTypeDentalValuesListFromSF != null && fundingTypeDentalValuesListFromSF != undefined &&
                      		fundingTypeDentalValuesListFromSF.length > 0) {
                    	for(var i=0;i<fundingTypeDentalValuesListFromSF.length;i++) {
                            var fundingTypeDentalValueToBeAdded = { text:fundingTypeDentalValuesListFromSF[i], value:fundingTypeDentalValuesListFromSF[i]};
                            fundingTypeDentalArrayValues.push(fundingTypeDentalValueToBeAdded);
                    	}
                    }
        			//component.find("SearchDropDownForFundingTypeDental").set("v.options", fundingTypeDentalArrayValues);
                    
                    
                    /*
                     * Set the Funding Type picklist values to the Dropdown dynamically in Vision Section.
                     */ 
                    var fundingTypeVisionArrayValues = [];
                    var fundingTypeVisionValuesListFromSF = competitorResultData.visionFundingTypePicklistValuesList;
                    fundingTypeVisionArrayValues.push({text:'',value:''});
                    if(fundingTypeVisionValuesListFromSF != null && fundingTypeVisionValuesListFromSF != undefined &&
                      		fundingTypeVisionValuesListFromSF.length > 0) {
                    	for(var i=0; i<fundingTypeVisionValuesListFromSF.length; i++) {
                            var fundingTypeVisionValueToBeAdded = { text:fundingTypeVisionValuesListFromSF[i], value:fundingTypeVisionValuesListFromSF[i]};                           
                            fundingTypeVisionArrayValues.push(fundingTypeVisionValueToBeAdded);
                    	}
                    }
        			//component.find("SearchDropDownForFundingTypeVision").set("v.options", fundingTypeVisionArrayValues);

                    if(competitorResultData.accountDataObj != undefined && competitorResultData.accountDataObj != null) {
                        component.set('v.accountData', competitorResultData.accountDataObj);
                    }
                    
                    //Code added for Print Option - start
                    if(competitorResultData!=null && competitorResultData!=undefined){
                        if(this.isListEmpty(competitorResultData.pharmacyCompetitorList)
                           && this.isListEmpty(competitorResultData.dentalCompetitorList)
                           && this.isListEmpty(competitorResultData.visionCompetitorList)
                           && this.isListEmpty(competitorResultData.otherproductsCompetitorList)){
                            component.set('v.disablePrintButton',true);
                           
                        }else{
                            component.set('v.disablePrintButton',false);
                        }
                    }else{
                        component.set('v.disablePrintButton',true);
                    }
                    //Code added for Print Option - end
                    
                    if(operationVal != undefined && operationVal != null && operationVal=='DisplayNewRecords') {
                    	this.editCompetitorRecords(component, event);    
                        var myLabel = component.find('utilityToggle').get("v.iconName");
                        if(myLabel=="utility:chevronright"){
                            var cmpTarget = component.find('competitiveLandscape_CM');
                            $A.util.addClass(cmpTarget,'slds-is-open');
                            component.find('utilityToggle').set("v.iconName","utility:chevrondown");
                        }
                    } else {
                        //------------SAMARTH------------
                        if(component.get('v.isEdit')){
                            this.editCompetitorRecords(component, event);
                        }
                        //------------SAMARTH------------
                        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                            var iOS = parseFloat(
                                ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                                .replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
                            
                            if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11) {              
                                $A.util.addClass(component.find('saveCancel'),'iosBottom');
                                $A.util.addClass(component.find('sortEdit'),'iosBottom');
                                $A.util.addClass(component.find('competitiveLandscape_CM'),'ipadBottomIos');
                            } else {
                                $A.util.addClass(component.find('competitiveLandscape_CM'),'ipadbottom');
                            }
                            $A.util.removeClass(component.find("action-bar-mobile"),'slds-hide');
                            $A.util.addClass(component.find('competitiveLandscape_CM'),'slds-is-open');
                            if($A.get("$Browser.isIOS")) {
                                $A.util.addClass(component.find('articleScroll'),'cScroll-table');
                            }
                        }
                    }
                }
                
                //-------------------------------Varun-------------------------------------//
                if(competitorResultData.isCsiUser && !competitorResultData.recordEditAccess){
                    component.set('v.isEditSaveDeleteButtonsEnabled',false);
                    component.set('v.disablePrintButton',true);
                }
                
                //-------------------------------Varun-------------------------------------//
                
                //---------------------SAMARTH---------------------
                else if(component.get('v.isEdit')) {
                        this.editCompetitorRecords(component, event);   
                }
                //---------------------SAMARTH---------------------
                
            	$A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
            } else if (state === "ERROR") {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0;i<ErrorMessage.length;i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });        
        $A.enqueueAction(accountCompetitorsAction);
    },
    
    editCompetitorRecords : function(component, event) {
    
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon1 = component.find("appletIcon");
        $A.util.addClass(appletIcon1, 'slds-hide');
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) { 
        	$A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("saveCancel"), 'hide');
            $A.util.addClass(component.find("sortEdit"), 'hide');
        } else {
            //component.find('addBtn').set("v.disabled", true);
        	component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            $A.util.removeClass(component.find("cancelBtn"), 'slds-hide');
        }
        
        /*component.find("SearchDropDownForBusinessModel").set('v.disabled', false);
        component.find("SearchDropDownForFundingTypeDental").set('v.disabled', false);
        component.find("SearchDropDownForFundingTypeVision").set('v.disabled', false);
        */
        var noOfComponents = 4;

        for(var i=1; i<=noOfComponents; i++) {
          	var childCmp = component.find("childComponent"+i);
            if(childCmp != null && childCmp != undefined) {
                if(Array.isArray(childCmp)) {
                    for(var j=0; j<childCmp.length; j++) {
                        childCmp[j].editFields();
                    } 
                } else {
                    childCmp.editFields();
                }
            }
        }
        
        component.set('v.isEdit', true);
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon1, 'slds-hide');
    },
    
    cancelChangesInCompetitorRecords : function(component, event) {
        
        component.set('v.competitorsDataInEditToBeRemoved',[]);
        component.set('v.indexToBeRemoved', -1);
    	var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) { 
            $A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.addClass(component.find("sortEdit"), 'hide');
           	$A.util.addClass(component.find("saveCancel"), 'hide');
        } else {
            component.find('addBtn').set("v.disabled", false);
            component.find('editBtn').set("v.disabled", false);
            $A.util.addClass(component.find("saveBtn"), 'slds-hide');
            $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        }
        
       /* component.find("SearchDropDownForBusinessModel").set('v.disabled', true);
        component.find("SearchDropDownForFundingTypeDental").set('v.disabled', true);
        component.find("SearchDropDownForFundingTypeVision").set('v.disabled', true);
        */
        component.set('v.isEdit', false);
        
		this.getCompetitorsData(component, event, 'OnLoad');
        
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            $A.util.removeClass(component.find("sortEdit"), 'hide');
        }
        
    },
    
    removeCompetitorRecord : function(component, event) {              
        debugger;
        var compObjDel = component.get('v.competitorData');
        if(compObjDel != undefined && compObjDel != null && compObjDel.Id != null) {
            var competitorsDataArray = component.get('v.competitorsDataInEditToBeRemoved');
            competitorsDataArray.push(compObjDel);
            component.set('v.competitorsDataInEditToBeRemoved', competitorsDataArray);
        }
        
		var accountType = component.get('v.accountTypeAttributes.AccountType');
        var compClassiVal = component.get('v.competitorData.Competitorclassification__c');
        compClassiVal = (compClassiVal != undefined && compClassiVal != null) ? compClassiVal : '';
        var compListNamesJSONMap = {"Pharmacy":"PharmacyCompetitorsList","Dental":"DentalCompetitorsList","Vision":"VisionCompetitorsList","Other":"OtherProductsCompetitorsList"};        
        
        var cmptrsArray = component.get('v.'+compListNamesJSONMap[compClassiVal]);
        
        /*
		 * Recalculations for the fields No. of members held, % of Members & Total - START
		 */ 
        
        var updcmptrsArray = [];
        var total = 0;
        var totalPercentage = 0.0;
        
        var indexVal = component.get('v.indexToBeRemoved');
        cmptrsArray.splice(indexVal, 1);
        
        for(var obj in cmptrsArray) {
            //if(compObjDel.Id != cmptrsArray[obj].Id) {
                //updcmptrsArray.push(cmptrsArray[obj]);
                if(cmptrsArray[obj].NumberOfMembersHeld__c != null && cmptrsArray[obj].Competitorclassification__c != 'Other') {
                    total = total + parseInt(cmptrsArray[obj].NumberOfMembersHeld__c);
                }
            //}
        }
        updcmptrsArray = cmptrsArray;
        if(accountType == $A.get("$Label.c.Client_Management") && compClassiVal != 'Other') {                                    
            if(updcmptrsArray != null && updcmptrsArray.length > 0) {
                for(var obj in updcmptrsArray) {
                    if(total > 0) {
                        var val = (parseFloat(updcmptrsArray[obj].NumberOfMembersHeld__c/total))*100;
                        updcmptrsArray[obj].ofMembersHeld__c = val.toFixed(2);    
                    } else {
                        updcmptrsArray[obj].ofMembersHeld__c = 0;
                    }
                    totalPercentage = totalPercentage + parseFloat(updcmptrsArray[obj].ofMembersHeld__c);
                }    
            }
        }
        component.set('v.'+compListNamesJSONMap[compClassiVal], updcmptrsArray);
        
        var compListTotalsJSONMap = {"Pharmacy":"PharmacyTotalCompetitorList","Dental":"DentalTotalCompetitorList","Vision":"VisionTotalCompetitorList"};
       
        var cmpTotalDataObj;
        if(compClassiVal != 'Other') {
            cmpTotalDataObj = component.get('v.competitorsAttributes.'+compListTotalsJSONMap[compClassiVal]);
            cmpTotalDataObj.NumberOfMembersHeld__c = total;
            cmpTotalDataObj.ofMembersHeld__c = totalPercentage;
            component.set('v.competitorsAttributes.'+compListTotalsJSONMap[compClassiVal], cmpTotalDataObj);
        }        
        
        /*
		 * Recalculations for the fields No. of members held, % of Members & Total - END
		 */
        
        var confirmDelList = component.find('confirmDelForCompetitorRecord');
        for(var i=0;i<confirmDelList.length;i++) {
            $A.util.addClass(confirmDelList[i], 'slds-hide');
        }
        
        if(component.get('v.isEdit')) {        
            return;
        }
        
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
        	$A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
        }
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');                
         
        component.find('addBtn').set("v.disabled", false);
        component.find('editBtn').set("v.disabled", false);
        
        $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        
       /* component.find("SearchDropDownForBusinessModel").set('v.disabled', true);
        component.find("SearchDropDownForFundingTypeDental").set('v.disabled', true);
        component.find("SearchDropDownForFundingTypeVision").set('v.disabled', true);                   
        */
        /* Seperate the Records to be deleted based on "Competitorclassification__c" to remove the Other Products when choosen - START */
        var competitorsDataInEditToBeRemoved = [];
        var competitorsDataToUpsert = [];
        var OtherProductsCompetitorsListBackup = component.get('v.OtherProductsCompetitorsListBackup');
        for(var i = 0 ; i < component.get('v.competitorsDataInEditToBeRemoved').length ; i++) {
            if(component.get('v.competitorsDataInEditToBeRemoved')[i].Competitorclassification__c != 'Other') {
                competitorsDataInEditToBeRemoved.push(component.get('v.competitorsDataInEditToBeRemoved')[i]);
            } else if(component.get('v.competitorsDataInEditToBeRemoved')[i].Competitorclassification__c == 'Other') {
                //Seperation of Records based on Products Selected Goes here 
                
                if(component.get('v.competitorsDataInEditToBeRemoved')[i].hasOwnProperty('Id')) {
                    for(var j = 0 ; j<OtherProductsCompetitorsListBackup.length ; j++) {
                        if((OtherProductsCompetitorsListBackup[j].CompetitorAccount__r.Id == component.get('v.competitorsDataInEditToBeRemoved')[i].CompetitorAccount__r.Id) && OtherProductsCompetitorsListBackup[j].Competitorclassification__c == 'Other' && component.get('v.competitorsDataInEditToBeRemoved')[i].Type_of_Products_Services_Provided__c != undefined) {
                            if(component.get('v.competitorsDataInEditToBeRemoved')[i].Type_of_Products_Services_Provided__c.includes(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c) && OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c != '') {
                                competitorsDataInEditToBeRemoved.push(OtherProductsCompetitorsListBackup[j]);
                            } else if(component.get('v.competitorsDataInEditToBeRemoved')[i].Type_of_Products_Services_Provided__c.includes(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c) && OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c == '') {
                                competitorsDataInEditToBeRemoved.push(OtherProductsCompetitorsListBackup[j]);
                            } 
                        }
                    }
                } 
            }
        }
        /* Seperate the Records to be deleted based on "Competitorclassification__c" to remove the Other Products when choosen - END */
        
        /* Logic to handle Upserting of Other Product types when delete Operation is performed - START */
        
        for(var i = 0 ; i < component.get('v.'+compListNamesJSONMap[compClassiVal]).length ; i++) {
            if(component.get('v.'+compListNamesJSONMap[compClassiVal])[i].Competitorclassification__c != 'Other') {
                competitorsDataToUpsert.push(component.get('v.'+compListNamesJSONMap[compClassiVal])[i]);
            } else if(component.get('v.'+compListNamesJSONMap[compClassiVal])[i].Competitorclassification__c == 'Other') {
                //Seperation of Records based on Products Selected Goes here 
                
                if(component.get('v.'+compListNamesJSONMap[compClassiVal])[i].hasOwnProperty('Id')) {
                    for(var j = 0 ; j<OtherProductsCompetitorsListBackup.length ; j++) {
                        if((OtherProductsCompetitorsListBackup[j].CompetitorAccount__r.Id == component.get('v.'+compListNamesJSONMap[compClassiVal])[i].CompetitorAccount__r.Id) && OtherProductsCompetitorsListBackup[j].Competitorclassification__c == 'Other') {
                            if(component.get('v.'+compListNamesJSONMap[compClassiVal])[i].Type_of_Products_Services_Provided__c != undefined && component.get('v.'+compListNamesJSONMap[compClassiVal])[i].Type_of_Products_Services_Provided__c.includes(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c) && OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c != '') {
                                competitorsDataToUpsert.push(OtherProductsCompetitorsListBackup[j]);
                            } 
                        }
                    }
                } 
            }
        }
        /* Logic to handle Upserting of Other Product types when delete Operation is performed - END */
        
        var removeCompetitorAction = component.get('c.deleteAccountCompetitorRecord');	
        removeCompetitorAction.setParams({
            "accountType" : component.get('v.accountTypeAttributes.AccountType'),
            "competitorsListToBeRemoved" : competitorsDataInEditToBeRemoved,
            "comptrsList" : competitorsDataToUpsert,
            "compTotalDataObj" : component.get('v.competitorsAttributes.'+compListTotalsJSONMap[compClassiVal])
        });
        removeCompetitorAction.setCallback(this, function(response) {
            var state = response.getState();
            component.set('v.indexToBeRemoved', -1);
            if (state === "SUCCESS") {  
            	component.set('v.competitorData', null);
                component.set('v.competitorsDataInEditToBeRemoved',[]);
                $A.util.addClass(spinner2, 'slds-hide');
            	this.getCompetitorsData(component, event, 'DeleteOperation');
            } else if (state === "ERROR") {
                component.set('v.competitorData', null);
                $A.util.removeClass(spinner2, 'slds-show');
                $A.util.addClass(spinner2, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0;i<ErrorMessage.length;i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });        
        $A.enqueueAction(removeCompetitorAction);
        
    },
    
    saveCompetitorsRecords : function(component, event) {
         
        component.set('v.isEdit', false);
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
        	$A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var accountType = component.get('v.accountTypeAttributes.AccountType');
		var competitorIdsArray = component.get("v.competitorIdArray");

        var isReminderPopUp = false;
        var isReminderPopUp1 = false;
        
        if(accountType != undefined && accountType != null && accountType === $A.get("$Label.c.Client_Development") || 
           		accountType === $A.get("$Label.c.Aggregator")) {
          		
            if(competitorIdsArray != null && competitorIdsArray != undefined && competitorIdsArray.length > 0) {
            
                if(isDeviceIconsToBeEnabled) {
                    $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                }
                isReminderPopUp = true;
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                var confirmCancelForPromptList = component.find('reminderPopUp');
                for(var i=0;i<confirmCancelForPromptList.length;i++) {
                    $A.util.removeClass(confirmCancelForPromptList[i], 'slds-hide');
                }
                component.set("v.competitorIdArray", []);
            }
            
            var competitorClassificationNamesJSONMap = {1:"PharmacyCompetitorsList",2:"DentalCompetitorsList",3:"VisionCompetitorsList"};
            for(var j=1;j<4;j++) {
             	var competitorsList = component.get('v.'+competitorClassificationNamesJSONMap[j]);
                if(competitorsList!= null && competitorsList.length > 0) {
                    var isPrimary = false;
                    var isSecondary = false;
                    if(competitorsList != null && competitorsList.length == 1) {
						if(competitorsList[0].PrimaryIncumbent__c != null && 
                                competitorsList[0].PrimaryIncumbent__c != undefined && competitorsList[0].PrimaryIncumbent__c) {
                            isPrimary = true;
                            isSecondary = true;
                        } else if(competitorsList[0].SecondaryIncumbent__c != null && 
                                competitorsList[0].SecondaryIncumbent__c != undefined && competitorsList[0].SecondaryIncumbent__c) {
                            isSecondary = true;
                            isPrimary = true;
                        }                        
                    } else {
                    	for(var i=0;i<competitorsList.length;i++) {
                            if(competitorsList[i].PrimaryIncumbent__c != null && 
                                    competitorsList[i].PrimaryIncumbent__c != undefined && competitorsList[i].PrimaryIncumbent__c) {
                                isPrimary = true;
                            }
                            if(competitorsList[i].SecondaryIncumbent__c != null && 
                                    competitorsList[i].SecondaryIncumbent__c != undefined && competitorsList[i].SecondaryIncumbent__c) {
                                isSecondary = true;
                            }
                    	}   
                    }
                    
                    if(isPrimary === false || isSecondary === false) {
                        
                        var incumbentButtonsUnChecked = component.get('v.incumbentButtonsUnChecked');
                        if(incumbentButtonsUnChecked != undefined && incumbentButtonsUnChecked != null &&
                          		incumbentButtonsUnChecked) {
                        	isReminderPopUp1 = false;    
                        } else { 
                            if(isDeviceIconsToBeEnabled) {
                                $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                            }
                            isReminderPopUp1 = true;
                            component.set('v.incumbentButtonsUnChecked', true);
                            $A.util.addClass(spinner1, 'slds-hide');
                            $A.util.addClass(spinner2, 'slds-hide');
                            $A.util.removeClass(appletIcon, 'slds-hide');
                            var confirmCancelForPromptList = component.find('reminderPopUp');
                            for(var i=0;i<confirmCancelForPromptList.length;i++) {
                                $A.util.removeClass(confirmCancelForPromptList[i], 'slds-hide');
                            }
                            break;
                        }
                    }
                }   
            }
        } 
        
        
        if(isReminderPopUp === false && isReminderPopUp1 === false) {
            
            var competitorsListArray = [];
            var finalCompetitorsListArray = [];
            var otherCompetitorsProductsListArray = [];
            if(component.get('v.PharmacyCompetitorsList') != undefined && component.get('v.PharmacyCompetitorsList').length > 0) {
                competitorsListArray.push.apply(competitorsListArray, component.get('v.PharmacyCompetitorsList'));
            }
            if(component.get('v.DentalCompetitorsList') != undefined && component.get('v.DentalCompetitorsList').length > 0) {
                competitorsListArray.push.apply(competitorsListArray, component.get('v.DentalCompetitorsList'));
            }
            if(component.get('v.VisionCompetitorsList') != undefined && component.get('v.VisionCompetitorsList').length > 0) {
                competitorsListArray.push.apply(competitorsListArray, component.get('v.VisionCompetitorsList'));
            }
            //competitorsListArray.push.apply(competitorsListArray, component.get('v.OtherProductsCompetitorsList'));
            competitorsListArray.push(component.get('v.competitorsAttributes.PharmacyTotalCompetitorList'));
            
            //if(component.get('v.competitorsAttributes.DentalTotalCompetitorList')[0] != undefined) {
                competitorsListArray.push(component.get('v.competitorsAttributes.DentalTotalCompetitorList'));
            //}
            //if(component.get('v.competitorsAttributes.VisionTotalCompetitorList')[0] != undefined) {
                competitorsListArray.push(component.get('v.competitorsAttributes.VisionTotalCompetitorList'));
            //}
            console.log('competitorsListArray Before comment= ',JSON.stringify(competitorsListArray));

            var upsertOtherProductsCompetitorsList = [];
            var deleteOtherProductsCompetitorsList = [];
            var competitorsListToBeRemoved = [];
            var insertOtherCompetitorRecords = [];
            var OtherProductsCompetitorsList = [];
            var competitorsListArrayTest = []; // Mohan - Variable created to fix infinite loop
            var blankRecordUpdated = false;
            var j;
            var OtherProductsCompetitorsListBackup = component.get('v.OtherProductsCompetitorsListBackup');

            
            //Adding OtherProductsCompetitorsList to seperate Variable and pasing it to Apex
            OtherProductsCompetitorsList = component.get('v.OtherProductsCompetitorsList');
            /* Check if the compitetor already exists or need to be created or it has to be deleted - START */
            for (var i = 0 ; i<OtherProductsCompetitorsList.length; i++) {
                var typesOfOtherProducts = [];
                blankRecordUpdated = false;
                if(OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c != undefined) {
                    typesOfOtherProducts = OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c.split(';');
                }
                if(OtherProductsCompetitorsList[i].hasOwnProperty('Id')) {
                    for(j = 0 ; j<OtherProductsCompetitorsListBackup.length ; j++) {
                        if(OtherProductsCompetitorsListBackup[j].CompetitorAccount__r.Id == OtherProductsCompetitorsList[i].CompetitorAccount__r.Id) {
                            if(OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c.includes(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c) && OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c != '') {
                                upsertOtherProductsCompetitorsList.push(OtherProductsCompetitorsListBackup[j]);
                                competitorsListArray.push(OtherProductsCompetitorsListBackup[j]);
                                competitorsListArray[competitorsListArray.length - 1].Comments__c = OtherProductsCompetitorsList[i].Comments__c;
                            } else if(!OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c.includes(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c) && OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c == '') {
                                if(typesOfOtherProducts.length == 1 && typesOfOtherProducts[0] == '') {
                                    //competitorsListArray.push(OtherProductsCompetitorsList[i]);
                                    /* Preventing from adding same blank record twice - START */
                                    var blankRecordAdded = false;
                                    for(var k = 0 ; k < competitorsListArray.length ; k++) {
                                        if(competitorsListArray[k].hasOwnProperty('Id')) {
                                            if(OtherProductsCompetitorsList[i].Id.includes(competitorsListArray[k].Id) && !blankRecordAdded) {
                                                //competitorsListArray.push(OtherProductsCompetitorsList[i]);
                                                blankRecordAdded = true;
                                            }
                                        }
                                    }
                                    if(!blankRecordAdded) {
                                        competitorsListArray.push(OtherProductsCompetitorsList[i]);
                                        competitorsListArray[competitorsListArray.length - 1].Comments__c = OtherProductsCompetitorsList[i].Comments__c;
                                    } else if(blankRecordAdded) {
                                        deleteOtherProductsCompetitorsList.push(OtherProductsCompetitorsListBackup[j]);
                                    }
                                    /* Preventing from adding same blank record twice - END */
                                }
                            } else {
                                if(!OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c.includes(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c)) {
                                    deleteOtherProductsCompetitorsList.push(OtherProductsCompetitorsListBackup[j]);
                                }
                                
                                /* Logic to update blank record to product selected Test*/
                                if(OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c.includes(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c) && OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c != '') {
                                    if(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c == '' && !blankRecordUpdated) {
                                        competitorsListArray.push(OtherProductsCompetitorsListBackup[j]);
                                        competitorsListArray[competitorsListArray.length - 1].Comments__c = OtherProductsCompetitorsList[i].Comments__c;
                                        blankRecordUpdated = true;
                                        if(competitorsListArray[competitorsListArray.length - 1].Type_of_Products_Services_Provided__c != undefined) {
                                            competitorsListArray[competitorsListArray.length - 1].Type_of_Products_Services_Provided__c = OtherProductsCompetitorsList[i].Type_of_Products_Services_Provided__c.split(';')[0];
                                        }
                                        
                                    }
                                }
                            }
                            
                            //Check if the Other product is present in the typeOfOtherProducts List
                            if(typesOfOtherProducts.indexOf(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c) != -1) {
                                var index = typesOfOtherProducts.indexOf(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c);
                                delete typesOfOtherProducts[index];
                            }
                        }
                    }
                    
                    for(var k = 0 ; k<typesOfOtherProducts.length; k++) {
                        if(typesOfOtherProducts[k] != undefined && typesOfOtherProducts[k] != '') {
                            var insertOtherProductRecord = [];
                            insertOtherProductRecord = Object.assign({},OtherProductsCompetitorsList[i]);
                            //insertOtherProductRecord.push(OtherProductsCompetitorsListBackup[j]);
                            insertOtherProductRecord.Type_of_Products_Services_Provided__c = typesOfOtherProducts[k];
                            delete insertOtherProductRecord.Id;
                            insertOtherProductRecord.Account__c = component.get('v.recordId');
                            insertOtherProductRecord.Type__c = 'Account Competitor';
                            insertOtherCompetitorRecords.push(insertOtherProductRecord);
                            competitorsListArray.push(insertOtherProductRecord);
                            competitorsListArray[competitorsListArray.length - 1].Comments__c = OtherProductsCompetitorsList[i].Comments__c;
                        }
                    }
                } else {
                    var count = 0;
                    for(j = 0 ; j<OtherProductsCompetitorsListBackup.length ; j++) {
                       if(OtherProductsCompetitorsListBackup[j].CompetitorAccount__r.Id == OtherProductsCompetitorsList[i].CompetitorAccount__r.Id) {
                            if(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c == '') {
                                competitorsListArray.push(OtherProductsCompetitorsListBackup[j]);
                                if(typesOfOtherProducts[0] != undefined && typesOfOtherProducts[0] !='') {
                                    competitorsListArray[competitorsListArray.length - 1].Type_of_Products_Services_Provided__c = typesOfOtherProducts[0];
                                    competitorsListArray[competitorsListArray.length - 1].Comments__c = OtherProductsCompetitorsList[i].Comments__c;
                                    count = 1;
                                }
                            }
                           
                           /* Check if the product is already created for the competitor & avoid it from being added again(duplicate) - START */
                            if(typesOfOtherProducts.indexOf(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c) != -1) {
                                var index = typesOfOtherProducts.indexOf(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c);
                                delete typesOfOtherProducts[index];
                            }
                           
                           /* Check if the product is already created for the competitor & avoid it from being added again(duplicate) - END */
                       }
                    }
                    
                    for(var k = 0 ; k < competitorsListArray.length ; k++) {
                        if(competitorsListArray[k].hasOwnProperty('CompetitorAccount__r') && competitorsListArray[k].Competitorclassification__c == 'Other') {
                            if(OtherProductsCompetitorsList[i].CompetitorAccount__r.Id == competitorsListArray[k].CompetitorAccount__r.Id) {
                                if(competitorsListArray[k].hasOwnProperty('Type_of_Products_Services_Provided__c') && competitorsListArray[k].Type_of_Products_Services_Provided__c != '') {
                                    if(typesOfOtherProducts.indexOf(competitorsListArray[k].Type_of_Products_Services_Provided__c) != -1) {
                                        var index = typesOfOtherProducts.indexOf(competitorsListArray[k].Type_of_Products_Services_Provided__c);
                                        delete typesOfOtherProducts[index];
                                    }
                                } else if(competitorsListArray[k].Type_of_Products_Services_Provided__c == '') {
                                    if(typesOfOtherProducts[0] != undefined && typesOfOtherProducts[0] != '') {
                                        competitorsListArray[competitorsListArray.length - 1].Type_of_Products_Services_Provided__c = typesOfOtherProducts[0];
                                        competitorsListArray[competitorsListArray.length - 1].Comments__c = OtherProductsCompetitorsList[i].Comments__c;
                                        competitorsListArrayTest.push(competitorsListArray[k]); /* Mohan - Infinite loop issue fix */
                                        count = 1;
                                    }
                                }
                            }
                        }
                    }
                    /* Mohan - Infinite loop issue fix */
                    for( var a = 0 ; a < competitorsListArrayTest.length ; a++) {
                        competitorsListArray.push(competitorsListArrayTest[a]);
                    }
                    
                    for(var k = count ; k<typesOfOtherProducts.length; k++) {
                        if(typesOfOtherProducts[k] != undefined && typesOfOtherProducts[k] != '') {
                            var insertOtherProductRecord = [];
                            insertOtherProductRecord = Object.assign({},OtherProductsCompetitorsList[i]);
                            insertOtherProductRecord.Type_of_Products_Services_Provided__c = typesOfOtherProducts[k];
                            insertOtherCompetitorRecords.push(insertOtherProductRecord);
                            competitorsListArray.push(insertOtherProductRecord);
                            competitorsListArray[competitorsListArray.length - 1].Comments__c = OtherProductsCompetitorsList[i].Comments__c;
                        } 
                    }
                    /* Condition to check if no Other Products are selected then just create Competitor Record */
                    if(typesOfOtherProducts.length == 0 ) {
                        var competitorExists = false;
                        for(j = 0 ; j<OtherProductsCompetitorsListBackup.length ; j++) {
                            if(OtherProductsCompetitorsListBackup[j].CompetitorAccount__r.Id == OtherProductsCompetitorsList[i].CompetitorAccount__r.Id) {
                                competitorExists = true;
                            }
                        }
                        
                        /* Check if the user adds 2 or more dulicate competitors and avoid blank records from being created */
                        for(var k = 0 ; k < competitorsListArray.length ; k++) {
                            if(competitorsListArray[k].CompetitorAccount__r.Id == OtherProductsCompetitorsList[i].CompetitorAccount__r.Id && competitorsListArray[k].Competitorclassification__c == 'Other') { //Mohan - Top Competitors is not being added when it as added in Pharmacy/Dental/Vision
                                competitorExists = true;
                            }
                        }
                        if(!competitorExists) {
                            competitorsListArray.push(OtherProductsCompetitorsList[i]);
                            competitorsListArray[competitorsListArray.length - 1].Comments__c = OtherProductsCompetitorsList[i].Comments__c;
                        }
                    }
                }
                
            }
            /* Check if the compitetor already exists or need to be created or it has to be deleted - END */
            
            /* Checking if the Other Products Record is present in "component.get('v.competitorsDataInEditToBeRemoved')" variable in Edit mode and pushing it to deleteOtherProductsCompetitorsList in order to Delete Record - START */
            if(component.get('v.competitorsDataInEditToBeRemoved') != undefined && component.get('v.competitorsDataInEditToBeRemoved').length > 0) {
                for( var i = 0 ; i < component.get('v.competitorsDataInEditToBeRemoved').length ; i++) {
                    if(component.get('v.competitorsDataInEditToBeRemoved')[i].Competitorclassification__c == 'Other') {
                        for(j = 0 ; j<OtherProductsCompetitorsListBackup.length ; j++) {
                            if(OtherProductsCompetitorsListBackup[j].CompetitorAccount__r.Id == component.get('v.competitorsDataInEditToBeRemoved')[i].CompetitorAccount__r.Id) {
                                if(component.get('v.competitorsDataInEditToBeRemoved')[i].Type_of_Products_Services_Provided__c.includes(OtherProductsCompetitorsListBackup[j].Type_of_Products_Services_Provided__c)) {
                                    deleteOtherProductsCompetitorsList.push(OtherProductsCompetitorsListBackup[j]);
                                }
                            }
                        }
                    } else {
                        competitorsListToBeRemoved.push(component.get('v.competitorsDataInEditToBeRemoved')[i]);
                    }
                }
            }
            /* Checking if the Other Products Record is present in "component.get('v.competitorsDataInEditToBeRemoved')" variable in Edit mode and pushing it to deleteOtherProductsCompetitorsList in order to Delete Record - END */
            
            /* Checking the List "competitorsListArray" has "Type_of_Products_Services_Provided__c" and assigning the "Competitorclassification__c" if it is not present - START */
            
            for(var i = 0 ; i < competitorsListArray.length ; i++) {
                if(!competitorsListArray[i].hasOwnProperty('Type_of_Products_Services_Provided__c') && competitorsListArray[i].Competitorclassification__c != undefined && competitorsListArray[i].Competitorclassification__c != 'Other') {
                    competitorsListArray[i].Type_of_Products_Services_Provided__c = competitorsListArray[i].Competitorclassification__c;
                }
            }
            
            /* Checking the List "competitorsListArray" has "Type_of_Products_Services_Provided__c" and assigning the "Competitorclassification__c" if it is not present - END */
            
            /* Check for duplicate records on Other buy up products and eliminate it, If duplicate record exists - START */
           /* for( var i = 0 ; i < competitorsListArray.length ; i++) {
                if(competitorsListArray[i].Competitorclassification__c != 'Other') {
                    finalCompetitorsListArray.push(competitorsListArray[i]);
                } else if(competitorsListArray[i].Competitorclassification__c == 'Other') {
                    for(var j = 0 ; j < competitorsListArray.length ; j++) {
                        if(competitorsListArray[i].CompetitorAccount__r.Id == competitorsListArray[j].CompetitorAccount__r.Id && competitorsListArray[i].Type_of_Products_Services_Provided__c != competitorsListArray[j].Type_of_Products_Services_Provided__c && competitorsListArray[j].Competitorclassification__c == 'Other') {
                            otherCompetitorsProductsListArray.push(competitorsListArray[j]);
                        }
                        if(j >= competitorsListArray.length) {
                            break;
                        }
                    }
                }
            } */
            
            /* Check for duplicate records on Other buy up products and eliminate it, If duplicate record exists - END */
            
            /* Pushing the Other records to be deleted to competitorsListToBeRemoved */
            if(deleteOtherProductsCompetitorsList.length > 0 && deleteOtherProductsCompetitorsList != undefined) {
                //Pushing logic goes here....!!!
                competitorsListToBeRemoved.push.apply(competitorsListToBeRemoved,deleteOtherProductsCompetitorsList);
            }

            //--------------Added by Varun----------------//
            for(var i=0;i<competitorsListArray.length;i++){
                if(!Object.keys(competitorsListArray[i]).length){
                    competitorsListArray.splice(i,1);
                    i = i-1;
                }
            }
            //--------------Added by Varun----------------//

            console.log('competitorsListArray = ',JSON.stringify(competitorsListArray));
            var action = component.get('c.upsertAccountCompetitorRecords');
            
            action.setParams({
                "BusinessModelValue" : '',//component.find('SearchDropDownForBusinessModel').get('v.value'),
                "FundingTypeDentalValue" :'',// component.find('SearchDropDownForFundingTypeDental').get('v.value'),
                "FundingTypeVisionValue" : '',//component.find('SearchDropDownForFundingTypeVision').get('v.value'),
                "competitorsListToBeUpserted" : competitorsListArray,
                "competitorsListToBeRemoved" : competitorsListToBeRemoved,
                "accountId" : component.get('v.recordId')
	            });
            
            action.setCallback(this,function(response){

                var state = response.getState();
                component.set('v.incumbentButtonsUnChecked', false);
                if(state == "SUCCESS") {
                    component.set('v.competitorsDataInEditToBeRemoved',[]);
                    component.find('addBtn').set("v.disabled", false);
                    component.find('editBtn').set("v.disabled", false);
                    $A.util.addClass(component.find("saveBtn"), 'slds-hide');
                    $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
                    /*component.find("SearchDropDownForBusinessModel").set('v.disabled', true);
                    component.find("SearchDropDownForFundingTypeDental").set('v.disabled', true);
                    component.find("SearchDropDownForFundingTypeVision").set('v.disabled', true);*/
                    $A.util.addClass(spinner1, 'slds-hide');
                    $A.util.addClass(spinner2, 'slds-hide');
                    $A.util.removeClass(appletIcon, 'slds-hide');
                    this.getCompetitorsData(component, event, 'UpsertOperation');
                    if(isDeviceIconsToBeEnabled) {
                        $A.util.removeClass(component.find("sortEdit"), 'hide');
                        $A.util.addClass(component.find("saveCancel"), 'hide');
                    }
                } else if (state === "ERROR") {
                    $A.util.addClass(spinner1, 'slds-hide');
                    $A.util.addClass(spinner2, 'slds-hide');
                    $A.util.removeClass(appletIcon, 'slds-hide');
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i=0;i<ErrorMessage.length;i++){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
            	}
            });
            $A.enqueueAction(action);    
        }
        
    },
    
    updateTotalAndPerOfMembersRecords : function(component, event, competitorClassificationNameVal) {

        var competitorClassificationNamesJSONMap = {"Pharmacy":"PharmacyCompetitorsList","Dental":"DentalCompetitorsList","Vision":"VisionCompetitorsList"};
        var competitorClassificationTotalsJSONMap = {"Pharmacy":"PharmacyTotalCompetitorList","Dental":"DentalTotalCompetitorList","Vision":"VisionTotalCompetitorList"};
            
        if(competitorClassificationNameVal.trim().length > 0) {
            
            var competitorListName = competitorClassificationNamesJSONMap[competitorClassificationNameVal];
            var competitorTotalListName = competitorClassificationTotalsJSONMap[competitorClassificationNameVal];
            
            /*
             * Update the Total record on change of Number of Members Held in the Pharmacy, Dental, Vision Sections.
             */ 
            var competitorsList = component.get('v.'+competitorListName);
            var competitorTotalList = component.get('v.competitorsAttributes.'+competitorTotalListName); 
            
            var total = 0;
            for(var i=0;i<competitorsList.length;i++) {
                if(competitorsList[i].NumberOfMembersHeld__c != null &&
                   		competitorsList[i].NumberOfMembersHeld__c != undefined) {
                    total = total + parseInt(competitorsList[i].NumberOfMembersHeld__c);   
                }
            }
            competitorTotalList.NumberOfMembersHeld__c = total;
            component.set('v.competitorsAttributes.'+competitorTotalListName, competitorTotalList); 
            
            /*
             * Update the % of Members Held & Total record on change of Number of Members Held 
             * in the Pharmacy, Dental, Vision Sections.
             */
            var totalPercentageVal = 0.00;
            if(total > 0) {
            	for(var i=0;i<competitorsList.length;i++) {
                    if(competitorsList[i].NumberOfMembersHeld__c != null &&
                            competitorsList[i].NumberOfMembersHeld__c != undefined) {
                        competitorsList[i].ofMembersHeld__c =
                            ((parseInt(competitorsList[i].NumberOfMembersHeld__c)/total)*100).toFixed(2);
                        totalPercentageVal = totalPercentageVal + ((parseInt(competitorsList[i].NumberOfMembersHeld__c)/total)*100);    
                    }
            	}    
            } else if(total == 0) {
                for(var i=0;i<competitorsList.length;i++) {
                    if(competitorsList[i].NumberOfMembersHeld__c != null &&
                            competitorsList[i].NumberOfMembersHeld__c != undefined) {
                        competitorsList[i].ofMembersHeld__c = 0;
                    }
            	}
            }
            component.set('v.'+competitorListName, competitorsList);
            competitorTotalList.ofMembersHeld__c = totalPercentageVal.toFixed(2);
            component.set('v.competitorsAttributes.'+competitorTotalListName, competitorTotalList);
        }
    
    },
    
    updateCDTotalRecords : function(component, event, competitorClassificationNameVal) {
        
        var competitorClassificationNamesJSONMap = {"Pharmacy":"PharmacyCompetitorsList","Dental":"DentalCompetitorsList","Vision":"VisionCompetitorsList"};
        var competitorClassificationTotalsJSONMap = {"Pharmacy":"PharmacyTotalCompetitorList","Dental":"DentalTotalCompetitorList","Vision":"VisionTotalCompetitorList"};
            
        if(competitorClassificationNameVal.trim().length > 0) {
            
            var competitorListName = competitorClassificationNamesJSONMap[competitorClassificationNameVal];
            var competitorTotalListName = competitorClassificationTotalsJSONMap[competitorClassificationNameVal];
            
            /*
             * Update the Total record on change of Number of Members Held in the Pharmacy, Dental, Vision Sections.
             */ 
            var competitorsList = component.get('v.'+competitorListName);
            var competitorTotalList = component.get('v.competitorsAttributes.'+competitorTotalListName); 
            
            var total = 0;
            for(var i=0;i<competitorsList.length;i++) {
                if(competitorsList[i].NumberOfMembersHeld__c != null &&
                   		competitorsList[i].NumberOfMembersHeld__c != undefined) {
                    total = total + parseInt(competitorsList[i].NumberOfMembersHeld__c);   
                }
            }
            competitorTotalList.NumberOfMembersHeld__c = total;
            component.set('v.competitorsAttributes.'+competitorTotalListName, competitorTotalList); 
        }
    },
    
    updatePicklistValues : function(component, event, competitorId, competitorPicklistVal, competitorClassificationNameVal) {
        
        var competitorClassificationNamesJSONMap = {"Pharmacy":"PharmacyCompetitorsList","Dental":"DentalCompetitorsList","Vision":"VisionCompetitorsList","Others":"OtherProductsCompetitorsList"};
        
        var competitorsList = component.get('v.'+competitorClassificationNamesJSONMap[competitorClassificationNameVal]);
        
        if(competitorClassificationNameVal == 'Others') {
            if(competitorsList != null && competitorsList != undefined && competitorsList.length > 0) {
                for(var i=0;i<competitorsList.length;i++) {
                    if(competitorsList[i].CompetitorAccount__r.Id === competitorId) {
                        competitorsList[i].Type_of_Products_Services_Provided__c = competitorPicklistVal;
                    }
                }
                component.set('v.'+competitorClassificationNamesJSONMap[competitorClassificationNameVal], competitorsList);
            }   
        } else {
            if(competitorsList != null && competitorsList != undefined && competitorsList.length > 0) {
                for(var i=0;i<competitorsList.length;i++) {
                    if(competitorsList[i].CompetitorAccount__r.Id === competitorId) {
                        competitorsList[i].AssociatedMedicalCarrier__c = competitorPicklistVal;
                    }
                }
                component.set('v.'+competitorClassificationNamesJSONMap[competitorClassificationNameVal], competitorsList);
            } 
        }
    },
    
    toggleHelper : function(component,event) {
        var toggleText = component.find("tooltip1");
        $A.util.toggleClass(toggleText, "toggle");
    },
    
    modalGenericClose : function(component) {
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
            component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
        }
    },
    
    isListEmpty:function(lst)
    {
        var isListEmpty=true;
        if(lst!=undefined && lst!=null && lst.length>0)
        {
                isListEmpty=false;
        }
        
        return isListEmpty;
    },
})