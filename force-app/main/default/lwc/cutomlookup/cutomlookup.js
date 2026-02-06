/* eslint-disable no-console */
import { LightningElement, track, api } from 'lwc';

const MINIMAL_SEARCH_TERM_LENGTH = 2; // Min number of chars required to search
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

export default class Lookup extends LightningElement {

    @api label;
    @api selection = [];
    @api placeholder = '';
    @api isMultiEntry = false;
    @api errors = [];
    @api scrollAfterNItems;
    @api customKey;

    @track searchTerm = '';
    @track searchResults = [];
    @track hasFocus = false;
    @track hasSelectedId;

    cleanSearchTerm;
    blurTimeout;
    searchThrottlingTimeout;

    // EXPOSED FUNCTIONS

    @api
    setSearchResults(results, icon) {
        this.searchResults = results.map(result => {
            if (typeof icon === 'undefined') {
                result.icon = 'standard:default';
            } else {
                result.icon = icon;
            }
            return result;
        });
    }

    @api
    getSelection() {
        return this.selection;
    }

    @api
    getkey() {
        return this.customKey;
    }

    get getSelectedId() {
        return (this.selection[0].id !== undefined && this.selection[0].id !== '') ? true : false;
    }


    // INTERNAL FUNCTIONS

    updateSearchTerm(newSearchTerm) {
        this.searchTerm = newSearchTerm;

        // Compare clean new search term with current one and abort if identical
        const newCleanSearchTerm = newSearchTerm.trim().replace(/\*/g, '').toLowerCase();
        if (this.cleanSearchTerm === newCleanSearchTerm) {
            return;
        }

        // Save clean search term
        this.cleanSearchTerm = newCleanSearchTerm;

        // Ignore search terms that are too small
        if (newCleanSearchTerm.length < MINIMAL_SEARCH_TERM_LENGTH) {
            this.searchResults = [];
            return;
        }

        // Apply search throttling (prevents search if user is still typing)
        if (this.searchThrottlingTimeout) {
            clearTimeout(this.searchThrottlingTimeout);
        }
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.searchThrottlingTimeout = setTimeout(() => {
            // Send search event if search term is long enougth
            if (this.cleanSearchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
                let lookupData = {};
                lookupData.placeholder = this.placeholder;
                lookupData.results = { searchTerm: this.cleanSearchTerm, selectedIds: this.selection.map(element => element.id) }
                const searchEvent = new CustomEvent('search', {
                    detail: lookupData
                });
                this.dispatchEvent(searchEvent);
            }
            this.searchThrottlingTimeout = null;
        },
            SEARCH_DELAY
        );
    }

    isSelectionAllowed() {
        if (this.isMultiEntry) {
            return true;
        }
        return !this.hasSelection();
    }

    hasResults() {
        return this.searchResults.length > 0;
    }

    hasSelection() {
        if (this.selection !== undefined) {
            return this.selection.length > 0;
        }
        return false;
    }


    // EVENT HANDLING

    handleInput(event) {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        this.updateSearchTerm(event.target.value);

    }

    validateInput() {
        console.log('Input out called ');
        if (this.updateSearchTerm.length > 0 && this.hasSelectedId !== null) {
            console.log('data selcted');
        } else if (this.updateSearchTerm.length === 0 && (this.hasSelectedId === null || this.hasSelectedId === '' || this.hasSelectedId === undefined)) {
            console.log('Throw error ');
        }
    }


    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;
        this.hasSelectedId = [];
        if (event.currentTarget.dataset.recordid !== null &&
            event.currentTarget.dataset.recordid !== undefined &&
            event.currentTarget.dataset.recordid !== '') {
            this.hasSelectedId = event.currentTarget.dataset.recordid;
        }
        let selectedData = {};
        // Save selection
        let selectedItem = this.searchResults.filter(result => result.id === recordId);
        if (selectedItem.length === 0) {
            return;
        }
        selectedItem = selectedItem[0];
        const newSelection = [...this.selection];
        newSelection.push(selectedItem);
        this.selection = newSelection;

        // Reset search
        this.searchTerm = '';
        this.searchResults = [];
        selectedData.placeholder = this.placeholder;
        selectedData.selectionData = this.selection;
        selectedData.isRemove = false;
        // Notify parent components that selection has changed
        this.dispatchEvent(new CustomEvent('selectionchange', { detail: selectedData }));
    }

    handleComboboxClick() {
        // Hide combobox immediatly
        if (this.blurTimeout) {
            window.clearTimeout(this.blurTimeout);
        }
        this.hasFocus = false;
    }

    handleFocus() {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        this.hasFocus = true;
    }

    handleBlur() {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        // Delay hiding combobox so that we can capture selected result
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.blurTimeout = window.setTimeout(() => {
            this.hasFocus = false;
            this.blurTimeout = null;
        },
            300
        );
    }

    handleRemoveSelectedItem(event) {
        console.log('handleRemoveSelectedItem method has been called');
        const recordId = event.currentTarget.name;
        this.selection = this.selection.filter(item => item.id !== recordId);
        // Notify parent components that selection has changed
        this.dispatchEvent(new CustomEvent('selectionchange', { detail: this.selection }));
    }

    handleClearSelection() {
        console.log('handleClearSelection method has been called');
        this.selection = [];
        let selectedData = {};
        // Notify parent components that selection has changed
        selectedData.isRemove = true;
        selectedData.placeholder = this.placeholder;
        selectedData.selectionData = [];
        this.dispatchEvent(new CustomEvent('selectionchange', { detail: selectedData }));
    }


    // STYLE EXPRESSIONS

    get getContainerClass() {
        let css = 'slds-combobox_container slds-has-inline-listbox ';
        if (this.hasFocus && this.hasResults()) {
            css += 'slds-has-input-focus ';
        }
        if (this.errors.length > 0) {
            css += 'has-custom-error';
        }
        return css;
    }

    get getDropdownClass() {
        let css = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ';
        if (this.hasFocus && this.hasResults()) {
            css += 'slds-is-open';
        } else {
            css += 'slds-combobox-lookup';
        }
        return css;
    }

    get getInputClass() {
        let css = 'slds-input slds-combobox__input has-custom-height '
            + (this.errors.length === 0 ? '' : 'has-custom-error ');
        if (!this.isMultiEntry) {
            css += 'slds-combobox__input-value '
                + (this.hasSelection() ? 'has-custom-border' : '');
        }
        return css;
    }

    get getComboboxClass() {
        let css = 'slds-combobox__form-element slds-input-has-icon ';
        if (this.isMultiEntry) {
            css += 'slds-input-has-icon_right';
        } else {
            css += (this.hasSelection() ? 'slds-input-has-icon_left-right' : 'slds-input-has-icon_right');
        }
        return css;
    }

    get getSearchIconClass() {
        let css = 'slds-input__icon slds-input__icon_right ';
        if (!this.isMultiEntry) {
            css += (this.hasSelection() ? 'slds-hide' : '');
        }
        return css;
    }

    get getClearSelectionButtonClass() {
        return 'slds-button slds-button_icon slds-input__icon slds-input__icon_right '
            + (this.hasSelection() ? '' : 'slds-hide');
    }

    get getSelectIconName() {
        return this.hasSelection() ? this.selection[0].icon : 'standard:default';
    }

    get getSelectIconClass() {
        return 'slds-combobox__input-entity-icon '
            + (this.hasSelection() ? '' : 'slds-hide');
    }

    get getInputValue() {
        if (this.isMultiEntry) {
            return this.searchTerm;
        }
        return this.hasSelection() ? this.selection[0].title : this.searchTerm;
    }

    get getListboxClass() {
        return 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid '
            + (this.scrollAfterNItems ? 'slds-dropdown_length-with-icon-' + this.scrollAfterNItems : '');
    }

    get isInputReadonly() {
        if (this.isMultiEntry) {
            return false;
        }
        return this.hasSelection();
    }

    get isExpanded() {
        return this.hasResults();
    }

    connectedCallback() {
        /*let selectedData = {};
        this.selection = newSelection;

        // Reset search
        this.searchTerm = '';
        this.searchResults = [];
        selectedData.placeholder = this.placeholder;
        selectedData.selectionData = this.selection;
        selectedData.isRemove = false;*/
        console.log('Selected data in connected call back ' + this.selection);
        if (this.selection !== null && this.selection !== undefined) {
            if (this.selection[0].title === '') {
                this.handleClearSelection();
            }
        }
    }
}