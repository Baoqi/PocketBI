import React from 'react';
import { keyValueToLegendSeries, getColorPlatte } from "../../api/EchartsApi";
import BaseEChartsComponent from "./BaseEChartsComponent";
import Select from '../Select';
import Checkbox from '../Checkbox/Checkbox';

class PieComponent extends BaseEChartsComponent {
    getChartOption(data, config, title) {
        const {
            key,
            value,
            colorPlatte,
            showLegend = true
        } = config;
        const {legendData, seriesData} = keyValueToLegendSeries(key, value, data);

        return {
            color: getColorPlatte(colorPlatte),
            tooltip: {
            },
            legend: {
                show: showLegend,
                type: 'scroll',
                orient: 'vertical',
                data: legendData,
                right: 15,
                top: 10,
                bottom: 10
            },
            series: [
                {
                    type:'pie',
                    center: ['50%', '50%'],
                    radius: '50%',
                    data: seriesData
                }
            ]
        }
    }


    renderConfigUI(data, columns, t, onChange) {
        const {
            key,
            value,
            showLegend = true
        } = data;

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

               <div>
                   <label>{t('Show Legend')}</label>
                   <div style={{marginBottom: '8px'}}>
                       <Checkbox name="showLegend" value="" checked={showLegend} onChange={onChange} />
                   </div>
               </div>

                {super._colorPlattePanel(data, columns, t, onChange)}
            </div>
        );
    }
}

export default PieComponent;