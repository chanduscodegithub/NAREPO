({
    
    getMAProductsAndCompetitorsFromSF : function(component,event,isReset,errObjArr) {
        console.log('memberShipActivityProductCategory');
        //this.startProcessing(component);  
        var spinner = component.find("mySpinner");        
        var action = component.get('c.saveMARecord');	    
        action.setParams({
            "opportunityObj" : component.get('v.simpleRecord')          
        });
        action.setCallback(this, function(response) {
            //this.stopProcessing(component);
            var state = response.getState();
            var savedResponse = response.getReturnValue();
            if (state === "SUCCESS") {
                if(savedResponse.isSuccess){
                    this.recordSaveSuccess(component,event,isReset);
                }else{
                    var errrorArray = [];                
                    var errorObj = savedResponse.errorMsgList;
                    if(errObjArr.length >0){
                        for(var j=0 ; j<errorObj.length; j++){
                            for(var arr=0; arr<errObjArr.length; arr++){
                                if(errObjArr[arr]['FieldItag'] != errorObj[j]['FieldItag']){
                                    errorObj.push(errObjArr[arr]);
                                }
                            }
                        }
                    }
                    if(errorObj != undefined && errorObj != null){
                        for(var i=0; i<errorObj.length; i++){
                            errrorArray.push({                         
                                "Error_Message" : errorObj[i].FieldErrorMsg,                        
                                "Field_Label" : errorObj[i].FieldLabel,                        
                                "ITag"  : errorObj[i].FieldItag,                        
                            });                     
                        } 
                    }
                    component.set('v.ErrorList',errrorArray);                
                    this.SetOrClearInitalValue(component, event,true);
                    $A.util.addClass(component.find("generror_Msg"),'hideEl');                
                    $A.util.addClass(component.find("generror_Popup"),'hide');                
                    $A.util.removeClass(component.find("error_Msg"),'hideEl');                
                    $A.util.removeClass(component.find("error_Popup"),'hide');                
                    $A.util.removeClass(component.find("editBtn"),'slds-hide');                
                    $A.util.addClass(spinner, "slds-hide");                
                    var MA_Product_Category_Details_Id = component.find('MA_Product_Category_Details_Id');                
                    MA_Product_Category_Details_Id.focusOnErrorField('','','',component.get('v.ErrorList'));                
                    console.log('Problem saving record, error: ' + JSON.stringify(errorObj));
                }
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {  
                            this.buildError(component,event,errObjArr);               
                        }
                    } else {
                        //console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    
    handelSaveRecordHelper : function(component, event,isReset) { 
        // code written by Harshavardhan Y R, To Save the OpportunityLineItems and Competitors               
        var self = '';
        if(component.get('v.MAChildAttrObj.isCompanyWideMarket') != true){
            if(isReset || component.get('v.MAChildAttrObj.isAdditionalInfo') || component.get('v.MAChildAttrObj.isAdditionalInfo2') || component.get('v.MAChildAttrObj.isComments')){
                component.get('v.simpleRecord').isMAtab__c = false;
            } else{
                component.get('v.simpleRecord').isMAtab__c = true;
            }
        }
        if(component.get("v.MAChildAttrObj.isAdditionalInfo") === false){ 
            var spinner = component.find("mySpinner");        
            $A.util.removeClass(spinner, "slds-hide");
        }
        
        self = this;
        if(component.get('v.MAChildAttrObj.oppCategory') == 'NBEA' && component.get('v.isMedOth')){
            self.copyData(component,event);
            /*if(component.get('v.isMedOth')){
                self.copyData(component,event);
            }            
            var products = component.get('v.simpleRecord')['Product_Type_Involved_in_Opp__c'];
            if(products.includes("Medical") && (products.includes("Vision") || products.includes("Dental") || products.includes("Pharmacy"))){
                self.copyOtherData(component,event);
            } */        
        }
        
        var maData = component.get('v.simpleRecord');
        /*var copyStringArray = ["Copy_Finalist_information_from_Med__c","Copy_Prop_Due_Dt_Received_Dt_from_Med__c","Copy_Risk_Prob_Cls_Dt_from_Med__c"];
        var copyarrayLength = copyStringArray.length;
        if(component.get('v.MAChildAttrObj.oppCategory') == 'NBEA' && component.get('v.isMedOth')){
            for (var i = 0; i <copyarrayLength; i++) {
                maData[copyStringArray[i]] = false;
            } 
        }*/       
        self.SetOrClearInitalValue(component, event,false);
        if(!component.get('v.MAChildAttrObj.isDataServiceTrasaction')){
            var DateErrorObject = component.get('v.DateErrorObject');
            var errObjArr = [];
            if(DateErrorObject != null && DateErrorObject != ''){
                for(var i in DateErrorObject){
                    if(DateErrorObject[i]['FieldValue'] != '' && DateErrorObject[i]['FieldValue'] != null && DateErrorObject[i]['FieldValue'] != undefined){
                        if(!self.isValidDate(component, event,DateErrorObject[i]['FieldValue'])){
                            errObjArr.push(DateErrorObject[i]);
                        }
                    }
                }
                //self.buildError(component,event,errObjArr);
            }
            self.getMAProductsAndCompetitorsFromSF(component, event,isReset,errObjArr);
            return;
        }
        if(component.get('v.isReset')){
            var SalesStageItag =  component.get('v.resetItag');
            var intialItag = '';
            var possItag = '';
            intialItag = 'Inital_Selected_'+SalesStageItag;
            possItag = 'Progression_'+SalesStageItag;
            component.get('v.simpleRecord')[SalesStageItag] = '';
            component.get('v.simpleRecord')[intialItag] = '';
            component.get('v.simpleRecord')[possItag] = ''; 
        }
        if(component.get('v.MAChildAttrObj.isCompanyWideMarket')){
            var date = new Date();
            var todayDate = '';
            var month = date.getMonth()+1;
            month = month.toString().split('');
            var day = date.getDate();
            day = day.toString().split('');
            var year = date.getFullYear();
            if (month.length < 2){month = '0' + month[0];}else{month = date.getMonth()+1;}
            if (day.length < 2){day = '0' + day[0];}else{day = date.getDate();}
            todayDate = year+'-'+month+'-'+day;
            component.get('v.simpleRecord')['Bic_and_Top_Market_Last_Modified_Date__c'] = todayDate;
        }
        if(!$A.util.isEmpty(component.get('v.MAChildAttrObj.isComments')) && component.get('v.MAChildAttrObj.isComments')){
            if(!$A.util.isEmpty(component.get('v.CheckCommentValueChanged')) && !$A.util.isEmpty(component.get('v.simpleRecord')['Comments__c'])){
                if(component.get('v.CheckCommentValueChanged').trim() != component.get('v.simpleRecord')['Comments__c'].trim()){
                    var date = new Date();
                    component.get('v.simpleRecord')['Comments_Last_Modified__c'] = date.toISOString();
                }
            }
            if(!$A.util.isEmpty(component.get('v.simpleRecord')['Comments__c'])){
                var charLimit = component.get('v.simpleRecord')['Comments__c'].trim();
                component.get('v.simpleRecord')['Comments_Reporting__c'] = charLimit.substr(0,4095);
            } else {
                component.get('v.simpleRecord')['Comments_Reporting__c'] = component.get('v.simpleRecord')['Comments__c'];
            }
        }
        component.find("recordHandler").saveRecord($A.getCallback(function(saveResult) {            
            // NOTE: If you want a specific behavior(an action or UI behavior) when this action is successful             
            // then handle that in a callback (generic logic when record is changed should be handled in recordUpdated event handler)            
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {                
                // handle component related logic in event handler                  
                if(component.get('v.isReset')){
                    //component.set('v.isReset',false);
                    var maProductCategoryDetails = component.find('MA_Product_Category_Details_Id');  
                    if(maProductCategoryDetails != null){
                        var  productsAndCompetitors = maProductCategoryDetails.find('productsAndCompetitorsAuraId');    
                        if(productsAndCompetitors != null){
                            productsAndCompetitors.resetProductAndComp(component.get('v.resetItag'));              
                        }
                    }                    
                }
                self.recordSaveSuccess(component,event);
                
            } else if (saveResult.state === "INCOMPLETE") {    
                component.set('v.isReset',false);
                console.log("User is offline, device doesn't support drafts.");                
            } else if (saveResult.state === "ERROR") {                
                //component.set('v.isReset',false);
                //component.set("v.ErrorList",saveResult.error);                
                var errrorArray = [];                
                var errorObj = saveResult.error[0].fieldErrors;                
                for(var i in errorObj){
                    if(i != 'isProductCompValidated__c'){
                        if(errorObj[i][0].message == "Invalid data type." && i.includes('Date')){
                            errrorArray.push({                         
                                "Error_Message" : 'Invalid date format.  Please enter the date in m/d/yyyy format.',                        
                                "Field_Label" : errorObj[i][0].fieldLabel,                        
                                "ITag"  : i,                        
                            });
                        }else if(errorObj[i][0].statusCode == "NUMBER_OUTSIDE_VALID_RANGE" && i == 'Opportunity_Average_Contract_Size_ACS__c'){
                            errrorArray.push({                         
                                "Error_Message" : "Please enter the data in the format – xx.xxxxxxxxxxxxxxxx",                        
                                "Field_Label" : errorObj[i][0].fieldLabel,                        
                                "ITag"  : i,                        
                            });
                        }else{
                            errrorArray.push({                         
                                "Error_Message" : errorObj[i][0].message,                        
                                "Field_Label" : errorObj[i][0].fieldLabel,                        
                                "ITag"  : i,                        
                            });
                        } 
                    }
                }
                if(errrorArray != null && errrorArray.length == 0){
                    
                    component.set('v.ErrorList',errrorArray);                
                    self.SetOrClearInitalValue(component, event,true);                
                    $A.util.addClass(component.find("error_Msg"),'hideEl');                
                    $A.util.addClass(component.find("error_Popup"),'hide');                
                    $A.util.addClass(component.find("editBtn"),'slds-hide');                
                    $A.util.addClass(spinner, "slds-hide");  
                    
                    var maProductCategoryDetails = component.find('MA_Product_Category_Details_Id');                
                    var  productsAndCompetitors = maProductCategoryDetails.find('productsAndCompetitorsAuraId');    
                    
                    var isDataValid = false; 
                    if(!component.get('v.MAChildAttrObj.isComments') && !isReset && !component.get('v.MAChildAttrObj.isAdditionalInfo')){                        
                        if(productsAndCompetitors != null){                
                            isDataValid = productsAndCompetitors.validateRecrodsMethod();                 
                        }            
                        if(!isDataValid){                
                            component.get('v.simpleRecord').isProductCompValidated__c = false;
                            if(!component.get('v.isEdit')){                    
                                component.makeFieldsEditable();                    
                            }
                            self.SetOrClearInitalValue(component, event,true);
                        }else{
                            component.get('v.simpleRecord').isProductCompValidated__c = true;
                            self.handelSaveRecordHelper(component, event,false)
                        }  
                    }                    
                    return;
                }
                component.get('v.simpleRecord').isProductCompValidated__c = false;
                component.set('v.ErrorList',errrorArray);                
                self.SetOrClearInitalValue(component, event,true);                
                $A.util.removeClass(component.find("error_Msg"),'hideEl');                
                $A.util.removeClass(component.find("error_Popup"),'hide');                
                $A.util.removeClass(component.find("editBtn"),'slds-hide');                
                $A.util.addClass(spinner, "slds-hide");                
                var MA_Product_Category_Details_Id = component.find('MA_Product_Category_Details_Id');                
                MA_Product_Category_Details_Id.focusOnErrorField('','','',component.get('v.ErrorList'));                
                console.log('Problem saving record, error: ' + JSON.stringify(saveResult.error));
            } else {                
                console.log('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));                
            }            
        }));        
    },    
    SetOrClearInitalValue: function(component, event,isError) {
        var intialStageValue = '';        
        var saleStageIntialValueMap = component.get('v.saleStageIntialValueMap');       
        for (var key in saleStageIntialValueMap) {            
            if (saleStageIntialValueMap.hasOwnProperty(key)) {                           
                console.log(key, saleStageIntialValueMap[key]);                
                intialStageValue = saleStageIntialValueMap[key].initalSaleStageItag;                
                component.get('v.simpleRecord')[saleStageIntialValueMap[key].SalesStageItag] = saleStageIntialValueMap[key].selectedSalesStage;
                if(!component.get('v.simpleRecord')[saleStageIntialValueMap[key].clrSalesStageValue]){
                    var intialStageFieldValue = '';                    
                    if(saleStageIntialValueMap[key].Category == 'NB'){                        
                        intialStageFieldValue = 'Initial_NB_'+saleStageIntialValueMap[key].selectedSalesStage;                        
                    }else if(saleStageIntialValueMap[key].Category == 'NBEA'){                        
                        intialStageFieldValue = 'Initial_NBEA_'+saleStageIntialValueMap[key].selectedSalesStage;                        
                    }                    
                    if(intialStageFieldValue.includes('-')){                        
                        intialStageFieldValue = intialStageFieldValue.replace(/-/g, '_');                        
                    }else{                        
                        intialStageFieldValue = intialStageFieldValue.replace(/ /g, '_');                        
                    }
                    if(isError){                        
                        component.get('v.simpleRecord')[intialStageValue] = '';                         
                    }else{
                        component.get('v.simpleRecord')[intialStageValue] = intialStageFieldValue;
                    }         
                }                
                /*if(component.get('v.simpleRecord')[intialStageValue] == null || component.get('v.simpleRecord')[intialStageValue] == ''){                    
                               
                }*/
            }            
        }        
    },
    
    recordSaveSuccess:function(component, event,isReset){      
        component.set("v.isEdit",false);
        $A.util.removeClass(component.find("edit_ActionBar"),'slds-hide');                
        $A.util.addClass(component.find("error_Msg"),'hideEl');                
        $A.util.addClass(component.find("error_Popup"),'hide');                
        $A.util.removeClass(component.find("Edit_Mode_risen"),'risen');                
        $A.util.addClass(component.find("save_cancel_ActionBar"),'slds-hide');                
        $A.util.removeClass(component.find("editBtn"),'slds-hide');                                
        if(!(component.get('v.MAChildAttrObj.isComments') || component.get('v.MAChildAttrObj.isAdditionalInfo') || component.get('v.MAChildAttrObj.isAdditionalInfo2') || component.get('v.MAChildAttrObj.isCompanyWideMarket')) || isReset){
            var maProductCategoryDetails = component.find('MA_Product_Category_Details_Id');           
            if(maProductCategoryDetails != null && maProductCategoryDetails != undefined){                
                var productsAndCompetitors = maProductCategoryDetails.find('productsAndCompetitorsAuraId');
            	productsAndCompetitors.saveOpptyPrdssAndCompetitorsRecords(); 
            }else{                
                 var interval = window.setInterval(
                    $A.getCallback(function() {                      
                        if(component.find('MA_Product_Category_Details_Id') != null && component.find('MA_Product_Category_Details_Id') != undefined){
                            var maProductCategoryDetails = component.find('MA_Product_Category_Details_Id'); 
        					var productsAndCompetitors = maProductCategoryDetails.find('productsAndCompetitorsAuraId');
            				productsAndCompetitors.saveOpptyPrdssAndCompetitorsRecords();
                            window.clearInterval(interval);                           
                        }
                    }), 300
        		 );   
            }        	                   
        }else{                    
            var cmpEvent = component.getEvent("refreshTab"); 
            if(component.get('v.MAChildAttrObj.isComments')){
                cmpEvent.setParams({                        
                    "isComments":true
                });
            }else{
                cmpEvent.setParams({                        
                    "isAdditionalInfo":true
                });
            }                  
            cmpEvent.fire();                    
        }            
    },
    copyData:function(component, event,isReset){
        var copyItagArray = ['Risk_Probability_Other__c','Anticipated_Actual_Close_Date_Other__c','Proposal_Due_Date_Other__c','Proposal_Received_Date_Other__c','Finalist_Date_Detail_Other_Buy_Up_Progra__c','Finalist_Date_Other__c'];
        var MAData = component.get('v.simpleRecord');
        if(MAData['Copy_Risk_Prob_Cls_Dt_from_Med__c']){
            if(this.emptyCheck(MAData['Risk_Probability_Medical__c'])){
                MAData['Risk_Probability_Other__c'] = MAData['Risk_Probability_Medical__c'];
            }
            if(this.emptyCheck(MAData['Anticipated_Actual_Close_Date_Medical__c'])){
                MAData['Anticipated_Actual_Close_Date_Other__c'] = MAData['Anticipated_Actual_Close_Date_Medical__c'];
            }
        }
        if(MAData['Copy_Prop_Due_Dt_Received_Dt_from_Med__c']){
            if(this.emptyCheck(MAData['Proposal_Received_Date_Medical__c'])){
                MAData['Proposal_Received_Date_Other__c'] = MAData['Proposal_Received_Date_Medical__c'];
            }
            if(this.emptyCheck(MAData['Proposal_Due_Date_Medical__c'])){
                MAData['Proposal_Due_Date_Other__c'] = MAData['Proposal_Due_Date_Medical__c'];
            }
        }
        if(MAData['Copy_Finalist_information_from_Med__c']){
            if(this.emptyCheck(MAData['Finalist_Date_Detail_Medical__c'])){
                MAData['Finalist_Date_Detail_Other_Buy_Up_Progra__c'] = MAData['Finalist_Date_Detail_Medical__c'];
            }
            if(this.emptyCheck(MAData['Finalist_Date_Medical__c'])){
                MAData['Finalist_Date_Other__c'] = MAData['Finalist_Date_Medical__c'];
            }
        }
        var fieldGrpId = component.find('MA_Product_Category_Details_Id').find('genericFeildComponent_Id');
        for(var i=0; i<fieldGrpId.length; i++){
            for(var j=0; j<copyItagArray.length; j++){
                if(fieldGrpId[i].get('v.iTag') == copyItagArray[j]){
                    fieldGrpId[i].copyDataonSave(component.get('v.simpleRecord')[copyItagArray[j]]); 
                }
            }
        }
    },
    /* copyOtherData:function(component, event){
        var MAData = component.get('v.simpleRecord');
        if(MAData['Copy_Vision_sec1_Data_from_Med__c']){
            if(this.emptyCheck(MAData['Risk_Probability_Medical__c'])){
                MAData['Risk_Probability_Vision__c'] = MAData['Risk_Probability_Medical__c'];
            }                              
            if(this.emptyCheck(MAData['Anticipated_Actual_Close_Date_Medical__c'])){
                MAData['Anticipated_Actual_Close_Date_Vision__c'] = MAData['Anticipated_Actual_Close_Date_Medical__c'];
            }            
        }
        if(MAData['Copy_Vision_sec2_Data_from_Med__c']){                
            if(this.emptyCheck(MAData['Proposal_Received_Date_Medical__c'])){
                MAData['Proposal_Received_Date_Vision__c'] = MAData['Proposal_Received_Date_Medical__c'];
            }                
            if(this.emptyCheck(MAData['Proposal_Due_Date_Medical__c'])){
                MAData['Proposal_Due_Date_Vision__c'] = MAData['Proposal_Due_Date_Medical__c'];
            }             
        }
        if(MAData['Copy_Vision_sec3_Data_from_Med__c']){
            if(this.emptyCheck(MAData['Finalist_Date_Detail_Medical__c'])){
                MAData['Finalist_Date_Detail_Vision__c'] = MAData['Finalist_Date_Detail_Medical__c'];
            }
            if(this.emptyCheck(MAData['Finalist_Date_Medical__c'])){
                MAData['Finalist_Date_Vision__c'] = MAData['Finalist_Date_Medical__c'];
            }                                            
        }
        if(MAData['Copy_Dental_sec1_Data_from_Med__c']){
            if(this.emptyCheck(MAData['Risk_Probability_Medical__c'])){
                MAData['Risk_Probability_Dental__c'] = MAData['Risk_Probability_Medical__c'];
            }
            if(this.emptyCheck(MAData['Anticipated_Actual_Close_Date_Medical__c'])){
                MAData['Anticipated_Actual_Close_Date_Dental__c'] = MAData['Anticipated_Actual_Close_Date_Medical__c'];
            }            
        }
        if(MAData['Copy_Dental_sec2_Data_from_Med__c']){
            if(this.emptyCheck(MAData['Proposal_Received_Date_Medical__c'])){
                MAData['Proposal_Received_Date_Dental__c'] = MAData['Proposal_Received_Date_Medical__c'];
            }                
            if(this.emptyCheck(MAData['Proposal_Due_Date_Medical__c'])){
                MAData['Proposal_Due_Date_Dental__c'] = MAData['Proposal_Due_Date_Medical__c'];
            }            
        }
        if(MAData['Copy_Dental_sec3_Data_from_Med__c']){
            if(this.emptyCheck(MAData['Finalist_Date_Detail_Medical__c'])){
                MAData['Finalist_Date_Detail_Dental__c'] = MAData['Finalist_Date_Detail_Medical__c'];
            }                
            if(this.emptyCheck(MAData['Finalist_Date_Medical__c'])){
                MAData['Finalist_Date_Dental__c'] = MAData['Finalist_Date_Medical__c'];
            }                           
        }
        if(MAData['Copy_Pharmacy_sec1_Data_from_Med__c']){
            if(this.emptyCheck(MAData['Risk_Probability_Medical__c'])){
                MAData['Risk_Probability_Pharmacy__c'] = MAData['Risk_Probability_Medical__c'];
            }                
            if(this.emptyCheck(MAData['Anticipated_Actual_Close_Date_Medical__c'])){
                MAData['Anticipated_Actual_Close_Date_Pharmacy__c'] = MAData['Anticipated_Actual_Close_Date_Medical__c'];
            }            
        }
        if(MAData['Copy_Pharmacy_sec2_Data_from_Med__c']){
            if(this.emptyCheck(MAData['Proposal_Received_Date_Medical__c'])){
                MAData['Proposal_Received_Date_Pharmacy__c'] = MAData['Proposal_Received_Date_Medical__c'];
            }                                
            if(this.emptyCheck(MAData['Proposal_Due_Date_Medical__c'])){
                MAData['Proposal_Due_Date_Pharmacy__c'] = MAData['Proposal_Due_Date_Medical__c'];
            }            
        }
        if(MAData['Copy_Pharmacy_sec3_Data_from_Med__c']){                
            if(this.emptyCheck(MAData['Finalist_Date_Detail_Medical__c'])){
                MAData['Finalist_Date_Detail_Pharmacy__c'] = MAData['Finalist_Date_Detail_Medical__c'];
            }                
            if(this.emptyCheck(MAData['Finalist_Date_Medical__c'])){
                MAData['Finalist_Date_Pharmacy__c'] = MAData['Finalist_Date_Medical__c'];
            }           
        }
    },*/
    isValidDate:function(component, event,date){
        var valDate = date;
        var returnValue = false;
        if(valDate == null || valDate == undefined || valDate == ''){
            return true;
        }
        var valDateArray = valDate.split('-');
        if(valDateArray.length ==3){
            var month = '';
            if(valDateArray[1] < 10 && !valDateArray[1].startsWith('0')){
                month = '0'+valDateArray[1];
            }
            var day = '';
            if(valDateArray[2] < 10 && !valDateArray[2].startsWith('0')){
                day = '0'+valDateArray[2];
                if(month==""){
                    valDate = valDateArray[0]+'-'+valDateArray[1]+'-'+day;
                }
                else{
                    valDate = valDateArray[0]+'-'+month+'-'+day;
                }
                
            }else{
                if(month==""){
                    valDate = valDateArray[0]+'-'+valDateArray[1]+'-'+valDateArray[2];   
                }
                if(month!=""){
                    valDate = valDateArray[0]+'-'+month+'-'+valDateArray[2];   
                }
                
            }
            
        }
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!valDate.match(regEx)){
            returnValue = false;
        }
        else{
            var d = new Date(valDate);
            returnValue = true;
        }        
        return returnValue;
    },
    buildError:function(component,event,errorObj){
        var spinner = component.find("mySpinner");     
        var errrorArray = [];
        if(errorObj != undefined && errorObj != null){
            for(var i=0; i<errorObj.length; i++){
                errrorArray.push({                         
                    "Error_Message" : errorObj[i].FieldErrorMsg,                        
                    "Field_Label" : errorObj[i].FieldLabel,                        
                    "ITag"  : errorObj[i].FieldItag,                        
                });                     
            } 
            component.set('v.ErrorList',errrorArray);                
            this.SetOrClearInitalValue(component, event,true);               
            $A.util.removeClass(component.find("error_Msg"),'hideEl');                
            $A.util.removeClass(component.find("error_Popup"),'hide');                
            $A.util.removeClass(component.find("editBtn"),'slds-hide');                
            $A.util.addClass(spinner, "slds-hide");                
            var MA_Product_Category_Details_Id = component.find('MA_Product_Category_Details_Id');                
            MA_Product_Category_Details_Id.focusOnErrorField('','','',component.get('v.ErrorList'));                
            console.log('Problem saving record, error: ' + JSON.stringify(errorObj));
        }else{
            $A.util.addClass(component.find("error_Msg"),'hideEl');                
            $A.util.addClass(component.find("error_Popup"),'hide'); 
        }
    },
    emptyCheck : function(value) {       
        if(value == null || value == '' || value == undefined){
            return false;
        }
        return true;
    }
})