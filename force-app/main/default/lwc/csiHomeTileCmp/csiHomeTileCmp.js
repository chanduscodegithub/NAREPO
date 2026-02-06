import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import saveLink from '@salesforce/apex/HotTopics.saveLinkToHotTopics';
import fetchTopics from '@salesforce/apex/HotTopics.queryHotTopics';
import deleteTopic from '@salesforce/apex/HotTopics.deleteHotTopic';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import profileName from '@salesforce/apex/HotTopics.profileName';

export default class CsiHomeTileCmp extends NavigationMixin(LightningElement) {
    addNewLink = false;
    labelValue;
    linkValue;
    @track listOfHotTopics;
    recordIdValue;
    profileName;
    showButtons = false;

    connectedCallback() {
        this.fetchHotTopics();
        this.fetchProfileName();
    }
    
    fetchProfileName(){
        profileName({})
        .then(result =>{
            this.profileName = result;

            if(this.profileName == 'System Administrator'  || this.profileName == 'CSI Administrator'){
                this.showButtons = true;
            }
        })
        .catch(error =>{
            console.log('Error1 ' + JSON.stringify(error));
        });
    }

    handleClick(event) {
        //alert('handleClick');
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: event.target.dataset.objname,
                actionName: 'home'
            }
        }).then(url => {
            window.open(url);
        });
    }

    openModal(event) {
        if (event.target.dataset.whichbutton == 'editButton') {
            console.log('Inside Edit Button');
            this.addNewLink = true;
            this.labelValue = event.target.dataset.labelvalue;
            this.linkValue = event.target.dataset.linkvalue;
            this.recordIdValue = event.target.dataset.recordidvalue;
        }
        else {
            console.log('Inside Else');
            this.addNewLink = true;
            this.labelValue = '';
            this.linkValue = '';
            this.recordIdValue = '';
        }
    }

    closeModal() {
        this.addNewLink = false;
        //Clear Values in input boxes
    }

    fetchHotTopics() {
        fetchTopics({})
            .then(result => {
                this.listOfHotTopics = result;
            })
            .catch(error => {
                console.log('Error2 ' + JSON.stringify(error));
            });
    }

    saveLinkToHotTopics() {
        var linkSelector = this.template.querySelector('.linkClass');
        var labelSelector = this.template.querySelector('.labelClass');

        if (labelSelector != null && labelSelector != undefined && labelSelector != '') {
            this.labelValue = labelSelector.value;
            console.log('labelValue ' + this.labelValue);
        }

        if (linkSelector != null && linkSelector != undefined && linkSelector != '') {
            this.linkValue = linkSelector.value;
            console.log('linkValue ' + this.linkValue);
        }

        if ((this.labelValue != null && this.labelValue != undefined && this.labelValue != '') &&
            (this.linkValue != null && this.linkValue != undefined && this.linkValue != '')) {
            saveLink({ label: this.labelValue, link: this.linkValue, recordIdValue: this.recordIdValue })
                .then(result => {
                    console.log('Saved ' + JSON.stringify(result));
                    this.listOfHotTopics = result;
                    this.labelValue = '';
                    this.linkValue = '';
                    this.addNewLink = false;
                })
                .catch(error => {
                    console.log('Error3 ' + JSON.stringify(error));
                });
        }
        else {
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please Fill both the fields',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    deleteHomeTile(event) {
        for(let i in this.listOfHotTopics){
            if(this.listOfHotTopics[i].Id == event.target.dataset.recordidvalue){
                this.listOfHotTopics.splice(i,1);
            }
        }
        deleteTopic({ recordIdValue: event.target.dataset.recordidvalue })
            .then(result => {
                console.log('Hot Topic Deleted');
            })
            .catch(error => {
                console.log('Error4 ' + JSON.stringify(error));
            });
    }
}