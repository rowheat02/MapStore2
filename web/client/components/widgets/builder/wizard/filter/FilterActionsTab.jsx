import React from 'react';
import {connect} from 'react-redux';
import { DATATYPES } from '../../../../../utils/InteractionUtils';
import InteractionEditor from '../common/interactions/InteractionsEditor';
import { getWidgetInteractionTree } from '../../../../../selectors/widgets';

const FilterActionsTab = ({ widgetInteractionTree }) => {
    console.log(widgetInteractionTree, "widgetInteractionTree");

    const events = [{
        type: 'filterChange',
        title: 'Filter Change', // TODO: localized title
        dataType: DATATYPES.LAYER_FILTER,
        constraints: {
            layer: {
                name: 'gs:us_states__15',
                id: 'gs:us_states__15'
            }
        }
    }];
    return (
        <div className="ms-filter-wizard-actions-tab">
            <InteractionEditor
                events={events}
            />
        </div>
    );
};

export default connect((state) => ({
    widgetInteractionTree: getWidgetInteractionTree(state)
}), null)(FilterActionsTab);


