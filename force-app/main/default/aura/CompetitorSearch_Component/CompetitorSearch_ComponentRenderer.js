({
    afterRender: function (cmp,event, helper) {
        this.superAfterRender();
        cmp.set('v.selectedTab',"Top_Tab");
        cmp.set('v.productType', cmp.get('v.Child_Data').productTypesValues);
        var action = cmp.get("c.queryProducts");
        console.log('selectedTab');
        action.setParams({
            "searchKeyVal1" : cmp.find("Srch_By_cmp_Name").get('v.value'),
            "pageNumber" : 1,           
            "selectedTab" : cmp.get('v.selectedTab'),
            "productLine" : cmp.get('v.productType')
        });
        var spinner = cmp.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('Inside Competitor Add');
            if (state === "SUCCESS") {
                var productsListResponse = response.getReturnValue();
                if(productsListResponse.total == 0){
                    cmp.set('v.isProductEmpty',true);
                }else{
                    cmp.set('v.productsdata',productsListResponse.ProductList);
                    cmp.set('v.isProductEmpty',false);
                    var competitorSrchId = cmp.find('ProductSearchId');
                    var selectedProducts = cmp.get('v.selectedProducts');
                    if(Array.isArray(competitorSrchId)) {
                        if(selectedProducts.length >0){  
                            for(var i=0; i<competitorSrchId.length; i++){
                                for(var j=0; j<selectedProducts.length; j++){
                                    if(competitorSrchId[i].get('v.competitorList') != undefined && selectedProducts[j] != undefined && 
                                       	 competitorSrchId[i].get('v.competitorList') != null && selectedProducts[j] != null && 
                                       		(competitorSrchId[i].get('v.competitorList').Id == selectedProducts[j].Id)){
                                        competitorSrchId[i].deSelectCheckBox(true,selectedProducts[j].prodCat);
                                    }
                                }
                                
                            }
                        }  
                    }else{
                        for(var j=0; j<selectedProducts.length; j++){
                            if(competitorSrchId.get('v.competitorList') != undefined && selectedProducts[j] != undefined &&
                               	competitorSrchId.get('v.competitorList') != null && selectedProducts[j] != null &&
                               		competitorSrchId.get('v.competitorList').Id == selectedProducts[j].Id){
                                competitorSrchId.deSelectCheckBox(true,selectedProducts[j].prodCat);
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
        //helper.getProducts(component, event,1,component.get('v.selectedTab'),component.get('v.productType'));
    },
})