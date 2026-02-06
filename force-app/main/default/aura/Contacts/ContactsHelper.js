({  
    
    getaccountCategoryType : function(component,event) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var contactType  = '';
        var device = $A.get("$Browser.formFactor");
        var AccountTypeAction = component.get('c.getAccountType');
		 var spinner1 = component.find("spinner");        
        var spinner2 = component.find("spinner1");
		var appletIcon = component.find("appletIcon");
        if(AccountTypeAction == undefined || AccountTypeAction == null){
            return;
        }
        AccountTypeAction.setParams({
            "accountId" : component.get('v.recordId'),
        });
        
        AccountTypeAction.setCallback(this, function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if (state === "SUCCESS") {    
                var AccountCategoryType  = response.getReturnValue();
                //alert('??'+AccountCategoryType.showNewButton);
                if(AccountCategoryType.showNewButton != null){
                   // alert('??HIDE');
                    component.set('v.showNewButton',AccountCategoryType.showNewButton);
                    contactType = component.get('v.contactRecordTypeId');
                }
                
                if(AccountCategoryType.contactTypeId != null){
                    component.set('v.contactRecordTypeId',AccountCategoryType.contactTypeId);
                    contactType = component.get('v.contactRecordTypeId');
                }
                if(AccountCategoryType.accountType != null){
                    if(AccountCategoryType.accountType == 'Client Management'){
                        component.set('v.cmAccountType',true);
                        component.set('v.isLoggedInUserrole',AccountCategoryType.isLoggedInUserRole);
                        component.set('v.accountTypeCommonValues',{'colSpan':9,'AppletName':$A.get("$Label.c.Account_Contacts_Heading")});
                        
                    }else if(AccountCategoryType.accountType == 'Client Development' || AccountCategoryType.accountType == 'Aggregator'){
                        component.set('v.accountTypeCommonValues',{'colSpan':7,'AppletName':$A.get("$Label.c.Contacts_Applet_Name")});
                        component.set('v.cdAccountType',true); 
                        component.set('v.isLoggedInUserrole',AccountCategoryType.isLoggedInUserRole); 
                    }else if(AccountCategoryType.accountType == 'Consulting Firm'){
                        component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Consultants")});
                        component.set('v.cfAccountType',true);
                        component.set('v.isLoggedInUserrole',AccountCategoryType.isLoggedInUserRole);
                    }
                }else{
                    component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Contacts_Applet_Name")});
                    component.set('v.cdAccountType',true);
                    component.set('v.isLoggedInUserrole',AccountCategoryType.isLoggedInUserRole);
                }
                var page = component.get("v.page") || 1;
                this.getCDAccounts(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'),contactType);
            }
            else if (state === "INCOMPLETE ") { 
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length; i = i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                            //console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(AccountTypeAction);
    },
    
    initializedoInitValues:function(component,contactType,loginUserRole,accountType){
        if(contactType != null){
            component.set('v.contactRecordTypeId',contactType); 
        }
        if(accountType != null){
            if(accountType == 'Client Management'){
                component.set('v.cmAccountType',true);
                component.set('v.isLoggedInUserrole',loginUserRole);
                component.set('v.accountTypeCommonValues',{'colSpan':9,'AppletName':$A.get("$Label.c.Account_Contacts_Heading")});
            }else if(accountType == 'Client Development' || accountType == 'Aggregator'){
                component.set('v.accountTypeCommonValues',{'colSpan':7,'AppletName':$A.get("$Label.c.Contacts_Applet_Name")});
                component.set('v.cdAccountType',true); 
                component.set('v.isLoggedInUserrole',loginUserRole);
            }else if(accountType == 'Consulting Firm'){
                component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Consultants")});
                component.set('v.cfAccountType',true);
                component.set('v.isLoggedInUserrole',loginUserRole);
            }
        }else{
            component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Contacts_Applet_Name")});
            component.set('v.cdAccountType',true);
            component.set('v.isLoggedInUserrole',loginUserRole);
        }  
    },
    
    getCDAccounts : function(component,page,event,columnName,sortType,contactType) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var device = $A.get("$Browser.formFactor");
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        page = page || 1;
        columnName = columnName || 'LastName';
        sortType = sortType || 'Desc';
        
        var cdAccountAction = component.get('c.getAccountContacts');	
        cdAccountAction.setParams({
            "accountId" : component.get('v.recordId'),
            "pageNumber": page,
            "columnName" : columnName,
            "sortType" : sortType,
            "currentContactType":contactType
        });
        
        cdAccountAction.setCallback(this, function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if (state === "SUCCESS") {   
                var AccountContactList  = response.getReturnValue();
                console.table(AccountContactList);
                console.log('cmAccountType');
                //alert("AccountContactList.."+AccountContactList.cmCdCfContactsList.length);
                if(component.get('v.cmAccountType')){
                    if(AccountContactList != null && AccountContactList.cmCdCfContactsList.length > 0){
                        component.set('v.isAccountContactListEmpty',false);
                        component.set('v.cmAccountType',true);
                        component.get('v.accountTypeCommonValues');
                        component.set("v.accountContacts", AccountContactList.cmCdCfContactsList);
                        component.set("v.page", AccountContactList.page);
                        component.set("v.total", AccountContactList.total);
                        component.set("v.pages", Math.ceil(AccountContactList.total/AccountContactList.pageSize));
                    }else{
                        component.set('v.isAccountContactListEmpty',true);
                        component.set('v.cmAccountType',true);
                        if(device != "DESKTOP"){ 
                            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                        } 
                        
                    }       
                }else if(component.get('v.cdAccountType')){
                    if(AccountContactList != null && AccountContactList.cmCdCfContactsList.length > 0){
                        component.set('v.isAccountContactListEmpty',false);
                        component.set('v.cdAccountType',true);
                        component.get('v.accountTypeCommonValues'); 
                        component.set("v.cdContactList", AccountContactList.cmCdCfContactsList);
                        component.set("v.page", AccountContactList.page);
                        component.set("v.total", AccountContactList.total);
                        component.set("v.pages", Math.ceil(AccountContactList.total/AccountContactList.pageSize));
                    }else{
                        component.set('v.isAccountContactListEmpty',true);
                        component.set('v.cdAccountType',true);    
                    }       
                }else if(component.get('v.cfAccountType')){
                    if(AccountContactList != null && AccountContactList.cmCdCfContactsList.length > 0){
                        component.set('v.isAccountContactListEmpty',false);
                        component.set('v.cfAccountType',true);
                        component.set("v.ConsultantsList", AccountContactList.cmCdCfContactsList);
                        component.set("v.page", AccountContactList.page);
                        component.set("v.total", AccountContactList.total);
                        component.set("v.pages", Math.ceil(AccountContactList.total/AccountContactList.pageSize));
                    }else{
                        component.set('v.isAccountContactListEmpty',true);
                        component.set('v.cfAccountType',true); 
                    }  
                }
                if(device != "DESKTOP"){ 
                var iOS = parseFloat(
                    ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                    .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                ) || false;
                if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){                
                    $A.util.addClass(component.find('acc_Contacts'),'ipadBottomIos');
                    $A.util.addClass(component.find('sortEdit'),'iosBottom');
                }else{
                    $A.util.addClass(component.find('acc_Contacts'),'ipadbottom');
                }
                component.set('v.isExpand',true);            
                $A.util.addClass(component.find('acc_Contacts'),'slds-is-open');
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                } 
            }
            else if (state === "INCOMPLETE") {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length; i = i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });        
        $A.enqueueAction(cdAccountAction);
    },
    sortBy : function(component, event, fieldName,page,sortFieldComp,contactType) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        page = page || 1;
        var cdAccountAction = component.get("c.getAccountContacts");
        if(component.get("v."+sortFieldComp) ===  true) {
            cdAccountAction.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC',
                "currentContactType":contactType
            });
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, false);
        } else {
            cdAccountAction.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC',
                "currentContactType":contactType
            });
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, true);
        }
        
        cdAccountAction.setCallback(this,function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            var spinner1 = component.find("spinner");
            var spinner2 = component.find("spinner1");
            var appletIcon = component.find("appletIcon");

            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            if (state === "SUCCESS") {    
                var AccountContactList  = response.getReturnValue();
                if(component.get('v.cmAccountType')){
                    if(AccountContactList != null && AccountContactList.cmCdCfContactsList.length > 0){
                        component.set('v.isAccountContactListEmpty',false);
                        component.set('v.cmAccountType',true);
                        component.get('v.accountTypeCommonValues');
                        component.set("v.accountContacts", AccountContactList.cmCdCfContactsList);
                        component.set("v.page", AccountContactList.page);
                        component.set("v.total", AccountContactList.total);
                        component.set("v.pages", Math.ceil(AccountContactList.total/AccountContactList.pageSize));
                    }else{
                        component.set('v.isAccountContactListEmpty',true);
                        component.set('v.cmAccountType',true);
                    }       
                }else if(component.get('v.cdAccountType')){
                    if(AccountContactList != null && AccountContactList.cmCdCfContactsList.length > 0){
                        component.set('v.isAccountContactListEmpty',false);
                        component.set('v.cdAccountType',true);
                        component.set("v.cdContactList", AccountContactList.cmCdCfContactsList);
                        component.set("v.page", AccountContactList.page);
                        component.set("v.total", AccountContactList.total);
                        component.set("v.pages", Math.ceil(AccountContactList.total/AccountContactList.pageSize));
                    }else{
                        component.set('v.isAccountContactListEmpty',true);
                        component.set('v.cdAccountType',true);
                    }       
                }else if(component.get('v.cfAccountType')){
                    if(AccountContactList != null && AccountContactList.cmCdCfContactsList.length > 0){
                        component.set('v.isAccountContactListEmpty',false);
                        component.set('v.cfAccountType',true);
                        component.set("v.ConsultantsList", AccountContactList.cmCdCfContactsList);
                        component.set("v.page", AccountContactList.page);
                        component.set("v.total", AccountContactList.total);
                        component.set("v.pages", Math.ceil(AccountContactList.total/AccountContactList.pageSize));
                    }else{
                        component.set('v.isAccountContactListEmpty',true);
                        component.set('v.cfAccountType',true);
                    }  
                }
            }
            else if (state === "INCOMPLETE") { 
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length; i = i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(cdAccountAction);
    },
})