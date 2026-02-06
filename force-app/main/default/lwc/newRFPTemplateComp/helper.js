/**
 * @param {Object} object
 * @param {String} keys 
 */
export function accessDataFromString( object, keys ) {
    keys = keys.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    keys = keys.replace(/^\./, '');           // strip a leading dot
    const keysArray = keys.split('.');

    for( let key of keysArray ){
        if( key in object ) {
            object = object[ key ];
        } else {
            return '';
        }
    }

    return object;
}

/**
 * 
 * @param {String} XML 
 * @param {String} regex 
 * @returns {Array<String>}
 */
export function extractXMLVariables( XML, regex ){
    return [ ...XML.matchAll( new RegExp( regex, 'g' ) ) ].map( elem => elem[0] );
}

/**
 * @param {String} xmlString 
 * @param {Array<String>} xmlVariablesToMap 
 * @param {Array<Map<String, String>>} object 
 * @param {Map<String, Array<String>>} fieldsToFormat 
 * @returns {String}
 */
export function mapValuesToXMLVariables( xmlString, xmlVariablesToMap, object, fieldsToFormat ){
    
    for (const xmlVariable of xmlVariablesToMap ) {
        let key = xmlVariable.replace('%%', '');
        key = key.replace('@@', '');

        let data = accessDataFromString( object, key );

        key = key.replace(/(\[+[0-9]+\])+[.]+/, '');
        key = key.replace('Account.', '');

        if( !isEmpty( data ) ){
            if( key in fieldsToFormat.Opportunity || key in fieldsToFormat.Account ){
                const fieldInfo = fieldsToFormat.Opportunity[ key ] || fieldsToFormat.Account[ key ]
                data = formatDataAsPerRequirement( data, fieldInfo, key );
            }
        }

        xmlString = xmlString.replace( xmlVariable, replaceXmlSpecialCharacters( data ) );
    }

    return xmlString;
}

/**
 * @param {String} xmlString 
 * @param {Array<Map<String, String>>} listOfBidHistory 
 * @param {String} loopStartIdentifier 
 * @param {String} loopEndIdentifier
 * @param {String} xmlVariableIdentifier
 * @return {String} 
 */
export function generateXMLVarialables( xmlString, listOfBidHistory, loopStartIdentifier, loopEndIdentifier, xmlVariableIdentifier ){

    const loopStatingIndex = xmlString.indexOf( loopStartIdentifier ) + loopStartIdentifier.length ;
    const loopEndingIndex = xmlString.indexOf( loopEndIdentifier );
    let toLoopOverXMLString = xmlString.substring( loopStatingIndex, loopEndingIndex );
    const xmlVariablesArray = extractXMLVariables( toLoopOverXMLString, xmlVariableIdentifier );
    let modifiedLoopedXMLString = '';

    for( let i = 1; i < listOfBidHistory.length; i++ ){
        modifiedLoopedXMLString += toLoopOverXMLString;

        xmlVariablesArray.forEach( variable => {
            let newVariable = variable.replace( `[0]`, `[${i}]` );
            modifiedLoopedXMLString = modifiedLoopedXMLString.replace( variable, newVariable );
        });
    }

    modifiedLoopedXMLString = toLoopOverXMLString + modifiedLoopedXMLString;
    return xmlString.replace( toLoopOverXMLString, modifiedLoopedXMLString );
}

/**
 * @param {String} xmlString 
 * @param {String} loopStartIdentifier 
 * @param {String} loopEndIdentifier 
 * @returns {String} modifiedXMLString
 */
export function removeBidHistoryTableRowFromXML( xmlString, loopStartIdentifier, loopEndIdentifier ){
    const loopStatingIndex = xmlString.indexOf( loopStartIdentifier );
    const loopEndingIndex = xmlString.indexOf( loopEndIdentifier );
    return xmlString.slice( 0, loopStatingIndex ) + xmlString.slice( loopEndingIndex );
}

/**
 * @param {String} value 
 * @returns {String}
 */
function replaceXmlSpecialCharacters( value ) {
    if ( value && typeof (value) == 'string' ) {
        value = value.replace(/&/g, '&amp;');
        value = value.replace(/>/g, '&gt;');
        value = value.replace(/</g, '&lt;');
        value = value.replace(/\n/g, '<w:br/>');
        return value;
    }
    return '';
}

/**
 * 
 * @param {} data 
 * @param {*} fieldInfo 
 * @param {*} key 
 * @returns 
 */
function formatDataAsPerRequirement( data, fieldInfo, key ){
    switch( fieldInfo.dataType ) {
        case 'DATE':
            const offsetHrs = 16;
            data = new Date( data );
            data.setTime( data.getTime() + ( offsetHrs*60*60*1000 ) );
            data = data.toLocaleDateString("en-US");
        break;

        case 'MULTIPICKLIST':
            data = data.split(';');
            ( ['Platforms_Quoted__c'].includes( key ) )? data.sort() : '';
            data = data.join(';');
        break;

        case 'CURRENCY':
            data = data.toLocaleString( "en-US", { useGrouping: true, minimumFractionDigits: 2, style:'currency', currency:'USD' } );
        break;

        case 'DOUBLE':
            data = Number( parseFloat( data ).toFixed( fieldInfo.decimalScale ) ).toLocaleString("en-US");
        break;

        case 'BOOLEAN':
            data = ( data )? 'Yes' : 'No';
        break;

        case 'ADDRESS':
            let address =  ( data?.street )?     `${data.street}, \n`  : '';
                address += ( data?.city )?       `${data.city}, `      : '';
                address += ( data?.stateCode )?  `${data.stateCode} `  : '';
                address += ( data?.postalCode )? `${data.postalCode} ` : '';
                address += ( data?.country )?    `${data.country} `    : '';
            data = address;
        break;
    }

    return data;
}

function isEmpty(value) {
    return value === undefined || value === null || value === NaN || 
            ( typeof value === 'object' && Object.keys( value ).length === 0 ) || 
            ( typeof value === 'string' && value.trim().length === 0 );
}

// ------- This function is not removed as the client may come again to go back to previous version😅
// export function genarateEmptyDataForXMLVariables( variablesArray, specifier = '-' ){
//     const emptyDataMap = {};
//     variablesArray.forEach( variable => {
//         variable = variable.replace('%%', '');
//         variable = variable.replace('@@', '');
//         variable = variable.replace('[0].', '');
//         emptyDataMap[ variable ] = specifier;
//     });
//     return emptyDataMap;
// }