import { atom } from 'recoil'

export const userState = atom({
    key: 'user',
    default: null
})

export const usersState = atom({
    key: 'users',
    default: []
})

export const accountState = atom({
    key: 'account',
    default: {}
})

export const accountsState = atom({
    key: 'accounts',
    default: []
})

export const adsetsState = atom({
    key: 'adsets',
    default: []
})

export const reportDateState = atom({
    key: 'report_date',
    default: 7
})

export const reportState = atom({
    key: 'report',
    default: {
        state: 'inactive',
        progress: 0,
        time_remaining: 0,
        scheduled_count: undefined,
        scheduled_time: undefined
    }
})

export const localFinishedReportsState = atom({
    key: 'local_finished_reports',
    default: []
})

export const viewState = atom({
    key: 'view',
    default: 'accounts'
})

export const auditsState = atom({
    key: 'audits',
    default: []
})