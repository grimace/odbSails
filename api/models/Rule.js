/**
 * Rule.js
 *
 * @description :: Rules define objects that belong to a rule set.
 *                 They can be used to tied actions to targets
 *
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        name: {
            type: 'string',
            required: true
        },
        description: {
          type: 'string'
        },
        // Array of classifications/conditions, see Trigger Types
        trigger: {
          type: 'json',
          required: true
        },
        // Array of classifications/conditions
        /* should I call this relationship */
        condition: {      // driven by trigger and target
          type: 'json',
          required: true
        },
        // Array of targets (target IDs)
        target: {
          type: 'string'
        },
        // Array of actions(actions to be performed on targets - in order?)
        // we can try to use associations for this later.
        action: {
          type: 'string',
          required: true
        },
        network: {
            type: 'string',
        },


	}

};
