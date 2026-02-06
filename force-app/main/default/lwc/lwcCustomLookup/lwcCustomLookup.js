import { LightningElement,api,track } from 'lwc';
import getResults from '@salesforce/apex/UnderwriterData.getUnderwriters';

export default class LwcCustomLookup extends LightningElement {   
    @api selectRecordName;  
    @api searchRecords = []; 
    @api LoadingText = false;
    @track txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track messageFlag = false;
    @track iconFlag =  true;
    @track clearIconFlag = false;
    @track inputReadOnly = false;
    inputText = '';
    selRecord = false;
    isDisable = '';

    @api
    focusInupt(){
        console.log('inside lwc focus'); 
        this.template.querySelector(`[data-id="userinput"]`).focus();
    }

    connectedCallback(){
        if(this.selectRecordName !== null && this.selectRecordName !== undefined && this.selectRecordName !== ''){
            this.inputReadOnly = true;
            this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            this.iconFlag = false;
            this.clearIconFlag = true;
            this.isDisable = 'avoid-clicks';
        }
    } 

    searchField(event) {
        //var currentText = '';
        //this.inputText = '';
        this.LoadingText = true;
        if(event !== undefined){
            //currentText = event.target.value;
            this.inputText = event.target.value;
        }       
        this.selRecord = false;
        getResults({ searchText: this.inputText  })
        .then(result => {
            this.searchRecords= result;
            this.LoadingText = false;            
            this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';          
        })
        .catch(error => {
            console.log('-------error-------------'+error);
            console.log(error);
        });            
    }

    getDefaultRecords(){         
        this.searchField();     
    }

    hideSearchList(){
        console.log('Hide list'); 
        const _this = this;
        const selectName = this.inputText;  
        setTimeout(() => {
            if(_this.selRecord === false){
                //const selectedEvent = new CustomEvent('selected', { detail: {selectName}});      
                //_this.dispatchEvent(selectedEvent);         
                _this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            }           
        }, 250);     
    }
    
   setSelectedRecord(event) {      
        this.selRecord = true; 
        var selectName = event.currentTarget.dataset.name;
        this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        this.iconFlag = false;
        this.clearIconFlag = true;
        this.isDisable = 'avoid-clicks';
        this.selectRecordName = event.currentTarget.dataset.name;     
        this.inputReadOnly = true;
        const selectedEvent = new CustomEvent('selected', { detail: {selectName}});
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }
    
    resetData(event) {
        this.selectRecordName = "";  
        this.inputText = '';    
        this.inputReadOnly = false;
        this.iconFlag = true;
        this.clearIconFlag = false;
        this.template.querySelector(`[data-id="userinput"]`).focus();
        var selectName = '';  
        this.isDisable = '';     
        const selectedEvent = new CustomEvent('selected', { detail: {selectName}});
        this.dispatchEvent(selectedEvent);       
    }

}