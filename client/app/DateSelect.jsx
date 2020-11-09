import React from 'react'
import { Select, DatePicker } from 'antd';
const { Option } = Select;
const { RangePicker } = DatePicker;

const DateSelect = ({ onDateButtonClick, value }) => {

    // if (dateView == 'range') return <RangePicker
    //     className="date_range_select"
    //     onChange={onSetDates}
    //     renderExtraFooter={() => <a onClick={onChangeDateView}>Select Preset</a>}
    // />

    return (
        <Select className="date_range_select" value={value} style={{ width: '100%' }} onChange={onDateButtonClick}>
            <Option value={1}>Today</Option>
            <Option value={3}>Last 3 days</Option>
            <Option value={7}>Last 7 days</Option>
            <Option value={14}>Last 14 days</Option>
            <Option value={30}>Last 30 days</Option>
            {/* <Option value="range">Date Range</Option> */}
        </Select>
    )
}

export default DateSelect;