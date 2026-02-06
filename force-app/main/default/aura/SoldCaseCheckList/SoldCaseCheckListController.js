({
    handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        var SalesStageMedical= '';
        var SalesStageDental= '';
        var SalesStagePharmacy='';
        var SalesStageVision = '';
        var SalesStageOther='';
        
        if(eventParams.changeType === "LOADED") {
            console.log('test');
            //component.set('v.isDataLoaded',true);
            // SalesStageMedical = component.get('v.OpportunityData').StageName;
            SalesStageMedical = component.get('v.OpportunityData').Sales_Stage_Medical__c;
            SalesStageDental = component.get('v.OpportunityData').Sales_Stage_Dental__c;
            SalesStagePharmacy = component.get('v.OpportunityData').Sales_Stage_Pharmacy__c;
            SalesStageVision = component.get('v.OpportunityData').Sales_Stage_Vision__c;
            SalesStageOther = component.get('v.OpportunityData').Sales_Stage_Other__c;
        } else if(eventParams.changeType === "REMOVED") {
            
        } else if(eventParams.changeType === "ERROR") {
            
        }
        if(SalesStageMedical == 'Notified'||SalesStageDental == 'Notified'||SalesStagePharmacy == 'Notified'||SalesStageVision == 'Notified'||SalesStageOther == 'Notified'){
            var action1 = component.get('c.getTheXMLFileFromSR');
            action1.setParams({ 'recordId' : component.get("v.recordId") });
            component.set("v.progress", 40);
            var today = new Date();
            
            action1.setCallback(this, function(response){
                var state = response.getState();
                if (state === "SUCCESS") {
                    var data = response.getReturnValue();
                    if (data == null){return;} 
                    // ####--code for create a temp. <a> html tag [link tag] for download the CSV file--####     
                    var hiddenElement = document.createElement('a');
                    //hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURI(data);
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(data);
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'SCCL'+today+'.xls';  // CSV file Name* you can change it.[only name not .csv] 
                    document.body.appendChild(hiddenElement); // Required for FireFox browser
                    hiddenElement.click(); // using click() js function to download csv file
                }
                component.set("v.progress", 100);
                var dismissActionPanel = $A.get("e.force:closeQuickAction");
                dismissActionPanel.fire(3000);
            });
            $A.enqueueAction(action1);
            
        }else{
            var dismissActionPanel = $A.get("e.force:closeQuickAction");
            dismissActionPanel.fire();
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error",
                "message": "We are not able to generate SoldCaseCheckList,Since none of the Product categories are in Notified Stage"
            });
            toastEvent.fire();
        }
    }
    
})