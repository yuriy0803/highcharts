/**
 * (c) 2010-2017 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
/* eslint max-len: ["warn", 80, 4] */
'use strict';
import H from './Globals.js';
import './Utilities.js';
import './Color.js';
import './Axis.js';
import './Chart.js';
import './Series.js';
import './Options.js';
import './Scrollbar.js';

/**
 * Options for the corresponding navigator series if `showInNavigator`
 * is `true` for this series. Available options are the same as any
 * series, documented at [plotOptions](#plotOptions.series) and
 * [series](#series).
 * 
 * 
 * These options are merged with options in [navigator.series](#navigator.
 * series), and will take precedence if the same option is defined both
 * places.
 * 
 * @type {Object}
 * @see [navigator.series](#navigator.series)
 * @default undefined
 * @since 5.0.0
 * @product highstock
 * @apioption plotOptions.series.navigatorOptions
 */

/**
 * Whether or not to show the series in the navigator. Takes precedence
 * over [navigator.baseSeries](#navigator.baseSeries) if defined.
 * 
 * @type {Boolean}
 * @default undefined
 * @since 5.0.0
 * @product highstock
 * @apioption plotOptions.series.showInNavigator
 */

var addEvent = H.addEvent,
	Axis = H.Axis,
	Chart = H.Chart,
	color = H.color,
	defaultDataGroupingUnits = H.defaultDataGroupingUnits,
	defaultOptions = H.defaultOptions,
	defined = H.defined,
	destroyObjectProperties = H.destroyObjectProperties,
	each = H.each,
	erase = H.erase,
	error = H.error,
	extend = H.extend,
	grep = H.grep,
	hasTouch = H.hasTouch,
	isArray = H.isArray,
	isNumber = H.isNumber,
	isObject = H.isObject,
	merge = H.merge,
	pick = H.pick,
	removeEvent = H.removeEvent,
	Scrollbar = H.Scrollbar,
	Series = H.Series,
	seriesTypes = H.seriesTypes,
	wrap = H.wrap,

	units = [].concat(defaultDataGroupingUnits), // copy
	defaultSeriesType,

	// Finding the min or max of a set of variables where we don't know if they
	// are defined, is a pattern that is repeated several places in Highcharts.
	// Consider making this a global utility method.
	numExt = function (extreme) {
		var numbers = grep(arguments, isNumber);
		if (numbers.length) {
			return Math[extreme].apply(0, numbers);
		}
	};

// add more resolution to units
units[4] = ['day', [1, 2, 3, 4]]; // allow more days
units[5] = ['week', [1, 2, 3]]; // allow more weeks

defaultSeriesType = seriesTypes.areaspline === undefined ?
	'line' :
	'areaspline';

extend(defaultOptions, {

	/**
	 * The navigator is a small series below the main series, displaying
	 * a view of the entire data set. It provides tools to zoom in and
	 * out on parts of the data as well as panning across the dataset.
	 *
	 * @product highstock
	 * @optionparent navigator
	 */
	navigator: {
		/**
		 * The height of the navigator.
		 * 
		 * @type {Number}
		 * @sample {highstock} stock/navigator/height/ A higher navigator
		 * @default 40
		 * @product highstock
		 */
		height: 40,

		/**
		 * The distance from the nearest element, the X axis or X axis labels.
		 * 
		 * @type {Number}
		 * @sample {highstock} stock/navigator/margin/
		 *         A margin of 2 draws the navigator closer to the X axis labels
		 * @default 25
		 * @product highstock
		 */
		margin: 25,

		/**
		 * Whether the mask should be inside the range marking the zoomed
		 * range, or outside. In Highstock 1.x it was always `false`.
		 * 
		 * @type {Boolean}
		 * @sample {highstock} stock/navigator/maskinside-false/
		 *         False, mask outside
		 * @default true
		 * @since 2.0
		 * @product highstock
		 */
		maskInside: true,
		
		/**
		 * Options for the handles for dragging the zoomed area. 
		 * 
		 * @type {Object}
		 * @sample {highstock} stock/navigator/handles/ Colored handles
		 * @product highstock
		 */
		handles: {
			/**
			 * Width for handles.
			 *
			 * @type {umber}
			 * @default 7
			 * @product highstock
			 * @sample {highstock} stock/navigator/styled-handles/
			 *         Styled handles
			 * @since 6.0.0
			 */
			width: 7,

			/**
			 * Height for handles.
			 *
			 * @type {Number}
			 * @default 15
			 * @product highstock
			 * @sample {highstock} stock/navigator/styled-handles/
			 *         Styled handles
			 * @since 6.0.0
			 */
			height: 15,

			/**
			 * Array to define shapes of handles. 0-index for left, 1-index for
			 * right.
			 *
			 * Additionally, the URL to a graphic can be given on this form: 
			 * `url(graphic.png)`. Note that for the image to be applied to
			 * exported charts, its URL needs to be accessible by the export
			 * server.
			 *
			 * Custom callbacks for symbol path generation can also be added to
			 * `Highcharts.SVGRenderer.prototype.symbols`. The callback is then
			 * used by its method name, as shown in the demo.
			 *
			 * @type {Array}
			 * @default ['navigator-handle', 'navigator-handle']
			 * @product highstock
			 * @sample {highstock} stock/navigator/styled-handles/
			 *         Styled handles
			 * @since 6.0.0
			 */
			symbols: ['navigator-handle', 'navigator-handle'],

			/**
			 * Allows to enable/disable handles.
			 *
			 * @type {Boolean}
			 * @default true
			 * @product highstock
			 * @since 6.0.0
			 */
			enabled: true,

			/*= if (build.classic) { =*/
			/**
			 * The width for the handle border and the stripes inside.
			 *
			 * @type {Number}
			 * @default 7
			 * @product highstock
			 * @sample {highstock} stock/navigator/styled-handles/
			 *         Styled handles
			 * @since 6.0.0
			 */
			lineWidth: 1,

			/**
			 * The fill for the handle.
			 * 
			 * @type {Color}
			 * @product highstock
			 */
			backgroundColor: '${palette.neutralColor5}',

			/**
			 * The stroke for the handle border and the stripes inside.
			 * 
			 * @type {Color}
			 * @product highstock
			 */
			borderColor: '${palette.neutralColor40}'

			/*= } =*/
		},

		/*= if (build.classic) { =*/

		/**
		 * The color of the mask covering the areas of the navigator series
		 * that are currently not visible in the main series. The default
		 * color is bluish with an opacity of 0.3 to see the series below.
		 * 
		 * @type {Color}
		 * @see     In styled mode, the mask is styled with the
		 *          `.highcharts-navigator-mask` and
		 *          `.highcharts-navigator-mask-inside` classes.
		 * @sample  {highstock} stock/navigator/maskfill/
		 *          Blue, semi transparent mask
		 * @default rgba(102,133,194,0.3)
		 * @product highstock
		 */
		maskFill: color('${palette.highlightColor60}').setOpacity(0.3).get(),

		/**
		 * The color of the line marking the currently zoomed area in the
		 * navigator.
		 * 
		 * @type {Color}
		 * @sample {highstock} stock/navigator/outline/ 2px blue outline
		 * @default #cccccc
		 * @product highstock
		 */
		outlineColor: '${palette.neutralColor20}',

		/**
		 * The width of the line marking the currently zoomed area in the
		 * navigator.
		 * 
		 * @type {Number}
		 * @see In styled mode, the outline stroke width is set with the `.
		 * highcharts-navigator-outline` class.
		 * @sample {highstock} stock/navigator/outline/ 2px blue outline
		 * @default 2
		 * @product highstock
		 */
		outlineWidth: 1,
		/*= } =*/

		/**
		 * Options for the navigator series. Available options are the same
		 * as any series, documented at [plotOptions](#plotOptions.series)
		 * and [series](#series).
		 * 
		 * Unless data is explicitly defined on navigator.series, the data
		 * is borrowed from the first series in the chart.
		 * 
		 * Default series options for the navigator series are:
		 * 
		 * <pre>series: {
		 *     type: 'areaspline',
		 *     color: '#4572A7',
		 *     fillOpacity: 0.05,
		 *     dataGrouping: {
		 *         smoothed: true
		 *     },
		 *     lineWidth: 1,
		 *     marker: {
		 *         enabled: false
		 *     }
		 * }</pre>
		 * 
		 * @type {Object}
		 * @see In styled mode, the navigator series is styled with the `.
		 * highcharts-navigator-series` class.
		 * @sample {highstock} stock/navigator/series-data/
		 *         Using a separate data set for the navigator
		 * @sample {highstock} stock/navigator/series/
		 *         A green navigator series
		 * @product highstock
		 */
		series: {

			/**
			 * The type of the navigator series. Defaults to `areaspline` if 
			 * defined, otherwise `line`.
			 *
			 * @type {String}
			 */
			type: defaultSeriesType,
			/*= if (build.classic) { =*/

			/**
			 * The color of the navigator series.
			 * @type {Color}
			 */
			color: '${palette.highlightColor80}',

			/**
			 * The fill opacity of the navigator series.
			 */
			fillOpacity: 0.05,

			/**
			 * The pixel line width of the navigator series.
			 */
			lineWidth: 1,
			/*= } =*/

			/**
			 * @ignore
			 */
			compare: null,

			/**
			 * Data grouping options for the navigator series.
			 * 
			 * @extends {plotOptions.series.dataGrouping}
			 */
			dataGrouping: {
				approximation: 'average',
				enabled: true,
				groupPixelWidth: 2,
				smoothed: true,
				units: units
			},

			/**
			 * Data label options for the navigator series. Data labels are 
			 * disabled by default on the navigator series.
			 *
			 * @extends {plotOptions.series.dataLabels}
			 */
			dataLabels: {
				enabled: false,
				zIndex: 2 // #1839
			},

			id: 'highcharts-navigator-series',
			className: 'highcharts-navigator-series',

			/**
			 * Line color for the navigator series. Allows setting the color
			 * while disallowing the default candlestick setting.
			 *
			 * @type {Color}
			 */
			lineColor: null, // #4602

			marker: {
				enabled: false
			},

			pointRange: 0,
			/**
			 * The threshold option. Setting it to 0 will make the default
			 * navigator area series draw its area from the 0 value and up.
			 * @type {Number}
			 */
			threshold: null
		},
		
		/**
		 * Options for the navigator X axis. Default series options
		 * for the navigator xAxis are:
		 * 
		 * <pre>xAxis: {
		 *     tickWidth: 0,
		 *     lineWidth: 0,
		 *     gridLineWidth: 1,
		 *     tickPixelInterval: 200,
		 *     labels: {
		 *     	   align: 'left',
		 *         style: {
		 *             color: '#888'
		 *         },
		 *         x: 3,
		 *         y: -4
		 *     }
		 * }</pre>
		 * 
		 * @type {Object}
		 * @extends {xAxis}
		 * @excluding linkedTo,maxZoom,minRange,opposite,range,scrollbar,
		 *          showEmpty,maxRange
		 * @product highstock
		 */
		xAxis: {
			/**
			 * Additional range on the right side of the xAxis. Works similar to
			 * xAxis.maxPadding, but value is set in milliseconds. 
			 * Can be set for both, main xAxis and navigator's xAxis.
			 * 
			 * @type {Number}
			 * @default 0
			 * @since 6.0.0
			 * @product highstock
			 * @apioption xAxis.overscroll
			 */
			overscroll: 0,

			className: 'highcharts-navigator-xaxis',
			tickLength: 0,
			
			/*= if (build.classic) { =*/
			lineWidth: 0,
			gridLineColor: '${palette.neutralColor10}',
			gridLineWidth: 1,
			/*= } =*/

			tickPixelInterval: 200,

			labels: {
				align: 'left',
				
				/*= if (build.classic) { =*/
				style: {
					color: '${palette.neutralColor40}'
				},
				/*= } =*/

				x: 3,
				y: -4
			},

			crosshair: false
		},

		/**
		 * Options for the navigator Y axis. Default series options
		 * for the navigator yAxis are:
		 * 
		 * <pre>yAxis: {
		 *     gridLineWidth: 0,
		 *     startOnTick: false,
		 *     endOnTick: false,
		 *     minPadding: 0.1,
		 *     maxPadding: 0.1,
		 *     labels: {
		 *         enabled: false
		 *     },
		 *     title: {
		 *         text: null
		 *     },
		 *     tickWidth: 0
		 * }</pre>
		 * 
		 * @type {Object}
		 * @extends {yAxis}
		 * @excluding height,linkedTo,maxZoom,minRange,ordinal,range,showEmpty,
		 *          scrollbar,top,units,maxRange
		 * @product highstock
		 */
		yAxis: {

			className: 'highcharts-navigator-yaxis',
			
			/*= if (build.classic) { =*/
			gridLineWidth: 0,
			/*= } =*/

			startOnTick: false,
			endOnTick: false,
			minPadding: 0.1,
			maxPadding: 0.1,
			labels: {
				enabled: false
			},
			crosshair: false,
			title: {
				text: null
			},
			tickLength: 0,
			tickWidth: 0
		}
	}
});

/**
 * Draw one of the handles on the side of the zoomed range in the navigator
 * @param {Boolean} inverted flag for chart.inverted
 * @returns {Array} Path to be used in a handle
 */
H.Renderer.prototype.symbols['navigator-handle'] = function (
	x,
	y,
	w,
	h,
	options
) {
	var halfWidth = options.width / 2,
		markerPosition = Math.round(halfWidth / 3) + 0.5,
		height = options.height;

	return [
		'M',
		-halfWidth - 1, 0.5,
		'L',
		halfWidth, 0.5,
		'L',
		halfWidth, height + 0.5,
		'L',
		-halfWidth - 1, height + 0.5,
		'L',
		-halfWidth - 1, 0.5,
		'M',
		-markerPosition, 4,
		'L',
		-markerPosition, height - 3,
		'M',
		markerPosition - 1, 4,
		'L',
		markerPosition - 1, height - 3
	];
};

/**
 * The Navigator class
 * @param {Object} chart - Chart object
 * @class
 */
function Navigator(chart) {
	this.init(chart);
}

Navigator.prototype = {
	/**
	 * Draw one of the handles on the side of the zoomed range in the navigator
	 * @param {Number} x The x center for the handle
	 * @param {Number} index 0 for left and 1 for right
	 * @param {Boolean} inverted flag for chart.inverted
	 * @param {String} verb use 'animate' or 'attr'
	 */
	drawHandle: function (x, index, inverted, verb) {
		var navigator = this,
			height = navigator.navigatorOptions.handles.height;

		// Place it
		navigator.handles[index][verb](inverted ? {
			translateX: Math.round(navigator.left + navigator.height / 2),
			translateY: Math.round(
				navigator.top + parseInt(x, 10) + 0.5 - height
			)
		} : {
			translateX: Math.round(navigator.left + parseInt(x, 10)),
			translateY: Math.round(
				navigator.top + navigator.height / 2 - height / 2 - 1
			)
		});
	},

	/**
	 * Render outline around the zoomed range
	 * @param {Number} zoomedMin in pixels position where zoomed range starts
	 * @param {Number} zoomedMax in pixels position where zoomed range ends
	 * @param {Boolean} inverted flag if chart is inverted
	 * @param {String} verb use 'animate' or 'attr'
	 */
	drawOutline: function (zoomedMin, zoomedMax, inverted, verb) {
		var navigator = this,
			maskInside = navigator.navigatorOptions.maskInside,
			outlineWidth = navigator.outline.strokeWidth(),
			halfOutline = outlineWidth / 2,
			outlineCorrection = (outlineWidth % 2) / 2, // #5800
			outlineHeight = navigator.outlineHeight,
			scrollbarHeight = navigator.scrollbarHeight,
			navigatorSize = navigator.size,
			left = navigator.left - scrollbarHeight,
			navigatorTop = navigator.top,
			verticalMin,
			path;

		if (inverted) {
			left -= halfOutline;
			verticalMin = navigatorTop + zoomedMax + outlineCorrection;
			zoomedMax = navigatorTop + zoomedMin + outlineCorrection;

			path = [
				'M',
				left + outlineHeight,
				navigatorTop - scrollbarHeight - outlineCorrection, // top edge
				'L',
				left + outlineHeight,
				verticalMin, // top right of zoomed range
				'L',
				left,
				verticalMin, // top left of z.r.
				'L',
				left,
				zoomedMax, // bottom left of z.r.
				'L',
				left + outlineHeight,
				zoomedMax, // bottom right of z.r.
				'L',
				left + outlineHeight,
				navigatorTop + navigatorSize + scrollbarHeight // bottom edge
			].concat(maskInside ? [
				'M',
				left + outlineHeight,
				verticalMin - halfOutline, // upper left of zoomed range
				'L',
				left + outlineHeight,
				zoomedMax + halfOutline // upper right of z.r.
			] : []);
		} else {
			zoomedMin += left + scrollbarHeight - outlineCorrection;
			zoomedMax += left + scrollbarHeight - outlineCorrection;
			navigatorTop += halfOutline;

			path = [
				'M',
				left,
				navigatorTop, // left
				'L',
				zoomedMin,
				navigatorTop, // upper left of zoomed range
				'L',
				zoomedMin,
				navigatorTop + outlineHeight, // lower left of z.r.
				'L',
				zoomedMax,
				navigatorTop + outlineHeight, // lower right of z.r.
				'L',
				zoomedMax,
				navigatorTop, // upper right of z.r.
				'L',
				left + navigatorSize + scrollbarHeight * 2,
				navigatorTop // right
			].concat(maskInside ? [
				'M',
				zoomedMin - halfOutline,
				navigatorTop, // upper left of zoomed range
				'L',
				zoomedMax + halfOutline,
				navigatorTop // upper right of z.r.
			] : []);
		}
		navigator.outline[verb]({
			d: path
		});
	},

	/**
	 * Render outline around the zoomed range
	 * @param {Number} zoomedMin in pixels position where zoomed range starts
	 * @param {Number} zoomedMax in pixels position where zoomed range ends
	 * @param {Boolean} inverted flag if chart is inverted
	 * @param {String} verb use 'animate' or 'attr'
	 */
	drawMasks: function (zoomedMin, zoomedMax, inverted, verb) {
		var navigator = this,
			left = navigator.left,
			top = navigator.top,
			navigatorHeight = navigator.height,
			height,
			width,
			x,
			y;

		// Determine rectangle position & size 
		// According to (non)inverted position:
		if (inverted) {
			x = [left, left, left];
			y = [top, top + zoomedMin, top + zoomedMax];
			width = [navigatorHeight, navigatorHeight, navigatorHeight];
			height = [
				zoomedMin,
				zoomedMax - zoomedMin,
				navigator.size - zoomedMax
			];
		} else {
			x = [left, left + zoomedMin, left + zoomedMax];
			y = [top, top, top];
			width = [
				zoomedMin,
				zoomedMax - zoomedMin,
				navigator.size - zoomedMax
			];
			height = [navigatorHeight, navigatorHeight, navigatorHeight];
		}
		each(navigator.shades, function (shade, i) {
			shade[verb]({
				x: x[i],
				y: y[i],
				width: width[i],
				height: height[i]
			});
		});
	},

	/**
	 * Generate DOM elements for a navigator:
	 * - main navigator group
	 * - all shades
	 * - outline
	 * - handles
	 */
	renderElements: function () {
		var navigator = this,
			navigatorOptions = navigator.navigatorOptions,
			maskInside = navigatorOptions.maskInside,
			chart = navigator.chart,
			inverted = chart.inverted,
			renderer = chart.renderer,
			navigatorGroup;

		// Create the main navigator group
		navigator.navigatorGroup = navigatorGroup = renderer.g('navigator')
			.attr({
				zIndex: 8,
				visibility: 'hidden'
			})
			.add();


		/*= if (build.classic) { =*/
		var mouseCursor = {
			cursor: inverted ? 'ns-resize' : 'ew-resize'
		};
		/*= } =*/

		// Create masks, each mask will get events and fill:
		each([!maskInside, maskInside, !maskInside], function (hasMask, index) {
			navigator.shades[index] = renderer.rect()
				.addClass('highcharts-navigator-mask' + 
					(index === 1 ? '-inside' : '-outside'))
				/*= if (build.classic) { =*/
				.attr({
					fill: hasMask ? navigatorOptions.maskFill : 'rgba(0,0,0,0)'
				})
				.css(index === 1 && mouseCursor)
				/*= } =*/
				.add(navigatorGroup);
		});

		// Create the outline:
		navigator.outline = renderer.path()
			.addClass('highcharts-navigator-outline')
			/*= if (build.classic) { =*/
			.attr({
				'stroke-width': navigatorOptions.outlineWidth,
				stroke: navigatorOptions.outlineColor
			})
			/*= } =*/
			.add(navigatorGroup);

		// Create the handlers:
		if (navigatorOptions.handles.enabled) {
			each([0, 1], function (index) {
				navigatorOptions.handles.inverted = chart.inverted;
				navigator.handles[index] = renderer.symbol(
					navigatorOptions.handles.symbols[index],
					-navigatorOptions.handles.width / 2 - 1,
					0,
					navigatorOptions.handles.width,
					navigatorOptions.handles.height,
					navigatorOptions.handles
				);
				// zIndex = 6 for right handle, 7 for left.
				// Can't be 10, because of the tooltip in inverted chart #2908
				navigator.handles[index].attr({ zIndex: 7 - index })
					.addClass(
						'highcharts-navigator-handle ' +
						'highcharts-navigator-handle-' +
						['left', 'right'][index]
					).add(navigatorGroup);

				/*= if (build.classic) { =*/
				var handlesOptions = navigatorOptions.handles;
				navigator.handles[index]
					.attr({
						fill: handlesOptions.backgroundColor,
						stroke: handlesOptions.borderColor,
						'stroke-width': handlesOptions.lineWidth
					})
					.css(mouseCursor);
				/*= } =*/
			});
		}
	},

	/**
	 * Update navigator
	 * @param {Object} options Options to merge in when updating navigator
	 */
	update: function (options) {
		// Remove references to old navigator series in base series
		each(this.series || [], function (series) {
			if (series.baseSeries) {
				delete series.baseSeries.navigatorSeries;
			}
		});
		// Destroy and rebuild navigator
		this.destroy();
		var chartOptions = this.chart.options;
		merge(true, chartOptions.navigator, this.options, options);
		this.init(this.chart);
	},

	/**
	 * Render the navigator
	 * @param {Number} min X axis value minimum
	 * @param {Number} max X axis value maximum
	 * @param {Number} pxMin Pixel value minimum
	 * @param {Number} pxMax Pixel value maximum
	 */
	render: function (min, max, pxMin, pxMax) {
		var navigator = this,
			chart = navigator.chart,
			navigatorWidth,
			scrollbarLeft,
			scrollbarTop,
			scrollbarHeight = navigator.scrollbarHeight,
			navigatorSize,
			xAxis = navigator.xAxis,
			scrollbarXAxis = xAxis.fake ? chart.xAxis[0] : xAxis,
			navigatorEnabled = navigator.navigatorEnabled,
			zoomedMin,
			zoomedMax,
			rendered = navigator.rendered,
			inverted = chart.inverted,
			verb,
			newMin,
			newMax,
			currentRange,
			minRange = chart.xAxis[0].minRange,
			maxRange = chart.xAxis[0].options.maxRange;

		// Don't redraw while moving the handles (#4703).
		if (this.hasDragged && !defined(pxMin)) {
			return;
		}

		// Don't render the navigator until we have data (#486, #4202, #5172).
		if (!isNumber(min) || !isNumber(max)) {
			// However, if navigator was already rendered, we may need to resize
			// it. For example hidden series, but visible navigator (#6022).
			if (rendered) {
				pxMin = 0;
				pxMax = xAxis.width;
			} else {
				return;
			}
		}

		navigator.left = pick(
			xAxis.left,
			// in case of scrollbar only, without navigator
			chart.plotLeft + scrollbarHeight + (inverted ? chart.plotWidth : 0)
		);

		navigator.size = zoomedMax = navigatorSize = pick(
			xAxis.len,
			(inverted ? chart.plotHeight : chart.plotWidth) -
				2 * scrollbarHeight
		);

		if (inverted) {
			navigatorWidth = scrollbarHeight;
		} else {
			navigatorWidth = navigatorSize + 2 * scrollbarHeight;
		}

		// Get the pixel position of the handles
		pxMin = pick(pxMin, xAxis.toPixels(min, true));
		pxMax = pick(pxMax, xAxis.toPixels(max, true));

		// Verify (#1851, #2238)
		if (!isNumber(pxMin) || Math.abs(pxMin) === Infinity) {
			pxMin = 0;
			pxMax = navigatorWidth;
		}

		// Are we below the minRange? (#2618, #6191)
		newMin = xAxis.toValue(pxMin, true);
		newMax = xAxis.toValue(pxMax, true);
		currentRange = Math.abs(H.correctFloat(newMax - newMin));
		if (currentRange < minRange) {
			if (this.grabbedLeft) {
				pxMin = xAxis.toPixels(newMax - minRange, true);
			} else if (this.grabbedRight) {
				pxMax = xAxis.toPixels(newMin + minRange, true);
			}
		} else if (defined(maxRange) && currentRange > maxRange) {
			/**
			 * Maximum range which can be set using the navigator's handles.
			 * Opposite of [xAxis.minRange](#xAxis.minRange).
			 *
			 * @type {Number}
			 * @default undefined
			 * @product highstock
			 * @sample {highstock} stock/navigator/maxrange/
			 *         Defined max and min range
			 * @since 6.0.0
			 * @apioption xAxis.maxRange
			 */
			if (this.grabbedLeft) {
				pxMin = xAxis.toPixels(newMax - maxRange, true);
			} else if (this.grabbedRight) {
				pxMax = xAxis.toPixels(newMin + maxRange, true);
			}
		}

		// Handles are allowed to cross, but never exceed the plot area
		navigator.zoomedMax = Math.min(Math.max(pxMin, pxMax, 0), zoomedMax);
		navigator.zoomedMin = Math.min(
			Math.max(
				navigator.fixedWidth ?
					navigator.zoomedMax - navigator.fixedWidth :
					Math.min(pxMin, pxMax),
				0
			),
			zoomedMax
		);

		navigator.range = navigator.zoomedMax - navigator.zoomedMin;

		zoomedMax = Math.round(navigator.zoomedMax);
		zoomedMin = Math.round(navigator.zoomedMin);

		if (navigatorEnabled) {
			navigator.navigatorGroup.attr({
				visibility: 'visible'
			});
			// Place elements
			verb = rendered && !navigator.hasDragged ? 'animate' : 'attr';

			navigator.drawMasks(zoomedMin, zoomedMax, inverted, verb);
			navigator.drawOutline(zoomedMin, zoomedMax, inverted, verb);

			if (navigator.navigatorOptions.handles.enabled) {
				navigator.drawHandle(zoomedMin, 0, inverted, verb);
				navigator.drawHandle(zoomedMax, 1, inverted, verb);
			}
		}

		if (navigator.scrollbar) {
			if (inverted) {
				scrollbarTop = navigator.top - scrollbarHeight;
				scrollbarLeft = navigator.left - scrollbarHeight +
					(navigatorEnabled || !scrollbarXAxis.opposite ? 0 :
						// Multiple axes has offsets:
						(scrollbarXAxis.titleOffset || 0) +
						// Self margin from the axis.title
						scrollbarXAxis.axisTitleMargin
					);
				scrollbarHeight = navigatorSize + 2 * scrollbarHeight;
			} else {
				scrollbarTop = navigator.top +
					(navigatorEnabled ? navigator.height : -scrollbarHeight);
				scrollbarLeft = navigator.left - scrollbarHeight;
			}
			// Reposition scrollbar
			navigator.scrollbar.position(
				scrollbarLeft,
				scrollbarTop,
				navigatorWidth,
				scrollbarHeight
			);
			// Keep scale 0-1
			navigator.scrollbar.setRange(
				// Use real value, not rounded because range can be very small
				// (#1716)
				navigator.zoomedMin / navigatorSize,
				navigator.zoomedMax / navigatorSize
			);
		}
		navigator.rendered = true;
	},

	/**
	 * Set up the mouse and touch events for the navigator
	 */
	addMouseEvents: function () {
		var navigator = this,
			chart = navigator.chart,
			container = chart.container,
			eventsToUnbind = [],
			mouseMoveHandler,
			mouseUpHandler;

		/**
		 * Create mouse events' handlers.
		 * Make them as separate functions to enable wrapping them:
		 */
		navigator.mouseMoveHandler = mouseMoveHandler = function (e) {
			navigator.onMouseMove(e);
		};
		navigator.mouseUpHandler = mouseUpHandler = function (e) {
			navigator.onMouseUp(e);
		};

		// Add shades and handles mousedown events
		eventsToUnbind = navigator.getPartsEvents('mousedown');
		// Add mouse move and mouseup events. These are bind to doc/container,
		// because Navigator.grabbedSomething flags are stored in mousedown
		// events
		eventsToUnbind.push(
			addEvent(container, 'mousemove', mouseMoveHandler),
			addEvent(container.ownerDocument, 'mouseup', mouseUpHandler)
		);

		// Touch events
		if (hasTouch) {
			eventsToUnbind.push(
				addEvent(container, 'touchmove', mouseMoveHandler),
				addEvent(container.ownerDocument, 'touchend', mouseUpHandler)
			);
			eventsToUnbind.concat(navigator.getPartsEvents('touchstart'));
		}

		navigator.eventsToUnbind = eventsToUnbind;

		// Data events
		if (navigator.series && navigator.series[0]) {
			eventsToUnbind.push(
				addEvent(
					navigator.series[0].xAxis,
					'foundExtremes',
					function () {
						chart.navigator.modifyNavigatorAxisExtremes();
					}
				)
			);
		}
	},

	/**
	 * Generate events for handles and masks
	 * @param {String} eventName Event name handler, 'mousedown' or 'touchstart'
	 * @returns {Array} An array of arrays: [DOMElement, eventName, callback].
	 */
	getPartsEvents: function (eventName) {
		var navigator = this,
			events = [];
		each(['shades', 'handles'], function (name) {
			each(navigator[name], function (navigatorItem, index) {
				events.push(
					addEvent(
						navigatorItem.element,
						eventName,
						function (e) {
							navigator[name + 'Mousedown'](e, index);
						}
					)
				);
			});
		});
		return events;
	},

	/**
	 * Mousedown on a shaded mask, either:
	 * - will be stored for future drag&drop 
	 * - will directly shift to a new range
	 *
	 * @param {Object} e Mouse event
	 * @param {Number} index Index of a mask in Navigator.shades array
	 */
	shadesMousedown: function (e, index) {
		e = this.chart.pointer.normalize(e);

		var navigator = this,
			chart = navigator.chart,
			xAxis = navigator.xAxis,
			zoomedMin = navigator.zoomedMin,
			navigatorPosition = navigator.left,
			navigatorSize = navigator.size,
			range = navigator.range,
			chartX = e.chartX,
			fixedMax,
			ext,
			left;

		// For inverted chart, swap some options:
		if (chart.inverted) {
			chartX = e.chartY;
			navigatorPosition = navigator.top;
		}

		if (index === 1) {
			// Store information for drag&drop
			navigator.grabbedCenter = chartX;
			navigator.fixedWidth = range;
			navigator.dragOffset = chartX - zoomedMin;
		} else {
			// Shift the range by clicking on shaded areas
			left = chartX - navigatorPosition - range / 2;
			if (index === 0) {
				left = Math.max(0, left);
			} else if (index === 2 && left + range >= navigatorSize) {
				left = navigatorSize - range;
				fixedMax = navigator.getUnionExtremes().dataMax; // #2293, #3543
			}
			if (left !== zoomedMin) { // it has actually moved
				navigator.fixedWidth = range; // #1370

				ext = xAxis.toFixedRange(left, left + range, null, fixedMax);
				chart.xAxis[0].setExtremes(
					Math.min(ext.min, ext.max),
					Math.max(ext.min, ext.max),
					true,
					null, // auto animation
					{ trigger: 'navigator' }
				);
			}
		}
	},

	/**
	 * Mousedown on a handle mask.
	 * Will store necessary information for drag&drop.
	 *
	 * @param {Object} e Mouse event
	 * @param {Number} index Index of a handle in Navigator.handles array
	 */
	handlesMousedown: function (e, index) {
		e = this.chart.pointer.normalize(e);

		var navigator = this,
			chart = navigator.chart,
			baseXAxis = chart.xAxis[0],
			// For reversed axes, min and max are chagned,
			// so the other extreme should be stored
			reverse = (chart.inverted && !baseXAxis.reversed) ||
				(!chart.inverted && baseXAxis.reversed);

		if (index === 0) {
			// Grab the left handle
			navigator.grabbedLeft = true;
			navigator.otherHandlePos = navigator.zoomedMax;
			navigator.fixedExtreme = reverse ? baseXAxis.min : baseXAxis.max;
		} else {
			// Grab the right handle
			navigator.grabbedRight = true;
			navigator.otherHandlePos = navigator.zoomedMin;
			navigator.fixedExtreme = reverse ? baseXAxis.max : baseXAxis.min;
		}

		chart.fixedRange = null;
	},
	/**
	 * Mouse move event based on x/y mouse position.
	 * @param {Object} e Mouse event
	 */
	onMouseMove: function (e) {
		var navigator = this,
			chart = navigator.chart,
			left = navigator.left,
			navigatorSize = navigator.navigatorSize,
			range = navigator.range,
			dragOffset = navigator.dragOffset,
			inverted = chart.inverted,
			chartX;


		// In iOS, a mousemove event with e.pageX === 0 is fired when holding
		// the finger down in the center of the scrollbar. This should be
		// ignored.
		if (!e.touches || e.touches[0].pageX !== 0) { // #4696

			e = chart.pointer.normalize(e);
			chartX = e.chartX;

			// Swap some options for inverted chart
			if (inverted) {
				left = navigator.top;
				chartX = e.chartY;
			}

			// Drag left handle or top handle
			if (navigator.grabbedLeft) {
				navigator.hasDragged = true;
				navigator.render(
					0,
					0,
					chartX - left,
					navigator.otherHandlePos
				);
			// Drag right handle or bottom handle
			} else if (navigator.grabbedRight) {
				navigator.hasDragged = true;
				navigator.render(
					0,
					0,
					navigator.otherHandlePos,
					chartX - left
				);
			// Drag scrollbar or open area in navigator
			} else if (navigator.grabbedCenter) {
				navigator.hasDragged = true;
				if (chartX < dragOffset) { // outside left
					chartX = dragOffset;
				// outside right
				} else if (chartX > navigatorSize + dragOffset - range) {
					chartX = navigatorSize + dragOffset - range;
				}

				navigator.render(
					0,
					0,
					chartX - dragOffset,
					chartX - dragOffset + range
				);
			}
			if (
				navigator.hasDragged &&
				navigator.scrollbar &&
				navigator.scrollbar.options.liveRedraw
			) {
				e.DOMType = e.type; // DOMType is for IE8
				setTimeout(function () {
					navigator.onMouseUp(e);
				}, 0);
			}
		}
	},

	/**
	 * Mouse up event based on x/y mouse position.
	 * @param {Object} e Mouse event
	 */
	onMouseUp: function (e) {
		var navigator = this,
			chart = navigator.chart,
			xAxis = navigator.xAxis,
			scrollbar = navigator.scrollbar,
			fixedMin,
			fixedMax,
			ext,
			DOMEvent = e.DOMEvent || e;

		if (
			// MouseUp is called for both, navigator and scrollbar (that order),
			// which causes calling afterSetExtremes twice. Prevent first call
			// by checking if scrollbar is going to set new extremes (#6334)
			(navigator.hasDragged && (!scrollbar || !scrollbar.hasDragged)) ||
			e.trigger === 'scrollbar'
		) {
			// When dragging one handle, make sure the other one doesn't change
			if (navigator.zoomedMin === navigator.otherHandlePos) {
				fixedMin = navigator.fixedExtreme;
			} else if (navigator.zoomedMax === navigator.otherHandlePos) {
				fixedMax = navigator.fixedExtreme;
			}
			// Snap to right edge (#4076)
			if (navigator.zoomedMax === navigator.size) {
				fixedMax = navigator.getUnionExtremes().dataMax;
			}
			ext = xAxis.toFixedRange(
				navigator.zoomedMin,
				navigator.zoomedMax,
				fixedMin,
				fixedMax
			);

			if (defined(ext.min)) {
				chart.xAxis[0].setExtremes(
					Math.min(ext.min, ext.max),
					Math.max(ext.min, ext.max),
					true,
					// Run animation when clicking buttons, scrollbar track etc,
					// but not when dragging handles or scrollbar
					navigator.hasDragged ? false : null,
					{
						trigger: 'navigator',
						triggerOp: 'navigator-drag',
						DOMEvent: DOMEvent // #1838
					}
				);
			}
		}

		if (e.DOMType !== 'mousemove') {
			navigator.grabbedLeft = navigator.grabbedRight =
				navigator.grabbedCenter = navigator.fixedWidth =
				navigator.fixedExtreme = navigator.otherHandlePos =
				navigator.hasDragged = navigator.dragOffset = null;
		}
	},

	/**
	 * Removes the event handlers attached previously with addEvents.
	 */
	removeEvents: function () {
		if (this.eventsToUnbind) {
			each(this.eventsToUnbind, function (unbind) {
				unbind();
			});
			this.eventsToUnbind = undefined;
		}
		this.removeBaseSeriesEvents();
	},

	/**
	 * Remove data events.
	 */
	removeBaseSeriesEvents: function () {
		var baseSeries = this.baseSeries || [];
		if (this.navigatorEnabled && baseSeries[0]) {
			if (this.navigatorOptions.adaptToUpdatedData !== false) {
				each(baseSeries, function (series) {
					removeEvent(series, 'updatedData', this.updatedDataHandler);
				}, this);
			}

			// We only listen for extremes-events on the first baseSeries
			if (baseSeries[0].xAxis) {
				removeEvent(
					baseSeries[0].xAxis,
					'foundExtremes',
					this.modifyBaseAxisExtremes
				);
			}
		}
	},

	/**
	 * Initiate the Navigator object
	 */
	init: function (chart) {
		var chartOptions = chart.options,
			navigatorOptions = chartOptions.navigator,
			navigatorEnabled = navigatorOptions.enabled,
			scrollbarOptions = chartOptions.scrollbar,
			scrollbarEnabled = scrollbarOptions.enabled,
			height = navigatorEnabled ? navigatorOptions.height : 0,
			scrollbarHeight = scrollbarEnabled ? scrollbarOptions.height : 0;

		this.handles = [];
		this.shades = [];

		this.chart = chart;
		this.setBaseSeries();

		this.height = height;
		this.scrollbarHeight = scrollbarHeight;
		this.scrollbarEnabled = scrollbarEnabled;
		this.navigatorEnabled = navigatorEnabled;
		this.navigatorOptions = navigatorOptions;
		this.scrollbarOptions = scrollbarOptions;
		this.outlineHeight = height + scrollbarHeight;

		this.opposite = pick(
			navigatorOptions.opposite,
			!navigatorEnabled && chart.inverted
		); // #6262

		var navigator = this,
			baseSeries = navigator.baseSeries,
			xAxisIndex = chart.xAxis.length,
			yAxisIndex = chart.yAxis.length,
			baseXaxis = baseSeries && baseSeries[0] && baseSeries[0].xAxis ||
				chart.xAxis[0];

		// Make room for the navigator, can be placed around the chart:
		chart.extraMargin = {
			type: navigator.opposite ? 'plotTop' : 'marginBottom',
			value: (
				navigatorEnabled || !chart.inverted ?
					navigator.outlineHeight :
					0
			) + navigatorOptions.margin
		};
		if (chart.inverted) {
			chart.extraMargin.type = navigator.opposite ?
				'marginRight' :
				'plotLeft';
		}
		chart.isDirtyBox = true;

		if (navigator.navigatorEnabled) {
			// an x axis is required for scrollbar also
			navigator.xAxis = new Axis(chart, merge({
				// inherit base xAxis' break and ordinal options
				breaks: baseXaxis.options.breaks,
				ordinal: baseXaxis.options.ordinal
			}, navigatorOptions.xAxis, {
				id: 'navigator-x-axis',
				yAxis: 'navigator-y-axis',
				isX: true,
				type: 'datetime',
				index: xAxisIndex,
				offset: 0,
				keepOrdinalPadding: true, // #2436
				startOnTick: false,
				endOnTick: false,
				minPadding: 0,
				maxPadding: 0,
				zoomEnabled: false
			}, chart.inverted ? {
				offsets: [scrollbarHeight, 0, -scrollbarHeight, 0],
				width: height
			} : {
				offsets: [0, -scrollbarHeight, 0, scrollbarHeight],
				height: height
			}));

			navigator.yAxis = new Axis(chart, merge(navigatorOptions.yAxis, {
				id: 'navigator-y-axis',
				alignTicks: false,
				offset: 0,
				index: yAxisIndex,
				zoomEnabled: false
			}, chart.inverted ? {
				width: height
			} : {
				height: height
			}));

			// If we have a base series, initialize the navigator series
			if (baseSeries || navigatorOptions.series.data) {
				navigator.updateNavigatorSeries();

			// If not, set up an event to listen for added series
			} else if (chart.series.length === 0) {

				wrap(chart, 'redraw', function (proceed, animation) {
					// We've got one, now add it as base and reset chart.redraw
					if (chart.series.length > 0 && !navigator.series) {
						navigator.setBaseSeries();
						chart.redraw = proceed; // reset
					}
					proceed.call(chart, animation);
				});
			}

			// Render items, so we can bind events to them:
			navigator.renderElements();
			// Add mouse events
			navigator.addMouseEvents();

		// in case of scrollbar only, fake an x axis to get translation
		} else {
			navigator.xAxis = {
				translate: function (value, reverse) {
					var axis = chart.xAxis[0],
						ext = axis.getExtremes(),
						scrollTrackWidth = axis.len - 2 * scrollbarHeight,
						min = numExt('min', axis.options.min, ext.dataMin),
						valueRange = numExt(
							'max',
							axis.options.max,
							ext.dataMax
						) - min;

					return reverse ?
						// from pixel to value
						(value * valueRange / scrollTrackWidth) + min :
						// from value to pixel
						scrollTrackWidth * (value - min) / valueRange;
				},
				toPixels: function (value) {
					return this.translate(value);
				},
				toValue: function (value) {
					return this.translate(value, true);
				},
				toFixedRange: Axis.prototype.toFixedRange,
				fake: true
			};
		}


		// Initialize the scrollbar
		if (chart.options.scrollbar.enabled) {
			chart.scrollbar = navigator.scrollbar = new Scrollbar(
				chart.renderer,
				merge(chart.options.scrollbar, { 
					margin: navigator.navigatorEnabled ? 0 : 10,
					vertical: chart.inverted
				}),
				chart
			);
			addEvent(navigator.scrollbar, 'changed', function (e) {
				var range = navigator.size,
					to = range * this.to,
					from = range * this.from;

				navigator.hasDragged = navigator.scrollbar.hasDragged;
				navigator.render(0, 0, from, to);

				if (
					chart.options.scrollbar.liveRedraw ||
					e.DOMType !== 'mousemove'
				) {
					setTimeout(function () {
						navigator.onMouseUp(e);
					});
				}
			});
		}

		// Add data events
		navigator.addBaseSeriesEvents();
		// Add redraw events
		navigator.addChartEvents();
	},

	/**
	 * Get the union data extremes of the chart - the outer data extremes of the
	 * base X axis and the navigator axis.
	 * @param {boolean} returnFalseOnNoBaseSeries - as the param says.
	 */
	getUnionExtremes: function (returnFalseOnNoBaseSeries) {
		var baseAxis = this.chart.xAxis[0],
			navAxis = this.xAxis,
			navAxisOptions = navAxis.options,
			baseAxisOptions = baseAxis.options,
			ret;

		if (!returnFalseOnNoBaseSeries || baseAxis.dataMin !== null) {
			ret = {
				dataMin: pick( // #4053
					navAxisOptions && navAxisOptions.min,
					numExt(
						'min',
						baseAxisOptions.min,
						baseAxis.dataMin,
						navAxis.dataMin,
						navAxis.min
					)
				),
				dataMax: pick(
					navAxisOptions && navAxisOptions.max,
					numExt(
						'max',
						baseAxisOptions.max,
						baseAxis.dataMax,
						navAxis.dataMax,
						navAxis.max
					)
				)
			};
		}
		return ret;
	},

	/**
	 * Set the base series and update the navigator series from this. With a bit
	 * of modification we should be able to make this an API method to be called
	 * from the outside
	 * @param  {Object} baseSeriesOptions
	 *         Additional series options for a navigator
	 * @param  {Boolean} [redraw]
	 *         Whether to redraw after update.
	 */
	setBaseSeries: function (baseSeriesOptions, redraw) {
		var chart = this.chart,
			baseSeries = this.baseSeries = [];

		baseSeriesOptions = (
			baseSeriesOptions ||
			chart.options && chart.options.navigator.baseSeries ||
			0
		);

		// Iterate through series and add the ones that should be shown in
		// navigator.
		each(chart.series || [], function (series, i) {
			if (
				// Don't include existing nav series
				!series.options.isInternal &&
				(
					series.options.showInNavigator ||
					(
						i === baseSeriesOptions ||
						series.options.id === baseSeriesOptions
					) &&
					series.options.showInNavigator !== false
				)
			) {
				baseSeries.push(series);
			}
		});
			
		// When run after render, this.xAxis already exists
		if (this.xAxis && !this.xAxis.fake) {
			this.updateNavigatorSeries(redraw);
		}
	},

	/*
	 * Update series in the navigator from baseSeries, adding new if does not
	 * exist.
	 */
	updateNavigatorSeries: function (redraw) {
		var navigator = this,
			chart = navigator.chart,
			baseSeries = navigator.baseSeries,
			baseOptions,
			mergedNavSeriesOptions,
			chartNavigatorSeriesOptions = navigator.navigatorOptions.series,
			baseNavigatorOptions,
			navSeriesMixin = {
				enableMouseTracking: false,
				index: null, // #6162
				linkedTo: null, // #6734
				group: 'nav', // for columns
				padXAxis: false,
				xAxis: 'navigator-x-axis',
				yAxis: 'navigator-y-axis',
				showInLegend: false,
				stacking: false, // #4823
				isInternal: true,
				visible: true
			},
			// Remove navigator series that are no longer in the baseSeries
			navigatorSeries = navigator.series = H.grep(
				navigator.series || [], function (navSeries) {
					var base = navSeries.baseSeries;
					if (H.inArray(base, baseSeries) < 0) { // Not in array
						// If there is still a base series connected to this
						// series, remove event handler and reference.
						if (base) {
							removeEvent(
								base,
								'updatedData',
								navigator.updatedDataHandler
							);
							delete base.navigatorSeries;
						}
						// Kill the nav series
						navSeries.destroy();
						return false;
					}
					return true;
				}
			);

		// Go through each base series and merge the options to create new
		// series
		if (baseSeries && baseSeries.length) {
			each(baseSeries, function eachBaseSeries(base) {
				var linkedNavSeries = base.navigatorSeries,
					userNavOptions = !isArray(chartNavigatorSeriesOptions) ?
							chartNavigatorSeriesOptions :
							defaultOptions.navigator.series;

				// Don't update if the series exists in nav and we have disabled
				// adaptToUpdatedData.
				if (
					linkedNavSeries &&
					navigator.navigatorOptions.adaptToUpdatedData === false
				) {
					return;
				}

				navSeriesMixin.name = 'Navigator ' + baseSeries.length;

				baseOptions = base.options || {};
				baseNavigatorOptions = baseOptions.navigatorOptions || {};
				mergedNavSeriesOptions = merge(
					baseOptions, 
					navSeriesMixin, 
					userNavOptions,
					baseNavigatorOptions
				);

				// Merge data separately. Do a slice to avoid mutating the
				// navigator options from base series (#4923).
				var navigatorSeriesData = 
					baseNavigatorOptions.data || userNavOptions.data;
				navigator.hasNavigatorData =
					navigator.hasNavigatorData || !!navigatorSeriesData;
				mergedNavSeriesOptions.data = 
					navigatorSeriesData ||
					baseOptions.data && baseOptions.data.slice(0);

				// Update or add the series
				if (linkedNavSeries) {
					linkedNavSeries.update(mergedNavSeriesOptions, redraw);
				} else {
					base.navigatorSeries = chart.initSeries(
						mergedNavSeriesOptions
					);
					base.navigatorSeries.baseSeries = base; // Store ref
					navigatorSeries.push(base.navigatorSeries);
				}
			});
		}

		// If user has defined data (and no base series) or explicitly defined 
		// navigator.series as an array, we create these series on top of any 
		// base series.
		if (
			chartNavigatorSeriesOptions.data &&
			!(baseSeries && baseSeries.length) ||
			isArray(chartNavigatorSeriesOptions)
		) {
			navigator.hasNavigatorData = false;
			// Allow navigator.series to be an array
			chartNavigatorSeriesOptions = H.splat(chartNavigatorSeriesOptions);
			each(chartNavigatorSeriesOptions, function (userSeriesOptions, i) {
				navSeriesMixin.name =
					'Navigator ' + (navigatorSeries.length + 1);
				mergedNavSeriesOptions = merge(
					defaultOptions.navigator.series, 
					{
						// Since we don't have a base series to pull color from,
						// try to fake it by using color from series with same
						// index. Otherwise pull from the colors array. We need 
						// an explicit color as otherwise updates will increment
						// color counter and we'll get a new color for each
						// update of the nav series.
						color: chart.series[i] &&
							!chart.series[i].options.isInternal &&
							chart.series[i].color ||
							chart.options.colors[i] ||
							chart.options.colors[0]
					},
					navSeriesMixin,
					userSeriesOptions
				);
				mergedNavSeriesOptions.data = userSeriesOptions.data;
				if (mergedNavSeriesOptions.data) {
					navigator.hasNavigatorData = true;
					navigatorSeries.push(
						chart.initSeries(mergedNavSeriesOptions)
					);
				}
			});
		}

		this.addBaseSeriesEvents();
	},

	/**
	 * Add data events.
	 * For example when main series is updated we need to recalculate extremes
	 */
	addBaseSeriesEvents: function () {
		var navigator = this,
			baseSeries = navigator.baseSeries || [];

		// Bind modified extremes event to first base's xAxis only.
		// In event of > 1 base-xAxes, the navigator will ignore those.
		// Adding this multiple times to the same axis is no problem, as 
		// duplicates should be discarded by the browser.
		if (baseSeries[0] && baseSeries[0].xAxis) {
			addEvent(
				baseSeries[0].xAxis,
				'foundExtremes',
				this.modifyBaseAxisExtremes
			);
		}

		each(baseSeries, function (base) {
			// Link base series show/hide to navigator series visibility
			addEvent(base, 'show', function () {
				if (this.navigatorSeries) {
					this.navigatorSeries.show();
				}
			});
			addEvent(base, 'hide', function () {
				if (this.navigatorSeries) {
					this.navigatorSeries.hide();
				}
			});

			// Respond to updated data in the base series, unless explicitily 
			// not adapting to data changes.
			if (this.navigatorOptions.adaptToUpdatedData !== false) {
				if (base.xAxis) {
					addEvent(base, 'updatedData', this.updatedDataHandler);
				}
			}

			// Handle series removal
			addEvent(base, 'remove', function () {
				if (this.navigatorSeries) {
					erase(navigator.series, this.navigatorSeries);
					this.navigatorSeries.remove(false);
					delete this.navigatorSeries;
				}
			});
		}, this);
	},

	/**
	 * Set the navigator x axis extremes to reflect the total. The navigator
	 * extremes should always be the extremes of the union of all series in the
	 * chart as well as the navigator series.
	 */
	modifyNavigatorAxisExtremes: function () {
		var xAxis = this.xAxis,
			unionExtremes;

		if (xAxis.getExtremes) {
			unionExtremes = this.getUnionExtremes(true);
			if (
				unionExtremes &&
				(
					unionExtremes.dataMin !== xAxis.min ||
					unionExtremes.dataMax !== xAxis.max
				)
			) {
				xAxis.min = unionExtremes.dataMin;
				xAxis.max = unionExtremes.dataMax;
			}
		}
	},

	/**
	 * Hook to modify the base axis extremes with information from the Navigator
	 */
	modifyBaseAxisExtremes: function () {
		var baseXAxis = this,
			navigator = baseXAxis.chart.navigator,
			baseExtremes = baseXAxis.getExtremes(),
			baseMin = baseExtremes.min,
			baseMax = baseExtremes.max,
			baseDataMin = baseExtremes.dataMin,
			baseDataMax = baseExtremes.dataMax,
			range = baseMax - baseMin,
			stickToMin = navigator.stickToMin,
			stickToMax = navigator.stickToMax,
			overscroll = baseXAxis.options.overscroll,
			newMax,
			newMin,
			navigatorSeries = navigator.series && navigator.series[0],
			hasSetExtremes = !!baseXAxis.setExtremes,

			// When the extremes have been set by range selector button, don't
			// stick to min or max. The range selector buttons will handle the
			// extremes. (#5489)
			unmutable = baseXAxis.eventArgs &&
				baseXAxis.eventArgs.trigger === 'rangeSelectorButton';

		if (!unmutable) {
		
			// If the zoomed range is already at the min, move it to the right
			// as new data comes in
			if (stickToMin) {
				newMin = baseDataMin;
				newMax = newMin + range;
			}

			// If the zoomed range is already at the max, move it to the right
			// as new data comes in
			if (stickToMax) {
				newMax = baseDataMax + overscroll;

				// if stickToMin is true, the new min value is set above
				if (!stickToMin) {
					newMin = Math.max(
						newMax - range,
						navigatorSeries && navigatorSeries.xData ?
							navigatorSeries.xData[0] : -Number.MAX_VALUE
					);
				}
			}

			// Update the extremes
			if (hasSetExtremes && (stickToMin || stickToMax)) {
				if (isNumber(newMin)) {
					baseXAxis.min = baseXAxis.userMin = newMin;
					baseXAxis.max = baseXAxis.userMax = newMax;
				}
			}
		}

		// Reset
		navigator.stickToMin = navigator.stickToMax = null;
	},

	/**
	 * Handler for updated data on the base series. When data is modified, the
	 * navigator series must reflect it. This is called from the Chart.redraw
	 * function before axis and series extremes are computed.
	 */
	updatedDataHandler: function () {
		var navigator = this.chart.navigator,
			baseSeries = this,
			navigatorSeries = this.navigatorSeries;

		// If the scrollbar is scrolled all the way to the right, keep right as
		// new data  comes in.
		navigator.stickToMax =
			Math.round(navigator.zoomedMax) >= Math.round(navigator.size);

		// Detect whether the zoomed area should stick to the minimum or
		// maximum. If the current axis minimum falls outside the new updated
		// dataset, we must adjust.
		navigator.stickToMin = isNumber(baseSeries.xAxis.min) &&
			(baseSeries.xAxis.min <= baseSeries.xData[0]) &&
			(!this.chart.fixedRange || !navigator.stickToMax);

		// Set the navigator series data to the new data of the base series
		if (navigatorSeries && !navigator.hasNavigatorData) {
			navigatorSeries.options.pointStart = baseSeries.xData[0];
			navigatorSeries.setData(
				baseSeries.options.data,
				false,
				null,
				false
			); // #5414
		}
	},

	/**
	 * Add chart events, like redrawing navigator, when chart requires that.
	 */
	addChartEvents: function () {
		addEvent(this.chart, 'redraw', function () {
			// Move the scrollbar after redraw, like after data updata even if
			// axes don't redraw
			var navigator = this.navigator,
				xAxis = navigator && (
					navigator.baseSeries &&
					navigator.baseSeries[0] &&
					navigator.baseSeries[0].xAxis ||
					navigator.scrollbar && this.xAxis[0]
				); // #5709

			if (xAxis) {
				navigator.render(xAxis.min, xAxis.max);
			}
		});
	},

	/**
	 * Destroys allocated elements.
	 */
	destroy: function () {

		// Disconnect events added in addEvents
		this.removeEvents();

		if (this.xAxis) {
			erase(this.chart.xAxis, this.xAxis);
			erase(this.chart.axes, this.xAxis);
		}
		if (this.yAxis) {
			erase(this.chart.yAxis, this.yAxis);
			erase(this.chart.axes, this.yAxis);
		}
		// Destroy series
		each(this.series || [], function (s) {
			if (s.destroy) {
				s.destroy();
			}
		});

		// Destroy properties
		each([
			'series', 'xAxis', 'yAxis', 'shades', 'outline', 'scrollbarTrack',
			'scrollbarRifles', 'scrollbarGroup', 'scrollbar', 'navigatorGroup',
			'rendered'
		], function (prop) {
			if (this[prop] && this[prop].destroy) {
				this[prop].destroy();
			}
			this[prop] = null;
		}, this);

		// Destroy elements in collection
		each([this.handles], function (coll) {
			destroyObjectProperties(coll);
		}, this);
	}
};

H.Navigator = Navigator;

/**
 * For Stock charts, override selection zooming with some special features
 * because X axis zooming is already allowed by the Navigator and Range
 * selector.
 */
wrap(Axis.prototype, 'zoom', function (proceed, newMin, newMax) {
	var chart = this.chart,
		chartOptions = chart.options,
		zoomType = chartOptions.chart.zoomType,
		previousZoom,
		navigator = chartOptions.navigator,
		rangeSelector = chartOptions.rangeSelector,
		ret;

	if (this.isXAxis && ((navigator && navigator.enabled) ||
			(rangeSelector && rangeSelector.enabled))) {

		// For x only zooming, fool the chart.zoom method not to create the zoom
		// button because the property already exists
		if (zoomType === 'x') {
			chart.resetZoomButton = 'blocked';

		// For y only zooming, ignore the X axis completely
		} else if (zoomType === 'y') {
			ret = false;

		// For xy zooming, record the state of the zoom before zoom selection,
		// then when the reset button is pressed, revert to this state
		} else if (zoomType === 'xy') {
			previousZoom = this.previousZoom;
			if (defined(newMin)) {
				this.previousZoom = [this.min, this.max];
			} else if (previousZoom) {
				newMin = previousZoom[0];
				newMax = previousZoom[1];
				delete this.previousZoom;
			}
		}

	}
	return ret !== undefined ? ret : proceed.call(this, newMin, newMax);
});

// Initialize navigator for stock charts
wrap(Chart.prototype, 'init', function (proceed, options, callback) {

	addEvent(this, 'beforeRender', function () {
		var options = this.options;
		if (options.navigator.enabled || options.scrollbar.enabled) {
			this.scroller = this.navigator = new Navigator(this);
		}
	});

	proceed.call(this, options, callback);

});

/**
 * For stock charts, extend the Chart.setChartSize method so that we can set the
 * final top position of the navigator once the height of the chart, including
 * the legend, is determined. #367. We can't use Chart.getMargins, because
 * labels offsets are not calculated yet.
 */
wrap(Chart.prototype, 'setChartSize', function (proceed) {

	var legend = this.legend,
		navigator = this.navigator,
		scrollbarHeight,
		legendOptions,
		xAxis,
		yAxis;

	proceed.apply(this, [].slice.call(arguments, 1));

	if (navigator) {
		legendOptions = legend && legend.options;
		xAxis = navigator.xAxis;
		yAxis = navigator.yAxis;
		scrollbarHeight = navigator.scrollbarHeight;

		// Compute the top position
		if (this.inverted) {
			navigator.left = navigator.opposite ?
				this.chartWidth - scrollbarHeight - navigator.height : 
				this.spacing[3] + scrollbarHeight;
			navigator.top = this.plotTop + scrollbarHeight;
		} else {
			navigator.left = this.plotLeft + scrollbarHeight;
			navigator.top = navigator.navigatorOptions.top ||
				this.chartHeight -
				navigator.height -
				scrollbarHeight -
				this.spacing[2] -
				(
					this.rangeSelector && this.extraBottomMargin ?
						this.rangeSelector.getHeight() :
						0
				) - 
				(
					(
						legendOptions &&
						legendOptions.verticalAlign === 'bottom' &&
						legendOptions.enabled && 
						!legendOptions.floating
					) ?
						legend.legendHeight + pick(legendOptions.margin, 10) :
						0
				);
		}

		if (xAxis && yAxis) { // false if navigator is disabled (#904)

			if (this.inverted) {
				xAxis.options.left = yAxis.options.left = navigator.left;
			} else {
				xAxis.options.top = yAxis.options.top = navigator.top;
			}

			xAxis.setAxisSize();
			yAxis.setAxisSize();
		}
	}
});

// Pick up badly formatted point options to addPoint
wrap(Series.prototype, 'addPoint', function (
	proceed,
	options,
	redraw,
	shift,
	animation
) {
	var turboThreshold = this.options.turboThreshold;
	if (
		turboThreshold &&
		this.xData.length > turboThreshold &&
		isObject(options, true) &&
		this.chart.navigator
	) {
		error(20, true);
	}
	proceed.call(this, options, redraw, shift, animation);
});

// Handle adding new series
wrap(Chart.prototype, 'addSeries', function (
	proceed,
	options,
	redraw,
	animation
) {
	var series = proceed.call(this, options, false, animation);
	if (this.navigator) {
		// Recompute which series should be shown in navigator, and add them
		this.navigator.setBaseSeries(null, false);
	}
	if (pick(redraw, true)) {
		this.redraw();
	}
	return series;
});

// Handle updating series
wrap(Series.prototype, 'update', function (proceed, newOptions, redraw) {
	proceed.call(this, newOptions, false);
	if (this.chart.navigator && !this.options.isInternal) {
		this.chart.navigator.setBaseSeries(null, false);
	}
	if (pick(redraw, true)) {
		this.chart.redraw();
	}
});

Chart.prototype.callbacks.push(function (chart) {
	var extremes,
		navigator = chart.navigator;

	// Initiate the navigator
	if (navigator) {
		extremes = chart.xAxis[0].getExtremes();
		navigator.render(extremes.min, extremes.max);
	}
});

