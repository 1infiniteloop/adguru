import { map, sumBy, orderBy, size, reduce, sum, sortBy, times, chain, uniqBy, groupBy, isEmpty } from 'lodash'
import util from 'util'
import { quantile, interquartileRange } from 'simple-statistics'
import moment from 'moment'
import shajs from 'sha.js'
export const show = (data) => console.log(util.inspect(data, false, null, true))

export const date_id = (date) => chain(date).split('-').join('').toNumber().value()

export const aggregate = (obj, prop) => sumBy(obj, o => Number(o[prop]))

export const calc = (expression) => (isNaN(expression) || !isFinite(expression)) ? 0 : expression

export const funnel_percent_stats = (data) => {
    let total_spend = sumBy(data, 'spend')
    let grouped_by_adset_id = groupBy(data, 'adset_id')
    return chain(grouped_by_adset_id)
        .map(adset_group => {
            let { adset_id, category } = adset_group[0]
            let spend = sumBy(adset_group, 'spend')
            let spend_percentage = calc(spend / total_spend * 100)
            return {
                spend,
                spend_percentage,
                adset_id,
                category
            }
        })
        .groupBy('category')
        .map(collection => {
            let { category } = collection[0]
            return {
                category,
                spend_percentage: sumBy(collection, 'spend_percentage').toFixed(0)
            }
        })
        .value()
}

export const adsets_by_date = (group) => {
    let payload = {}
    let adsets_by_end_date = chain(group).groupBy('end_date').value()
    let date_keys = Object.keys(adsets_by_end_date)

    map(date_keys, date => {
        let end_date_id = date_id(date)

        payload[end_date_id] = {
            key: end_date_id,
            adsets: uniqBy(adsets_by_end_date[date], 'adset_id'),
            range: date
        }
    })

    return payload
}

export const categorize = (collection) => {
    return map(collection, insight => {
        let spend_to_views_ratio = insight.spend_as_a_percentage_of_total / insight.views_as_a_percentage_of_total
        let made_to_spend_ratio = insight.made_as_a_percentage_of_total / insight.spend_as_a_percentage_of_total
        if (spend_to_views_ratio > 1.2 && made_to_spend_ratio > 1) {
            return { ...insight, category: 'BOF' }
        } else if (spend_to_views_ratio < 1 && made_to_spend_ratio > 1 || insight.frequency > 2) {
            return { ...insight, category: 'MOF' }
        } else {
            return { ...insight, category: 'TOF' }
        }
    })
}

export const graph_dates = ({ from, until }) => {
    let start = moment(from)
    let end = moment(until)
    let days = end.diff(start, 'days')
    return times(days, iteration => moment(from).add(iteration, 'days').format('MM-DD-YYYY'))
}

export const make_time_ranges = ({ from, until }) => {
    let dates

    let start = moment(from)
    let end = moment(until)
    let days = end.diff(start, 'days')

    return {
        time_ranges: chain(days)
            .times(iteration => ({
                since: moment(from).add(iteration + 1, 'days').format('YYYY-MM-DD'),
                // until: moment(from).add(iteration + 1, 'days').format('YYYY-MM-DD')
                until: moment(from).add(iteration + 1, 'days').format('YYYY-MM-DD')
            }))
            .map(date => ({
                ...date,
                id: shajs('sha256')
                    .update(`${date.since}${date.until}`)
                    .digest('hex')
            }))
            .value()
    }

    if (type == 'aggregate') {
        dates = { date_preset: preset }
    }

    if (type == 'range') {
        let { from, until } = range
        let start = moment(from)
        let end = moment(until)
        let days = end.diff(start, 'days')
        dates = {
            time_ranges: chain(days)
                .times(iteration => ({
                    since: moment(from).add(iteration + 1, 'days').format('YYYY-MM-DD'),
                    // until: moment(from).add(iteration + 1, 'days').format('YYYY-MM-DD')
                    until: moment(from).add(iteration + 1, 'days').format('YYYY-MM-DD')
                }))
                .map(date => ({
                    ...date,
                    id: shajs('sha256')
                        .update(`${date.since}${date.until}`)
                        .digest('hex')
                }))
                .value()
        }

    }

    if (type == 'offset') {
        dates = {
            time_ranges: times(value, iteration => {
                let sinceNumOfDays = value - iteration + (offset)
                let untilNumOfDays = value - iteration + offset - 1
                let since = moment().subtract(sinceNumOfDays, 'days').format('YYYY-MM-DD')
                let until = moment().subtract(untilNumOfDays, 'days').format('YYYY-MM-DD')
                let id = shajs('sha256').update(`${since}${until}`).digest('hex')
                return { id, since, until }
            })
        }
    }

    return dates
}

export const percentage_of_total = (collection, metric) => {
    let collection_total = reduce(collection, (aggr, curr) => aggr += Number(curr[metric]), 0)
    return map(collection, stat => {
        return {
            ...stat,
            [`${metric}_as_a_percentage_of_total`]: ((Number(stat[metric]) / collection_total) * 100)
        }
    })
}

export const sort_metric = (collection, metric, order = 'desc') => orderBy(collection, [metric], [order])

export const group_by_metric = (collection, metric, thresholds) => {
    let aggr = []
    let percentiles = sort_metric(percentage_of_total(collection, metric), metric)
    let metric_total_sum = aggregate(collection, metric)

    return map(thresholds, (threshold, id) => {
        let isLast = (id + 1) == size(thresholds)
        let group = []
        let acc = 0
        let threshold_as_decimal = threshold / 100
        let target = metric_total_sum * threshold_as_decimal

        map(percentiles, stat => {
            if (aggr.includes(stat.id)) return
            if (acc + Number(stat[metric]) < target && !isLast) {
                aggr = [...aggr, stat.id]
                group = [...group, stat]
            }
            if (isLast) {
                group = [...group, stat]
            }
            acc += Number(stat[metric])
        })

        return group
    })
}

export const project_metric = (collection, projection_metric, key_name) => map(collection, stat => {
    return { ...stat, [key_name]: (aggregate(collection, 'spend') * Number(stat[projection_metric])) }
})

export const group_stats = (collectionArr, statsArr) => {
    let stats_collection = {}
    map(statsArr, metric => stats_collection[metric] = stats[metric](collectionArr))
    return stats_collection
}

export const mean_of_metric = (collection, metricsArr) => {
    let stats = {}
    let collection_size = size(collection)

    map(metricsArr, metric => stats[`${metric}_mean`] = (aggregate(collection, metric) / collection_size))
    return stats
}

export const remove_outliers = (collection, metric) => {
    // console.log('collection')
    // console.log(collection)
    if (isEmpty(collection)) return []
    let sorted = sortBy(collection, insight => insight[metric])
    let seq = map(sorted, metric)
    // console.log('seq')
    // console.log(seq)
    let q1 = quantile(seq, .25)
    let q3 = quantile(seq, .5)
    let iqr = interquartileRange(seq)

    // console.log("iqr")
    // console.log(iqr)
    // console.log(iqr / 4)

    // console.log('q1')
    // console.log(q1)
    // console.log("q3")
    // console.log(q3)

    // let lower_outlier = (q1 - 1.5) * iqr
    // let upper_outlier = (q3 + 1.5) * iqr

    let lower_outlier = (q1 * 1.25) - iqr
    let upper_outlier = (q3 * 1) + (iqr / 4)

    // console.log('outliers')
    // console.log(lower_outlier)
    // console.log(upper_outlier)

    return chain(sorted)
        .filter(item => item[metric] > lower_outlier)
        .filter(item => item[metric] < upper_outlier)
        .value()

    // return filter(sorted, insight =>
    //     insight[metric] > lower_outlier ||
    //     insight[metric] < upper_outlier
    // )
}

const stats = {
    sales: (group) => aggregate(group, 'sales'),
    spend: (group) => aggregate(group, 'spend'),
    made: (group) => aggregate(group, 'made'),
    roi: (group) => aggregate(group, 'made') / aggregate(group, 'spend'),
    net_roi: (group) => sum(map(group, 'net_roi')) / size(group)
}

export const currency = (precision = 0) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision
})

export const maybeNaN = (number) => number = number ? number : 0