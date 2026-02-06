({
	isValidDate : function(dateString) {			
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!dateString.match(regEx)) return false;  // Invalid format
        var d = new Date(dateString);
        if(!d.getTime() && d.getTime() !== 0) return false; // Invalid date
        return d.toISOString().slice(0,10) === dateString;    
    }
})