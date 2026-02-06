({
    handleRemoveOnly: function (cmp, event) {
        event.preventDefault();
        var selectedProductId = event.getParam('name');
        var selectedProducts = cmp.get('v.selectedProducts');
        var updatedSelectedProducts = [];
        for(var i = 0; i < selectedProducts.length ; i++){
            if(selectedProducts[i].Id != selectedProductId){
                updatedSelectedProducts.push(selectedProducts[i]);                    
            }
        }
        cmp.set('v.selectedProducts',updatedSelectedProducts);
        cmp.set('v.selectedProductsLength',updatedSelectedProducts.length);
        var selectedProductsLengthVal = cmp.get('v.selectedProductsLength');
        if(selectedProductsLengthVal != undefined && selectedProductsLengthVal != null && selectedProductsLengthVal > 0) {
            cmp.find('saveBtn').set("v.disabled",false); 
        } else {
            cmp.find('saveBtn').set("v.disabled",true);
        }
        var ProductSearchId = cmp.find('ProductSearchId');
        if(ProductSearchId != undefined){
            for(var i=0; i< ProductSearchId.length; i++){
                if(selectedProductId == ProductSearchId[i].get('v.ProductsList').Id){
                    ProductSearchId[i].deSelectCheckBox(false);
                    break;
                }
            }
        }
    },
    productsSearchController: function(cmp,event,helper){
        var selectedProductsLengthVal = cmp.get('v.selectedProductsLength');
        if(selectedProductsLengthVal != undefined && selectedProductsLengthVal != null && selectedProductsLengthVal > 0) {
            cmp.find('saveBtn').set("v.disabled",false); 
        } else {
            cmp.find('saveBtn').set("v.disabled",true);
        }
        console.log('child data');
        console.log(cmp.get('v.Child_Data'));
        var possibleSaleStageValues = [];
        var productTypesValues = cmp.get('v.Child_Data').productTypesValues;        
        if(productTypesValues.toLowerCase().indexOf("medical") >= 0){
            cmp.set('v.isMedical',true);
            cmp.set('v.isMedAndOther',true);
        }
        if(productTypesValues.toLowerCase().indexOf("medical") >= 0 && productTypesValues.toLowerCase().indexOf("other") >= 0){
            possibleSaleStageValues.push($A.get("$Label.c.Medical"));
            possibleSaleStageValues.push($A.get("$Label.c.Other_Buy_Up_Program"));
            cmp.set('v.isMedicalAndOther',true);
            cmp.set('v.isMedAndOther',true);
            
        }else if(productTypesValues.toLowerCase().indexOf("other") >= 0){
            possibleSaleStageValues.push($A.get("$Label.c.Other_Buy_Up_Program"));
            cmp.set('v.isSurest',true);
            cmp.set('v.prodLine',productTypesValues);
        }else{   
            possibleSaleStageValues.push(productTypesValues);
        }
        if(productTypesValues.toLowerCase().indexOf("dental") >= 0 || productTypesValues.toLowerCase().indexOf("vision") >= 0){
            cmp.set('v.isSurest',true);
            cmp.set('v.prodLine',productTypesValues);
        }
           
        cmp.set('v.possibleSaleStageValues',possibleSaleStageValues);
    },
    addSelectedProducts : function(component, event, helper) {
        var isProductSelected = event.getParam("isProductSelected");
        var ProductList = event.getParam("ProductList");
        var selectedProducts = component.get('v.selectedProducts');
        var selectedSurest = event.getParam("selectedSurest");
       
        ProductList.isReadonly =event.getParam("isReadonly");
        console.log('Veera'+event.getParam("isReadonly"));
        var isFound = false;
        if(isProductSelected){
            for(var i = 0; i < selectedProducts.length ; i++){
                if(selectedProducts[i].Id == ProductList.Id){
                    selectedProducts[i].Buyup_Product_Selection__c =selectedSurest;
                    isFound = true;
                    break;
                }
            }
            //ProductList.Buyup_Product_Selection__c =selectedSurest;
            if(!isFound){
                ProductList.Buyup_Product_Selection__c =selectedSurest;
                selectedProducts.push(ProductList);
                component.set('v.selectedProducts',selectedProducts);
                component.set('v.selectedProductsLength',selectedProducts.length);
            }
        }else{
            var updatedSelectedProducts = [];
            for(var i = 0; i < selectedProducts.length ; i++){
                if(selectedProducts[i].Id != ProductList.Id){
                    updatedSelectedProducts.push(selectedProducts[i]);                    
                }
            }
            component.set('v.selectedProducts',updatedSelectedProducts);
            component.set('v.selectedProductsLength',updatedSelectedProducts.length);
        }
        var selectedProductsLengthVal = component.get('v.selectedProductsLength');
        if(selectedProductsLengthVal != undefined && selectedProductsLengthVal != null && selectedProductsLengthVal > 0) {
            component.find('saveBtn').set("v.disabled",false); 
        } else {
            component.find('saveBtn').set("v.disabled",true);
        }
    },
    enableGoBtn : function(component, event, helper) {
        var searchKeyText1 = component.find("Srch_By_Prd_Des").get('v.value');
        var searchKeyText2 = component.find("Srch_By_Prdu_Cate").get('v.value');
        if(searchKeyText1 != undefined && searchKeyText1 != null && searchKeyText1.trim().length > 0 || searchKeyText2 != undefined && searchKeyText2 != null && searchKeyText2.trim().length > 0) {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
        }else {
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
        
        if(event.getParams().keyCode == 13){                                           
            if(searchKeyText1 != undefined && searchKeyText1 != null && searchKeyText1.trim().length > 0 || searchKeyText2 != undefined && searchKeyText2 != null && searchKeyText2.trim().length > 0) {
                component.set('v.isGoButtonClicked', true);
                helper.getProducts(component, event,1,component.get('v.selectedTab'));
            }            
        } 
        
    },
    clearSearchKeyValues : function(component, event, helper) {
        component.find("Srch_By_Prd_Des").set('v.value','');
        component.find("Srch_By_Prdu_Cate").set('v.value','');
        if(component.find("Srch_By_Prdu_Surest_Cate")!=undefined)
        component.find("Srch_By_Prdu_Surest_Cate").set('v.value','');
        component.find('goBtn').set("v.disabled",true);
        component.find('clrBtn').set("v.disabled",true);
        helper.getProducts(component, event,1,component.get('v.selectedTab'));
    },
    searchProductsRecords : function(component, event, helper) {
        component.set('v.isGoButtonClicked', true);
        helper.getProducts(component, event,1,component.get('v.selectedTab'));
    },
    pageChange: function(component, event, helper) {
        if(!event.getParam('ModalPagination')){
            var page = component.get("v.page") || 1;
            var direction = event.getParam("direction");
            page = direction === "previous" ? (page - 1) : (page + 1);
            setTimeout(function(){ 
                var focusInputField = component.find("focusInputField");
                $A.util.removeClass(focusInputField, 'slds-hide');            	 
                focusInputField.focus();
                $A.util.addClass(focusInputField, 'slds-hide');
                
            }, 600);
            helper.getProducts(component, event,page,component.get('v.selectedTab'));
        }  
    },
    saveProducts:function(component, event, helper) {
        var isOtherProdExists = false;
        var isMedicalProdExists = false;
        if(component.get('v.isMedicalAndOther')){
            var selectedProducts = component.get("v.selectedProducts");
            for(var i = 0; i < selectedProducts.length ; i++){
                if(selectedProducts[i].Product2.Product_Line__c == 'Other'){
                    if(!isOtherProdExists){
                        isOtherProdExists = true;
                        component.set('v.isOtherProdExists',true);
                    }    
                }else{
                    if(!isMedicalProdExists){
                        isMedicalProdExists = true;
                        component.set('v.isMedicalProdExists',true);
                    }
                }
            }
        }
        
        if(component.get('v.isMedicalAndOther') && (!component.get('v.isOtherProdExists') && component.get('v.isRemainder'))){
            component.set('v.isRemainder',false);
            var AddProductRemainder = component.find('AddProductRemainder');
            for(var i in AddProductRemainder){
                $A.util.addClass(AddProductRemainder[i], 'slds-show');
                $A.util.removeClass(AddProductRemainder[i], 'slds-hide');
            }
        }else{
            var compEvent = component.getEvent("ProductsToOpportunityProductEvents");         
            compEvent.setParams({
                "Products" : component.get("v.selectedProducts")
            });
            compEvent.fire();    
        }    
    },
    closeAlert: function(component, event, helper){
        var AddProductRemainder = component.find('AddProductRemainder');
        for(var i in AddProductRemainder){
            $A.util.removeClass(AddProductRemainder[i], 'slds-show');
            $A.util.addClass(AddProductRemainder[i], 'slds-hide');
        }
    },
    tabChange: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var selectedTab = selectedItem.dataset.record;
        component.find("Srch_By_Prdu_Cate").set('v.value','');
        helper.selectedTabHelper(component, event,selectedTab);
    },
    cancelPopUp : function(component, event, helper) {
        var compEvent = component.getEvent("ProductsToOpportunityProductEvents");  
        compEvent.setParams({"isCancel":true});        
        compEvent.fire();
    },
    onProCatChange : function(component, event, helper) {
        var selected = component.find("Srch_By_Prdu_Cate").get("v.value");
        component.find('goBtn').set("v.disabled",false);
        component.find('clrBtn').set("v.disabled",false);
    },
    
    onProSurestCatChange: function(component, event, helper) {
        var selected = component.find("Srch_By_Prdu_Surest_Cate").get("v.value");
        component.find('goBtn').set("v.disabled",false);
        component.find('clrBtn').set("v.disabled",false);
    }
})