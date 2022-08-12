import React from "react";
import Select from "../Select";
import * as Constants from "../../api/Constants";
import Checkbox from "../Checkbox/Checkbox";

class BaseEChartsComponent {
    getChartOption(type, data, config, title) {
        throw new Error("not implemented!");
    }

    renderConfigUI(data, columns, t, onChange) {
        throw new Error("not implemented!");
    }


    _colorPlattePanel(data, columns, t, onChange) {
        const {
            colorPlatte = 'default'
        } = data;
        return (
            <div>
                <label>{t('Color Platte')}</label>
                <Select
                    name={'colorPlatte'}
                    value={colorPlatte}
                    onChange={onChange}
                    options={Constants.CHART_COLOR_PLATETTES}
                />
            </div>
        );
    }

    _multiSeriesChartPanel(data, columns, t, onChange) {
        const {
            xAxis,
            legend,
            yAxis,
            hasMultiSeries = false,
            multiSeriesDefaultValue = 0
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

                <label>{t('Has multi-series')}</label>
                <div style={{marginBottom: '8px'}}>
                    <Checkbox name="hasMultiSeries" value="" checked={hasMultiSeries} onChange={onChange} />
                </div>

                {hasMultiSeries && (
                    <div>
                        <label>{t('Legend')}</label>
                        <Select
                            name={'legend'}
                            value={legend}
                            onChange={onChange}
                            options={columns}
                            optionDisplay={'name'}
                            optionValue={'name'}
                        />

                        <label>{t('Default value')}</label>
                        <input
                            className="form-input"
                            type="text"
                            value={multiSeriesDefaultValue}
                            onChange={(event) => onChange('multiSeriesDefaultValue', event.target.value)}
                        />
                    </div>
                )}
            </div>
        );
    }

    _gridPanel(data, columns, t, onChange) {
        const {
            gridTop = 30,
            gridBottom = 5,
            gridLeft = 10,
            gridRight = 15
        } = data;
        return (
            <div>
                <label>{t('Grid')}</label>
                <div className="row">
                    <div className="float-left grid-label">{t('Left')}</div>
                    <div className="float-left">
                        <input
                            className="form-input grid-input"
                            type="text"
                            value={gridLeft}
                            onChange={(event) => onChange('gridLeft', event.target.value)}
                        />
                    </div>

                    <div className="float-left grid-label">{t('Top')}</div>
                    <div className="float-left">
                        <input
                            className="form-input grid-input"
                            type="text"
                            value={gridTop}
                            onChange={(event) => onChange('gridTop', event.target.value)}
                        />
                    </div>

                    <div className="float-left grid-label">{t('Right')}</div>
                    <div className="float-left">
                        <input
                            className="form-input grid-input"
                            type="text"
                            value={gridRight}
                            onChange={(event) => onChange('gridRight', event.target.value)}
                        />
                    </div>

                    <div className="float-left grid-label">{t('Bottom')}</div>
                    <div className="float-left grid-input">
                        <input
                            className="form-input"
                            type="text"
                            value={gridBottom}
                            onChange={(event) => onChange('gridBottom', event.target.value)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default BaseEChartsComponent;