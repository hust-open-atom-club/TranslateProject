
import { Bar, type BarConfig } from '@ant-design/charts'
import type { CountItem } from '@utils/getStatusCount'


type Props = {
    data: CountItem[]
}

export default function StatusChart({ data }: Props) {

    const config: BarConfig = {
        data: data.filter(x => x.status !== 'proofreading'),
        xField: 'desc',
        yField: 'count',
        colorField: 'desc',
        label: {
            text: 'count',
            position: 'inside'
        },
        axis: {
            y: false,
            x: {
                tick: false,
                line: false,
                labelAutoHide: false,
                labelFontSize: 16,
                labelSpacing: 16,
            }
        },
        theme: 'academy',
        tooltip: (k: CountItem) => k.count,
        legend: false
    }

    return (
        <div style={{
            height: '200px'
        }}>
            <Bar {...config}></Bar>
        </div>
    )
}