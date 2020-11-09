import React from 'react'
import { funnelStatsState } from '../state/selectors'
import { useRecoilValue } from 'recoil';
import { currency } from '../../api/utility'
import { map } from 'lodash'

let funnel = {
    daily: {}
}

const FunnelStats = () => {
    funnel = {
        ...funnel,
        ...useRecoilValue(funnelStatsState)
    }
    return (
        <div className="funnel_breakdown_tables">
            <div className="funnel_breakdown_header">
                <div className="funnel_breakdown_header_text">Dates</div>
                <div className="funnel_breakdown_header_text">Spend</div>
                <div className="funnel_breakdown_header_text">Revenue</div>
                <div className="funnel_breakdown_header_text">Purchases</div>
                <div className="funnel_breakdown_header_text">ROAS</div>
                <div className="funnel_breakdown_header_text">CPA</div>
            </div>

            {map(funnel.daily, (stats, id) => (
                <div className="funnel_breakdown_stats_row" key={id}>
                    <div>{stats.range}</div>
                    <div>{currency().format(stats.spend)}</div>
                    <div>{currency().format(stats.revenue)}</div>
                    <div>{stats.purchases.toLocaleString('en')}</div>
                    <div>{stats.roa.toLocaleString('en')}</div>
                    <div>{currency(2).format(stats.cpa)}</div>
                </div>
            ))}
        </div>
    )
}

export default FunnelStats;