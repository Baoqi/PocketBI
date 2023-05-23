import React from 'react';
import {getColorPlatte, parseLegendData, dataListToGrid} from "../../api/EchartsApi";
import BaseEChartsComponent from "./BaseEChartsComponent";
import Checkbox from '../Checkbox/Checkbox';

const getLineOptionTemplate = (colorPlatte = 'default', legendData, xAxisData, series, config = {}) => {
    const {
        showAllAxisLabels = false,
        gridTop = 30,
        gridBottom = 5,
        gridLeft = 10,
        gridRight = 15
    } = config;

    const axisLabel = showAllAxisLabels ? {
        interval: 0
    } : {};


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
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLabel: axisLabel
        },
        yAxis: {
            type: 'value'
        },
        legend: legend,
        series: series
    }
};


class LineComponent extends BaseEChartsComponent {
    getChartOption(data, config, title) {
        const {
            xAxis,
            legend,
            yAxis,
            hasMultiSeries = false,
            isSmooth = false,
            colorPlatte = 'default',
            multiSeriesDefaultValue = 0
        } = config;

        const seriesData = [];
        const type = 'line';

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
                    type: type,
                    data: [],
                    smooth: isSmooth
                };
                for (let j = 0; j < xAxisList?.length; j++) {
                    series.data.push(grid[i][j]);
                }
                seriesData.push(series);
            }

            return getLineOptionTemplate(colorPlatte, legendList, xAxisList, seriesData, config);
        } else {
            const xAxisData = [];
            for (let i = 0; i < data?.length; i++) {
                const row = data[i];
                xAxisData.push(row[xAxis]);
                seriesData.push(row[yAxis]);
            }

            const series = {
                data: seriesData,
                type: type,
                smooth: isSmooth
            }
            return getLineOptionTemplate(colorPlatte, null, xAxisData, series, config);
        }
    }


    renderConfigUI(data, columns, t, onChange) {
        const {
            isSmooth = false,
            showAllAxisLabels = false
        } = data;

        return (
            <div>
                {super._multiSeriesChartPanel(data, columns, t, onChange)}

                <label>{t('Is Smooth')}</label>
                <div style={{marginBottom: '8px'}}>
                    <Checkbox name="isSmooth" value="" checked={isSmooth} onChange={onChange} />
                </div>

                <label>{t('Show All Axis Labels')}</label>
                <div style={{marginBottom: '8px'}}>
                    <Checkbox name="showAllAxisLabels" value="" checked={showAllAxisLabels} onChange={onChange} />
                </div>

                {super._colorPlattePanel(data, columns, t, onChange)}
                {super._gridPanel(data, columns, t, onChange)}
            </div>
        );
    }
}

export default LineComponent;