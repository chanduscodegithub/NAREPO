({
	init : function(cmp, event, helper) {
		cmp.set('v.columns', [
            {label: 'Implementation Name', fieldName: 'link', type: 'url',typeAttributes: {
                    label: {
                        fieldName: "Name"
                    },
                    target: "_blank"
                }},
            {label: 'Company Name', fieldName: 'AccountName', type: 'text'},
            {label: 'Effective Date', fieldName: 'Effective_Date__c', type: 'Date'},
            {label: 'Owner Name', fieldName: 'OwnerName', type: 'text'},
            {label: 'Members', fieldName: 'Number_of_Lives__c', type: 'number'},
            {label: 'Scope', fieldName: 'Description__c', type: 'text'},
        ]);
        var action = cmp.get('c.getIPMData');
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
            if(response.getReturnValue().length > 0){
                cmp.set('v.showDownloadButton',true);
            }
            if(response.getReturnValue().length == 0){
                cmp.set('v.showMessage',true);
            }
            var rows = response.getReturnValue();
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                row.link = '/' + row.Id;
                if (row.Account__r) row.AccountName = row.Account__r.Name;
        		if (row.Owner) row.OwnerName = row.Owner.Name;
        		/* 
        		 * Code to Slice the Date and month for Effective Date
        		 * */
                if(row.hasOwnProperty('Project_Tasks__r')){
                    if(row.Project_Tasks__r[0].Start_Date__c != null && row.Project_Tasks__r.length > 0){
                        if(row.Project_Tasks__r[0].Start_Date__c.slice(5,6) == 0){
                            if(row.Project_Tasks__r[0].Start_Date__c.slice(8,9) == 0){
                                row.Effective_Date__c = row.Project_Tasks__r[0].Start_Date__c.slice(6,7) + '/' + row.Project_Tasks__r[0].Start_Date__c.slice(9) + '/' + row.Project_Tasks__r[0].Start_Date__c.slice(0,4);
                            } else if(row.Project_Tasks__r[0].Start_Date__c.slice(8,9) != 0){
                                row.Effective_Date__c = row.Project_Tasks__r[0].Start_Date__c.slice(6,7) + '/' + row.Project_Tasks__r[0].Start_Date__c.slice(8,12) + '/' + row.Project_Tasks__r[0].Start_Date__c.slice(0,4);
                            }
                        } else if(row.Project_Tasks__r[0].Start_Date__c.slice(5,6) != 0){
                            if(row.Project_Tasks__r[0].Start_Date__c.slice(8,9) == 0){
                                row.Effective_Date__c = row.Project_Tasks__r[0].Start_Date__c.slice(5,7) + '/' + row.Project_Tasks__r[0].Start_Date__c.slice(9) + '/' + row.Project_Tasks__r[0].Start_Date__c.slice(0,4);
                            } else if(row.Project_Tasks__r[0].Start_Date__c.slice(8,9) != 0){
                                row.Effective_Date__c = row.Project_Tasks__r[0].Start_Date__c.slice(5,7) + '/' + row.Project_Tasks__r[0].Start_Date__c.slice(8,10) + '/' + row.Project_Tasks__r[0].Start_Date__c.slice(0,4);
                            }
                        }
                    } 
                } else if(row.Effective_Date__c != null){
                    if(row.Effective_Date__c.slice(5,6) == 0){
                        if(row.Effective_Date__c.slice(8,9) == 0){
                            row.Effective_Date__c = row.Effective_Date__c.slice(6,7) + '/' + row.Effective_Date__c.slice(9) + '/' + row.Effective_Date__c.slice(0,4);
                        } else if(row.Effective_Date__c.slice(8,9) != 0){
                            row.Effective_Date__c = row.Effective_Date__c.slice(6,7) + '/' + row.Effective_Date__c.slice(8,12) + '/' + row.Effective_Date__c.slice(0,4);
                        }
                    } else if(row.Effective_Date__c.slice(5,6) != 0){
                        if(row.Effective_Date__c.slice(8,9) == 0){
                            row.Effective_Date__c = row.Effective_Date__c.slice(5,7) + '/' + row.Effective_Date__c.slice(9) + '/' + row.Effective_Date__c.slice(0,4);
                        } else if(row.Effective_Date__c.slice(8,9) != 0){
                            row.Effective_Date__c = row.Effective_Date__c.slice(5,7) + '/' + row.Effective_Date__c.slice(8,10) + '/' + row.Effective_Date__c.slice(0,4);
                        }
                    }
                }
        		 
            }
    		cmp.set('v.data', rows);
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
            }
        }));
        $A.enqueueAction(action);
	},

    downloadSpotLightReport : function (cmp, event, helper) {
        var selectedRowId = [];
        cmp.get('v.selectedRows').forEach(ele=>{
            selectedRowId.push(ele.Id);
        });
            cmp.set('v.selectedRowId',selectedRowId);
            
            if(selectedRowId!=undefined && selectedRowId!=null && selectedRowId.length > 0){
            var spinner = cmp.find("loadingSpinner");
            $A.util.removeClass(spinner, 'slds-hide');
            $A.util.addClass(spinner, 'slds-show');
            
            var action = cmp.get('c.getTemplateInXML');
            
            action.setParams({'spotlightChckdIpmIdLst':cmp.get('v.selectedRowId')});
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                if(responseData.IPMData.length==0){
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                    helper.showToast('No records to download',' ');
                }
                else{
                    helper.generateXmlFile(cmp,responseData.objectItags,responseData.xmlString,responseData.IPMData,responseData.snrExecData,responseData.taskData,responseData.IRADData,responseData.holidayData);
                }
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        }));
        $A.enqueueAction(action);
    }
    else{
        helper.showToast('Please select records to download',' ');
    }
},
    getSelectedValue: function (cmp, event, helper) {
        var selectedRows = event.getParam("selectedRows");
        cmp.set('v.selectedRows',selectedRows);
    },
        
})