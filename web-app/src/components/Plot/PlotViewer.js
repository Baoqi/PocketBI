import * as PlotImport from "@observablehq/plot";
import * as D3Import from 'd3';
import {useEffect, useLayoutEffect, useRef, useState} from "react";

function PlotViewer(props) {
    const containerRef = useRef();
    let {dataSource, plotScript} = props;
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useLayoutEffect(() => {
        setWidth(containerRef.current.offsetWidth);
        setHeight( containerRef.current.offsetHeight);
    }, []);

    useEffect(() => {
        let data = dataSource;
        if (data === undefined || width === 0 || height === 0) return;

        try {
            // eslint-disable-next-line no-unused-vars
            const Plot = PlotImport;
            // eslint-disable-next-line no-unused-vars
            const d3 = D3Import;
            // eslint-disable-next-line no-eval
            const plot = eval(plotScript);
            containerRef.current.append(plot);
            return () => plot.remove();
        } catch (error) {
            console.error(error);
            return;
        }
    }, [dataSource, plotScript, width, height]);

    return <div style={{
        height: '100%',
        width: '100%'
    }} ref={containerRef} />;
}

export default PlotViewer;
