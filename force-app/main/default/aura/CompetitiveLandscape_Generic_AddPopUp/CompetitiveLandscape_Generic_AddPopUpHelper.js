({
    getCompetitorsAccountMedicalCm : function(component, event,searchKey,selectedCategory,pageNumber,search) {
        console.log('Helper');
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        pageNumber = pageNumber || 1; 
        var action = component.get("c.getAccountCompetitors");
        action.setParams({
            "category" : selectedCategory,
            "searchKey" : searchKey,
            "pageNumber" : pageNumber,
            "isMedical" : component.get('v.isMedical')
        });
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state == "SUCCESS") {
                var ResponseData = response.getReturnValue().competitorList;
                if(ResponseData != null && ResponseData.isEditAccess != null){                    
                    component.set("v.isEditAccess", ResponseData.isEditAccess);
                }
                var selectedRecordList = [];                
                if(response.getReturnValue().competitorList != null && response.getReturnValue().competitorList.length > 0) {
                    //console.log("inside helper");                    
                    var competitorsAccountMedicalData = response.getReturnValue().competitorList;                   
                    component.set('v.competitorsAccountMedicalData', response.getReturnValue().competitorList);                    
                    
                    for(var i=0;i<competitorsAccountMedicalData.length;i++) {                                                 
                        if(selectedCategory == 'Top Competitors'){
                            competitorsAccountMedicalData[i].category = 'Top Competitors';                                                                                                                                       
                        }else if(selectedCategory == 'The Blues and their Affiliates'){
                            competitorsAccountMedicalData[i].category = 'The Blues and their Affiliates';                          
                        }else if(selectedCategory == 'Exchange Competitors'){
                            competitorsAccountMedicalData[i].category = 'Exchange Competitors';                           
                        }else{
                            competitorsAccountMedicalData[i].category = 'All Other Competitors';                            
                        }                        
                        competitorsAccountMedicalData[i].isChecked = false;
                        
                        competitorsAccountMedicalData[i].truncatedName = '';
                        
                        if(competitorsAccountMedicalData[i].Name != null && 
                           competitorsAccountMedicalData[i].Name.length > 0) {
                            var name = competitorsAccountMedicalData[i].Name;
                            if(name.length > 50) {
                                name = name.substring(0,50) + ' ..';
                                competitorsAccountMedicalData[i].truncatedName =  name;
                            } else {
                                competitorsAccountMedicalData[i].truncatedName = name;  
                            }
                        }
                        
                        /*
                      * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox functionality START
                      */
                        competitorsAccountMedicalData[i].isPharmacy = false;
                        competitorsAccountMedicalData[i].isDental = false;
                        competitorsAccountMedicalData[i].isVision = false;
                        competitorsAccountMedicalData[i].isOthers = false;
                        competitorsAccountMedicalData[i].Competitorclassification__c='';
                        /*
                      * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox functionality END
                      */ 
                        var productsOfferred = competitorsAccountMedicalData[i].Product_Types_Offered__c;             
                        if(productsOfferred != null && productsOfferred.search('Medical') != -1){
                            competitorsAccountMedicalData[i].disabled = false;
                        }else{
                            competitorsAccountMedicalData[i].disabled = true;
                        } 
                        /*
                      * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox Enablement functionality START
                      */
                        competitorsAccountMedicalData[i].isPharmacyDisabled = true;
                        competitorsAccountMedicalData[i].isDentalDisabled = true;
                        competitorsAccountMedicalData[i].isVisionDisabled = true;
                        competitorsAccountMedicalData[i].isOthersDisabled = true;
                        if(productsOfferred != null && productsOfferred.search('Pharmacy') != -1) {
                            competitorsAccountMedicalData[i].isPharmacyDisabled = false;
                        } 
                        if(productsOfferred != null && productsOfferred.search('Dental') != -1) {
                            competitorsAccountMedicalData[i].isDentalDisabled = false;                            
                        }
                        if(productsOfferred != null && productsOfferred.search('Vision') != -1) {
                            competitorsAccountMedicalData[i].isVisionDisabled = false;
                        }
                        if(productsOfferred != null && productsOfferred.search('Other Buy Up') != -1) {
                            competitorsAccountMedicalData[i].isOthersDisabled = false;
                        }
                        
                        /*
                      * Competitive Landscape-Pharmacy/Specialty/Others - Checkbox Enablement functionality END
                      */
                        selectedRecordList.push(competitorsAccountMedicalData[i]);
                    }
                    
                    var selectedCards = component.get('v.allMedicalCards');
                    for(var i=0;i<selectedCards.length;i++) {
                        for(var j=0;j<competitorsAccountMedicalData.length;j++) {
                            if(selectedCards[i].Id == competitorsAccountMedicalData[j].Id && selectedCards[i].isChecked == true){
                                competitorsAccountMedicalData[j].isChecked = true;
                            }
                        }                    	
                    } 
                    
                    /*
                  * Competitive Landscape-Pharmacy/Specialty/Others - To Display Selected Competitors as Checked START
                  */
                    var pharmacySelectedCards = component.get('v.allPharmacyCards');
                    for(var i=0;i<pharmacySelectedCards.length;i++) {
                        for(var j=0;j<competitorsAccountMedicalData.length;j++) {
                            if(pharmacySelectedCards[i].Id == competitorsAccountMedicalData[j].Id && pharmacySelectedCards[i].isPharmacy == true){
                                competitorsAccountMedicalData[j].isPharmacy = true;
                            }
                        }                    	
                    }
                    var dentalSelectedCards = component.get('v.allDentalCards');
                    for(var i=0;i<dentalSelectedCards.length;i++){
                        for(var j=0;j<competitorsAccountMedicalData.length;j++) {
                            if(dentalSelectedCards[i].Id == competitorsAccountMedicalData[j].Id && dentalSelectedCards[i].isDental == true){
                                competitorsAccountMedicalData[j].isDental = true;
                            }
                        }                    	
                    }
                    var visionSelectedCards = component.get('v.allVisionCards');
                    for(var i=0;i<visionSelectedCards.length;i++) {
                        for(var j=0;j<competitorsAccountMedicalData.length;j++){
                            if(visionSelectedCards[i].Id == competitorsAccountMedicalData[j].Id && visionSelectedCards[i].isVision == true){
                                competitorsAccountMedicalData[j].isVision = true;
                            }
                        }                    	
                    }
                    
                    var otherSelectedCards = component.get('v.allOtherCards');
                    for(var i=0;i<otherSelectedCards.length;i++) {
                        for(var j=0;j<competitorsAccountMedicalData.length;j++) {
                            if(otherSelectedCards[i].Id == competitorsAccountMedicalData[j].Id && otherSelectedCards[i].isOthers == true){
                                competitorsAccountMedicalData[j].isOthers = true;
                            }
                        }                    	
                    }
                    /*
                  * Competitive Landscape-Pharmacy/Specialty/Others - To Display Selected Competitors as Checked END
                  */
                    component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));                    
                    component.set("v.tableRecords", selectedRecordList);
                    component.set('v.competitorsAccountEmptyList', false);
                } else {
                    component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", 1); 
                    component.set("v.tableRecords", selectedRecordList);
                    component.set('v.competitorsAccountEmptyList', true);
                }
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
                var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){
                    $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
                    $A.util.removeClass(component.find("action-bar-mobile1"),"slds-hide");
                    
                    $A.util.addClass(component.find('competitive_Addpopup'),'ipadbottom');
                    if($A.get("$Browser.isIOS")){                
                        $A.util.addClass(component.find('saveCancel'),'iosBottom');              
                        $A.util.addClass(component.find('competitive_Addpopup'),'ipadBottomIos');
                    }
                }
            } else if (state === "ERROR") {
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0;i<ErrorMessage.length;i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    addCompititorRecordsToAccount : function(component, event) {
        
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        console.log('helper');
        var action = component.get("c.addCompititorsToAccount"); 
        action.setParams({
            "currentAccountId" : component.get('v.Child_Data').currentAccountId,
            "competitorsList" : component.get('v.competitorsRecords')
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                var compEvent = component.getEvent("getNewAccountData");
                compEvent.setParams({"buttonPressed":"save"});
                compEvent.fire(); 
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
            } else if (state === "ERROR") {
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0;i<ErrorMessage.length;i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    addAllCompetitorRecordsToAccount : function(component, event) {
        
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        console.log('helper');
        
        var action = component.get("c.addPharmacySpecialtyOtherCompetitorsToAccount"); 
        action.setParams({
            "currentAccountId" : component.get('v.Child_Data').currentAccountId,
            "allPharmacySpecialtyOtherscompetitorsList" : component.get('v.allPharmacySpecialtyOtherCompetitorRecords')
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
                var compEvent = component.getEvent("getNewAccountData");
                compEvent.setParams({"buttonPressed":"save","selCmptrsClassificationArray":component.get('v.selCompetitorsClassificationArray')});
                compEvent.fire();
            } else if (state === "ERROR") {
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0;i<ErrorMessage.length;i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    openMailPopupForm : function(component, event, header, cmp){
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component_Small",{attribute:true, 'ModalBodyData':component.get('v.Child_Data'), 'Modalheader':header,'ModalBody':cmp}]],
                                function(newCmp, status){ 
                                    
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId());
                                        component.set("v.body", newCmp);
                                    } 
                                });
        }else{
            component.set("v.scrollStyleForDevice","");
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");  
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Send an Email to the CRM Help Desk','ModalBodyData':component.get('v.Child_Data'),'ModalBody':'Competitive_Landscape_Email_Form'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
            
        }
    }
 })