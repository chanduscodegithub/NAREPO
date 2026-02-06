({
    getProducts : function(cmp,event,page,selectedCategory) {
        let searchKey3 ='';
        if(cmp.get('v.isSurest')){
            if(cmp.find("Srch_By_Prdu_Surest_Cate").get('v.value')!=undefined)
                searchKey3 =cmp.find("Srch_By_Prdu_Surest_Cate").get('v.value');
        }
       
        var action = cmp.get("c.queryProducts"); 
        console.log('test Products');
        action.setParams({
            searchKeyVal1 : cmp.find("Srch_By_Prd_Des").get('v.value'),
            searchKeyVal2 : cmp.find("Srch_By_Prdu_Cate").get('v.value'),
            searchKeyVal3 : searchKey3,
            pageNumber : page,
            ProductLine : selectedCategory
        });
        var spinner = cmp.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var productsListResponse = response.getReturnValue();
                if(productsListResponse.BuyupProductList!=null){
                    cmp.set('v.BuyupProductList',productsListResponse.BuyupProductList);
                }
                if(productsListResponse.FamilyPickList != null){
                    cmp.set('v.ProductCategoryValues',productsListResponse.FamilyPickList);
                } if(productsListResponse.surestList != null){
                    const index = productsListResponse.surestList.indexOf('Refer to Surest Pharmacy Product');
                    if (index > -1) { 
                        productsListResponse.surestList.splice(index, 1);
                    }
                    cmp.set('v.ProductSurestValues',productsListResponse.surestList);
                }
                if(productsListResponse.total == 0){
                    cmp.set('v.isProductEmpty',true);
                }else{
                    cmp.set('v.productsdata',productsListResponse.ProductList);
                    console.log('productsListResponse.ProductList >> ', JSON.parse(JSON.stringify(productsListResponse.ProductList)));
                    cmp.set('v.isProductEmpty',false);
                    var selectedProducts = cmp.get('v.selectedProducts');
                    if(selectedProducts.length >0){
                        var ProductSearchId = cmp.find('ProductSearchId');
                        for(var i=0; i<ProductSearchId.length; i++){
                            for(var j=0; j<selectedProducts.length; j++){
                                if(ProductSearchId[i].get('v.ProductsList') != undefined){
                                    if(ProductSearchId[i].get('v.ProductsList').Id == selectedProducts[j].Id){
                                        ProductSearchId[i].deSelectCheckBox(true);
                                    }
                                }
                            }
                            
                        }
                    }
                    
                }
                cmp.set("v.page", productsListResponse.page);
                cmp.set("v.total", productsListResponse.total);
                cmp.set("v.pages", Math.ceil(productsListResponse.total/productsListResponse.pageSize));
                $A.util.addClass(spinner, "slds-hide");
            }
            else if (state === "INCOMPLETE") {
                
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
                }
        });
        $A.enqueueAction(action);
    },
    saveProd: function(component,event) {
        var action = component.get("c.createOppLineItm");
        action.setParams({
            oppId : component.get('v.recordId'),
            prod : component.get('v.selectedProducts')
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log(response);
            }
            else if (state === "INCOMPLETE") {
                
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
                }
        });
        $A.enqueueAction(action);
    },
    selectedTabHelper : function(component, event,selectedTab) {
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
            if(selectedTab == 'Medical_Tab'){
                component.set('v.isMedical',true);
            }else{
                component.set('v.isMedical',false);
            }
        }
        var selectedSplit  = selectedTab.split('_');
        component.set('v.selectedTab',selectedSplit[0]);
        if(selectedSplit[0]=='Other'){
            component.set('v.isSurest',true);
        }
        else{
            component.set('v.isSurest',false);
        }
        this.getProducts(component, event,1,component.get('v.selectedTab'));
    }
})