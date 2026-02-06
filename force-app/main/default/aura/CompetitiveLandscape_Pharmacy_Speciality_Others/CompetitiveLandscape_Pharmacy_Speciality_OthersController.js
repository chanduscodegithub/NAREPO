({
	doInit : function(component, event, helper) { 
        
        component.set('v.cmptrsListNamesJSONObj', '{"Pharmacy":"PharmacyCompetitorsList","Dental":"DentalCompetitorsList","Vision":"VisionCompetitorsList","Other":"OtherProductsCompetitorsList"}');
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    helper.getUserInfo(component, event);
                }            
            }, 5000);           
        } else {
            component.set("v.isDeviceIconsToBeEnabled", true);
            helper.getUserInfo(component, event);
        }
        
        console.log("-------------");
        var lst=component.get('v.PharmacyCompetitorsList');
        console.log("PharmacyCompetitorsList==>"+lst.length);
        console.log("DentalCompetitorsList==>"+component.get('v.DentalCompetitorsList'));
        console.log("VisionCompetitorsList==>"+component.get('v.VisionCompetitorsList'));
        console.log("OtherProductsCompetitorsList==>"+component.get('v.OtherProductsCompetitorsList'));
        console.log("-------------");
	},
    
    setGeneralValues: function(component, event, helper) {			
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                //if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['CompetitiveLandscapeRolesSpecialOthersProduct'] != null){
                if(generalObj.HasEditAccess != null){                                          
                    component.set('v.isEditSaveDeleteButtonsEnabled',generalObj.HasEditAccess);
                    helper.setAccountType(component, generalObj.accountType);
                    helper.getCompetitorsData(component, event, 'OnLoad');
                }else{
                    helper.getUserInfo(component, event);
                }
            }else{
                helper.getUserInfo(component, event);
            }  
        }else{            
            helper.getUserInfo(component, event);
        }              
    },
    
    changeInCompetitorsData : function(component, event, helper) { 
        
        var isNumberOfMembersHeldChangeVal = event.getParam("isNumberOfMembersHeldChange");
        var competitorClassificationNameVal = event.getParam("competitorClassificationName");
        var competitorPicklistSelectedValue = event.getParam("competitorPicklistSelectedVal");
        var competitorIdToBeUpdatedVal = event.getParam("competitorIdToBeUpdated");
        var competitorDataToBeRemovedObj = event.getParam("competitorDataToBeRemoved");
        var competitorIdVal = event.getParam("competitorId");
        var clearOtherPrimaryIncumbentsVal = event.getParam("clearOtherPrimaryIncumbents");
        
        if(isNumberOfMembersHeldChangeVal != null && isNumberOfMembersHeldChangeVal != undefined &&
           		isNumberOfMembersHeldChangeVal && competitorClassificationNameVal != null && 
           			competitorClassificationNameVal != undefined) {
            
           helper.updateTotalAndPerOfMembersRecords(component, event, competitorClassificationNameVal);
            
        } /*else if(competitorIdToBeUpdatedVal != null && competitorIdToBeUpdatedVal != undefined &&
           			competitorPicklistSelectedValue != null && competitorPicklistSelectedValue != undefined &&
                 		competitorClassificationNameVal != null && competitorClassificationNameVal != undefined) {
            
            helper.updatePicklistValues(component, event, competitorIdToBeUpdatedVal, competitorPicklistSelectedValue, competitorClassificationNameVal);
            
        }*/ else if(competitorDataToBeRemovedObj != null && competitorDataToBeRemovedObj != undefined) {
            
            var confirmDelList = component.find('confirmDelForCompetitorRecord');
            for(var i=0;i<confirmDelList.length;i++) {
                $A.util.removeClass(confirmDelList[i], 'slds-hide');
            }
            component.set('v.indexToBeRemoved', event.getParam("index"));
            component.set('v.competitorData', competitorDataToBeRemovedObj);
            
        } else if(competitorIdVal != null && competitorIdVal != undefined && competitorClassificationNameVal != null &&
           			competitorClassificationNameVal != undefined) {
            
            var competitorIdsArray = component.get("v.competitorIdArray");
            //console.log('Array Values from Child Comp ->'+cmAccountTeamHistoryIdsArray);            
            if(competitorIdsArray == null || competitorIdsArray == undefined || competitorIdsArray.length == 0) {
                competitorIdsArray.push(competitorIdVal);
            } else {
                if(Array.isArray(competitorIdsArray)) {
                    if(competitorIdsArray.indexOf(competitorIdVal) < 0) {
                        competitorIdsArray.push(competitorIdVal);
                    }
                }
            }
           	//console.log('Event Vals -> '+cmAccountTeamHistoryIdsArray);
            component.set("v.competitorIdArray",competitorIdsArray);
            helper.updateCDTotalRecords(component, event, competitorClassificationNameVal);
            
        } else if(clearOtherPrimaryIncumbentsVal != null && clearOtherPrimaryIncumbentsVal != undefined) {
			
            //console.log('Clear');
            var indexVal = event.getParam("index");
            var childComponentOrder = {"Pharmacy":"1","Dental":"2","Vision":"3"};
            var competitorClassificationNamesJSONMap = {"Pharmacy":"PharmacyCompetitorsList","Dental":"DentalCompetitorsList","Vision":"VisionCompetitorsList"};
            var childCmp = 1;
            
            if(competitorClassificationNameVal != null && competitorClassificationNameVal != undefined) {
                var i = childComponentOrder[competitorClassificationNameVal];
                var childCmp = component.find("childComponent"+i); 
            }
            var listVal = component.get('v.'+competitorClassificationNamesJSONMap[competitorClassificationNameVal]);
            var j=0;
            if(listVal != null && listVal != undefined && childCmp != undefined && childCmp != null &&
               childCmp.length != listVal.length) {
                indexVal = indexVal + 1;
                j=1;
            }
            
            if(clearOtherPrimaryIncumbentsVal) {
                if(childCmp != null && childCmp != undefined) {
                    if(Array.isArray(childCmp)) {
                        for(j=j; j<childCmp.length; j++) {
                            if(indexVal != j){
                                childCmp[j].clearPrimaryIncumbentFields(true);
                            }
                        } 
                        j = 0;
                    }
                }
                
            } else if(clearOtherPrimaryIncumbentsVal == false) {
                if(childCmp != null && childCmp != undefined) {
                    if(Array.isArray(childCmp)) {
                        for(j=j; j<childCmp.length; j++) {
                            if(indexVal != j){
                                childCmp[j].clearPrimaryIncumbentFields(false);    
                            }
                        } 
                        j = 0;
                    }
                }
            }
        }
        
    },
    
    addRecord : function(component, event, helper) {
		
        var myLabel = component.find("utilityToggle").get("v.iconName");        
        if(myLabel != undefined && myLabel != null && myLabel == "utility:chevronright") {
            helper.getCompetitorsData(component, event, '');	
        }
        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",
                                  {attribute:true,
                                   'ModalBody':'CompetitiveLandscape_Generic_AddPopUp',
                                   'ModalBodyData':{'currentAccountId':component.get('v.recordId'),
                                                    'accountType':component.get('v.accountTypeAttributes.AccountType'),
                                                    'isMedical':false, 
                                                    "businessModelValue":"",//component.find('SearchDropDownForBusinessModel').get('v.value'),
                                                    "fundingTypeDentalValue" :"",// component.find('SearchDropDownForFundingTypeDental').get('v.value'),
                                                    "fundingTypeVisionValue" :""// component.find('SearchDropDownForFundingTypeVision').get('v.value')
                                                   },
                                   'Modalheader':'Search Competitors'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0;i<newCmp.length;i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        }else{
            
            component.set("v.scrollStyleForDevice","");
            $A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
        	$A.util.addClass(component.find("sortEdit"), 'hide');
            $A.util.addClass(component.find("saveCancel"), 'hide');
            
            $A.createComponents([["c:Panel_Component",
                                  {attribute:true,
                                   'ModalBody':'CompetitiveLandscape_Generic_AddPopUp',
                                   'ModalBodyData':{'currentAccountId':component.get('v.recordId'),
                                                    'accountType':component.get('v.accountTypeAttributes.AccountType'),
                                                    'isMedical':false, 
                                                    "businessModelValue":"",//component.find('SearchDropDownForBusinessModel').get('v.value'),
                                                    "fundingTypeDentalValue" : "",//component.find('SearchDropDownForFundingTypeDental').get('v.value'),
                                                    "fundingTypeVisionValue" : ""//component.find('SearchDropDownForFundingTypeVision').get('v.value')
                                                   },
                                   'Modalheader':'Search Competitors'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0;i<newCmp.length;i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
            
        }
	},
    
    cancelRecord : function(component, event, helper) {
        
        component.set('v.isEdit', false);
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        var accountType = component.get('v.accountTypeAttributes.AccountType');
        if(accountType != undefined && accountType != null) {
            if(accountType === $A.get("$Label.c.Client_Management")) {
                helper.cancelChangesInCompetitorRecords(component, event);
            } else if(accountType === $A.get("$Label.c.Client_Development") || 
                      	accountType === $A.get("$Label.c.Aggregator")) {
                helper.cancelChangesInCompetitorRecords(component, event);
            }
        }
	},
    
    editRecord : function(component, event, helper) {
        var accountType = component.get('v.accountTypeAttributes.AccountType');
        if(accountType != undefined && accountType != null) {
            component.set('v.isEdit', true);
            if(accountType === $A.get("$Label.c.Client_Management")) {
                helper.editCompetitorRecords(component, event);
            } else if(accountType === $A.get("$Label.c.Client_Development") || 
                      	accountType === $A.get("$Label.c.Aggregator")) {
                helper.editCompetitorRecords(component, event);
            }
        }
	},
    
    removeRecord : function(component, event, helper) {        
        helper.removeCompetitorRecord(component, event);
    },
    
    saveRecord : function(component, event, helper) {
        helper.saveCompetitorsRecords(component, event);
	},
    
    displayCompetitorsRecords: function(component, event, helper) {
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        helper.modalGenericClose(component);
        var btnPressed = event.getParam("buttonPressed");
        
        if(btnPressed != 'cancel') {
            
            var accountType = component.get('v.accountTypeAttributes.AccountType');
            var cmpClassifationsArray = [];
            var listJSON = component.get('v.cmptrsListNamesJSONObj');
            var jsonObj = JSON.parse(listJSON);
            for(var key in jsonObj) {
                var newCmptrsData = event.getParam(jsonObj[key]);
                if(newCmptrsData != undefined && newCmptrsData != null && newCmptrsData.length > 0) {
                    cmpClassifationsArray.push(key);
                    if(accountType === $A.get("$Label.c.Client_Development") || accountType === $A.get("$Label.c.Aggregator")) {
                        if(key == 'Other') {
                            component.set('v.isOthersCompetitorsCDEmptyList', false); 
                        } else {
                            component.set('v.is'+key+'CompetitorsCDEmptyList', false);
                        }                    	   
                    }                    
                    var cmptrsArray = component.get('v.'+jsonObj[key]);
                    cmptrsArray.push.apply(cmptrsArray, newCmptrsData);
                    component.set('v.'+jsonObj[key], cmptrsArray); 
                }
                
            }            
            
            if(cmpClassifationsArray != undefined && cmpClassifationsArray != null && cmpClassifationsArray.length > 0) {
                var selClassifications = cmpClassifationsArray.toString();
                var productTypesArray = ['Pharmacy','Dental','Vision','Others'];
                if(accountType != undefined && accountType != null) {
                    var accCategory = '';
                    if(accountType === $A.get("$Label.c.Client_Management")) {
                        accCategory = 'CM';
                    } else if(accountType === $A.get("$Label.c.Client_Development") || 
                              accountType === $A.get("$Label.c.Aggregator")) {
                        accCategory = 'CD';
                    }
                    for(var i=0; i<productTypesArray.length; i++) {
                        var pdtType = productTypesArray[i];
                        var divId = pdtType+accCategory;
                        if(pdtType == 'Others') {
                            pdtType = 'Other';
                        }                        
                        var iconElement = 'UtilityToggle'+divId;
                        if(component.find(iconElement) != undefined && component.find(iconElement) != null) {
                            var expandCollapseIconName = component.find(iconElement).get("v.iconName");
                            expandCollapseIconName = (expandCollapseIconName != undefined && expandCollapseIconName != null) ? expandCollapseIconName : '';
                            if(selClassifications.includes(pdtType) && expandCollapseIconName == "utility:chevronright") {
                                component.find(iconElement).set("v.iconName","utility:chevrondown");
                                $A.util.removeClass(component.find(divId), 'slds-hide'); 
                            } 
                        }
                    } 
                    helper.editCompetitorRecords(component, event);    
                    var myLabel = component.find('utilityToggle').get("v.iconName");
                    if(myLabel=="utility:chevronright"){
                        var cmpTarget = component.find('competitiveLandscape_CM');
                        $A.util.addClass(cmpTarget,'slds-is-open');
                        component.find('utilityToggle').set("v.iconName","utility:chevrondown");
                    }
                }
            }
            
            //helper.getCompetitorsData(component, event, 'DisplayNewRecords');
        } else {
            
            var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
            if(isDeviceIconsToBeEnabled) {
                $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                $A.util.removeClass(component.find("sortEdit"), 'hide');
                $A.util.addClass(component.find("saveCancel"), 'hide');
            }            
        }
    },
    
    expandCollapse: function(component, event, helper) {
        
        var isExpandVal = component.get('v.isExpand');
        if(isExpandVal != undefined && isExpandVal != null && isExpandVal == false) {
            return;
        }
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            
            //Collapse all the Sections
            var productTypesArray = ['Pharmacy','Dental','Vision','Others'];
            //var accCategoriesArray = ['CM','CD'];
            var accountType = component.get('v.accountTypeAttributes.AccountType');
            if(accountType != undefined && accountType != null) {
                var accCategory = '';
                if(accountType === $A.get("$Label.c.Client_Management")) {
                    accCategory = 'CM';
                } else if(accountType === $A.get("$Label.c.Client_Development") || 
                          accountType === $A.get("$Label.c.Aggregator")) {
                    accCategory = 'CD';
                }
                for(var i=0; i<productTypesArray.length; i++) {
                    //for(var j=0; j<accCategoriesArray.length; j++) {
                    var divId = productTypesArray[i]+accCategory;
                    var iconElement = 'UtilityToggle'+divId;
                    if(component.find(iconElement) != undefined && component.find(iconElement) != null) {
                        var expandCollapseIconName = component.find(iconElement).get("v.iconName");
                        if(expandCollapseIconName != undefined && expandCollapseIconName != null && expandCollapseIconName == "utility:chevrondown") {
                            component.find(iconElement).set("v.iconName","utility:chevronright");
                            $A.util.addClass(component.find(divId), 'slds-hide');
                        }
                    }
                    //}
                }
            }
            
            //On Expansion of Applet, the data will be loaded.
            helper.getCompetitorsData(component, event, 'OnLoad');
            
        } else if(myLabel=="utility:chevrondown"){
            //component.set('v.competitorsDataInEditToBeRemoved',[]); //SAMARTH (COMMENTED)
            component.find(iconElement).set("v.iconName","utility:chevronright");
            var isLoggedInUserRoleVal = component.get('v.isEditSaveDeleteButtonsEnabled');
            if(isLoggedInUserRoleVal != null && isLoggedInUserRoleVal) {
            	component.find('addBtn').set("v.disabled", false);
                component.find('editBtn').set("v.disabled", false);
                $A.util.addClass(component.find("saveBtn"), 'slds-hide');
                $A.util.addClass(component.find("cancelBtn"), 'slds-hide');    
            }
        }
    },
    
    modalClose : function(component, event, helper) {
        var modalComponent = component.find('competitiveLandscape_CM');
        for(var i=0;i<modalComponent.length;i++) {
            $A.util.addClass(modalComponent[i], 'slds-backdrop--hide');
            $A.util.removeClass(modalComponent[i], 'slds-backdrop--open');
        }        
    },
    
    confirmCancel : function(component, event, helper) {
        component.set('v.competitorData', null);
        var confirmCancelList = component.find('confirmDelForCompetitorRecord');
        for(var i=0;i<confirmCancelList.length;i++) {
            $A.util.addClass(confirmCancelList[i], 'slds-hide');
        } 
        
        var noOfComponents = 4;
        for(var i=1; i<=noOfComponents; i++) {
          	var childCmp = component.find("childComponent"+i);
            if(childCmp != null && childCmp != undefined) {
                if(Array.isArray(childCmp)) {
                    for(var j=0; j<childCmp.length; j++) {
                        childCmp[j].removeProcessingIcon();
                    } 
                } else {
                    childCmp.removeProcessingIcon();
                }
            }
        }
    },
    
    confirmCancelForPrompt : function(component, event, helper) {
        //component.set("v.competitorIdArray", null);
        var confirmCancelForPromptList = component.find('reminderPopUp');
        for(var i=0;i<confirmCancelForPromptList.length;i++) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    display : function(component, event, helper) {
        helper.toggleHelper(component, event);
    },
    
    displayOut : function(component, event, helper) {
        helper.toggleHelper(component, event);
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i=0;i<ErrorMessage.length;i++){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
      
		var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) { 
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("sortEdit"), 'hide');
            $A.util.addClass(component.find("saveCancel"), 'hide');
        }
      	helper.modalGenericClose(component);       
    },
    
    scrollBottom: function(component, event, helper) {
        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP" && $A.get("$Browser.isIOS")){            
        	var isScrollStop = component.get("v.isScrollStop");
        	component.set("v.isStop",component.get("v.isStop")+1);                    
        	if(isScrollStop){                       
            
            var actionBar = component.find("action-bar-mobile");               	           
            $A.util.addClass(actionBar,"slds-hide");    
                        
                component.set("v.isScrollStop",false); 
                var myInterval = window.setInterval(
                    $A.getCallback(function() {
                        console.log('inside interval')
                        component.set("v.nextLastCount",component.get("v.lastCount"));
                        component.set("v.lastCount",component.get("v.isStop"));                         
                        if(component.get("v.lastCount") === component.get("v.nextLastCount")){                        	
                            component.set("v.isStopped",true);
                            $A.util.removeClass(actionBar,"slds-hide");
                            component.set("v.isScrollStop",true);
                            clearInterval(myInterval);
                        }
                    }), 250
                ); 
                                              
            }
        } 
    },
    
    expandCollapseSection: function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;
        var iconElement = selectedItem.getAttribute("id");
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            $A.util.removeClass(component.find(divId), 'slds-hide');
        } else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.addClass(component.find(divId), 'slds-hide');
        }
    }
})