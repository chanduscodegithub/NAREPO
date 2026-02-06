({
    doInit : function(component, event, helper) {
        debugger;
        var competitor = component.get('v.competitorList');
        var productType = component.get('v.productType');
        if(productType != 'Medical and Others'){
            if(competitor.Product_Types_Offered__c){
                var prdTypes = competitor.Product_Types_Offered__c.split(';');
                for(var i=0; i<prdTypes.length; i++){
                    if(prdTypes[i] == productType){
                        component.set('v.otherEnable',false);
                        break;
                    }
                }
            }
        }else if(competitor.Product_Types_Offered__c){
            var prdTypes = competitor.Product_Types_Offered__c.split(';');
            for(var i=0; i<prdTypes.length; i++){
                if(prdTypes[i] === 'Medical'){
                    component.set('v.medicalEnable',false);
                }else if(prdTypes[i] === 'Other Buy Up'){
                    component.set('v.othersEnable',false);
                }
            }
        }
    },
    onProductSelect : function(component, event, helper) {
        console.log('onchange');
        debugger;
        var id = event.getSource().getLocalId();
        console.log('id-'+id);
        var selectedPrd = component.find(id).get("v.name");
        var selectedProductId = component.find(id); 
        var competitorList = component.get('v.competitorList');
        var uniqueselectedPrd = selectedPrd+'_'+component.get('v.competitorList').Id;
        competitorList.uniqueprodCat = uniqueselectedPrd;
        competitorList.prodCat = selectedPrd;
        console.log('competitorList-'+competitorList);
        component.set('v.competitorList',competitorList);
        component.set('v.competitorList',competitorList);
        var compitiorDataArr = {};
        for(var i in competitorList){
            compitiorDataArr[i] = competitorList[i];
            }
        compitiorDataArr.uniqueprodCat = uniqueselectedPrd;
        compitiorDataArr.prodCat = selectedPrd;
        var ProductSearchCompEvnt = component.getEvent("ProductSearchComp");
        ProductSearchCompEvnt.setParams({"isProductSelected": selectedProductId.get('v.value'),'ProductList':compitiorDataArr});
        ProductSearchCompEvnt.fire();
    },
    removeSelectedValue : function(component, event, helper) {
        var params = event.getParam('arguments');
        debugger;
        console.log("Inside removeSelectedValue ");
        if(component.get('v.productType') == "Medical and Others"){
            var medProductId = component.find('selectedProductIdMed');
            var othProductId = component.find('selectedProductIdOth');
            if (params) {
               
                if(params.prodCat == "Medical"){
                    medProductId.set('v.value',params.isProductsSelected);
                }else{
                    othProductId.set('v.value',params.isProductsSelected);
                }
            } 
        }else{
            if (params) {
                var selectedProductId = component.find('selectedProductId');
                selectedProductId.set('v.value',params.isProductsSelected);
            } 
        }
    }
})