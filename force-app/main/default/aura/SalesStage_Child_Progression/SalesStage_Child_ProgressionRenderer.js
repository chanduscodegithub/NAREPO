({
    afterRender: function (component, helper) {
        console.log('after render');
        this.superAfterRender();
        var progression_marker = component.find('progression_marker');
        var progression = component.get('v.progression');
        var index =  component.get('v.index');
        $A.util.removeClass(progression_marker, 'step-progress--link disabled');
        if(component.get('v.progressionIndicator').length == 5){
            if(progression.length == 4 && index == 3){
                $A.util.addClass(progression_marker, 'step-progress--link disabled');
                $A.util.removeClass(progression_marker, 'step-progress--link');
            }else if(progression.length == 3 && (index == 2 || index == 3)){
                $A.util.addClass(progression_marker, 'step-progress--link disabled');
                $A.util.removeClass(progression_marker, 'step-progress--link');
            }else{
                $A.util.addClass(progression_marker, 'step-progress--link');
                $A.util.removeClass(progression_marker, 'step-progress--link disabled');
            }
        }else{
            $A.util.addClass(progression_marker, 'step-progress--link');
            $A.util.removeClass(progression_marker, 'step-progress--link disabled');
        }
    }
})