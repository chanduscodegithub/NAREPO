({
	doInit : function(component, event, helper) {
		 debugger;
        //component.set("v.opportunityMap", {});
        //$A.util.removeClass(component.find("tableSpinner"), "slds-hide");
        helper.getReportsData(component, event); 
	},
    changeOnVPCRList : function(component, event, helper) {
        debugger;
        var selVPCRVal = component.find('VPCRRVPsDropDown').get('v.value');
        component.set("v.selectedVPCR",selVPCRVal );
        helper.updateSCEDropDownList(component, event);
    },    
    changeOnSCEList : function(component, event, helper) {
        var selSCEVal = component.find('SCEsDropDown').get('v.value');
        component.set("v.selectedSCE",selSCEVal ); 
    },
    handleFilters: function(component, event, helper) {
        var fieldNameToBeSorted = component.get("v.sortedColumn");
        var sortFieldCompName = component.get("v.sortedType");
        component.set("v.isFiltered",true);
        helper.getFilteredData(component, event, fieldNameToBeSorted, sortFieldCompName);
    }
})