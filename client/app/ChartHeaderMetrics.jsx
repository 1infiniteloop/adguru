import React from 'react'

const ChartHeaderMetrics = ({ classes, title, metric, info, span }) => {
    return (
        <div className={`chart_metric_container ${classes}`}>
            <div className="chart_metric_title">
                {title}
            </div>

            <div className="chart_metric">
                {metric}<span>{span}</span>
            </div>

            <div className="chart_metric_info">
                {info}
            </div>
        </div>
    )
}

export default ChartHeaderMetrics;