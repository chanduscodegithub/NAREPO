({
    handleRemoveOnly: function (cmp, event) {
        event.preventDefault();
        var selectedProductId = event.getParam('name');
        var selectedProducts = cmp.get('v.selectedProducts');
        var updatedSelectedProducts = [];
        for(var i = 0; i < selectedProducts.length ; i++){
            if(selectedProducts[i].uniqueprodCat != selectedProductId){
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
        var competitorSrchId = cmp.find('ProductSearchId');
        selectedProductId = selectedProductId.split('_');
        if(competitorSrchId != undefined && competitorSrchId != null){
            if(Array.isArray(competitorSrchId)) {
                for(var i=0; i< competitorSrchId.length; i++){
                    if(selectedProductId[1] == competitorSrchId[i].get('v.competitorList').Id){
                        competitorSrchId[i].deSelectCheckBox(false,selectedProductId[0]);
                        break;
                    }
                }
            }else{
                for(var j=0; j<selectedProducts.length; j++){
                    if(competitorSrchId.get('v.competitorList').Id == selectedProductId[1]){
                        competitorSrchId.deSelectCheckBox(false,selectedProductId[0]);
                    }
                }
            }
        }
        
        
    },
    productsSearchController: function(cmp,event,helper) {
        
        cmp.set('v.productType', cmp.get('v.Child_Data').productTypesValues);
        var selectedProductsLengthVal = cmp.get('v.selectedProductsLength');
        if(selectedProductsLengthVal != undefined && selectedProductsLengthVal != null && selectedProductsLengthVal > 0) {
           cmp.find('saveBtn').set("v.disabled",false); 
        } else {
           cmp.find('saveBtn').set("v.disabled",true);
        }
        /*if(cmp.get('v.Child_Data').productTypesValues == 'Medical_And_Other_Buy_Up') {
        	cmp.set('v.productType', 'Medical and Others');  
        } else {
            cmp.set('v.productType', cmp.get('v.Child_Data').productTypesValues);  
        }*/
        
    },
    addSelectedProducts : function(component, event, helper) {

        debugger;
        var isProductSelected = event.getParam("isProductSelected");
        var ProductList = event.getParam("ProductList");
        var selectedProducts = component.get('v.selectedProducts');
        var isFound = false;
        if(isProductSelected){
            for(var i = 0; i < selectedProducts.length; i++){
                if(selectedProducts[i].uniqueprodCat == ProductList.uniqueprodCat){
                    isFound = true;
                    break;
                }
            }
            
            if(!isFound){
                selectedProducts.push(ProductList);
                component.set('v.selectedProducts',selectedProducts);
                component.set('v.selectedProductsLength',selectedProducts.length);
            }
        }else{
            var updatedSelectedProducts = [];
            for(var i = 0; i < selectedProducts.length ; i++){
                if(selectedProducts[i].uniqueprodCat != ProductList.uniqueprodCat){
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
        
        var searchKeyText1 = component.find("Srch_By_cmp_Name").get('v.value');
        if(searchKeyText1 != undefined && searchKeyText1 != null && searchKeyText1.trim().length > 0) {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
        }else {
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
        
        if(event.getParams().keyCode == 13){                                           
            if(searchKeyText1 != undefined && searchKeyText1 != null && searchKeyText1.trim().length > 0) {
                component.set('v.isGoButtonClicked', true);
                helper.getProducts(component, event,1,component.get('v.selectedTab'),component.get('v.productType'));
            }            
        } 
        
    },
    clearBtn : function(component, event, helper) {
        component.find('goBtn').set("v.disabled",true);
        component.find("Srch_By_cmp_Name").set('v.value', '');
        component.find('goBtn').set("v.disabled",true);
        component.find('clrBtn').set("v.disabled",true);
        helper.getProducts(component,event,1,"Top_Tab",component.get('v.productType'));
    },
    clearSearchKeyValues : function(component, event, helper) {
        component.find("Srch_By_Prd_Des").set('v.value','');
        component.find("Srch_By_Prdu_Cate").set('v.value','');
    },
    searchProductsRecords : function(component, event, helper) {
        console.log('Go');
        component.set('v.isGoButtonClicked', true);
        helper.getProducts(component, event,1,component.get('v.selectedTab'),component.get('v.productType'));
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
            helper.getProducts(component, event,page,component.get('v.selectedTab'),component.get('v.productType'));
        }  
    },
    saveProducts:function(component, event, helper) {
        //helper.saveProd(component, event);
        //console.log('Save Compe');
        var compEvent = component.getEvent("productsAndCompetitorsPopUpEvent");         
        compEvent.setParams({
            "CompetitorsList" : component.get("v.selectedProducts"),
            "isCompetitor" : true
        });
        compEvent.fire(); 
    },
    tabChange: function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var selectedTab = selectedItem.dataset.record;
        component.set('v.selectedTab',selectedTab);
        var TabView = component.find("TabView").getElement().childNodes;
        for(var i=0; i<TabView.length; i++) {
            $A.util.removeClass(component.find(TabView[i].id), "slds-is-active");
        }
        $A.util.addClass(component.find(selectedTab), "slds-is-active");
        component.find("Srch_By_cmp_Name").set('v.value','');
        helper.selectedTabHelper(component, event,selectedTab);
    },
    cancelPopUp : function(component, event, helper) {
        var compEvent = component.getEvent("productsAndCompetitorsPopUpEvent");  
        compEvent.setParams({"isCancel":true});        
        compEvent.fire();
    }
})