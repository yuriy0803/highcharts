/* *
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import type IndicatorValuesObject from './IndicatorValuesObject';
import type LineSeries from '../../Series/Line/LineSeries';
import type SMAIndicator from './SMAIndicator';
import BaseSeries from '../../Core/Series/Series.js';
import U from '../../Core/Utilities.js';
const {
    isArray
} = U;

/**
 * Internal types
 * @private
 */
declare global {
    namespace Highcharts {
        class ATRIndicator extends SMAIndicator {
            public data: Array<ATRIndicatorPoint>
            public pointClass: typeof ATRIndicatorPoint;
            public points: Array<ATRIndicatorPoint>;
            public getValues<TLinkedSeries extends LineSeries>(
                series: TLinkedSeries,
                params: ATRIndicatorParamsOptions
            ): (IndicatorValuesObject<TLinkedSeries>|undefined);
        }

        interface ATRIndicatorOptions extends SMAIndicator.Options {
            params?: ATRIndicatorParamsOptions;
        }

        interface ATRIndicatorParamsOptions extends SMAIndicator.ParamsOptions {
            // for inheritance
        }

        class ATRIndicatorPoint extends SMAIndicator.Point {
            public series: ATRIndicator
        }
    }
}

declare module '../../Core/Series/SeriesType' {
    interface SeriesTypeRegistry {
        atr: typeof Highcharts.ATRIndicator;
    }
}

// im port './SMAIndicator.js';

/* eslint-disable valid-jsdoc */
// Utils:
/**
 * @private
 */
function accumulateAverage(
    points: Array<[number, Array<number>]>,
    xVal: Array<number>,
    yVal: Array<Array<number>>,
    i: number
): void {
    var xValue = xVal[i],
        yValue = yVal[i];

    points.push([xValue, yValue]);
}

/**
 * @private
 */
function getTR(currentPoint: Array<number>, prevPoint: Array<number>): number {
    var pointY = currentPoint,
        prevY = prevPoint,
        HL = pointY[1] - pointY[2],
        HCp = typeof prevY === 'undefined' ? 0 : Math.abs(pointY[1] - prevY[3]),
        LCp = typeof prevY === 'undefined' ? 0 : Math.abs(pointY[2] - prevY[3]),
        TR = Math.max(HL, HCp, LCp);

    return TR;
}

/**
 * @private
 */
function populateAverage(
    points: Array<[number, Array<number>]>,
    xVal: Array<number>,
    yVal: Array<Array<number>>,
    i: number,
    period: number,
    prevATR: number
): Array<number> {
    var x = xVal[i - 1],
        TR = getTR(yVal[i - 1], yVal[i - 2]),
        y;

    y = (((prevATR * (period - 1)) + TR) / period);

    return [x, y];
}

/* eslint-enable valid-jsdoc */

/**
 * The ATR series type.
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.atr
 *
 * @augments Highcharts.Series
 */
BaseSeries.seriesType<typeof Highcharts.ATRIndicator>(
    'atr',
    'sma',
    /**
     * Average true range indicator (ATR). This series requires `linkedTo`
     * option to be set.
     *
     * @sample stock/indicators/atr
     *         ATR indicator
     *
     * @extends      plotOptions.sma
     * @since        6.0.0
     * @product      highstock
     * @requires     stock/indicators/indicators
     * @requires     stock/indicators/atr
     * @optionparent plotOptions.atr
     */
    {
        params: {
            period: 14
        }
    },
    /**
     * @lends Highcharts.Series#
     */
    {
        getValues: function<TLinkedSeries extends LineSeries> (
            series: TLinkedSeries,
            params: Highcharts.ATRIndicatorParamsOptions
        ): (IndicatorValuesObject<TLinkedSeries>|undefined) {
            var period: number = (params.period as any),
                xVal: Array<number> = (series.xData as any),
                yVal: Array<Array<number>> = (series.yData as any),
                yValLen: number = yVal ? yVal.length : 0,
                xValue: number = (xVal as any)[0],
                yValue: Array<number> = yVal[0],
                range = 1,
                prevATR = 0,
                TR = 0,
                ATR: Array<Array<number>> = [],
                xData: Array<number> = [],
                yData: Array<number> = [],
                point: (Array<number>|undefined),
                i: (number|undefined),
                points: Array<[number, Array<number>]>;

            points = [[xValue, yValue]];

            if (
                (xVal.length <= period) ||
                !isArray(yVal[0]) ||
                yVal[0].length !== 4
            ) {
                return;
            }

            for (i = 1; i <= yValLen; i++) {

                accumulateAverage(points, xVal, yVal, i);

                if (period < range) {
                    point = populateAverage(
                        points,
                        xVal,
                        yVal,
                        i,
                        period,
                        prevATR
                    );
                    prevATR = point[1];
                    ATR.push(point);
                    xData.push(point[0]);
                    yData.push(point[1]);

                } else if (period === range) {
                    prevATR = TR / (i - 1);
                    ATR.push([xVal[i - 1], prevATR]);
                    xData.push(xVal[i - 1]);
                    yData.push(prevATR);
                    range++;
                } else {
                    TR += getTR(yVal[i - 1], yVal[i - 2]);
                    range++;
                }
            }

            return {
                values: ATR,
                xData: xData,
                yData: yData
            } as IndicatorValuesObject<TLinkedSeries>;
        }

    }
);

/**
 * A `ATR` series. If the [type](#series.atr.type) option is not specified, it
 * is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.atr
 * @since     6.0.0
 * @product   highstock
 * @excluding dataParser, dataURL
 * @requires  stock/indicators/indicators
 * @requires  stock/indicators/atr
 * @apioption series.atr
 */

''; // to include the above in the js output
