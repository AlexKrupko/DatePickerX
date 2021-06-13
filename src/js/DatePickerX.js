!function()
{
    'use strict';

    var optionsDefault = {
        mondayFirst      : true,
        format           : 'yyyy/mm/dd',
        minDate          : new Date(0, 0),
        maxDate          : new Date(9999, 11, 31),
        weekDayLabels    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'St', 'Su'],
        shortMonthLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        singleMonthLabels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        todayButton      : true,
        todayButtonLabel : 'Today',
        clearButton      : true,
        clearButtonLabel : 'Clear',
        titleFormatDay   : 'MM dd, yyyy',
        titleFormatMonth : 'MM yyyy',
        titleFormatYear  : 'yyyy'
    },
        openedDPX = null,
        globalEventsInitiated = false;

    /**
     * Creates and returns new DOM element
     *
     * @param {String}        tag       Tag name
     * @param {Array|String}  [classes] Array with CSS classes or single class
     * @param {Element}       [parent]  New element will be appended in this element if it passed
     * @param {String|Number} [html]    New element's InnerHTML
     * @param {String|Number} [title]   Title attribute
     * @returns {Element}
     */
    function createElement(tag, classes, parent, html, title)
    {
        classes = classes || [];
        !Array.isArray(classes) && (classes = [classes]);

        var el = document.createElement(tag);
        tag === 'button' && el.setAttribute('type', 'button');
        for (var i = classes.length; i--; el.classList.add(classes[i]));

        title && (el.title = title);
        el.innerHTML = html || '';

        parent instanceof Element && parent.appendChild(el);

        return el;
    }

    /**
     * Returns date with time 00:00:00.0000
     *
     * @param   {Date} [dt] Date object
     * @returns {Date}
     */
    function clearDate(dt)
    {
        dt = dt || new Date;
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    }

    function DPX(input)
    {
        var options    = {},
            elements   = {},
            initiated  = false,
            value      = null,
            mode       = 2; // 2 - days, 1 - months, 0 - years

        /**
         * Returns min date of date picker
         * If min date relates to another date picker will be returned its value or its min date if value doesn't choose
         *
         * @returns {Date}
         */
        function getMinDate()
        {
            var value = options.minDate;

            if (value instanceof HTMLInputElement) {
                value = value.DatePickerX.getValue(true);
                value = value === null ? options.minDate.DatePickerX.getMinDate() : new Date(value);
                value.setDate(value.getDate() + 1);
            } else if (typeof value === 'function') {
                value = new Date(value());

                if (isNaN(value)) {
                    console.error('DatePickerX, getMinDate: Invalid date value.');
                    value = optionsDefault.minDate;
                }
            }

            return clearDate(value);
        }

        /**
         * Returns max date of date picker
         * If max date relates to another date picker will be returned his value or his max date if value doesn't choose
         *
         * @returns {Date}
         */
        function getMaxDate()
        {
            var value = options.maxDate;

            if (value instanceof HTMLInputElement) {
                value = value.DatePickerX.getValue(true);
                value = value === null ? options.maxDate.DatePickerX.getMaxDate() : new Date(value);
                value.setDate(value.getDate() - 1);
            } else if (typeof value === 'function') {
                value = new Date(value());

                if (isNaN(value)) {
                    console.error('DatePickerX, getMaxDate: Invalid date value.');
                    value = optionsDefault.maxDate;
                }
            }

            return clearDate(value);
        }

        /**
         * Creates date picker's base elements
         */
        function createElements()
        {
            elements.container = createElement('div', 'date-picker-x');

            var titleBox = createElement('div', 'dpx-title-box', elements.container);
            elements.prevTitle = createElement('button', 'dpx-prev', titleBox, '&#x276e;');
            elements.title = createElement('button', 'dpx-title', titleBox);
            elements.nextTitle = createElement('button', 'dpx-next', titleBox, '&#x276f;');

            elements.content = createElement('div', 'dpx-content-box', elements.container);

            input.nextElementSibling
                ? input.parentNode.insertBefore(elements.container, input.nextElementSibling)
                : input.parentNode.appendChild(elements.container);

            if (options.todayButton || options.clearButton) {
                var btns = createElement('div', 'dpx-btns', elements.container);
                options.todayButton && (elements.today = createElement('button', ['dpx-item', 'dpx-today'], btns, options.todayButtonLabel, options.todayButtonLabel));
                options.clearButton && (elements.clear = createElement('button', ['dpx-item', 'dpx-clear'], btns, options.clearButtonLabel, options.clearButtonLabel));
            }
        }

        /**
         * Returns date according to passed format
         *
         * @param {Date}   dt     Date object
         * @param {String} format Format string
         *      d    - day of month
         *      dd   - 2-digits day of month
         *      D    - day of week
         *      m    - month number
         *      mm   - 2-digits month number
         *      M    - short month name
         *      MM   - full month name
         *      yy   - 2-digits year number
         *      yyyy - 4-digits year number
         */
        function getFormattedDate(dt, format)
        {
            var items = {
                d   : dt.getDate(),
                dd  : dt.getDate(),
                D   : dt.getDay(),
                m   : dt.getMonth() + 1,
                mm  : dt.getMonth() + 1,
                M   : dt.getMonth(),
                MM  : dt.getMonth(),
                yy  : dt.getFullYear().toString().substr(-2),
                yyyy: dt.getFullYear()
            };

            items.dd < 10 && (items.dd = '0' + items.dd);
            items.mm < 10 && (items.mm = '0' + items.mm);
            items.D = options.weekDayLabels[items.D ? items.D - 1 : 6];
            items.M = options.shortMonthLabels[items.M];
            items.MM = options.singleMonthLabels[items.MM];

            return format.replace(/([dmM]{1,2}|D|yyyy|yy)/g, function(match)
            {
                return typeof items[match] !== 'undefined' ? items[match] : match;
            });
        }

        /**
         * Returns true if date picker is visible now
         *
         * @returns {Boolean}
         */
        function isActive()
        {
            return elements.container.classList.contains('active');
        }

        /**
         * Opens DatePickerX dropdown
         *
         * @param {Object} e
         */
        function openDatePicker(e)
        {
            if (!isActive()) {
                e.stopPropagation();
                mode = 2;
                draw();
                elements.container.classList.add('active');
                elements.container.classList.remove('to-top');

                var bcr = elements.container.getBoundingClientRect();
                if (bcr.bottom > window.innerHeight && bcr.top + input.offsetHeight > elements.container.offsetHeight) {
                    elements.container.classList.add('to-top');
                    elements.container.getBoundingClientRect().top < 0 && elements.container.classList.remove('to-top');
                }

                openedDPX && openedDPX !== elements.container && closeDatePicker();
                openedDPX = elements.container;

                var focusableElements = Array.prototype.slice.call(elements.container.querySelectorAll('button'));
                Array.prototype.slice.call(
                    document.querySelectorAll('[href], input, select, textarea, button, iframe, object, embed, [tabindex], [contenteditable]')
                ).filter(function(item)
                {
                    return focusableElements.indexOf(item) < 0 && item.tabIndex >= 0;
                }).forEach(function(item)
                {
                    item.dataset.datepickerxDisabledTabIndex = item.tabIndex;
                    item.tabIndex = -1;
                });

                focusableElements.forEach(function(item)
                {
                    item.tabIndex = 0;
                });
            }
        }

        /**
         * Closes opened DatePickerX dropdown
         */
        function closeDatePicker()
        {
            if (openedDPX) {
                openedDPX.classList.remove('active');

                Array.prototype.slice.call(document.querySelectorAll('[data-datepickerx-disabled-tab-index]')).forEach(function(item)
                {
                    item.tabIndex = item.dataset.datepickerxDisabledTabIndex;
                    delete item.dataset.datepickerxDisabledTabIndex;
                });

                Array.prototype.slice.call(openedDPX.querySelectorAll('button')).forEach(function(item)
                {
                    item.tabIndex = -1;
                });

                openedDPX = null;
            }
        }

        /**
         * Attaches event listeners
         *
         * @param dpx
         */
        function addEvents(dpx)
        {
            var arrowsKeyMap = {
                37: 'left',
                38: 'top',
                39: 'right',
                40: 'bottom'
            };

            input.addEventListener('click', openDatePicker);
            !globalEventsInitiated && window.addEventListener('keydown', function(event)
            {
                if (event.keyCode === 13) {
                    if (document.activeElement === input) {
                        event.preventDefault();
                        openDatePicker(event);
                    }
                } else if (event.keyCode === 27) {
                    event.preventDefault();
                    closeDatePicker();
                } else if (isActive() && event.keyCode in arrowsKeyMap) {
                    event.preventDefault();

                    var focusableElements = Array.prototype.slice.call(elements.container.querySelectorAll('button:enabled'));
                    if (document.activeElement && focusableElements.indexOf(document.activeElement) >= 0) {
                        document.activeElement.neighbors && document.activeElement.neighbors[arrowsKeyMap[event.keyCode]].focus();
                    } else {
                        focusableElements[0].focus();
                    }
                }
            });
            !globalEventsInitiated && window.addEventListener('click', closeDatePicker);
            elements.container.addEventListener('click', function(e)
            {
                e.stopPropagation();
                e.preventDefault();
            });
            elements.content.addEventListener('click', function(e)
            {
                if (mode === 2) {
                    dpx.setValue(e.target.dpxValue) && closeDatePicker();
                } else {
                    var min = getMinDate(),
                        max = getMaxDate();

                    min.setDate(1);
                    max.setDate(1);

                    if (!mode) {
                        min.setMonth(0);
                        max.setMonth(0);
                    }

                    e.target.dpxValue >= min.getTime() && e.target.dpxValue <= max.getTime() && ++mode && draw(e.target.dpxValue);
                }
            });
            elements.prevTitle.addEventListener('click', function()
            {
                draw(this.dpxValue);
            });
            elements.nextTitle.addEventListener('click', function()
            {
                draw(this.dpxValue);
            });
            elements.title.addEventListener('click', function()
            {
                mode && mode-- && draw(this.dpxValue);
            });
            elements.today && elements.today.addEventListener('click', function()
            {
                !this.disabled && dpx.setValue(clearDate()) && closeDatePicker();
            });
            elements.clear && elements.clear.addEventListener('click', function()
            {
                dpx.setValue(null) && closeDatePicker();
            });

            globalEventsInitiated = true;
        }

        /**
         * Draws calendar according to current mode
         *
         * @param [dt] Date object
         */
        function draw(dt)
        {
            elements.content.innerHTML = '';

            // init min date and max date
            var dtMin   = getMinDate(),
                dtMax   = getMaxDate(),
                current = clearDate();

            // today button
            options.todayButton && (elements.today.disabled = current < dtMin || current > dtMax);

            // set min and max dates according to current mode
            if (mode < 2) {
                dtMin.setDate(1);
                dtMax.setDate(1);

                if (!mode) {
                    dtMin.setMonth(0);
                    dtMax.setMonth(0);
                }
            }
            dtMin = dtMin.getTime();
            dtMax = dtMax.getTime();

            // init date
            dt = clearDate(new Date(dt || value || Date.now()));
            if (dt.getTime() < dtMin) {
                dt = new Date(dtMin);
            } else if (dt.getTime() > dtMax) {
                dt = new Date(dtMax);
            }

            var setMonth = dt.getMonth(),
                setYear  = dt.getFullYear(),
                zeroYear = Math.floor(setYear / 10) * 10;
            dt = new Date(mode ? setYear : zeroYear, mode < 2 ? 0 : setMonth);

            // set title
            elements.title.innerHTML = mode
                ? getFormattedDate(dt, mode === 2 ? options.titleFormatMonth : options.titleFormatYear)
                : (zeroYear + ' - ' + (zeroYear + 9));
            elements.title.dpxValue = dt.getTime();
            elements.title.title = mode === 2 ? getFormattedDate(dt, options.titleFormatYear) : (zeroYear + ' - ' + (zeroYear + 9));
            elements.title.disabled = !mode;

            // prev and next arrows
            elements.prevTitle.disabled = dt.getTime() <= dtMin;
            mode === 2 ? dt.setMonth(setMonth - 1) : dt.setFullYear(mode ? setYear - 1 : zeroYear - 10);
            elements.prevTitle.title = mode
                ? getFormattedDate(dt, mode === 2 ? options.titleFormatMonth : options.titleFormatYear)
                : ((zeroYear - 10) + ' - ' + (zeroYear - 1));
            elements.prevTitle.dpxValue = dt.getTime();

            mode === 2 ? dt.setMonth(dt.getMonth() + 2) : dt.setFullYear(mode ? setYear + 1 : zeroYear + 20);
            elements.nextTitle.disabled = dt.getTime() > dtMax;
            elements.nextTitle.title = mode
                ? getFormattedDate(dt, mode === 2 ? options.titleFormatMonth : options.titleFormatYear)
                : ((zeroYear + 10) + ' - ' + (zeroYear + 19));
            elements.nextTitle.dpxValue = dt.getTime();

            mode === 2 ? dt.setMonth(dt.getMonth() - 1) : dt.setFullYear(mode ? setYear : zeroYear);

            // day of week titles
            if (mode === 2) {
                var maxDay = options.weekDayLabels.length;
                !options.mondayFirst && --maxDay && createElement('span', ['dpx-item', 'dpx-weekday', 'dpx-weekend'], elements.content, options.weekDayLabels[6]);
                for (var day = 0; day < maxDay; ++day) {
                    var classes = ['dpx-item', 'dpx-weekday'];
                    day > 4 && classes.push('dpx-weekend');
                    createElement('span', classes, elements.content, options.weekDayLabels[day])
                }
            }

            // set starting date
            if (mode === 2) {
                var dayWeek = dt.getDay();
                dt.setDate(options.mondayFirst ? -(dayWeek ? dayWeek - 2 : 5) : -dayWeek + 1);
            } else {
                mode ? dt.setMonth(dt.getMonth() - 2) : dt.setFullYear(zeroYear - 3);
            }

            // current date
            if (mode < 2) {
                current.setDate(1);
                !mode && current.setMonth(0);
            }
            current = current.getTime();

            // draw calendar
            elements.container.setAttribute('data-dpx-type', ['year', 'month', 'day'][mode]);
            var getter = ['getFullYear', 'getMonth', 'getDate'][mode],
                setter = ['setFullYear', 'setMonth', 'setDate'][mode],
                rows   = mode === 2 ? 6 : 4,
                cols   = mode === 2 ? 7 : 4,
                items  = [];

            for (var i = rows * cols; i--; dt[setter](dt[getter]() + 1)) {
                var classes = ['dpx-item'],
                    title   = getFormattedDate(dt, [options.titleFormatYear, options.titleFormatMonth, options.titleFormatDay][mode]);

                (mode ? (mode === 2 ? dt.getMonth() !== setMonth : dt.getFullYear() !== setYear) : (dt.getFullYear() < zeroYear || dt.getFullYear() > zeroYear + 9)) && classes.push('dpx-out');
                mode === 2 && (dt.getDay() === 6 || dt.getDay() === 0) && classes.push('dpx-weekend');
                dt.getTime() === current && classes.push('dpx-current');
                dt.getTime() === value && classes.push('dpx-selected');

                var content = mode ? (mode === 2 ? dt.getDate() : options.shortMonthLabels[dt.getMonth()]) : dt.getFullYear(),
                    el = createElement('button', classes, elements.content, content, title);
                el.dpxValue = dt.getTime();
                el.disabled = dt.getTime() < dtMin || dt.getTime() > dtMax;
                items.push(el);
            }

            // set neighbor elements
            setNeighborElements(items, rows, cols);
        }

        /**
         * Sets neighbor elements for each focusable calendar element
         *
         * @param {Array<HTMLElement>} items Calendar elements
         * @param {Number}             rows  Amount of rows
         * @param {Number}             cols  Amount of columns
         */
        function setNeighborElements(items, rows, cols)
        {
            var topElements = [];
            !elements.prevTitle.disabled && topElements.push(elements.prevTitle);
            !elements.title.disabled && topElements.push(elements.title);
            !elements.nextTitle.disabled && topElements.push(elements.nextTitle);

            var bottomElements = [];
            elements.today && !elements.today.disabled && bottomElements.push(elements.today);
            elements.clear && bottomElements.push(elements.clear);

            var focusableElements = items.filter(function(item)
            {
                return !item.disabled;
            });

            topElements.forEach(function(item, index, array)
            {
                addHorizontalNeighbors(item, index, array);
                item.neighbors.bottom = focusableElements[0];
                item.neighbors.top = bottomElements.length ? bottomElements[0] : focusableElements[focusableElements.length - 1];
            });
            bottomElements.forEach(function(item, index, array)
            {
                addHorizontalNeighbors(item, index, array);
                item.neighbors.top = focusableElements[focusableElements.length - 1];
                item.neighbors.bottom = topElements.length ? topElements[0] : focusableElements[0];
            });

            function getTopLineElement(index)
            {
                if (!topElements.length) {
                    return null;
                } else if (topElements.length === 1) {
                    return topElements[0];
                } else if (elements.title.disabled) {
                    return topElements[Math.floor(index / Math.ceil(cols / 2))];
                }

                return [
                    elements.prevTitle.disabled ? elements.title : elements.prevTitle,
                    elements.prevTitle.disabled || cols < 7 ? elements.title : elements.prevTitle,
                    elements.title,
                    elements.nextTitle.disabled || cols > 4 ? elements.title : elements.nextTitle,
                    elements.title,
                    elements.nextTitle.disabled ? elements.title : elements.nextTitle,
                    elements.nextTitle.disabled ? elements.title : elements.nextTitle
                ][index];
            }

            function getBottomLineElement(index)
            {
                return bottomElements.length ? bottomElements[Math.floor(index / Math.ceil(cols / bottomElements.length))] : null;
            }

            function addHorizontalNeighbors(item, index, array)
            {
                item.neighbors = {
                    left: array[index > 0 ? index - 1 : array.length - 1],
                    right: array[index < array.length - 1 ? index + 1 : 0]
                };
            }

            for (var i = 0; i < cols * rows; i += cols) {
                items.slice(i, i + cols).filter(function(item)
                {
                    return !item.disabled;
                }).forEach(addHorizontalNeighbors);
            }

            for (var i = 0; i < cols; i++) {
                items.filter(function(item, index)
                {
                    return !item.disabled && index % cols === i;
                }).forEach(function(item, index, array)
                {
                    if (!index) {
                        item.neighbors.top = getTopLineElement(i) || getBottomLineElement(i) || array[array.length - 1];
                    } else {
                        item.neighbors.top = array[index - 1];
                    }

                    if (index === array.length - 1) {
                        item.neighbors.bottom = getBottomLineElement(i) || getTopLineElement(i) || array[0];
                    } else {
                        item.neighbors.bottom = array[index + 1];
                    }
                });
            }
        }

        /**
         * Sets option
         *
         * @param   {String}  option Option name
         * @param   {*}       value  Option value
         */
        function setOption(option, value)
        {
            if (typeof options[option] === 'undefined') {
                return console.error('DatePickerX, setOption: Option doesn\'t exist.') && false;
            }

            if (option === 'minDate' || option === 'maxDate') {
                if (!(value instanceof HTMLInputElement) && typeof value !== 'function') {
                    !(value instanceof Date) && (value = new Date(value));

                    if (isNaN(value)) {
                        return console.error('DatePickerX, setOption: Invalid date value.') && false;
                    }
                }
            } else if (typeof options[option] !== typeof value) {
                return console.error('DatePickerX, setOption: Option has invalid type.') && false;
            } else if (Array.isArray(options[option])) {
                if (value.length < options[option].length) {
                    return console.warn('DatePickerX, setOption: Invalid option length.') && false;
                }

                value = value.slice(0, options[option].length);
            }

            options[option] = value;
        }

        return {
            /**
             * Inits date picker
             *
             * @param   {Object}  initOptions
             * @returns {Boolean}
             */
            init: function(initOptions)
            {
                initOptions = initOptions || {};

                if (initiated) {
                    return console.error('DatePickerX, init: Date picker has been already initiated.') && false;
                }
                initiated = true;

                // set options
                options = {};
                for (var i in optionsDefault) {
                    options[i] = optionsDefault[i];
                }

                if (typeof initOptions !== 'object') {
                    console.error('DatePickerX, init: Initial options must be an object.');
                } else {
                    for (var i in initOptions) {
                        setOption(i, initOptions[i]);
                    }
                }

                // DPX init
                input.parentNode.classList.add('date-picker-x-container');
                input.classList.add('date-picker-x-input');
                input.readOnly = true;
                createElements();
                addEvents(this);

                return true;
            },

            /**
             * Removes date picker
             *
             * @returns {Boolean}
             */
            remove: function()
            {
                if (!initiated) {
                    return console.error('DatePickerX, remove: Date picker has not been initiated yet.') && false;
                }

                input.parentNode.removeChild(elements.container);
                input.classList.remove('date-picker-x-input');
                input.readOnly = initiated = false;

                return true;
            },

            /**
             * Sets date picker value.
             * If passed not Date object, method will try to convert it to date.
             * If passed null, method will clear date.
             *
             * @param   {*}       dt                   Date object
             * @param   {Boolean} [ignoreLimits=false] If passed true min and max limits will be ignored
             * @returns {Boolean}
             */
            setValue: function(dt, ignoreLimits)
            {
                if (!initiated) {
                    return console.error('DatePickerX, remove: Date picker has not been initiated yet.') && false;
                }

                if (dt === null) {
                    value = null;
                    input.value = '';
                } else {
                    !(dt instanceof Date) && (dt = new Date(dt));

                    if (isNaN(dt)) {
                        return console.error('DatePickerX, setValue: Can\'t convert argument to date.') && false;
                    }

                    if (!ignoreLimits && (dt.getTime() < getMinDate().getTime() || dt.getTime() > getMaxDate().getTime())) {
                        return console.error('DatePickerX, setValue: Date out of acceptable range.') && false;
                    }

                    value = dt.getTime();
                    input.value = getFormattedDate(dt, options.format);
                }

                var e = document.createEvent('Event');
                e.initEvent('change', true, true);
                input.dispatchEvent(e);

                isActive() && draw();
                return true;
            },

            /**
             * Returns formatted date picker value or timestamp if passed true in first parameter.
             * If value has not been chosen yet returns empty string or null if passed true in first parameter.
             *
             * @param   {Boolean}       [timestamp]
             * @returns {Number|String}
             */
            getValue: function(timestamp)
            {
                !initiated && console.error('DatePickerX, getValue: Date picker has not been initiated yet.');

                return timestamp ? value : (value === null ? '' : getFormattedDate(new Date(value), options.format));
            },

            /**
             * Returns min date of date picker.
             * If min date relates to another date picker the date will be returned from it date picker.
             *
             * @returns {Date}
             */
            getMinDate: function()
            {
                var value = options.minDate;
                if (value instanceof HTMLInputElement) {
                    value = value.DatePickerX.getMinDate();
                } else if (typeof value === 'function') {
                    value = new Date(value());

                    if (isNaN(value)) {
                        console.error('DatePickerX, getMinDate: Invalid date value.');
                        value = optionsDefault.minDate;
                    }
                }

                return clearDate(value);
            },

            /**
             * Returns max date of date picker.
             * If max date relates to another date picker the date will be returned from it date picker.
             *
             * @returns {Date}
             */
            getMaxDate: function()
            {
                var value = options.maxDate;
                if (value instanceof HTMLInputElement) {
                    value = value.DatePickerX.getMaxDate()
                } else if (typeof value === 'function') {
                    value = new Date(value());

                    if (isNaN(value)) {
                        console.error('DatePickerX, getMaxDate: Invalid date value.');
                        value = optionsDefault.maxDate;
                    }
                }

                return clearDate(value);
            }
        };
    }

    var dpxElements = [], dpxObjects = [];
    Object.defineProperty(HTMLInputElement.prototype, 'DatePickerX', {
        get: function()
        {
            var index = dpxElements.indexOf(this);
            if (index === -1) {
                index = dpxElements.push(this) - 1;
                dpxObjects.push(new DPX(this));
            }

            return dpxObjects[index];
        },
        set: function() {}
    });

    window.DatePickerX = {
        /**
         * Sets default options for all date pickers
         *
         * @param   {Object}  options Options array
         * @returns {Boolean}
         */
        setDefaults: function(options)
        {
            if (typeof options !== 'object') {
                return console.error('DatePickerX, setDefaults: Invalid option type.') && false;
            }

            for (var i in options) {
                if (typeof options[i] === typeof optionsDefault[i]) {
                    if (!Array.isArray(optionsDefault[i])) {
                        optionsDefault[i] = options[i];
                    } else if (options[i].length >= optionsDefault[i].length) {
                        optionsDefault[i] = options[i].slice(0, optionsDefault[i].length);
                    }
                }
            }

            return true;
        }
    };
}();