({
    doInit: function (component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        console.log('MA_Client Refernce');
        //--------------SAMARTH--------------
        component.set('v.isEditDisabled', false);
        component.set('v.isSaveCancelDisabled', true);
        component.set('v.editValueFromParent', false);
        //--------------SAMARTH--------------
        if (device != "DESKTOP") {
            component.set('v.isDesktop', false);
            helper.getLoggedInUserRole(component, event, helper);
            //helper.getReferenceAccounts(component, event);
            helper.getReferenceAccounts(component, event, null, null, 'ASC');
        } else {
            helper.getLoggedInUserRole(component, event, helper);
            component.set('v.isDesktop', true);
        }

        //-------------------------------------------SAMARTH-------------------------------------------
        helper.getRefStatusValues(component, event, helper);
        helper.getApplicableforValues(component, event, helper);
        
        //-------------------------------------------SAMARTH-------------------------------------------
    },

    //-------------------------------------------SAMARTH-------------------------------------------
    onEditParent: function (component, event, helper) {
        component.set('v.isEditDisabled', true);
        component.set('v.isSaveCancelDisabled', false);

        var noOfRows = component.get('v.refAccountsRecords');
        var childCmp = component.find("maRefAccount_Table");

        for (let i = 0; i < noOfRows.length; i++) {
            [].concat(childCmp)[i].onEdit();
        }
    },
	onSave: function (component, event, helper) {
        helper.onSaveHlpr(component, event, helper);
        
        var noOfRows = component.get('v.refAccountsRecords');
        var childCmp = component.find("maRefAccount_Table");

        for (let i = 0; i < noOfRows.length; i++) {
            [].concat(childCmp)[i].onSave();
        }
    },
    onSaveOld: function (component, event, helper) {
        component.set('v.isEditDisabled', false);
        component.set('v.isSaveCancelDisabled', true);

        var noOfRows = component.get('v.refAccountsRecords');
        var childCmp = component.find("maRefAccount_Table");

        for (let i = 0; i < noOfRows.length; i++) {
            [].concat(childCmp)[i].organizeData();
        }
    },

    onCancel: function (component, event, helper) {
        component.set('v.isEditDisabled', false);
        component.set('v.isSaveCancelDisabled', true);
        
        component.set('v.backupRecords',[]);

        var noOfRows = component.get('v.refAccountsRecords');
        var childCmp = component.find("maRefAccount_Table");

        for (let i = 0; i < noOfRows.length; i++) {
            [].concat(childCmp)[i].onCancel();
        }
        //helper.getReferenceAccounts(component, event);
        helper.getReferenceAccounts(component, event, null, null, 'ASC');
    },

    handleRefStatEvent: function (component, event, helper) {
        component.set('v.isSpinnertoLoad', true);
        var refStatRec = event.getParam("refStatRec");
        component.set('v.refStatRec', refStatRec);
        //alert(JSON.stringify(refStatRec));

        helper.saveRefReqrecord(component, event, helper);
    },
    handleRecordChange: function(component, event, helper){
        let backupRecords = component.get("v.backupRecords");
        console.log(backupRecords);
        
        var refStatRec = event.getParam("recordDetail");
        if(backupRecords.length == 0){
        	backupRecords.push(refStatRec);
        }else{
            let check = false;
            for(let i =0; i<backupRecords.length; i++){
                if(backupRecords[i].Id == refStatRec.Id){
                    check = true;
                    backupRecords[i] = refStatRec;
                }
            }
            if(!check){
                backupRecords.push(refStatRec);
            }
        }
        
        component.set("v.backupRecords" , backupRecords);
        
        console.log(component.get("v.backupRecords"));
        
    },

    //-------------------------------------------SAMARTH-------------------------------------------

    addSelectedrefAccounts: function (component, event, helper) {
        if (event.getParam('isDelete') != undefined && event.getParam('isDelete') == true) {
            var AccountData = event.getParam('AccountObj');
            component.set('v.accountObj', AccountData);
            var deleteAcc = component.find('MA_ClientReference');
            for (var i in deleteAcc) {
                $A.util.removeClass(deleteAcc[i], 'slds-hide');
                $A.util.addClass(deleteAcc[i], 'slds-show');
            }
        } else {
            helper.modalClosing(component);
            //alert(event.getParam('selectedRefAccountIds'));
            var accIds = event.getParam('selectedRefAccountIds');
            helper.addSelectedAccountAsRR(component, event, accIds);
        }
    },
    confirmDelete: function (component, event, helper) {
        component.set('v.isSaveCancelDisabled',true);
        component.set('v.isEditDisabled',false);
        var deleteAcc = component.find('MA_ClientReference');
        for (var i in deleteAcc) {
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
        helper.RemoveMAClientReference(component, event, component.get('v.accountObj'));
        
        component.set('v.backupRecords',[]);

        var noOfRows = component.get('v.refAccountsRecords');
        var childCmp = component.find("maRefAccount_Table");

        for (let i = 0; i < noOfRows.length; i++) {
            [].concat(childCmp)[i].onCancel();
        }
    },
    confirmCancel: function (component, event, helper) {
        var childCmp = component.find("maRefAccount_Table");
        if (childCmp != null && childCmp != undefined) {
            if (Array.isArray(childCmp)) {
                for (var j = 0; j < childCmp.length; j++) {
                    childCmp[j].removeProcessingIcon();
                }
            } else {
                childCmp.removeProcessingIcon();
            }
        }
        var deleteAcc = component.find('MA_ClientReference');
        for (var i in deleteAcc) {
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
    },
    openConsultantsPopup: function (component, event, helper) {
        var device = $A.get("$Browser.formFactor");

        if (device == "DESKTOP") {
            helper.desktopModal(component, event, 'Search for Company', 'MA_RefReq_Modal_Popup', '');
        } else {
            $A.util.addClass(component.find("sortEdit"), "hide");
            helper.panelModal(component, event, 'Search for Company', 'MA_RefReq_Modal_Popup', '');
        }

        event.stopPropagation();
    },

    expandCollapse: function (component, event, helper) {
        component.set('v.isSaveCancelDisabled',true);
        component.set('v.isEditDisabled',false);
        component.set('v.editValueFromParent', false);
        if (!component.get('v.isDesktop')) {
            return;
        }

        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget, 'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");

        var myLabel = component.find(iconElement).get("v.iconName");

        if (myLabel == "utility:chevronright") {
            component.find(iconElement).set("v.iconName", "utility:chevrondown");
            //helper.getReferenceAccounts(component, event);
            helper.getReferenceAccounts(component, event, null, null, 'ASC');
        } else if (myLabel == "utility:chevrondown") {
            component.find(iconElement).set("v.iconName", "utility:chevronright");
        }
    },

    pageChange: function (component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if (device != "DESKTOP") {
            $A.util.addClass(component.find("sortEdit"), "hide");
        }
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getReferenceAccounts(component, event, page, component.get('v.sortField'), component.get('v.sortOrder'));
    },

    openSortingPopup: function (component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if (device != "DESKTOP") {
            $A.util.addClass(component.find("sortEdit"), "hide");
        }

        var fieldsToSort = [{ "fieldName": "RefCompany__r.Name", "fieldDisplayName": "Reference Company Name", "fieldOrder": component.get("v.sortCompanyName") }];

        $A.createComponents([["c:Panel_Component_Sorting", { attribute: true, 'FieldsToSort': fieldsToSort, 'lastSortField': component.get("v.lastSortField") }]],
            function (newCmp, status) {
                if (component.isValid() && status === 'SUCCESS') {
                    var dynamicComponentsByAuraId = {};
                    for (var i = 0; i < newCmp.length; i++) {
                        var thisComponent = newCmp[i];
                        dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                    }
                    component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                    component.set("v.dynamicComponentAuraId", thisComponent.getLocalId());
                    component.set("v.body", newCmp);
                }
            });
    },

    sortFields: function (component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if (device != "DESKTOP") {
            $A.util.addClass(component.find("sortEdit"), "hide");
        }

        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        var fieldItagsWithAuraAttrMap = '{"RefCompany__r.Name":"sortCompanyName"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = 1;

        helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);

    },

    modelCloseComponentEvent: function (component, event, helper) {
        helper.modalClosing(component);
    },

    sortFieldsMobile: function (component, event, helper) {

        if (!event.getParam('isApply')) {
            var device = $A.get("$Browser.formFactor");
            if (device != "DESKTOP") {
                $A.util.removeClass(component.find("sortEdit"), "hide");
            }
        } else if (event.getParam('isApply')) {
            var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
            component.set("v.lastSortField", fieldNameToBeSorted);

            var orderToBeSorted = event.getParam('orderToBeSorted');
            var fieldItagsWithAuraAttrMap = '{"RefCompany__r.Name":"sortCompanyName"}';
            var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
            var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
            if (orderToBeSorted === "DESC") {
                component.set("v." + sortFieldCompName, true);
            } else {
                component.set("v." + sortFieldCompName, false);
            }
            var page = 1;
            helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
        }


    }
})