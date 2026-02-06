({
	getServiceAMTRecords : function(component, event, columnName, sortType) {
        debugger;
        //alert('hello');
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        /*component.find('addBtn').set("v.disabled", false);
        component.find('editBtn').set("v.disabled", false);
        $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        $A.util.addClass(component.find("cancelBtn"), 'slds-hide');*/
        
        columnName = columnName || 'Last_Name__c';
        sortType = sortType || 'ASC';
        //
        //alert(component.get('v.sobjectusedAccount')+'in get Amt records');
        
        
        var action = component.get("c.getServiceAMTData"); 
        
        action.setParams({'accId' : component.get("v.recordId"),
                          'columnName' : columnName,
                          'sortType' : sortType,
                         });
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.PoliciesList',responseList.PolicyId);
                    // component.set('v.ServiceAMTList', []);
                    component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    component.set('v.userRolePLValues', responseList.roleValues1);
                    component.set('v.contactRolePLValues', responseList.roleValues2);
                    //component.set('v.contactRolePLValues', responseList.roleValues2);
                    
                    if((responseList.serviceAMTRecords == null) || (responseList.serviceAMTRecords != null && 
                                                                    responseList.serviceAMTRecords.length == 0)) {
                        /*if(isLoggedInUserRoleVal) { 
                        	$A.util.addClass(component.find("editBtn"), 'slds-hide'); 
                        }*/
                        component.set('v.ServiceAMTEmptyList', true);
                        $A.util.removeClass(component.find('editBtn'),'slds-show');
                        $A.util.addClass(component.find('editBtn'),'slds-hide');
                        
                    } else {
                        /*if(isLoggedInUserRoleVal) {
                        	if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                        		$A.util.removeClass(component.find("editBtn"), 'slds-hide');   
                        	}   
                        }*/
                        component.set('v.ServiceAMTEmptyList', false);
                        $A.util.removeClass(component.find('editBtn'),'slds-hide');
                        $A.util.addClass(component.find('editBtn'),'slds-show');
                        
                        
                    }
                } else {
                    /*if(isLoggedInUserRoleVal) {
                    	$A.util.addClass(component.find("editBtn"), 'slds-hide');    
                    }*/
                    component.set('v.ServiceAMTEmptyList', true);
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                if(component.get('v.ServiceAMTEmptyList')){
                    $A.util.removeClass(component.find("saveCancel"), 'hide');
                    $A.util.addClass(component.find("saveCancel"), 'show');
                }
                
                var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                    if(operationVal != null && operationVal == 'deleteOperation') {
                        $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                        $A.util.removeClass(component.find("sortEdit"), 'hide');
                        $A.util.addClass(component.find("saveCancel"), 'hide');
                    } else {
                        $A.util.removeClass(component.find("action-bar-mobile"),'slds-hide');
                    }
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
                    
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11) {              
                        $A.util.addClass(component.find('saveCancel'),'iosBottom');
                        $A.util.addClass(component.find('sortEdit'),'iosBottom');
                        $A.util.addClass(component.find('NationalAccountSalesTeam'),'ipadBottomIos');
                    } else {
                        $A.util.addClass(component.find('NationalAccountSalesTeam'),'ipadbottom');
                    }
                    $A.util.addClass(component.find('NationalAccountSalesTeam'),'slds-is-open');
                }
            } else if (state === "ERROR") {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    component.set('v.ServiceAMTList', []);
                    component.set('v.ServiceAMTEmptyList', true);
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
            if($A.get("$Browser.isIOS")) {
                $A.util.addClass(component.find('articleScroll'),'cScroll-table');
            }
        });
        $A.enqueueAction(action);
    },
     makeEditable : function(component, event) {
    	$A.util.addClass(component.find("editMedicalCarrier"),"hide");
        //component.find("addMedicalCarrier").set("v.disabled",true);        
        $A.util.removeClass(component.find("saveMedicalCarrier"),"hide");
        $A.util.removeClass(component.find("cancelMedicalCarrier"),"hide");
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i=0; i < editTextAreas.length; i++) { 
            $A.util.toggleClass(editTextAreas[i], 'readMode');
            $A.util.toggleClass(readModeAreas[i], 'editMode');
        }
        
        var removeLinks = component.find("cancelLink");
        if (removeLinks != undefined) {
            if(Array.isArray(removeLinks)){
                for(var i=0; i < removeLinks.length; i++) { 
                    $A.util.addClass(removeLinks[i],"hide");
                }
            }else{
                    $A.util.addClass(removeLinks,"hide");
            }
        }
	},
})