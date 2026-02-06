({
   toggleHelper : function(component,event) {
    var toggleText = component.find("tooltip");
    //$A.util.removeClass(toggleText, "toggle");    
    $A.util.toggleClass(toggleText, "toggle");    
   }
})