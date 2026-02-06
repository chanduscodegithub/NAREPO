({
    doInit : function(component, event, helper) {
        console.log('tes');
        var previous_Stage='';
        var width = 99
        var bottom_branch = component.find('bottom_branch');
        var green_branch =  component.find('green_branch');
        var progression_Length = component.get('v.progression').length+1;
        if(component.get('v.progression') == ''){
            component.set('v.green_Branch','width:0%;');
            component.set('v.bottom_brnch','width:0%;');
            $A.util.addClass(bottom_branch, 'z-opacity');
        }else{
            if(component.get('v.progression').length > 2){
                $A.util.removeClass(bottom_branch, 'z-opacity');
                for(var i=0; i<component.get('v.Intial_Stage_values').length; i++){
                    if(component.get('v.Intial_Stage_values')[i] == component.get('v.Selected_Stage_Name')){
                        helper.Prev(component, event,i,component.get('v.Intial_Stage_values'));
                        if(component.get('v.hasPrevVal')){ 
                            if(component.get('v.previousCount') > 2 && component.get('v.previousCount') <5){
                                component.set('v.ProgressionSalesStage',component.get('v.progression'));
                                component.set('v.progressionIndicator',component.get('v.progression'));
                                $A.util.removeClass(bottom_branch, 'activated');
                                $A.util.addClass(green_branch, 'activated');
                                //component.set('v.bottom_brnch','width:'+width+'%;');
                                progression_Length = progression_Length-2;
                                width = width/progression_Length;
                                var green_Branch = width;
                                width = width*2;
                                component.set('v.green_Branch','width:'+green_Branch+'%;');
                                component.set('v.topdotted_Branch','width:'+width+'%;');
                                component.set('v.bottom_brnch','display:none');
                            }else if(component.get('v.previousCount') == 2){
                                component.set('v.ProgressionSalesStage',component.get('v.progression'));
                                component.set('v.progressionIndicator',component.get('v.progression'));
                                $A.util.removeClass(bottom_branch, 'activated');
                                $A.util.addClass(green_branch, 'activated');
                                progression_Length = progression_Length-2;
                                width = width/progression_Length;
                                var green_Branch = width;
                                width = width*2;
                                component.set('v.green_Branch','width:'+green_Branch+'%;');
                                component.set('v.topdotted_Branch','width:'+width+'%;');
                                component.set('v.bottom_brnch','width:66.5%;left:33%');
                            }else{
                                component.set('v.ProgressionSalesStage',component.get('v.progression'));
                                component.set('v.progressionIndicator',component.get('v.Intial_Stage_values'));
                                $A.util.removeClass(bottom_branch, 'activated');
                                $A.util.addClass(green_branch, 'activated');
                                if(component.get('v.progression').length == 4){
                                    progression_Length = progression_Length -1;
                                    component.set('v.bottom_brnch','width:75%;left:25%');
                                }else if(component.get('v.progression').length == 3){
                                    progression_Length = progression_Length;
                                }
                                width = width/progression_Length;
                                var green_Branch = width;
                                width = width*2;
                                component.set('v.green_Branch','width:'+green_Branch+'%;');
                                component.set('v.topdotted_Branch','width:'+width+'%;');
                            }
                        }else{
                            component.set('v.ProgressionSalesStage',component.get('v.progression'));
                            component.set('v.progressionIndicator',component.get('v.Intial_Stage_values'));
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            width = width/progression_Length-1;
                            var green_Branch = width;
                            green_Branch = green_Branch - width;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                            component.set('v.topdotted_Branch','width:'+width+'%;');
                        }
                    }
                }
            }else if(component.get('v.progression').length == 2){
                for(var i=0; i<component.get('v.progression').length; i++){
                    component.set('v.ProgressionSalesStage',component.get('v.progression'));
                    component.set('v.previousSalesStage',component.get('v.progression')[0]);
                    if(component.get('v.progression')[i] == component.get('v.Selected_Stage_Name')){
                        helper.Prev(component, event,i,component.get('v.progression'));
                        if(component.get('v.hasPrevVal')){
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            var green_Branch = width;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                        }else{
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            width = width/progression_Length-1;
                            var green_Branch = width;
                            green_Branch = green_Branch - width;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                        }
                    }
                }
                component.set('v.progressionIndicator',component.get('v.progression'));
                component.set('v.bottom_brnch','display:none');
                $A.util.addClass(bottom_branch, 'z-opacity');
            }else if(component.get('v.progression').length == 1){
                $A.util.addClass(bottom_branch, 'z-opacity');
            }
        }
    },
    SyncSalesStage:function(component, event, helper) {
        var params = event.getParam('arguments');
        var child_Progression_Id = component.find('child_Progression_Id');
        if (params) {
            var Selected_Stage = params.Selected_Stage;
            var rowIndex = event.getParam('rowId');
            var child_Progression_Id = component.find('child_Progression_Id');
            var salesStageLead = component.get('v.ProgressionSalesStage');
            component.set('v.Selected_Stage_Name',Selected_Stage);
            var previous_Stage='';
            var width = 99;
            var bottom_branch = component.find('bottom_branch');
            var green_branch =  component.find('green_branch');
            var progression_Length = component.get('v.progression').length+1;
            if(component.get('v.progression') == ''){
            component.set('v.green_Branch','width:0%;');
            component.set('v.blue_Branch','width:0%;');
            $A.util.addClass(bottom_branch, 'slds-hide');
        }else{
            if(component.get('v.progression').length > 2){
                for(var i=0; i<component.get('v.Intial_Stage_values').length; i++){
                    if(component.get('v.Intial_Stage_values')[i] == component.get('v.Selected_Stage_Name')){
                        helper.Prev(component, event,i,component.get('v.Intial_Stage_values'));
                        if(component.get('v.hasPrevVal')){
                            if(component.get('v.progressionIndicator').length == 5){
                                if(component.get('v.previousCount') > 2 && component.get('v.previousCount') <5){
                                    var green_Branch = width;
                                    if(component.get('v.progression').length == 4){
                                        component.set('v.bottom_brnch','width:75%;left:25%');
                                        green_Branch =  99/4;      
                                        width = width/progression_Length;
                                        component.set('v.green_Branch','width:'+green_Branch+'%;');
                                        component.set('v.topdotted_Branch','width:'+green_Branch+'%;');
                                        $A.util.removeClass(bottom_branch, 'z-opacity');
                                        $A.util.addClass(bottom_branch, 'activated');
                                        $A.util.removeClass(green_branch, 'activated');
                                        //$A.util.addClass(green_branch, 'slds-hide');
                                    }else if(component.get('v.progression').length == 3){
                                        component.set('v.bottom_brnch','width:99%;left:4px');
                                        green_Branch = green_Branch - width;
                                        progression_Length = progression_Length-1;
                                        width = width/progression_Length;
                                        component.set('v.green_Branch','width:'+green_Branch+'%;');
                                        $A.util.removeClass(bottom_branch, 'z-opacity');
                                        $A.util.addClass(green_branch, 'z-opacity');
                                        $A.util.addClass(bottom_branch, 'activated');
                                        $A.util.removeClass(green_branch, 'activated');
                                    }
                                }else if(component.get('v.previousCount') == 2){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-1;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    green_Branch = green_Branch + width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    $A.util.addClass(bottom_branch, 'z-opacity');
                                    $A.util.removeClass(green_branch, 'z-opacity');
                                }else{
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    if(component.get('v.progression').length == 4){
                                        progression_Length = progression_Length -1;
                                        width = width/progression_Length;
                                        var green_Branch = width;
                                        var topdotted_Branch = green_Branch*2;
                                        component.set('v.green_Branch','width:'+green_Branch+'%;');
                                        component.set('v.topdotted_Branch','width:'+topdotted_Branch+'%;');
                                        $A.util.removeClass(bottom_branch, 'z-opacity');
                                        $A.util.removeClass(green_branch, 'z-opacity');
                                    }else if(component.get('v.progression').length == 3){
                                        progression_Length = progression_Length;
                                        width = width/progression_Length;
                                        var green_Branch = width;
                                        var topdotted_Branch = green_Branch;
                                        component.set('v.green_Branch','width:'+green_Branch+'%;');
                                        component.set('v.topdotted_Branch','width:'+topdotted_Branch+'%;');
                                        $A.util.addClass(bottom_branch, 'z-opacity');
                                        $A.util.removeClass(green_branch, 'z-opacity');
                                    } 
                                }
                            }else if(component.get('v.progressionIndicator').length == 4){
                                if(component.get('v.previousCount') > 3 && component.get('v.previousCount') <5){
                                    $A.util.addClass(bottom_branch, 'activated');
                                    $A.util.removeClass(green_branch, 'activated');
                                    progression_Length = progression_Length-2;
                                    width = width/progression_Length;
                                    component.set('v.bottom_brnch','width:66.5%;left:33%');
                                    var green_Branch = width;
                                    green_Branch = green_Branch;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    $A.util.removeClass(bottom_branch, 'z-opacity');
                                    component.set('v.topdotted_Branch','width:'+green_Branch+'%;');
                                }else if(component.get('v.previousCount') == 2){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-2;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    var topdotted_Branch = green_Branch*2;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    $A.util.removeClass(bottom_branch, 'z-opacity');
                                    $A.util.removeClass(green_branch, 'z-opacity');
                                    component.set('v.topdotted_Branch','width:'+topdotted_Branch+'%;');
                                }else if(component.get('v.previousCount') == 3){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-2;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    green_Branch = green_Branch + width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    $A.util.addClass(bottom_branch, 'z-opacity');
                                    $A.util.removeClass(green_branch, 'z-opacity');
                                }else{
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    green_Branch = green_Branch - width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    component.set('v.topdotted_Branch','width:33%;');
                                    $A.util.addClass(bottom_branch, 'z-opacity');
                                    $A.util.removeClass(green_branch, 'z-opacity');
                                }
                            }else if(component.get('v.progressionIndicator').length == 3){
                                if(component.get('v.previousCount') > 4 && component.get('v.previousCount') <5){
                                    $A.util.addClass(bottom_branch, 'activated');
                                    $A.util.removeClass(green_branch, 'activated');
                                    progression_Length = progression_Length-3;
                                    width = width/progression_Length;
                                    component.set('v.bottom_brnch','width:'+width+'%;');
                                    var green_Branch = width;
                                    green_Branch = green_Branch;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                }else if(component.get('v.previousCount') == 2){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-3;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    green_Branch = green_Branch - width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    component.set('v.topdotted_Branch','width:50%;');
                                }else if(component.get('v.previousCount') == 3){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-2;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    component.set('v.topdotted_Branch','width:99%;');
                                }else{
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-3;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                }
                            }
                        }else{
                            progression_Length = progression_Length-1;
                            width = width/progression_Length;
                            var green_Branch = width;
                            green_Branch = width - green_Branch;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                            component.set('v.topdotted_Branch','width:25%;');
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            if(progression_Length == 3){
                                $A.util.removeClass(bottom_branch, 'z-opacity');
                            }else if(progression_Length == 4){
                                $A.util.addClass(bottom_branch, 'z-opacity');
                            }
                            $A.util.removeClass(green_branch, 'z-opacity');
                        }
                    }
                }
            }else if(component.get('v.progression').length == 2){
                for(var i=0; i<component.get('v.progression').length; i++){
                    //component.set('v.ProgressionSalesStage',component.get('v.progression'));
                    component.set('v.previousSalesStage',component.get('v.progression')[0]);
                    if(component.get('v.progression')[i] == component.get('v.Selected_Stage_Name')){
                        helper.Prev(component, event,i,component.get('v.progression'));
                        if(component.get('v.hasPrevVal')){
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            var green_Branch = width;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                        }else{
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            width = width/progression_Length-1;
                            var green_Branch = width;
                            green_Branch = green_Branch - width;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                        }
                    }
                }
                //component.set('v.progressionIndicator',component.get('v.progression'));
                $A.util.addClass(bottom_branch, 'z-opacity');
            }else if(component.get('v.progression').length == 1){
                $A.util.addClass(bottom_branch, 'z-opacity');
            }
        }
            for(var i=0; i<child_Progression_Id.length; i++){
                if(child_Progression_Id[i].get('v.Stage_Name') == Selected_Stage){
                    child_Progression_Id[i].selectActStage(true);
                }else{
                    child_Progression_Id[i].selectActStage(false);
                }
            }
        }
    },
    handleProgressionChildEvent:function(component, event, helper) {
        var rowIndex = event.getParam('rowId');
        var sales_Stage_Name = event.getParam('sales_Stage_Name');
        var child_Progression_Id = component.find('child_Progression_Id');
        var salesStageLead = component.get('v.ProgressionSalesStage');
        component.set('v.Selected_Stage_Name',sales_Stage_Name);
        var previous_Stage='';
        var width = 99;
        var bottom_branch = component.find('bottom_branch');
        var green_branch =  component.find('green_branch');
        var progression_Length = component.get('v.progression').length+1;
        if(component.get('v.progression') == ''){
            component.set('v.green_Branch','width:0%;');
            component.set('v.blue_Branch','width:0%;');
            $A.util.addClass(bottom_branch, 'slds-hide');
        }else{
            if(component.get('v.progression').length > 2){
                for(var i=0; i<component.get('v.Intial_Stage_values').length; i++){
                    if(component.get('v.Intial_Stage_values')[i] == component.get('v.Selected_Stage_Name')){
                        helper.Prev(component, event,i,component.get('v.Intial_Stage_values'));
                        if(component.get('v.hasPrevVal')){
                            if(component.get('v.progressionIndicator').length == 5){
                                if(component.get('v.previousCount') > 2 && component.get('v.previousCount') <5){
                                    var green_Branch = width;
                                    if(component.get('v.progression').length == 4){
                                        component.set('v.bottom_brnch','width:75%;left:25%');
                                        green_Branch =  99/4;      
                                        width = width/progression_Length;
                                        component.set('v.green_Branch','width:'+green_Branch+'%;');
                                        component.set('v.topdotted_Branch','width:'+green_Branch+'%;');
                                        $A.util.removeClass(bottom_branch, 'z-opacity');
                                        $A.util.addClass(bottom_branch, 'activated');
                                        $A.util.removeClass(green_branch, 'activated');
                                        //$A.util.addClass(green_branch, 'slds-hide');
                                    }else if(component.get('v.progression').length == 3){
                                        component.set('v.bottom_brnch','width:99%;left:4px');
                                        green_Branch = green_Branch - width;
                                        progression_Length = progression_Length-1;
                                        width = width/progression_Length;
                                        component.set('v.green_Branch','width:'+green_Branch+'%;');
                                        $A.util.removeClass(bottom_branch, 'z-opacity');
                                        $A.util.addClass(green_branch, 'z-opacity');
                                        $A.util.addClass(bottom_branch, 'activated');
                                        $A.util.removeClass(green_branch, 'activated');
                                    }
                                }else if(component.get('v.previousCount') == 2){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-1;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    green_Branch = green_Branch + width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    $A.util.addClass(bottom_branch, 'z-opacity');
                                    $A.util.removeClass(green_branch, 'z-opacity');
                                }else{
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    if(component.get('v.progression').length == 4){
                                        progression_Length = progression_Length -1;
                                        width = width/progression_Length;
                                        var green_Branch = width;
                                        var topdotted_Branch = green_Branch*2;
                                        component.set('v.green_Branch','width:'+green_Branch+'%;');
                                        component.set('v.topdotted_Branch','width:'+topdotted_Branch+'%;');
                                        $A.util.removeClass(bottom_branch, 'z-opacity');
                                        $A.util.removeClass(green_branch, 'z-opacity');
                                    }else if(component.get('v.progression').length == 3){
                                        progression_Length = progression_Length;
                                        width = width/progression_Length;
                                        var green_Branch = width;
                                        var topdotted_Branch = green_Branch;
                                        component.set('v.green_Branch','width:'+green_Branch+'%;');
                                        component.set('v.topdotted_Branch','width:'+topdotted_Branch+'%;');
                                        $A.util.addClass(bottom_branch, 'z-opacity');
                                        $A.util.removeClass(green_branch, 'z-opacity');
                                    } 
                                }
                            }else if(component.get('v.progressionIndicator').length == 4){
                                if(component.get('v.previousCount') > 3 && component.get('v.previousCount') <5){
                                    $A.util.addClass(bottom_branch, 'activated');
                                    $A.util.removeClass(green_branch, 'activated');
                                    progression_Length = progression_Length-2;
                                    width = width/progression_Length;
                                    component.set('v.bottom_brnch','width:66.5%;left:33%');
                                    var green_Branch = width;
                                    green_Branch = green_Branch;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    $A.util.removeClass(bottom_branch, 'z-opacity');
                                    component.set('v.topdotted_Branch','width:'+green_Branch+'%;');
                                }else if(component.get('v.previousCount') == 2){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-2;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    var topdotted_Branch = green_Branch*2;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    $A.util.removeClass(bottom_branch, 'z-opacity');
                                    $A.util.removeClass(green_branch, 'z-opacity');
                                    component.set('v.topdotted_Branch','width:'+topdotted_Branch+'%;');
                                }else if(component.get('v.previousCount') == 3){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-2;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    green_Branch = green_Branch + width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    $A.util.addClass(bottom_branch, 'z-opacity');
                                    $A.util.removeClass(green_branch, 'z-opacity');
                                }else{
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    green_Branch = green_Branch - width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    component.set('v.topdotted_Branch','width:33%;');
                                    $A.util.addClass(bottom_branch, 'z-opacity');
                                    $A.util.removeClass(green_branch, 'z-opacity');
                                }
                            }else if(component.get('v.progressionIndicator').length == 3){
                                if(component.get('v.previousCount') > 4 && component.get('v.previousCount') <5){
                                    $A.util.addClass(bottom_branch, 'activated');
                                    $A.util.removeClass(green_branch, 'activated');
                                    progression_Length = progression_Length-3;
                                    width = width/progression_Length;
                                    component.set('v.bottom_brnch','width:'+width+'%;');
                                    var green_Branch = width;
                                    green_Branch = green_Branch;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                }else if(component.get('v.previousCount') == 2){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-3;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    green_Branch = green_Branch - width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    component.set('v.topdotted_Branch','width:50%;');
                                }else if(component.get('v.previousCount') == 3){
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-2;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                    component.set('v.topdotted_Branch','width:99%;');
                                }else{
                                    $A.util.removeClass(bottom_branch, 'activated');
                                    $A.util.addClass(green_branch, 'activated');
                                    progression_Length = progression_Length-3;
                                    width = width/progression_Length;
                                    var green_Branch = width;
                                    component.set('v.green_Branch','width:'+green_Branch+'%;');
                                }
                            }
                        }else{
                            progression_Length = progression_Length-1;
                            width = width/progression_Length;
                            var green_Branch = width;
                            green_Branch = width - green_Branch;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                            component.set('v.topdotted_Branch','width:25%;');
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            if(progression_Length == 3){
                                $A.util.removeClass(bottom_branch, 'z-opacity');
                            }else if(progression_Length == 4){
                                $A.util.addClass(bottom_branch, 'z-opacity');
                            }
                            $A.util.removeClass(green_branch, 'z-opacity');
                        }
                    }
                }
            }else if(component.get('v.progression').length == 2){
                for(var i=0; i<component.get('v.progression').length; i++){
                    //component.set('v.ProgressionSalesStage',component.get('v.progression'));
                    component.set('v.previousSalesStage',component.get('v.progression')[0]);
                    if(component.get('v.progression')[i] == component.get('v.Selected_Stage_Name')){
                        helper.Prev(component, event,i,component.get('v.progression'));
                        if(component.get('v.hasPrevVal')){
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            var green_Branch = width;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                        }else{
                            $A.util.removeClass(bottom_branch, 'activated');
                            $A.util.addClass(green_branch, 'activated');
                            width = width/progression_Length-1;
                            var green_Branch = width;
                            green_Branch = green_Branch - width;
                            component.set('v.green_Branch','width:'+green_Branch+'%;');
                        }
                    }
                }
                //component.set('v.progressionIndicator',component.get('v.progression'));
                $A.util.addClass(bottom_branch, 'z-opacity');
            }else if(component.get('v.progression').length == 1){
                $A.util.addClass(bottom_branch, 'z-opacity');
            }
        }
        for(var i=0; i<child_Progression_Id.length; i++){
            if(child_Progression_Id[i].get('v.Stage_Name') == sales_Stage_Name){
                helper.saveSelectedSalesStage(component, event,sales_Stage_Name);
                child_Progression_Id[i].selectActStage(true);
            }else{
                child_Progression_Id[i].selectActStage(false);
            }
            
        }
    }
})