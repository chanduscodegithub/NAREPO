import { LightningElement, track } from 'lwc';
import getOrders from '@salesforce/apex/NativeOrders.getOrders';

export default class OrderList extends LightningElement {
    @track orders = [];
    @track error;
    @track isLoading = false;
    @track showNoDataMessage = false;
    @track hasOrders = false; // Track for data presence

    columns = [
        { label: 'Order ID', fieldName: 'jdeOrder', type: 'number' },
        { label: 'Order Number', fieldName: 'orderNumber', type: 'text' },
        { label: 'Status', fieldName: 'status', type: 'text' },
        { label: 'Po Number', fieldName: 'poNumber', type: 'text' }
        // add other columns as needed
    ];

    connectedCallback() {
        this.fetchOrders();
    }

    fetchOrders() {
        this.isLoading = true;
        this.error = undefined;
        this.showNoDataMessage = false;
        this.hasOrders = false; // reset

        const soldTo = '111554'; 
        const poNumber = 'RdH Test_v5 300625_1';

        getOrders({ soldTo, poNumber })
            .then(result => {
                console.log('Result:', JSON.stringify(result));
                this.orders = result;
                // Check if data exists
                this.hasOrders = result && result.length > 0;
                this.showNoDataMessage = !this.hasOrders;
                this.isLoading = false;
            })
            .catch(error => {
                console.log('Error from getOrders:', error);
                this.error = error?.body?.message || error;
                this.orders = [];
                this.hasOrders = false;
                this.isLoading = false;
                this.showNoDataMessage = false;
            });
    }
}