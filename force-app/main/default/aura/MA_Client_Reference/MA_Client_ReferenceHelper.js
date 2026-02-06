({
    //-------------------------------------------SAMARTH-------------------------------------------
    getRefStatusValues: function (component, event, helper) {
        var action = component.get("c.getRefStatusFieldValue");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                
                var fieldMap = [];
                for (var key in result) {
                    fieldMap.push({ key: key, value: result[key] });
                }
                
               component.set("v.refStatusList",fieldMap);
            }
        });
        $A.enqueueAction(action);
    },
     getApplicableforValues: function (component, event, helper) {
        var action = component.get("c.getApplicableforValues");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                
                var fieldMap = [];
                for (var key in result) {
                    fieldMap.push({ key: key, value: result[key] });
                }
                
               component.set("v.applicableFor",fieldMap);
            }
        });
        $A.enqueueAction(action);
    },
    onSaveHlpr : function(component, event, helper){
        component.set('v.isSpinnertoLoad', true);
         var action = component.get("c.saveRefRecordsParent");
        action.setParams({ 'refRevords': component.get('v.backupRecords')});
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('updated');
                helper.getReferenceAccounts(component, event, null, null, 'ASC');
                component.set('v.isEditDisabled', false);
                component.set('v.isSaveCancelDisabled', true);
            }else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage', errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for (var i in ErrorMessage) {
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
        component.set('v.isSpinnertoLoad', false);
    },

    saveRefReqrecord: function (component, event, helper) {
        var action = component.get("c.saveRefReqRecord");
        console.log('refStatRec '+JSON.stringify(component.get('v.refStatRec')));
        action.setParams({ 'refReqRecords': JSON.stringify(component.get('v.refStatRec')) });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                //alert('SUCCESS');
                component.set('v.refStatRec',[]);
                //helper.getReferenceAccounts();
            }
        });
        $A.enqueueAction(action);

        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getReferenceAccounts(component, event, null, null, 'ASC');
        //this.getReferenceAccounts(component, event, null, null, 'ASC');
        component.set('v.isSpinnertoLoad', false);
    },
    
    //-------------------------------------------SAMARTH-------------------------------------------

    getLoggedInUserRole: function (component) {
        var action = component.get('c.getLoggedInUserRoles');
        action.setParams({ 'oppId': component.get('v.recordId') });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set('v.isLoggedInUserValid', response.getReturnValue());
                if(component.get('v.isLoggedInUserValid') == true){
                    component.set('v.isLoggedInUserInValid',false);
                }
                else{
                    component.set('v.isLoggedInUserInValid',true);
                }
            } else if (state === "INCOMPLETE") {
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage', errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for (var i in ErrorMessage) {
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
    },

    getReferenceAccounts: function (component, event, page, columnName, sortType) {
        //alert(sortType);
        component.set('v.isSpinnertoLoad', true);

        page = page || 1;
        columnName = columnName || 'RefCompany__r.Name';
        //sortType = sortType || 'ASC';

        var maId = component.get('v.recordId');
        var actionToGetRelatedAccounts = component.get('c.queryReferenceAccounts');
        actionToGetRelatedAccounts.setParams({
            "maId": maId,
            "pageNumber": page,
            "columnName": columnName,
            "sortType": sortType
        });

        actionToGetRelatedAccounts.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var refAccountList = response.getReturnValue();
                if (refAccountList != null) {
                    if (refAccountList.refAccountRecords.length != 0) {
                        let backupRecords = component.get("v.backupRecords");
                        let backupMap = [];
                        let refAccountsRecords = [];
                        for(let i=0;i<backupRecords.length;i++){
                            backupMap[backupRecords[i].Id] = backupRecords[i];
                        }
                        
                       
                        for(let i =0; i<refAccountList.refAccountRecords.length;i++){
                            console.log(backupMap[refAccountList.refAccountRecords[i].Id]);
                            if(backupMap[refAccountList.refAccountRecords[i].Id] != undefined){
                                refAccountsRecords.push(backupMap[refAccountList.refAccountRecords[i].Id]);
                            }else{
                                refAccountsRecords.push(refAccountList.refAccountRecords[i]);
                            }
                        }
                        console.log(refAccountsRecords);
                        console.log('$$$');
                        component.set("v.refAccountsRecords", refAccountsRecords);
                        component.set("v.page", refAccountList.page);
                        component.set("v.total", refAccountList.total);
                        component.set("v.pages", Math.ceil(refAccountList.total / refAccountList.pageSize));
                        //ghanshyam c 1114
                        component.set("v.isReferencedAccountListEmpty", false);
                        component.set("v.isReferencedAccountListNotEmpty", true);
                        var device = $A.get("$Browser.formFactor");
                        if (device != "DESKTOP") {
                            $A.util.removeClass(component.find("action-bar-mobile"), "slds-hide");
                            $A.util.removeClass(component.find("sortEdit"), "hide");

                            var iOS = parseFloat(
                                ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ''])[1])
                                    .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                            ) || false;

                            if ($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11) {
                                $A.util.addClass(component.find('sortEdit'), 'iosBottom');
                                $A.util.addClass(component.find('ma_Client_Reference'), 'ipadBottomIos');
                            } else {
                                $A.util.addClass(component.find('ma_Client_Reference'), 'ipadbottom');
                            }
                            $A.util.addClass(component.find('ma_Client_Reference'), 'slds-is-open');
                        }
                        $A.util.addClass(component.find('ma_Client_Reference'), 'slds-is-open');
                    } else {
                        $A.util.addClass(component.find('ma_Client_Reference'), 'slds-is-open');
                        component.set('v.isReferencedAccountListEmpty', true);
                        component.set('v.isReferencedAccountListNotEmpty', false);
                    }
                } else {
                    component.set("v.isReferencedAccountListEmpty", true);
                    component.set("v.isReferencedAccountListNotEmpty", false);
                }

                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") {

            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage', errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for (var i in ErrorMessage) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
                component.set('v.isSpinnertoLoad', false);
            }
        });

        $A.enqueueAction(actionToGetRelatedAccounts);

    },

    sortBy: function (component, event, fieldName, page, sortFieldComp) {
        component.set('v.isSpinnertoLoad', true);

        page = page || 1;
        var maId = component.get('v.recordId');
        var actionToGetRelatedAccounts = component.get('c.queryReferenceAccounts');

        if (component.get("v." + sortFieldComp) === true) {
            actionToGetRelatedAccounts.setParams({
                "maId": maId,
                "pageNumber": page,
                "columnName": fieldName,
                "sortType": 'DESC'
            });

            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", fieldName);
            component.set("v." + sortFieldComp, false);
        } else {
            actionToGetRelatedAccounts.setParams({
                "maId": maId,
                "pageNumber": page,
                "columnName": fieldName,
                "sortType": 'ASC'
            });

            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", fieldName);
            component.set("v." + sortFieldComp, true);
        }

        actionToGetRelatedAccounts.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {

                console.log(JSON.stringify(response.getReturnValue()));

                var refAccountList = response.getReturnValue();
                if (refAccountList != null) {
                    if (refAccountList.refAccountRecords.length != 0) {
                        component.set("v.refAccountsRecords", refAccountList.refAccountRecords);
                        component.set("v.page", refAccountList.page);
                        component.set("v.total", refAccountList.total);
                        component.set("v.pages", Math.ceil(refAccountList.total / refAccountList.pageSize));

                        var device = $A.get("$Browser.formFactor");
                        if (device != "DESKTOP") {
                            $A.util.removeClass(component.find("action-bar-mobile"), "slds-hide");
                            $A.util.removeClass(component.find("sortEdit"), "hide");
                        }

                    } else {
                        component.set('v.isReferencedAccountListEmpty', true);
                        component.set('v.isReferencedAccountListNotEmpty', false);
                    }
                } else {
                    component.set("v.isReferencedAccountListEmpty", true);
                    component.set("v.isReferencedAccountListNotEmpty", false);
                }

                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") {

            }
            else if (state === "ERROR") {
                component.set('v.isSpinnertoLoad', false);
            }
        });

        $A.enqueueAction(actionToGetRelatedAccounts);
    },

    addSelectedAccountAsRR: function (component, event, refAccountIds) {
        var action = component.get('c.addRefAccountsToMA');
        action.setParams({
            'maID': component.get('v.recordId'),
            'refAccountIds': refAccountIds
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                component.set('v.editValueFromParent', true);
                 component.set('v.isEditDisabled', true);
                component.set('v.isSaveCancelDisabled', false);
                this.getReferenceAccounts(component, event);
                //this.getReferenceAccounts(component, event, page, component.get('v.sortField'), component.get('v.sortOrder'));
            }
            else if (state === "INCOMPLETE") {

            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage', errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for (var i in ErrorMessage) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
                component.set('v.isSpinnertoLoad', false);
            }
        });
        $A.enqueueAction(action);
    },

    desktopModal: function (component, event, header, cmp, accountId) {

        var contactRecordType = component.get('v.contactRecordTypeId');
        var childData = { 'optyId': component.get('v.recordId') };

        $A.createComponents([["c:Modal_Component_RR", { attribute: true, 'ModalBodyData': childData, 'Modalheader': header, 'ModalBody': cmp }]],
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

    panelModal: function (component, event, header, cmp, accountId) {

        component.set("v.scrollStyleForDevice", "");

        var contactRecordType = component.get('v.contactRecordTypeId');
        var childData = { 'optyId': component.get('v.recordId') };

        $A.createComponents([["c:Panel_Component", { attribute: true, 'ModalBodyData': childData, 'Modalheader': header, 'ModalBody': cmp }]],
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

    modalClosing: function (component, event) {
        component.set("v.scrollStyleForDevice", "@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
        var device = $A.get("$Browser.formFactor");
        if (device == "DESKTOP") {
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        } else {
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
            $A.util.removeClass(component.find("sortEdit"), "hide");
        }
    },
    RemoveMAClientReference: function (component, event, accountObj) {
        var action = component.get('c.RemoveReferenceRequest');
        action.setParams({ 'refenceObj': accountObj, "maId": component.get('v.recordId'), "pageNumber": 1, "columnName": 'RefCompany__r.Name', "sortType": 'ASC' });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log(JSON.stringify(response.getReturnValue()));
                var refAccountList = response.getReturnValue();
                if (refAccountList != null) {
                    if (refAccountList.refAccountRecords.length != 0) {
                        component.set("v.refAccountsRecords", refAccountList.refAccountRecords);
                        component.set("v.page", refAccountList.page);
                        component.set("v.total", refAccountList.total);
                        component.set("v.pages", Math.ceil(refAccountList.total / refAccountList.pageSize));

                        var device = $A.get("$Browser.formFactor");
                        if (device != "DESKTOP") {
                            $A.util.removeClass(component.find("action-bar-mobile"), "slds-hide");
                            $A.util.removeClass(component.find("sortEdit"), "hide");
                        }

                    } else {
                        component.set('v.isReferencedAccountListEmpty', true);
                        component.set('v.isReferencedAccountListNotEmpty', false);
                    }
                } else {
                    component.set("v.isReferencedAccountListEmpty", true);
                    component.set("v.isReferencedAccountListNotEmpty", false);
                }

                component.set('v.isSpinnertoLoad', false);
            } else if (state === "INCOMPLETE") {
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage', errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for (var i in ErrorMessage) {
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
})