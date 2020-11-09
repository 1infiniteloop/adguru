import { selector } from 'recoil'
import { adsetsState, reportDateState, accountState, localFinishedReportsState } from './atoms'
import { chain, meanBy, values, size, sumBy, get as _get, maxBy, map, isEmpty, uniqBy, sum } from 'lodash'
import { date_id, adsets_by_date, remove_outliers, calc, funnel_percent_stats, make_time_ranges } from '../../api/utility'
import { base } from '../../firebase'
import moment from 'moment'

export const stats = (data) => {
    let summary_spend = calc(sumBy(data, 'spend'))
    let summary_rev = calc(sumBy(data, 'made'))
    let summary_purchases = calc(sumBy(data, 'sales'))
    let summary_cpa = calc(summary_spend / summary_purchases)
    let summary_roa = calc(summary_rev / summary_spend)
    let summary_views = calc(sumBy(data, 'views'))
    let summary_clicks = calc(sumBy(data, 'clicks'))

    let payload = {
        spend: summary_spend,
        purchases: summary_purchases,
        cpa: summary_cpa,
        revenue: summary_rev,
        roa: summary_roa,
        views: summary_views.toLocaleString('en'),
        clicks: summary_clicks.toLocaleString('en'),
    }

    return payload
}

export const accountIdState = selector({
    key: 'account_id',
    get: ({ get }) => {
        let { account_id } = get(accountState)
        if (account_id) return account_id
    }
})

export const reportDatesState = selector({
    key: 'report_dates',
    get: ({ get }) => {
        let date = get(reportDateState)

        return {
            from: moment().subtract(date, 'days').format('YYYY-MM-DD'),
            until: moment().subtract(0, 'days').format('YYYY-MM-DD')
        }
    }
})

export const adsetsForDateRangeState = selector({
    key: 'adsets_for_date_range',
    get: ({ get }) => {
        let adsets = get(adsetsState)

        let { from, until } = get(reportDatesState)

        if (!isEmpty(adsets)) {
            let start_date_id = date_id(from)
            let end_date_id = date_id(until)

            adsets = chain(adsets)
                .filter(collection => collection.start_date_id > start_date_id)
                .filter(collection => collection.end_date_id <= end_date_id)
                .value()

            return adsets
        }
    }
})

export const adsetsByDateState = selector({
    key: 'adsets_by_date',
    get: ({ get }) => {
        let adsets = get(adsetsForDateRangeState)
        if (!isEmpty(adsets)) {
            adsets = adsets_by_date(adsets)
            return adsets
        }
    }
})

export const DailyStats = selector({
    key: 'daily_stats',
    get: ({ get }) => {
        let payload = {}
        let reports = get(reportsState)
        let adsets = get(adsetsForDateRangeState)

        if (!isEmpty(reports) && !isEmpty(adsets)) {
            map(reports, report => {
                let id = date_id(report.until)
                let sets = chain(adsets)
                    .filter(set => set.end_date == report.until)
                    .uniqBy('adset_id')
                    .value()
                payload[id] = {
                    ...stats(sets),
                    date: report.until,
                    funnel: values(funnel_percent_stats(sets))
                }
            })
            return payload
        } else {
            return []
        }
    }
})

export const topAdsetsState = selector({
    key: 'top_adsets',
    get: ({ get }) => {
        let payload = {}
        let reports = get(reportsState)
        let stats = get(DailyStats)
        let adsets = get(adsetsForDateRangeState)

        if (!isEmpty(reports) && !isEmpty(adsets) && !isEmpty(stats)) {
            map(reports, report => {
                let id = date_id(report.until)

                let { roa, revenue, spend } = stats[id]

                let sets = chain(adsets)
                    .filter(set => set.end_date == report.until)
                    .filter(set => set.roi > Number(roa))
                    .map(set => ({
                        ...set,
                        actual: Number(revenue),
                        projection: Number(spend) * set.roi,
                        name: set.adset_name
                    }))
                    .uniqBy('adset_id')
                    .value()

                payload[id] = sets
            })
            return payload
        } else {
            return {}
        }
    }
})

export const dailyAdsetsStatsState = selector({
    key: 'daily_adsets_stats',
    get: ({ get }) => {

        let payload = {}
        let reports = get(reportsState)
        let adsets = get(adsetsForDateRangeState)

        let funnelAtom = [
            { category: 'tof', spend_percentage: 0 },
            { category: 'mof', spend_percentage: 0 },
            { category: 'bof', spend_percentage: 0 },
        ]

        let reportAtom = {
            clicks: 0,
            cpa: 0,
            group_mean_projected: 0,
            purchases: 0,
            range: 0,
            revenue: 0,
            roa: 0,
            spend: 0,
            views: 0,
            best_in_group_adsets: [],
            funnel: funnelAtom
        }

        if (!isEmpty(adsets)) {

            chain(adsets)
                .groupBy('end_date')
                .map((adsets, key) => {

                    adsets = uniqBy(adsets, 'adset_id')

                    let date = key
                    let id = date_id(key)
                    let statistics = stats(adsets)

                    let best_in_group_adsets = chain(adsets)
                        .filter(adset => adset.roi > Number(statistics.roa))
                        .map(adset => ({
                            ...adset,
                            actual: Number(statistics.revenue),
                            projection: Number(statistics.spend) * adset.roi,
                            name: adset.adset_name
                        }))
                        .value()

                    let group_mean_projected = calc(meanBy(
                        remove_outliers(best_in_group_adsets, 'projection'),
                        'projection'
                    ))

                    payload[id] = {
                        ...reportAtom,
                        ...statistics,
                        date,
                        key: id,
                        funnel: values(funnel_percent_stats(adsets)),
                        best_in_group_adsets,
                        group_mean_projected,
                    }
                })
                .value()

        }

        payload = map(reports, report => {
            let key = date_id(report.until)
            let data = _get(payload, key)
            return (data == undefined)
                ? {
                    ...reportAtom,
                    key,
                    date: report.until,
                }
                : data
        })

        return payload
    }
})

export const funnelStatsState = selector({
    key: 'funnel_stats',
    get: ({ get }) => {
        let adsets = get(adsetsForDateRangeState)

        if (!isEmpty(adsets)) {
            adsets = chain(adsets).values()

            let funnel_stats = funnel_percent_stats(adsets.value())

            let last_1d = date_id(moment().subtract(1, 'days').format('YYYY-MM-DD'))
            let last_3d = date_id(moment().subtract(3, 'days').format('YYYY-MM-DD'))
            let last_7d = date_id(moment().subtract(7, 'days').format('YYYY-MM-DD'))
            let last_14d = date_id(moment().subtract(14, 'days').format('YYYY-MM-DD'))

            last_1d = { range: '1 day', ...stats(adsets.filter(set => set.start_date_id >= last_1d).value()) }
            last_3d = { range: '3 days', ...stats(adsets.filter(set => set.start_date_id >= last_3d).value()) }
            last_7d = { range: '7 days', ...stats(adsets.filter(set => set.start_date_id >= last_7d).value()) }
            last_14d = { range: '14 days', ...stats(adsets.filter(set => set.start_date_id >= last_14d).value()) }

            let payload = {
                stats: funnel_stats,
                daily: { last_1d, last_3d, last_7d, last_14d }
            }

            return payload
        }
    }
})

export const summaryStatsState = selector({
    key: 'summary_stats',
    get: ({ get }) => {
        let adsets = get(adsetsForDateRangeState)
        let daily = get(dailyAdsetsStatsState)

        if (!isEmpty(adsets)) {
            let statistics = stats(values(adsets))
            let revenue = sum(map(daily, 'revenue'))
            let projected = sum(map(daily, 'group_mean_projected'))

            return {
                ...statistics,
                revenue,
                projected
            }
        }

    }
})

export const adsetsByCategoryState = selector({
    key: 'adsets_by_category',
    get: ({ get }) => {
        let adsets = get(adsetsForDateRangeState)
        let summary = get(summaryStatsState)

        const stats = (group) => {
            let spend = sumBy(group, 'spend')
            let sales = sumBy(group, 'sales')
            let made = sumBy(group, 'made')
            let cpa = calc(spend / sales)
            let roi = calc(made / spend)
            let views = sumBy(group, 'views')
            let clicks = sumBy(group, 'clicks')
            let impressions = sumBy(group, 'impressions')
            let frequency = calc(impressions / views)
            let net_profit = calc(made / sales - cpa)
            let projection = calc(summary.spend * roi)

            let payload = {
                spend,
                sales,
                made,
                views,
                clicks,
                impressions,
                frequency,
                net_profit,
                projection,
                roi
            }

            return payload
        }

        const category_stats = (category) => {
            let result = chain(category)
                .groupBy('campaign_name')
                .map(campaign => {
                    let category = _get(campaign[0], 'category')

                    let adsets = chain(campaign)
                        .groupBy('adset_id')
                        .map(adset => ({
                            ...stats(adset),
                            key: _get(adset[0], 'adset_id'),
                            name: _get(adset[0], 'adset_name'),
                            category
                        }))
                        .value()

                    let payload = {
                        ...stats(campaign),
                        ...range_stats(campaign),
                        key: _get(campaign[0], 'campaign_id'),
                        name: _get(campaign[0], 'campaign_name'),
                        category,
                        children: adsets
                    }

                    return payload
                })
                .orderBy('spend', 'desc')
                .value()

            return result
        }

        let range_stats = (group) => {
            let range_stats = chain(group)
                .map(adset => {
                    let made = _get(adset, 'made')
                    let sales = _get(adset, 'sales')
                    let spend = _get(adset, 'spend')
                    let roi = calc(made / spend)
                    let projection = calc(summary.spend * roi)
                    let cpa = calc(spend / sales)
                    return {
                        roi,
                        projection,
                        cpa
                    }
                })
                .value()

            let min_roi = chain(range_stats).filter(stats => stats.roi !== 0).minBy('roi').get('roi').value() ?? 0
            let max_roi = _get(maxBy(range_stats, 'roi'), 'roi')
            let min_cpa = chain(range_stats).filter(stats => stats.cpa !== 0).minBy('cpa').get('cpa').value() ?? 0
            let max_cpa = _get(maxBy(range_stats, 'cpa'), 'cpa')
            return { min_roi, max_roi, min_cpa, max_cpa }
        }

        if (!isEmpty(adsets)) {
            return chain(adsets)
                .groupBy('category')
                .map((category, key) => {
                    return { category: key, stats: category_stats(category) }
                })
                .value()
        }
    }
})

export const tofAdsetsState = selector({
    key: 'tof_adsets',
    get: ({ get }) => {
        let adsets = get(adsetsByCategoryState)

        if (!isEmpty(adsets)) {
            return chain(adsets)
                .filter(cats => cats.category == 'tof')
                .head()
                .value()
        } else {
            return {
                stats: []
            }
        }
    }
})

export const mofAdsetsState = selector({
    key: 'mof_adsets',
    get: ({ get }) => {
        let adsets = get(adsetsByCategoryState)
        if (!isEmpty(adsets)) {
            return chain(adsets)
                .filter(cats => cats.category == 'mof')
                .head()
                .value()
        } else {
            return {
                stats: []
            }
        }
    }
})

export const bofAdsetsState = selector({
    key: 'bof_adsets',
    get: ({ get }) => {
        let adsets = get(adsetsByCategoryState)
        if (!isEmpty(adsets)) {
            return chain(adsets)
                .filter(cats => cats.category == 'bof')
                .head()
                .value()
        } else {
            return {
                stats: []
            }
        }
    }
})

export const funnelGraphDataState = selector({
    key: 'funnel_graph',
    get: ({ get }) => {
        let funnel = get(funnelStatsState)
        let summary = get(summaryStatsState)

        if (funnel != undefined && summary != undefined) {
            let tof = chain(funnel.stats).filter(cats => cats.category == 'tof').head().get('spend_percentage').value()
            let mof = chain(funnel.stats).filter(cats => cats.category == 'mof').head().get('spend_percentage').value()
            let bof = chain(funnel.stats).filter(cats => cats.category == 'bof').head().get('spend_percentage').value()

            let values = [
                [calc(summary.spend * (tof / 100))],
                [calc(summary.spend * (mof / 100))],
                [calc(summary.spend * (bof / 100))]
            ]

            return {
                labels: ['Top Of Funnel', 'Middle Of Funnel', 'Bottom Of Funnel'],
                subLabels: ['TOF', 'MOF', 'BOF'],
                colors: [
                    ['#FFB178', '#FF78B1', '#FF3C8E'],
                    ['#A0BBFF', '#EC77FF'],
                    ['#A0F9FF', '#7795FF']
                ],
                values
            }
        }
    }
})

export const reportsState = selector({
    key: 'reports',
    get: ({ get }) => {
        let dates = get(reportDatesState)
        let { time_ranges } = make_time_ranges(dates)
        return chain(time_ranges)
            .map(date => ({ ...date, done: false, running: false, size: 0 }))
            .value()
    }
})

export const dbFinishedReporstState = selector({
    key: 'db_finished_reports',
    get: async ({ get }) => {
        let { account_id } = get(accountState)
        if (account_id) {
            let db_dates_ref = base.ref(`facebook/accounts/${account_id}/dates/adsets`)
            let snapshot = await db_dates_ref.once('value')
            let snapshot_size = snapshot.numChildren()
            let dates = (snapshot_size > 0) ? values(snapshot.val()) : []
            return dates
        }
    }
})

export const finishedReportsState = selector({
    key: 'finished_reports',
    get: async ({ get }) => {
        let reports = get(reportsState)
        let local_finished_reports = get(localFinishedReportsState)
        let db_finished_reports = await get(dbFinishedReporstState)

        let local_report_ids = map(local_finished_reports, 'id')
        let db_report_ids = map(db_finished_reports, 'id')

        return [...local_report_ids, ...db_report_ids]
    }
})

export const unfinishedReportsState = selector({
    key: 'unfinished_reports',
    get: ({ get }) => {
        let reports = get(reportsState)
        // let today = chain(reports).last().value()
        let finished = get(finishedReportsState)
        let unfinished = reports.filter(report => !finished.includes(report.id))
        return unfinished
    }
})

export const runningReportState = selector({
    key: 'report_selector',
    get: ({ get }) => {
        let unfinished = get(unfinishedReportsState)
        return chain(unfinished).head().value()
    }
})

export const reportsProgressState = selector({
    key: 'reports_progress_state',
    get: ({ get }) => {
        console.log('reportsProgressState')
        let account = get(accountIdState)
        let reports = get(reportsState)
        let unfinished = get(unfinishedReportsState)
        let finished = size(reports) - size(unfinished)
        let payload = {
            percent: ((finished / size(reports)) * 100).toFixed(0),
            steps: size(reports),
            time_remaining: size(unfinished)
        }

        return payload
    }
})