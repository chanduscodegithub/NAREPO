({
    navToRecord: function (component, event, helper) {
        var selectedItem = event.currentTarget;
        var accountId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": accountId
        });
        navEvt.fire();
    },

    remove: function (component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        var cmpEvent = component.getEvent("addRefAccountsEvent");
        cmpEvent.setParams({ "AccountObj": component.get('v.maRefAccount'), "isDelete": true });
        cmpEvent.fire();
    },

    removeProcessingOnCancel: function (component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },

    //------------------------SAMARTH------------------------
    onEditFunc: function (component, event, helper) {
        component.set('v.editValueFromParent', true);
    },

    onSave: function (component, event, helper) {
        component.set('v.editValueFromParent', false);
    },

    onCancel: function (component, event, helper) {
        component.set('v.editValueFromParent', false);
    },

    changeRefStatVal: function (component, event, helper) {
        //var refReqList = component.get('v.refStatMap');
		
        if (component.get('v.refStatMap') == null || component.get('v.refStatMap') == undefined || component.get('v.refStatMap').length == 0) {
            component.get('v.refStatMap').push({ OptionSel: component.find("statusPicklist").get("v.value"), notesVal: component.find("notesTextArea").get("v.value"), refStatId: component.get('v.maRefAccount.Id') });
        }
        else {
            for (let i = 0; i < component.get('v.refStatMap').length; i++) {
                if (component.get('v.refStatMap')[i].refStatId != component.get('v.maRefAccount.Id')) {
                    component.get('v.refStatMap').push({ OptionSel: component.find("statusPicklist").get("v.value"), notesVal: component.find("notesTextArea").get("v.value"), refStatId: component.get('v.maRefAccount.Id') });
                }
                else {
                    if (component.get('v.refStatMap')[i].OptionSel != component.find("statusPicklist").get("v.value")) {
                        component.get('v.refStatMap')[i].OptionSel = component.find("statusPicklist").get("v.value");
                    }
                }
            }
        }
        //component.set('v.refStatMap', component.get('v.refStatMap'));
        console.log('refStatMap '+JSON.stringify(component.get('v.refStatMap')));
    },
    handelRecordChange:function(component, event, helper){
        let record = component.get("v.maRefAccount");
        var compEvent = component.getEvent("MA_ClentReference_ValueChange_Event");
        compEvent.setParams({ "recordDetail": record });
        compEvent.fire();
		console.log('event fired');
        console.log(record);
    },

    changeNotesVal: function (component, event, heler) {
        var notesList = component.get('v.notesMap');

        if (notesList == null || notesList == undefined || notesList.length == 0) {
            notesList.push({ OptionSel: component.find("statusPicklist").get("v.value"), notesVal: component.find("notesTextArea").get("v.value"), refStatId: component.get('v.maRefAccount.Id') });
        }
        else {
            for (let i = 0; i < notesList.length; i++) {
                if (notesList[i].refStatId != component.get('v.maRefAccount.Id')) {
                    notesList.push({ OptionSel: component.find("statusPicklist").get("v.value"), notesVal: component.find("notesTextArea").get("v.value"), refStatId: component.get('v.maRefAccount.Id') });
                }
                else {
                    if (notesList[i].notesVal != component.find("notesTextArea").get("v.value")) {
                        notesList[i].notesVal = component.find("notesTextArea").get("v.value");
                    }
                }
            }
        }
        console.log('notesList ' + JSON.stringify(notesList));
        component.set('v.notesMap', notesList);
    },

    organizeData: function (component, event, helper) {
        component.set('v.editValueFromParent', false);

        var refStatMap = component.get('v.refStatMap');
        var notesMap = component.get('v.notesMap');
        var interMap = component.get('v.interMap');
        var finalMap = component.get('v.finalMap');

        for (let i = 0; i < notesMap.length; i++) {
            interMap.push(notesMap[i]);
        }
        for (let i = 0; i < refStatMap.length; i++) {
            interMap.push(refStatMap[i]);
        }

        console.log('interMap ' + JSON.stringify(interMap));

        for (let i = 0; i < interMap.length; i++) {
            if (finalMap == null || finalMap == undefined || finalMap.length == 0) {
                finalMap.push(interMap[i]);
            }
            else {
                for (let j = 0; j < finalMap.length; j++) {
                    if (interMap[i].refStatId != finalMap[j].refStatId) {
                        finalMap.push(interMap[i]);
                    }
                    else {
                        if (interMap[i].OptionSel != null && finalMap[j].OptionSel == null) {
                            finalMap[j].OptionSel = interMap[i].OptionSel;
                        }
                        if (interMap[i].notesVal != null && finalMap[j].notesVal == null) {
                            finalMap[j].notesVal = interMap[i].notesVal;
                        }
                    }
                }
            }
        }
        component.set('v.finalMap', finalMap);
        console.log('finalMap ' + JSON.stringify(finalMap));

        var compEvent = component.getEvent("refStatEvent");
        compEvent.setParams({ "refStatRec": component.get('v.finalMap') });
        compEvent.fire();

        component.set('v.finalMap', []);
        component.set('v.refStatMap', []);
        component.set('v.notesMap', []);
        component.set('v.interMap', []);
    }
    //------------------------SAMARTH------------------------
})