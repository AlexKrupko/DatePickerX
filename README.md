# DatePickerX
Cool light visual date picker using native JavaScript 

Browsers support: Chrome 45+, FireFox 40+, Safari 8+, IE10+ (since 1.0.1 version), iOS Safari 8+, Android Browser 4.4+

### How to install
You need to include library javascript and CSS files from `dist` directory on your page
```html
<link rel="stylesheet" href="dist/css/DatePickerX.min.css">
<script src="dist/js/DatePickerX.min.js"></script>
``` 

### How to use
The DatePickerX extends HTMLInputElement objects through prototypes. It adds DatePickerX object for each input element. 

You need just select HTML element and execute init method for date picker initializing. 

```javascript
document.getElementById('myInputId').DatePickerX.init();
```

### DatePickerX methods
Each DatePickerX object contains the following methods:
* `init( [Object options] )` - initializes date picker. May take object with initialization options
* `remove()` - removes date picker
* `setValue( Date dt, [Boolean ignoreLimits = false] )` - sets date picker value
* `getValue( [Boolean timestamp = false] )` - returns formatted date picker value or timestamp if passed true in first parameter
* `getMinDate()` - returns min date of date picker
* `getMaxDate()` - returns max date of date picker

Also DatePickerX provides global `DatePickerX` object with following methods:
* `window.DatePickerX.setDefaults( Object options )` - sets default options for all date pickers

### DatePickerX options
* `mondayFirst` - if `true`, set Monday as start week day. Default: `true`
* `format` - date format. It's being used for formatting input values and returned values from `getValue` methods. Default: `yyyy/mm/dd`. Supports following literals:
    * `d` - day of the month without leading zeros (1-31)
    * `dd` - day of the month with leading zeros (01-31)
    * `D` - textual representation of week day. See `weekDayLabels` option
    * `m` - numeric representation of a month without leading zeros (1-12)
    * `mm` - numeric representation of a month with leading zeros (01-12)
    * `M` - short textual representation of a month. See `shortMonthLabels` option
    * `MM` - full textual representation of a month. See `singleMonthLabels` option
    * `yy` - two-digits representation of a year
    * `yyyy` - four-digits representation of a year 
* `minDate` - minimum date limit. Should be a `Date` object or `null` (no limit). Also you may pass another DatePickerX HTML input which selected date will be set as min date dynamically
* `maxDate` - maximum date limit. Should be a `Date` object. Also you may pass another DatePickerX HTML input which selected date will be set as min date dynamically 
* `weekDayLabels` - array with textual representation of week days starting with Monday. See `D` literal for `format` option. Default: `['Mo', 'Tu', 'We', 'Th', 'Fr', 'St', 'Su']` 
* `shortMonthLabels` - array with textual representation of short month names. See `M` literal for `format` option. Default: `['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']` 
* `singleMonthLabels`: array with textual representation of full month names. See `MM` literal for `format` option. Default: `['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']` 
* `todayButton` - if `true` today button should be enabled. Current date will be set as date picker value by clicking this button. Default: `true`
* `todayButtonLabel` - today button label. Default: `'Today'`
* `clearButton` - if `true` clear button should be enabled. Date picker value will be cleared by clicking this button. Default: `true`
* `clearButtonLabel` - clear button label. Default: `'Clear'`
