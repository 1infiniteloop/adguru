import React, { useEffect } from 'react'
import { funnelGraphDataState } from '../state/selectors'
import { useRecoilValue } from 'recoil';

const FunnelGraphView = () => {
    const funnelGraphData = useRecoilValue(funnelGraphDataState)
    useEffect(() => {
        let elm = document.getElementById('funnel')
        if (document.contains(elm) && funnelGraphData != undefined) {
            elm.innerHTML = ""
            let container = document.querySelector('.funnel_breakdown_container')
            let width = container.offsetWidth * .35

            var graph = new FunnelGraph({
                container: '#funnel',
                gradientDirection: 'horizontal',
                data: funnelGraphData,
                displayPercent: true,
                direction: 'vertical',
                width,
                height: 300,
                subLabelValue: 'raw'
            });

            graph.draw()
        }
    }, [funnelGraphData])

    return (
        <div className="funnel_graph_container">
            <div id="funnel"></div>
        </div>
    )
}

export default FunnelGraphView