({
	doInit : function(component, event, helper) {
		var modalComponentPHONE = component.find('sorting_Modal_PHONE');       
        $A.util.addClass(modalComponentPHONE, 'open');
	},
    sortingModalClose : function(component, event, helper) {  
            component.set("v.body", []);
            var modalComponent = component.find('sorting_Modal_PHONE');
            $A.util.removeClass(modalComponent, 'open');
        	var cmpEvent = component.getEvent("Sorting_Mobile_Event");
         	cmpEvent.setParams({"isApply": false,"isChildComponent": component.get('v.isChildComponent')});
       	  	cmpEvent.fire();         	
    },
    changeOtherFields : function(component, event, helper) {  
            var index = event.getParam('indexVal');
            var SortingFieldId = component.find('SortingFieldId');
            for(var i=0;i<SortingFieldId.length;i++) {
                if(i != index){
                    SortingFieldId[i].toggleClasses();
                }
            }
    },
	applySorting : function(component, event, helper) {  
          component.set("v.body", []);
          var modalComponent = component.find('sorting_Modal_PHONE');
          $A.util.removeClass(modalComponent, 'open');
    	  var cmpEvent = component.getEvent("Sorting_Mobile_Event");
          cmpEvent.setParams({"fieldNameToBeSorted": component.get('v.fieldNameToSort')});
          cmpEvent.setParams({"orderToBeSorted": component.get('v.fieldOrderToSort')});
          cmpEvent.setParams({"isApply": true,"isChildComponent": component.get('v.isChildComponent')});
       	  cmpEvent.fire(); 
    }         
})