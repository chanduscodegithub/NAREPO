({
    doInit: function(component, event, helper) 
    {
        component.set("v.page",1);
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        $A.util.addClass(component.find("toggle1"), "slds-hide");
        helper.getOpportunityProductAndRenewalStatusRecords(component,event,helper,'',null,null,'',true);
    },
    
    handleSelection: function(component, event, helper) {
        var item = event.currentTarget;
        if (item && item.dataset) {
            var value = item.dataset.value;
            var selected = item.dataset.selected;
            
            var options = component.get("v.options_");
           
      		options.forEach(function(element) {  
              if (element.value == value && element.value != '') {
                  element.selected = selected == "true" ? false : true;
              }
      });
      component.set("v.options_", options);
      var values = helper.getSelectedValues(component);
      var labels = helper.getSelectedLabels(component);
           
      if(values.length>0){
             $A.util.removeClass(component.find('emptyProductVal'), 'slds-has-error')   
      }else{
          $A.util.addClass(component.find('emptyProductVal'), 'slds-has-error');
      }      
      
      helper.setInfoText(component,values);
      helper.despatchSelectChangeEvent(component,labels);
      
  }
    },
    
    pageChange: function(component, event, helper) 
    {
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        component.set("v.page",page)
        // helper.getOpportunityProductAndRenewalStatusRecords(component,event,helper);
        helper.getPageData(component,event,helper);
        
    },
    
    
    /*selectAllCheckbox: function(component, event, helper) 
    {
        var selectedHeaderCheck = event.getSource().get("v.value");
        var selectedRecordMap=component.get("v.selectedRecordMap");
        var opprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.opprtuntyPrdctAndRnwlStatusRcrdLst");
        var allOpprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst");
        var selectedRecordCount=component.get("v.selectedRecordCount");
        
        
        if(selectedHeaderCheck == true)
        {
            component.set("v.selectAllRecordTempVar",true);
            component.set("v.selectAllRecord",true);
            component.set("v.deSelectSome",false);
            
            
            for(var i=0;i<allOpprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                
                selectedRecordMap[allOpprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId]=true;
                
                
            }
            
            for(var j=0;j<opprtuntyPrdctAndRnwlStatusRcrdLst.length;j++){
                opprtuntyPrdctAndRnwlStatusRcrdLst[j].isChecked=true;
                selectedRecordCount++;
            }
            
            
            
        }
        if(selectedHeaderCheck == false)
        {
            
            
            component.set("v.selectAllRecordTempVar",false);
            component.set("v.selectAllRecord",false);
            component.set("v.deSelectSome",false);
            
            
            
            for(var i=0;i<opprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                opprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked=false; 
                selectedRecordCount--;
            }
            
            for(var j=0;j<allOpprtuntyPrdctAndRnwlStatusRcrdLst.length;j++){
                if(selectedRecordMap!= undefined && selectedRecordMap[allOpprtuntyPrdctAndRnwlStatusRcrdLst[j].recordId]!=undefined)
                {
                    delete selectedRecordMap[allOpprtuntyPrdctAndRnwlStatusRcrdLst[j].recordId];
                    
                }
            }
            
        }
        component.set("v.opprtuntyPrdctAndRnwlStatusRcrdLst",opprtuntyPrdctAndRnwlStatusRcrdLst);
        component.set("v.selectedRecordMap",selectedRecordMap);
        component.set("v.selectedRecordCount",selectedRecordCount);
        
    },*/
    
    /*salesIncentivesExportTableEventHandler: function(component, event, helper) 
    {
        var selectedRec = event.getParam("checkBoxValue");
        
        var opprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.opprtuntyPrdctAndRnwlStatusRcrdLst");
        
        var selectedRecordMap=component.get("v.selectedRecordMap");
        var selectedRecordCount=component.get("v.selectedRecordCount");
        
        if(selectedRec== false)
        {
            if(component.get("v.selectAllRecordTempVar")==true || component.get("v.deSelectSome")==true)       
            {
                component.set("v.deSelectSome",true);
                component.set("v.selectAllRecordTempVar",false);
            }
            for(var i=0;i<opprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                if(!opprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked)
                { 
                    if(selectedRecordMap!= undefined && selectedRecordMap[opprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId]!=undefined)
                    {
                        delete selectedRecordMap[opprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId];
                    }
                    
                }
                
            }
            selectedRecordCount--;
            
        }
        if(selectedRec== true)
        {
            selectedRecordCount++;
            for(var i=0;i<opprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                if(opprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked)
                {
                    selectedRecordMap[opprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId]=true;
                }
            }
            
        }
        
        
        if(selectedRecordCount == opprtuntyPrdctAndRnwlStatusRcrdLst.length)
        {
            component.set("v.selectAllRecordTempVar",true); 
        }
        
        
        
        
        component.set("v.selectedRecordMap",selectedRecordMap);
        component.set("v.selectedRecordCount",selectedRecordCount);
    },*/
    
    export : function(component, event, helper){
        
        var spinner = component.find("loadingSpinner");
        var idList=[];
        var selectedRecordMap = component.get("v.selectedRecordMap");
        var updateList = [];
        var recordListData=[];
        var recordItemList =  component.get('v.allOpprtuntyPrdctAndRnwlStatusRcrdExportLst');
        for(var key in selectedRecordMap)
        {
            var recordList = {};
            
            if(selectedRecordMap[key] == true)
            {
                idList.push(key);
                //var filteredRecord = recordItemList.filter(element => element.Id == key);
                //recordListData.push(filteredRecord[0]);
                recordList.Id = key;
                //recordList.Date_sent_to_ISI_Site__c = helper.currentDate(); 
                //recordList.Date_sent_to_ISI_Site__c = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString();
                recordList.Date_sent_to_ISI_Site__c = new Date().toISOString();
                updateList.push(recordList);
            }
            
        }
        component.set('v.updateList',updateList);
        component.set('v.idList',idList);
        if(idList.length== 0)
        {
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            helper.showToast('Select records to export');
            
        }
        /*else if(idList.length > 4000){
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            helper.showToast('Can\'t Export more than 4000 Records');
        }*/
        else
        {
            //helper.exportRecord(component, event, helper,idList,updateList);
            $A.util.removeClass(component.find("toggle1"), "slds-hide");
            
        }
        
        
    },
    cancel : function(component, event, helper){
        $A.util.addClass(component.find("toggle1"), "slds-hide");
    },
    

    
    print: function(component, event, helper) 
    {
    	$A.util.addClass(component.find("toggle1"), "slds-hide");
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
       // $A.util.addClass(component.find("toggle1"), "slds-hide");
        var updateList = component.get('v.updateList');
        var idList = component.get('v.idList');
        
        window.setTimeout(
                    $A.getCallback(function() {
                        helper.exportRecord(component, event, helper,idList,updateList);
                    }), 300
        );
       // helper.exportRecord(component, event, helper,idList,updateList);
      /*  var idList=[];
        var selectedRecordMap = component.get("v.selectedRecordMap");	
        var updateList = [];
        for(var key in selectedRecordMap)
        {
            var recordList = {};
            
            if(selectedRecordMap[key] == true)
            {
                idList.push(key);
                recordList.Id = key;
                //recordList.Date_sent_to_ISI_Site__c = helper.currentDate(); 
                recordList.Date_sent_to_ISI_Site__c = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString();
                updateList.push(recordList);
            }
            
        }
        if(idList.length== 0)
        {
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            helper.showToast('Select records to print');
            
        }else if(idList.length > 4000){
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            helper.showToast('Can\'t Export more than 4000 Records');
        }
        else
        {
            helper.exportRecord(component, event, helper,idList,updateList);
            
        } */
        
        
    },
    changeOnCategoryList : function(component, event, helper) {
        
        var selCategoryVal = component.find('CategoryDropDown').get('v.value');
        var oppProductLineArray = component.get('v.oppProductLineListOption');
        var renewalProductLineArray = component.get('v.renevalProductLineListOption');
        var emptyRecordArray = [];
        emptyRecordArray.push({label:'', value:''});
        component.set("v.options_",emptyRecordArray);
        
        if(selCategoryVal != '' && selCategoryVal != undefined && selCategoryVal != null){
            
            $A.util.removeClass(component.find('emptyselCategoryVal'), 'slds-has-error');
            if(selCategoryVal == 'NB' || selCategoryVal == 'NBEA' || selCategoryVal == 'NB and NBEA'){
                component.set("v.options_",oppProductLineArray);
            }else{
                component.set("v.options_",renewalProductLineArray);
            }
        }else{
            component.set("v.options_",emptyRecordArray);
        }
        
        var options = component.get("v.options_");
        options.forEach(function(element) {
              element.selected = false ;
      	});
      component.set("v.options_", options);
        
        /*var options = component.get("v.productLineListOption");
  			   options.sort(function compare(a,b) {
                  if (a.value == 'All'){
                    return -1;
                  }
                  else if (a.value < b.value){
                    return -1;
                  }
                  if (a.value > b.value){
                    return 1;
                  }
                  return 0;
                });*/
        
        
        var values = helper.getSelectedValues(component);
        helper.setInfoText(component,'');
        
        
    },
    
    handleClick: function(component, event, helper) {
        var mainDiv = component.find('main-div');
        $A.util.addClass(mainDiv, 'slds-is-open');
    },
        
    handleMouseLeave: function(component, event, helper) {
        component.set("v.dropdownOver",false);
        var mainDiv = component.find('main-div');
        $A.util.removeClass(mainDiv, 'slds-is-open');
    },
    
    handleMouseEnter: function(component, event, helper) {
        component.set("v.dropdownOver",true);
    },
    
    handleMouseOutButton: function(component, event, helper) {
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    //if dropdown over, user has hovered over the dropdown, so don't close.
                    if (component.get("v.dropdownOver")) {
                        return;
                    }
                    var mainDiv = component.find('main-div');
                    $A.util.removeClass(mainDiv, 'slds-is-open');
                }
            }), 200
        );
    },
    handleFilters : function (component, event, helper) {
        var selCategoryVal = component.find('CategoryDropDown').get('v.value');
        
        var isValidDate = helper.isValidDate(component.find('fromDate').get('v.value'));
        
        var fromDate = component.find('fromDate').get('v.value');
        var toDate = component.find('toDate').get('v.value');
        var productValues = helper.getSelectedValues(component);
        
        component.set("v.categoryTypeFilter",selCategoryVal);
        component.set("v.productFilter",productValues);
        component.set("v.fromDateFilter",fromDate);
        component.set("v.toDateFilter",toDate);
        
        if(selCategoryVal == ''){
            $A.util.addClass(component.find('emptyselCategoryVal'), 'slds-has-error');
            $A.util.addClass(component.find('emptyProductVal'), 'slds-has-error');
        }
        if(productValues == ''){
            $A.util.addClass(component.find('emptyProductVal'), 'slds-has-error');
        } else {
            $A.util.removeClass(component.find('emptyProductVal'), 'slds-has-error');
        }
        if(fromDate == undefined || fromDate == null || fromDate == "" || (!helper.isValidDate(fromDate) || !helper.isValidDate(toDate))){
            
            if(helper.isValidDate(fromDate) && helper.isValidDate(toDate)){
                $A.util.addClass(component.find('DateValidation'),'slds-hide');
            } else {
                $A.util.removeClass(component.find('DateValidation'),'slds-hide');
            }
            if(!helper.isValidDate(fromDate)){
                $A.util.addClass(component.find('emptyFromDateCheck'), 'slds-has-error');
            }else{
                $A.util.removeClass(component.find('emptyFromDateCheck'), 'slds-has-error');
            }
        }else{
             $A.util.removeClass(component.find('emptyFromDateCheck'), 'slds-has-error');
            $A.util.addClass(component.find('DateValidation'),'slds-hide');
            
        } 
        if(toDate == undefined || toDate == null || toDate == "" || (!helper.isValidDate(toDate) || !helper.isValidDate(fromDate))){
            if(helper.isValidDate(toDate) && helper.isValidDate(fromDate)){
                $A.util.addClass(component.find('DateValidation'),'slds-hide');
            } else {
                $A.util.removeClass(component.find('DateValidation'),'slds-hide');
             }
            
            if(!helper.isValidDate(toDate)){
                
                $A.util.addClass(component.find('emptyToDateCheck'), 'slds-has-error');
            }else{
                
               $A.util.removeClass(component.find('emptyToDateCheck'), 'slds-has-error');
            }
            
            
        }else{
             $A.util.removeClass(component.find('emptyToDateCheck'), 'slds-has-error');
            $A.util.addClass(component.find('DateValidation'),'slds-hide');
        }
        if(helper.checkFieldEmpty(selCategoryVal) && helper.checkFieldEmpty(fromDate) && helper.checkFieldEmpty(toDate) && helper.checkFieldEmpty(productValues) && helper.isValidDate(fromDate) && helper.isValidDate(toDate)){
            var spinner = component.find("loadingSpinner");
        	$A.util.removeClass(spinner, 'slds-hide');
        	$A.util.addClass(spinner, 'slds-show');
            component.set("v.selectAllRecordTempVar",false);
            helper.getOpportunityProductAndRenewalStatusRecords(component,event,helper,selCategoryVal,fromDate,toDate,productValues,false);
        }else{
            return false;
        }
        return true;
        
        
    },
    
    nullify : function(component, event, helper)
    {
        var setEmpty = component.find('fromDate');
        var setEmptytoDate = component.find('toDate');
        setEmpty.set('v.value', '');
        setEmptytoDate.set('v.value','');
    },
    
    dateFromDateSelected : function(component, event, helper)
    {
        var getFromDate = component.find('fromDate').get('v.value');
        var getToDate = component.find('toDate').get('v.value');
        if(getFromDate != null && getFromDate != ''){
            $A.util.removeClass(component.find('emptyFromDateCheck'), 'slds-has-error');
        } else{
            
        }
        if(getToDate != null && getToDate != ''){
            $A.util.removeClass(component.find('emptyToDateCheck'), 'slds-has-error');
        }
    	
    },
    
    selectAllCheckbox: function(component, event, helper) 
    {
         var selectedHeaderCheck = event.getSource().get("v.value");
        var selectedRecordMap=component.get("v.selectedRecordMap");
        var opprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.opprtuntyPrdctAndRnwlStatusRcrdLst");
        var allOpprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst");

        if(selectedHeaderCheck == true)
        {
            component.set("v.selectAllRecordTempVar",true);
            component.set("v.selectAllRecord",true);
            component.set("v.deSelectSome",false);
            
            
            for(var i=0;i<allOpprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                allOpprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked=true;
                selectedRecordMap[allOpprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId]=true;
                
                
            }
            
            /*for(var j=0;j<opprtuntyPrdctAndRnwlStatusRcrdLst.length;j++){
                opprtuntyPrdctAndRnwlStatusRcrdLst[j].isChecked=true;

            }*/
            
            component.set("v.selectedRecordCount",allOpprtuntyPrdctAndRnwlStatusRcrdLst.length);
            
        }
        if(selectedHeaderCheck == false)
        {
            
            
            component.set("v.selectAllRecordTempVar",false);
            component.set("v.selectAllRecord",false);
            component.set("v.deSelectSome",false);
            
            
            
            /*for(var i=0;i<opprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                opprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked=false; 

            }*/
            
            for(var j=0;j<allOpprtuntyPrdctAndRnwlStatusRcrdLst.length;j++){
                allOpprtuntyPrdctAndRnwlStatusRcrdLst[j].isChecked=false;
                selectedRecordMap[allOpprtuntyPrdctAndRnwlStatusRcrdLst[j].recordId]=false;
            }

            component.set("v.selectedRecordCount",0);
        }
        component.set("v.opprtuntyPrdctAndRnwlStatusRcrdLst",opprtuntyPrdctAndRnwlStatusRcrdLst);
        component.set("v.selectedRecordMap",selectedRecordMap);
        component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst",allOpprtuntyPrdctAndRnwlStatusRcrdLst);
  
    },
    
    /*salesIncentivesExportTableEventHandler: function(component, event, helper) 
    {
        var selectedRec = event.getParam("checkBoxValue");
        
        var opprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.opprtuntyPrdctAndRnwlStatusRcrdLst");
        
        var selectedRecordMap=component.get("v.selectedRecordMap");
        var selectedRecordCount=component.get("v.selectedRecordCount");
        var allOpprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst");
        
        if(selectedRec== false)
        {
            
            for(var i=0;i<opprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                if(!opprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked)
                { 
                    selectedRecordMap[opprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId]=false;
                    
                }
                
            }
            selectedRecordCount--;
            
        }
        if(selectedRec== true)
        {
            selectedRecordCount++;
            for(var i=0;i<opprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                if(opprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked)
                {
                    selectedRecordMap[opprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId]=true;
                }
            }
            
        }
        
        if(selectedRecordMap!=undefined)
        {
            for(var j in allOpprtuntyPrdctAndRnwlStatusRcrdLst)
            {
                for(var key in selectedRecordMap)
                {
                    if(key== allOpprtuntyPrdctAndRnwlStatusRcrdLst[j].recordId)
                    {
                        allOpprtuntyPrdctAndRnwlStatusRcrdLst[j].isChecked=selectedRecordMap[key];
                    }
                    
                    
                }
            }
        }
        
        
        
        
        if(selectedRecordCount == allOpprtuntyPrdctAndRnwlStatusRcrdLst.length)
        {
            component.set("v.selectAllRecordTempVar",true); 
        }
        else
        {
            component.set("v.selectAllRecordTempVar",false);
        }
        
        
        
        
        component.set("v.selectedRecordMap",selectedRecordMap);
        component.set("v.selectedRecordCount",selectedRecordCount);
        component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst",allOpprtuntyPrdctAndRnwlStatusRcrdLst);
    },*/
    
    salesIncentivesExportTableEventHandler: function(component, event, helper) 
    {
        var selectedRec = event.getParam("checkBoxValue");
        var recordID = event.getParam("recordID");
        
        var opprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.opprtuntyPrdctAndRnwlStatusRcrdLst");
        
        var selectedRecordMap=component.get("v.selectedRecordMap");
        var selectedRecordCount=component.get("v.selectedRecordCount");
        var allOpprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst");
        
        if(selectedRec== false)
        {
            
            /*for(var i=0;i<opprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                if(!opprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked)
                { 
                    selectedRecordMap[opprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId]=false;
                    
                }
                
            }*/
            selectedRecordMap[recordID]=false;
            selectedRecordCount--;
            
        }
        if(selectedRec== true)
        {
            selectedRecordCount++;
            selectedRecordMap[recordID]=true;
            /*for(var i=0;i<opprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                if(opprtuntyPrdctAndRnwlStatusRcrdLst[i].isChecked)
                {
                    selectedRecordMap[opprtuntyPrdctAndRnwlStatusRcrdLst[i].recordId]=true;
                }
            }*/
            
        }
        
        /*if(selectedRecordMap!=undefined)
        {
            for(var j in allOpprtuntyPrdctAndRnwlStatusRcrdLst)
            {
                for(var key in selectedRecordMap)
                {
                    if(key== allOpprtuntyPrdctAndRnwlStatusRcrdLst[j].recordId)
                    {
                        allOpprtuntyPrdctAndRnwlStatusRcrdLst[j].isChecked=selectedRecordMap[key];
                    }
                    
                    
                }
            }
        }*/
        
        
        
        
        if(selectedRecordCount == allOpprtuntyPrdctAndRnwlStatusRcrdLst.length)
        {
            component.set("v.selectAllRecordTempVar",true); 
        }
        else
        {
            component.set("v.selectAllRecordTempVar",false);
        }
        
        
        
        
        component.set("v.selectedRecordMap",selectedRecordMap);
        component.set("v.selectedRecordCount",selectedRecordCount);
        component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst",allOpprtuntyPrdctAndRnwlStatusRcrdLst);
    },

    
    
    
    
    
})