({
    onProductSelect : function(component, event, helper) {
        console.log('onchange');
        var selectedProductId = component.find('selectedProductId');
        var prodDetails =component.get('v.ProductsList');
        if(selectedProductId.get('v.value')){
            if(prodDetails.Product2.Product_Line__c=='Other' || prodDetails.Product2.Product_Line__c=='Dental' || prodDetails.Product2.Product_Line__c=='Vision')
                if(component.get('v.value')=='' || component.get('v.value') ==undefined){
                    component.find('selectedProductId').set("v.value", false);
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title : 'Error',
                        message:'Product Selection should be entered for each Other Buy Up product.',
                        duration:' 500',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'dismissible'
                    });
                    toastEvent.fire();
                    return false;
                    
                }
        }
        var ProductSearchCompEvnt = component.getEvent("ProductSearchComp");
        ProductSearchCompEvnt.setParams({"isProductSelected": selectedProductId.get('v.value'),'ProductList':component.get('v.ProductsList'),
                                         'selectedSurest':component.get('v.value'),'isReadonly':component.get('v.isReadonly')});
        ProductSearchCompEvnt.fire();
    },
    handleProductType:function(component,event,helper){
        
        /*var selectedProductId = component.find('selectedProductId');
        var ProductSearchCompEvnt = component.getEvent("ProductSearchComp");
        ProductSearchCompEvnt.setParams({"isProductSelected": selectedProductId.get('v.value'),'ProductList':component.get('v.ProductsList'),
                                         'selectedSurest':component.get('v.value'),'isReadonly':component.get('v.isReadonly')});
        ProductSearchCompEvnt.fire();*/
    },
    removeSelectedValue : function(component, event, helper) {
        var params = event.getParam('arguments');
        var selectedProductId = component.find('selectedProductId');
        if (params) {
            selectedProductId.set('v.value',params.isProductsSelected);
        } 
    },
    doInit: function (component, event, helper) {
        var BuyupProductList =component.get('v.BuyupProductList');
        var options = [];//[{ value: "UNET/UMR Only", label: "UNET/UMR Only" },{ value: "Surest Only", label: "Surest Only" },{ value: "Both", label: "Both" }];
        for(var i=0;i<BuyupProductList.length;i++){
                options.push({value: BuyupProductList[i], label: BuyupProductList[i]})
        }
        component.set("v.options", options);
        var prodList =component.get('v.ProductsList');
        if(prodList.Product2.Surest_Applicable_Products__c!=undefined){
            if(prodList.Product2.Surest_Applicable_Products__c=='Not Available for Surest'){
                component.set('v.value','UNET or UMR Only');
                component.set('v.isReadonly',true);
            }
            if(prodList.Product2.Surest_Applicable_Products__c=='Available for Surest only'){
                component.set('v.value','Surest Only');
                component.set('v.isReadonly',true);
            }
            if(component.get('v.prodLine')=='Dental' || component.get('v.prodLine')=='Vision'){
                if(prodList.Product2.Surest_Applicable_Products__c=='Not Available for Surest'){
                component.set('v.value','UNET or UMR Only');
                component.set('v.isReadonly',true);
            }
            }
            if(prodList.Product2.Surest_Applicable_Products__c=='Available for Surest only with UNET'){
                options =[];
                for(var i=0;i<BuyupProductList.length;i++){
                    if(BuyupProductList[i]!='Surest Only')
                    options.push({value: BuyupProductList[i], label: BuyupProductList[i]})
                }
                //var options = [{ value: "UNET/UMR Only", label: "UNET/UMR Only" },{ value: "Both", label: "Both" }];
                component.set("v.options", options);
            }
        }
    },
});