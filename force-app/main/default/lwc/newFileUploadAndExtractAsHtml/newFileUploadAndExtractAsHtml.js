import { LightningElement, track, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { CloseActionScreenEvent } from 'lightning/actions';
import { loadScript } from 'lightning/platformResourceLoader';
import Mammoth_Min from '@salesforce/resourceUrl/mammoth_min';
import getFileContent from '@salesforce/apex/OpenAIController.getFileContent';
import startBatchProcessing from '@salesforce/apex/OpenAIController.startBatchProcessing';
import updateRFPDigitize from '@salesforce/apex/OpenAIController.updateRFPDigitize';
import getRFPStatus from '@salesforce/apex/OpenAIController.getRFPStatus';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import DOCX_IMAGE from '@salesforce/resourceUrl/Docximage';


export default class NewFileUploadAndExtractAsHtml extends LightningElement {
    @track openModal = false;
    @track ExtractedJson = '';
    @track fileContent = '';
    @track fileName = '';
    @track errorMessage = '';
    @api recordId;
    @track showFileNotFoundMessage = false;
    @track mammothLoaded = false;
    textChunks = [];
    @track isProcessing = false;
    @track showConfirmationModal = false;
    @track isButtonDisabled = false;
    @track rfpStatus;
    @track showMainContent = true; // New: Controls visibility of the main confirmation prompt
    docxImageUrl = DOCX_IMAGE;

    @wire(getRFPStatus, { rfpId: '$recordId' })
    wiredRFPStatus({ error, data }) {
        if (data) {
            this.rfpStatus = data;
            if (this.rfpStatus !== 'New') {
                this.isButtonDisabled = true;
                this.errorMessage = 'RFP status: ' + this.rfpStatus + ".We can't re-initiate the RFP Review. Please upload a new Response Document or contact your administrator.";
                this.showFileNotFoundMessage = true; // Show the error message section
                this.showMainContent = false; // Hide the main confirmation prompt
            } else {
                // If status is 'New', ensure main content is visible and button is enabled initially
                this.isButtonDisabled = false;
                this.showMainContent = true;
                this.errorMessage = ''; // Clear any previous error messages
                this.showFileNotFoundMessage = false;
            }
        } else if (error) {
            console.error('Error fetching RFP status:', error);
            this.errorMessage = 'Error fetching RFP status: ' + error.body?.message + '. Please contact your administrator.';
            this.showFileNotFoundMessage = true;
            this.showMainContent = false; // Hide the main confirmation prompt on error
        }
    }

    connectedCallback() {

        if (!this.mammothLoaded) {
            loadScript(this, Mammoth_Min)
                .then(() => {
                    this.mammothLoaded = true;
                })
                .catch(error => {
                    console.error('Mammoth.js failed to load:', error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Failed to load document processor: ' + error.message,
                            variant: 'error'
                        })
                    );
                    this.errorMessage = 'Failed to load document processor: ' + error.message;
                    this.showFileNotFoundMessage = true; // Show error message
                    this.showMainContent = false; // Hide main content
                });
        }

        if (!this.recordId) {
            setTimeout(() => {
                if (this.recordId) {
                    this.fetchFileContent();
                } else {
                    this.errorMessage = 'Record ID is missing or not available.';
                    this.showFileNotFoundMessage = true;
                    this.showMainContent = false;
                }
            }, 1000);
        } else {
            this.fetchFileContent();
        }
    }

    get isContinueDisabled() {
    return this.isButtonDisabled || !this.fileName || !this.fileContent;
}


    fetchFileContent() {
        // Clear previous state before fetching new content
        this.fileContent = '';
        this.fileName = '';
        // Do NOT clear errorMessage or showFileNotFoundMessage here immediately,
        // as the wired method might be setting it.
        // We'll let the wired method or specific error/success paths manage these.

        getFileContent({ recordId: this.recordId })
            .then(result => {
                if (result && result.content && result.fileName) {
                    this.fileContent = result.content;
                    this.fileName = result.fileName;
                    // If file found and status is 'New', then show main content
                    if (this.rfpStatus === 'New') {
                        this.showMainContent = true;
                        this.showFileNotFoundMessage = false; // Hide file not found/error messages
                        this.errorMessage = '';
                    } else if (!this.rfpStatus) {
                        // Edge case: if wire method hasn't returned yet, assume new for now
                        // and let wire method correct it. Or, handle as a loading state.
                        // For simplicity, we'll rely on the wire method to set correct state.
                    }
                } else {
                    this.showFileNotFoundMessage = true;
                    this.errorMessage = 'No file content found for this RFP. Please upload a file and try again.';
                    this.showMainContent = false; // Hide the main confirmation prompt
                    this.isButtonDisabled = true; // Also disable the button if no file
                }
            })
            .catch(error => {
                console.error('Error fetching file content:', error);
                this.errorMessage = error.body?.message || 'An error occurred while fetching the file.';
                this.showFileNotFoundMessage = true;
                this.showMainContent = false; // Hide the main confirmation prompt
                this.isButtonDisabled = true; // Disable button on fetch error
            });
    }

    handleConfirmation(event) {
        const action = event.target.dataset.value;

        if (action === 'confirm') {
            // Disable the button immediately on first click
            this.isButtonDisabled = true; 
            this.showMainContent = false; // Hide the current prompt
            this.isProcessing = true; // Show spinner

            // 1. Close the modal (actually, quick action panel)
            // No, we want to show processing status, so don't close quick action here.
            // This is done in startBatchProcessing .then()

            // 2. Show ONLY the success toast (no spinner)
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'The RFP Review has started.',
                    variant: 'success',
                })
            );

            // 3. Run digitization in background (no extra toasts)
            updateRFPDigitize({ rfpId: this.recordId, newStatusDigitize: 'Digitization In-Progress' })
                .then(() => {
                    this.processFileContent();
                })
                .catch(error => {
                    console.error('Error updating RFP status:', error);
                    this.isButtonDisabled = false; // Re-enable if there's an error in status update
                    this.isProcessing = false; // Hide spinner
                    this.showMainContent = true; // Show original prompt for re-attempt
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Failed to update RFP status: ' + error.body.message,
                            variant: 'error'
                        })
                    );
                });

        } else if (action === 'cancel') {
            // 1. Just close the modal & quick action (no digitization)
            this.showConfirmationModal = false;
            this.closeQuickAction();
        }
    }

    showConfirmation() {
        this.showConfirmationModal = true;
    }

    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    processFileContent() {
        // ... (rest of your processFileContent logic remains the same)
        if (!this.mammothLoaded) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Document processor not loaded yet. Please try again.',
                    variant: 'error'
                })
            );
            this.isProcessing = false;
            this.isButtonDisabled = false; // Re-enable on error
            this.showMainContent = true; // Show original prompt for re-attempt
            return;
        }

        if (!this.fileContent) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'No file content to process.',
                    variant: 'error'
                })
            );
            this.isProcessing = false;
            this.isButtonDisabled = true; // Keep disabled as no file
            this.showMainContent = false; // No file, so no main content
            return;
        }

        const arrayBuffer = this.base64ToArrayBuffer(this.fileContent);
        
        window.mammoth.convertToHtml({ arrayBuffer })
            .then((result) => {
                const jsonOutput = this.cleanAndFormatContent(result.value);
                this.ExtractedJson = jsonOutput;
                this.splitTextIntoChunks(jsonOutput);
                this.startBatchProcessing();
            })
            .catch(error => {
                console.error('Error during Mammoth.js conversion:', error);
                this.isProcessing = false;
                this.isButtonDisabled = false; // Re-enable on error
                this.showMainContent = true; // Show original prompt for re-attempt
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to convert document: ' + error.message,
                        variant: 'error'
                    })
                );
            });
    }

    base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }


    cleanAndFormatContent(htmlContent) {
        const output = [];
        let textBuffer = [];
        let position = 0;

        htmlContent.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableHtml, offset) => {
            const textBefore = htmlContent.slice(position, offset)
                .replace(/<(\/p|\/div|br)[^>]*>/gi, '\n')
                .replace(/<[^>]+>/g, ' ')
                .trim();

            if (textBefore) textBuffer.push(textBefore);
            position = offset + match.length;

            const tableContent = this.processTable(tableHtml);
            if (tableContent) {
                                                                    
                const tableObj = {
                    type: "table", 
                    content: tableContent
                };


                if (textBuffer.length > 0) {
                    output.push({
                        type: "text",
                        content: textBuffer.join('\n')
                    });
                    textBuffer = [];
                }
                output.push(tableObj);
            } else {
                const tableText = this.extractTableAsText(tableHtml);
                textBuffer.push(tableText);
            }

            return '';
        });

        const finalText = htmlContent.slice(position)
            .replace(/<(\/p|\/div|br)[^>]*>/gi, '\n')
            .replace(/<[^>]+>/g, ' ')
            .trim();

        if (finalText) textBuffer.push(finalText);
        if (textBuffer.length > 0) {
            output.push({
                type: "text",
                content: textBuffer.join('\n')
            });
        }

        return JSON.stringify(output, null, 2);
    }

    processTable(tableHtml) {
        let rows = [];
        let maxColumns = 0;

        tableHtml.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, (rowHtml) => {
            const cells = [];
            rowHtml.replace(/<t(h|d)[^>]*>([\s\S]*?)<\/t(h|d)>/gi, (_, __, content) => {
                const cleaned = content.replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                cells.push(cleaned);
                return '';
            });
            if (cells.length > 0) {
                rows.push(cells);
                maxColumns = Math.max(maxColumns, cells.length);
            }
            return '';
        });

        rows = rows.map(row =>
            [...row, ...Array(maxColumns - row.length).fill("")]
        );

        if (rows.length >= 3 && maxColumns >= 2) {
            return rows.reduce((acc, row, index) => {
                acc[`row${index + 1}`] = row.reduce((rowAcc, cell, cellIndex) => {
                    rowAcc[`col${cellIndex + 1}`] = cell || "";
                    return rowAcc;
                }, {});
                return acc;
            }, {});
        }

        return null;
    }

    extractTableAsText(tableHtml) {
        return tableHtml.replace(/<tr/g, '\n<tr')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    splitTextIntoChunks(jsonText) {
       
        const CHUNK_SIZE = 4 * 1024;  // 9 KB chunk size

        this.textChunks = [];

        try {
            const parsedData = JSON.parse(jsonText);

            let currentChunk = [];
            let currentLength = 2;  // Starting with 2 to account for the array brackets in the chunk

            let buffer = null; // Holds version header + content together

            parsedData.forEach((item, index) => {
                const contentString = typeof item.content === 'object' 
                    ? JSON.stringify(item.content)
                    : String(item.content).trim();

                const paragraphs = contentString.split('\n');

                for (let paraIndex = 0; paraIndex < paragraphs.length; paraIndex++) {
                    const paragraph = paragraphs[paraIndex].trim();
                    if (!paragraph) continue;

                    const isVersionStart = /^(\d+(\.\d+)+)/.test(paragraph);

                    if (isVersionStart) {
                        // If there's buffered version block, push it to currentChunk
                        if (buffer) {
                            const paraString = JSON.stringify({ type: item.type, content: buffer });
                            const commaLength = currentChunk.length === 0 ? 0 : 1;

                            if (currentLength + paraString.length + commaLength <= CHUNK_SIZE) {
                                currentChunk.push(paraString);
                                currentLength += paraString.length + commaLength;
                            } else {
                                this.textChunks.push(`[${currentChunk.join(',')}]`);
                                currentChunk = [paraString];
                                currentLength = 2 + paraString.length;
                            }

                            buffer = null;
                        }

                        // Start new buffer with this version line
                        buffer = paragraph;
                    } else {
                        // Add paragraph to buffer if version was pending
                        if (buffer) {
                            buffer += '\n' + paragraph;
                        } else {
                            buffer = paragraph;
                        }
                    }
                }
            });

            // Push the last buffered block
            if (buffer) {
                const paraString = JSON.stringify({ type: 'text', content: buffer });
                const commaLength = currentChunk.length === 0 ? 0 : 1;

                if (currentLength + paraString.length + commaLength <= CHUNK_SIZE) {
                    currentChunk.push(paraString);
                    currentLength += paraString.length + commaLength;
                } else {
                    this.textChunks.push(`[${currentChunk.join(',')}]`);
                    currentChunk = [paraString];
                    currentLength = 2 + paraString.length;
                }
            }

            if (currentChunk.length > 0) {
                this.textChunks.push(`[${currentChunk.join(',')}]`);
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            this.textChunks = jsonText.match(new RegExp(`[\s\S]{1,${CHUNK_SIZE}}`, 'g')) || [];
        }


        // Merge small chunks into larger ones up to 8 KB
        const MAX_SIZE = 8 * 1024;
        let currentChunk = [];
        let currentSize = 0;

        let tempChunks = this.textChunks.map(chunk => JSON.parse(chunk));
        this.textChunks = [];

        tempChunks.forEach((chunk, index) => {
            const chunkStr = JSON.stringify(chunk);
            const chunkSize = new Blob([chunkStr]).size;

            if (currentSize + chunkSize <= MAX_SIZE) {
                currentChunk.push(...chunk);
                currentSize += chunkSize;
            } else {
                if (currentChunk.length > 0) {
                    this.textChunks.push(JSON.stringify(currentChunk));
                }
                currentChunk = [...chunk];
                currentSize = chunkSize;
            }
        });

        if (currentChunk.length > 0) {
            this.textChunks.push(JSON.stringify(currentChunk));
        }

        return this.textChunks;
    }

    startBatchProcessing() {
        startBatchProcessing({ 
            rfpId: this.recordId, 
            chunks: this.textChunks 
        })
        .then(() => {
            this.isProcessing = false;
            this.closeQuickAction(); // Close the quick action after successful batch start
        })
        .catch(error => {
            console.error('Error starting batch:', error);
            this.isProcessing = false;
            this.isButtonDisabled = false; // Re-enable on batch start error
            this.showMainContent = true; // Show original prompt for re-attempt
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Failed to start batch processing: ' + error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}