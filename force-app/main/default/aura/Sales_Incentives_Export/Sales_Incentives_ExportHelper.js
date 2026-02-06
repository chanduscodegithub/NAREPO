({
    getOpportunityProductAndRenewalStatusRecords : function(component, event, helper, selCategoryVal, fromDate, toDate, productValues,isPageOnLoad) 
    {
        var spinner = component.find("loadingSpinner");
        
        var page=component.get("v.page");
        page = page || 1;
        
        var getOpprtuntyPrductAndRnwlStatusRcrdsAction = component.get("c.getOpprtntyPrdctAndRnwlStatusRecords");
        getOpprtuntyPrductAndRnwlStatusRcrdsAction.setParams({
            "pageNumber":page,
            'selCategoryVal':selCategoryVal,
            'fromDate':fromDate,
            'toDate':toDate,
            'productValues':productValues
            
        });
        getOpprtuntyPrductAndRnwlStatusRcrdsAction.setCallback(this, function(response){
            var state = response.getState();
            component.set('v.selectedRecordMap',{});
            if (state === "SUCCESS") {
                
                console.log(response.getReturnValue());
                
                var oprtntyPrdctAndRnwlStatusData  = response.getReturnValue();
                component.set('v.totalNumberofRecords',oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst.length);
                component.set("v.selectedRecordCount",0);
                component.set("v.loggedInUserTimeZone",oprtntyPrdctAndRnwlStatusData.loggedInUserTimeZone);
                //var oppProductLineList = oprtntyPrdctAndRnwlStatusData.pckLstMap.oppProductLine;
                var oppProductLineList = $A.get("$Label.c.Export_OppLine_Picklist");
                //var allCategoryList = oprtntyPrdctAndRnwlStatusData.pckLstMap.Category__c;
                var renewalProductLineList = oprtntyPrdctAndRnwlStatusData.pckLstMap.renewalProductLine;
                
                var allProductLineArray = [];
                var allCategoryArray = [];
                var renewalProductLineArray = [];
                var oppRevProductLineArray = [];
                //allProductLineList.sort();
                // allCategoryList.sort();
                //oppProductLineList.sort();
                //renewalProductLineList.sort();
                
                
                if(isPageOnLoad){
                    
                    /*if(allCategoryList != '' && allCategoryList != undefined && allCategoryList != null && allCategoryList.length > 0){
                  for(var i in allCategoryList){
                     allCategoryArray.push({label:allCategoryList[i], value:allCategoryList[i]});
                  }  
                }*/
                    allCategoryArray.push({label:'', value:''});
                    allCategoryArray.push({label:'NB', value:'NB'});
                    allCategoryArray.push({label:'NBEA', value:'NBEA'});
                    allCategoryArray.push({label:'NB and NBEA', value:'NB and NBEA'});
                    allCategoryArray.push({label:'Renewal', value:'Renewal'});
                    
                    if(oppProductLineList != '' && oppProductLineList != undefined && oppProductLineList != null && oppProductLineList.length > 0){
                        var oppProductLineListArray = oppProductLineList.split(',');
                        for(var i in oppProductLineListArray){
                            oppRevProductLineArray.push({label:oppProductLineListArray[i], value:oppProductLineListArray[i]});
                        }  
                    }
                    
                    if(renewalProductLineList != '' && renewalProductLineList != undefined && renewalProductLineList != null && renewalProductLineList.length > 0){
                        for(var i in renewalProductLineList){
                            //if(renewalProductLineList[i] != "Medical" && renewalProductLineList[i] != "Financial Protection"){
                            if(renewalProductLineList[i] != "Medical"){
                                renewalProductLineArray.push({label:renewalProductLineList[i], value:renewalProductLineList[i]});
                            }
                        }  
                    }
                    
                    
                    
                    
                    component.set("v.oppProductLineListOption",oppRevProductLineArray);
                    component.set("v.renevalProductLineListOption",renewalProductLineArray);
                    component.set("v.categoryTypeListOption",allCategoryArray);
                    
                    component.find('CategoryDropDown').set("v.options", allCategoryArray);
                }
                
                if(!isPageOnLoad){
                    
                    
                    if(oprtntyPrdctAndRnwlStatusData!= null)
                    {
                        if(oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst != null && oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst.length != 0)
                        {
                            component.set("v.isOpprtuntyPrdctAndRnwlStatusRcrdLstEmpty",false); 
                            
                            component.set("v.total", oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst.length);
                            component.set("v.pages", Math.ceil(oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst.length/component.get("v.pageSize")));
                            
                            var allOpprtuntyPrdctAndRnwlStatusRcrdLst=oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst;
                            component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst",oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst);
                            
                            if(oprtntyPrdctAndRnwlStatusData.oppProductLineItemList != '' && oprtntyPrdctAndRnwlStatusData.oppProductLineItemList != undefined && oprtntyPrdctAndRnwlStatusData.oppProductLineItemList != null){
                                component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdExportLst",oprtntyPrdctAndRnwlStatusData.oppProductLineItemList);
                            }else if(oprtntyPrdctAndRnwlStatusData.renewalItemList != '' && oprtntyPrdctAndRnwlStatusData.renewalItemList != undefined && oprtntyPrdctAndRnwlStatusData.renewalItemList != null){
                                component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdExportLst",oprtntyPrdctAndRnwlStatusData.renewalItemList);
                            }
                            
                            var opprtuntyPrdctAndRnwlStatusRcrdLst=[];
                            if(component.get("v.pages")>1)
                            {
                                for(var i=0;i<component.get("v.pageSize");i++)
                                {
                                    opprtuntyPrdctAndRnwlStatusRcrdLst.push(allOpprtuntyPrdctAndRnwlStatusRcrdLst[i]); 
                                }
                            }
                            else
                            {
                                for(var i in allOpprtuntyPrdctAndRnwlStatusRcrdLst)
                                {
                                    opprtuntyPrdctAndRnwlStatusRcrdLst.push(allOpprtuntyPrdctAndRnwlStatusRcrdLst[i]); 
                                }
                                
                            }
                            component.set("v.page", 1);
                            component.set("v.opprtuntyPrdctAndRnwlStatusRcrdLst", opprtuntyPrdctAndRnwlStatusRcrdLst); 
                            var recordSerialNo=0;
                            component.set("v.recordSerialNo",recordSerialNo);
                        }
                        else
                        {
                            component.set("v.isOpprtuntyPrdctAndRnwlStatusRcrdLstEmpty",true);
                            component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdExportLst", []);
                            component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst",[]);
                            component.set("v.opprtuntyPrdctAndRnwlStatusRcrdLst", []);
                            component.set("v.total", 0);
                            component.set("v.pages", 0);
                        }
                        
                    }
                }else{
                    component.set("v.isOpprtuntyPrdctAndRnwlStatusRcrdLstEmpty",true);
                    component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdExportLst", []);
                    component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst",[]);
                    component.set("v.opprtuntyPrdctAndRnwlStatusRcrdLst", []);
                    component.set("v.total", 0);
                    component.set("v.pages", 0);
                }
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(getOpprtuntyPrductAndRnwlStatusRcrdsAction);
    },
    
    getPageData: function(component, event, helper) 
    {
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var pageNumber=component.get("v.page");
        var pageSize=component.get("v.pageSize");
        var offset = (pageNumber - 1) * pageSize;
        
        var allOpprtuntyPrdctAndRnwlStatusRcrdLst=component.get("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst");
        
        var opprtuntyPrdctAndRnwlStatusRcrdLst=[];
        if(component.get("v.page")<component.get("v.pages"))
        {
            var count=0;
            for(var i=offset;count<pageSize;i++)
            {
                opprtuntyPrdctAndRnwlStatusRcrdLst.push(allOpprtuntyPrdctAndRnwlStatusRcrdLst[i]);
                count++;
            }
        }
        else
        {
            for(var i=offset;i<allOpprtuntyPrdctAndRnwlStatusRcrdLst.length;i++)
            {
                opprtuntyPrdctAndRnwlStatusRcrdLst.push(allOpprtuntyPrdctAndRnwlStatusRcrdLst[i]); 
            }
            
        }
        component.set("v.opprtuntyPrdctAndRnwlStatusRcrdLst", opprtuntyPrdctAndRnwlStatusRcrdLst); 
        component.set("v.recordSerialNo",offset);
        
        
        var selectedRecordMap=component.get("v.selectedRecordMap");
        var countc=0;
        //component.set("v.selectAllRecord",false);
        //component.set("v.selectAllRecordTempVar",false);
        //component.set("v.deSelectSome",false);
        //component.set("v.selectedRecordCount","0");
        
        /*if(selectedRecordMap!=undefined)
        {                    
            for(var k=0;k<opprtuntyPrdctAndRnwlStatusRcrdLst.length;k++)
            {
                if(selectedRecordMap[opprtuntyPrdctAndRnwlStatusRcrdLst[k].recordId]!=undefined)
                {
                    opprtuntyPrdctAndRnwlStatusRcrdLst[k].isChecked=true;
                    countc++;
                }
                
            }
        }*/
        /*if(countc==opprtuntyPrdctAndRnwlStatusRcrdLst.length)
        {
            component.set("v.selectAllRecordTempVar",true);
        }
        
        component.set("v.selectedRecordCount",countc);*/
        
        /*if(component.get("v.selectAllRecordTempVar")==false)
        {
            if(component.get("v.selectedRecordCount") == allOpprtuntyPrdctAndRnwlStatusRcrdLst.length)
            {
                component.set("v.selectAllRecordTempVar",true); 
            }
            else
            {
                component.set("v.selectAllRecordTempVar",false);
            }
        }*/
        
        
        $A.util.removeClass(spinner, 'slds-show');
        $A.util.addClass(spinner, 'slds-hide');
        
    },
    
    showToast : function(reponseMessage,title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": reponseMessage
        });
        toastEvent.fire();
    },
    
    /*exportRecord: function(component, event, helper,idList,updateList){
        //event.stopPropagation();
       // var recordType = component.find('CategoryDropDown').get('v.value'); 
        var recordType = component.get("v.categoryType"); 
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var generateAction = component.get('c.getOpprtntyPrdctAndRnwlStatusRecordsToExport');
        generateAction.setParams({
            
            "idList":idList,
            'recordType': recordType
        });
        component.set('v.ErrorMessage','');
        generateAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                
                var oppProductLineItemList = responseData.opportunityLineItemList;
                var recordList=[];
                for(var i = 0; i<3000; i++){
                    
                    recordList.push(oppProductLineItemList[0]);
                }
                helper.generateCSVFile(component,helper,recordList,responseData.renewalStatusList,responseData.data,updateList);
                
            }
            else if (state === "INCOMPLETE") {   
                
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(generateAction); 
        
    },*/
    
    
    
    
    exportRecord: function(component, event, helper,idList,updateList){
        
        var recordType = component.get("v.categoryTypeFilter"); 
        
        var oppLineItemList = [];
        var renewalItemList = [];
        var recordList=[];
        component.set('v.ErrorMessage','');
        
        
        //var recordList=idList;
        /*var recordItemList =  component.get('v.allOpprtuntyPrdctAndRnwlStatusRcrdExportLst');
                    
        
        for(var i=0; i<idList.length; i++){
            
            var removeId = idList[i]; 
            for(var j= 0; j<recordItemList.length;j++){
            		
                if(recordItemList[j]['Id'] == removeId){
                    var filteredRecord = recordItemList.filter(element => element.Id == removeId);
                    if(filteredRecord != null && filteredRecord != '' && filteredRecord != undefined){
                        recordList.push(filteredRecord[0]);
                    }
                    
                }
        	}
            console.log('Inside export record method after loop : '+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());
        }*/
        
        /*for(var i=0; i<idList.length; i++){
            var filteredRecord = recordItemList.filter(element => element.Id == idList[i]);
            if(filteredRecord != null && filteredRecord != '' && filteredRecord != undefined){
                        recordList.push(filteredRecord[0]);
            }
        }*/
        
        
        //recordList = recordItemList.filter(element => idList.includes(element.Id) );
        
        var spinner = component.find("loadingSpinner"); 
        var generateAction = component.get('c.getOpprtntyPrdctAndRnwlStatusRecordsToExport');
        generateAction.setParams({
            
            "idList":idList,
            'recordType': recordType
        });
        
        
        generateAction.setCallback(this, function(response) {
            
            var state = response.getState();
            var responseData = response.getReturnValue();
            if (state === "SUCCESS") {
                
                if(recordType == 'Renewal'){
                    renewalItemList = responseData.renewalStatusList;
                }else{
                    oppLineItemList = responseData.opportunityLineItemList;
                }
                
                //helper.generateCSVFile(component,helper,oppLineItemList,renewalItemList,updateList);
                helper.exportFilterData(component,helper,oppLineItemList,renewalItemList,updateList);      
                
                
            }
            else if (state === "INCOMPLETE") {   
                console.log('Incomplete');
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
            }else if (state === "ERROR") {                    
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                        $A.util.removeClass(spinner, 'slds-show');
                        $A.util.addClass(spinner, 'slds-hide');
                        helper.showToast('Error Occured Please try again',' ');
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            
        });       
        $A.enqueueAction(generateAction);       
    },
    
    /*generateCSVFile : function(component,helper,opportunityLineItemList,renewalStatusList,data,updateList) 
    { 
        var selCategoryVal = component.find('CategoryDropDown').get('v.value');
        var oppLineUpdateList = [];
        var renewalUpdateList = [];
        
        
        var csv = this.convertArrayOfObjectsToCSV(opportunityLineItemList,renewalStatusList);   
        
        
        // ####--code for create a temp. <a> html tag [link tag] for download the CSV file--####     
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_self'; // 
        hiddenElement.download = 'ExportData.csv';  // CSV file Name* you can change it.[only name not .csv] 
        document.body.appendChild(hiddenElement); // Required for FireFox browser
         
        component.set("v.selectAllRecord",false);
        component.set("v.selectAllRecordTempVar",false);
        component.set("v.deSelectSome",false);

        component.set("v.selectedRecordMap",{});
        component.set("v.selectedRecordCount",0);
        
        if(selCategoryVal == 'NB\\NBEA'){
            oppLineUpdateList = updateList;
        }else{
            renewalUpdateList = updateList;
        } 
        

        
        var updateListAction = component.get('c.upsertRecords');
            updateListAction.setParams({
            
            "oppLineUpdateList" : oppLineUpdateList,
            "renewalUpdateList"  :  renewalUpdateList,
            'csvFile' : csv  
        });
        
        updateListAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                
                var responseData = response.getReturnValue();
                var recordStatus = responseData;
                if(recordStatus == 'Success'){
                  hiddenElement.click();
                  this.showToast('Record\'s exported successfully ','');  
                  helper.getOpportunityProductAndRenewalStatusRecords(component,event,helper,'',null,null,'',true);
                  
                }else{
                  this.showToast('Error Occured Please try again. ','');
                    $A.util.removeClass(spinner, 'slds-show');
            		$A.util.addClass(spinner, 'slds-hide');
                }
               	  
            }
            else if (state === "INCOMPLETE") {   
                this.showToast('Error Occured Please try again. ','');
                $A.util.removeClass(spinner, 'slds-show');
            	$A.util.addClass(spinner, 'slds-hide');
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    this.showToast('Error Occured Please try again. ','');
                    $A.util.removeClass(spinner, 'slds-show');
            		$A.util.addClass(spinner, 'slds-hide');
                }
            
        });        
        $A.enqueueAction(updateListAction);
        
        
        
        
        
        
        //this.refreshPage(component,data);
        
    },*/
    
    
    /*generateCSVFile : function(component,helper,opportunityLineItemList,renewalItemList,updateList) 
    { 
        var spinner = component.find("loadingSpinner");
        var selCategoryVal = component.get("v.categoryTypeFilter");;
        var oppLineUpdateList = [];
        var renewalUpdateList = [];
        
        
        var csv = this.convertArrayOfObjectsToCSV(opportunityLineItemList,renewalItemList);   
        
        
        
        // ####--code for create a temp. <a> html tag [link tag] for download the CSV file--####     
        var hiddenElement = document.createElement('a');
        //hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + escape(csv);
        hiddenElement.target = '_self'; // 
        var today = this.currentDateFile();
        var currentTime = this.displayTime();
        var fileType = '';
        if(opportunityLineItemList != '' && opportunityLineItemList != undefined && opportunityLineItemList != null){
            fileType = 'NBNBEA';
        }else{
            fileType = 'Renewals';
        }
        var fileName = 'ISI Export '+today+' '+currentTime+' '+fileType+'.csv';
        hiddenElement.download = 'ISI Export '+today+' '+currentTime+' '+fileType+'.csv'  // CSV file Name* you can change it.[only name not .csv] 
        //hiddenElement.download = 'ISI Export '+today+' '+currentTime+' '+fileType+'.xls'
        document.body.appendChild(hiddenElement); // Required for FireFox browser
        
        
        if(selCategoryVal == 'NB\\NBEA'){
            oppLineUpdateList = updateList;
        }else{
            renewalUpdateList = updateList;
        } 
        

        
        var updateListAction = component.get('c.upsertRecords');
            updateListAction.setParams({
            
            "oppLineUpdateList" : oppLineUpdateList,
            "renewalUpdateList"  :  renewalUpdateList,
            'csvFile' : csv,
            'fileName' : fileName,
            'currentDate' : today  
        });
        
        updateListAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                component.set("v.selectAllRecord",false);
                component.set("v.selectAllRecordTempVar",false);
        	    component.set("v.deSelectSome",false);

                component.set("v.selectedRecordMap",{});
                component.set("v.selectedRecordCount",0);
                
                var responseData = response.getReturnValue();
                var recordStatus = responseData;
                if(recordStatus == 'Success'){
                  hiddenElement.click();
                  this.showToast('Records exported successfully ','');
                    var categoryVal = component.get("v.categoryTypeFilter");
        			var productValues = component.get("v.productFilter");
        			var fromDate = component.get("v.fromDateFilter");
        			var toDate = component.get("v.toDateFilter");
                    helper.getOpportunityProductAndRenewalStatusRecords(component,event,helper,categoryVal,fromDate,toDate,productValues,false);
                  
                }else{
                  this.showToast('Error Occured Please try again. ','');
                    $A.util.removeClass(spinner, 'slds-show');
            		$A.util.addClass(spinner, 'slds-hide');
                }
               	  
            }
            else if (state === "INCOMPLETE") {   
                this.showToast('Error Occured Please try again. ','');
                $A.util.removeClass(spinner, 'slds-show');
            	$A.util.addClass(spinner, 'slds-hide');
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    this.showToast('Error Occured Please try again. ','');
                    $A.util.removeClass(spinner, 'slds-show');
            		$A.util.addClass(spinner, 'slds-hide');
                }
            
        });        
        $A.enqueueAction(updateListAction);
                
    },*/
    
    
    
    /*convertArrayOfObjectsToCSV: function(opportunityLineItemList,renewalStatusList) 
    { 
        
        var csvStringResult, counter, keys, columnDivider, lineDivider;
        columnDivider = ',';
        lineDivider =  '\n';
        
        var csvColumnHeader=['Company Name','Company ID','CLP#','Effective Date','Type (NB\\NBEA\\Renewal)',
                             'Product Name','Renewal Product Detail','Product ID','Salesperson 1','Sales Person 1 Employee ID',
                             'Sales Person 1 Split Percent','Sales Person 2','Sales Person 2 Employee ID',
                             'Sales Person 2 Split Percent','VPCR\\RVP','VPCR\\RVP Employee ID','Underwriter',
                             'Underwriter Email Address','Membership (Net Results)',
                             'Date Submitted for Incentives','Membership Activity Name','Membership Activity ID','Date'];
        
        csvStringResult = '';
        csvStringResult += csvColumnHeader.join(columnDivider);
        //csvStringResult = csvStringResult.escape('#');
        csvStringResult += lineDivider;
        
        var oppLineItemFields1=$A.get("$Label.c.Sales_Incentives_Export_oppLineItem_Fields");
        var renewalStatusFields1=$A.get("$Label.c.Sales_Incentives_Export_Renewal_Fields");
        
        var oppLineItemFields=oppLineItemFields1.split(',');
        var renewalStatusFields=renewalStatusFields1.split(',');
        
        for(var i=0; i < opportunityLineItemList.length; i++)
        {   
            counter = 0;
            
            for(var sTempkey in oppLineItemFields) 
            {
                var skey = oppLineItemFields[sTempkey] ;  
                
                // add , [comma] after every String value,. [except first]
                if(counter > 0){ 
                    csvStringResult += columnDivider; 
                } 
                var value='';
                if(skey=='SalesPerson1Id' || skey=='rvp' || skey=='rvpEmployeeId' || skey=='compensationSubmitDate')
                {
                    value=''; 
                }else if(skey=='Date'){
                    value=this.currentDate(); 
                }
                else if(skey.indexOf('.') == -1)
                {
                    
                    if(opportunityLineItemList[i][skey]!=undefined)
                    {
                        if(skey=='Date_Submitted_for_Incentives__c'){
                             value=this.convertDateTimeDormat(opportunityLineItemList[i][skey]); 
                        }else{
                           	value=opportunityLineItemList[i][skey];
                        }
                    }
                   

                    
                }
                    else
                    {
                        
                        var str=skey.split('.');
                        var strLength=str.length;
                        if(strLength==2)
                        {
                            if(opportunityLineItemList[i][str[0]] !=undefined)
                            {
                                if(opportunityLineItemList[i][str[0]][str[1]]!=undefined)
                                {  if(skey == 'Opportunity.EffectiveDate__c'){
                                    	   value=this.convertDateDormat(opportunityLineItemList[i][str[0]][str[1]]); 
                                }else if(skey == 'Product2.Name'){
                                    if(opportunityLineItemList[i][str[0]][str[1]] != 'Total'){
                                        value= opportunityLineItemList[i][str[0]][str[1]];
                                    }else{
                                        value= opportunityLineItemList[i]['Product_Line__c'];
                                    }
                                }else if(skey == 'Opportunity.MACategory__c'){
                                    if(opportunityLineItemList[i][str[0]][str[1]] == 'Client Management'){
                                        value = 'NBEA';
                                    }else if(opportunityLineItemList[i][str[0]][str[1]] == 'Client Development'){
                                        value = 'NB';
                                    }
                                }else{
                                           value=opportunityLineItemList[i][str[0]][str[1]]; 
                                    }
                                }
                                
                            }
                        }
                        if(strLength==3)
                        {
                            if(opportunityLineItemList[i][str[0]] !=undefined)
                            {
                                if(opportunityLineItemList[i][str[0]][str[1]]!=undefined)
                                {
                                    if(opportunityLineItemList[i][str[0]][str[1]][str[2]]!=undefined)
                                    {
                                        value=opportunityLineItemList[i][str[0]][str[1]][str[2]];
                                    }
                                    
                                }
                            }
                        }
                        
                    }
                csvStringResult += '"'+value+'"'; 
                
                counter++;
                
            } // inner for loop close 
            csvStringResult += lineDivider;
        }// outer main for loop close 
        
        
        for(var k=0; k < renewalStatusList.length; k++)
        { 
            counter = 0;
            
            for(var sTempkey in renewalStatusFields) 
            {
                
                var skey = renewalStatusFields[sTempkey] ;  
                
                // add , [comma] after every String value,. [except first]
                if(counter > 0){ 
                    csvStringResult += columnDivider; 
                } 
                var value='';
                
                if(skey=='type')
                {
                    value='Renewal';
                }else if(skey=='Date'){
                    value=this.currentDate(); 
                }
                else if(skey=='productName' || skey=='productId' || skey=='SalesPerson1Id' || skey=='rvp' || skey=='rvpEmployeeId' || skey=='underWriter' || skey=='underWriterEmail' || skey=='effectiveDate' || skey=='netResults' || skey=='compensationSubmitDate' || skey=='memberActivityName' || skey=='membershipActivityId')
                {
                    value='';
                }
                    else if(skey.indexOf('.') == -1)
                    {
                        if(renewalStatusList[k][skey]!=undefined)
                        {
                            //value=renewalStatusList[k][skey];
                            
                            if(skey=='Date_Submitted_For_Incentives__c'){
                                 value=this.convertDateTimeDormat(renewalStatusList[k][skey]); 
                            }else if(skey=='Efective_Date__c'){
                                value=this.convertDateDormat(renewalStatusList[k][skey]);
                            }else{
                                value=renewalStatusList[k][skey];
                            }
                            
                            
                        }
                        

                        
                    }
                        else
                        {
                            
                            var str=skey.split('.');
                            var strLength=str.length;
                            if(strLength==2)
                            {
                                if(renewalStatusList[k][str[0]] !=undefined)
                                {
                                    if(renewalStatusList[k][str[0]][str[1]]!=undefined)
                                    {
                                        value=renewalStatusList[k][str[0]][str[1]];
                                    }
                                    
                                }
                            }
                            if(strLength==3)
                            {
                                if(renewalStatusList[i][str[0]] !=undefined)
                                {
                                    if(renewalStatusList[k][str[0]][str[1]]!=undefined)
                                    {
                                        if(renewalStatusList[k][str[0]][str[1]][str[2]]!=undefined)
                                        {
                                            value=renewalStatusList[k][str[0]][str[1]][str[2]];
                                        }
                                        
                                    }
                                }
                            }
                            
                        }
                
                csvStringResult += '"'+value+'"'; 
                
                counter++;
                
                
            }
            
            
            csvStringResult += lineDivider;
            
        }
        
        return csvStringResult;
        
        
        
        
    },*/
    
    
    refreshPage:function(component,data)
    {
        
        var oprtntyPrdctAndRnwlStatusData  = data;
        if(oprtntyPrdctAndRnwlStatusData!= null)
        {
            if(oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst != null || oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst.length != 0)
            {
                component.set("v.isOpprtuntyPrdctAndRnwlStatusRcrdLstEmpty",false); 
                
                component.set("v.total", oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst.length);
                component.set("v.pages", Math.ceil(oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst.length/component.get("v.pageSize")));
                
                var allOpprtuntyPrdctAndRnwlStatusRcrdLst=oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst;
                component.set("v.allOpprtuntyPrdctAndRnwlStatusRcrdLst",oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst);
                var opprtuntyPrdctAndRnwlStatusRcrdLst=[];
                if(component.get("v.pages")>1)
                {
                    for(var i=0;i<component.get("v.pageSize");i++)
                    {
                        opprtuntyPrdctAndRnwlStatusRcrdLst.push(allOpprtuntyPrdctAndRnwlStatusRcrdLst[i]); 
                    }
                }
                else
                {
                    for(var i in allOpprtuntyPrdctAndRnwlStatusRcrdLst)
                    {
                        opprtuntyPrdctAndRnwlStatusRcrdLst.push(allOpprtuntyPrdctAndRnwlStatusRcrdLst[i]); 
                    }
                    
                }
                component.set("v.page", 1);
                component.set("v.opprtuntyPrdctAndRnwlStatusRcrdLst", opprtuntyPrdctAndRnwlStatusRcrdLst); 
                var recordSerialNo=0;
                component.set("v.recordSerialNo",recordSerialNo);
            }
            else
            {
                component.set("v.isOpprtuntyPrdctAndRnwlStatusRcrdLstEmpty",true); 
            }
            
        }
        
    },
    getSelectedValues: function(component){
        var options = component.get("v.options_");
        var values = [];
        options.forEach(function(element) {
            if (element.selected) {
                if(element.value != ''){
                    values.push(element.value); 
                } 
            }
        });
        return values;
    },
    setInfoText: function(component, values) {
        
        if (values.length == 0) {
            component.set("v.infoText", "Select an option...");
        }
        if (values.length == 1) {
            component.set("v.infoText", "1 product selected");
        }
        else if (values.length > 1) {
            component.set("v.infoText", values.length + " products selected");
        }
    }, 
    getSelectedLabels: function(component){
        var options = component.get("v.options_");
        var labels = [];
        options.forEach(function(element) {
            if (element.selected) {
                if(element.label != ''){
                    labels.push(element.label);
                }
            }
        });
        return labels;
    },
    despatchSelectChangeEvent: function(component,values){
        var compEvent = component.getEvent("selectChange");
        compEvent.setParams({ "values": values });
        compEvent.fire();
    },
    checkFieldEmpty : function(value){
        var isValueExist = false;
        if(value != '' && value != undefined && value != null){
            //isValueExist = true;
            return true;
        }
        //return isValueExist;
        return false;
    },
    currentDate : function(){
        
        var today = new Date();
        var dd = today.getDate();
        
        var mm = today.getMonth()+1; 
        var yyyy = today.getFullYear();
        if(dd<10) 
        {
            dd='0'+dd;
        } 
        
        if(mm<10) 
        {
            mm='0'+mm;
        }
        //today = yyyy+'-'+mm+'-'+dd;
        today = mm+'/'+dd+'/'+yyyy;
        return today;
    },
    currentDateFile : function(){
        
        var today = new Date();
        var dd = today.getDate();
        
        var mm = today.getMonth()+1; 
        var yyyy = today.getFullYear();
        if(dd<10) 
        {
            dd='0'+dd;
        } 
        
        if(mm<10) 
        {
            mm='0'+mm;
        }
        //today = yyyy+'-'+mm+'-'+dd;
        today = mm+'_'+dd+'_'+yyyy;
        return today;
    },
    convertDateDormat : function(date){
        if(date != null && date != undefined && date != ''){
            var formattedDateArray = date.split('-');
            var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
            var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
            var year =  formattedDateArray[0];
            date = month+'/'+date+'/'+year;
            return date;
        }else{
            return '';
        }
    },
    convertDateTimeDormat : function(component,value){
        if(value != null && value != undefined && value != ''){
            /*var formattedDateArray = value.split('T')[0];
            var time = value.split('T')[1].slice(0,8);
            if(formattedDateArray.includes('-')){
                    var formattedDate = formattedDateArray.split('-');
                    var date =  formattedDate[2].startsWith(0) ? formattedDate[2].substring(1) : formattedDate[2]
                    var month = formattedDate[1].startsWith(0) ? formattedDate[1].substring(1) : formattedDate[1]
                    var year =  formattedDate[0].substring(2);
                    value = month+'/'+date+'/'+year;
             }
            		value = value+' '+time; */
            //var dateTime = new Date(value).toLocaleString("en-US", {timeZone: component.get("v.loggedInUserTimeZone")});
            //var today = dateTime.replace(new RegExp(',', 'g'), '');
            //return today;
            var dateTimeValueFormatted;
            var dateTimeSeparatedArray;
            var timeSeparatedArray;
            var dateTime = new Date(value).toLocaleString("en-US", {timeZone: component.get("v.loggedInUserTimeZone")});
            if(dateTime.indexOf(',')!=-1){
                dateTimeSeparatedArray=dateTime.split(',');
                dateTimeValueFormatted=dateTimeSeparatedArray[0]+' '+dateTimeSeparatedArray[1].slice(0,5) +''+dateTimeSeparatedArray[1].slice(8,12);
                dateTime=dateTimeValueFormatted;
            }
            return dateTime;
        }else{
            return '';
        }
    },
    displayTime: function () {
        var str = "";
        
        var currentTime = new Date()
        var hours = currentTime.getHours()
        var minutes = currentTime.getMinutes()
        var seconds = currentTime.getSeconds()
        
        if (minutes < 10) {
            minutes = "0" + minutes
        }
        if (seconds < 10) {
            seconds = "0" + seconds
        }
        str += hours + "_" + minutes + "_" + seconds + " ";
        if(hours > 11){
            str += "PM"
        } else {
            str += "AM"
        }
        return str;
    },
    isValidDate:function(date){
        var valDate = date;
        var returnValue = false;
        if(valDate == null || valDate == undefined || valDate == ''){
            return false;
        }
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        // var regEx1 = /^\d{2}\\\d{2}\\\d{4}$/;
        if(!valDate.match(regEx)){
            returnValue = false;
        }
        else
        {
            returnValue = true;
        }        
        return returnValue;
    },
    
    
    exportFilterData : function(component,helper,opportunityLineItemList,renewalItemList,updateList){
        var spinner = component.find("loadingSpinner");
        var filterType = '';
        if(opportunityLineItemList != '' && opportunityLineItemList != undefined && opportunityLineItemList != null){
            filterType = 'OpportunityLine';
        }else{
            filterType = 'Renewal';
        }
        
        
        var generateAction = component.get('c.getTemplateInXML');
        generateAction.setParams({
            "filterType" : filterType
        });
        
        generateAction.setCallback(this, function(response) {
            
            var state = response.getState();	
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                var SVPMap =responseData.employeeNumberMap;
                component.set('v.employeeNumberMap',responseData.employeeNumberMap);
                for (let i = 0; i < renewalItemList.length - 1; i++) {
                    if(renewalItemList[i].isChanged==undefined)
                        renewalItemList[i].isChanged =false;
                    for (let j = i+1; j < renewalItemList.length; j++) {
                        if(i!=j){
                            if(!renewalItemList[j].isChanged && !renewalItemList[i].isChanged)
                            if (renewalItemList[i].Company__c === renewalItemList[j].Company__c && renewalItemList[i].Name === renewalItemList[j].Name ) {
                                renewalItemList[j].isChanged =true;
                                renewalItemList[i].isChanged =true;
                                if(renewalItemList[j].VPCR_RVP__r!=undefined){
                                renewalItemList[j].VPCR_RVP__r.Name ='';
                                    renewalItemList[j].VPCR_RVP__r.EmployeeNumber='';
                                }
                                if(renewalItemList[j].Specialty_Benefits_SCE__r!=undefined){
                                    renewalItemList[j].Sales_person_1__r.Name =renewalItemList[j].Specialty_Benefits_SCE__r.Name;
                                    renewalItemList[j].Sales_person_1__r.EmployeeNumber =renewalItemList[j].Specialty_Benefits_SCE__r.EmployeeNumber;
                                    renewalItemList[j].Sales_Person_1_split_percentage__c ='';
                                    renewalItemList[j].Specialty_Benefits_SCE__r.Name ='';
                                    renewalItemList[j].Specialty_Benefits_SCE__r.EmployeeNumber='';
                                }
                                if(renewalItemList[j].Sales_Person_2__r!=undefined){
                                    renewalItemList[j].Sales_Person_2__r.Name ='';
                                    renewalItemList[j].Sales_Person_2__r.EmployeeNumber ='';
                                    renewalItemList[j].Sales_Person_2_Split_percentage__c ='';
                                }
                                break;
                            }
                        }
                    }
                }
                for (let i = 0; i < opportunityLineItemList.length - 1; i++) {
                    if(opportunityLineItemList[i].isChanged==undefined)
                        opportunityLineItemList[i].isChanged =false;
                    if(opportunityLineItemList[i].isChangedDup==undefined)
                        opportunityLineItemList[i].isChangedDup =false;
                    for (let j = i+1; j < opportunityLineItemList.length; j++) {
                        if(i!=j){
                            if(!opportunityLineItemList[j].isChanged && !opportunityLineItemList[i].isChanged)
                                if (opportunityLineItemList[i].OpportunityId === opportunityLineItemList[j].OpportunityId && ((opportunityLineItemList[i].Product_Line__c =='Other' && opportunityLineItemList[i].Product2.Name === opportunityLineItemList[j].Product2.Name) ||
                                   (opportunityLineItemList[i].Product_Line__c !='Other' && opportunityLineItemList[i].Product_Line__c === opportunityLineItemList[j].Product_Line__c))) {
                                    opportunityLineItemList[j].isChangedDup =true;
                                    opportunityLineItemList[i].isChanged =true;
                                    opportunityLineItemList[j].isChanged =true;
                                    if(opportunityLineItemList[j].VPCR_RVP__r!=undefined){
                                        opportunityLineItemList[j].VPCR_RVP__r.Name ='';
                                        opportunityLineItemList[j].VPCR_RVP__r.EmployeeNumber=''; 
                                    }
                                    opportunityLineItemList[j].Sales_Person_1__r.Name =opportunityLineItemList[j].Speciality_Benefits_SVP__c;
                                     if(opportunityLineItemList[j].Sales_Person_2__r!=undefined){
                                        opportunityLineItemList[j].Sales_Person_2__r.Name ='';
                                        opportunityLineItemList[j].Sales_Person_2__r.EmployeeNumber ='';
                                        opportunityLineItemList[j].Sales_Person_2_split_percentage__c ='';
                                    }
                                    opportunityLineItemList[j].Sales_Person_1__r.EmployeeNumber ='';
                                    opportunityLineItemList[j].Sales_Person_1_split_percentage__c ='';
                                    if(opportunityLineItemList[j].Speciality_Benefits_SVP__c!=undefined){
                                          
                                        if(SVPMap[opportunityLineItemList[j].Speciality_Benefits_SVP__c]!=undefined)
                                            opportunityLineItemList[j].Sales_Person_1__r.EmployeeNumber =SVPMap[opportunityLineItemList[j].Speciality_Benefits_SVP__c];//opportunityLineItemList[j].Speciality_Benefits_SVP__c.EmployeeNumber;
                                        opportunityLineItemList[j].Speciality_Benefits_SVP__c ='';
                                    }else
                                        opportunityLineItemList[j].Sales_Person_1__r.EmployeeNumber ='';
                                    
                                    break;
                                }
                        }
                    }
                }
                helper.generateXmlFile(component,helper,responseData.objectItags,responseData.xmlString,opportunityLineItemList,renewalItemList,updateList);
            }
            else if (state === "INCOMPLETE") {   
                console.log('Incomplete');
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                            $A.util.removeClass(spinner, 'slds-show');
                            $A.util.addClass(spinner, 'slds-hide');
                            helper.showToast('Error Occured Please try again',' ');
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            //return true;
            
        });
        
        $A.enqueueAction(generateAction); 
        
        
    },
    
    generateXmlFile : function(component,helper,objectItagesMap,xmlWsectTag,opportunityLineItemList,renewalItemList,updateList) { 
        var spinner = component.find("loadingSpinner");
        var xmlTempleteString ='';
        var rowCount = 3;
        for(var objectName in objectItagesMap) {
            var itagSets = objectItagesMap[objectName];
            var startItag = '';
            var endItag = '';
            var setCount = 0;
            for(var itagStrIndex in itagSets){
                setCount = setCount+1;
                if(setCount == 1){
                    startItag = itagSets[itagStrIndex];
                }
                if(setCount == itagSets.length){
                    endItag = itagSets[itagStrIndex];
                }
            }
            startItag = '%%'+objectName+'.'+startItag+'@@';
            endItag = '%%'+objectName+'.'+endItag+'@@';
            console.log('startItag'+startItag+' : endItag : '+endItag);
            
            var startIndex = xmlWsectTag.lastIndexOf(startItag);
            var endIndex = xmlWsectTag.indexOf(endItag); 
            
            var stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="72.5">', startIndex);
            var endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
            endHeaderIdx +='</Row>'.length; 
            var rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);
            xmlTempleteString =  this.returnChildRows(component,helper,rowToReccurse,xmlWsectTag,opportunityLineItemList,renewalItemList,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,rowCount);
            
        }
        
        var xmlDOM = new DOMParser().parseFromString(xmlTempleteString, 'text/xml');
        var JsonData = this.xmlToJson(xmlDOM);
        var selCategoryVal = component.get("v.categoryTypeFilter");
        //var hiddenElement = document.createElement('a');
        //hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
        //hiddenElement.target = '_self'; // 
        //var today = this.currentDateFile();
        //var currentTime = this.displayTime();
        
        var value = new Date().toISOString()
        var dateTime = new Date(value).toLocaleString("en-US", {timeZone: component.get("v.loggedInUserTimeZone")});
        var dateTimeArray = dateTime.split(',');
        
        var today = dateTimeArray[0].replace(new RegExp('/', 'g'), '_');
        
        dateTimeArray[1] = dateTimeArray[1].replace(' ','');
        var currentTime = dateTimeArray[1].replace(new RegExp(':', 'g'), '_');
        
        var fileType = '';
        if(opportunityLineItemList != '' && opportunityLineItemList != undefined && opportunityLineItemList != null){
            var categoryTypeFilter = component.get("v.categoryTypeFilter");
            if(categoryTypeFilter == 'NB and NBEA'){
                fileType = 'NBNBEA';
            }else{
                fileType = categoryTypeFilter;
            }
            
        }else{
            fileType = 'Renewals';
        }
        var fileName = 'ISI Export '+today+' '+currentTime+' '+fileType+'.xls';
        //hiddenElement.download = 'ISI Export '+today+' '+currentTime+' '+fileType+'.csv'  // CSV file Name* you can change it.[only name not .csv] 
        //hiddenElement.download = 'ISI Export '+today+' '+currentTime+' '+fileType+'.xls'
        //document.body.appendChild(hiddenElement); // Required for FireFox browser
        
        const url = window.URL.createObjectURL(new Blob([xmlTempleteString]));
        const element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        
        var oppLineUpdateList = [];
        var renewalUpdateList = [];
        if(selCategoryVal == 'NB' || selCategoryVal == 'NBEA' || selCategoryVal == 'NB and NBEA'){
            oppLineUpdateList = updateList;
        }else{
            renewalUpdateList = updateList;
        } 
        
        var updateListAction = component.get('c.upsertRecords');
        updateListAction.setParams({
            
            "oppLineUpdateList" : oppLineUpdateList,
            "renewalUpdateList"  :  renewalUpdateList,
            'csvFile' : xmlTempleteString,
            'fileName' : fileName,
            'currentDate' : today  
        });
        
        updateListAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                component.set("v.selectAllRecord",false);
                component.set("v.selectAllRecordTempVar",false);
                component.set("v.deSelectSome",false);
                
                component.set("v.selectedRecordMap",{});
                component.set("v.selectedRecordCount",0);
                
                var responseData = response.getReturnValue();
                var recordStatus = responseData;
                if(recordStatus == 'Success'){
                    // hiddenElement.click();
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    this.showToast('Record\'s exported successfully ','');
                    var categoryVal = component.get("v.categoryTypeFilter");
                    var productValues = component.get("v.productFilter");
                    var fromDate = component.get("v.fromDateFilter");
                    var toDate = component.get("v.toDateFilter");
                    helper.getOpportunityProductAndRenewalStatusRecords(component,event,helper,categoryVal,fromDate,toDate,productValues,false);
                    
                }else{
                    this.showToast('Error Occured Please try again. ','');
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                }
                
            }
            else if (state === "INCOMPLETE") {   
                this.showToast('Error Occured Please try again. ','');
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    this.showToast('Error Occured Please try again. ','');
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                }
            
        });        
        $A.enqueueAction(updateListAction);
        
    },
    returnChildRows:function(component,helper,rowToReccurse,xmlWsectTag,opportunityLineItemList,renewalStatusList,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,rowCount){
        var FinalTable = '';
        var totalRows = '';
        var count = 0;
        for(var i in opportunityLineItemList){
            var eachRow = rowToReccurse;
            count = count+1;
            rowCount = rowCount+1;
            /*var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
            eachRow = eachRow.split(replaceItagName).join(count);*/
            for(var k in objectItagesMap[objectName]){
                var key = objectItagesMap[objectName][k];
                var replaceItagName = '%%'+objectName+'.'+key+'@@';
                var value='';
                if(key=='SalesPerson1Id' || key=='rvp' || key=='rvpEmployeeId' || key=='compensationSubmitDate')
                {
                    value=''; 
                }else if(key=='Date'){
                    value=this.currentDate(); 
                }
                    else if(key.indexOf('.') == -1)
                    {
                        
                        if(opportunityLineItemList[i][key]!=undefined)
                        {
                            if(key=='Date_Submitted_for_Incentives__c'){
                                value=this.convertDateTimeDormat(component,opportunityLineItemList[i][key]); 
                            }else{
                                value=opportunityLineItemList[i][key];
                            }
                        }
                        
                        
                        
                    }
                        else
                        {
                            
                            var str=key.split('.');
                            var strLength=str.length;
                            if(strLength==2)
                            {
                                if(opportunityLineItemList[i][str[0]] !=undefined)
                                {
                                    if(opportunityLineItemList[i][str[0]][str[1]]!=undefined)
                                    {  if(key == 'Opportunity.EffectiveDate__c'){
                                        value=this.convertDateDormat(opportunityLineItemList[i][str[0]][str[1]]); 
                                    }else if(key == 'Product2.Name'){
                                        if(opportunityLineItemList[i][str[0]][str[1]] != 'Total'){
                                            value= opportunityLineItemList[i][str[0]][str[1]];
                                        }else{
                                            value= opportunityLineItemList[i]['Product_Line__c'];
                                        }
                                    }else if(key == 'Opportunity.MACategory__c'){
                                        if(opportunityLineItemList[i][str[0]][str[1]] == 'Client Management'){
                                            value = 'NBEA';
                                        }else if(opportunityLineItemList[i][str[0]][str[1]] == 'Client Development'){
                                            value = 'NB';
                                        }
                                    }else{
                                        value=opportunityLineItemList[i][str[0]][str[1]]; 
                                    }
                                    } else if(opportunityLineItemList[i][str[0]] != undefined){
                                        if(key == 'Speciality_Benefits_SVP__c.EmployeeNumber'){
                                            var employeeName = opportunityLineItemList[i][str[0]];
                                            var employeeNumberMap = component.get('v.employeeNumberMap');
                                            if(employeeName != '' && employeeName != undefined && employeeName != null && !opportunityLineItemList[i].isChangedDup){
                                                value = employeeNumberMap[employeeName];
                                            }
                                            
                                        }
                                    }
                                    
                                }
                            }
                            if(strLength==3)
                            {
                                if(opportunityLineItemList[i][str[0]] !=undefined)
                                {
                                    if(opportunityLineItemList[i][str[0]][str[1]]!=undefined)
                                    {
                                        if(opportunityLineItemList[i][str[0]][str[1]][str[2]]!=undefined)
                                        {
                                            value=opportunityLineItemList[i][str[0]][str[1]][str[2]];
                                        }
                                        
                                    }
                                }
                            }
                            
                        }
                
                
                if(value != '' && value != null && value != undefined){
                    eachRow = eachRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value)); 
                }else{
                    eachRow = eachRow.split(replaceItagName).join(''); 
                }
                
            }
            
            totalRows += eachRow;
        }
        
        for(var i in renewalStatusList){
            var eachRow = rowToReccurse;
            count = count+1;
            rowCount = rowCount+1;
            /*var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
            eachRow = eachRow.split(replaceItagName).join(count);*/
            for(var k in objectItagesMap[objectName]){
                var key = objectItagesMap[objectName][k];
                var replaceItagName = '%%'+objectName+'.'+key+'@@';
                var value='';
                if(key=='type')
                {
                    value='Renewal';
                }else if(key=='Date'){
                    value=this.currentDate(); 
                }
                    else if(key=='productName' || key=='productId' || key=='SalesPerson1Id' || key=='rvp' || key=='rvpEmployeeId' || key=='underWriter' || key=='underWriterEmail' || key=='effectiveDate' || key=='netResults' || key=='compensationSubmitDate' || key=='memberActivityName' || key=='membershipActivityId')
                    {
                        value='';
                    }
                        else if(key.indexOf('.') == -1)
                        {
                            if(renewalStatusList[i][key]!=undefined)
                            {
                                //value=renewalStatusList[k][key];
                                
                                if(key=='Date_Submitted_For_Incentives__c'){
                                    value=this.convertDateTimeDormat(component,renewalStatusList[i][key]); 
                                }else if(key=='Efective_Date__c'){
                                    value=this.convertDateDormat(renewalStatusList[i][key]);
                                }else{
                                    value=renewalStatusList[i][key];
                                }
                                
                                
                            }
                            
                            
                            
                        }
                            else
                            {
                                
                                var str=key.split('.');
                                var strLength=str.length;
                                if(strLength==2)
                                {
                                    if(renewalStatusList[i][str[0]] !=undefined)
                                    {
                                        if(renewalStatusList[i][str[0]][str[1]]!=undefined)
                                        {
                                            value=renewalStatusList[i][str[0]][str[1]];
                                        }
                                        
                                    }
                                }
                                if(strLength==3)
                                {
                                    if(renewalStatusList[i][str[0]] !=undefined)
                                    {
                                        if(renewalStatusList[i][str[0]][str[1]]!=undefined)
                                        {
                                            if(renewalStatusList[i][str[0]][str[1]][str[2]]!=undefined)
                                            {
                                                value=renewalStatusList[i][str[0]][str[1]][str[2]];
                                            }
                                            
                                        }
                                    }
                                }
                                
                            }
                
                
                if(value != '' && value != null && value != undefined){
                    eachRow = eachRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value)); 
                }else{
                    eachRow = eachRow.split(replaceItagName).join(''); 
                }
                
            }
            
            totalRows += eachRow;
        }
        
        
        
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx)+totalRows+xmlWsectTag.substring(endHeaderIdx);
        xmlWsectTag = xmlWsectTag.split('##rownumber@@').join(rowCount);
        return xmlWsectTag;
    },
    
    xmlToJson:function(xml) {
        
        // Create the return object
        var obj = {};
        
        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        
        // do children
        // If just one text node inside
        if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
            obj = xml.childNodes[0].nodeValue;
        }
        else if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    },
    replaceXmlSpecialCharacters : function(value) {
        if(value != null && value != undefined && value != ''){  
            if(typeof (value) == 'string'){
                value = value.replace(/&/g,'&amp;');
                value = value.replace(/>/g,'&gt;');
                value = value.replace(/</g,'&lt;');
                value = value.replace(/\n/g,'<w:br/>'); 
            }
            return value;
        }else{
            return '';
        }
    }
    
    
})