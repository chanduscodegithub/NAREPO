({
	isValidDate:function(date){
        var valDate = date;
        var returnValue = false;
        if(valDate == null || valDate == undefined || valDate == ''){
            return true;
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
})