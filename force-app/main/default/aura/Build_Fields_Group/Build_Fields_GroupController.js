/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 02-20-2024
 * @last modified by  : Thanushree
**/
({
    doInit: function(component, event, helper) {        
        var MAFeildValue = component.get('v.simpleRecord')[component.get('v.fields.fieldPath')];
        if(component.get('v.fields.type') === 'MULTIPICKLIST'){
            if(MAFeildValue != null && MAFeildValue !=''){
                var multiPicklistOptions = MAFeildValue.split(';');
                component.set('v.multiSelectValues',multiPicklistOptions);
            }
        }
        if(component.get('v.fields.type') === 'TEXTAREA' && MAFeildValue == null){
            component.set('v.MAFeildValue','');
        }else{           
            component.set('v.MAFeildValue',MAFeildValue);
        }  
        if(component.get('v.fields.fieldPath') == "Disposition_Other__c" && (MAFeildValue == '' || MAFeildValue == null)){
            component.set('v.MAFeildValue','Set individually for each Product'); 
        }else if(component.get('v.fields.fieldPath') == "Proactive_Renewal_Documents_Attached__c"){
            component.set('v.oppRecordId',component.get('v.simpleRecord')['Id']);
            component.set('v.isFileUploaded',component.get('v.simpleRecord')['Proactive_Renewal_Documents_Attached__c']);
        }
        component.set('v.resetVal',component.get('v.simpleRecord')[component.get('v.salesStageItag')]);
        console.log('Intial_Stage_values'+component.get('v.Intial_Stage_values')[0]);
        if(component.get('v.accessObj.readOnly') !== true){
            component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = component.get('v.MAFeildValue');
        }
        
        if(component.get('v.isComments') && (component.get('v.fields.fieldPath') == 'Sales_Summary_Comments_Pharmacy__c' || component.get('v.fields.fieldPath') == 'Sales_Summary_Comments_Other_Buy_Up__c' )){
            component.set('v.is_255',true);
            var getInputText = component.get("v.MAFeildValue");
            if(getInputText !== undefined && getInputText !== null){
                var count = getInputText.length;
                var charLeft = 255 - count;
                component.set("v.count",charLeft);    
            }else{
                component.set("v.count",255);
            }
        }
        //added by veera
        if(component.get('v.isComments') && (component.get('v.fields.fieldPath') == 'Sales_Summary_Comments__c')){
            component.set('v.is_2500',true);
            var getInputText = component.get("v.MAFeildValue");
            if(getInputText !== undefined && getInputText !== null){
                var count = getInputText.length;
                var charLeft = 2500 - count;
                component.set("v.count",charLeft);    
            }else{
                component.set("v.count",2500);
            }
        }
        
          if(component.get('v.isComments') && (component.get('v.fields.fieldPath') == 'Sales_Summary_Comments_Specialty__c')){
            component.set('v.is_4095',true);
            var getInputText = component.get("v.MAFeildValue");
            if(getInputText !== undefined && getInputText !== null){
                var count = getInputText.length;
                var charLeft = 4095 - count;
                component.set("v.count",charLeft);    
            }else{
                component.set("v.count",4095);
            }
        }
        
        if(component.get('v.isComments') && component.get('v.fields.fieldPath') == 'Closed_Comments__c'){
            component.set('v.is_500',true);
            var getInputText = component.get("v.MAFeildValue");
            if(getInputText !== undefined && getInputText !== null){
                var count = getInputText.length;
                var charLeft = 500 - count;
                component.set("v.count",charLeft);    
            }else{
                component.set("v.count",500);
            }
        }
        if(component.get('v.isComments') && component.get('v.fields.fieldPath') == 'Comments__c'){
            component.set('v.is_25000',true);
            var getInputText = component.get("v.MAFeildValue");
            if(getInputText !== undefined && getInputText !== null){
                var count = getInputText.length;
                var charLeft = 25000 - count;
                component.set("v.count",charLeft);    
            }else{
                component.set("v.count",25000);
            }
        }
        
        if(component.get('v.isComments') && (component.get('v.fields.fieldPath') != 'Comments__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments_Specialty__c' && component.get('v.fields.fieldPath') != 'Closed_Comments__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments_Pharmacy__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments_Other_Buy_Up__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments_Specialty__c')){
            component.set('v.is_1600',true);
            var getInputText = component.get("v.MAFeildValue");
            if(getInputText !== undefined && getInputText !== null){
                var count = getInputText.length;
                var charLeft = 16000 - count;
                component.set("v.count",charLeft);    
            }else{
                component.set("v.count",16000);
            }
        }
        var fieldItag = component.get('v.fields.fieldPath');
        if(fieldItag === 'Copy_Pharmacy_sec1_Data_from_Med__c' || fieldItag === 'Copy_Pharmacy_sec2_Data_from_Med__c' || fieldItag === 'Copy_Pharmacy_sec3_Data_from_Med__c' || fieldItag === 'Copy_Vision_sec1_Data_from_Med__c' || fieldItag === 'Copy_Vision_sec2_Data_from_Med__c' || fieldItag === 'Copy_Vision_sec3_Data_from_Med__c' || fieldItag === 'Copy_Dental_sec1_Data_from_Med__c' || fieldItag === 'Copy_Dental_sec2_Data_from_Med__c' || fieldItag === 'Copy_Dental_sec3_Data_from_Med__c'){
            var productsInvolved = component.get('v.simpleRecord')['Product_Type_Involved_in_Opp__c'];
            var isCopyEnable = productsInvolved.includes("Medical");
            component.set("v.isMedicalExist",isCopyEnable);
        }
        
        if(component.get('v.fields.type') == 'PERCENT' && (MAFeildValue != null && MAFeildValue != '' && MAFeildValue != undefined)){
            var percentageFeildVal = MAFeildValue;
            percentageFeildVal = percentageFeildVal/100;
            component.set('v.MAFeildValue',percentageFeildVal);
        }
        
    },
    selectWriter : function(component, event, helper) {
        if(event.getParam('selectName') !== null || event.getParam('selectName') !== undefined){
            component.set('v.MAFeildValue',event.getParam('selectName'));
        	component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = event.getParam('selectName');
        }        
    },
    setValues: function(component, event, helper) { 
        if(component.get('v.fields.type') == 'PERCENT'){
            var percentageVal = component.find('feildSetId').get('v.value');
            percentageVal = percentageVal*100;
            component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = percentageVal;
        }else{
            component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = component.find('feildSetId').get('v.value');
        }
        if(component.get('v.iTag').includes('Members_in_the_Proposal')){
            /* var cmpEvent = component.getEvent("makeFieldsEditable");
            cmpEvent.setParams({
                "isPickChange":false,
                "isMemInPropsal":true,
                "SelectedMemInPropsal":component.find('feildSetId').get('v.value')
            });
            cmpEvent.fire();*/
            component.set('v.SelectedMemInPropsal',component.find('feildSetId').get('v.value'));
        }
    },
    /*updateValue: function(component, event, helper) {
        if(component.get('v.isComments')){
            var feildSetId = component.find('feildSetId').get('v.value');
            if(feildSetId != null && feildSetId.length != undefined && feildSetId.length != null && feildSetId.length > 0){
                var count = component.get('v.commentsCount');
                var charCount = 16;
                if(charCount >= feildSetId.length){
                  component.set('v.commentsCount',charCount-feildSetId.length);  
                }else{                    
                    component.find('feildSetId').set('v.value',feildSetId.substring(0, 16));
                }
            }
            console.log('test count'+component.find('feildSetId').get('v.value'));
        }
    }*/
    inputTextCounter : function(component, event, helper) {
        if(component.get('v.isComments') && ( component.get('v.fields.fieldPath') == 'Sales_Summary_Comments_Pharmacy__c' || component.get('v.fields.fieldPath') == 'Sales_Summary_Comments_Other_Buy_Up__c' || component.get('v.fields.fieldPath') == 'Sales_Summary_Comments_Specialty__c')){
            var getInputText = component.get("v.MAFeildValue");
            var count = getInputText.length;
            var charLeft = 255 - count;
            component.set("v.count",charLeft);
        }
        
        if(component.get('v.isComments') && (component.get('v.fields.fieldPath') == 'Sales_Summary_Comments__c')){
            var getInputText = component.get("v.MAFeildValue");
            var count = getInputText.length;
            var charLeft = 2500 - count;
            component.set("v.count",charLeft);
        }
        
        if(component.get('v.isComments') && (component.get('v.fields.fieldPath') == 'Sales_Summary_Comments_Specialty__c')){
            var getInputText = component.get("v.MAFeildValue");
            var count = getInputText.length;
            var charLeft =4095 - count;
            component.set("v.count",charLeft);
        }
        
        
        if(component.get('v.isComments') && component.get('v.fields.fieldPath') == 'Closed_Comments__c'){
            var getInputText = component.get("v.MAFeildValue");
            var count = getInputText.length;
            var charLeft = 500 - count;
            component.set("v.count",charLeft);
        }
        if(component.get('v.isComments') && component.get('v.fields.fieldPath') == 'Comments__c'){
            var getInputText = component.get("v.MAFeildValue");
            var count = getInputText.length;
            var charLeft = 25000 - count;
            component.set("v.count",charLeft);
        }
        
        if(component.get('v.isComments') && (component.get('v.fields.fieldPath') != 'Comments__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments_Specialty__c' && component.get('v.fields.fieldPath') != 'Closed_Comments__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments_Pharmacy__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments_Other_Buy_Up__c' && component.get('v.fields.fieldPath') != 'Sales_Summary_Comments__c')){
            var getInputText = component.get("v.MAFeildValue");
            var count = getInputText.length;
            var charLeft = 16000 - count;
            component.set("v.count",charLeft);
        }
    },
    /*addDateTimeStamp : function(component, event, helper) {
    	var now = new Date();
        var timeStamp = $A.localizationService.formatDate(now, "MMM DD YYYY, hh:mm:ss a")+': ';
        var getInputText = component.get("v.MAFeildValue");
        if(getInputText !== undefined && getInputText !== null){
            component.set("v.MAFeildValue",getInputText+timeStamp);  
        }else{
            component.set("v.MAFeildValue",timeStamp);
        }
    },*/
    setDateValues: function(component, event, helper) { 
        component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = component.find('feildSetId').get('v.value');
    },
    makeEditable: function(component, event, helper) {
        console.log('inside makeEditable');
        var a1 = component.get('v.MedOthSelcSalesStgNme');
        var a2 = component.get('v.Selected_Stage_Name');
        
        setTimeout(function(){ 
            var feildSetId = component.find("feildSetId");          
            if(feildSetId !== undefined && component.get('v.fields.fieldPath') !== 'Proactive_Renewal_Underwriter__c'){
                feildSetId.focus();
            }
        }, 250);
        var cmpEvent = component.getEvent("makeFieldsEditable");         	   
        cmpEvent.fire();   
    },
    prePopulateValues: function(component, event, helper) {
        console.log('inside pre populate');
        var MAData = component.get('v.simpleRecord');
        //MAData[component.get('v.fields.fieldPath')] = component.find('feildSetId').get('v.value');        
        if(component.find('feildSetId').get('v.value') === true){
            var copyFields;
            var fieldName = component.get('v.fields.fieldPath');
            if(fieldName === 'Copy_Risk_Prob_Cls_Dt_from_Med__c'){
                if(helper.emptyCheck(MAData['Risk_Probability_Medical__c'])){
                    MAData['Risk_Probability_Other__c'] = MAData['Risk_Probability_Medical__c'];
                }
                if(helper.emptyCheck(MAData['Anticipated_Actual_Close_Date_Medical__c'])){
                    MAData['Anticipated_Actual_Close_Date_Other__c'] = MAData['Anticipated_Actual_Close_Date_Medical__c'];
                }
                copyFields = ['Risk_Probability_Other__c','Anticipated_Actual_Close_Date_Other__c'];
            }else if(fieldName === 'Copy_Prop_Due_Dt_Received_Dt_from_Med__c'){
                if(helper.emptyCheck(MAData['Proposal_Received_Date_Medical__c'])){
                    MAData['Proposal_Received_Date_Other__c'] = MAData['Proposal_Received_Date_Medical__c'];
                }
                if(helper.emptyCheck(MAData['Proposal_Due_Date_Medical__c'])){
                    MAData['Proposal_Due_Date_Other__c'] = MAData['Proposal_Due_Date_Medical__c'];
                }
                copyFields = ['Proposal_Due_Date_Other__c','Proposal_Received_Date_Other__c'];
            }else if(fieldName === 'Copy_Finalist_information_from_Med__c'){
                if(helper.emptyCheck(MAData['Finalist_Date_Detail_Medical__c'])){
                    MAData['Finalist_Date_Detail_Other_Buy_Up_Progra__c'] = MAData['Finalist_Date_Detail_Medical__c'];
                }
                if(helper.emptyCheck(MAData['Finalist_Date_Medical__c'])){
                    MAData['Finalist_Date_Other__c'] = MAData['Finalist_Date_Medical__c'];
                }
                copyFields = ['Finalist_Date_Detail_Other_Buy_Up_Progra__c','Finalist_Date_Other__c'];
            }else if(fieldName === 'Copy_Vision_sec1_Data_from_Med__c'){
                if(helper.emptyCheck(MAData['Risk_Probability_Medical__c'])){
                    MAData['Risk_Probability_Vision__c'] = MAData['Risk_Probability_Medical__c'];
                }                              
                if(helper.emptyCheck(MAData['Anticipated_Actual_Close_Date_Medical__c'])){
                    MAData['Anticipated_Actual_Close_Date_Vision__c'] = MAData['Anticipated_Actual_Close_Date_Medical__c'];
                }
                copyFields = ['Risk_Probability_Vision__c','Anticipated_Actual_Close_Date_Vision__c'];
            }else if(fieldName === 'Copy_Vision_sec2_Data_from_Med__c'){                
                if(helper.emptyCheck(MAData['Proposal_Received_Date_Medical__c'])){
                    MAData['Proposal_Received_Date_Vision__c'] = MAData['Proposal_Received_Date_Medical__c'];
                }                
                if(helper.emptyCheck(MAData['Proposal_Due_Date_Medical__c'])){
                    MAData['Proposal_Due_Date_Vision__c'] = MAData['Proposal_Due_Date_Medical__c'];
                } 
                copyFields = ['Proposal_Due_Date_Vision__c','Proposal_Received_Date_Vision__c'];
            }else if(fieldName === 'Copy_Vision_sec3_Data_from_Med__c'){
                if(helper.emptyCheck(MAData['Finalist_Date_Detail_Medical__c'])){
                    MAData['Finalist_Date_Detail_Vision__c'] = MAData['Finalist_Date_Detail_Medical__c'];
                }
                if(helper.emptyCheck(MAData['Finalist_Date_Medical__c'])){
                    MAData['Finalist_Date_Vision__c'] = MAData['Finalist_Date_Medical__c'];
                }                                
                copyFields = ['Finalist_Date_Detail_Vision__c','Finalist_Date_Vision__c'];
            }else if(fieldName === 'Copy_Dental_sec1_Data_from_Med__c'){
                if(helper.emptyCheck(MAData['Risk_Probability_Medical__c'])){
                    MAData['Risk_Probability_Dental__c'] = MAData['Risk_Probability_Medical__c'];
                }
                if(helper.emptyCheck(MAData['Anticipated_Actual_Close_Date_Medical__c'])){
                    MAData['Anticipated_Actual_Close_Date_Dental__c'] = MAData['Anticipated_Actual_Close_Date_Medical__c'];
                }
                copyFields = ['Risk_Probability_Dental__c','Anticipated_Actual_Close_Date_Dental__c'];
            }else if(fieldName === 'Copy_Dental_sec2_Data_from_Med__c'){
                if(helper.emptyCheck(MAData['Proposal_Received_Date_Medical__c'])){
                    MAData['Proposal_Received_Date_Dental__c'] = MAData['Proposal_Received_Date_Medical__c'];
                }                
                if(helper.emptyCheck(MAData['Proposal_Due_Date_Medical__c'])){
                    MAData['Proposal_Due_Date_Dental__c'] = MAData['Proposal_Due_Date_Medical__c'];
                }
                copyFields = ['Proposal_Due_Date_Dental__c','Proposal_Received_Date_Dental__c'];
            }else if(fieldName === 'Copy_Dental_sec3_Data_from_Med__c'){
                if(helper.emptyCheck(MAData['Finalist_Date_Detail_Medical__c'])){
                    MAData['Finalist_Date_Detail_Dental__c'] = MAData['Finalist_Date_Detail_Medical__c'];
                }                
                if(helper.emptyCheck(MAData['Finalist_Date_Medical__c'])){
                    MAData['Finalist_Date_Dental__c'] = MAData['Finalist_Date_Medical__c'];
                }                
                copyFields = ['Finalist_Date_Detail_Dental__c','Finalist_Date_Dental__c'];
            }else if(fieldName === 'Copy_Pharmacy_sec1_Data_from_Med__c'){
                if(helper.emptyCheck(MAData['Risk_Probability_Medical__c'])){
                    MAData['Risk_Probability_Pharmacy__c'] = MAData['Risk_Probability_Medical__c'];
                }                
                if(helper.emptyCheck(MAData['Anticipated_Actual_Close_Date_Medical__c'])){
                    MAData['Anticipated_Actual_Close_Date_Pharmacy__c'] = MAData['Anticipated_Actual_Close_Date_Medical__c'];
                } 
                copyFields = ['Risk_Probability_Pharmacy__c','Anticipated_Actual_Close_Date_Pharmacy__c'];
            }else if(fieldName === 'Copy_Pharmacy_sec2_Data_from_Med__c'){
                if(helper.emptyCheck(MAData['Proposal_Received_Date_Medical__c'])){
                    MAData['Proposal_Received_Date_Pharmacy__c'] = MAData['Proposal_Received_Date_Medical__c'];
                }                                
                if(helper.emptyCheck(MAData['Proposal_Due_Date_Medical__c'])){
                    MAData['Proposal_Due_Date_Pharmacy__c'] = MAData['Proposal_Due_Date_Medical__c'];
                }
                copyFields = ['Proposal_Due_Date_Pharmacy__c','Proposal_Received_Date_Pharmacy__c'];
            }else if(fieldName === 'Copy_Pharmacy_sec3_Data_from_Med__c'){                
                if(helper.emptyCheck(MAData['Finalist_Date_Detail_Medical__c'])){
                    MAData['Finalist_Date_Detail_Pharmacy__c'] = MAData['Finalist_Date_Detail_Medical__c'];
                }                
                if(helper.emptyCheck(MAData['Finalist_Date_Medical__c'])){
                    MAData['Finalist_Date_Pharmacy__c'] = MAData['Finalist_Date_Medical__c'];
                }                
                copyFields = ['Finalist_Date_Detail_Pharmacy__c','Finalist_Date_Pharmacy__c'];
            }     
            
            var cmpEvent = component.getEvent("makeFieldsEditable"); 
            cmpEvent.setParams({
                "isCopy":true,
                "copyFields":copyFields
            });
            cmpEvent.fire();
        }
    },
    onChildAttributeChange : function(component, event, helper) {
        console.log("makeFieldsEditable child");       	
    },
    buildFldMethod: function(component, event, helper) {
        console.log('inside buildFldMethod');
        var params = event.getParam('arguments');
        if(params){
            var isFocus = params.isFocus;
            var readOnly = params.readOnly;
            var isEditModeOn = params.isEditModeOn;
            var required = params.required;
            //alert(component.get('v.fields.fieldPath')+' '+required);
            if(required){
                component.set('v.isRequired',true);             
            }else{
                component.set('v.isRequired',false);
            }
            if(isFocus){
                setTimeout(function(){ 
                    var feildSetId = component.find("feildSetId");   
                    if(feildSetId!=undefined)
                        if(component.get('v.fields.fieldPath') == 'Proactive_Renewal_Underwriter__c' ){
                            feildSetId.focusInupt();
                        }else{
                            feildSetId.focus();
                        }
                }, 600);	  
            }else{
                $A.util.removeClass(component.find("editDiv"),'err-bkg');
            }
            if(readOnly){
                component.set('v.isEditable',false);   
            }else{
                component.set('v.isEditable',true);
            }
            
            if(isEditModeOn){
                component.set('v.isEditMode',true);
                if(component.get('v.fields.type') == 'MULTIPICKLIST'){
                    var MAFeildValue = component.get('v.MAFeildValue');
                    setTimeout(function(){ 
                        if(MAFeildValue != null && MAFeildValue !=''){
                            var multiPicklistOptions = MAFeildValue.split(';');
                             if($A.util.isEmpty(isFocus) && !isFocus){
                                component.set('v.multiSelectValues',multiPicklistOptions);
                            }
                        }
                    }, 600);
                }
                /*if(component.get('v.fields.type') == 'PERCENT'){
                    var MAFeildValue = component.get('v.MAFeildValue');
                    MAFeildValue = parseInt(MAFeildValue);
                    MAFeildValue = MAFeildValue/100;
                    component.set('v.MAFeildValue',MAFeildValue);
                }*/
            }else{
                component.set('v.isEditMode',false);
            }
            
            if(params.errMsg && params.errMsg !== ''){
                component.set("v.errorMsg",params.errMsg);
                $A.util.addClass(component.find("editDiv"),'err-bkg');
            }
        }                	
    },
    clearField: function(component, event, helper) {
        $A.util.removeClass(component.find("editDiv"),'err-bkg');
    },
    copyDataToFields: function(component, event, helper) {
        var params = event.getParam('arguments');
        if(params){
            var fieldItag = params.fieldItag;
            component.find('feildSetId').set('v.value',component.get('v.simpleRecord')[fieldItag])
        }
    },
    onSelectChange: function(component, event, helper) { 
        console.log("on change");
        var progressionFieldValue = '';
        var IntialValueObject = '';
        var MACategory = component.get("v.oppCategory");
        var SelectedSalesStage = component.find("feildSetId").get("v.value");
        var categorySalesStage = component.get('v.fields.fieldPath').includes('Sales_Stage_');
        var isRiskProbality = component.get('v.fields.fieldPath').includes('Risk_Probability_');
        var isDispostion = component.get('v.fields.fieldPath').includes('Disposition_');
        var isFinalistDateDetail = component.get('v.fields.fieldPath').includes('Finalist_Date_Detail_');
        var intialStageValue = 'Inital_Selected_';
        var stageMap = component.get('v.saleStageIntialValueMap');
        if(isDispostion){
            /*if(component.find('feildSetId').get('v.value') == '' || component.find('feildSetId').get('v.value') == null || component.find('feildSetId').get('v.value') == undefined){
                return;
            }*/
            component.set('v.MAFeildValue',component.find('feildSetId').get('v.value'));
            var cmpEvent = component.getEvent("makeFieldsEditable");
            cmpEvent.setParams({
                "isPickChange":true,
                "isDispos":true,
                "SelectedDispoitionValue":component.find('feildSetId').get('v.value')
            });
            cmpEvent.fire();
        }
        if(isRiskProbality){
            /*if(component.find('feildSetId').get('v.value') == '' || component.find('feildSetId').get('v.value') == null || component.find('feildSetId').get('v.value') == undefined){
                return;
            }*/
            component.set('v.MAFeildValue',component.find('feildSetId').get('v.value'));
            var cmpEvent = component.getEvent("makeFieldsEditable");
            cmpEvent.setParams({
                "isPickChange":true,
                "isRiskProb":true,
                "SelectedRiskProb":component.find('feildSetId').get('v.value'),
                "selectedITag":component.get('v.iTag'),
            });
            cmpEvent.fire();
        }
        if(isFinalistDateDetail){
            component.set('v.MAFeildValue',component.find('feildSetId').get('v.value'));
            var cmpEvent = component.getEvent("makeFieldsEditable");
            cmpEvent.setParams({
                "isPickChange":true,
                "isFinalistDetail":true,
                "SelectedFinalistDetail":component.find('feildSetId').get('v.value'),
                "selectedITag":component.get('v.iTag'),
            });
            cmpEvent.fire();
        }
        if(categorySalesStage){
            if(component.find('feildSetId').get('v.value') == '' || component.find('feildSetId').get('v.value') == null || component.find('feildSetId').get('v.value') == undefined){
                return;
            }
            var clrSalesStageValue = 'isEmpty_'+component.get('v.fields.fieldPath');
            intialStageValue = intialStageValue+component.get('v.fields.fieldPath');
            var saleStageIntialValueArray = component.get('v.saleStageIntialValueArray');
            IntialValueObject = {'initalSaleStageItag':intialStageValue,
                                 'selectedSalesStage':SelectedSalesStage,
                                 'Category':MACategory,
                                 'SalesStageItag':component.get('v.iTag'),
                                 'clrSalesStageValue':clrSalesStageValue};
            if(stageMap == null){
                stageMap = {};            
            }
            if(!component.get('v.simpleRecord')[clrSalesStageValue]){
                component.set('v.MAFeildValue','');
            }
            stageMap[intialStageValue] = IntialValueObject;        
            component.set('v.saleStageIntialValueMap',stageMap);
            if(component.get('v.Intial_Stage_values')[0] == undefined || component.get('v.Intial_Stage_values')[0] == null || component.get('v.Intial_Stage_values')[0] == ''){
                component.get('v.Intial_Stage_values')[0] = '';
            }
            
            var pregressionFieldItag = 'Progression_';
            pregressionFieldItag = pregressionFieldItag+component.get('v.fields.fieldPath');
            if(MACategory == 'NB'){
                if(SelectedSalesStage.trim() == 'Notified'){
                    progressionFieldValue = 'NB'+' '+component.get('v.MAFeildValue')+' '+SelectedSalesStage;
                }else{
                    progressionFieldValue = 'NB'+' '+SelectedSalesStage;
                }
            }else if(MACategory == 'NBEA'){
                if(SelectedSalesStage.trim() == 'Notified' || SelectedSalesStage.trim() == 'Transfer In/Out'){
                    progressionFieldValue = 'NBEA'+' '+component.get('v.MAFeildValue')+' '+SelectedSalesStage;
                }else if(component.get('v.Intial_Stage_values')[0] != null || component.get('v.Intial_Stage_values')[0] != '' || component.get('v.Intial_Stage_values')[0] != undefined){
                    if(SelectedSalesStage.trim() == component.get('v.Intial_Stage_values')[0] || component.get('v.MAFeildValue') == null || component.get('v.MAFeildValue') == ''){
                        progressionFieldValue = 'NBEA'+' '+SelectedSalesStage;
                    }else{
                        progressionFieldValue = 'NBEA'+' '+component.get('v.Intial_Stage_values')[0]+' '+SelectedSalesStage;
                    }
                }else if(component.get('v.MAFeildValue') == null || component.get('v.MAFeildValue') == ''){
                    progressionFieldValue = 'NBEA'+' '+SelectedSalesStage;
                }
            }
            if(progressionFieldValue.includes('-')){
                progressionFieldValue = progressionFieldValue.replace(/-/g, '_');
            }
            if(progressionFieldValue.includes(' ')){
                progressionFieldValue = progressionFieldValue.replace(/ /g, '_');
            }
            component.get('v.simpleRecord')[pregressionFieldItag] = progressionFieldValue;
            var cmpEvent = component.getEvent("makeFieldsEditable");
            component.set('v.MAFeildValue',component.find('feildSetId').get('v.value'));
            cmpEvent.setParams({
                "isPickChange":true,
                "sales_Stage_Name":SelectedSalesStage,
                "selectedITag":component.get('v.iTag'),
                "DispositionValue":progressionFieldValue+'_Gen_Disposition',
                "selectedCategory":component.get('v.fields.fieldPath')
            });
            cmpEvent.fire();
        }else{
            component.set('v.MAFeildValue',component.find('feildSetId').get('v.value'));
            component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = component.find('feildSetId').get('v.value');            
        }
        
    },
    resetSalesStage: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var cmpEvent = component.getEvent("resetEvent");
        var StageItag = '';
        if(selectedItem.dataset.record === 'Reset_Sales_Stage_MO_Medical__c'){ 
            cmpEvent.setParams({
                "SalesStageItag":'Sales_Stage_Medical__c',
            });
        }else if(selectedItem.dataset.record === 'Reset_Sales_Stage_MO_Other__c'){
            cmpEvent.setParams({
                "SalesStageItag":'Sales_Stage_Other__c',
            });
        }else{
            for (var key in component.get('v.selectedCategoryMap')) {
                StageItag = 'Sales_Stage_'+key+'__c';
            }
            cmpEvent.setParams({
                "SalesStageItag":StageItag,
            });
        }
        cmpEvent.fire();
    },
    clearFieldsFun: function(component, event, helper) {
        var params = event.getParam('arguments');
        if(component.get('v.fields.type') == 'BOOLEAN'){
            component.set('v.MAFeildValue',JSON.parse(params.value));
            component.get('v.simpleRecord')[component.get('v.iTag')] = JSON.parse(params.value); 
        }else{
            component.set('v.MAFeildValue',params.value);
            component.get('v.simpleRecord')[component.get('v.iTag')] = params.value;
        }
        
    },
    copyDataonSaveMtd: function(component, event, helper) {
        var params = event.getParam('arguments');
        component.set('v.MAFeildValue',params.MAData);
    },
    onCheck: function(component, event, helper) {
        var checkCmp = component.find("feildSetId");
        var cmpEvent = component.getEvent("makeFieldsEditable");
        var salesStage = '';
        var SalesStageItag = '';
        component.set('v.MAFeildValue',component.find('feildSetId').get('v.value'));
        component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = component.find('feildSetId').get('v.value');
        if(component.get('v.isComments')){
           return; 
        }
        if(component.get('v.isMedOth')){
            salesStage = component.get('v.SalesStageOther');
            SalesStageItag = component.get('v.SalesStageOtherItag');
        }else{
            salesStage = component.get('v.SalesStage');
            SalesStageItag = component.get('v.SalesStageItag');
        }
        if(!checkCmp.get("v.value")){
            cmpEvent.setParams({
                "isU_W_Engagement_not_yet_Needed":true,
                'sales_Stage_Name':salesStage,
                'selectedITag':SalesStageItag
            });
            cmpEvent.fire();
        }else{
            cmpEvent.setParams({
                "isU_W_Engagement_not_yet_Needed":false,
                'sales_Stage_Name':salesStage,
                'selectedITag':SalesStageItag
            });
            cmpEvent.fire();
        }  
    },
    handleChange: function (cmp, event) {
        var selectedOptionValue = event.getParam("value");
        var setMultipicklistVal = '';
        for(var i=0; i<selectedOptionValue.length; i++){
            if(setMultipicklistVal != null && setMultipicklistVal != ''){
                setMultipicklistVal = setMultipicklistVal+';'+selectedOptionValue[i];
            }else{
                setMultipicklistVal = selectedOptionValue[i];
            }
        }
        cmp.get('v.simpleRecord')[cmp.get('v.fields.fieldPath')] = setMultipicklistVal;
    },
    handleComponentEvent : function(component, event, helper) {
        
        // get the selected Account record from the COMPONETN event 	 
        var selectedAccountGetFromEvent = event.getParam("accountByEvent");
        var selectedAccountId = '';
        //alert(JSON.stringify(selectedAccountGetFromEvent));
        if(selectedAccountGetFromEvent != null){
            selectedAccountId = selectedAccountGetFromEvent.Id;
        }else{
            selectedAccountId = null;
        }
        component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = selectedAccountId;
    }
})