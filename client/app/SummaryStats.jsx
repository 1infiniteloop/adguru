import React from 'react'
import { currency } from '../../api/utility'
import { useRecoilValue } from 'recoil';
import { summaryStatsState } from '../state/selectors'

let summaryStats = {
    spend: 0,
    revenue: 0,
    purchases: 0,
    roa: 0,
    cpa: 0,
    views: 0,
    clicks: 0,
}

const SummaryStats = () => {

    summaryStats = {
        ...summaryStats,
        ...useRecoilValue(summaryStatsState)
    }

    return (
        <div className="summary_stats_container">
            <div className="summary_stat_container">
                <div className="summary_stat_value">{currency().format(summaryStats?.spend)}</div>
                <div className="summary_stat_metric">Spend</div>
            </div>
            <div className="summary_stat_container">
                <div className="summary_stat_value">{currency().format(summaryStats?.revenue)}</div>
                <div className="summary_stat_metric">Revenue</div>
            </div>
            <div className="summary_stat_container">
                <div className="summary_stat_value">{summaryStats?.purchases.toLocaleString('en')}</div>
                <div className="summary_stat_metric">Purchases</div>
            </div>
            <div className="summary_stat_container">
                <div className="summary_stat_value">{summaryStats?.roa.toLocaleString('en')}</div>
                <div className="summary_stat_metric">ROAS</div>
            </div>
            <div className="summary_stat_container">
                <div className="summary_stat_value">{summaryStats?.cpa.toLocaleString('en')}</div>
                <div className="summary_stat_metric">CPA</div>
            </div>
            <div className="summary_stat_container">
                <div className="summary_stat_value">{summaryStats?.views.toLocaleString('en')}</div>
                <div className="summary_stat_metric">Views</div>
            </div>
            <div className="summary_stat_container">
                <div className="summary_stat_value">{summaryStats?.clicks.toLocaleString('en')}</div>
                <div className="summary_stat_metric">Clicks</div>
            </div>
        </div>
    )
}

export default SummaryStats;