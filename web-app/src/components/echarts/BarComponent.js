import React from 'react';
import {getColorPlatte, parseLegendData, dataListToGrid} from "../../api/EchartsApi";
import BaseEChartsComponent from "./BaseEChartsComponent";
import Checkbox from '../Checkbox/Checkbox';

const getBarOptionTemplate = (colorPlatte = 'default', legendData, axisData, series, config = {}) => {
    const {
        isHorizontal = false,
        showAllAxisLabels = false,
        gridTop = 30,
        gridBottom = 5,
        gridLeft = 10,
        gridRight = 15
    } = config;

    const axisLabel = showAllAxisLabels ? {
        interval: 0
    } : {};

    let xAxis = {};
    let yAxis = {};
    if (isHorizontal) {
        xAxis = {
            type: 'value'
        };
        yAxis = {
            type: 'category',
            data: axisData,
            axisLabel: {
                interval: 0
            }
        }
    } else {
        xAxis = {
            type: 'category',
            data: axisData,
            axisLabel: axisLabel
        };
        yAxis = {
            type: 'value'
        }
    }

    const legend = parseLegendData(legendData);

    return {
        color: getColorPlatte(colorPlatte),
        tooltip: {
        },
        grid:{
            top: Number(gridTop),
            bottom: Number(gridBottom),
            left: Number(gridLeft),
            right: Number(gridRight),
            containLabel: true
        },
        legend: legend,
        xAxis: xAxis,
        yAxis: yAxis,
        series: series
    }
};


class BarComponent extends BaseEChartsComponent {
    getChartOption(data, config, title) {
        const {
            xAxis,
            legend,
            yAxis,
            hasMultiSeries = false,
            isStacked = true,
            colorPlatte = 'default',
            multiSeriesDefaultValue = 0
        } = config;

        const seriesData = [];

        if (hasMultiSeries) {
            const {
                legendList,
                xAxisList,
                grid
            } = dataListToGrid(data, xAxis, yAxis, legend, multiSeriesDefaultValue);

            // From grid to series list.
            for (let i = 0; i < legendList?.length; i++) {
                const series = {
                    name: legendList[i],
                    type: 'bar',
                    data: []
                };
                if (isStacked) {
                    series.stack = title || 'Empty';
                }
                for (let j = 0; j < xAxisList?.length; j++) {
                    series.data.push(grid[i][j]);
                }
                seriesData.push(series);
            }

            return getBarOptionTemplate(colorPlatte, legendList, xAxisList, seriesData, config);
        } else {
            const xAxisData = [];
            for (let i = 0; i < data?.length; i++) {
                const row = data[i];
                xAxisData.push(row[xAxis]);
                seriesData.push(row[yAxis]);
            }

            const series = {
                data: seriesData,
                type: 'bar'
            }
            return getBarOptionTemplate(colorPlatte, null, xAxisData, series, config);
        }
    }


    renderConfigUI(data, columns, t, onChange) {
        const {
            hasMultiSeries = false,
            isStacked = true,
            isHorizontal = false,
            showAllAxisLabels = false
        } = data;

        return (
            <div>
                {super._multiSeriesChartPanel(data, columns, t, onChange)}

                {hasMultiSeries && (
                    <div>
                        <label>{t('Is Stacked')}</label>
                        <div style={{marginBottom: '8px'}}>
                            <Checkbox name="isStacked" value="" checked={isStacked} onChange={onChange} />
                        </div>
                    </div>
                )}

                <label>{t('Is Horizontal')}</label>
                <div style={{marginBottom: '8px'}}>
                    <Checkbox name="isHorizontal" value="" checked={isHorizontal} onChange={onChange} />
                </div>

                <label>{t('Show all axis labels')}</label>
                <div style={{marginBottom: '8px'}}>
                    <Checkbox name="showAllAxisLabels" value="" checked={showAllAxisLabels} onChange={onChange} />
                </div>

                {super._colorPlattePanel(data, columns, t, onChange)}
                {super._gridPanel(data, columns, t, onChange)}
            </div>
        );
    }
}

export default BarComponent;