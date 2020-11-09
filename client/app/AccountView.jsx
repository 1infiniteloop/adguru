import React, { useEffect, useState } from 'react'
import { PageHeader, Progress, Button } from 'antd';
import { size, values, uniq } from 'lodash'
import DateSelect from './DateSelect'
import { adsetsState, reportDateState, localFinishedReportsState, accountState, userState, auditsState } from '../state/atoms'
import { runningReportState, reportsProgressState } from '../state/selectors'
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import SummaryStats from './SummaryStats';
import FunnelStats from './FunnelStats';
import UnrealizedProfitsChart from './UnrealizedProfitsChart'
import PurchasesAndCpaChart from './PurchasesAndCpaChart'
import RevenueAndRoasChart from './RevenueAndRoasChart'
import DailyAdsetsStatsTable from './DailyAdsetsStatsTable'
import TofAdsetsTable from './TofAdsetsTable'
import MofAdsetsTable from './MofAdsetsTable'
import BofAdsetsTable from './BofAdsetsTable'
import FunnelGraphView from './FunnelGraphView'
import { run_report } from '../../api/fbsync'
import axios from 'axios'
import { base } from '../../firebase'

const AccountView = () => {

    const user = useRecoilValue(userState)
    const { accessToken } = user
    const account = useRecoilValue(accountState)
    const { account_id } = account
    const setAdsets = useSetRecoilState(adsetsState)
    const [date, setDate] = useRecoilState(reportDateState)
    const setFinishedReports = useSetRecoilState(localFinishedReportsState)
    const running = useRecoilValue(runningReportState)
    const progress = useRecoilValue(reportsProgressState)
    const [audits, setAudits] = useRecoilState(auditsState)

    const onDateButtonClick = (event) => setDate(event)

    useEffect(() => {
        let subscription = base.ref(`facebook/users/${user.uid}/audits`)
            .on('value', snap => {
                if (snap) {
                    let auditsArr = snap.val() ?? []
                    setAudits(uniq([...auditsArr, account_id]))
                }
            })
        return () => subscription()
    }, [])

    useEffect(() => {
        let subscription = base.ref(`facebook/accounts/${account_id}/adsets`)
            .on('value', snap => {
                console.log('adsetsFromDb')
                if (snap) {
                    let adsets = values(snap.val())
                    setAdsets(adsets)
                }
            })
        return () => subscription()
    }, [])

    useEffect(() => {
        if (size(audits) > 0) {
            console.log('saving audits')
            console.log(user)
            let audits_url = `https://us-central1-adguru-67745.cloudfunctions.net/adguru/audits`
            let audits_ref = `facebook/users/${user.uid}/audits`
            axios.post(audits_url, { ref: audits_ref, data: audits })
        }
    }, [audits])

    useEffect(() => {
        if (running != undefined) {
            const adsetStats = () => run_report(accessToken, account_id, running)

            let report = adsetStats()

            report.then(adsets => {
                console.log('settingAdsets')
                // console.log(adsets)
                setAdsets(prev => [...prev, ...adsets])

                console.log('saving adsets')
                // let adset_url = `http://localhost:3000/adset`
                let adset_url = `https://us-central1-adguru-67745.cloudfunctions.net/adguru/adset`
                let adsets_ref = `facebook/accounts/${account_id}/adsets`
                axios.post(adset_url, { ref: adsets_ref, data: adsets })

                console.log('saving report date')
                // let report_url = `http://localhost:3000/report`
                let report_url = `https://us-central1-adguru-67745.cloudfunctions.net/adguru/report`
                let dates_ref = `facebook/accounts/${account_id}/dates/adsets`
                axios.post(report_url, { ref: dates_ref, data: { ...running, size: size(adsets) } })

                console.log('scheduling next report for 60 seconds from now')
                setTimeout(() => {
                    console.log('next report scheduled')
                    setFinishedReports(prev => [...prev, running])
                }, 60000)
            })

        } else {
            console.log('done running all reports')
        }
    }, [running])

    return (
        <div className="account_container">

            <div className="top_nav_container">
                <div className="progress_container">
                    <div>
                        <Progress percent={progress.percent} steps={progress.steps} status="active" />
                    </div>
                    <div>
                        Time Remaining: {progress.time_remaining} minutes
                    </div>
                </div>

                {!user.admin &&
                    <Button type="primary" size="large" style={{ float: 'right', marginTop: "10px" }}>
                        <a href="https://go.adguru.ai/callekvp5flo">
                            Run Unlimited Reports
                        </a>
                    </Button>
                }

                {user.admin &&
                    <DateSelect
                        onDateButtonClick={onDateButtonClick}
                        value={date}
                    />
                }

            </div>

            <PageHeader className="site_page_header app_header" title={account.name} />

            <div className="funnel_container">
                <SummaryStats />
                <div className="funnel_breakdown_container">
                    <FunnelGraphView />
                    <div />
                    <FunnelStats />
                </div>
            </div>

            <UnrealizedProfitsChart />
            <PurchasesAndCpaChart />
            <RevenueAndRoasChart />
            <DailyAdsetsStatsTable />
            <TofAdsetsTable />
            <MofAdsetsTable />
            <BofAdsetsTable />

        </div >
    )
}

export default AccountView;