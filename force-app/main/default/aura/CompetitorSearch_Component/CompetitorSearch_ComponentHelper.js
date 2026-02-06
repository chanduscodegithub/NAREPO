({
    getProducts : function(cmp,event,page,selectedTab,productType) {
        console.log('Helper');
        var searchKeyVal = cmp.find("Srch_By_cmp_Name").get('v.value');
        searchKeyVal = (searchKeyVal != undefined && searchKeyVal != null) ? searchKeyVal : '';
        
        /*var tabNamesArray = cmp.find("TabView").getElement().childNodes;
        if(tabNamesArray != undefined && tabNamesArray != null) {
            for(var i=0; i<tabNamesArray.length; i++) {
                $A.util.removeClass(cmp.find(tabNamesArray[i].id), " focusTab");
            } 
        }*/
        
        var action = cmp.get("c.queryProducts");
        console.log('selectedTab : '+selectedTab);
        action.setParams({
            "searchKeyVal1" : searchKeyVal,
            "pageNumber" : page,           
            "selectedTab" : selectedTab,
            "productLine" : productType
        });
        var spinner = cmp.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('Inside Competitor Add');
            if (state === "SUCCESS") {
                var searchKeyText1 = cmp.find("Srch_By_cmp_Name").get('v.value');
                if(searchKeyText1 != undefined && searchKeyText1 != null && searchKeyText1.trim().length > 0) {
                    cmp.find('goBtn').set("v.disabled",false);
                    cmp.find('clrBtn').set("v.disabled",false);
                }else {
                    cmp.find('goBtn').set("v.disabled",true);
                    cmp.find('clrBtn').set("v.disabled",true);
                }
                var productsListResponse = response.getReturnValue();
                var tabNamesArray = cmp.find("TabView").getElement().childNodes;
                if(tabNamesArray != undefined && tabNamesArray != null) {
                    for(var i=0; i<tabNamesArray.length; i++) {
                        $A.util.removeClass(cmp.find(tabNamesArray[i].id), "slds-is-active");
                    } 
                }
                if(searchKeyVal == undefined || searchKeyVal == null || searchKeyVal.length == 0) {
                   $A.util.addClass(cmp.find(selectedTab), "slds-is-active");
                }
                /*if(searchKeyVal.length > 0 && productsListResponse != undefined && productsListResponse != null && 
                   		productsListResponse.activeTabsMap != undefined && productsListResponse.activeTabsMap != null) {
                    var activeTabs = productsListResponse.activeTabsMap;
                    if(activeTabs != undefined && activeTabs != null) {
                        if(tabNamesArray != undefined && tabNamesArray != null) {
                            for(var i=0; i<tabNamesArray.length; i++) {
                                if(activeTabs[tabNamesArray[i].id] != undefined && activeTabs[tabNamesArray[i].id] != null &&
                                  		activeTabs[tabNamesArray[i].id]) {
                                	$A.util.addClass(cmp.find(tabNamesArray[i].id), " focusTab");
                                }
                            } 
                        }
                    }
                }*/
                if(productsListResponse.total == 0){
                    cmp.set('v.isProductEmpty',true);
                }else{
                    cmp.set('v.productsdata',productsListResponse.ProductList);
                    cmp.set('v.isProductEmpty',false);
                    var competitorSrchId = cmp.find('ProductSearchId');
                    var selectedProducts = cmp.get('v.selectedProducts');
                    if(Array.isArray(competitorSrchId)) {
                        if(selectedProducts.length >0){  
                            for(var i=0; i<competitorSrchId.length; i++){
                                for(var j=0; j<selectedProducts.length; j++){
                                    if(competitorSrchId[i].get('v.competitorList') != undefined && selectedProducts[j] != undefined && 
                                       	 competitorSrchId[i].get('v.competitorList') != null && selectedProducts[j] != null && 
                                       		(competitorSrchId[i].get('v.competitorList').Id == selectedProducts[j].Id)){
                                        competitorSrchId[i].deSelectCheckBox(true,selectedProducts[j].prodCat);
                                    }
                                }
                                
                            }
                        }  
                    }else{
                        for(var j=0; j<selectedProducts.length; j++){
                            if(competitorSrchId.get('v.competitorList') != undefined && selectedProducts[j] != undefined &&
                               	competitorSrchId.get('v.competitorList') != null && selectedProducts[j] != null &&
                               		competitorSrchId.get('v.competitorList').Id == selectedProducts[j].Id){
                                competitorSrchId.deSelectCheckBox(true,selectedProducts[j].prodCat);
                            }
                        }
                    }                
                }
                cmp.set("v.page", productsListResponse.page);
                cmp.set("v.total", productsListResponse.total);
                cmp.set("v.pages", Math.ceil(productsListResponse.total/productsListResponse.pageSize));
                $A.util.addClass(spinner, "slds-hide");
            }
            else if (state === "INCOMPLETE") {
                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    saveProd: function(component,event) {
        var action = component.get("c.createOppLineItm");
        action.setParams({
            oppId : component.get('v.recordId'),
            prod : component.get('v.selectedProducts')
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log(response);
            }
            else if (state === "INCOMPLETE") {
                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    selectedTabHelper : function(component, event,selectedTab) {
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
        component.set('v.selectedTab',selectedTab);
        this.getProducts(component, event,1,selectedTab,component.get('v.productType'));
    }
})