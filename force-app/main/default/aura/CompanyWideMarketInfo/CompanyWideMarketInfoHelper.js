({
    createDynamicComponent:function(component, event,ProductCategoryComponent){
        console.log('create component called');
        var MemberShipActivityChildAttributeObj = {'memberShipActivityRecordId':component.get('v.recordId'),
                                                   'backedFeildItags':component.get('v.fieldsItag'),
                                                   'productCategoryFeilds':component.get('v.fieldSets'),
                                                   'MArecordId':component.get('v.recordId'),
                                                   'requiredFieldsItag':component.get('v.requiredFieldsItag'),
                                                   'readOnlyFieldsItag':component.get('v.readOnlyFieldsItag'),
                                                   'requiredFieldsItagMO':component.get('v.requiredFieldsItagMO'),
                                                   'readOnlyFieldsItagMO':component.get('v.readOnlyFieldsItagMO'),
                                                   'MAGlobalData':component.get('v.MAGlobalData'),
                                                   'intialSalesStageList':component.get('v.initailValues'),
                                                   'intialSalesStageMOList':component.get('v.initailMOValues'),
                                                   'possibleSaleStageList':component.get('v.possibleSalesStageValues'),
                                                   'possibleSaleStageMOList':component.get('v.possibleSalesMOStageValues'),
                                                   'oppCategory': component.get('v.MA_Type'),
                                                   'selectedProductTab':component.get('v.productCategoryName'),
                                                   'DispositonMap':component.get("v.DispositonMap"),
                                                   "DispositonItag":component.get("v.DispositonItag"),
                                                   "medicalFieldsList":component.get("v.medicalFieldsList"),
                                                   "othersFieldsList":component.get("v.othersFieldsList"),
                                                   "selectedProdCatg":component.get('v.productCategoryName'),
                                                   "clearValueMap":component.get('v.clearValueMap'),
                                                   "selectedCategoryMap":component.get('v.selectedCategoryMap'),
                                                   "isProdCat":false,
                                                   "isComments":false,
                                                   "isAdditionalInfo":false,
                                                   "isCompanyWideMarket":true,
                                                   "isAdditionalInfo2":false,
                                                   "accessObj":component.get("v.accessObj"),
                                                   "accessVal":component.get('v.accessVal'),
                                                   "possItag":component.get('v.possItag'),
                                                   "PreviousSelectedStage":component.get("v.PreviousSelectedStage"),
                                                   "CurrentSelectedStage":component.get("v.CurrentSelectedStage"),
                                                   "PreviousSelectedStageMO":component.get("v.PreviousSelectedStageMO"),
                                                   "CurrentSelectedStageMO":component.get("v.CurrentSelectedStageMO"),
                                                   "isDataServiceTrasaction":component.get("v.isDataServiceTrasaction"),
                                                   "accountreadOnlyFieldsItag":component.get("v.accountreadOnlyFieldsItag")
                                                  };
        component.set('v.MAChildAttrObj',MemberShipActivityChildAttributeObj);
        $A.createComponents([["c:"+ProductCategoryComponent,{attribute:true,MAChildAttrObj:component.get('v.MAChildAttrObj')}]],
                            function(newCmp, status, errorMessage){ 
                                if (component.isValid() && status === 'SUCCESS') {
                                    console.log('create component success');
                                    var dynamicComponentsByAuraId = {};
                                    for(var i=0; i < newCmp.length; i++) {
                                        var thisComponent = newCmp[i];
                                        dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                    }
                                    component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                    component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                    component.set("v.body", newCmp);
                                    setTimeout(function(){
                                        var spinner = component.find("mySpinner");                                    
                                        $A.util.addClass(spinner, "slds-hide");
                                    },750);                                    
                                }else if (status === "INCOMPLETE") {
                                    console.log("No response from server or client is offline.")
                                    // Show offline error
                                }
                                    else if (status === "ERROR") {
                                        console.log("Error: " + errorMessage);
                                        // Show error message
                                    }
                            });
    },
    getFeildSets_RelatedListData:function(component, event){
        console.log('inside getFeildSets_RelatedListData');
        var action = component.get("c.getAccountFields");
        var typeName = "Account";        
        
        var progressionfeildItagArr = component.get('v.progressionfeildItagList');
        progressionfeildItagArr = [];
        var objKeys = Object.keys(component.get('v.MAGlobalData'));      
        action.setParams({
            accType: component.get('v.MA_Type'),
            fieldSetName : 'CompanyWideMarketInfo'
        });
        action.setCallback(this, function(response) {
            console.log('Fieldset Result');
            var fields = response.getReturnValue();
            component.set("v.fieldSets", fields.fsetMemberMap);
            component.set("v.fieldsItag", fields.layoutFieldsItag);
            component.set("v.requiredFieldsItag", fields.requiredFieldsMap);
            component.set("v.readOnlyFieldsItag", fields.readOnlyFieldsMap);
            component.set("v.requiredFieldsItagMO", fields.requiredFieldsMapMO);
            component.set("v.readOnlyFieldsItagMO", fields.readOnlyFieldsMapMO);
            component.set("v.genReadOnlyFieldsMap", fields.genReadOnlyFieldsMap);
            component.set("v.medicalFieldsList", fields.medicalFieldsList);
            component.set("v.othersFieldsList", fields.othersFieldsList);
            component.set("v.possibleSalesStageValues", fields.possibleSaleStageList);
            component.set("v.possibleSalesMOStageValues", fields.possibleMOSaleStageList);
            component.set("v.initailValues", fields.intialSalesStageList);
            component.set("v.initailMOValues", fields.intialSalesStageMOList);
            component.set("v.clearValueMap", fields.clearValMap);
            component.set('v.isAdditionalInfo',fields.isAdditionalInfo);
            component.set("v.PreviousSelectedStage", fields.PreviousSelectedStage);
            component.set("v.CurrentSelectedStage", fields.CurrentSelectedStage);
            component.set("v.PreviousSelectedStageMO", fields.PreviousSelectedStageMO);
            component.set("v.CurrentSelectedStageMO", fields.CurrentSelectedStageMO);
            component.set("v.isDataServiceTrasaction",fields.isDataService);
            component.set("v.accountreadOnlyFieldsItag",fields.genReadOnlyFieldsMap);
            if(fields.dispostionValMap.disPositionItag != undefined || fields.dispostionValMap.disPositionItag != null){
                if(fields.dispostionValMap.disPositionItag.length>0){
                    component.set("v.DispositonItag", fields.dispostionValMap.disPositionItag[0]);
                }
            }
            component.set('v.possItag',fields.possItag);
            component.set("v.DispositonMap", fields.dispostionValMap);
            this.createDynamicComponent(component, event,'Product_Category');               	
        });
        $A.enqueueAction(action);
    }
})