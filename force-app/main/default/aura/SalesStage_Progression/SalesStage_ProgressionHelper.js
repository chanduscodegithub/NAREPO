({
    Prev:function(component, event,index,stageArray){
        var Current = index;
        var stageValue = '';
        var previousCount = 0;
        var hasPrevVal = false;
        if(Current == 0)
            stageValue = stageArray[Current];
        else
            stageValue = stageArray[Current];
        if(stageValue != null ){
            if(Current >= 2){
                previousCount = Current;
            }
            else{
                previousCount = 1;
            }
            if(Current == 0){
                hasPrevVal = false;
            }else{
                hasPrevVal = true;
            }
            component.set('v.previousCount',previousCount);
            component.set('v.hasPrevVal',hasPrevVal);  
        }
    },
    Next:function(component, event, helper){
        var Current = 0;
        if(Current == sav.length - 1)
            Current = 0
            else
                Current++;
    },
    saveSelectedSalesStage:function(component,event,sales_Stage_Name){
        console.log('save Progression Stage');
        var progressionFieldValue = '';
        var MACategory = component.get('v.oppCategory');
        var MAFeildValue = component.get('v.simpleRecord')[component.get('v.SalesStageItag')];
        component.set('v.MAFeildValue',MAFeildValue);
        var SelectedSalesStage = sales_Stage_Name;
        var intialStageValue = 'Inital_Selected_';
        var previousSalesStage = '';
        intialStageValue = intialStageValue+component.get('v.SalesStageItag');
        //var previousStageValue = 'Previous_Selected_';
        //previousStageValue = previousStageValue+component.get('v.SalesStageItag');
        var progressionFieldItag = 'Progression_';
        progressionFieldItag = progressionFieldItag+component.get('v.SalesStageItag');
        var clrSalesStageValue = 'isEmpty_'+component.get('v.SalesStageItag');
        var IntialValueObject = {};
        IntialValueObject = {'initalSaleStageItag':intialStageValue,
                             'selectedSalesStage':SelectedSalesStage,
                             'Category':MACategory,
                             'SalesStageItag':component.get('v.SalesStageItag'),
                            'clrSalesStageValue':clrSalesStageValue};
        var stageMap = component.get('v.saleStageIntialValueMap');
        if(stageMap == null){
            stageMap = {};            
        }       
        stageMap[intialStageValue] = IntialValueObject;        
        component.set('v.saleStageIntialValueMap',stageMap);
        if(MACategory == 'NB'){
            if(SelectedSalesStage.trim() == 'Notified'){
                previousSalesStage = component.get('v.MAFeildValue');
                if(component.get('v.MAFeildValue') == SelectedSalesStage){
                    previousSalesStage = component.get('v.previousSalesStage');
                }
                progressionFieldValue = 'NB'+' '+previousSalesStage+' '+SelectedSalesStage;
            }else{
                progressionFieldValue = 'NB'+' '+SelectedSalesStage;
            }
        }else if(MACategory == 'NBEA'){
            if(SelectedSalesStage.trim() == 'Notified' || SelectedSalesStage.trim() == 'Transfer In/Out'){
                previousSalesStage = component.get('v.MAFeildValue');
                if(component.get('v.MAFeildValue') == SelectedSalesStage){
                    previousSalesStage = component.get('v.previousSalesStage');
                }
                progressionFieldValue = 'NBEA'+' '+previousSalesStage+' '+SelectedSalesStage;
                //progressionFieldValue = 'NBEA'+' '+component.get('v.MAFeildValue')+' '+SelectedSalesStage;
            }else if(component.get('v.Intial_Stage_values')[0].trim() != '' || component.get('v.Intial_Stage_values')[0].trim() != null || component.get('v.Intial_Stage_values')[0].trim() != undefined){
                if(SelectedSalesStage != component.get('v.Intial_Stage_values')[0].trim()){
                    progressionFieldValue = 'NBEA'+' '+component.get('v.Intial_Stage_values')[0]+' '+SelectedSalesStage;
                }else{
                    progressionFieldValue = 'NBEA'+' '+SelectedSalesStage;
                }   
            }else if(component.get('v.MAFeildValue') == null || component.get('v.MAFeildValue') == ''){
                progressionFieldValue = 'NBEA'+' '+SelectedSalesStage;
            }
        }
        if(progressionFieldValue.includes('-')){
            progressionFieldValue = progressionFieldValue.replace(/-/g, '_');
        }
        if(progressionFieldValue.includes(' ')){
            progressionFieldValue = progressionFieldValue.replace(/ /g, '_');
        }
        component.get('v.simpleRecord')[progressionFieldItag] = progressionFieldValue;
        //component.get('v.simpleRecord')[previousStageValue] = SelectedSalesStage;
        //component.get('v.simpleRecord')[component.get('v.SalesStageItag')] = SelectedSalesStage;
        //component.get('v.simpleRecord')[component.get('v.fields.fieldPath')] = SelectedSalesStage;
        var cmpEvent = component.getEvent("makeFieldsEditable");
        cmpEvent.setParams({
            "isProgression":true,
            "sales_Stage_Name":sales_Stage_Name,
            "selectedITag":component.get('v.SalesStageItag'),
            "DispositionValue":progressionFieldValue+'_Gen_Disposition',
        });
        cmpEvent.fire();
    }
})