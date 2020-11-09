import React from 'react'
import { join, isEmpty } from 'lodash'
import TableView from './TableView'
import Spinner from './Spinner'

const ChartView = ({ children, className, group, view }) => {
    return (
        <div className={`chart_container ${join(className, ' ')}`}>
            {children}
            {isEmpty(group) && group !== false
                ? <Spinner />
                : <TableView data={{ group }} pagination={false} view={view} />
            }
        </div>
    )
}

export default ChartView;