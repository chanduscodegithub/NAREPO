import { LightningElement } from 'lwc';
export default class MyLwcForm extends LightningElement {
    firstName = '';
    lastName = '';

    handleInput(event) {
        const field = event.target.label;
        if (field === 'First Name') this.firstName = event.target.value;
        if (field === 'Last Name') this.lastName = event.target.value;

        if (this.firstName || this.lastName) {
            this.dispatchEvent(new CustomEvent('notifychange'));
            console.log('change');
        } else {
            this.dispatchEvent(new CustomEvent('notifysave'));
            console.log('not a change');
        }
        
    }
 
    handleSave() {

        console.log('Saving:', this.firstName, this.lastName);
        

        this.dispatchEvent(new CustomEvent('notifysave'));
    }
}