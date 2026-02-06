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
                                                   "isProdCat":component.get('v.isProdCat'),
                                                   "isComments":component.get('v.isComments'),
                                                   "isAdditionalInfo":component.get('v.isAdditionalInfo'),
                                                   "isAdditionalInfo2":component.get('v.isAdditionalInfo2'),
                                                   "accessObj":component.get("v.accessObj"),
                                                   "accessVal":component.get('v.accessVal'),
                                                   "possItag":component.get('v.possItag'),
                                                   "PreviousSelectedStage":component.get("v.PreviousSelectedStage"),
                                                   "CurrentSelectedStage":component.get("v.CurrentSelectedStage"),
                                                   "PreviousSelectedStageMO":component.get("v.PreviousSelectedStageMO"),
                                                   "CurrentSelectedStageMO":component.get("v.CurrentSelectedStageMO"),
                                                   "isDataServiceTrasaction":component.get("v.isDataServiceTrasaction")
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
        var action = component.get("c.getFields");
        var typeName = "Opportunity";        
        var possibleProgrssMap = '';
        var instStageMap = '';
        var possibleProgmap = {};
        var instStgmap = {};
        var selectedCategoryMap = {};
        var progressionfeildItagArr = component.get('v.progressionfeildItagList');
        progressionfeildItagArr = [];
        var objKeys = Object.keys(component.get('v.MAGlobalData'));
        component.set('v.selectedCategoryMap',selectedCategoryMap);
        action.setParams({
            oppType: component.get('v.MA_Type'),
            oppProductCatagory: 'AdditionalInfoCSAD',
            typeName: typeName,
            selectedCategory:selectedCategoryMap,
            instStageMap:instStgmap,
            possibleProgrssMap:possibleProgmap,
            progressionfeildItagList:progressionfeildItagArr,
            reasonForOppRisk:component.get('v.MAGlobalData').Reason_for_the_Opportunity_Risk__c
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
            component.set("v.medicalFieldsList", fields.medicalFieldsList);
            component.set("v.othersFieldsList", fields.othersFieldsList);
            component.set("v.possibleSalesStageValues", fields.possibleSaleStageList);
            component.set("v.possibleSalesMOStageValues", fields.possibleMOSaleStageList);
            component.set("v.initailValues", fields.intialSalesStageList);
            component.set("v.initailMOValues", fields.intialSalesStageMOList);
            component.set("v.clearValueMap", fields.clearValMap);
            component.set('v.isAdditionalInfo',fields.isAdditionalInfo);
            component.set('v.isAdditionalInfo2',fields.isAdditionalInfo2);
            component.set("v.PreviousSelectedStage", fields.PreviousSelectedStage);
            component.set("v.CurrentSelectedStage", fields.CurrentSelectedStage);
            component.set("v.PreviousSelectedStageMO", fields.PreviousSelectedStageMO);
            component.set("v.CurrentSelectedStageMO", fields.CurrentSelectedStageMO);
            component.set("v.isDataServiceTrasaction",fields.isDataService);
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