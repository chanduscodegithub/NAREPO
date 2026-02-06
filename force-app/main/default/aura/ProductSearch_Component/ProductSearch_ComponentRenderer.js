({
    afterRender: function (component,event, helper) {
        let searchKey3 ='';
        if(component.get('v.isSurest')){
            if(component.find("Srch_By_Prdu_Surest_Cate").get('v.value')!=undefined)
            searchKey3 =component.find("Srch_By_Prdu_Surest_Cate").get('v.value');
        }
        this.superAfterRender();
        var childTabs = '';
        var ProductCategorylist = [];
        var ProductCategoryStr = '';
        var possibleSalesStageValues = component.get('v.possibleSaleStageValues');
        for(var i=0; i<possibleSalesStageValues.length; i++){
            ProductCategoryStr = possibleSalesStageValues[i];
            ProductCategoryStr = ProductCategoryStr+'_Tab';
            ProductCategorylist.push(ProductCategoryStr);
        }
        var TabView = component.find("TabView").getElement().childNodes;
        for(var i=0; i<TabView.length; i++) {
            $A.util.removeClass(component.find(TabView[i].id), "slds-is-active");
            for(var j=0; j<ProductCategorylist.length; j++){
                if(TabView[i].id == ProductCategorylist[j]){
                    var childTabs = component.find(TabView[i].id);
                    var childTabsSelected = component.find(TabView[0].id);
                    if(TabView.length >1){
                        $A.util.addClass(childTabsSelected, "slds-is-active");
                    }else{
                        $A.util.addClass(childTabs, "slds-is-active");
                    }
                    $A.util.removeClass(childTabs, "slds-hide");
                    $A.util.addClass(childTabs, "slds-show");
                }
            }            
        }
        component.set('v.selectedTab',possibleSalesStageValues[0]);
        var action = component.get("c.queryProducts");
        console.log('test Products');
        var selectedTab =component.get('v.selectedTab');
       
        action.setParams({
            searchKeyVal1 : component.find("Srch_By_Prd_Des").get('v.value'),
            searchKeyVal2 : component.find("Srch_By_Prdu_Cate").get('v.value'),
           	searchKeyVal3 : searchKey3,
            pageNumber : 1,
            ProductLine : selectedTab//component.get('v.selectedTab')
        });
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var productsListResponse = response.getReturnValue();
                if(productsListResponse.BuyupProductList!=null){
                    component.set('v.BuyupProductList',productsListResponse.BuyupProductList);
                }
                if(productsListResponse.FamilyPickList != null){
                    component.set('v.ProductCategoryValues',productsListResponse.FamilyPickList);
                }
                if(productsListResponse.surestList != null){
                    const index = productsListResponse.surestList.indexOf('Refer to Surest Pharmacy Product');
                    if (index > -1) { 
                        productsListResponse.surestList.splice(index, 1);
                    }
                    component.set('v.ProductSurestValues',productsListResponse.surestList);
                }
                if(productsListResponse.total == 0){
                    component.set('v.isProductEmpty',true);
                }else{
                    component.set('v.productsdata',productsListResponse.ProductList);
                    component.set('v.isProductEmpty',false);
                    var selectedProducts = component.get('v.selectedProducts');
                    if(selectedProducts.length >0){
                        var ProductSearchId = component.find('ProductSearchId');
                        for(var i=0; i<ProductSearchId.length; i++){
                            for(var j=0; j<selectedProducts.length; j++){
                                if(ProductSearchId[i].get('v.ProductsList').Id == selectedProducts[j].Id){
                                    ProductSearchId[i].deSelectCheckBox(true);
                                }
                            }
                            
                        }
                    }
                    
                }
                component.set("v.page", productsListResponse.page);
                component.set("v.total", productsListResponse.total);
                component.set("v.pages", Math.ceil(productsListResponse.total/productsListResponse.pageSize));
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
        //helper.getProducts(component, event,1,component.get('v.selectedTab'));
    },
})