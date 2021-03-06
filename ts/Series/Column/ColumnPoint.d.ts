/* *
 *
 *  (c) 2010-2020 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/* *
 *
 *  Imports
 *
 * */

import type ColumnSeries from './ColumnSeries';
import type ColumnPointOptions from './ColumnPointOptions';
import type LinePoint from '../Line/LinePoint.js';
import type SVGElement from '../../Core/Renderer/SVG/SVGElement';

/* *
 *
 *  Declarations
 *
 * */

export class ColumnPoint extends LinePoint {
    allowShadow?: boolean;
    barX: number;
    group?: SVGElement;
    opacity?: number;
    options: ColumnPointOptions;
    pointWidth: number;
    series: ColumnSeries;
    shapeType: string;
}

declare module '../../Core/Series/PointLike' {
    interface PointLike {
        allowShadow?: boolean;
    }
}

/* *
 *
 *  Default Export
 *
 * */

export default ColumnPoint;
