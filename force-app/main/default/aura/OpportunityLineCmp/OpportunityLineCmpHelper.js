({
    getOpportunityDataHelper : function(component, event, helper) {
        var spinner = component.find("loadingSpinner");
        var action = component.get("c.getOppProductLineItemData");
        action.setParams({ recordId : component.get("v.recordId")});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var idList={};
                var salesPerson1 = [];
                component.set('v.enableAllCheckBox',false);
                var responseData = response.getReturnValue();
                component.set('v.OppData',responseData.QueryOppList);
                var oppLineList = responseData.QueryOppList;
                component.set('v.SalesPersonPercentageValues',responseData.pckLstMap.Sales_Person_1_split_percentage__c);
                component.set('v.SalesPerson2PercentageValues',responseData.pckLstMap.Sales_Person_2_split_percentage__c);
                component.set('v.SalesIncentive',responseData.pckLstMap.Will_Sales_Incentive_be_split__c);
                component.set('v.UnderwriterData',responseData.QueryUnderWriters);
                component.set('v.timeZone',responseData.timeZone);
                
                if (responseData.isLoggedInUserRoleToBeEnabled == false){
                    component.set('v.hideMAcomponent', true);
                } else if(responseData.isLoggedInUserRoleToBeEnabled == true) {
                    if(responseData.readOnly == true){
                        component.set('v.disableEdit',true);
                    } else {
                        component.set('v.disableEdit',false);
                    }                    
                }
                
                var tempProductList = oppLineList;
                var emptyDateProductList = tempProductList.filter(element => 
                                                                  !element.hasOwnProperty('Date_Submitted_for_Incentives__c')
                                                                  //element.Date_Submitted_for_Incentives__c == ''
                                                                 );
                
                var hasDateProductList = tempProductList.filter(element => 
                                                                element.hasOwnProperty('Date_Submitted_for_Incentives__c')
                                                                //element.Date_Submitted_for_Incentives__c == ''
                                                               );
                
                if(emptyDateProductList.length == oppLineList.length){
                    
                    /*   var otherRemainingList = tempProductList.filter(element => 
                                                                element.Product_Line__c != 'Other'
                                                              );
                       
                	var specificProductList = tempProductList.filter(element => 
                                                                 element.Product2.Family == 'Specialty Products' && element.Product_Line__c == 'Other'
                                                                );
                	var otherProductList =  tempProductList.filter(element => 
                                                               element.Product2.Family != 'Specialty Products' && element.Product_Line__c == 'Other'
                                                              );
                    emptyDateProductList = [];
                    emptyDateProductList.push(otherRemainingList);
                    emptyDateProductList.push(specificProductList);
                    emptyDateProductList.push(otherProductList);
                    //oppLineList = emptyDateProductList; */
                    
                    
                    /*Empty Records sorting starts*/
                    
                    var nonOtherBuyProductList = tempProductList.filter(element => 
                                                                        element.Product2.Family != 'Specialty Products' && element.Product_Line__c != 'Other' && !element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                       );
                    
                    var specificProductList = tempProductList.filter(element => 
                                                                     element.Product2.Family == 'Specialty Products' && element.Product_Line__c == 'Other' && !element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                    );
                    var otherProductList =  tempProductList.filter(element => 
                                                                   element.Product2.Family != 'Specialty Products' && element.Product_Line__c == 'Other' &&   !element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                  );
                    
                    /*  var sortedProductList = [];
                    sortedProductList = helper.orderSortedList(sortedProductList,nonOtherBuyProductList);
                    sortedProductList = helper.orderSortedList(sortedProductList,specificProductList);
                    sortedProductList = helper.orderSortedList(sortedProductList,otherProductList); */
                    
                    var MedicalList = helper.sortEmptyRecordsFiterByProductType(tempProductList,'Medical');
                    var PharmacyList = helper.sortEmptyRecordsFiterByProductType(tempProductList,'Pharmacy');
                    var DentalList = helper.sortEmptyRecordsFiterByProductType(tempProductList,'Dental');
                    var VisionList = helper.sortEmptyRecordsFiterByProductType(tempProductList,'Vision');
                    
                    
                    var sortedProductList = [];
                    
                    //sortedProductList = helper.orderSortedList(sortedProductList,emptyDateProductList);
                    sortedProductList = helper.orderSortedList(sortedProductList,MedicalList);
                    sortedProductList = helper.orderSortedList(sortedProductList,PharmacyList);
                    sortedProductList = helper.orderSortedList(sortedProductList,DentalList);
                    sortedProductList = helper.orderSortedList(sortedProductList,VisionList);
                    //sortedProductList = helper.orderSortedList(sortedProductList,nonOtherBuyProductList);
                    sortedProductList = helper.orderSortedList(sortedProductList,specificProductList);
                    sortedProductList = helper.orderSortedList(sortedProductList,otherProductList); 
                    
                    oppLineList = sortedProductList;
                    
                    
                    
                } else if(hasDateProductList.length == oppLineList.length) {
                    
                    var specificProductList = tempProductList.filter(element => 
                                                                     element.Product2.Family == 'Specialty Products' && element.Product_Line__c == 'Other' && element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                    );
                    var otherProductList =  tempProductList.filter(element => 
                                                                   element.Product2.Family != 'Specialty Products' && element.Product_Line__c == 'Other' && element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                  );
                    
                    var MedicalList = helper.sortFiterByProductType(tempProductList,'Medical');
                    var PharmacyList = helper.sortFiterByProductType(tempProductList,'Pharmacy');
                    var DentalList = helper.sortFiterByProductType(tempProductList,'Dental');
                    var VisionList = helper.sortFiterByProductType(tempProductList,'Vision');
                    
                    
                    var sortedProductList = [];
                    
                    sortedProductList = helper.orderSortedList(sortedProductList,emptyDateProductList);
                    sortedProductList = helper.orderSortedList(sortedProductList,MedicalList);
                    sortedProductList = helper.orderSortedList(sortedProductList,PharmacyList);
                    sortedProductList = helper.orderSortedList(sortedProductList,DentalList);
                    sortedProductList = helper.orderSortedList(sortedProductList,VisionList);
                    sortedProductList = helper.orderSortedList(sortedProductList,specificProductList);
                    sortedProductList = helper.orderSortedList(sortedProductList,otherProductList);
                    
                    oppLineList = sortedProductList;  
                    
                    
                }else{
                    var sortNonEmptyRecords = [];
                    var sortEmptyRecords = [];
                    var sortedProductList = [];
                    if(oppLineList.length > 0){
                        /* for( var i =0 ; i< oppLineList.length; i++){
                           if(oppLineList[i].hasOwnProperty('Date_Submitted_for_Incentives__c')){
                                sortNonEmptyRecords[i] = oppLineList[i];
                                sortedProductList = helper.orderSortedList(sortedProductList,sortNonEmptyRecords);
                            } else {
                                sortEmptyRecords[i] = oppLineList[i];
                                sortedProductList = helper.orderSortedList(sortedProductList,sortEmptyRecords);
                            } 
                        }*/
                        //oppLineList = sortedProductList;
                        
                        
                        tempProductList = oppLineList;
                        var partialEmptyOtherBuyProductList = tempProductList.filter(element => 
                                                                                     element.Product2.Family != 'Specialty Products' && element.Product_Line__c != 'Other' && !element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                                    );
                        var partialNonEmptyOtherBuyProductList = tempProductList.filter(element => 
                                                                                        element.Product2.Family != 'Specialty Products' && element.Product_Line__c != 'Other' && element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                                       );
                        
                        var partialEmptySpecificProductList = tempProductList.filter(element => 
                                                                                     element.Product2.Family == 'Specialty Products' && element.Product_Line__c == 'Other' && !element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                                    );
                        
                        var partialNonEmptySpecificProductList = tempProductList.filter(element => 
                                                                                        element.Product2.Family == 'Specialty Products' && element.Product_Line__c == 'Other' && element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                                       );
                        
                        var partialEmptyOtherProductList =  tempProductList.filter(element => 
                                                                                   element.Product2.Family != 'Specialty Products' && element.Product_Line__c == 'Other' &&   !element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                                  );   
                        
                        var partialNonEmptyOtherProductList =  tempProductList.filter(element => 
                                                                                      element.Product2.Family != 'Specialty Products' && element.Product_Line__c == 'Other' &&   element.hasOwnProperty('Date_Submitted_for_Incentives__c') 
                                                                                     );   
                        
                        if(partialEmptyOtherBuyProductList.length > 0 || partialEmptySpecificProductList.length > 0 || partialEmptyOtherProductList.length > 0){
                            var sortedEmptyProductList = [];
                            
                            var emptyMedicalList = helper.sortEmptyRecordsFiterByProductType(partialEmptyOtherBuyProductList,'Medical');
                            var emptyPharmacyList = helper.sortEmptyRecordsFiterByProductType(partialEmptyOtherBuyProductList,'Pharmacy');
                            var emptyDentalList = helper.sortEmptyRecordsFiterByProductType(partialEmptyOtherBuyProductList,'Dental');
                            var emptyVisionList = helper.sortEmptyRecordsFiterByProductType(partialEmptyOtherBuyProductList,'Vision');
                            
                            
                            sortedEmptyProductList = helper.orderSortedList(sortedEmptyProductList,emptyMedicalList);
                            sortedEmptyProductList = helper.orderSortedList(sortedEmptyProductList,emptyPharmacyList);
                            sortedEmptyProductList = helper.orderSortedList(sortedEmptyProductList,emptyDentalList);
                            sortedEmptyProductList = helper.orderSortedList(sortedEmptyProductList,emptyVisionList);
                            sortedEmptyProductList = helper.orderSortedList(sortedEmptyProductList,partialEmptySpecificProductList);
                            sortedEmptyProductList = helper.orderSortedList(sortedEmptyProductList,partialEmptyOtherProductList);
                            console.log('sortedEmptyProductList '+sortedEmptyProductList);
                        }
                        
                        if(partialNonEmptyOtherBuyProductList.length > 0 || partialNonEmptySpecificProductList.length > 0 || partialNonEmptyOtherProductList.length > 0){
                            var hasDataMedicalList = helper.sortFiterByProductType(tempProductList,'Medical');
                            var hasDataPharmacyList = helper.sortFiterByProductType(tempProductList,'Pharmacy');
                            var hasDataDentalList = helper.sortFiterByProductType(tempProductList,'Dental');
                            var hasDataVisionList = helper.sortFiterByProductType(tempProductList,'Vision');
                            
                            
                            var sortedNonEmptyProductList = [];
                            
                            //sortedProductList = helper.orderSortedList(sortedProductList,emptyDateProductList);
                            sortedNonEmptyProductList = helper.orderSortedList(sortedNonEmptyProductList,hasDataMedicalList);
                            sortedNonEmptyProductList = helper.orderSortedList(sortedNonEmptyProductList,hasDataPharmacyList);
                            sortedNonEmptyProductList = helper.orderSortedList(sortedNonEmptyProductList,hasDataDentalList);
                            sortedNonEmptyProductList = helper.orderSortedList(sortedNonEmptyProductList,hasDataVisionList);
                            sortedNonEmptyProductList = helper.orderSortedList(sortedNonEmptyProductList,partialNonEmptySpecificProductList);
                            sortedNonEmptyProductList = helper.orderSortedList(sortedNonEmptyProductList,partialNonEmptyOtherProductList);
                            console.log('sortedNonEmptyProductList '+sortedNonEmptyProductList);
                        }
                        oppLineList = sortedEmptyProductList.concat(sortedNonEmptyProductList);
                    }
                    
                    
                    
                }
                
                
                var initialOtherBuyUp = oppLineList.filter(element => 
                                                           element.Product_Line__c == 'Other' &&  !element.hasOwnProperty('Date_Submitted_for_Incentives__c') && element.Underwriting_Validation__c == 'Yes' 
                                                          );
                
                
                if(initialOtherBuyUp.length > 0){
                    var otherBuyUpId = initialOtherBuyUp[0]['Id'];
                    component.set('v.otherBuyUpId',otherBuyUpId);
                }
                
                if(responseData != null && responseData != undefined && oppLineList.length > 0){
                    for(var i=0 ; i<oppLineList.length; i++){
                        salesPerson1.push(oppLineList[i].Opportunity.Owner_Name__c);
                        if(oppLineList[i]['Product_Line__c'] == 'Other'){
                            // component.set('v.OpportunityLineData[i]["Product_Line__c"]',responseData.QueryOppList[i].Product2.Name);
                            oppLineList[i]["Product_Line__c"] = oppLineList[i].Product2.Name;
                        }
                        
                        /* Assigning the Owner of Opportunity to Sales person 1 if it is coming NULL from Database */
                        /* if(!oppLineList[i].hasOwnProperty('Sales_Person_1__c')){
                            oppLineList[i]["Sales_Person_1__c"] = oppLineList[i].Opportunity.Id;
                            //oppLineList[i]["Sales_Person_1__r.Id"] = oppLineList[i].Opportunity.OwnerId;
                            oppLineList[i]["Sales_Person_1__r.Name"] = oppLineList[i].Opportunity.Owner_Name__c;
                        } */
                        
                        if(oppLineList[i]['Submit_for_sales_incentives__c'] == true){
                            //idList.push(oppLineList[i]['Id']);
                            idList[oppLineList[i]['Id']] = true;
                        }
                        //oppLineList[i]["Date_Submitted_for_Incentives__c"] = this.convertDate(responseData.QueryOppList[i].Date_Submitted_for_Incentives__c);
                    }
                    component.set('v.salesPerson1',salesPerson1);
                    component.set('v.selectedCheckBoxList',idList);
                    if(oppLineList.length == 1){
                        component.set('v.OpportunityLineData',oppLineList[0]);
                    }else{
                        component.set('v.OpportunityLineData',oppLineList);
                    }
                    component.set('v.emptyRecords',false);
                    component.set('v.OppData',oppLineList);
                } else {
                    component.set('v.emptyRecords',true);
                }
                
                
                /* var sortProductArray = ['Medical','Pharmacy','Dental','Vision','Other'];
                var sortedProductArrayList = [];
                var tempProductList = component.get('v.OpportunityLineData');
                var emptyDateProductList = tempProductList.filter(element => element.Date_Submitted_for_Incentives__c == '');
                var specificProductList = tempProductList.filter(element => element.Product2.Family == 'Specialty Products');
                var otherProductList =  tempProductList.filter(element => element.Product2.Family != 'Specialty Products');   
                   
                for(var i=0; i<sortProductArray.length; i++){
					
                    var productName = sortProductArray[i]; 
                    for(var j=0; j<tempProductList.length; j++){
                        //var filteredRecord = tempProductList.filter(element => element.Id == productName);
                        
                        if(productName == 'Other'){
                            /*if(tempProductList[j]['Product2'] != '' && tempProductList[j]['Product2'] != undefined && tempProductList[j]['Product2'] != null){
                                if(tempProductList[j]['Product2']['Family'] != '' && tempProductList[j]['Product2']['Family'] != undefined && tempProductList[j]['Product2']['Family'] != null && tempProductList[j]['Product2']['Family'] == null){
                                    
                                }else{
                                    
                                }
                            }
                        }else{
                            if(productName == tempProductList[j]['Product_Line__c']){
                            
                            	sortedProductArrayList.push(tempProductList[j]);
                                break;
                            
                        	}
                        }
                        
                    }                  
                }
                
                component.set('v.OpportunityLineData',sortedProductArrayList);*/
                var childId = component.get('v.childId');
                if(oppLineList != null && oppLineList != undefined && oppLineList.length > 0){
                    component.set('v.childId',oppLineList[0]["Id"]);
                }           
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
            } else if (state === "INCOMPLETE") {
                console.log('Incomplete');
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                }
        });
        $A.enqueueAction(action);
        
    },
    
    sortFiterByProductType : function(tempProductList,productType){
        var productTypeList =  tempProductList.filter(element => 
                                                      element.hasOwnProperty('Date_Submitted_for_Incentives__c')  && element.Product_Line__c != 'Other' && element.Product_Line__c == productType
                                                     );
        return productTypeList;
    },
    
    sortEmptyRecordsFiterByProductType : function(tempProductList,productType){
        var productTypeList =  tempProductList.filter(element => 
                                                      !element.hasOwnProperty('Date_Submitted_for_Incentives__c')  && element.Product_Line__c != 'Other' && element.Product_Line__c == productType
                                                     );
        return productTypeList;
    },
    
    orderSortedList : function(tempProductList,pushList){
        
        for(var i in pushList){
            tempProductList.push(pushList[i]);
        }
        return tempProductList;
    },
    
    saveOppProductLineItemData : function(component, event, helper) {
        var spinner = component.find("loadingSpinner");
        var action = component.get("c.saveOpportunityLineData");
        $A.util.addClass(component.find("errorToastMessage"), "slds-hide");
        action.setParams({ OppData :component.get('v.OpportunityLineData')});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                component.set('v.OpportunityLineData',responseData);
                this.getOpportunityDataHelper(component, event, helper);
            } else if (state === "INCOMPLETE") {
                console.log('Incomplete');
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                }
        });
        $A.enqueueAction(action);
    },
    
    showToast : function(reponseMessage,title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": reponseMessage
        });
        toastEvent.fire();
    },
    checkFiedEmptyValue : function(value){
        
        var fieldCheckTrue = true;
        if(value != '' && value != undefined && value != null){
            fieldCheckTrue = false;
        } 
        return fieldCheckTrue;        
    },
    
    exportRecord: function(component, event, helper){
        //event.stopPropagation();
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var opportunityId=component.get("v.recordId");
        var generateAction = component.get('c.getTemplateInXML');
        generateAction.setParams({
            "recordId" : component.get("v.recordId")
        });
        component.set('v.ErrorMessage','');
        generateAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                var OpportunityLineData = component.get('v.OpportunityLineData');
                var oppLineItemRecordCount=OpportunityLineData.length;
                if(oppLineItemRecordCount== 0)
                {
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                    helper.showToast('No Sales Incentives Records found to print',' ');
                }
                else
                {
                    helper.generateXmlFile(component,responseData.objectItags,responseData.xmlString,OpportunityLineData,responseData.FieldSetMap);
                }
            }
            else if (state === "INCOMPLETE") {   
                console.log('Incomplete');
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                            $A.util.removeClass(spinner, 'slds-show');
                            $A.util.addClass(spinner, 'slds-hide');
                            helper.showToast('No Sales Incentive Record found',' ');
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(generateAction); 
        
    },
    
    generateXmlFile : function(component,objectItagesMap,xmlWsectTag,opportunityProductFinalData,FieldSetMap) { 
        var spinner = component.find("loadingSpinner");
        var OppLineData = [];
        var HeaderData = opportunityProductFinalData[0];
        var EffectiveDate = HeaderData["Opportunity"]["EffectiveDate__c"];
        var memberShipActivityName = HeaderData["Opportunity"]["Name"];
        var xmlTempleteString ='';
        var rowCount = 3;
        for(var objectName in objectItagesMap) 
        {
            if (objectItagesMap.hasOwnProperty(objectName)) 
            {
                if(objectName=='Opportunity')
                {
                    for(var k in objectItagesMap[objectName])
                    {
                        var key = objectItagesMap[objectName][k];
                        var replaceItagName = '%%'+objectName+'.'+key+'@@';
                        var value='';
                        if(key.indexOf('.')!== -1)
                        {
                            var splitKeyArray = key.split('.');
                            if(HeaderData != '' && HeaderData != undefined && HeaderData != null && splitKeyArray.length == 2){
                                value = HeaderData[objectName][splitKeyArray[0]][splitKeyArray[1]];
                            } 
                            // var relatedObj = HeaderData[key];;
                            
                        } else if(key == 'EffectiveDate__c'){
                            value = this.convertDateDormat(HeaderData[objectName][key]);
                        }else {
                            value= HeaderData[objectName][key];
                        }
                        value = value != null ? value : '';
                        value = value.toString();
                        value = this.replaceXmlSpecialCharacters(value);
                        
                        
                        
                        xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);
                    }
                    
                } else {
                    var itagSets = objectItagesMap[objectName];
                    var startItag = '';
                    var endItag = '';
                    var setCount = 0;
                    for(var itagStrIndex in itagSets){
                        setCount = setCount+1;
                        if(setCount == 1){
                            startItag = itagSets[itagStrIndex];
                        }
                        if(setCount == itagSets.length){
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%'+objectName+'.'+startItag+'@@';
                    endItag = '%%'+objectName+'.'+endItag+'@@';
                    console.log('startItag'+startItag+' : endItag : '+endItag);
                    
                    var startIndex = xmlWsectTag.lastIndexOf(startItag);
                    var endIndex = xmlWsectTag.indexOf(endItag); 
                    
                    var stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0">', startIndex);
                    var endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                    endHeaderIdx +='</Row>'.length; 
                    var rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);
                    xmlTempleteString =  this.returnChildRows(component, rowToReccurse,xmlWsectTag,opportunityProductFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,FieldSetMap,rowCount);
                }
                
            }
        }
        var xmlDOM = new DOMParser().parseFromString(xmlTempleteString, 'text/xml');
        var JsonData = this.xmlToJson(xmlDOM);
        var today = this.formatDate();
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
        //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
        hiddenElement.target = '_self'; // 
        hiddenElement.download = 'Sales Incentives '+EffectiveDate+' '+memberShipActivityName+' '+today+'.xls'; 
        document.body.appendChild(hiddenElement); // Required for FireFox browser
        $A.util.removeClass(spinner, 'slds-show');
        $A.util.addClass(spinner, 'slds-hide');
        
        
        hiddenElement.click();
        this.showToast('Sales Incentives exported successfully ','');
    },
    
    replaceXmlSpecialCharacters : function(value) {
        if(value != null && value != undefined && value.length > 0){            
            value = value.replace(/&/g,'&amp;');
            value = value.replace(/>/g,'&gt;');
            value = value.replace(/</g,'&lt;');
            return value;
        }else{
            return '';
        }
    },
    
    returnChildRows:function(component, rowToReccurse,xmlWsectTag,opportunityProductFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,FieldSetMap,rowCount){
        var FinalTable = '';
        var totalRows = '';
        var count = 0;
        for(var i in opportunityProductFinalData){
            var eachRow = rowToReccurse;
            count = count+1;
            rowCount = rowCount+1;
            /*var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
            eachRow = eachRow.split(replaceItagName).join(count);*/
            for(var k in objectItagesMap[objectName]){
                var key = objectItagesMap[objectName][k];
                var replaceItagName = '%%'+objectName+'.'+key+'@@';
                var value='';
                var FieldSetVal=FieldSetMap[key];
                if(key.indexOf(".") >-1){
                    var splitItag = replaceItagName.split('.');
                    var splitPattern = splitItag[2].split('@@');
                    if(splitItag.length == 3){
                        
                        if(key == 'Product2.Product_Line__c'){
                            if(opportunityProductFinalData[i][splitItag[1]][splitPattern[0]] == 'Other'){
                                value = opportunityProductFinalData[i][splitItag[1]]['Name'];
                            } else {
                                value = opportunityProductFinalData[i][splitItag[1]][splitPattern[0]]; 
                            }
                        } else {
                            if(opportunityProductFinalData[i][splitItag[1]] != null &&  opportunityProductFinalData[i][splitItag[1]] != '' && opportunityProductFinalData[i][splitItag[1]] != undefined){
                                eachRow = eachRow.split(replaceItagName).join(opportunityProductFinalData[i][splitItag[1]][splitPattern[0]]);
                            }
                            else{
                                eachRow = eachRow.split(replaceItagName).join('');
                            } 
                        }
                        
                    }
                }else if(key == 'Submit_for_sales_incentives__c'){
                    value = opportunityProductFinalData[i][key] == true ? 'Yes' : 'No';
                }else{
                    value= opportunityProductFinalData[i][key];
                }
                
                
                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);
                if(value != '' && FieldSetMap[key] != undefined && FieldSetMap[key] != null ){
                    if(FieldSetMap[key].type == 'DATETIME'){
                        
                        /* var formattedDateArray = value.split('T')[0];
                        var railwayTime = value.split('T')[1].slice(0,8);
                        var displayTime = this.displayTime(railwayTime);
                        if(formattedDateArray.includes('-')){
                            var formattedDate = formattedDateArray.split('-');
                            var date =  formattedDate[2].startsWith(0) ? formattedDate[2].substring(1) : formattedDate[2]
                            var month = formattedDate[1].startsWith(0) ? formattedDate[1].substring(1) : formattedDate[1]
                            var year =  formattedDate[0].substring(2);
                            //var year =  formattedDateArray[0];
                            value = month+'/'+date+'/'+year;
                        }
                        //var year =  formattedDateArray[0];
                        value = value+' '+displayTime; */
                        var dtTm = new Date(value).toLocaleString("en-US", {timeZone: component.get("v.timeZone")});
                        dtTm = new Date(dtTm);
                        value=dtTm.toLocaleString();
                        /* if(value.includes(',')){ 
                            value = value.slice(0,9) +'  '+value.slice(10,15)+' '+value.slice(19,21);
                            //value = value.slice(0,8) +'  '+value.slice(10,14)+' '+value.slice(18,21);
                        }*/
                        if(value!=undefined && value!=null && value!=''){
                            var dateTimeValueFormatted;
                            var dateTimeSeparatedArray;
                            var timeSeparatedArray;
                            if(value.indexOf(',')!=-1){
                                dateTimeSeparatedArray=value.split(',');
                                dateTimeValueFormatted=dateTimeSeparatedArray[0]+' '+dateTimeSeparatedArray[1].slice(0,5) +''+dateTimeSeparatedArray[1].slice(8,12);
                                value=dateTimeValueFormatted;
                            }
                        }
                        
                    }else if(FieldSetMap[key].type == 'DATE'){
                        value = this.convertDateDormat(value);
                    }
                    
                }
                
                eachRow = eachRow.split(replaceItagName).join(value); 
            }
            
            totalRows += eachRow;
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx)+totalRows+xmlWsectTag.substring(endHeaderIdx);
        xmlWsectTag = xmlWsectTag.split('##rownumber@@').join(rowCount);
        return xmlWsectTag;
    },
    
    xmlToJson:function(xml) {
        
        // Create the return object
        var obj = {};
        
        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        
        // do children
        // If just one text node inside
        if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
            obj = xml.childNodes[0].nodeValue;
        }
        else if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    },
    formatDate:function() {
        
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        
        if (dd < 10) {
            dd = '0' + dd;
        }
        
        if (mm < 10) {
            mm = '0' + mm;
        }
        
        //today = mm + '/' + dd + '/' + yyyy;
        today = yyyy+''+mm+''+dd;
        return today;
    },
    
    convertDate : function(date){
        if(date != null && date != undefined && date != ''){
            var dateArray = date.split('T');
            var timeArray = dateArray[1].split('.000Z');
            return dateArray[0] + ' ' + timeArray[0];
        } else {
            return '';
        }
    },
    
    displayTime: function (railwayTime) {
        var str = "";
        var railwayTime = railwayTime;
        var hours = railwayTime.slice(0,2);
        var minutes = railwayTime.slice(3,5);
        if(hours > 12){
            var nonRailwayhours = hours - 12;  
        } else{
            var nonRailwayhours = hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes
        }
        str += nonRailwayhours + ":" + minutes + " ";
        if(hours > 11){
            str += "PM"
        } else {
            str += "AM"
        }
        return str;
    },
    
    convertDateDormat : function(date){
        if(date != null && date != undefined && date != ''){
            var formattedDateArray = date.split('-');
            var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
            var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
            var year =  formattedDateArray[0];
            date = month+'/'+date+'/'+year;
            return date;
        }else{
            return '';
        }
    },
    
    selectAll : function(component, event, helper) 
    {
        var selectedCheckBoxList = component.get('v.selectedCheckBoxList');
        //var selectedHeaderCheck = event.getSource().get("v.value");
        var selectedHeaderCheck = component.find('selectAllBox').get("v.value");
        var childComp = component.find('childComp');
        var oppLineData = component.get('v.OpportunityLineData'); 
        //var currentDateTime= new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString();
        var currentDateTime= new Date().toISOString();
        if(selectedHeaderCheck == true){
            if(Array.isArray(childComp)){
            for(var i=0; i<childComp.length; i++){
                if(oppLineData[i]['Submit_for_sales_incentives__c'] == false){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined && oppLineData[i]['Date_sent_to_ISI_Site__c'] == null){
                        childComp[i].set('v.OpportunityLineData.Submit_for_sales_incentives__c',true);
                        childComp[i].set('v.OpportunityLineData.VPCR_RVP__c',oppLineData[i]['Opportunity']['CM_VPCR_RVP__c']);
                        childComp[i].set('v.OpportunityLineData.Speciality_Benefits_SVP__c',oppLineData[i]['Opportunity']['Specialty_Benefits_SVP__c']);
                        childComp[i].set('v.isSplitEdit',true);
                        childComp[i].set('v.OpportunityLineData.Date_Submitted_for_Incentives__c',currentDateTime);
                        if(oppLineData[i].Product2['Product_Line__c'] == 'Other' && oppLineData[i]['Underwriting_Validation__c'] == 'Yes'){
                            childComp[i].set('v.underWriterEnable',true);
                            $A.util.removeClass(childComp[i].find('underWriterValidationCheck'),'slds-has-error');
                        }
                        component.set('v.checked',true);
                    }
                }
            }
            } else{
                if(oppLineData[0]['Submit_for_sales_incentives__c'] == false){
                    if(oppLineData[0]['Date_sent_to_ISI_Site__c'] == undefined && oppLineData[0]['Date_sent_to_ISI_Site__c'] == null){
                        childComp.set('v.OpportunityLineData.Submit_for_sales_incentives__c',true);
                        childComp.set('v.OpportunityLineData.VPCR_RVP__c',oppLineData[0]['Opportunity']['CM_VPCR_RVP__c']);
                        childComp.set('v.OpportunityLineData.Speciality_Benefits_SVP__c',oppLineData[0]['Opportunity']['Specialty_Benefits_SVP__c']);
                        childComp.set('v.isSplitEdit',true);
                        childComp.set('v.OpportunityLineData.Date_Submitted_for_Incentives__c',currentDateTime);
                        if(oppLineData[0].Product2['Product_Line__c'] == 'Other' && oppLineData[0]['Underwriting_Validation__c'] == 'Yes'){
                            childComp.set('v.underWriterEnable',true);
                            $A.util.removeClass(childComp.find('underWriterValidationCheck'),'slds-has-error');
                        }
                        component.set('v.checked',true);
                    }
                }
            
            }
            
            var salesPerson1 = component.get('v.salesPerson1');
            if(Array.isArray(childComp)){
                childComp[0].set('v.OpportunityLineData.Opportunity.Owner_Name__c',salesPerson1[0]);
            } else {
                childComp.set('v.OpportunityLineData.Opportunity.Owner_Name__c',salesPerson1[0]);
            }
            
            for(var i=1; i<childComp.length; i++){
                
                if(selectedCheckBoxList[oppLineData[i]['Id']] != true ){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == null && oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                        childComp[i].set('v.OpportunityLineData.Opportunity.Owner_Name__c',salesPerson1[i]);
                        childComp[i].set('v.OpportunityLineData.Sales_Person_1_split_percentage__c',childComp[0].get('v.OpportunityLineData.Sales_Person_1_split_percentage__c'));
                        //childComp[i].set('v.OpportunityLineData.Sales_Person_2__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2__c'));
                        //childComp[i].set('v.OpportunityLineData.Sales_Person_2_split_percentage__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2_split_percentage__c'));
                        childComp[i].set('v.OpportunityLineData.Will_Sales_Incentive_be_split__c',childComp[0].get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c'));
                        
                        
                        /* Copying of SalesPerson 1 based on Will Sales Incentives be split Yes/No starts */
                        if(oppLineData[i]['Submit_for_sales_incentives__c'] == true){
                            if(oppLineData[0].hasOwnProperty('Sales_Person_1__c') && oppLineData[0]["Sales_Person_1__c"] != undefined && oppLineData[0]["Sales_Person_1__c"] != null && oppLineData[0]["Sales_Person_1__c"] != ''){
                                childComp[i].set('v.enableSalesPerson1',true);
                                childComp[i].set('v.OpportunityLineData.Sales_Person_1__c',childComp[0].get('v.OpportunityLineData.Sales_Person_1__c'));
                                //childComp[i].set('v.selectedRecordSalesPerson1.Name',oppLineData[0]["Sales_Person_1__r"]["Name"]);
                                childComp[i].set('v.selectedRecordSalesPerson1.Name',oppLineData[0]["Sales_Person_1__r"]);
                                $A.util.removeClass(childComp[i].find('Sales_Person_1__c'),'slds-has-error');
                                $A.util.addClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                $A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                $A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                            } else if(!oppLineData[0].hasOwnProperty('Sales_Person_1__c') && oppLineData[0]["Sales_Person_1__c"] == undefined && oppLineData[0]["Sales_Person_1__c"] != ''
                                      && oppLineData[i].hasOwnProperty('Sales_Person_1__c') && oppLineData[i]["Sales_Person_1__c"] != undefined && oppLineData[i]["Sales_Person_1__c"] != null && oppLineData[i]["Sales_Person_1__c"] != ''){
                                childComp[i].set('v.enableSalesPerson1',false);
                                childComp[i].set('v.OpportunityLineData.Sales_Person_1__c','');
                                childComp[i].set('v.selectedRecordSalesPerson1.Name','');
                                $A.util.removeClass(childComp[i].find('Sales_Person_1__c'),'slds-has-error');
                                $A.util.addClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                $A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                $A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                            }
                        }
                        
                        /* Copying of SalesPerson 1 based on Will Sales Incentives be split Yes/No Ends */
                        
                        if(childComp[0].get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') == 'No' && childComp[i].get('v.OpportunityLineData.Submit_for_sales_incentives__c') == true) {
                            $A.util.removeClass(childComp[i].find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                            $A.util.removeClass(childComp[0].find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__r','');
                            childComp[i].set('v.isIncentiveEdit',false);
                            //childComp[i].set('v.OpportunityLineData.Sales_Person_1_split_percentage__c',childComp[0].get('v.OpportunityLineData.Sales_Person_1_split_percentage__c'));
                            
                            /*  $A.util.addClass(childComp[i].find('lookup-pill'),'slds-hide');
                            $A.util.removeClass(childComp[i].find('lookup-pill'),'slds-show');
                             $A.util.addClass(childComp[i].find('searchRes'),'slds-is-open');
                            $A.util.removeClass(childComp[i].find('searchRes'),'slds-is-close');
                            $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-show');
                            $A.util.removeClass(childComp[i].find('userLookUpField1'),'slds-hide');
                            $A.util.removeClass(childComp[i].find('removeSearch'),'slds-hide');
                            $A.util.addClass(childComp[i].find('removeSearch'),'slds-show'); */
                            $A.util.addClass(childComp[i].find('Sales_Person_2__c'),'slds-hide');
                            
                        } else if(childComp[0].get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') == 'Yes' && childComp[i].get('v.OpportunityLineData.Submit_for_sales_incentives__c') == true){
                            $A.util.removeClass(childComp[i].find('Sales_Person_2__c'),'slds-hide');
                            $A.util.addClass(childComp[i].find('Sales_Person_2__c'),'slds-show');
                            $A.util.removeClass(childComp[i].find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                            $A.util.removeClass(childComp[0].find('Will_Sales_Incentive_be_split__c'), 'slds-has-error');
                            
                            
                            if(childComp[0].get('v.OpportunityLineData.Sales_Person_2__c') != null && childComp[0].get('v.OpportunityLineData.Sales_Person_2__c') != undefined){
                                $A.util.removeClass(childComp[i].find('Sales_Person_2__c'), 'slds-has-error');
                                $A.util.removeClass(childComp[0].find('Sales_Person_2__c'), 'slds-has-error');
                            }
                            if(childComp[0].get('v.OpportunityLineData.Sales_Person_2_split_percentage__c') != null && childComp[0].get('v.OpportunityLineData.Sales_Person_2_split_percentage__c') != undefined){
                                $A.util.removeClass(childComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(childComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            }
                            
                            childComp[i].set('v.isIncentiveEdit',true);
                            $A.util.addClass(childComp[i].find('lookup-pill'),'slds-show');
                            $A.util.removeClass(childComp[i].find('lookup-pill'),'slds-hide');
                            $A.util.addClass(childComp[i].find('searchRes'),'slds-is-close');
                            $A.util.removeClass(childComp[i].find('searchRes'),'slds-is-open');
                            $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-hide');
                            $A.util.removeClass(childComp[i].find('userLookUpField1'),'slds-show');
                            $A.util.removeClass(childComp[i].find('removeSearch'),'slds-show');
                            $A.util.addClass(childComp[i].find('removeSearch'),'slds-hide');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2__c'));
                            if(oppLineData[0]["Sales_Person_2__c"] != '' && oppLineData[0]["Sales_Person_2__c"] != undefined && oppLineData[0]["Sales_Person_2__c"] !=  null){
                                childComp[i].set('v.selectedRecord.Name',oppLineData[0]["Sales_Person_2__r"]);
                            }else{
                                childComp[i].set('v.selectedRecord.Name','');
                                $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-show');
                                $A.util.addClass(childComp[i].find('lookup-pill'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('lookup-pill'),'slds-show');
                                $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-show');
                                $A.util.removeClass(childComp[i].find('userLookUpField1'),'slds-hide');
                            }
                            
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2_split_percentage__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2_split_percentage__c'));
                        } else {
                            childComp[i].set('v.isIncentiveEdit',false);
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
                        }
                        childComp[i].set('v.OpportunityLineData.Date_Submitted_for_Incentives__c', currentDateTime);
                        
                        
                        //--------------------Copying the underwriter Data starts here--------------------
                        if(oppLineData[0]["Product2"]["Product_Line__c"] == 'Other'){
                            if(oppLineData[i]["Product2"]["Product_Line__c"] == 'Other' && oppLineData[i]["Underwriting_Validation__c"] == 'Yes'){
                                if(oppLineData[0]["Underwriter__c"] != '' && oppLineData[0]["Underwriter__c"] != null && oppLineData[0]["Underwriter__c"] != undefined){
                                    $A.util.addClass(childComp[i].find('lookup-pillUW'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('lookup-pillUW'),'slds-hide');
                                    $A.util.addClass(childComp[i].find('searchResUnderWriter'),'slds-is-close');
                                    $A.util.removeClass(childComp[i].find('searchResUnderWriter'),'slds-is-open');
                                    $A.util.addClass(childComp[i].find('userLookUpField2'),'slds-hide');
                                    $A.util.removeClass(childComp[i].find('userLookUpField2'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('removeSearchUW'),'slds-show');
                                    $A.util.addClass(childComp[i].find('removeSearchUW'),'slds-hide');
                                    $A.util.removeClass(childComp[i].find('underWriterValidationCheck'),'slds-has-error');
                                    childComp[i].set('v.selectedUnderWriter.Underwriter_Name__c',oppLineData[0]["Underwriter__c"]);
                                    childComp[i].set('v.OpportunityLineData.Underwriter__c',oppLineData[0]["Underwriter__c"]);
                                    childComp[i].set('v.OpportunityLineData.Underwriter_Email__c',oppLineData[0]["Underwriter_Email__c"]);
                                } else {
                                    childComp[i].set('v.selectedUnderWriter.Underwriter_Name__c','');
                                    childComp[i].set('v.OpportunityLineData.Underwriter__c','');
                                    childComp[i].set('v.OpportunityLineData.Underwriter_Email__c','');
                                    $A.util.addClass(childComp[i].find('lookup-pillUW'),'slds-hide');
                                    $A.util.removeClass(childComp[i].find('lookup-pillUW'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('userLookUpField2'),'slds-hide');
                                    $A.util.addClass(childComp[i].find('userLookUpField2'),'slds-show');
                                } 
                                
                            }
                        }
                        
                    }
                }
                
            }
            
            
        } else {
            if(Array.isArray(childComp)){
               for( var i=0 ; i<childComp.length; i++){
                if(selectedCheckBoxList[oppLineData[i]['Id']] != true){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined && oppLineData[i]['Date_sent_to_ISI_Site__c'] == null){
                        if(childComp[i].get('v.OpportunityLineData.Submit_for_sales_incentives__c') == true){
                            childComp[i].set('v.OpportunityLineData.Underwriter__c','');
                            childComp[i].set('v.OpportunityLineData.Underwriter_Email__c','');
                            childComp[i].set('v.OpportunityLineData.Underwriter__r','');
                            childComp[i].set('v.OpportunityLineData.Opportunity.Owner_Name__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_1__r.Name','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_1__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_1__r','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__r.Name','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__r','');
                            childComp[i].set('v.OpportunityLineData.Will_Sales_Incentive_be_split__c','');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
                            childComp[i].set('v.OpportunityLineData.Date_Submitted_for_Incentives__c','');
                            childComp[i].set('v.underWriterEnable',false);
                            childComp[i].set('v.OpportunityLineData.VPCR_RVP__c','');
                            childComp[i].set('v.OpportunityLineData.Speciality_Benefits_SVP__c','');
                            
                            childComp[i].set('v.OpportunityLineData.Submit_for_sales_incentives__c',false); 
                            childComp[i].set('v.isSplitEdit',false);
                            childComp[i].set('v.isIncentiveEdit',false);
                            childComp[i].set('v.enableSalesPerson1',false);
                            component.set('v.checked',false);
                        }
                    }
                }
            } 
            } else {
                if(selectedCheckBoxList[oppLineData[0]['Id']] != true){
                    if(oppLineData[0]['Date_sent_to_ISI_Site__c'] == undefined && oppLineData[0]['Date_sent_to_ISI_Site__c'] == null){
                        if(childComp.get('v.OpportunityLineData.Submit_for_sales_incentives__c') == true){
                            childComp.set('v.OpportunityLineData.Underwriter__c','');
                            childComp.set('v.OpportunityLineData.Underwriter_Email__c','');
                            childComp.set('v.OpportunityLineData.Underwriter__r','');
                            childComp.set('v.OpportunityLineData.Opportunity.Owner_Name__c','');
                            childComp.set('v.OpportunityLineData.Sales_Person_1_split_percentage__c','');
                            childComp.set('v.OpportunityLineData.Sales_Person_1__r.Name','');
                            childComp.set('v.OpportunityLineData.Sales_Person_1__c','');
                            childComp.set('v.OpportunityLineData.Sales_Person_1__r','');
                            childComp.set('v.OpportunityLineData.Sales_Person_2__r.Name','');
                            childComp.set('v.OpportunityLineData.Sales_Person_2__c','');
                            childComp.set('v.OpportunityLineData.Sales_Person_2__r','');
                            childComp.set('v.OpportunityLineData.Will_Sales_Incentive_be_split__c','');
                            childComp.set('v.OpportunityLineData.Sales_Person_2_split_percentage__c','');
                            childComp.set('v.OpportunityLineData.Date_Submitted_for_Incentives__c','');
                            childComp.set('v.underWriterEnable',false);
                            childComp.set('v.OpportunityLineData.VPCR_RVP__c','');
                            childComp.set('v.OpportunityLineData.Speciality_Benefits_SVP__c','');
                            
                            childComp.set('v.OpportunityLineData.Submit_for_sales_incentives__c',false); 
                            childComp.set('v.isSplitEdit',false);
                            childComp.set('v.isIncentiveEdit',false);
                            childComp.set('v.enableSalesPerson1',false);
                            component.set('v.checked',false);
                        }
                    }
                }
            }
            
        }
    },
    
    copyColumnData : function(component, event, helper,columnId){
        var childComp = component.find('childComp');
        var oppLineData = component.get('v.OpportunityLineData');
        var selectedCheckBoxList = component.get('v.selectedCheckBoxList');
        for(var i=1 ; i<childComp.length; i++){
            if(selectedCheckBoxList[oppLineData[i]['Id']] != true ){
                
                /*Copying of will sales Incentives be split  starts */
                if(columnId == 'Will_Sales_Incentive_be_split__c'){
                    if(oppLineData[i]['Submit_for_sales_incentives__c'] == true && (oppLineData[0]['Will_Sales_Incentive_be_split__c'] == 'Yes' || oppLineData[0]['Will_Sales_Incentive_be_split__c'] == 'No')){
                        if(oppLineData[0]['Will_Sales_Incentive_be_split__c'] == 'Yes' && oppLineData[i]['Submit_for_sales_incentives__c'] == true){
                            for(var j=i ; j<childComp.length; j++){
                                childComp[i].set('v.isIncentiveEdit',true);
                                childComp[i].set('v.OpportunityLineData.Will_Sales_Incentive_be_split__c', oppLineData[0]['Will_Sales_Incentive_be_split__c']);
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_1_split_percentage__c', '');
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_2_split_percentage__c', '');
                            }
                            if(oppLineData[i]['Will_Sales_Incentive_be_split__c'] == 'Yes' && oppLineData[i]['Sales_Person_2__c'] != null && oppLineData[i]['Sales_Person_2__c'] != ''){
                                /* $A.util.removeClass(childComp[i].find('Sales_Person_2__c'), 'slds-hide');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__c', '');
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__r', ''); */
                                childComp[i].set('v.selectedRecord.Name','');
                                $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-show');
                                $A.util.addClass(childComp[i].find('lookup-pill'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('lookup-pill'),'slds-show');
                                $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-show');
                                $A.util.removeClass(childComp[i].find('userLookUpField1'),'slds-hide');
                                childComp[i].set('v.OpportunityLineData.Sales_Person_2__c','');
                                
                            } else {
                                $A.util.removeClass(childComp[i].find('Sales_Person_2__c'), 'slds-hide');
                                childComp[i].set('v.OpportunityLineData.Sales_Person_2__c', '');
                                childComp[i].set('v.OpportunityLineData.Sales_Person_2__r', '');
                            }
                        } else if(oppLineData[0]['Will_Sales_Incentive_be_split__c'] == 'No' && oppLineData[i]['Submit_for_sales_incentives__c'] == true){
                            for(var j=i ; j<childComp.length; j++){
                                childComp[i].set('v.OpportunityLineData.Sales_Person_1_split_percentage__c', 100);
                                childComp[i].set('v.isIncentiveEdit',false);
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_2_split_percentage__c', '');
                                childComp[i].set('v.OpportunityLineData.Will_Sales_Incentive_be_split__c', oppLineData[0]['Will_Sales_Incentive_be_split__c']);
                            }
                        }
                        /* Copying of SalesPerson 1 based on Will Sales Incentives be split Yes/No starts */
                        if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == null && oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                            if(oppLineData[i]['Submit_for_sales_incentives__c'] == true){
                                if(oppLineData[0].hasOwnProperty('Sales_Person_1__c')){
                                    childComp[i].set('v.enableSalesPerson1',true);
                                    childComp[i].set('v.OpportunityLineData.Sales_Person_1__c',childComp[0].get('v.OpportunityLineData.Sales_Person_1__c'));
                                    childComp[i].set('v.selectedRecordSalesPerson1.Name',oppLineData[0]["Sales_Person_1__r"]);
                                    $A.util.removeClass(childComp[i].find('Sales_Person_1__c'),'slds-has-error');
                                    $A.util.addClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                    $A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                    $A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                    $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                    $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                    $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                                } else {
                                    childComp[i].set('v.enableSalesPerson1',true);
                                    //childComp[i].set('v.OpportunityLineData.Sales_Person_1__c',childComp[0].get('v.OpportunityLineData.Sales_Person_1__c'));
                                    childComp[i].set('v.selectedRecordSalesPerson1.Name',oppLineData[0].Opportunity.Owner_Name__c);
                                    $A.util.removeClass(childComp[i].find('Sales_Person_1__c'),'slds-has-error');
                                    $A.util.addClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                                    $A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                                    $A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                                    $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                                    $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                                    $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                                    $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                                }
                            }
                        }
                        /* Copying of SalesPerson 1 based on Will Sales Incentives be split Yes/No Ends */
                        
                    }
                } 
                /* Copying of will sales Incentives be split  Ends */
                
                if(columnId == 'Sales_Person_1_input' || columnId == 'Sales_Person_2_input'){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == null && oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                        if(childComp[i].get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') == 'Yes'){
                            if(oppLineData[0]["Sales_Person_1_split_percentage__c"] < 0 || oppLineData[0]["Sales_Person_1_split_percentage__c"] > 100){
                                //$A.util.addClass(childComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_2_split_percentage__c', '');
                            } else {
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_1_split_percentage__c', oppLineData[0]["Sales_Person_1_split_percentage__c"]);
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_2_split_percentage__c', oppLineData[0]["Sales_Person_2_split_percentage__c"]);
                                $A.util.removeClass(childComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(childComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            }
                            if(oppLineData[0]["Sales_Person_2_split_percentage__c"] < 0 || oppLineData[0]["Sales_Person_2_split_percentage__c"] > 100){
                                // $A.util.addClass(childComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_1_split_percentage__c', '');
                            } else {
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_1_split_percentage__c', oppLineData[0]["Sales_Person_1_split_percentage__c"]);
                                childComp[i].set('v.OpportunityLineData.'+'Sales_Person_2_split_percentage__c', oppLineData[0]["Sales_Person_2_split_percentage__c"]);
                                //$A.util.removeClass(childComp[i].find('Sales_Person_2_split_percentage__c'), 'slds-has-error');
                                //$A.util.removeClass(childComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            }
                        } /*else if(childComp[i].get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') == '')
                    			childComp[i].set('v.OpportunityLineData.'+'Sales_Person_1_split_percentage__c', '');
                            childComp[i].set('v.OpportunityLineData.'+'Sales_Person_2_split_percentage__c', ''); */
                    }
                } else if(columnId == 'Sales_Person_2'){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == null && oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                        if(childComp[i].get('v.OpportunityLineData.Will_Sales_Incentive_be_split__c') == 'Yes'){
                            childComp[i].set('v.OpportunityLineData.Sales_Person_2__c',childComp[0].get('v.OpportunityLineData.Sales_Person_2__c'));
                            childComp[i].set('v.selectedRecord.Name',oppLineData[0]["Sales_Person_2__r"]);
                            $A.util.removeClass(childComp[i].find('Sales_Person_2__c'),'slds-has-error');
                            $A.util.addClass(childComp[i].find('lookup-pill'),'slds-show');
                            $A.util.removeClass(childComp[i].find('lookup-pill'),'slds-hide');
                            $A.util.addClass(childComp[i].find('searchRes'),'slds-is-close');
                            $A.util.removeClass(childComp[i].find('searchRes'),'slds-is-open');
                            $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-hide');
                            $A.util.removeClass(childComp[i].find('userLookUpField1'),'slds-show');
                            $A.util.removeClass(childComp[i].find('removeSearch'),'slds-show');
                            $A.util.addClass(childComp[i].find('removeSearch'),'slds-hide');
                        }
                    }
                } else if(columnId == 'clear_Sales_Person_2'){
                    if(selectedCheckBoxList[oppLineData[i]['Id']] != true ){
                        childComp[i].set('v.selectedRecord.Name','');
                        $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-show');
                        $A.util.addClass(childComp[i].find('lookup-pill'),'slds-hide');
                        $A.util.removeClass(childComp[i].find('lookup-pill'),'slds-show');
                        $A.util.addClass(childComp[i].find('userLookUpField1'),'slds-show');
                        $A.util.removeClass(childComp[i].find('userLookUpField1'),'slds-hide');
                        childComp[i].set('v.OpportunityLineData.Sales_Person_2__c','');
                    }
                } else if(columnId == 'initialUnderWriterDataFlow'){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == null && oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                        if(oppLineData[i]["Product2"]["Product_Line__c"] == 'Other' && oppLineData[i]["Underwriting_Validation__c"] == 'Yes'){
                            if(oppLineData[0]["Underwriter__c"] != '' && oppLineData[0]["Underwriter__c"] != null && oppLineData[0]["Underwriter__c"] != undefined){
                                $A.util.addClass(childComp[i].find('lookup-pillUW'),'slds-show');
                                $A.util.removeClass(childComp[i].find('lookup-pillUW'),'slds-hide');
                                $A.util.addClass(childComp[i].find('searchResUnderWriter'),'slds-is-close');
                                $A.util.removeClass(childComp[i].find('searchResUnderWriter'),'slds-is-open');
                                $A.util.addClass(childComp[i].find('userLookUpField2'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('userLookUpField2'),'slds-show');
                                $A.util.removeClass(childComp[i].find('removeSearchUW'),'slds-show');
                                $A.util.addClass(childComp[i].find('removeSearchUW'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('underWriterValidationCheck'),'slds-has-error');
                                childComp[i].set('v.selectedUnderWriter.Underwriter_Name__c',oppLineData[0]["Underwriter__c"]);
                                childComp[i].set('v.OpportunityLineData.Underwriter__c',oppLineData[0]["Underwriter__c"]);
                                childComp[i].set('v.OpportunityLineData.Underwriter_Email__c',oppLineData[0]["Underwriter_Email__c"]);
                                
                            }
                        }
                    }
                } else if(columnId == 'clearInitialUnderWriterData'){
                    if(selectedCheckBoxList[oppLineData[i]['Id']] != true ){
                        childComp[i].set('v.selectedUnderWriter.Underwriter_Name__c','');
                        childComp[i].set('v.OpportunityLineData.Underwriter__c','');
                        childComp[i].set('v.OpportunityLineData.Underwriter_Email__c','');
                        $A.util.addClass(childComp[i].find('lookup-pillUW'),'slds-hide');
                        $A.util.removeClass(childComp[i].find('lookup-pillUW'),'slds-show');
                        $A.util.removeClass(childComp[i].find('userLookUpField2'),'slds-hide');
                        $A.util.addClass(childComp[i].find('userLookUpField2'),'slds-show');
                    }
                } else if(columnId == 'partialUnderWriterDataFlow'){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == null && oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                        if(oppLineData[i]["Product2"]["Product_Line__c"] == 'Other' && oppLineData[i]["Underwriting_Validation__c"] == 'Yes'){
                            if(oppLineData[i]["Underwriter__c"] != '' && oppLineData[i]["Underwriter__c"] != null && oppLineData[i]["Underwriter__c"] != undefined){
                                childComp[i].set('v.selectedUnderWriter.Underwriter_Name__c',oppLineData[i]["Underwriter__c"]);
                                childComp[i].set('v.OpportunityLineData.Underwriter__c',oppLineData[i]["Underwriter__c"]);
                                childComp[i].set('v.OpportunityLineData.Underwriter_Email__c',oppLineData[i]["Underwriter_Email__c"]);
                                $A.util.addClass(childComp[i].find('lookup-pillUW'),'slds-show');
                                $A.util.removeClass(childComp[i].find('lookup-pillUW'),'slds-hide');
                                $A.util.addClass(childComp[i].find('searchResUnderWriter'),'slds-is-close');
                                $A.util.removeClass(childComp[i].find('searchResUnderWriter'),'slds-is-open');
                                $A.util.addClass(childComp[i].find('userLookUpField2'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('userLookUpField2'),'slds-show');
                                $A.util.removeClass(childComp[i].find('removeSearchUW'),'slds-show');
                                $A.util.addClass(childComp[i].find('removeSearchUW'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('underWriterValidationCheck'),'slds-has-error');
                                for( var j = i+1 ; j< childComp.length ; j++){
                                    if(oppLineData[j]["Product2"]["Product_Line__c"] == 'Other' && oppLineData[j]["Underwriting_Validation__c"] == 'Yes'){
                                        if(oppLineData[j]["Underwriter__c"] == '' || oppLineData[j]["Underwriter__c"] == null || oppLineData[j]["Underwriter__c"] == undefined){
                                            $A.util.addClass(childComp[j].find('lookup-pillUW'),'slds-show');
                                            $A.util.removeClass(childComp[j].find('lookup-pillUW'),'slds-hide');
                                            $A.util.addClass(childComp[j].find('searchResUnderWriter'),'slds-is-close');
                                            $A.util.removeClass(childComp[j].find('searchResUnderWriter'),'slds-is-open');
                                            $A.util.addClass(childComp[j].find('userLookUpField2'),'slds-hide');
                                            $A.util.removeClass(childComp[j].find('userLookUpField2'),'slds-show');
                                            $A.util.removeClass(childComp[j].find('removeSearchUW'),'slds-show');
                                            $A.util.addClass(childComp[j].find('removeSearchUW'),'slds-hide');
                                            $A.util.removeClass(childComp[j].find('underWriterValidationCheck'),'slds-has-error');
                                            childComp[j].set('v.selectedUnderWriter.Underwriter_Name__c',oppLineData[i]["Underwriter__c"]);
                                            childComp[j].set('v.OpportunityLineData.Underwriter__c',oppLineData[i]["Underwriter__c"]);
                                            childComp[j].set('v.OpportunityLineData.Underwriter_Email__c',oppLineData[i]["Underwriter_Email__c"]);
                                            
                                        }
                                    }
                                }
                            } else {
                                break;
                            }
                        }
                    }
                } else if(columnId == 'partialClearUnderWriterData'){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == null && oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                        if(oppLineData[i]["Product2"]["Product_Line__c"] == 'Other' && oppLineData[i]["Underwriting_Validation__c"] == 'Yes'){
                            if(selectedCheckBoxList[oppLineData[i]['Id']] != true ){
                                childComp[i].set('v.selectedUnderWriter.Underwriter_Name__c','');
                                childComp[i].set('v.OpportunityLineData.Underwriter__c','');
                                childComp[i].set('v.OpportunityLineData.Underwriter_Email__c','');
                                $A.util.addClass(childComp[i].find('lookup-pillUW'),'slds-hide');
                                $A.util.removeClass(childComp[i].find('lookup-pillUW'),'slds-show');
                                $A.util.removeClass(childComp[i].find('userLookUpField2'),'slds-hide');
                                $A.util.addClass(childComp[i].find('userLookUpField2'),'slds-show');
                            }
                        }
                    }
                } else if(columnId == 'Sales_Person_1'){
                    if(oppLineData[i]['Date_sent_to_ISI_Site__c'] == null && oppLineData[i]['Date_sent_to_ISI_Site__c'] == undefined){
                        if(oppLineData[i]['Submit_for_sales_incentives__c'] == true){
                            childComp[i].set('v.OpportunityLineData.Sales_Person_1__c',childComp[0].get('v.OpportunityLineData.Sales_Person_1__c'));
                            childComp[i].set('v.selectedRecordSalesPerson1.Name',oppLineData[0]["Sales_Person_1__r"]);
                            $A.util.removeClass(childComp[i].find('Sales_Person_1__c'),'slds-has-error');
                            $A.util.addClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-show');
                            $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                            $A.util.addClass(childComp[i].find('searchResSalesPerson1'),'slds-is-close');
                            $A.util.removeClass(childComp[i].find('searchResSalesPerson1'),'slds-is-open');
                            $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                            $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                            $A.util.removeClass(childComp[i].find('removeSearchSalesPerson1'),'slds-show');
                            $A.util.addClass(childComp[i].find('removeSearchSalesPerson1'),'slds-hide');
                        }
                    }
                } else if(columnId == 'clear_Sales_Person_1'){
                    if(selectedCheckBoxList[oppLineData[i]['Id']] != true ){
                        $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                        $A.util.addClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-hide');
                        $A.util.removeClass(childComp[i].find('lookup-pillSalesPerson1'),'slds-show');
                        $A.util.addClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-show');
                        $A.util.removeClass(childComp[i].find('userLookUpField1SalesPerson1'),'slds-hide');
                        childComp[i].set('v.OpportunityLineData.Sales_Person_1__c','');
                        childComp[i].set('v.selectedRecordSalesPerson1.Name','');
                    }
                }
                
            }
        }
    },
    
    
    sendMailToHelpDesk : function(component, event) {
        component.set('v.isSpinnertoLoad', true);
        var lastName = component.find('lastName').get('v.value');
        var firstName = component.find('firstName').get('v.value');
        var emailvalidationtrigger = true;
        var maId =  component.get('v.recordId');
        
        /* if(email != null && email != ''){
            var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!email.match(regExpEmailformat)){
                emailvalidationtrigger = false;  
            }   
        } */
        
        var opData = component.get('v.opportunityData');
        var accName= ''; 
        if(opData != null){
            accName =  opData.AccountName;
        }
        if(emailvalidationtrigger){
            var action = component.get('c.sendMailFromApex');
            action.setParams({'lName' : lastName,
                              'fName' : firstName,
                              'maId' : component.get("v.recordId"),
                              
                             });
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === 'SUCCESS'){
                    var resp = response.getReturnValue();
                    if(resp){
                        var errorMsg = component.set('v.errorMsg', 'Mail sent successfully!!');
                        var alertHeader = component.set('v.alertHeader', 'SUCCESS');
                        this.showToast('Mail sent successfully', 'SUCCESS');
                        component.set('v.isSpinnertoLoad', false);
                        component.set('v.invokeUnderWriterHelpEmailCmp',false);
                    }
                }else{
                    var errorMsg = component.set('v.errorMsg', 'Mail not sent. Please contact administrator ');
                    var alertHeader = component.set('v.alertHeader', 'Error');
                    this.showToast('Mail not sent. Please contact administrator', 'Error');
                    component.set('v.isSpinnertoLoad', false);
                }
            });
            
            $A.enqueueAction(action); 
        }else{
            $A.util.addClass(component.find('email'), "mandatoryFields");
            $A.util.addClass(component.find('emailDiv'), "slds-has-error");
            $A.util.removeClass(component.find('emailDiv1'), "slds-hide");
            component.set('v.isSpinnertoLoad', false);
        }
        
    },
    
    openMailPopup : function(component, event, header, cmp){
        debugger;
        var childData ='';
        if(component.get('v.isFromQA')){
            childData = {'opportunityData' : component.get('v.opportunityData'),'isFromQA': component.get('v.isFromQA')} 
        }else{
            childData = {'maId' :component.get("v.recordId"),'isFromQA': component.get('v.isFromQA'),'opportunityData' : ''}
        }
        //childData = {'maId' :component.get('v.Child_Data').maRecordId,'opportunityData' : component.get('v.opportunityData'),'isFromQA': component.get('v.isFromQA')}
        $A.createComponents([["c:underWriter_Modal_Component_Small",{attribute:true, 'ModalBodyData':childData, 'Modalheader':header,'ModalBody':cmp}]],
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
    
})