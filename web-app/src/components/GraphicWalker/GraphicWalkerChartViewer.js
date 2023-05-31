import { ReactVega, transformData, queryView } from '@wubaoqi/graphic-walker';
import {useEffect, useState} from "react";

const MetaFieldKeys = [
    'dimensions',
    'measures',
]
// "dimension" or "measure"
function _viewDimensionsOrMeasures(encodings, analyticType) {
    const state = encodings;
    const fields  = [];
    Object.keys(state)
        .filter((dkey) => !MetaFieldKeys.includes(dkey))
        .forEach((dkey) => {
            fields.push(...state[dkey].filter((f) => f.analyticType === analyticType));
        });
    return fields;
}

function _applyFilter(dataSource, filters) {
    return dataSource.filter(which => {
        for (const { rule, fid } of filters) {
            if (!rule) {
                continue;
            }

            switch (rule.type) {
                case 'one of': {
                    if (rule.value.has(which[fid])) {
                        break;
                    } else {
                        return false;
                    }
                }
                case 'range': {
                    if (rule.value[0] <= which[fid] && which[fid] <= rule.value[1]) {
                        break;
                    } else {
                        return false;
                    }
                }
                case 'temporal range': {
                    try {
                        const time = new Date(which[fid]).getTime();

                        if (
                            rule.value[0] <= time && time <= rule.value[1]
                        ) {
                            break;
                        } else {
                            return false;
                        }
                    } catch (error) {
                        console.error(error);

                        return false;
                    }
                }
                default: {
                    console.warn('Unresolvable filter rule', rule);
                    continue;
                }
            }
        }

        return true;
    });
}

function allFields(encodings) {
    const dimensions = encodings.dimensions;
    const measures = encodings.measures;
    return [...dimensions, ...measures];
}

function getMeaAggKey (meaKey, agg) {
    if (!agg) {
        return meaKey;
    }
    return `${meaKey}_${agg}`;
}

function GraphicWalkerChartViewer(props) {
    const {
        dataSource,
        rawFields,
        visSpecList,
        themeKey = 'vega',
        dark = 'media',
    } = props;
    let {config, encodings} = visSpecList[0];

    let [viewData, setViewData] = useState([]);

    // first apply filters
    useEffect(() => {
        if (!dataSource) {
            return;
        }
        let viewDimensions = _viewDimensionsOrMeasures(encodings, 'dimension');
        let viewMeasures = _viewDimensionsOrMeasures(encodings, 'measure');
        let viewFilters = encodings.filters;

        // first apply filters
        let filteredData = _applyFilter(dataSource, viewFilters);
        let tranformedData = transformData(filteredData, allFields(encodings));

        let viewData = queryView(tranformedData, viewDimensions.concat(viewMeasures), {
            op: config.defaultAggregated ? 'aggregate' : 'raw',
            groupBy: viewDimensions.map((f) => f.fid),
            measures: viewMeasures.map((f) => ({ field: f.fid, agg: f.aggName, asFieldKey: getMeaAggKey(f.fid, f.aggName) })),
        });
        setViewData(viewData);
    }, [dataSource, rawFields, visSpecList, config, encodings]);

    if (viewData.length === 0) {
        return (<div></div>);
    }

    const { geoms, interactiveScale, defaultAggregated, stack, showActions, size, format } = config;

    let draggableFieldState = encodings;
    const rows = draggableFieldState.rows;
    const columns = draggableFieldState.columns;
    const color = draggableFieldState.color;
    const opacity = draggableFieldState.opacity;
    const shape = draggableFieldState.shape;
    const theta = draggableFieldState.theta;
    const radius = draggableFieldState.radius;
    const sizeChannel = draggableFieldState.size;
    const details = draggableFieldState.details;
    const text = draggableFieldState.text;

    // const rowLeftFacetFields = rows.slice(0, -1).filter((f) => f.analyticType === 'dimension');
    // const colLeftFacetFields = columns.slice(0, -1).filter((f) => f.analyticType === 'dimension');

    // const hasFacet = rowLeftFacetFields.length > 0 || colLeftFacetFields.length > 0;
    // const enableResize = size.mode === 'fixed' && !hasFacet;

    return (<ReactVega
        format={format}
        layoutMode={size.mode}
        interactiveScale={interactiveScale}
        geomType={geoms[0]}
        defaultAggregate={defaultAggregated}
        stack={stack}
        dataSource={viewData}
        rows={rows}
        columns={columns}
        color={color[0]}
        theta={theta[0]}
        radius={radius[0]}
        shape={shape[0]}
        opacity={opacity[0]}
        size={sizeChannel[0]}
        details={details}
        text={text[0]}
        showActions={showActions}
        width={size.width - 12 * 4}
        height={size.height - 12 * 4}
        // onGeomClick={handleGeomClick}
        themeKey={themeKey}
        dark={dark}
    />);
}

export default GraphicWalkerChartViewer;
