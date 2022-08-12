import React from 'react';
import BaseEChartsComponent from "./BaseEChartsComponent";
import Select from '../Select';
import Checkbox from '../Checkbox/Checkbox';
import * as Constants from "../../api/Constants";
import ColorPicker from "../ColorPicker/ColorPicker";

const getHeatmapOptionTemplate = (xAxisData, yAxisData, seriesData, min, max, config = {}) => {
    const {
        minColor = Constants.DEFAULT_MIN_COLOR,
        maxColor = Constants.DEFAULT_MAX_COLOR,
        showAllAxisLabels = false
    } = config;

    const axisLabel = showAllAxisLabels ? {
        interval: 0
    } : {};

    return {
        animation: false,
        grid: {
            top: 10,
            bottom: 40,
            left: 10,
            right: 15,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            splitArea: {
                show: true
            },
            axisLabel: axisLabel
        },
        yAxis: {
            type: 'category',
            data: yAxisData,
            splitArea: {
                show: true
            }
        },
        visualMap: {
            min: Number(min),
            max: Number(max),
            calculable: true,
            realtime: false,
            orient: 'horizontal',
            left: 'center',
            itemWidth: 12,
            bottom: 5,
            inRange: {
                color: [minColor, maxColor]
            }
        },
        series: [{
            type: 'heatmap',
            data: seriesData,
            animation: false,
            label: {
                normal: {
                    show: true,
                    color: '#FFFFFF'
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    }
};

class HeatmapComponent extends BaseEChartsComponent {
    getChartOption(data, config, title) {
        const {
            xAxis,
            yAxis,
            series
        } = config;

        const xAxisData = [];
        const yAxisData = [];
        const seriesData = [];

        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const xAxisVal = row[xAxis];
            const yAxisVal = row[yAxis];
            const seriesVal = Number(row[series]);

            let xIndex = xAxisData.findIndex(a => a === xAxisVal);
            if (xIndex === -1) {
                xAxisData.push(xAxisVal);
                xIndex = xAxisData.length - 1;
            }

            let yIndex = yAxisData.findIndex(a => a === yAxisVal);
            if (yIndex === -1) {
                yAxisData.push(yAxisVal);
                yIndex = yAxisData.length - 1;
            }

            if (seriesVal < min) {
                min = seriesVal;
            }

            if (seriesVal > max) {
                max = seriesVal;
            }

            seriesData.push([xIndex, yIndex, seriesVal]);
        }

        return getHeatmapOptionTemplate(xAxisData, yAxisData, seriesData, min, max, config);
    }


    renderConfigUI(data, columns, t, onChange) {
        const {
            xAxis,
            yAxis,
            series,
            minColor = Constants.DEFAULT_MIN_COLOR,
            maxColor = Constants.DEFAULT_MAX_COLOR,
            showAllAxisLabels = false
        } = data;

        return (
            <div>
                <label>{t('X-Axis')}</label>
                <Select
                    name={'xAxis'}
                    value={xAxis}
                    onChange={onChange}
                    options={columns}
                    optionDisplay={'name'}
                    optionValue={'name'}
                />

                <label>{t('Y-Axis')}</label>
                <Select
                    name={'yAxis'}
                    value={yAxis}
                    onChange={onChange}
                    options={columns}
                    optionDisplay={'name'}
                    optionValue={'name'}
                />

                <label>{t('Value')}</label>
                <Select
                    name={'series'}
                    value={series}
                    onChange={onChange}
                    options={columns}
                    optionDisplay={'name'}
                    optionValue={'name'}
                />

                <label>{t('Min Value Color')}</label>
                <ColorPicker name={'minColor'} value={minColor} onChange={onChange} />

                <label>{t('Max Value Color')}</label>
                <ColorPicker name={'maxColor'} value={maxColor} onChange={onChange} />

                <label>{t('Show all axis labels')}</label>
                <div style={{marginBottom: '8px'}}>
                    <Checkbox name="showAllAxisLabels" value="" checked={showAllAxisLabels} onChange={onChange} />
                </div>
            </div>
        );
    }
}

export default HeatmapComponent;