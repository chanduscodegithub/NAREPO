({
    afterRender: function (component, helper) {
        this.superAfterRender();
        var spinner = component.find("mySpinner");                                    
        $A.util.addClass(spinner, "slds-hide"); 
        component.set('v.stageMap',{});
        //console.log('MA After Render');
        //component.set('v.prevGeneralSalesStage',component.get('v.simpleRecord')[component.get('v.SalesStageItag')]);
        component.set('v.generalSalesStage',component.get('v.simpleRecord')[component.get('v.SalesStageItag')]);
        if(component.get('v.isMedOth') && component.get('v.MedOthsalesStageItag').includes('Other')){
            component.set('v.otherSalesStage',component.get('v.simpleRecord')[component.get('v.MedOthsalesStageItag')]);
            //component.set('v.prevOtherSalesStage',component.get('v.simpleRecord')[component.get('v.MedOthsalesStageItag')]);
        }
        component.set('v.isPrdtsCmptrsLoadedFlag', true);
    }
})