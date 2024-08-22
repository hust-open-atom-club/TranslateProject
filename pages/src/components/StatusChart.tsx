
import { Bar, type BarConfig } from '@ant-design/charts'
import type { CountItem } from '@utils/getStatusCount'
import { useEffect, useState } from 'react'


type Props = {
    data: CountItem[]
}

function useDarkMode(action: (mode: 'dark' | 'light') => void) {
    const observer = new MutationObserver(mutations => {
        console.log("MutationObserver", mutations)
        const f = mutations.find(x => x.attributeName === 'data-theme');
        if (f) {
            f.target instanceof HTMLElement && action(f.target.getAttribute('data-theme') as 'dark' | 'light');
        }
    });
    useEffect(() => {
        const element = document.documentElement;
        observer.observe(element, {
            attributes: true,
            childList: false,
            subtree: false,
            characterData: false,
            characterDataOldValue: false,
            attributeFilter: ['data-theme']
        })

        return () => {
            observer.disconnect();
        }
    })
}

export default function StatusChart({ data }: Props) {

    const [fontColor, setFontColor] = useState('black');

    useDarkMode((mode) => {
        setFontColor(mode === 'dark' ? 'white' : 'black');
    });

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
                labelFill: fontColor
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
