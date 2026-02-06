({
    getOpps: function(component, event, helper){
        
        helper.displayOpportunities(component, event);
        /*  var action = cmp.get("c.generateXMLFiles");
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log(state);
            if (state === "SUCCESS") {
                var data = response.getReturnValue();
                var index = data.length;
                console.log(data);
                cmp.set("v.index",index)
                cmp.set("v.opportunities", data);
                
                if(data == null){
                    cmp.set("v.alertme",'No Record To Display')
                }
            }
        });
        $A.enqueueAction(action);*/
    },
    addSelectedRefAccounts : function(component, event, helper){
        var selectedrefoppt = component.get('v.selectedrefoppt');
        var checkBoxCount = component.get('v.checkBoxCount');
        
        if(event.getParam('selectedrefoppt')){            
            selectedrefoppt = selectedrefoppt.filter(function(e){ return e !== event.getParam('oppId') });
            checkBoxCount = checkBoxCount - 1;
        }else{
            selectedrefoppt.push(event.getParam('oppId'));
            checkBoxCount = checkBoxCount +1;
        }
        component.set('v.checkBoxCount',checkBoxCount);
        /* if(checkBoxCount == 0){            
            saveRefAcc.set("v.disabled",true);                
        }else{                        
            saveRefAcc.set("v.disabled",false);
        }*/
        component.set('v.selectedrefoppt',selectedrefoppt);
        if(checkBoxCount > 0 )
        {
          var generateXML = component.find('generateXML');
            $A.util.removeClass(generateXML, 'slds-hide');
            $A.util.addClass(generateXML, 'slds-show'); 
        } 
        else{
            var generateXML = component.find('generateXML');
            $A.util.removeClass(generateXML, 'slds-show');
            $A.util.addClass(generateXML, 'slds-hide');
        }
        
    },
    generateXML :  function(component, event, helper){
        component.set('v.isSpinnertoLoad', true);
        var selectedOpportunityList = component.get('v.selectedrefoppt');
        
        console.log('selectedOpportunityList'+selectedOpportunityList);
        //component.set('v.isSpinnertoLoad', true);
        var action = component.get('c.generateXMLFile');	
        //alert('template Name '+component.find('objType').get('v.value'));
        // var templateName = component.find('objType').get('v.value');
        action.setParams({
            "SelectedId" : selectedOpportunityList,
            "maType": "CDType"
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log(state);
            if (state === "SUCCESS") {
                console.log('success******');
                var responseResult = response.getReturnValue(); 
                
                // var responseResult = JSON.stringify(responseResul);
                console.log('responseResult >>> '+responseResult);
                if(responseResult != null){ 
                    var zip = new JSZip();
                    var folderName =  zip.folder("MembershipActivity");
                    for (var key in responseResult) {
                        // check if the property/key is defined in the object itself, not in parent
                        if (responseResult.hasOwnProperty(key)) {           
                            console.log(key, responseResult[key]);
                            
                            folderName.file(key+".xml",responseResult[key] );
                        }
                    }
                    /*     for(var i=0;i<=responseResult.length;i++){
                    if(responseResult[i] != null){
                        if(i==0){
                            myvariable =  responseResult[0];
                            folderName.file("Stepwise"+[i]+".xml",myvariable );
                        }
                        else{
                            
                            // console.log(responseResult);
                            var myvariable = responseResult[i];
                            folderName.file("Stepwise"+[i]+".xml",myvariable );
                        }   }                             
                }*/
                    // var zip = new JSZip();
                    
                    //folderName.remove("Stepwise"+[0]+".xml",'myvariable');                
                    
                    /*zip.generateAsync({type:"base64"}).then(function (content) {
                        // content = zip.generate();
                        // location.href="data:application/zip;base64," + content;
                        location.href="data:application/zip;base64," + content;
                    });*/
                    zip.generateAsync({type : "blob"}).then(function(blob) {
                    // Force down of the Zip file
                    saveAs(blob, "MembershipActivity.zip");
                });
                    component.set('v.selectedrefoppt',[]);
                    component.set('v.isSpinnertoLoad', false);
                    component.set('v.dialogErrorMsg', 'Success !!!');
                    var errorDailog = component.find('downLoadSuccess');
                } 
                
                for(var i in errorDailog){
                    $A.util.removeClass(errorDailog[i], 'slds-hide');
                    $A.util.addClass(errorDailog[i], 'slds-show');
                }
                debugger;
                helper.displayOpportunities(component, event); 
                  // $A.get('e.force:refreshView').fire();
                
            }
          
        }); 
           
        $A.enqueueAction(action);
        
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    closeErrorMsg: function(component, event, helper) {
        var errorDailog = component.find('FilterSearch');
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-show');
            $A.util.addClass(errorDailog[i], 'slds-hide');
        }
    },
    
    closeErrorMsg1: function(component, event, helper) {
        var errorDailog = component.find('downLoadSuccess');
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-show');
            $A.util.addClass(errorDailog[i], 'slds-hide');
        }
    },
     pageChange: function(component, event, helper) {
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.displayOpportunities(component,event,page);
    }
    
    
})