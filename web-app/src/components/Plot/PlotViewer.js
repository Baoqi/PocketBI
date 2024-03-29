import * as PlotImport from "@observablehq/plot";
import * as D3Import from 'd3';
import {useEffect, useRef, useState} from "react";

function PlotViewer(props) {
    const containerRef = useRef();
    let {dataSource, plotScript, transformScript} = props;
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const updateDimensions = () => {
            setWidth(containerRef.current.offsetWidth);
            setHeight( containerRef.current.offsetHeight);
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        let data = dataSource;
        if (data === undefined || width === 0 || height === 0) return;

        try {
            // eslint-disable-next-line no-unused-vars
            const Plot = PlotImport;
            // eslint-disable-next-line no-unused-vars
            const d3 = D3Import;

            if (transformScript && transformScript.trim() !== '') {
                // eslint-disable-next-line no-eval
                data = eval(transformScript);
            }
            // eslint-disable-next-line no-eval
            const plot = eval(plotScript);
            if (Array.isArray(plot)) {
                for (let i = 0; i < plot.length; i++) {
                    containerRef.current.append(plot[i]);
                }
                return () => {
                    for (let i = plot.length - 1; i >= 0; i--) {
                        plot[i].remove();
                    }
                }
            } else {
                containerRef.current.append(plot);
                return () => plot.remove();
            }
        } catch (error) {
            console.error(error);
            return;
        }
    }, [dataSource, plotScript, transformScript, width, height]);

    return <div style={{
        height: '100%',
        width: '100%'
    }} ref={containerRef} />;
}

export default PlotViewer;
