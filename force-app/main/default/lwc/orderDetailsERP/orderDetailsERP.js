import { LightningElement, track } from 'lwc';
import getOrdersByAccountId from '@salesforce/apex/OrderController.getOrdersByAccountId';

export default class OrderListByAccount extends LightningElement {
    @track accountId = '';
    @track orders = null;
    @track error = '';

    handleAccountIdChange(event) {
        this.accountId = event.target.value;
    }

    fetchOrders() {
        this.error = '';
        this.orders = null;

        if (!this.accountId) {
            this.error = 'Please enter a valid Account ID.';
            return;
        }

        getOrdersByAccountId({ accountId: this.accountId })
            .then(result => {
                this.orders = result;
            })
            .catch(error => {
                this.error = error.body ? error.body.message : error.message;
            });
    }
}