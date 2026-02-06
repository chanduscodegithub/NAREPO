/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 03-18-2024
 * @last modified by  : Spoorthy
**/
({
    getCustomMetaData : function(component){
        var action = component.get('c.getMetadata');
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                component.set('v.client_Ref_dropDownVals', response.getReturnValue().fieldLabels);
                component.set('v.metaData', response.getReturnValue());
                component.set('v.isSpinnertoLoad', false);
            }
        });
        $A.enqueueAction(action);
    },
    
    convertArrayOfObjectsToCSV : function(component, objectRecords){
        var csvStringResult, counter, keys, columnDivider, lineDivider;
        
        if (objectRecords == null || !objectRecords.length) {
            return null;
        }
        columnDivider = ',';
        lineDivider =  '\n';
        
        keys = ['Name','Client_Reference_Status_Comments__c',
                'Client_Reference_Status__c',
                'Client_Ref_Products_Programs__c',
                'Health_Plan_Manager_Industry__c','ParticipatingUSMembers__c',
                'Original_Effective_Date__c','CM_SCE__r.Name',
				'UHC_Medical_Members__c','Surest_Members__c','UHC_Dental_Members__c','UHC_Vision_Members__c',
                'BillingStateCode','CVGAccount__r.Name',
                'Call_Site__c','Claim_Site__c',
                'Clinical_Site__c','TopMarket1__c',
                'TopMarket2__c','TopMarket3__c',
                'TopMarket4__c','TopMarket5__c',
                'UMR_Client__c','Private_Exchange_Client__c',
                'Leased_Specialized_Network__c','Premium_Tiering__c',
                'POS_Tiering__c','Cancellation_Date__c',
                'Reason_for_Term_Comments__c','ReasonforTermMedical__c',
                'ReasonforTermPharmacy__c','ReasonforTermDental__c',
                'ReasonforTermVision__c','ReasonforTermOtherBuyUp__c'];
        
        var columnHeaders = ['Company Name','Client Reference Status Comments','Reference Status',
                             'Referenceable Products and Programs',
                             'Health Plan Manager Industry','Participating US Members',
                             'Original Effective Date','Assigned SCE',
                             'UHC Total Medical Members','Surest Members','UHC Dental Members','UHC Vision Members',
                             'HQ State','Aggregator Group','Call Site','Claim Site',
                             'Clinical Site','Top Markets 1','Top Markets 2',
                             'Top Markets 3','Top Markets 4',
                             'Top Markets 5','UMR Client',
                             'Private Exchange Client','Leased / Specialized Network',
                             'Premium Tiering','POS Tiering',
                             'Termination Date','Reason for Term (Medical)',
                             'Reason for Term (Pharmacy)','Reason for Term (Dental)',
                             'Reason for Term (Vision)','Reason for Term (Other Buy Up)'];
        
        csvStringResult = '';
        csvStringResult += columnHeaders.join(columnDivider);
        csvStringResult += lineDivider;
        
        for(var i=0; i < objectRecords.length; i++){
            counter = 0;
            
            for(var sTempkey in keys) {
                var skey = keys[sTempkey] ;  
                
                if(counter > 0){ 
                    csvStringResult += columnDivider; 
                }   
                if(objectRecords[i][skey] == undefined){
                    objectRecords[i][skey] = '';
                }
                if((skey === 'CM_SCE__r.Name') && (objectRecords[i]['CM_SCE__r'] != null)){
                    csvStringResult += '"'+ objectRecords[i]['CM_SCE__r'].Name+'"'; 
                }else if((skey === 'CVGAccount__r.Name') && (objectRecords[i]['CVGAccount__r'] != null)){
                    csvStringResult += '"'+ objectRecords[i]['CVGAccount__r'].Name+'"'; 
                }
                    else{
                        csvStringResult += '"'+ objectRecords[i][skey]+'"';     
                    }
                
                counter++;
                
            } 
            csvStringResult += lineDivider;
        }
        
        return csvStringResult;        
    },
    
    beforeSearchingLogic : function(component, event){
        component.set('v.isFirstConditionPresent', false);
        component.set('v.filterQueries', []);
        var mapFields = component.get('v.filterQueries');
        var customRadioBtn = component.find('customRadio');
        var customLogicTxt = component.find('customLogic');
        var customLogicTxt1 = component.find('customLogic1');
        var customRdSelected = false;
        var customLogicVal = '';
        
        for(var i in customRadioBtn){
            if(customRadioBtn[i].get('v.value') == true){
                customRdSelected = true;
            }
        }
        
        if(customRdSelected){
            if(customLogicTxt.get('v.value') != undefined){
                customLogicVal = customLogicTxt.get('v.value');
            }else if(customLogicTxt1.get('v.value') != undefined){
                customLogicVal = customLogicTxt1.get('v.value');
            }
            //if(component.find('customLogic').get('v.value') != undefined){
            if(customLogicVal.length > 0){
                if(customLogicVal.indexOf('1') > -1){
                    var exp = customLogicVal;
                    
                    if(exp.indexOf('(') > -1 || exp.indexOf(')') > -1){
                        if(exp.indexOf('(') > -1 && exp.indexOf(')') > -1){
                            if(exp.match(/\(/gi).length == exp.match(/\)/gi).length){
                                this.buildQueryExp(component, event, exp, mapFields);
                            }else{
                                this.errorMsgBox(component, 'Extra open/ closed paranthesis in custom logic.');
                            }
                        }else{
                            this.errorMsgBox(component, 'Extra open/ closed paranthesis in custom logic.');
                        }
                    }else{
                        this.buildQueryExp(component, event, exp, mapFields);
                    }
                }else{
                    var errorDailog = component.find('FilterSearch');
                    for(var i in errorDailog){
                        $A.util.removeClass(errorDailog[i], 'slds-hide');
                        $A.util.addClass(errorDailog[i], 'slds-show');
                    }
                }
            }else{
                this.errorMsgBox(component, 'Custom Logic is Empty');
            }
            /*}else{
                this.errorMsgBox(component, 'Custom Logic is Empty');
            }*/
            
        }
        else{
            if(component.find('input1') === undefined || component.find('input1') === null){
                component.set('v.isFirstConditionPresent', true);
                
                var fieldToFilter1 = component.find('row1field').get('v.value');
                var conditionToFilter1 = component.find('rowcondition1').get('v.value');
                if(fieldToFilter1 !== undefined && fieldToFilter1 !=''){
                    mapFields.push({'fieldAPIName' : component.get('v.metaData').mapOfMetaData[fieldToFilter1][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter1][1],
                                    'fieldConditions' : conditionToFilter1+'#'+''});  
                }
            }
            else{
                var fieldToFilter1 = component.find('row1field').get('v.value');
                var conditionToFilter1 = component.find('rowcondition1').get('v.value');
                if(fieldToFilter1 !== undefined && fieldToFilter1 !=''){
                    if(Array.isArray(component.find('input1'))){
                        if(component.find('input1')[0].get('v.value') != undefined && component.find('input1')[0].get('v.value') !==''){
                            component.set('v.isFirstConditionPresent', true);
                            var filterValues1 = component.find('input1')[0].get('v.value') ;
                            
                            mapFields.push({'fieldAPIName' : component.get('v.metaData').mapOfMetaData[fieldToFilter1][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter1][1], 
                                            'fieldConditions' : conditionToFilter1+'#'+filterValues1});     
                            
                        }
                    }else{
                        if(component.find('input1').get('v.value').length > 0){
                            component.set('v.isFirstConditionPresent', true);
                            var filterValues1 = component.find('input1').get('v.value') ;
                            if(fieldToFilter1 !== undefined && fieldToFilter1 !=''){
                                mapFields.push({'fieldAPIName' : component.get('v.metaData').mapOfMetaData[fieldToFilter1][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter1][1], 
                                                'fieldConditions' : conditionToFilter1+'#'+filterValues1}); 
                            }
                        }
                    }
                }
            }
            
            if(component.get('v.isFirstConditionPresent')){
                
                if(component.find('row2field').get('v.value') != undefined){
                    if(component.find('input2') === undefined || component.find('input2') === null){
                        
                        var fieldToFilter2 = component.find('row2field').get('v.value');
                        var conditionToFilter2 = component.find('rowcondition2').get('v.value');
                        if(fieldToFilter2 !== undefined && fieldToFilter2 !=''){
                            mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter2][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter2][1], 
                                            fieldConditions : conditionToFilter2+'#'+''});
                        }
                    }
                    else{
                        var fieldToFilter2 = component.find('row2field').get('v.value');
                        var conditionToFilter2 = component.find('rowcondition2').get('v.value');
                        if(fieldToFilter2 !== undefined && fieldToFilter2 !=''){
                            if(Array.isArray(component.find('input2'))){
                                if(component.find('input2')[0].get('v.value') != undefined && component.find('input2')[0].get('v.value') !== "" ){
                                    var filterValues2 = component.find('input2')[0].get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter2][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter2][1], 
                                                    fieldConditions : conditionToFilter2+'#'+filterValues2});
                                }
                            }else{
                                if(component.find('input2').get('v.value').length > 0){
                                    var filterValues2 = component.find('input2').get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter2][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter2][1],
                                                    fieldConditions : conditionToFilter2+'#'+filterValues2});
                                }
                            }   
                        }
                    }
                }
                
                if(component.find('row3field').get('v.value') != undefined){
                    if(component.find('input3') === undefined || component.find('input3') === null){
                        
                        var fieldToFilter3 = component.find('row3field').get('v.value');
                        var conditionToFilter3 = component.find('rowcondition3').get('v.value');
                        if(fieldToFilter3 !== undefined && fieldToFilter3 !=''){
                            mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter3][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter3][1],
                                            fieldConditions : conditionToFilter3+'#'+''});
                        }
                    }
                    else{
                        var fieldToFilter3 = component.find('row3field').get('v.value');
                        var conditionToFilter3 = component.find('rowcondition3').get('v.value');
                        if(fieldToFilter3 !== undefined && fieldToFilter3 !=''){
                            if(Array.isArray(component.find('input3'))){
                                if(component.find('input3')[0].get('v.value') != undefined && component.find('input3')[0].get('v.value') !== "" ){
                                    var filterValues3 = component.find('input3')[0].get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter3][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter3][1], 
                                                    fieldConditions : conditionToFilter3+'#'+filterValues3});
                                }
                            }else{
                                if(component.find('input3').get('v.value').length > 0){
                                    var filterValues3 = component.find('input3').get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter3][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter3][1], 
                                                    fieldConditions : conditionToFilter3+'#'+filterValues3});
                                }
                            }
                        }
                    }
                }
                
                if(component.find('row4field').get('v.value') != undefined){
                    if(component.find('input4') === undefined || component.find('input4') === null){
                        
                        var fieldToFilter4 = component.find('row4field').get('v.value');
                        var conditionToFilter4 = component.find('rowcondition4').get('v.value');
                        if(fieldToFilter4 !== undefined && fieldToFilter4 !=''){
                            mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter4][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter4][1], 
                                            fieldConditions : conditionToFilter4+'#'+''}); 
                        }
                    }
                    else{
                        var fieldToFilter4 = component.find('row4field').get('v.value');
                        var conditionToFilter4 = component.find('rowcondition4').get('v.value');
                        if(fieldToFilter4 !== undefined && fieldToFilter4 !=''){
                            if(Array.isArray(component.find('input4'))){
                                if(component.find('input4')[0].get('v.value') != undefined && component.find('input4')[0].get('v.value') !== "" ){
                                    var filterValues4 = component.find('input4')[0].get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter4][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter4][1], 
                                                    fieldConditions : conditionToFilter4+'#'+filterValues4});
                                }
                            }else{
                                if(component.find('input4').get('v.value').length > 0){
                                    var filterValues4 = component.find('input4').get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter4][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter4][1],
                                                    fieldConditions : conditionToFilter4+'#'+filterValues4});
                                }
                            }
                        }
                    }
                }
                
                if(component.find('row5field').get('v.value') != undefined){
                    if(component.find('input5') === undefined || component.find('input5') === null){
                        
                        var fieldToFilter5 = component.find('row5field').get('v.value');
                        var conditionToFilter5 = component.find('rowcondition5').get('v.value');
                        if(fieldToFilter5 !== undefined && fieldToFilter5 !=''){
                            mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter5][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter5][1],
                                            fieldConditions : conditionToFilter5+'#'+''}); 
                        }
                    }
                    else{
                        var fieldToFilter5 = component.find('row5field').get('v.value');
                        var conditionToFilter5 = component.find('rowcondition5').get('v.value');
                        if(fieldToFilter5 !== undefined && fieldToFilter5 !=''){
                            if(Array.isArray(component.find('input5'))){
                                if(component.find('input5')[0].get('v.value') != undefined && component.find('input5')[0].get('v.value') !== "" ){
                                    var filterValues5 = component.find('input5')[0].get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter5][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter5][1],
                                                    fieldConditions : conditionToFilter5+'#'+filterValues5});
                                }
                            }else{
                                if(component.find('input5').get('v.value').length > 0){
                                    var filterValues5 = component.find('input5').get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter5][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter5][1], 
                                                    fieldConditions : conditionToFilter5+'#'+filterValues5});
                                }
                                
                            }
                        }
                    }
                }
                
                if(component.find('row6field').get('v.value') != undefined){
                    if(component.find('input6') === undefined || component.find('input6') === null){
                        
                        var fieldToFilter6 = component.find('row6field').get('v.value');
                        var conditionToFilter6 = component.find('rowcondition6').get('v.value');
                        if(fieldToFilter6 !== undefined && fieldToFilter6 !=''){
                            mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter6][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter6][1],
                                            fieldConditions : conditionToFilter6+'#'+''}); 
                        }
                    }
                    else{
                        var fieldToFilter6 = component.find('row6field').get('v.value');
                        var conditionToFilter6 = component.find('rowcondition6').get('v.value');
                        if(fieldToFilter6 !== undefined && fieldToFilter6 !=''){
                            if(Array.isArray(component.find('input6'))){
                                if(component.find('input6')[0].get('v.value') != undefined && component.find('input6')[0].get('v.value') !== "" ){
                                    var filterValues6 = component.find('input6')[0].get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter6][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter6][1], 
                                                    fieldConditions : conditionToFilter6+'#'+filterValues6});
                                }
                            }else{
                                if(component.find('input6').get('v.value').length > 0){
                                    var filterValues6 = component.find('input6').get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter6][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter6][1],
                                                    fieldConditions : conditionToFilter6+'#'+filterValues6});
                                }
                            } 
                        }
                    }
                }
                
                if(component.find('row7field').get('v.value') != undefined){
                    if(component.find('input7') === undefined || component.find('input7') === null){
                        
                        var fieldToFilter7 = component.find('row7field').get('v.value');
                        var conditionToFilter7 = component.find('rowcondition7').get('v.value');
                        if(fieldToFilter7 !== undefined && fieldToFilter7 !=''){
                            mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter7][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter7][1],
                                            fieldConditions : conditionToFilter7+'#'+''});
                        }
                        
                    }
                    else{
                        var fieldToFilter7 = component.find('row7field').get('v.value');
                        var conditionToFilter7 = component.find('rowcondition7').get('v.value');
                        if(fieldToFilter7 !== undefined && fieldToFilter7 !=''){
                            if(Array.isArray(component.find('input7'))){
                                if(component.find('input7')[0].get('v.value') != undefined && component.find('input7')[0].get('v.value') !== "" ){
                                    var filterValues7 = component.find('input7')[0].get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter7][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter7][1],
                                                    fieldConditions : conditionToFilter7+'#'+filterValues7});
                                }
                            }else{
                                if(component.find('input7').get('v.value').length > 0){
                                    var filterValues7 = component.find('input7').get('v.value') ;
                                    
                                    mapFields.push({fieldAPIName : component.get('v.metaData').mapOfMetaData[fieldToFilter7][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter7][1],
                                                    fieldConditions : conditionToFilter7+'#'+filterValues7});
                                }
                            }
                        }
                    }
                }
                
                component.set('v.isSearchBtnClicked', true);
                component.set('v.filterQueries', mapFields);
                this.searchForRefAcc(component, event);
            }
            else{
                this.errorMsgBox(component, 'First Filter condition is mandatory.');
            }
        }
    },
    
    searchForRefAcc : function(component, event, page){
        var exp = component.get('v.finalQueryExp');
        if(exp == undefined){
            exp = '';
        }
        component.set('v.isSpinnertoLoad', true);
        page = page || 1;
        
        var globalLiteral = '';
        var totalCmps = 2;
        
        for(var i = 0; i < totalCmps; i++){
            if(component.find('orRadio')[i].get('v.value') === true){
                globalLiteral = ' OR ';
            }else if(component.find('andRadio')[i].get('v.value') === true){
                globalLiteral = ' AND ';
            }else if(component.find('customRadio')[i].get('v.value') === true){
                globalLiteral = '';
            }   
        }
        
        var action = '';
        
        if(exp.length > 0){
            action = component.get("c.searchForAccountsByCustomLogic");
            action.setParams({
                "filterMap" : JSON.stringify(component.get('v.filterQueries')),
                "maID" : component.get('v.optyId'),
                "pageNumber" : page,
                "finalExp" : exp
            });
        }else{
            action = component.get("c.searchForRefAccounts");
            action.setParams({
                "mapFields" : JSON.stringify(component.get('v.filterQueries')),
                "globalLiteral" : globalLiteral,
                "maID" : component.get('v.optyId'),
                "pageNumber" : page
            });
        }
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                
                var responseObj = response.getReturnValue();
                
                if(responseObj.refsearchedAccount != null && responseObj.refsearchedAccount.length > 0){
                    component.set('v.isSearchedResultEmpty', false);
                    component.set("v.accountSearchList", responseObj.refsearchedAccount);
                    component.set('v.allAccountListToDownload', responseObj.allAccountList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    component.set("v.searchedQuery", responseObj.searchedQuery);
                    var searchSectionDiv = component.find('searchSection');
                    $A.util.removeClass(searchSectionDiv, 'slds-is-open');
                    component.set('v.expandCollapseIcon', true);
                }else{
                    component.set('v.isSearchedResultEmpty', true);
                    component.set("v.searchedQuery", responseObj.searchedQuery);
                    var searchSectionDiv = component.find('searchSection');
                    $A.util.addClass(searchSectionDiv, 'slds-is-open');
                    component.set('v.expandCollapseIcon', false);
                }
                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") {  
                component.set('v.isSpinnertoLoad', false);
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
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        $A.enqueueAction(action);
    },
    
    errorMsgBox: function(component, msg, invalidWords){
        var errorDailog = component.find('CustomLogicError');
        if(invalidWords != undefined){
            component.set('v.customLogicErrorMsg', msg+ invalidWords);
        }else{
            component.set('v.customLogicErrorMsg', msg);   
        }
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-hide');
            $A.util.addClass(errorDailog[i], 'slds-show');
        }
    },
    
    handleShowNotice : function(component, event) {
        component.find('notifLib').showNotice({
            "variant": "error",
            "header": "Error",
            "message": component.get('v.customErrorMsg'),
            closeCallback: function() {
                
            }
        });
    },
    
    noDataInCustomLogicField : function(component, i){
        var errorDailog = component.find('CustomLogicError');
        component.set('v.customLogicErrorMsg', 'No Value selected for mentioned field #'+i+' in Custom Logic!');
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-hide');
            $A.util.addClass(errorDailog[i], 'slds-show');
        }
    },
    
    buildQueryExp : function(component, event, exp, mapFields){
        var inputIndices = ['1','2','3','4','5','6','7'];
        var allowedStr = ['AND','OR'];
        
        var filterInputIndices = exp.replace(/[^0-9]/gi, '').split('');
        var invalidFilterIndices = [];
        
        for(var i in filterInputIndices){
            if(inputIndices.indexOf(filterInputIndices[i]) == -1){
                filterInputIndices.splice(i, 1);
                invalidFilterIndices.push(filterInputIndices[i]);
            }
        }
        
        var pattern = /\b[a-z]*\b/ig;
        var filterWords = exp.match(pattern);
        var invalidWords = [];
        var logicalOper = [];
        
        for(var i = 0; i < filterWords.length; i++){
            if(filterWords[i].length != 0){
                logicalOper.push(filterWords[i].toUpperCase());
            }
        }
        
        for(var i = 0; i < logicalOper.length; i++){
            if(allowedStr.indexOf(logicalOper[i]) == -1){
                invalidWords.push(logicalOper[i]);
            }
        }
        
        if(invalidFilterIndices.length > 0){
            //component.set('v.customErrorMsg', 'Filter conditions are upto 7 fields only. Please correct the Custom Logic Expression.');
            //this.handleShowNotice(component, event);
            this.errorMsgBox(component, 'Filter conditions are upto 7 fields only. Please correct the Custom Logic Expression.');
        }else if(invalidWords.length > 0){
            this.errorMsgBox(component, 'Invalid word in expression: ', invalidWords);
        }else if((exp.indexOf('()') > -1) || (exp.indexOf(')(') > -1)){
            this.errorMsgBox(component, '()/ )( are not allowed in Custom Logic.');
        }else{
            if(component.find('input1') === undefined || component.find('input1') === null){
                component.set('v.isFirstConditionPresent', true);
                this.collectingValidFilterVals(component, event, filterInputIndices, mapFields, exp);
            }else{
                if(Array.isArray(component.find('input1'))){
                    if(component.find('input1')[0].get('v.value') != undefined){
                        if(component.find('input1')[0].get('v.value').length > 0){
                            component.set('v.isFirstConditionPresent', true);
                            this.collectingValidFilterVals(component, event, filterInputIndices, mapFields, exp);
                        }else{
                            this.errorMsgBox(component, 'First Filter condition is mandatory.');
                        }
                    }else{
                        this.errorMsgBox(component, 'First Filter condition is mandatory.');
                    }
                }else{
                    if(component.find('input1').get('v.value').length > 0){
                        this.collectingValidFilterVals(component, event, filterInputIndices, mapFields, exp);
                    }else{
                        this.errorMsgBox(component, 'First Filter condition is mandatory.');
                    }
                }
            }
        }
    },
    
    collectingValidFilterVals : function(component, event, filterInputIndices, mapFields, exp){
        console.log('Final Expression-->>'+exp);
        component.set('v.inValidFieldInCustomLogic', false);
        for(var i = 0; i < filterInputIndices.length; i++){
            var inputFilterIndex = 'input'+filterInputIndices[i];
            var rowIndexField = 'row'+filterInputIndices[i]+'field';
            var rowConditionIndex = 'rowcondition'+filterInputIndices[i];
            
            if(component.find(inputFilterIndex) === undefined || component.find(inputFilterIndex) === null){
                
                var fieldToFilter = component.find(rowIndexField).get('v.value');
                if(fieldToFilter == undefined || fieldToFilter =="" || fieldToFilter ==null){
                    component.set('v.inValidFieldInCustomLogic', true);
                    break;
                }else{
                    var conditionToFilter = component.find(rowConditionIndex).get('v.value');
                    mapFields.push({'fieldAPIName' : component.get('v.metaData').mapOfMetaData[fieldToFilter][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter][1],
                                    'fieldConditions' : conditionToFilter+'#'+''});    
                }
            }
            else{
                var fieldToFilter = component.find(rowIndexField).get('v.value');
                if(fieldToFilter == undefined || fieldToFilter =="" || fieldToFilter ==null){
                    component.set('v.inValidFieldInCustomLogic', true);
                    break;
                }else{
                    var conditionToFilter = component.find(rowConditionIndex).get('v.value');
                    if(Array.isArray(component.find(inputFilterIndex))){
                        if(component.find(inputFilterIndex)[0].get('v.value') != undefined){
                            if(component.find(inputFilterIndex)[0].get('v.value').length > 0 || typeof(component.find(inputFilterIndex)[0].get('v.value')) =='number'){
                                var filterValues = component.find(inputFilterIndex)[0].get('v.value');
                                
                                mapFields.push({'fieldAPIName' : component.get('v.metaData').mapOfMetaData[fieldToFilter][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter][1],
                                                'fieldConditions' : conditionToFilter+'#'+filterValues});     
                            }else{
                                component.set('v.inValidFieldInCustomLogic', true);
                                break;
                            }
                        }else{
                            component.set('v.inValidFieldInCustomLogic', true);
                            break;
                        }
                    }else{
                        if(component.find(inputFilterIndex).get('v.value').length > 0  || typeof(component.find(inputFilterIndex).get('v.value')) =='number'){
                            component.set('v.isFirstConditionPresent', true);
                            var filterValues = component.find(inputFilterIndex).get('v.value');
                            
                            mapFields.push({'fieldAPIName' : component.get('v.metaData').mapOfMetaData[fieldToFilter][2]+'#'+component.get('v.metaData').mapOfMetaData[fieldToFilter][1],
                                            'fieldConditions' : conditionToFilter+'#'+filterValues}); 
                        }else{
                            component.set('v.inValidFieldInCustomLogic', true);
                            break;
                        }
                    }
                }
            }   
        }
        
        if(component.get('v.inValidFieldInCustomLogic')){
            this.noDataInCustomLogicField(component, filterInputIndices[i]);
        }else{
            component.set('v.finalQueryExp', exp);
            component.set('v.isSearchBtnClicked', true);
            component.set('v.filterQueries', mapFields);
            this.searchForRefAcc(component, event);
        }
    },
    
    desktopModal : function(component, event, header, cmp) {
        
        var conditionJsonObj = {"search1":"row1field@input1",
                                "search2":"row2field@input2",
                                "search3":"row3field@input3",
                                "search4":"row4field@input4",
                                "search5":"row5field@input5",
                                "search6":"row6field@input6",
                                "search7":"row7field@input7"};
        
        var selectedItem = event.currentTarget;
        var selectedFieldAuraId = selectedItem.dataset.record;
        
        var selectedDropDown = conditionJsonObj[selectedFieldAuraId].split('@');
        var val = component.find(selectedDropDown[0]).get('v.value');
        var inputBoxValue = component.get('v.selectedInputBoxContents');
        var inputVar = component.find(selectedDropDown[1]);
        
        if(inputVar != undefined){
            if(Array.isArray(inputVar)){
                if(inputVar[0].get('v.value') != undefined){
                    inputBoxValue = inputVar[0].get('v.value');    
                }
            }else{
                if(inputVar.get('v.value') != undefined){
                    inputBoxValue = inputVar.get('v.value');    
                }
            }   
        }
        
        component.set('v.selectedInputBoxContents', inputBoxValue);
        
        header = header+val;
        var apiName = component.get('v.metaData').mapOfMetaData[val][2];
        if(val === 'Business Line'){
            apiName = '1'+component.get('v.accountSubTypeNames');
        }
        
        component.set('v.selectedInputBox',selectedDropDown[1]);
        var childData = {};
        childData = {'apiName' : apiName,
                     'dataToDisplay' : component.get('v.accountSubTypeNames'),
                     'inputBoxValue' : inputBoxValue};
        
        $A.createComponents([["c:Modal_Component_Small",{attribute:true, 'ModalBodyData':childData, 'Modalheader':header,'ModalBody':cmp}]],
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
    
    panelModal : function(component, event,header,cmp) {
        
        component.set("v.scrollStyleForDevice","");
        
        var conditionJsonObj = {"search1":"row1field@input1",
                                "search2":"row2field@input2",
                                "search3":"row3field@input3",
                                "search4":"row4field@input4",
                                "search5":"row5field@input5",
                                "search6":"row6field@input6",
                                "search7":"row7field@input7"};
        
        var selectedItem = event.currentTarget;
        var selectedFieldAuraId = selectedItem.dataset.record;
        
        var selectedDropDown = conditionJsonObj[selectedFieldAuraId].split('@');
        
        var val = component.find(selectedDropDown[0]).get('v.value');
        header = header+val;
        var apiName = component.get('v.metaData').mapOfMetaData[val][2];
        if(val === 'Business Line'){
            apiName = '1'+component.get('v.accountSubTypeNames');
        }
        
        component.set('v.selectedInputBox',selectedDropDown[1]);
        var childData = {};
        childData = {'apiName' : apiName, 'dataToDisplay' : component.get('v.accountSubTypeNames')};
        
        $A.createComponents([["c:Panel_Component",{attribute:true, 'ModalBodyData':childData,'Modalheader':header,'ModalBody':cmp}]],
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
    
    modalClosing : function(component, event) {
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        }else{
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []); 
            $A.util.removeClass(component.find("sortEdit"),"hide");
        }
    },
    
})