import * as Plot from "@observablehq/plot";
import {useEffect, useRef, useState} from "react";

function PlotViewer(props) {
    const containerRef = useRef();
    let {dataSource} = props;
    console.log('data source is: ', dataSource);

    useEffect(() => {
        let data = dataSource;
        if (data === undefined) return;
        const plot = Plot.plot({
            y: {grid: true},
            color: {scheme: "burd"},
            marks: [
                Plot.ruleY([0]),
                Plot.text(['text 123'], {x: 100, y: 100})
            ]
        });
        containerRef.current.append(plot);
        return () => plot.remove();
    }, [dataSource]);

    return <div ref={containerRef} />;
}

export default PlotViewer;
