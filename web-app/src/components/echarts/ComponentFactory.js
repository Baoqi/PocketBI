import PieComponent from "./PieComponent";
import BarComponent from "./BarComponent";
import LineComponent from "./LineComponent";
import HeatmapComponent from "./HeatmapComponent";
import TreemapComponent from "./TreemapComponent";
import FunnelComponent from "./FunnelComponent";
import * as Constants from "../../api/Constants";
import AreaComponent from "./AreaComponent";

export const getEChartsComponent = (type) => {
    if (type === Constants.PIE) {
        return new PieComponent();
    } else if (type === Constants.BAR) {
        return new BarComponent();
    } else if (type === Constants.LINE) {
        return new LineComponent();
    } else if (type === Constants.AREA) {
        return new AreaComponent();
    } else if (type === Constants.HEATMAP) {
        return new HeatmapComponent();
    } else if (type === Constants.TREEMAP) {
        return new TreemapComponent();
    } else if (type === Constants.FUNNEL) {
        return new FunnelComponent();
    }
}