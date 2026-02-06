({
    afterRender: function (component, helper) {
        this.superAfterRender();
        // interact with the DOM here
        console.log('Product_Category');
        var saleStageItag = '';
        var saleStageValue ='';
        var selectedProductTab = component.get('v.MAChildAttrObj').selectedProductTab;
        if(selectedProductTab.includes('Medical') && selectedProductTab.includes('Other')){
            component.set('v.isMedOth',true);
            if(selectedProductTab.includes('_')){
                selectedProductTab = selectedProductTab.split('_');
                for(var i=0; i<selectedProductTab.length; i++){
                    if(selectedProductTab[i].includes('Medical')){
                        saleStageItag = 'Sales_Stage_'+selectedProductTab[i]+'__c';
                        saleStageValue = component.get('v.MAChildAttrObj').MAGlobalData[saleStageItag];
                        component.set('v.salesStageItag',saleStageItag);
                        if(saleStageValue == null || saleStageValue ==''){
                            component.set('v.issalesStgEmt',true);
                        }
                    }else if(selectedProductTab[i].includes('Other')){
                        saleStageItag = 'Sales_Stage_'+selectedProductTab[i]+'__c';
                        saleStageValue = component.get('v.MAChildAttrObj').MAGlobalData[saleStageItag];
                        component.set('v.MedOthsalesStageItag',saleStageItag);
                        if(saleStageValue == null || saleStageValue ==''){
                            component.set('v.isMedOthsalesStgEmt',true);
                        }
                    }
                }
            }else{
                saleStageItag = 'Sales_Stage_'+selectedProductTab+'__c';;
                saleStageValue = component.get('v.MAChildAttrObj').MAGlobalData[saleStageItag];
                component.set('v.salesStageItag',saleStageItag);
                component.set('v.issalesStgEmt',saleStageValue);
            }
        }else{
            component.set('v.isMedOth',false);
            if(selectedProductTab.includes('_')){
                selectedProductTab = selectedProductTab.split('_');
                saleStageItag = 'Sales_Stage_'+selectedProductTab[0]+'__c';
                saleStageValue = component.get('v.MAChildAttrObj').MAGlobalData[saleStageItag];
                component.set('v.salesStageItag',saleStageItag);
                if(saleStageValue == null || saleStageValue ==''){
                    component.set('v.issalesStgEmt',true);
                }
            }else{
                saleStageItag = 'Sales_Stage_'+selectedProductTab+'__c';
                saleStageValue = component.get('v.MAChildAttrObj').MAGlobalData[saleStageItag];
                component.set('v.salesStageItag',saleStageItag);
                if(saleStageValue == null || saleStageValue ==''){
                    component.set('v.issalesStgEmt',true);
                }
            }
        }
    }
})