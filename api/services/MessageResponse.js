
/**
 * Used to generate standard responses. This can contain an error message,
 * list of error reasons or success status.
 * @type {Object}
 */


module.exports = function( successful, errMsg) {
    if (successful) {
        this.success = successful; 
    } else {
        this.error = { message : '', purchaseOrders : [], products : [], campaigns: [] };
        if (errMsg) {
            this.error.message = errMsg;          
        }
    }
}






















