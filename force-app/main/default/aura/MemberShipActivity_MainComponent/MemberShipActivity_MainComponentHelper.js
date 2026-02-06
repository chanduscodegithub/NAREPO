({
    selectTabHelper : function(component, event,selectedTab) {
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        var childTabs = '';
        var ProductCategoryComponent = '';
        var TabView = component.find("TabView").getElement().childNodes;
        for(var i=0; i<TabView.length; i++) {
            $A.util.removeClass(component.find(TabView[i].id), "slds-is-active");          
            if(TabView[i].id == selectedTab){
                childTabs = component.find(TabView[i].id);
                $A.util.addClass(childTabs, "slds-is-active");
            }
        }
        component.set('v.productCategoryName',selectedTab);
        ProductCategoryComponent = "Product_Category";
        component.set('v.productCategoryCmp',ProductCategoryComponent);
        this.getFeildSets_RelatedListData(component, event);    
    },
    selectedTabHelper : function(component, event,selectedTab,isCancel) {
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        var childTabs = '';
        var ProductCategoryComponent = '';
        var TabView = component.find("TabView").getElement().childNodes;
        for(var i=0; i<TabView.length; i++) {
            $A.util.removeClass(component.find(TabView[i].id), "slds-is-active");          
            if(TabView[i].id == selectedTab){
                childTabs = component.find(TabView[i].id);
                $A.util.addClass(childTabs, "slds-is-active");
            }
        }
        component.set('v.productCategoryName',selectedTab);
        ProductCategoryComponent = "Product_Category";
        component.set('v.productCategoryCmp',ProductCategoryComponent);
        if(component.get('v.isRefreshedMAData') || isCancel){
            this.getFeildSets_RelatedListData(component, event);  
        } else{
            var resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": "Saved",
                    "message": "The record was updated."
                });
                resultsToast.fire(); 
            component.find("MADataId").reloadRecord();
        }
    },
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
                                                   'genreadOnlyFieldsItag':component.get('v.genreadOnlyFieldsItag'),
                                                   'genreadOnlyFieldsItagMO':component.get('v.genreadOnlyFieldsItagMO'),
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
                                                   "isComments":component.get('v.isComments'),
                                                   "isProdCat":component.get('v.isProdCat'),
                                                   "isAdditionalInfo":component.get('v.isAdditionalInfo'),
                                                   "isAdditionalInfo2":component.get('v.isAdditionalInfo2'),
                                                   "accessObj":component.get("v.accessObj"),
                                                   "accessVal":component.get('v.accessVal'),
                                                   "possItag":component.get('v.possItag'),
                                                   "PreviousSelectedStage":component.get("v.PreviousSelectedStage"),
                                                   "CurrentSelectedStage":component.get("v.CurrentSelectedStage"),
                                                   "PreviousSelectedStageMO":component.get("v.PreviousSelectedStageMO"),
                                                   "CurrentSelectedStageMO":component.get("v.CurrentSelectedStageMO"),
                                                   "isDataServiceTrasaction":component.get("v.isDataServiceTrasaction"),
                                                   "isProdCat":component.get('v.isProdCat'),
                                                   "isProdCatLink":component.get('v.isProdCatLink'),
                                                   "maActivityType":component.get('v.maActivityType'),
                                                   "isReset":component.get('v.isReset')
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
        var spinner = component.find("mySpinner");
        var typeName = "Opportunity";        
        var possibleProgrssMap = '';
        var instStageMap = '';
        var possibleProgmap = {};
        var instStgmap = {};
        var selectedCategoryMap = {};
        var progressionfeildItagArr = component.get('v.progressionfeildItagList');
        progressionfeildItagArr = [];
        var objKeys = Object.keys(component.get('v.MAGlobalData'));
        for (var i = 0; i <objKeys.length; i++) {
            if(objKeys[i] != undefined){
                progressionfeildItagArr.push(objKeys[i]);
                var selectedProductTab = component.get('v.productCategoryName').split('_');
                if(component.get('v.productCategoryName').includes('Medical') && component.get('v.productCategoryName').includes('Other')){
                    for(var j=0; j<selectedProductTab.length; j++){ 
                        if(objKeys[i].includes('Inital_Selected_Sales_Stage_'+selectedProductTab[j]+'__c')){
                            instStageMap = component.get('v.MAGlobalData')[objKeys[i]];
                            if(instStageMap == null || instStageMap == undefined || instStageMap == ''){
                                instStgmap[selectedProductTab[j]] = '';
                            }else{
                                instStgmap[selectedProductTab[j]] = component.get('v.MAGlobalData')[objKeys[i]];
                            }
                        }
                    }
                }else{
                    var isOther = false;
                    var selectedCategory = component.get('v.productCategoryName');
                    if(component.get('v.productCategoryName').includes('Other')){
                        isOther = true;
                        selectedCategory ='Other';
                    }
                    if(objKeys[i].includes('Inital_Selected_Sales_Stage_'+selectedCategory+'__c')){
                        instStageMap = component.get('v.MAGlobalData')[objKeys[i]];
                        if(instStageMap == null || instStageMap == undefined || instStageMap == ''){
                            instStgmap[selectedCategory] = '';
                        }else{
                            instStgmap[selectedCategory] = component.get('v.MAGlobalData')[objKeys[i]];
                        }
                    }
                }
                if(component.get('v.productCategoryName').includes('Medical') && component.get('v.productCategoryName').includes('Other')){
                    for(var j=0; j<selectedProductTab.length; j++){
                        if(objKeys[i].includes('Progression_Sales_Stage_'+selectedProductTab[j]+'__c')){
                            possibleProgrssMap = component.get('v.MAGlobalData')[objKeys[i]];
                            if(possibleProgrssMap == null || possibleProgrssMap == undefined || possibleProgrssMap == ''){
                                possibleProgmap[selectedProductTab[j]] = component.get('v.MA_Type');
                                selectedCategoryMap[selectedProductTab[j]] = '';
                            }else{
                                possibleProgmap[selectedProductTab[j]] = possibleProgrssMap;
                                selectedCategoryMap[selectedProductTab[j]] = '';
                            }
                        }
                    }
                }else{
                    var selectedCategory = component.get('v.productCategoryName');
                    if(component.get('v.productCategoryName').includes('Other')){
                        isOther = true;
                        selectedCategory ='Other';
                    }
                    if(objKeys[i].includes('Progression_Sales_Stage_'+selectedCategory+'__c')){
                        possibleProgrssMap = component.get('v.MAGlobalData')[objKeys[i]];
                        if(possibleProgrssMap == null || possibleProgrssMap == undefined || possibleProgrssMap == ''){
                            possibleProgmap[selectedCategory] = component.get('v.MA_Type');
                            selectedCategoryMap[selectedCategory] = '';
                        }else{
                            possibleProgmap[selectedCategory] = possibleProgrssMap;
                            selectedCategoryMap[selectedCategory] = '';
                        }
                    }
                }
            }
            
        }
        component.set('v.selectedCategoryMap',selectedCategoryMap);
        var oppProductCatagory = component.get('v.productCategoryName');
        action.setParams({
            oppType: component.get('v.MA_Type'),
            oppProductCatagory: oppProductCatagory,
            typeName: typeName,
            selectedCategory:selectedCategoryMap,
            instStageMap:instStgmap,
            possibleProgrssMap:possibleProgmap,
            progressionfeildItagList:progressionfeildItagArr,
            reasonForOppRisk:component.get('v.MAGlobalData').Reason_for_the_Opportunity_Risk__c,
            isSystemAdmin:component.get('v.isSystemAdmin'),
            maActivityType:component.get('v.maActivityType')
        });
        action.setCallback(this, function(response) {
            console.log('Fieldset Result');
            var fields = response.getReturnValue();
            if(fields != null && fields != undefined && fields != ''){
                component.set('v.isRefreshedMAData',false);
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
                component.set("v.isComments", fields.isComments);
                component.set("v.PreviousSelectedStage", fields.PreviousSelectedStage);
                component.set("v.CurrentSelectedStage", fields.CurrentSelectedStage);
                component.set("v.PreviousSelectedStageMO", fields.PreviousSelectedStageMO);
                component.set("v.CurrentSelectedStageMO", fields.CurrentSelectedStageMO);
                component.set('v.genreadOnlyFieldsItag',fields.genReadOnlyFieldsMap);
                component.set('v.genreadOnlyFieldsItagMO',fields.genReadOnlyFieldsMapMO);
                component.set("v.isDataServiceTrasaction",fields.isDataService);
                component.set('v.isProdCat',fields.isProdCat);
                if(fields.dispostionValMap.disPositionItag != undefined || fields.dispostionValMap.disPositionItag != null){
                    if(fields.dispostionValMap.disPositionItag.length>0){
                        component.set("v.DispositonItag", fields.dispostionValMap.disPositionItag[0]);
                    }
                }
                component.set('v.possItag',fields.possItag);
                component.set("v.DispositonMap", fields.dispostionValMap);
                //this.handleMultiPickListEvent(component, event);
                this.createDynamicComponent(component, event,component.get('v.productCategoryCmp'));
            }else{
                component.set('v.queryError',true);
            }
        });
        console.log('before enque Action');
        $A.enqueueAction(action);
        console.log('After enque Action');
    },
    handleMultiPickListEvent : function(component, event) {
        var spinner = component.find("mySpinner");
        var ProductCategorylist = [];
        var ProductCategoryStr = '';
        var childTabs = '';
        var ProductCategoryres = [];
        var ProductCategoryComponent = '';
        var ProductCategory = component.get('v.MAGlobalData').Product_Type_Involved_in_Opp__c;
        component.set('v.oldProductCategory',ProductCategory);
        if(!(ProductCategory != null && ProductCategory.length > 0)){
            $A.util.addClass(spinner, "slds-hide");
            this.createDynamicComponent(component, event,'Product_Category');
            return;
        }
        var ProductCategoryres = ProductCategory.split(";");
        var medical_Exist = (ProductCategory.indexOf("Medical") > -1);
        var others_Exist = (ProductCategory.indexOf("Other") > -1);
        for(var i=0; i<ProductCategoryres.length; i++){
            if(!(medical_Exist && others_Exist && (ProductCategoryres[i] === 'Medical' || ProductCategoryres[i] === 'Other Buy Up Programs'))){
                ProductCategoryStr = ProductCategoryres[i];
                ProductCategoryStr = ProductCategoryStr.replace(/ /g, '_');
                ProductCategorylist.push(ProductCategoryStr);
            }else{
                if(medical_Exist && others_Exist){
                    ProductCategorylist.push('Medical_And_Other_Buy_Up');
                }
            }
        }
        
        var TabView = component.find("TabView").getElement().childNodes;
        for(var i=0; i<TabView.length; i++) {
            childTabs = component.find(TabView[i].id);
            $A.util.removeClass(component.find(TabView[i].id), "slds-is-active");
            $A.util.removeClass(childTabs, "slds-show");
            $A.util.addClass(childTabs, "slds-hide");
            for(var j=0; j<ProductCategorylist.length; j++){
                if(TabView[i].id == ProductCategorylist[0]){
                    $A.util.addClass(childTabs, "slds-is-active");
                    component.set('v.productCategoryName',TabView[i].id);
                }
                if(TabView[i].id == ProductCategorylist[j]){
                    $A.util.removeClass(childTabs, "slds-hide");
                    $A.util.addClass(childTabs, "slds-show");
                }
            }    
        }
        ProductCategoryComponent = "Product_Category";
        component.set('v.productCategoryCmp',ProductCategoryComponent);
        //this.createDynamicComponent(component, event,component.get('v.productCategoryCmp'));
        this.getFeildSets_RelatedListData(component, event);
    },
    refreshTabs : function(component, event, selectedTab, isTabDisable) {
        if(isTabDisable !== undefined){
            var TabView = component.find("TabView").getElement().childNodes;
            for(var i=0; i<TabView.length; i++) {
                $A.util.removeClass(component.find(TabView[i].id), "slds-is-active");
                $A.util.removeClass(component.find(TabView[i].id), "disabled-tab");
                $A.util.removeClass(component.find(TabView[i].id), "disabled-click");    
                if(isTabDisable === true){
                    $A.util.addClass(component.find(TabView[i].id), "disabled-tab"); 
                }                       
                if(TabView[i].id === selectedTab){
                    var childTabs = component.find(TabView[i].id);
                    $A.util.addClass(childTabs, "slds-is-active");
                    $A.util.removeClass(component.find(TabView[i].id), "disabled-tab");                   
                    if(isTabDisable === true){
                        $A.util.addClass(childTabs, "disabled-click");                                            
                    }else{
                        $A.util.removeClass(childTabs, "disabled-click");    
                    }                   
                }
            }
        }
    }
})