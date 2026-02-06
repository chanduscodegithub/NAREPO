import { LightningElement,wire } from 'lwc';
import todayEvents from '@salesforce/apex/CalendarController.getTodayEvents';
import { NavigationMixin } from 'lightning/navigation';
/* eslint-disable no-console */
/* eslint-disable no-alert */

export default class CalendarDailyEvents extends NavigationMixin( LightningElement){
    @wire(todayEvents)
    calendarEvents;

    get isEmpty(){
        if(this.calendarEvents.data !== undefined && this.calendarEvents.data.length > 0){
            return false;
        }
        return true;
    }

    navigateToRecordViewPage(eventRecordId) {
        // View a custom object record.
        console.log('eventId:'+eventRecordId);       
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId :eventRecordId ,
                objectApiName: 'Event', // objectApiName is optional
                actionName: 'view'
            }
        });
    }

    handleClick(event) {
        // Stop the event's default behavior (don't follow the HREF link) and prevent click bubbling up in the DOM...
        event.preventDefault();
        event.stopPropagation();
        // Navigate as requested...        
        this.navigateToRecordViewPage(event.target.dataset.recordId);
        //Reference : https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/dataset%20
    }

    navigateToEventHomePage() {
        // Navigate to the Account home page
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Event',
                actionName: 'home',
            },
        });
    }
}