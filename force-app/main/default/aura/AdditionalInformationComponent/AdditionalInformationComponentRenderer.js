({
   afterRender: function (component, helper) {
        console.log('after render');
        this.superAfterRender();
        component.set("v.isRendered",true);
   }
})