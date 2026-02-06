({
	doInit : function(component, event, helper) {
        if(component.get("v.indexVal") === 0 && component.get("v.lastSortField") === ""){
            $A.util.addClass(component.find("sortingFieldLink"), "selected");
            component.set("v.fieldNameToSort",component.get("v.obj.fieldName"));
            if(component.get("v.obj.fieldOrder")){
                $A.util.addClass(component.find("arrowId"), "up");
                $A.util.removeClass(component.find("arrowId"), "down");
                $A.util.addClass(component.find("sortingAsc"), "visible");
                $A.util.removeClass(component.find("sortingDsc"), "visible");
            	component.set("v.fieldOrderToSort","ASC");
            	component.set("v.obj.fieldOrder",false);
            }else{
                $A.util.addClass(component.find("arrowId"), "down");
                $A.util.removeClass(component.find("arrowId"), "up");
                $A.util.addClass(component.find("sortingDsc"), "visible");
                $A.util.removeClass(component.find("sortingAsc"), "visible");
                component.set("v.fieldOrderToSort","DESC");
                component.set("v.obj.fieldOrder",true);
            } 
        }else if(component.get("v.lastSortField") === component.get("v.obj.fieldName")){
        		$A.util.addClass(component.find("sortingFieldLink"), "selected");
                component.set("v.fieldNameToSort",component.get("v.obj.fieldName"));
                if(component.get("v.obj.fieldOrder")){
                    $A.util.addClass(component.find("arrowId"), "up");
                    $A.util.removeClass(component.find("arrowId"), "down");
                    $A.util.addClass(component.find("sortingAsc"), "visible");
                    $A.util.removeClass(component.find("sortingDsc"), "visible");
                    component.set("v.fieldOrderToSort","ASC");
                    component.set("v.obj.fieldOrder",false);
                }else{
                    $A.util.addClass(component.find("arrowId"), "down");
                    $A.util.removeClass(component.find("arrowId"), "up");
                    $A.util.addClass(component.find("sortingDsc"), "visible");
                    $A.util.removeClass(component.find("sortingAsc"), "visible");
                    component.set("v.fieldOrderToSort","DESC");
                    component.set("v.obj.fieldOrder",true);
                } 
        }else{
             if(component.get("v.obj.fieldOrder")){
                $A.util.addClass(component.find("arrowId"), "up");
                $A.util.removeClass(component.find("arrowId"), "down");            
                $A.util.addClass(component.find("sortingAsc"), "visible");
                $A.util.removeClass(component.find("sortingDsc"), "visible");
                component.set("v.obj.fieldOrder",false);
            }else{
                $A.util.addClass(component.find("arrowId"), "down");
                $A.util.removeClass(component.find("arrowId"), "up"); 
                $A.util.addClass(component.find("sortingDsc"), "visible");
                $A.util.removeClass(component.find("sortingAsc"), "visible");
                component.set("v.obj.fieldOrder",true);
            }
        }           
	},
    changeSorting :function(component, event, helper) {
        console.log('changeSorting');
        if($A.util.hasClass(component.find("sortingFieldLink"), "selected")){
            component.set("v.fieldNameToSort",component.get("v.obj.fieldName"));
            if(component.get("v.obj.fieldOrder")){
                $A.util.addClass(component.find("arrowId"), "up");
                $A.util.removeClass(component.find("arrowId"), "down");
                $A.util.addClass(component.find("sortingAsc"), "visible");
                $A.util.removeClass(component.find("sortingDsc"), "visible");
                component.set("v.fieldOrderToSort","ASC");
                component.set("v.obj.fieldOrder",false);
            }else{
                $A.util.addClass(component.find("arrowId"), "down");
                $A.util.removeClass(component.find("arrowId"), "up");
                $A.util.addClass(component.find("sortingDsc"), "visible");
                $A.util.removeClass(component.find("sortingAsc"), "visible");
                component.set("v.fieldOrderToSort","DESC");
                component.set("v.obj.fieldOrder",true);
            }
        }else{
            $A.util.addClass(component.find("sortingFieldLink"), "selected");
            component.set("v.fieldNameToSort",component.get("v.obj.fieldName"));
            var cmpEvent = component.getEvent("changeFieldClasses");
        	cmpEvent.setParams({"indexVal": component.get('v.indexVal')});
       	 	cmpEvent.fire(); 
        }                     
    },
    toggleClasses:function(component, event, helper) { 
    	$A.util.removeClass(component.find("sortingFieldLink"), "selected");
    }
})