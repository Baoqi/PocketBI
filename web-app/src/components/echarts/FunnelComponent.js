import React from 'react';
import {getColorPlatte, keyValueToLegendSeries} from "../../api/EchartsApi";
import BaseEChartsComponent from "./BaseEChartsComponent";
import Select from '../Select';
import Checkbox from '../Checkbox/Checkbox';


class FunnelComponent extends BaseEChartsComponent {
    getChartOption(data, config, title) {
        const {
            key,
            value,
            colorPlatte,
            showLegend = true
        } = config;
        const {legendData, seriesData} = keyValueToLegendSeries(key, value, data);
        const {
            sort = 'descending'
        } = config;

        return {
            color: getColorPlatte(colorPlatte),
            tooltip: {
            },
            grid:{
                containLabel: true
            },
            legend: {
                show: showLegend,
                data: legendData
            },
            calculable: true,
            series: [{
                type:'funnel',
                top: 40,
                bottom: 10,
                sort: sort,
                data: seriesData
            }]
        };
    }


    renderConfigUI(data, columns, t, onChange) {
        const {
            key,
            value,
            sort = 'descending',
            showLegend = true
        } = data;

        const SORT_OPTIONS = ['ascending', 'descending'];

        return (
            <div>
                <label>{t('Key')} <span style={{color: '#8993A4', fontSize: '15px'}}>Text</span></label>
                <Select
                    name={'key'}
                    value={key}
                    onChange={onChange}
                    options={columns}
                    optionDisplay={'name'}
                    optionValue={'name'}
                />

                <label>{t('Value')} <span style={{color: '#8993A4', fontSize: '15px'}}>Number</span></label>
                <Select
                    name={'value'}
                    value={value}
                    onChange={onChange}
                    options={columns}
                    optionDisplay={'name'}
                    optionValue={'name'}
                />

                <label>{t('Sort')}</label>
                <Select
                    name={'sort'}
                    value={sort}
                    onChange={onChange}
                    options={SORT_OPTIONS}
                />

                <label>{t('Show Legend')}</label>
                <div style={{marginBottom: '8px'}}>
                    <Checkbox name="showLegend" value="" checked={showLegend} onChange={onChange} />
                </div>

                {super._colorPlattePanel(data, columns, t, onChange)}
            </div>
        );
    }
}

export default FunnelComponent;