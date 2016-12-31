/**
 * Distribution
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        title: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string'
        },
        pubDate: {
            type: 'date',
            required: true
        },
        startDate: {
            type: 'date',
            required: true
        },
        endDate: {
            type: 'date',
            required: true
        },
        // Array of IDs
        // we can try to use associations for this later.
        layouts: {
            type: 'array'
        },
        basket: {
            type: 'array'
        },
        rules: {
            type: 'array'
        },
        // instance methods
        layoutCount: function() {
            if (this.layouts) {
                return this.layouts.length;
            }
            return 0;
        },
        basketCount: function() {
            if (this.basket) {
                return this.basket.length;
            }
            return 0;
        },
        ruleCount: function() {
            if (this.rules) {
                return this.rules.length;
            }
            return 0;
        },
        isActive: function() {
            if (this.action) return (this.action.type == 'activated');
            return false;
        }

        
        /*
        
        
        
        
    @JsonProperty
	String assetId = null;


    @JsonProperty
    String campaignId = null;


    @JsonProperty
    String targetId = null;


    @JsonProperty
    String ruleId = null;


    @JsonProperty
    String 	publishDate = null;


    @JsonProperty
    String 	startDate = null;


    @JsonProperty
    String 	expireDate = null;

        
        */
        
        
        
        

        
    }
};
