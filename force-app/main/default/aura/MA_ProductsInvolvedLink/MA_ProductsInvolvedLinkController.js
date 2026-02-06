({
    doInit: function(component, event, helper) {
        helper.fetchPickListVal(component, 'Product_Type_Involved_in_Opp__c', 'updateMP');
    },
    onPicklistChange: function(component, event, helper) {
        var val= event.getParam("value");
        var selectedvalue = component.get("v.selected");
        var removedvalue = component.get("v.productTypeRemoved");
        component.find(event.getSource().getLocalId()).set("v.value", event.getParam("value"));
        component.set("v.selcted",val);
        console.log(val)
        var abc= '';
        for(var i = 0, size = val.length; i <= size ; i++){
            if(val.length > 0){
                var changeIt = component.find('changeIt');
                $A.util.addClass(changeIt, 'slds-button_brand');
            }
            if(abc != undefined || abc !='')
            {
                abc = abc+','+val[i]; 
            } else{
                abc = val[i];
            }           
            
        }
        console.log(abc);
        
        var selectedList;
        if(selectedvalue != null && selectedvalue != ''){
            var res = selectedvalue.split(";");
            selectedList = res; 
            for(var i=0;i<selectedList.length;i++)
                if(abc.includes(selectedList[i])){
                    
                }else{
                    var stringremoved = selectedList[i];
                    if(removedvalue != null && removedvalue == 'undefined' && removedvalue != ''){
                       removedvalue =  stringremoved;
                      removedvalue = removedvalue.replace('undefined,','');
                    }else{
                        
                       removedvalue = removedvalue+','+stringremoved;
                       removedvalue = removedvalue.replace('undefined,','');
                    }
                    
                    component.set("v.stringremoved",stringremoved);
                    component.set("v.productTypeRemoved",removedvalue);
                    var ErrorMessage = component.find('ErrorMessage');
                    for(var i in ErrorMessage){
                        $A.util.addClass(ErrorMessage[i], 'slds-show');
                        $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        i=selectedList.length+1;
                    }
                } 
        }
        console.log(val);
        
    },
    onpress : function(component, event, helper) {
      
        var selctedids = component.find('updateMP').get("v.value");
        var listToCompareChanges = component.get('v.listToCompareChanges');
        var compareit = listToCompareChanges[0];  
        console.log('listToCompareChanges  '+listToCompareChanges);
        console.log('selctedids  '+selctedids);
        var selectidsa ='';
        var finalSelectedValues = '';
        var ispickvalchanged = false;
        if(selctedids.length != 0){
            if(selctedids.length > 5){
                
                selctedids = selctedids.replace(/[  ]/g," ").split(";");
                var result = [];
                for(var i =0; i < selctedids.length ; i++){
                    
                    if(result.indexOf(selctedids[i]) == -1) result.push(selctedids[i]);
                }
                result=result.join(";"); 
                
                selctedids  = result.split(";");   
                console.log(selctedids+' ===>  selctedids'+ selctedids.length)
            }
            compareit = compareit.split(';');
           
            
                for(var i=0;i<compareit.length;i++){
                    var ispickvalchanged1 = false;
                    for(var j=0;j<selctedids.length;j++){
                        if(compareit[i] == (selctedids[j])){
                            ispickvalchanged1 = true;
                            break;
                        }
                    }
                    if(ispickvalchanged1 == false) {
                       component.set('v.isproductsInvolvedRemoved',false);
                        break;
                    }
                    
                }
               
                  ispickvalchanged  = component.get('v.isproductsInvolvedRemoved');
            for(var i=0;i<selctedids.length;i++){
                if(i==0){
                    finalSelectedValues =  selctedids[0]; 
                }else{
                    finalSelectedValues = finalSelectedValues+';'+selctedids[i];
                }  
            }
             /* for(var i=0;i<selctedids.length;i++){
                if(i==0){
                    finalSelectedValues =  selctedids[0]; 
                }else{
                    finalSelectedValues = finalSelectedValues+';'+selctedids[i];
                }  
            }*/
           console.log(finalSelectedValues+' ===> finalSelectedValues ')
          
            
            helper.saveme(component,'Product_Type_Involved_in_Opp__c',finalSelectedValues,ispickvalchanged);
        } else{
            var ErrorMessage = component.find('ErrorMessage1');
            for(var i in ErrorMessage){
                $A.util.addClass(ErrorMessage[i], 'slds-show');
                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                
            }
        }
        
        
    },
    showHidecomponent : function(component, event, helper) {
        var divId =  component.find('popup');
        $A.util.addClass(divId, 'slds-show');
        $A.util.removeClass(divId, 'slds-hide');
    },
    onpresscancel : function(component, event, helper) {
        var buttonId = component.find('popup');
        $A.util.addClass(buttonId, 'slds-hide');
        $A.util.removeClass(buttonId, 'slds-show');
        
    },
    onOk :  function(component, event, helper) {
        var str = component.get("v.selected");
        var str2 = component.get("v.selcted");
        // str2=str2.replace(',',';');
        var str3 = '';
        if(str2 != null || str2 != ''){
            str3 = str+';'+str2
        }
        str3= str3.replace(/,/g,' ');
        console.log(str3);
        str3 = str3.replace(/[  ]/g," ").split(";");
        var result = [];
        for(var i =0; i < str.length ; i++){
            
            if(result.indexOf(str3[i]) == -1) result.push(str3[i]);
        }
        result=result.join(";");
        component.find("updateMP").set("v.value",result);
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
        
    },
    closeErrorModal: function(component, event, helper){
        var removedString = component.get("v.stringremoved");
        
        var selected = component.get("v.selected");
        var sel ='';
        console.log(selected+' in close error modal');
        
        sel = selected.replace(removedString,'');
        
        component.set("v.selected",sel);
        var selctedids = component.find('updateMP').get("v.value");
        var SelectIdsString  = '';
        for(var i=0;i<selctedids.length;i++){
            if(i==0){
                SelectIdsString =  selctedids[0];
            }else{
                SelectIdsString = SelectIdsString+';'+selctedids[i];
            }
        }
        
        var string='';
        for(var i=0;i<selctedids.length;i++){
            if(string != ''){
                string =  string+';'+selctedids[i];  
            }else{
                string = selctedids[i];
            }
            
        }string = string.replace(/[ ]/g," ").split(";");
        var result = [];
        for(var i =0; i < string.length ; i++){
            if(result.indexOf(string[i]) == -1) result.push(string[i]);
        }
        result=result.join(";");
        var ErrorMessage = component.find('ErrorMessage');
        console.log('Hello');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
        
    },
    refreshTaba : function(component, event, helper) {
        $A.get('e.force:refreshView').fire(); 
    },
    closeErrorPopup : function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage1');
        console.log('Hello');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
        
    }
    
})