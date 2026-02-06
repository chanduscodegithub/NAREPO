/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 03-20-2024
 * @last modified by  : Spoorthy
**/
({
    doInit : function(component, event, helper) {
        console.log('do init()');
        component.set('v.isSpinnertoLoad', true);
        
        var device = $A.get("$Browser.formFactor");
        
        if(device != "DESKTOP"){
            component.set('v.isNotDesktop', true);
        }
        component.set('v.optyId', component.get('v.Child_Data').optyId);
        component.find('input1').set('v.value', '');
        component.find('input2').set('v.value', '');
        component.find('input3').set('v.value', '');
        component.find('input4').set('v.value', '');
        component.find('input5').set('v.value', '');
        component.find('input6').set('v.value', '');
        component.find('input7').set('v.value', '');
        
        // component.set('v.accountSubTypeNames', $A.get("$Label.c.Account_SubType_Names").split(','));
        component.set('v.hqStates', $A.get("$Label.c.Client_Reference_HQ_States").split(','));
        
        var action = component.get('c.getPickListValues');
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                component.set('v.CVGValues', response.getReturnValue().CVG);
                component.set('v.CMSCEusers', response.getReturnValue().CMSCEUsers);
                component.set('v.prodBuyUpProgs', response.getReturnValue().ProdBuyUpProgs);
                component.set('v.industryDDValues', response.getReturnValue().Industry);
                component.set('v.LeasedNetworkValues', response.getReturnValue().LeasedNetwork);
                component.set('v.PrivateExValues', response.getReturnValue().PrivateEx);
                component.set('v.ReasonForAllValues', response.getReturnValue().ReasonForAll);
                component.set('v.accountSubTypeNames', response.getReturnValue().SubType.splice(1));
                console.log('subtype>>',component.get('v.accountSubTypeNames'));
                console.log('ReasonForAllValues>>',component.get('v.ReasonForAllValues'));
                component.find('row1field').set('v.value', 'Business Line');
                //ghanshyam c 1114
                component.find('row2field').set('v.value', 'Referenceable Products/Buy Up Programs');
            }
        });
        $A.enqueueAction(action);
        
        helper.getCustomMetaData(component);
    },
    
    downloadFile : function(component, event, helper){		
        var accData = component.get("v.allAccountListToDownload");		
        var csv = helper.convertArrayOfObjectsToCSV(component, accData);   		
        if (csv == null){		
            return;		
        } 		
        
        var hiddenElement = document.createElement('a');		
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);		
        hiddenElement.target = '_self';		
        hiddenElement.download = 'Searched_Companies.csv';  		
        document.body.appendChild(hiddenElement); 		
        hiddenElement.click(); 		
    },
    
    closeSearchResultSection : function(component, event){
        component.set('v.expandCollapseIcon', false);
        var searchSectionDiv = component.find('searchSection');
        $A.util.addClass(searchSectionDiv, 'slds-is-open');
        component.set('v.isSearchedResultEmpty', []);
        component.set('v.selectedRefAcctsIds', []);
        component.set('v.isSearchBtnClicked', false);
    },
    
    resetFieldValues : function(component, event){
        component.find('row1field').set('v.value', component.get('v.defSearchField'));
        component.find('row2field').set('v.value', component.get('v.defSearchFieldScend'));
        component.find('row3field').set('v.value', '');
        component.find('row4field').set('v.value', '');
        component.find('row5field').set('v.value', '');
        component.find('row6field').set('v.value', '');
        component.find('row7field').set('v.value', '');
        
        component.set('v.row1condition', 'Contains at least one value');
        component.set('v.row2condition', 'Contains at least one value');
        component.set('v.row3condition', '');
        component.set('v.row4condition', '');
        component.set('v.row5condition', '');
        component.set('v.row6condition', '');
        component.set('v.row7condition', '');
        
        component.set('v.type1', 'search');
        component.set('v.type2', 'search');
        component.set('v.type3', 'text');
        component.set('v.type4', 'text');
        component.set('v.type5', 'text');
        component.set('v.type6', 'text');
        component.set('v.type7', 'text');
        
        if(Array.isArray(component.find('input1'))){
            component.find('input1')[0].set('v.value', '');
        }else{
            component.find('input1').set('v.value', '');
        }
        if(Array.isArray(component.find('input2'))){
            component.find('input2')[0].set('v.value', '');
        }else{
            component.find('input2').set('v.value', '');
        }
        if(Array.isArray(component.find('input3'))){
            component.find('input3')[0].set('v.value', '');
        }else{
            component.find('input3').set('v.value', '');
        }
        if(Array.isArray(component.find('input4'))){
            component.find('input4')[0].set('v.value', '');
        }else{
            component.find('input4').set('v.value', '');
        }
        if(Array.isArray(component.find('input5'))){
            component.find('input5')[0].set('v.value', '');
        }else{
            component.find('input5').set('v.value', '');
        }
        if(Array.isArray(component.find('input6'))){
            component.find('input6')[0].set('v.value', '');
        }else{
            component.find('input6').set('v.value', '');
        }
        if(Array.isArray(component.find('input7'))){
            component.find('input7')[0].set('v.value', '');
        }else{
            component.find('input7').set('v.value', '');
        }
        component.set('v.expandCollapseIcon', false);
        var searchSectionDiv = component.find('searchSection');
        $A.util.addClass(searchSectionDiv, 'slds-is-open');
        component.set('v.isSearchedResultEmpty', []);
        component.find('customLogic').set('v.value', '');
        component.find('customLogic1').set('v.value', '');
        component.set('v.finalQueryExp', '');
        component.set('v.isSearchBtnClicked', false);
        
        var cmpTarget = component.find('customLogicDiv');
        var cmpTarget1 = component.find('customLogicHelpText');
        var totalCmps = 2;
        for(var i =0; i< totalCmps; i++){
            component.find('andRadio')[i].set('v.value', true);
            component.find('orRadio')[i].set('v.value', false);
            component.find('customRadio')[i].set('v.value', false);
            $A.util.removeClass(cmpTarget[i], 'slds-show');
            $A.util.addClass(cmpTarget1[i], 'slds-hide');    
        }
    },
    
    addSelectedRefAccounts : function(component, event, helper){
        var selectedRefAcctsIds = component.get('v.selectedRefAcctsIds');
        var checkBoxCount = component.get('v.checkBoxCount');
        var saveRefAcc = component.find('saveRefAcc');
        if(event.getParam('selectedrefAcct')){            
            selectedRefAcctsIds = selectedRefAcctsIds.filter(function(e){ return e !== event.getParam('accId') });
            checkBoxCount = checkBoxCount - 1;
        }else{
            selectedRefAcctsIds.push(event.getParam('accId'));
            checkBoxCount = checkBoxCount +1;
        }
        component.set('v.checkBoxCount',checkBoxCount);
        if(checkBoxCount == 0){            
            saveRefAcc.set("v.disabled",true);                
        }else{                        
            saveRefAcc.set("v.disabled",false);
        }
        component.set('v.selectedRefAcctsIds',selectedRefAcctsIds);
    },
    
    saveRefAcctsResult : function(component, event, helper){
        var cmpEvent = component.getEvent("addRefAccountsEvent");
        cmpEvent.setParams({"selectedRefAccountIds":component.get('v.selectedRefAcctsIds'),"clicked":false,'isDelete':false});
        cmpEvent.fire();
    },
    
    searchInitiated : function(component, event, helper){
        helper.beforeSearchingLogic(component, event);
    },
    
    closeErrorMsg: function(component, event, helper) {
        var errorDailog = component.find('FilterSearch');
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-show');
            $A.util.addClass(errorDailog[i], 'slds-hide');
        }
    },
    
    closeErrorMsg1: function(component, event, helper) {
        var errorDailog = component.find('CustomLogicError');
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-show');
            $A.util.addClass(errorDailog[i], 'slds-hide');
        }
    },
    
    openOptionsPopup : function(component, event, helper){
        
        var device = $A.get("$Browser.formFactor");
        
        helper.desktopModal(component, event, 'Select the ', 'Modal_Component_Small_Contents');
        
        /*if(device == "DESKTOP"){
            helper.desktopModal(component, event, 'Select the ', 'Modal_Component_Small_Contents');
        }else{
            $A.util.addClass(component.find("sortEdit"),"hide");
            helper.panelModal(component, event, 'Select the ', 'Modal_Component_Small_Contents');  
        }*/
        
        event.stopPropagation();
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        var selectedInput = component.find(component.get('v.selectedInputBox'));
        if(event.getParam("values") != undefined && selectedInput!==undefined){
            if(Array.isArray(selectedInput)){
                selectedInput[0].set('v.value', event.getParam("values"));
            }else{
                selectedInput.set('v.value', event.getParam("values"));   
            }    
        }else{
            if(component.get('v.selectedInputBoxContents')!==undefined && component.get('v.selectedInputBoxContents').length>0){
             if(Array.isArray(selectedInput) ){
                selectedInput[0].set('v.value', component.get('v.selectedInputBoxContents'));
            }else{
                selectedInput.set('v.value', component.get('v.selectedInputBoxContents'));   
            }   
            }
             
        }
        if(event.getParam("closeChildPopup")){
            helper.modalClosing(component);
        }else if(event.getParam("refresh")){
            component.set('v.selectedInputBox','');
            component.set('v.selectedInputBoxContents',[]);
            
        }
    },
    
    customLogicUpdate : function(component, event, helper) {
        var customLogicTxt = component.find('customLogic');
        var customLogicTxt1 = component.find('customLogic1');
        
        var selectedCustomBox = event.getSource().getLocalId();
        if(selectedCustomBox === 'customLogic'){
            customLogicTxt1.set('v.value', customLogicTxt.get('v.value'));
        }else if(selectedCustomBox === 'customLogic1'){
            customLogicTxt.set('v.value', customLogicTxt1.get('v.value'));
        }
    },
    
    onChangeRadio : function(component, event){
        var cmpTarget = component.find('customLogicDiv');
        var cmpTarget1 = component.find('customLogicHelpText');
        var selectedRadio = event.getSource().getLocalId();
        var totalCmps = 2;
        if(selectedRadio === 'andRadio'){
            for(var i =0; i< totalCmps; i++){
                component.find('andRadio')[i].set('v.value', true);
                component.find('orRadio')[i].set('v.value', false);
                component.find('customRadio')[i].set('v.value', false);
                $A.util.removeClass(cmpTarget[i], 'slds-show');
                $A.util.addClass(cmpTarget1[i], 'slds-hide'); 
                //GHANSHYAM C 1114
                $A.util.removeClass(component.find('customLogicDiv')[i], 'slds-show'); 
                $A.util.removeClass(component.find('customLogicHelpText')[i], 'slds-show');
                $A.util.addClass(component.find('customLogicDiv')[i], 'slds-hide');
                $A.util.addClass(component.find('customLogicHelpText')[i], 'slds-hide');
            }
        }
        if(selectedRadio === 'orRadio'){
            for(var j =0; j< totalCmps; j++){
                component.find('orRadio')[j].set('v.value', true);
                component.find('andRadio')[j].set('v.value', false);
                component.find('customRadio')[j].set('v.value', false);
                $A.util.removeClass(cmpTarget[j], 'slds-show');
                $A.util.addClass(cmpTarget1[j], 'slds-hide');
                //GHANSHYAM C 1114
                $A.util.removeClass(component.find('customLogicDiv')[k], 'slds-show'); 
                $A.util.removeClass(component.find('customLogicHelpText')[k], 'slds-show');
                $A.util.addClass(component.find('customLogicDiv')[j], 'slds-hide');
                $A.util.addClass(component.find('customLogicHelpText')[j], 'slds-hide');
            }
        }
        else if(selectedRadio === 'customRadio'){
            for(var k =0; k< totalCmps; k++){
                component.find('customRadio')[k].set('v.value', true);
                component.find('orRadio')[k].set('v.value', false);
                component.find('andRadio')[k].set('v.value', false);
                //GHANSHYAM C 1114
                var hasclass1 = $A.util.hasClass(component.find('customLogicDiv')[k], "slds-hide");
                var hasclass2 = $A.util.hasClass(component.find('customLogicHelpText')[k], "slds-hide");
                if(hasclass1 || hasclass2){
                   $A.util.removeClass(component.find('customLogicDiv')[k], 'slds-hide'); 
                    $A.util.removeClass(component.find('customLogicDiv')[k], 'slds-hide');
                   $A.util.addClass(component.find('customLogicHelpText')[k], 'slds-show');
                    $A.util.addClass(component.find('customLogicHelpText')[k], 'slds-show');
                }
               
                    
            }
        }
        component.find('customLogic').set('v.value', '');
        component.find('customLogic1').set('v.value', '');
        component.set('v.finalQueryExp', '');
    },
    
    onFieldSelectChange : function(component, event, helper){
        
        var conditionJsonObj = {"row1field":"rowcondition1@row1condition@type1@type1Values@input1",
                                "row2field":"rowcondition2@row2condition@type2@type2Values@input2",
                                "row3field":"rowcondition3@row3condition@type3@type3Values@input3",
                                "row4field":"rowcondition4@row4condition@type4@type4Values@input4",
                                "row5field":"rowcondition5@row5condition@type5@type5Values@input5",
                                "row6field":"rowcondition6@row6condition@type6@type6Values@input6",
                                "row7field":"rowcondition7@row7condition@type7@type7Values@input7"};
        
        var selectedFieldAuraId = event.getSource().getLocalId();
        var selectedDropDown = conditionJsonObj[selectedFieldAuraId].split('@');
        
        var val = component.find(selectedFieldAuraId).get('v.value');
        val = val.trim();
        
        if(val.length != 0){
            var strArray = component.get('v.metaData').mapOfMetaData[val][0];
            
            var conditionsArray = strArray.split(',');
            
            component.set('v.'+selectedDropDown[1], conditionsArray);
            component.find(selectedDropDown[0]).set('v.value', conditionsArray[0]);
            //ghanshyam c 1114
            component.set('v.'+selectedDropDown[2],'');
            component.set('v.'+selectedDropDown[2], component.get('v.metaData').mapOfMetaData[val][1]);
            
            if(val === 'Health Plan Manager Industry'){
                component.set('v.'+selectedDropDown[3], component.get('v.industryDDValues'));
            }else if(val === 'Leased/Specialized Network'){
                component.set('v.'+selectedDropDown[3], component.get('v.LeasedNetworkValues'));
            }else if(val === 'HQ State'){
                component.set('v.'+selectedDropDown[3], component.get('v.hqStates'));
            }else if(val === 'Aggregator Group'){
                component.set('v.'+selectedDropDown[3], component.get('v.CVGValues'));
            }else if(val === 'Private Exchange Client'){
                component.set('v.'+selectedDropDown[3], component.get('v.PrivateExValues'));
            }else if((val === 'Reason for Term (Dental)') || (val === 'Reason for Term (Medical)') || (val === 'Reason for Term (Pharmacy)') || (val === 'Reason for Term (Other Buy Up)') || (val === 'Reason for Term (Vision)')){
                //Ghanshyam c 1114 resetting dropdown
                component.set('v.'+selectedDropDown[3], []);
                component.set('v.'+selectedDropDown[3], component.get('v.ReasonForAllValues'));
            }else if(val === 'Assigned SCE'){
                component.set('v.'+selectedDropDown[3], component.get('v.CMSCEusers'));
            }else if(val === 'Top Markets'){
                var action = component.get('c.getPLValues');
                action.setParams({'fieldApiName' : component.get('v.metaData').mapOfMetaData[val][2]});
                action.setCallback(this, function(response){
                    var state = response.getState();
                    if(state === 'SUCCESS'){
                        component.set('v.'+selectedDropDown[3], response.getReturnValue());
                    }
                });
                $A.enqueueAction(action);
            }
        }else{
            component.set('v.'+selectedDropDown[1], []);
            component.find(selectedDropDown[0]).set('v.value', []);
            component.set('v.'+selectedDropDown[2], 'text');
            component.set('v.'+selectedDropDown[3], []);
        }
    },
    
    enableGoBtn : function(component, event, helper) {
        if(event.getParams().keyCode == 13){                                           
            helper.beforeSearchingLogic(component, event);
        }
    },
    
    pageChange: function(component, event, helper) {
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.searchForRefAcc(component, event, page);
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    }
    
})