({
    doInit : function(component, event, helper) {
		//console.log('inside Do init');
		var pharmacySpecialtyOthersComponentData = component.get('v.Child_Data');
        component.set('v.isMedical', pharmacySpecialtyOthersComponentData.isMedical);        
        var selectedCategory = 'Top Competitors';
        var searchKey = "";
        var search = false;        
        component.set('v.isSearchPage',false);
        component.set('v.inputSearchKey', '');
        component.set('v.optionHeader', 'Top Competitors');
        helper.getCompetitorsAccountMedicalCm(component, event,searchKey, selectedCategory,1,search);
        var arr = component.find("categories");
        component.set('v.clearDisable', true);
        component.set('v.goDisable', true);
        for(var i=0;i<arr.length;i++) {
            $A.util.removeClass(arr[i].getElement(), "slds-is-active");
        }   
        $A.util.addClass(component.find("categories")[0].getElement(), "slds-is-active");
    },
    
    saveRecords : function(component, event, helper){
        
        console.log('Save');
		component.set('v.saveDisable', true);
        var isMedicalVal = component.get('v.isMedical');
        
        //var selCmptrsClassificationArray = [];
        var compEvent = component.getEvent("getNewAccountData");
        compEvent.setParams({"buttonPressed":"save"});
        
        if(isMedicalVal != null && isMedicalVal != undefined && isMedicalVal == false) {
            
            var accountId = component.get('v.Child_Data').currentAccountId;
            var accountType = component.get('v.Child_Data').accountType;

            var competitorsSelectedListNamesJSONMap = {1:"allPharmacyCards",2:"allDentalCards",3:"allVisionCards",4:"allOtherCards"};            
            var cmpEvtParams = {1:[],2:[],3:[],4:[]};
            var cmptrsClassiNamesJSONMap = {1:"Pharmacy",2:"Dental",3:"Vision",4:"Other"};
            
            var pharmacySpecialtyOthersComponentData = component.get('v.Child_Data');
            
            for(var i=1; i<5; i++) {
            	var recordsListToBeInserted = component.get('v.'+competitorsSelectedListNamesJSONMap[i]);
                
                if(recordsListToBeInserted != null && recordsListToBeInserted != undefined && 
                   		recordsListToBeInserted.length > 0) {

                    var recordsData = [];
                    for(var obj=0; obj<recordsListToBeInserted.length; obj++) {                        
                        if(accountType != undefined && accountType != null) {
                            if(accountType === $A.get("$Label.c.Client_Management")) {
                                recordsData.push({'sobjectType':'Competitor__c',
                                                  'Account__c':accountId,
                                                  'Type__c':'Account Competitor',
                                                  'Competitorclassification__c':cmptrsClassiNamesJSONMap[i],
                                                  'NumberOfMembersHeld__c':0,
                                                  'ofMembersHeld__c':0,
                                                  'TypesofOtherProductsServicesProvide__c':'',
                                                  'CompetitorAccount__r':recordsListToBeInserted[obj],
                                                  'CompetitorAccount__c': recordsListToBeInserted[obj].Id});                              
                            } else if(accountType === $A.get("$Label.c.Client_Development") || accountType === $A.get("$Label.c.Aggregator")) {
                                recordsData.push({'sobjectType':'Competitor__c',
                                                  'Account__c':accountId,
                                                  'Type__c':'Account Competitor',
                                                  'Competitorclassification__c':cmptrsClassiNamesJSONMap[i],
                                                  'NumberOfMembersHeld__c':0,
                                                  'TypesofOtherProductsServicesProvide__c':'',
                                                  'CompetitorAccount__r':recordsListToBeInserted[obj],
                                                  'CompetitorAccount__c':recordsListToBeInserted[obj].Id});
                                
                            }
                        }                        
                    }
                    cmpEvtParams[i] = recordsData;
            	}            	
            }
            
            compEvent.setParams({"PharmacyCompetitorsList":cmpEvtParams[1],"DentalCompetitorsList":cmpEvtParams[2],"VisionCompetitorsList":cmpEvtParams[3],"OtherProductsCompetitorsList":cmpEvtParams[4]});
            compEvent.fire();
            
            //helper.addAllCompetitorRecordsToAccount(component, event);
            
        } else {
            component.set("v.competitorsRecords",component.get('v.allMedicalCards'));
            var compEvent = component.getEvent("getNewAccountData");            
            compEvent.setParams({"accountData":component.get('v.allMedicalCards')});
            compEvent.setParams({"buttonPressed":"save"});
            compEvent.fire();           
        	//helper.addCompititorRecordsToAccount(component, event);
        }
    },
    
    cancelPopup : function(component, event, helper){
        var compEvent = component.getEvent("getNewAccountData");
        compEvent.setParams({"buttonPressed":"cancel"});        
        compEvent.fire();
    },
    
    clearSearchFilterField : function(component, event, helper){
        
    },
    
    showCards : function(component, event, helper){
        console.log('showCards');
        var isMedicalVal = component.get('v.isMedical');
        var dataRec = event.getParam("competitorsData");
        var addRemove = event.getParam("addRemove");
        var department = event.getParam("departMent");
                
        var totalSelCompetitors = component.get('v.totalCompetitor');
        totalSelCompetitors = (totalSelCompetitors != undefined && totalSelCompetitors != null) ? totalSelCompetitors : 0;
        
        if(addRemove != null && addRemove) {
            dataRec.isChecked = true;          
            if(department == 'Pharmacy') {
                dataRec.isPharmacy = true;
                var pharmacyData = component.get('v.allPharmacyCards');
                var isExist = false;
                for(var i=0;i<pharmacyData.length;i++){
                    if(pharmacyData[i].Id == dataRec.Id){
                    	isExist = true;    
                        break;
                    }
                }
                if(!isExist){
                	pharmacyData.push(dataRec);                   
                }           
                component.set('v.allPharmacyCards', pharmacyData); 
                totalSelCompetitors = totalSelCompetitors + 1;
            }
            if(department == 'Dental') {
                dataRec.isDental = true;
                var dentalData = component.get('v.allDentalCards');
                var isExist = false;
                for(var i=0;i<dentalData.length;i++){
                    if(dentalData[i].Id == dataRec.Id){
                    	isExist = true;    
                        break;
                    }
                }
                if(!isExist){
                	dentalData.push(dataRec);                   
                }
                component.set('v.allDentalCards', dentalData);
                totalSelCompetitors = totalSelCompetitors + 1;
            }
            if(department == 'Vision') {
                dataRec.isVision = true;
                var visionData = component.get('v.allVisionCards');
                var isExist = false;
                for(var i=0;i<visionData.length;i++){
                    if(visionData[i].Id == dataRec.Id){
                    	isExist = true;    
                        break;
                    }
                }
                if(!isExist){
                	visionData.push(dataRec);                   
                }
                component.set('v.allVisionCards', visionData); 
                totalSelCompetitors = totalSelCompetitors + 1;
            }
            if(department == 'Others') {
                dataRec.isOthers = true;
                var otherData = component.get('v.allOtherCards');
                var isExist = false;
                for(var i=0;i<otherData.length;i++) {
                    if(otherData[i].Id == dataRec.Id){
                    	isExist = true;    
                        break;
                    }
                }
                if(!isExist){
                	otherData.push(dataRec);                   
                }
                component.set('v.allOtherCards', otherData); 
                totalSelCompetitors = totalSelCompetitors + 1;
            }
            if(department == 'Medical') {
                var medicalData = component.get('v.allMedicalCards');
                var isExist = false;
                for(var i=0;i<medicalData.length;i++){
                    if(medicalData[i].Id == dataRec.Id){
                    	isExist = true;    
                        break;
                    }
                }
                if(!isExist){
                	medicalData.push(dataRec);                   
                }              
                component.set('v.allMedicalCards', medicalData);
                component.set('v.totalCompetitor', component.get('v.allMedicalCards').length);
            }
            
            
            if(isMedicalVal != null && isMedicalVal != undefined) {
                if(isMedicalVal == false) {
                    component.set('v.totalCompetitor', totalSelCompetitors);
                    if((component.get('v.allPharmacyCards') != undefined && component.get('v.allPharmacyCards') != null) || 
                       (component.get('v.allDentalCards') != undefined && component.get('v.allDentalCards') != null) || 
                       (component.get('v.allVisionCards') != undefined && component.get('v.allVisionCards') != null) || 
                       (component.get('v.allOtherCards') != undefined && component.get('v.allOtherCards') != null )) {
                   
                        component.set('v.saveDisable', false);
                    }   
                } else if(isMedicalVal) {
                    if(component.get('v.allMedicalCards') != null){
                        component.set('v.saveDisable', false);
                    }
                }
            }
            
            var tabRecords = component.get('v.tableRecords');
            for(var l=0;l<tabRecords.length;l++){
                if(tabRecords[l].Id == dataRec.Id){
                    tabRecords[l][department] = true;
                    tabRecords[l].isChecked = true;
                  /*
                   * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox Functionality START
                   */
                    if(department == 'Pharmacy') {
                    	tabRecords[l].isPharmacy = true;    
                    }
                    if(department == 'Dental'){
                    	tabRecords[l].isDental = true;    
                    }
                    if(department == 'Vision') {
                        tabRecords[l].isVision = true;
                    }
                    if(department == 'Others') {
                        tabRecords[l].isOthers = true;
                    }
                  /*
                   * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox Functionality END
                   */  
                    component.set('v.tableRecords', tabRecords);
                }
            }
            
        } else if(!addRemove) {
            
            if(department == 'Pharmacy'){
                var dataRecordsCollection = component.get('v.allPharmacyCards');
                if(totalSelCompetitors > 0) {
                    totalSelCompetitors = totalSelCompetitors - 1; 
                }
            }
            if(department == 'Dental'){
                var dataRecordsCollection = component.get('v.allDentalCards');
                if(totalSelCompetitors > 0) {
                    totalSelCompetitors = totalSelCompetitors - 1; 
                }
            }
            if(department == 'Vision'){
                var dataRecordsCollection = component.get('v.allVisionCards');
                if(totalSelCompetitors > 0) {
                    totalSelCompetitors = totalSelCompetitors - 1; 
                }
            }
            if(department == 'Others'){
                var dataRecordsCollection = component.get('v.allOtherCards');
                if(totalSelCompetitors > 0) {
                    totalSelCompetitors = totalSelCompetitors - 1; 
                }
            }
             if(department == 'Medical'){
                var dataRecordsCollection = component.get('v.allMedicalCards');
            }
            
            for(var i=0;i<dataRecordsCollection.length;i++){
                if(dataRecordsCollection[i].Id == dataRec.Id){                  
                    dataRecordsCollection.splice(i, 1);
                    
                    if(department == 'Pharmacy'){
                        component.set('v.allPharmacyCards', dataRecordsCollection);
                    }
                    if(department == 'Dental'){
                        component.set('v.allDentalCards', dataRecordsCollection);
                    }
                    if(department == 'Vision'){
                        component.set('v.allVisionCards', dataRecordsCollection);
                    }
                    if(department == 'Others'){
                        component.set('v.allOtherCards', dataRecordsCollection);
                    }
                    if(department == 'Medical'){
                        component.set('v.allMedicalCards', dataRecordsCollection);
                    }
                }
            }
            
            if(isMedicalVal != null && isMedicalVal != undefined) {
                if(isMedicalVal == false) {
                    component.set('v.totalCompetitor', totalSelCompetitors);
                    if(component.get('v.allPharmacyCards') != undefined && component.get('v.allPharmacyCards') != null && 
                       component.get('v.allPharmacyCards').length == 0 && component.get('v.allDentalCards') != undefined && 
                       component.get('v.allDentalCards') != null && component.get('v.allDentalCards').length == 0 && 
                       component.get('v.allVisionCards') != undefined && component.get('v.allVisionCards') != null && 
                       component.get('v.allVisionCards').length == 0 && component.get('v.allOtherCards') != undefined &&
                       component.get('v.allOtherCards') != null && component.get('v.allOtherCards').length == 0) {
                   
                        component.set('v.saveDisable', true);
                    }   
                } else if(isMedicalVal) {                    
                    if(component.get('v.allMedicalCards').length == 0) {
                        component.set('v.saveDisable', true)
                    }
                }
            }
            
            var tabRecords = component.get('v.tableRecords');
            for(var l=0;l<tabRecords.length;l++){
                if(tabRecords[l].Name == dataRec.Name){
                    tabRecords[l][department] = false;
                    tabRecords[l].isChecked = false;
                  /*
                   * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox Functionality START
                   */
                    if(department == 'Pharmacy') {
                    	tabRecords[l].isPharmacy = false;    
                    }
                    if(department == 'Dental'){
                    	tabRecords[l].isDental = false;    
                    }
                    if(department == 'Vision') {
                        tabRecords[l].isVision = false;
                    }
                    if(department == 'Others') {
                        tabRecords[l].isOthers = false;
                    }
                  /*
                   * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox Functionality END
                   */
                    component.set('v.tableRecords', tabRecords);
                }
            }
        }
    },
    
    removeDataRecCard : function(component, event, helper) {
	//console.log('removeDataRecCard');        
        var selectedItem = event.currentTarget;
        var competitorName = selectedItem.dataset.record;
        var compDepartment = selectedItem.name;
        var recordId = selectedItem.id;
        var category = selectedItem.dataset.category;
        
        var dataRecordsCollection = [];
        
        var totalSelCompetitors = component.get('v.totalCompetitor');
        totalSelCompetitors = (totalSelCompetitors != undefined && totalSelCompetitors != null) ? totalSelCompetitors : 0;
        
        if(compDepartment == 'Pharmacy'){
            dataRecordsCollection = component.get('v.allPharmacyCards');
            if(totalSelCompetitors > 0) {
            	totalSelCompetitors = totalSelCompetitors - 1; 
            }
        }
        if(compDepartment == 'Dental'){
            dataRecordsCollection = component.get('v.allDentalCards');
            if(totalSelCompetitors > 0) {
            	totalSelCompetitors = totalSelCompetitors - 1; 
            }
        }
        if(compDepartment == 'Vision'){
            dataRecordsCollection = component.get('v.allVisionCards');
            if(totalSelCompetitors > 0) {
            	totalSelCompetitors = totalSelCompetitors - 1; 
            }
        }
        if(compDepartment == 'Others'){
            dataRecordsCollection = component.get('v.allOtherCards');
            if(totalSelCompetitors > 0) {
            	totalSelCompetitors = totalSelCompetitors - 1; 
            }
        }
        if(compDepartment == 'Medical'){
            dataRecordsCollection = component.get('v.allMedicalCards');
        }
        for(var i=0;i<dataRecordsCollection.length;i++) {
            
            if(dataRecordsCollection[i].Id == recordId) {
                
                dataRecordsCollection.splice(i, 1);
                
                if(compDepartment == 'Pharmacy'){
                    component.set('v.allPharmacyCards', dataRecordsCollection);
                }
                if(compDepartment == 'Dental'){                    
                    component.set('v.allDentalCards', dataRecordsCollection);
                }
                if(compDepartment == 'Vision'){
                    component.set('v.allVisionCards', dataRecordsCollection);
                }
                if(compDepartment == 'Others'){
                    component.set('v.allOtherCards', dataRecordsCollection);
                }
                if(compDepartment == 'Medical'){
                    component.set('v.allMedicalCards', dataRecordsCollection);
                }
                
                var tableDataRecords = component.get('v.tableRecords');                
                for(var j=0;j<tableDataRecords.length;j++) {                    
                    if(tableDataRecords[j].Name == competitorName){
                      /*
                  	   * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox Functionality START
                  	   */
                        if(compDepartment == 'Pharmacy') {
                            tableDataRecords[j].isPharmacy = false;    
                        } else if(compDepartment == 'Dental') {
                            tableDataRecords[j].isDental = false;    
                        } else if(compDepartment == 'Vision') {
                            tableDataRecords[j].isVision = false;    
                        } else if(compDepartment == 'Others') {
                            tableDataRecords[j].isOthers = false;    
                        }
                     /*
                  	  * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox Functionality END
                  	  */
                        tableDataRecords[j][compDepartment] = false;
                        tableDataRecords[j].isChecked = false;
                        component.set('v.tableRecords', tableDataRecords);
                    }
                }
            }
        }
        
        var isMedicalVal = component.get('v.isMedical');
        if(isMedicalVal != null && isMedicalVal != undefined) {
        
            if(isMedicalVal == false) {
                component.set('v.totalCompetitor', totalSelCompetitors);
            	if(component.get('v.allPharmacyCards') != undefined && component.get('v.allPharmacyCards') != null && 
                   component.get('v.allPharmacyCards').length == 0 && component.get('v.allDentalCards') != undefined && 
                   component.get('v.allDentalCards') != null && component.get('v.allDentalCards').length == 0 && 
                   component.get('v.allVisionCards') != undefined && component.get('v.allVisionCards') != null && 
                   component.get('v.allVisionCards').length == 0 && component.get('v.allOtherCards') != undefined &&
                   component.get('v.allOtherCards') != null && component.get('v.allOtherCards').length == 0) {
               
                    component.set('v.saveDisable', true);
                }   
            } else if(isMedicalVal) {
                component.set('v.totalCompetitor', component.get('v.allMedicalCards').length);
                if(component.get('v.allMedicalCards').length == 0) {                                        
                    component.set('v.saveDisable', true)
                }
            }
        } 
    },
        
    showOptions: function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var selectedCategory = selectedItem.dataset.record;
        var searchKeyVal = "";
        var search = false;
        component.set('v.isSearchPage',false);
        helper.getCompetitorsAccountMedicalCm(component, event ,searchKeyVal,selectedCategory,1,search);
        
        component.set('v.inputSearchKey', '');
        component.set('v.clearDisable', true);
        component.set('v.goDisable', true);
        
        component.set('v.optionHeader', selectedCategory);
        
        if(selectedCategory == 'Top Competitors'){           
            component.set('v.selectedOption', selectedCategory);
        }
        if(selectedCategory == 'The Blues and their Affiliates'){         
            component.set('v.selectedOption', selectedCategory);
        }
        if(selectedCategory == 'Exchange Competitors'){           
            component.set('v.selectedOption', selectedCategory);
        }
        if(selectedCategory == 'All Other Competitors'){          
            component.set('v.selectedOption', selectedCategory);
        }
        
        var arr = component.find("categories");
        for(var i=0;i<arr.length;i++) {
            $A.util.removeClass(arr[i].getElement(), "slds-is-active");
        }                 
        $A.util.addClass(selectedItem, "slds-is-active");
    },
    
    pageChange: function(component, event, helper) {

		setTimeout(function() { 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
                 focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
             
         }, 600);
        
        var searchKeyVal = component.find('searchKeywordForCompetitor').get('v.value');
		var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        var category = component.get('v.selectedOption');
        var search = false;
        helper.getCompetitorsAccountMedicalCm(component,event,searchKeyVal, category,page,search);
	},
    
    searchCompetitors : function(component, event, helper) {
        
        var searchKeyVal = component.find('searchKeywordForCompetitor').get('v.value'); 
        var category = "";
        var search = true;
        component.set('v.isSearchPage',true);
        component.set('v.optionHeader', '');
        helper.getCompetitorsAccountMedicalCm(component,event,searchKeyVal, category,1,search);
        
        var arr = component.find("categories");
        for(var i=0;i<arr.length;i++) {
            $A.util.removeClass(arr[i].getElement(), "slds-is-active");
        }        
    },
    
    checkInputSearchKey : function(component, event, helper) {
    	var key = component.get('v.inputSearchKey');
        var search = component.get('v.isSearchPage');
        if(key!= undefined && key != null && key.trim().length > 0){
            component.set('v.clearDisable', false);
            component.set('v.goDisable', false);
        }else if(search === true){
            component.set('v.goDisable', true);
        }else{
            component.set('v.clearDisable', true);
            component.set('v.goDisable', true);
        }
        if(event.getParams().keyCode == 13){                                           
            if(key != undefined && key != null && key.trim().length > 0) {
                var searchKeyVal = component.find('searchKeywordForCompetitor').get('v.value'); 
                var category = "";
                var search = true;
                component.set('v.isSearchPage',true);
                component.set('v.optionHeader', '');
                helper.getCompetitorsAccountMedicalCm(component,event,searchKeyVal, category,1,search);
                var arr = component.find("categories");
                for(var i=0;i<arr.length;i++) {
                    $A.util.removeClass(arr[i].getElement(), "slds-is-active");
                } 
            }            
        }
        
    },
    
    closeErrorModal: function(component, event, helper) {
        var ErrorMessage = component.find('ErrorMessage');
        for(var i=0;i<ErrorMessage.length;i++) {
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    
    openMailPopupForm : function(component, event, helper){
        console.log('hello')
        var device = $A.get("$Browser.formFactor");
        
        /*if(device == "DESKTOP"){
            helper.openMailPopupForm(component, event, 'Send an Email to the CRM Help Desk', 'MA_Consultants_Send_Mail_Popup');
        }else{
            helper.openMailPopupForm(component, event, 'Send an Email to the CRM Help Desk', 'MA_Consultants_Send_Mail_Popup');  
        }*/
        helper.openMailPopupForm(component, event, 'Send an Email to the CRM Help Desk', 'Competitive_Landscape_Email_Form'); 
        event.stopPropagation();  
    },
    
    modelCloseEmailEvent : function(component, event,helper){
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        }else{
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []); 
            $A.util.removeClass(component.find("sortEdit"),"hide");
        }  
    }
    
})