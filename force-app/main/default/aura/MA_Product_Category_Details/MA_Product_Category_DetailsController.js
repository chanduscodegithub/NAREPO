({
    expandCollapse: function(component, event, helper) {
        console.log("Expand Collapse");        
        var selectedItem = event.currentTarget;          
        var cmpTarget =  selectedItem.parentNode.parentNode;
        $A.util.toggleClass(cmpTarget,'is-open');
        var acc = component.get("v.accessObj");
    },
    expandCollapse1: function(component, event, helper) {        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        var iconElement = selectedItem.getAttribute("id");
        if(divId === 'Competitive_Medical_CSAD'){
            iconElement = 'utilityToggle1';
        }
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){                      
            component.find(iconElement).set("v.iconName","utility:chevrondown");           
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }
    },
    focusOnErrorField: function(component, event, helper) {  
        console.log("inside focusOnErrorField");
        var params = event.getParam('arguments');
        var genericFeildComponent_Id  = component.find('genericFeildComponent_Id');
        if(params){
            if(params.errorField_iTag){
                var selectedFeild = params.errorField_iTag;
                for(var i=0; i<genericFeildComponent_Id.length; i++){
                    if(genericFeildComponent_Id[i].get('v.iTag') == selectedFeild){
                        genericFeildComponent_Id[i].buildFeildsMethod(true,false,component.get('v.isEdit'),false);
                        break;
                    }
                }
            }else if(params.ErrorList){
                var ErrorList = params.ErrorList;
                for(var j=0; j<genericFeildComponent_Id.length; j++){
                    var clear = true;
                    for(var i=0; i<ErrorList.length; i++){
                        if(genericFeildComponent_Id[j].get('v.iTag') === ErrorList[i].ITag){
                            clear = false;
                            genericFeildComponent_Id[j].buildFeildsMethod(false,false,component.get('v.isEdit'),false,ErrorList[i].Error_Message);                        
                        }
                    }
                    if(clear){
                        genericFeildComponent_Id[j].clearFeildError(true);                        
                    }
                }
            } 
        }
    },
    onChildAttributeChange: function(component, event, helper) {
        console.log('Inside make editable');
        if(component.get("v.isAdditionalInfo") === true){
            $A.util.addClass(component.find("editBtn"),"slds-hide");
            $A.util.removeClass(component.find("saveBtn"),"slds-hide");
            $A.util.removeClass(component.find("cancelBtn"),"slds-hide");    
        }else if(component.get("v.isAdditionalInfo2") === true){
            $A.util.addClass(component.find("editBtn1"),"slds-hide");
            $A.util.removeClass(component.find("saveBtn1"),"slds-hide");
            $A.util.removeClass(component.find("cancelBtn1"),"slds-hide");    
        }else if(component.get("v.isCompanyWideMarket") === true){           
            $A.util.addClass(component.find("editBtn2"),"slds-hide");
            $A.util.removeClass(component.find("saveBtn2"),"slds-hide");
            $A.util.removeClass(component.find("cancelBtn2"),"slds-hide");
            var spinner10 = component.find("mySpinner3");
            $A.util.removeClass(spinner10, "slds-hide");
            setTimeout(function(){ 
                $A.util.addClass(spinner10, "slds-hide");
            }, 1000);
            var genericFeildComponent_Id  = component.find('genericFeildComponent_Id');
            var readOnlyFieldsItagList = component.get('v.accountreadOnlyFieldsItag');
            for(var i=0; i<genericFeildComponent_Id.length; i++){
                if(readOnlyFieldsItagList !== undefined && readOnlyFieldsItagList.indexOf(genericFeildComponent_Id[i].get('v.iTag')) >= 0){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),false);                
                }
            }
        }else{
            var isCopy = event.getParam("isCopy");
            var isU_W_Engagement_not_yet_Needed = event.getParam("isU_W_Engagement_not_yet_Needed");
            var clearStr = 'Backward_Stage_Progression_';
            var clearStrArr = [];
            var isPickChange = event.getParam("isPickChange");
            var sales_Stage_Name = event.getParam("sales_Stage_Name");
            var isProgression = event.getParam("isProgression");
            var selectedITag = event.getParam("selectedITag");
            var DispositionValue = event.getParam("DispositionValue");
            var isDispos = event.getParam('isDispos');
            var SelectedDispoitionValue = event.getParam('SelectedDispoitionValue');
            var genericFeildComponent_Id  = component.find('genericFeildComponent_Id');
            var isRiskProb = event.getParam('isRiskProb');
            var SelectedRiskProb = event.getParam('SelectedRiskProb');
            var isMemInPropsal = event.getParam('isMemInPropsal');
            var SelectedMemInPropsal = event.getParam('SelectedMemInPropsal');
            var isFinalistDetail = event.getParam('isFinalistDetail');
            var SelectedFinalistDetail = event.getParam('SelectedFinalistDetail');
            var selectedTab = component.get('v.selectedProductTab');
            var sectionlabel=component.find('Section_Label');
            component.set('v.isOnload',false);
            if(!component.get('v.isEdit')){
                return;
            }
            if(selectedITag === undefined){
                component.set('v.isOnload',true);
                selectedITag = component.get('v.SalesStageItag');
                sales_Stage_Name = component.get('v.simpleRecord')[selectedITag];
            }
            if(sales_Stage_Name != undefined && sales_Stage_Name != null && sales_Stage_Name != ''){
                sales_Stage_Name = sales_Stage_Name.replace(/ /g, '_');
            }
            
            if(isCopy){
                var copyFieldsList = event.getParam("copyFields");
                for(var i=0; i<genericFeildComponent_Id.length; i++){
                    if(copyFieldsList !== undefined && copyFieldsList.indexOf(genericFeildComponent_Id[i].get('v.iTag')) >= 0){
                        genericFeildComponent_Id[i].copyData(genericFeildComponent_Id[i].get('v.iTag'));              
                    }
                }
            }else if(isProgression){
                if(component.get('v.isMedOth') && selectedITag.includes('Other')){
                    component.set('v.prevOtherSalesStage',component.get('v.simpleRecord')[selectedITag]);
                    if(component.get('v.prevOtherSalesStage') == 'Notified' && sales_Stage_Name != 'Notified'){
                        clearStr = clearStr+'Other';
                        clearStrArr = component.get('v.clearValueMap')[clearStr];
                    }
                    
                    component.set('v.otherSalesStage',sales_Stage_Name.replace(/_/g,' '));
                }else{
                    component.set('v.prevGeneralSalesStage',component.get('v.simpleRecord')[selectedITag]);
                    if(component.get('v.prevGeneralSalesStage') == 'Notified' && sales_Stage_Name != 'Notified'){
                        for (var key in component.get('v.selectedCategoryMap')) {
                            if(selectedITag.includes(key)){
                                clearStr =  clearStr+key;
                                clearStrArr = component.get('v.clearValueMap')[clearStr];
                            }
                        }
                    }
                    component.set('v.generalSalesStage',sales_Stage_Name.replace(/_/g,' '));
                }
                var genericFeildComponent_Id = component.find('genericFeildComponent_Id');
                if(clearStrArr != undefined || clearStrArr != null){
                    for(var i=0; i<genericFeildComponent_Id.length; i++){
                        for(var j=0; j<clearStrArr.length; j++){
                            if(genericFeildComponent_Id[i].get('v.iTag') == clearStrArr[j]){
                                genericFeildComponent_Id[i].clearFields('');
                            }
                        }
                    }
                }
                if(sales_Stage_Name == 'Proposal' && (selectedITag.includes('Other') ||selectedITag.includes('Dental') || selectedITag.includes('Vision'))){
                    var clrProposalStage = ['U_W_Engagement_not_yet_Needed_CI_APP_HI__c	','U_W_Engagement_not_yet_Needed_Dental__c','U_W_Engagement_not_yet_Needed_Vision__c'];
                    for (var i = 0; i < genericFeildComponent_Id.length; i++) {
                        for(var j=0; j<clrProposalStage.length; j++){
                            if(genericFeildComponent_Id[i].get('v.iTag') == clrProposalStage[j].trim()){
                                genericFeildComponent_Id[i].clearFields(false);
                            }
                        }
                    }
                }
                
                if(sales_Stage_Name == 'Notified'){
                    var date = new Date();
                    var todayDate = '';
                    var month = date.getMonth()+1;
                    month = month.toString().split('');
                    var day = date.getDate();
                    day = day.toString().split('');
                    var year = date.getFullYear();
                    var AnticipatedCloseDate = '';
                    if(component.get('v.isMedOth') && selectedITag.includes('Other')){
                        AnticipatedCloseDate = 'Anticipated_Actual_Close_Date_Other__c';
                    }else if(component.get('v.isMedOth') && selectedITag.includes('Medical')){
                        AnticipatedCloseDate = 'Anticipated_Actual_Close_Date_Medical__c';
                    }else{
                        AnticipatedCloseDate = 'Anticipated_Actual_Close_Date_'+selectedTab+'__c';
                    }
                    if (month.length < 2){month = '0' + month[0];}else{month = date.getMonth()+1;}
                    if (day.length < 2){day = '0' + day[0];}else{day = date.getDate();}
                    todayDate = year+'-'+month+'-'+day;
                    for (var i = 0; i < genericFeildComponent_Id.length; i++) {
                        if(genericFeildComponent_Id[i].get('v.iTag') == AnticipatedCloseDate){
                            genericFeildComponent_Id[i].set('v.MAFeildValue',todayDate);
                            component.get('v.simpleRecord')[AnticipatedCloseDate] = todayDate;
                            break;
                        }
                    }
                }
                isU_W_Engagement_not_yet_Needed = true;
                if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Other')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_CI_APP_HI__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }else if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Dental')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_Dental__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }else if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Vision')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_Vision__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }
                helper.SyncSalesStagePicklist(component,event,selectedITag,sales_Stage_Name,DispositionValue);
                helper.salesStageChng(component,event,genericFeildComponent_Id,selectedITag,sales_Stage_Name,isU_W_Engagement_not_yet_Needed);
                helper.highlightsection(component,event,sales_Stage_Name,sectionlabel,selectedITag);
            }else if(isDispos){
                component.set('v.selectedDispostion',SelectedDispoitionValue);
                //CR : 22/04/20 Proactive renewal - Addtional info and Underwriter field mandatory
                if(component.get('v.generalSalesStage') == 'Notified' && component.get('v.oppCategory') == 'NBEA' && selectedITag.includes('Medical') && component.get('v.simpleRecord')['Reason_for_the_Opportunity_Risk__c'] == 'Proactive Renewal' && (component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2021' || component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2022' || component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2023')){                   
                    component.get('v.simpleRecord')['Disposition_Medical__c'] = SelectedDispoitionValue;
                    helper.salesStageChng(component,event,genericFeildComponent_Id,selectedITag,component.get('v.generalSalesStage'),isU_W_Engagement_not_yet_Needed);
                }
            }else if(isRiskProb){
                if(component.get('v.isMedOth') && selectedITag.includes('Other')){
                    component.set('v.selectedRiskOther',SelectedRiskProb);
                }else{
                    component.set('v.selectedRiskProb',SelectedRiskProb);
                }
                var salesStage = component.get('v.generalSalesStage');
                if(salesStage != undefined && salesStage != null && salesStage != ''){
                    salesStage = component.get('v.generalSalesStage').replace(/ /g, '_');
                }
                if(salesStage == 'Notified' && component.get('v.oppCategory') == 'NBEA' && !selectedITag.includes('Other')){
                    var riskItag = 'Risk_Probability_'+selectedTab+'__c';
                    helper.salesStageChng(component,event,genericFeildComponent_Id,selectedITag,component.get('v.generalSalesStage'),isU_W_Engagement_not_yet_Needed);
                }
            }else if(isMemInPropsal){
                component.set('v.SelectedMemInPropsal',SelectedMemInPropsal);
            }else if(isFinalistDetail){
                component.set('v.isOnload',false);
                component.set('v.SelectedFinalistDetail',SelectedFinalistDetail);
                helper.salesStageChng(component,event,genericFeildComponent_Id,selectedITag,component.get('v.generalSalesStage'),isU_W_Engagement_not_yet_Needed);
            }else if(isU_W_Engagement_not_yet_Needed){
                component.set('v.isOnload',false);
                if(!component.get('v.isMedOth')){
                    helper.salesStageChng(component,event,genericFeildComponent_Id,selectedITag,component.get('v.generalSalesStage'),isU_W_Engagement_not_yet_Needed);
                }else{
                    helper.salesStageChng(component,event,genericFeildComponent_Id,selectedITag,component.get('v.otherSalesStage'),isU_W_Engagement_not_yet_Needed);
                }
                
            }else if(isPickChange){
                var sectionlabel=component.find('Section_Label');                
                if(component.get('v.isMedOth') && selectedITag.includes('Other')){
                    component.set('v.prevOtherSalesStage',component.get('v.simpleRecord')[selectedITag]);
                    if(component.get('v.prevOtherSalesStage') == 'Notified' && sales_Stage_Name != 'Notified'){
                        clearStr = clearStr+'Other';
                        clearStrArr = component.get('v.clearValueMap')[clearStr];
                    }
                    component.set('v.otherSalesStage',sales_Stage_Name.replace(/_/g,' '));
                }else{
                    component.set('v.prevGeneralSalesStage',component.get('v.simpleRecord')[selectedITag]);
                    if(component.get('v.prevGeneralSalesStage') == 'Notified' && sales_Stage_Name != 'Notified'){
                        for (var key in component.get('v.selectedCategoryMap')) {
                            if(selectedITag.includes(key)){
                                clearStr =  clearStr+key;
                                clearStrArr = component.get('v.clearValueMap')[clearStr];
                            }
                        }
                    }
                    component.set('v.generalSalesStage',sales_Stage_Name.replace(/_/g,' '));
                }
                var genericFeildComponent_Id = component.find('genericFeildComponent_Id');
                if(clearStrArr != undefined || clearStrArr != null){
                    for(var i=0; i<genericFeildComponent_Id.length; i++){
                        for(var j=0; j<clearStrArr.length; j++){
                            if(genericFeildComponent_Id[i].get('v.iTag') == clearStrArr[j]){
                                genericFeildComponent_Id[i].clearFields('');
                            }
                        }
                    }
                }
                if(sales_Stage_Name == 'Proposal' && (selectedITag.includes('Other') ||selectedITag.includes('Dental') || selectedITag.includes('Vision'))){
                    var clrProposalStage = ['U_W_Engagement_not_yet_Needed_CI_APP_HI__c	','U_W_Engagement_not_yet_Needed_Dental__c','U_W_Engagement_not_yet_Needed_Vision__c'];
                    for (var i = 0; i < genericFeildComponent_Id.length; i++) {
                        for(var j=0; j<clrProposalStage.length; j++){
                            if(genericFeildComponent_Id[i].get('v.iTag') == clrProposalStage[j].trim()){
                                genericFeildComponent_Id[i].clearFields(false);
                            }
                        }
                    }
                }
                if(sales_Stage_Name == 'Notified'){
                    var date = new Date();
                    var todayDate = '';
                    var month = date.getMonth()+1;
                    month = month.toString().split('');
                    var day = date.getDate();
                    day = day.toString().split('');
                    var year = date.getFullYear();
                    var AnticipatedCloseDate = '';
                    if(component.get('v.isMedOth') && selectedITag.includes('Other')){
                        AnticipatedCloseDate = 'Anticipated_Actual_Close_Date_Other__c';
                    }else if(component.get('v.isMedOth') && selectedITag.includes('Medical')){
                        AnticipatedCloseDate = 'Anticipated_Actual_Close_Date_Medical__c';
                    }else{
                        AnticipatedCloseDate = 'Anticipated_Actual_Close_Date_'+selectedTab+'__c';
                    }
                    if (month.length < 2){month = '0' + month[0];}else{month = date.getMonth()+1;}
                    if (day.length < 2){day = '0' + day[0];}else{day = date.getDate();}
                    todayDate = year+'-'+month+'-'+day;
                    for (var i = 0; i < genericFeildComponent_Id.length; i++) {
                        if(genericFeildComponent_Id[i].get('v.iTag') == AnticipatedCloseDate){
                            genericFeildComponent_Id[i].set('v.MAFeildValue',todayDate);
                            component.get('v.simpleRecord')[AnticipatedCloseDate] = todayDate;
                            break;
                        }
                    }
                }
                isU_W_Engagement_not_yet_Needed = true;
                if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Other')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_CI_APP_HI__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }else if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Dental')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_Dental__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }else if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Vision')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_Vision__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }                
                helper.SyncSalesStage(component,event,selectedITag,sales_Stage_Name,DispositionValue);
                helper.salesStageChng(component,event,genericFeildComponent_Id,selectedITag,sales_Stage_Name,isU_W_Engagement_not_yet_Needed);
                helper.highlightsection(component,event,sales_Stage_Name,sectionlabel,selectedITag);
            }else{
                isU_W_Engagement_not_yet_Needed = true;
                if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Other')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_CI_APP_HI__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }else if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Dental')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_Dental__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }else if((sales_Stage_Name == 'Proposal' || sales_Stage_Name == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' &&  component.get('v.maActivityType') == 'Traditional' && selectedITag.includes('Vision')){
                    if(component.get('v.simpleRecord').U_W_Engagement_not_yet_Needed_Vision__c){
                        isU_W_Engagement_not_yet_Needed = false;
                    }
                }
                helper.salesStageChng(component,event,genericFeildComponent_Id,selectedITag,sales_Stage_Name,isU_W_Engagement_not_yet_Needed);
            }                                              
        }        
    },
    makeFieldsEditable: function(component, event, helper) {
        if(component.get("v.isAdditionalInfo") === true){
            var cmpTarget = component.find('Competitive_Medical_CM');       
            var myLabel = component.find("utilityToggle").get("v.iconName");        
            if(myLabel=="utility:chevronright"){                      
                component.find("utilityToggle").set("v.iconName","utility:chevrondown");           
                $A.util.toggleClass(cmpTarget,'slds-is-open');
            }
        }
        $A.util.addClass(component.find("editBtn"),"slds-hide");
        $A.util.removeClass(component.find("saveBtn"),"slds-hide");
        $A.util.removeClass(component.find("cancelBtn"),"slds-hide");        
        var cmpEvent = component.getEvent("makeFieldsEditable");
        cmpEvent.fire();
    },
    makeFieldsEditable1: function(component, event, helper) {
        if(component.get("v.isAdditionalInfo2") === true){
            var cmpTarget = component.find('Competitive_Medical_CSAD');       
            var myLabel = component.find("utilityToggle1").get("v.iconName");        
            if(myLabel=="utility:chevronright"){                      
                component.find("utilityToggle1").set("v.iconName","utility:chevrondown");           
                $A.util.toggleClass(cmpTarget,'slds-is-open');
            }
        }
        $A.util.addClass(component.find("editBtn1"),"slds-hide");
        $A.util.removeClass(component.find("saveBtn1"),"slds-hide");
        $A.util.removeClass(component.find("cancelBtn1"),"slds-hide");        
        var cmpEvent = component.getEvent("makeFieldsEditable");
        cmpEvent.fire();
    },
    makeFieldsEditable2: function(component, event, helper) {                 
        if(component.get("v.isCompanyWideMarket") === true){
            var cmpTarget = component.find('Company_Wide_Market');       
            var myLabel = component.find("utilityToggle").get("v.iconName");        
            if(myLabel=="utility:chevronright"){                      
                component.find("utilityToggle").set("v.iconName","utility:chevrondown");           
                $A.util.toggleClass(cmpTarget,'slds-is-open');
            }
        }       
        $A.util.addClass(component.find("editBtn2"),"slds-hide");
        $A.util.removeClass(component.find("saveBtn2"),"slds-hide");
        $A.util.removeClass(component.find("cancelBtn2"),"slds-hide");        
        var cmpEvent = component.getEvent("makeFieldsEditable");
        cmpEvent.fire();       
    },
    handleCancel: function(component, event, helper) {        
        var spinner = component.find("mySpinner");     
        component.set("v.isEdit",false);
        var cmpEvent = component.getEvent("refreshTab");
        cmpEvent.setParams({           
            "isAdditionalInfo":true
        });
        cmpEvent.fire();
        setTimeout(function(){ 
            $A.util.addClass(spinner, "slds-hide");
            $A.util.removeClass(component.find("editBtn"),"slds-hide");
            $A.util.addClass(component.find("saveBtn"),"slds-hide");
            $A.util.addClass(component.find("cancelBtn"),"slds-hide");  
        }, 1000);     
    },
    handleSave: function(component, event, helper) {
        var spinner = component.find("spinner1"); 
        var cmpEvent = component.getEvent("handleSaveEvent");
        $A.util.removeClass(spinner, "slds-hide");
        cmpEvent.fire();
        /* setTimeout(function(){ 
            $A.util.addClass(spinner, "slds-hide");
        }, 1000); */
    },
    /** Ghanshyam C start */
    showPopcomponent : function(component, event, helper) {
        console.log('one');
        
        var opprecordtype = component.get(' v.oppCategory');
        console.log('opprecordtype!@@@'+opprecordtype);
        $A.createComponents([["c:MA_InstructionPopupModel",{attribute:true,recordtype:opprecordtype}]],
                            function(newCmp, status, errorMessage){
                                //Add the new button to the body array
                                if (status === "SUCCESS") {
                                    console.log(" Success  NBEA")
                                    component.set("v.body", newCmp);
                                    
                                }
                                else if (status === "INCOMPLETE") {
                                    console.log("No response from server or client is offline.")
                                    // Show offline error
                                }
                                    else if (status === "ERROR") {
                                        console.log("Error: " + errorMessage);
                                        // Show error message
                                    }
                            }
                           );
        
        
    }
    /** Ghanshyam C END */
    
})