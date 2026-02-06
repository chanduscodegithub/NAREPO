({  
    
    getaccountMemberCompanies : function(component,event) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        
        var AccountTypeAction = component.get('c.getAccountType');
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
                if(AccountCategoryType.accountType != null){
                    if(AccountCategoryType.accountType == 'CVGAccount'){
                        component.set('v.cvgAccount',true);
                        component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Account_Contacts_Heading")});
                    }else if(AccountCategoryType.accountType == 'BGHAccount'){
                        component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Contacts_Applet_Name")});
                        component.set('v.bghAccount',true);
                    }
                    component.set('v.expandOnLoad',true);
                }else{
                    component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Contacts_Applet_Name")});
                    component.set('v.cvgAccount',true);
                }
                var page = component.get("v.page") || 1;
                this.getCDAccounts(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'));
            }
            else if (state === "INCOMPLETE") {
                component.set('v.alertErrorbodyMessage','No Internet Connection');
                this.CreateErrorMessage(component, event);
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.alertErrorbodyMessage',errors[0].message);
                            this.CreateErrorMessage(component, event);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(AccountTypeAction);
    },
    
    
    intializedoInitValues:function(component,category){
        if(category != null){
            if(category == 'CVGAccount'){
                component.set('v.cvgAccount',true);
                component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Account_Contacts_Heading")});
            }else if(category == 'BGHAccount'){
                component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Contacts_Applet_Name")});
                component.set('v.bghAccount',true); 
            }
            component.set('v.expandOnLoad',true);
        }else{
            component.set('v.accountTypeCommonValues',{'colSpan':6,'AppletName':$A.get("$Label.c.Contacts_Applet_Name")});
            component.set('v.cvgAccount',true);
        }
    },
    
    getCDAccounts : function(component,page,event,columnName,sortType) {
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
        if(component.get('v.cvgAccount')){
            columnName = columnName || 'Name';
        }else if(component.get('v.bghAccount')){
            columnName = columnName || 'New_Account__r.Name';
        }
        console.log('columnName'+columnName);
        sortType = sortType || 'Desc';
        
        var accountMemberCompaniesListAccountAction = component.get('c.getAccountAggregator_MemberCompanies');	
        accountMemberCompaniesListAccountAction.setParams({
            "accountId" : component.get('v.recordId'),
            "pageNumber": page,
            "columnName" : columnName,
            "sortType" : sortType
        });
        accountMemberCompaniesListAccountAction.setCallback(this, function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if (state === "SUCCESS") {   
                var AccountMemberCompaniesList  = response.getReturnValue();
                //alert("AccountContactList.."+AccountContactList.cmCdCfContactsList.length);
                if(component.get('v.cvgAccount')){
                    if(AccountMemberCompaniesList != null && AccountMemberCompaniesList.CVG_AccountList.length > 0){
                        component.set('v.iscvgbghListEmpty',false);
                        component.set('v.cvgAccount',true);
                        component.get('v.accountTypeCommonValues');
                        component.set("v.cvgRelatedAccounts", AccountMemberCompaniesList.CVG_AccountList);
                        component.set("v.page", AccountMemberCompaniesList.page);
                        component.set("v.total", AccountMemberCompaniesList.total);
                        component.set("v.pages", Math.ceil(AccountMemberCompaniesList.total/AccountMemberCompaniesList.pageSize));
                    }else{
                        component.set('v.iscvgbghListEmpty',true);
                        component.set('v.cvgAccount',true);
                        component.set("v.page", AccountMemberCompaniesList.page);
                        component.set("v.total", AccountMemberCompaniesList.total);
                        component.set("v.pages", Math.ceil(AccountMemberCompaniesList.total/AccountMemberCompaniesList.pageSize));
                    }       
                }else if(component.get('v.bghAccount')){
                    if(AccountMemberCompaniesList != null && AccountMemberCompaniesList.BGH_AccountList.length > 0){
                        component.set('v.iscvgbghListEmpty',false);
                        component.set('v.bghAccount',true);
                        component.set("v.bghRelatedAccounts", AccountMemberCompaniesList.BGH_AccountList);
                        component.set("v.page", AccountMemberCompaniesList.page);
                        component.set("v.total", AccountMemberCompaniesList.total);
                        component.set("v.pages", Math.ceil(AccountMemberCompaniesList.total/AccountMemberCompaniesList.pageSize));
                    }else{
                        component.set('v.iscvgbghListEmpty',true);
                        component.set('v.bghAccount',true);
                        component.set("v.page", AccountMemberCompaniesList.page);
                        component.set("v.total", AccountMemberCompaniesList.total);
                        component.set("v.pages", Math.ceil(AccountMemberCompaniesList.total/AccountMemberCompaniesList.pageSize));
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
                component.set('v.alertErrorbodyMessage','No Internet Connection');
                this.CreateErrorMessage(component, event);
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.alertErrorbodyMessage',errors[0].message);
                            this.CreateErrorMessage(component, event);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });        
        $A.enqueueAction(accountMemberCompaniesListAccountAction);
    },
    sortBy : function(component, event, fieldName,page,sortFieldComp) {
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
        var accountMemberCompaniesListAccountAction = component.get("c.getAccountAggregator_MemberCompanies");
        if(component.get("v."+sortFieldComp) ===  true) {
            accountMemberCompaniesListAccountAction.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC'
            });
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, false);
        } else {
            accountMemberCompaniesListAccountAction.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC'
            });
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, true);
        }
        
        accountMemberCompaniesListAccountAction.setCallback(this,function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            if (state === "SUCCESS") {    
                var AccountMemberCompaniesList  = response.getReturnValue();
                //alert("AccountContactList.."+AccountContactList.cmCdCfContactsList.length);
                if(component.get('v.cvgAccount')){
                    if(AccountMemberCompaniesList != null && AccountMemberCompaniesList.CVG_AccountList.length > 0){
                        component.set('v.iscvgbghListEmpty',false);
                        component.set('v.cvgAccount',true);
                        component.get('v.accountTypeCommonValues');
                        component.set("v.cvgRelatedAccounts", AccountMemberCompaniesList.CVG_AccountList);
                        component.set("v.page", AccountMemberCompaniesList.page);
                        component.set("v.total", AccountMemberCompaniesList.total);
                        component.set("v.pages", Math.ceil(AccountMemberCompaniesList.total/AccountMemberCompaniesList.pageSize));
                    }else{
                        component.set('v.iscvgbghListEmpty',true);
                        component.set('v.cvgAccount',true);
                    }       
                }else if(component.get('v.bghAccount')){
                    if(AccountMemberCompaniesList != null && AccountMemberCompaniesList.BGH_AccountList.length > 0){
                        component.set('v.iscvgbghListEmpty',false);
                        component.set('v.bghAccount',true);
                        component.set("v.bghRelatedAccounts", AccountMemberCompaniesList.BGH_AccountList);
                        component.set("v.page", AccountMemberCompaniesList.page);
                        component.set("v.total", AccountMemberCompaniesList.total);
                        component.set("v.pages", Math.ceil(AccountMemberCompaniesList.total/AccountMemberCompaniesList.pageSize));
                    }else{
                        component.set('v.iscvgbghListEmpty',true);
                        component.set('v.bghAccount',true);
                    }       
                }
            }
            else if (state === "INCOMPLETE") {
                component.set('v.alertErrorbodyMessage','No Internet Connection');
                this.CreateErrorMessage(component, event);                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.alertErrorbodyMessage',errors[0].message);
                            this.CreateErrorMessage(component, event);                        
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(accountMemberCompaniesListAccountAction);
    },
    CreateErrorMessage: function(component, event) {
        $A.createComponents([["c:Alert_Error_GenericComponent",{attribute:true,'Modalheader':'Error','ErrorModalBodyData':{'bodyMessage':component.get('v.alertErrorbodyMessage'),'ModalPagination':true},'ModalBody':'Account_Team_Modal'}]],
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
    modalGenericClose : function(component) {
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.alerterrormdlClose();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        }else{
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.alerterrormdlClose();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []); 
        }
    },
})