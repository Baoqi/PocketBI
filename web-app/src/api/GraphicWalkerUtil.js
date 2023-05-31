import {inferAnalyticTypeFromSemanticType, inferSemanticType} from "@wubaoqi/graphic-walker";


export function translateToGraphicWalkerFields(columns, data) {
    let fields = [];

    columns?.forEach((column) => {
        let fid = column.name + '';
        let semanticType = inferSemanticType(data, fid);
        let analyticType = inferAnalyticTypeFromSemanticType(semanticType);
        let field = {
            analyticType: analyticType,
            name: fid,
            fid: fid,
            semanticType: semanticType,
            dataType: '?',
        };
        fields.push(field);
    });
    return fields;
}

export function convertIVisSpecToSpecification(visSpecs) {
    if (!visSpecs || visSpecs.length === 0) {
        return null;
    }

    let {config, encodings} = visSpecs[0];

    let rows = [];
    encodings.rows?.forEach((row) => {
        rows.push(row.fid);
    });

    let columns = [];
    encodings.columns?.forEach((column) => {
        columns.push(column.fid);
    });

    let colors = [];
    encodings.color?.forEach((color) => {
        colors.push(color.fid);
    });

    let sizes = [];
    encodings.size?.forEach((size) => {
        sizes.push(size.fid);
    });

    let opacities = [];
    encodings.opacity?.forEach((opacity) => {
        opacities.push(opacity.fid);
    });

    let col_part = undefined;
    let highFacets = [];
    if (columns.length > 0) {
        col_part = columns[columns.length - 1];
        highFacets = columns.slice(0, columns.length - 1);
    }

    let row_part = undefined;
    let facets = [];
    if (rows.length > 0) {
        row_part = rows[rows.length - 1];
        facets = rows.slice(0, rows.length - 1);
    }

    let specification = {
        aggregate: config.defaultAggregated,
        geomType: config.geoms,
        position: [col_part, row_part],
        facets: facets,
        highFacets: highFacets,
        color: colors,
        size: sizes,
        opacity: opacities,
    }
    return specification;
}

export function loadVisSpecList(vizStore, specList) {
    let visSpecList= specList || [];
    if (visSpecList.length > 0) {
        vizStore.importStoInfo({
            specList: visSpecList,
            datasets: [],
            dataSources: []
        })
    }
}