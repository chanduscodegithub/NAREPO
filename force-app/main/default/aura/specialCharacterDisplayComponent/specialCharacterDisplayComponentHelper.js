({
    queryAndDownloadCsv:function(component,event){
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        component.set('v.NoRecords','');
        var action = component.get("c.getApiNames"); 
        action.setParams({
            "objename" : component.get('v.objectName')
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                this.downloadCSV(component,event,response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    downloadCSV:function(component,event,responseData){
        var csvHeader = 'Id,FieldName,Value\n';
        var bodyString = '';
        var csv = '';
        if(responseData.genListData != null && responseData.genListData != '' && responseData.genListData != undefined){
            for(var i=0; i<responseData.genListData.length; i++){
                var value1 = responseData.genListData[i];
                for(var key in value1){
                    var value = value1[key].toString();
                    if(value != undefined && value != null && value != ''){
                        if(value.indexOf('ë')>-1 || value.indexOf('�')>-1  || value.indexOf('')>-1 || value.indexOf('î')>-1 || value.indexOf('‡')>-1 || value.indexOf('â')>-1 || value.indexOf('€™')>-1 || value.indexOf('€“')>-1 || value.indexOf('ü')>-1){
                            if(bodyString == ''){
                                bodyString = value1['Id']+','+key+','+value1[key]+'\n';
                            }else{
                                bodyString = bodyString+value1['Id']+','+key+','+value1[key]+'\n';
                            }
                        }
                    }
                }
            }
            var spinner = component.find("spinner");
            $A.util.addClass(spinner, 'slds-hide');
            $A.util.removeClass(spinner, 'slds-show');
            if(bodyString != '' && bodyString != undefined && bodyString != null){
                csv = csvHeader+bodyString;
                var hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/csv'+ encodeURI(csv);
                hiddenElement.target = '_blank';
                hiddenElement.download = 'SpecialCharacterFile.csv';
                hiddenElement.click();
            }else{
                component.set('v.NoRecords','NO Special Characters Found');
            }
        }
    }
})