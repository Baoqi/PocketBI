import React from 'react';
import {getColorPlatte} from "../../api/EchartsApi";
import BaseEChartsComponent from "./BaseEChartsComponent";
import Select from "../Select";

class TreemapComponent extends BaseEChartsComponent {
    getChartOption(_type, data, config, title) {
        const {
            key,
            value,
            colorPlatte
        } = config;
        const seriesData = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            seriesData.push({
                name: row[key],
                value: row[value]
            });
        }
        return {
            color: getColorPlatte(colorPlatte),
            tooltip: {
            },
            grid:{
                containLabel: true
            },
            series: [{
                name: 'ALL',
                type: 'treemap',
                data: seriesData,
                levels: [
                    {
                        itemStyle: {
                            normal: {
                                borderColor: '#F9F9F9',
                                borderWidth: 2,
                                gapWidth: 2
                            }
                        }
                    }
                ]
            }]
        };
    }


    renderConfigUI(data, columns, t, onChange) {
        const {
            key,
            value
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

                {super._colorPlattePanel(data, columns, t, onChange)}
            </div>
        );
    }
}

export default TreemapComponent;