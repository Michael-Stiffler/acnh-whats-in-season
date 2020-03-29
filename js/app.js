var myApp = angular.module('myApp', ['ngMaterial']);

myApp.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default');
    $mdThemingProvider.theme('dark').dark();
});

myApp.controller('acnh-seasons', function($scope, $timeout, $http, $mdMedia, $q) {
    /**
     * Initialize mdMedia for checking device size
     * @type {*}
     */
    $scope.$mdMedia = $mdMedia;
    /**
     * Model for search filter
     * @type {string}
     */
    $scope.critterSearch ='';
    /**
     * Current Date
     * @type {string}
     */
    $scope.currentDate = '';
    /**
     * Current Time
     * @type {string}
     */
    $scope.currentTime = '';
    /**
     * Current DateTime
     * @type {Date}
     */
    $scope.currentDateTime = new Date();
    /**
     * List of critter objects
     * @type {Array}
     */
    $scope.critterList = [];
    /**
     * Set default dark mode
     * @type {string}
     */
    $scope.currentTheme = 'default';
    /**
     * Initialize showFish as true
     * @type {boolean}
     */
    $scope.showFish = true;
    /**
     * Initialize showBugs as true
     * @type {boolean}
     */
    $scope.showBugs = true;
    /**
     * Set default hemisphere to northern
     * @type {string}
     */
    $scope.hemisphere = 'Northern';
    /**
     * Initialize hemi as not disabled
     * @type {boolean}
     */
    $scope.disableHemiButton = false;
    /**
     * Load saved theme
     */
    (function loadLocalStorage() {
        $scope.theme = localStorage.getItem('theme') || 'default';
        $scope.themeSwitch = $scope.theme !== 'default';
    })();
    /**
     * Toggles the show fish boolean
     */
    $scope.changeShowFish = function () {
        $scope.showFish = $scope.showFish ? false : true;
    };
    /**
     * toggles the show bugs boolean
     */
    $scope.changeShowBugs = function () {
        $scope.showBugs = $scope.showBugs ? false : true;
    };
    /**
     * Change the theme between default and dark modes
     */
    $scope.changeTheme = function() {
        $scope.theme = $scope.themeSwitch ? 'dark' : 'default';
        localStorage.setItem('theme', $scope.theme);
    };
    /**
     * Change the hemisphere
     */
    $scope.changeHemisphere = function () {
        $scope.disableHemiButton = true;
        $scope.hemisphere = $scope.hemisphere === 'Northern' ? 'Southern' : 'Northern';
        $scope.critterList = [];
        var promiseArray = [];
        promiseArray.push(loadFish());
        promiseArray.push(loadBugs());
        $q.all(promiseArray).then().finally(function() {
            $scope.disableHemiButton = false;
        });
    };
    /**
     * Returns if the current date's month is in the passed months array
     * @param {Array} months - Array of included months
     * @returns {boolean}
     */
    $scope.isMonthInSeason = function (months) {
        var thisMonth = parseInt($scope.currentDateTime.getMonth()) + 1;
        return months.indexOf(thisMonth) >= 0;
    };
    /**
     *
     */
    $scope.hideCritter = function (critter) {
        if(!$scope.showFish && critter.shadowSize) {
            return false;
        } else if(!$scope.showBugs && !critter.shadowSize) {
            return false;
        }
        return true;
    };
    /**
     * Returns if the current time is in the passed times array
     * @param {Array} times - Array of included times
     * @returns {boolean}
     */
    $scope.isTimeInSeason = function (times) {
        var timeCheck = [];
        function checkTime(time) {
            var hour = $scope.currentDateTime.getHours();
            switch(time){
                case 'All day':
                    return true;
                case '4 AM - 8 AM':
                    return hour >= 4 && hour < 8;
                case '4 AM - 7 PM':
                    return hour >= 4 && hour < 19;
                case '4 AM - 5 PM':
                    return hour >= 4 && hour < 17;
                case '4 AM - 9 PM':
                    return hour >= 4 && hour < 21;
                case '8 AM - 4 PM':
                    return hour >= 8 && hour < 16;
                case '8 AM - 5 PM':
                    return hour >= 8 && hour < 17;
                case '8 AM - 7 PM':
                    return hour >= 8 && hour < 19;
                case '9 AM - 4 PM':
                    return hour >= 9 && hour < 16;
                case '4 PM - 7 PM':
                    return hour >= 16 && hour < 19;
                case '4 PM - 8 PM':
                    return hour >= 16 && hour < 20;
                case '4 PM - 9 AM':
                    return hour >= 16 || hour < 9;
                case '5 PM - 11 PM':
                    return hour >= 17 && hour < 23;
                case '5 PM - 4 AM':
                    return hour >= 17 || hour < 4;
                case '5 PM - 8 AM':
                    return hour >= 17 || hour < 8;
                case '7 PM - 4 AM':
                    return hour >= 19 || hour < 4;
                case '7 PM - 8 AM':
                    return hour >= 19 || hour < 8;
                case '9 PM - 4 AM':
                    return hour >= 21 || hour < 4;
                case '11 PM - 4 PM':
                    return hour >= 23 || hour < 16;
                case '11 PM - 8 AM':
                    return hour >= 23 || hour < 8;
            }
        }
        for(var i = 0, c = times.length; i < c; ++i) {
            timeCheck.push(checkTime(times[i]));
        }
        return timeCheck.indexOf(true) >= 0;
    };
    /**
     * Array of all the months
     * @type {[*]}
     */
    var months = [
        'January',
        'February',
        'March',
        'April' ,
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'];
    /**
     * Keeps the date and time updated
     */
    (function time() {
        $scope.currentDateTime = new Date();
        var currentDateTime = $scope.currentDateTime;
        var month = months[currentDateTime.getMonth()],
            day = currentDateTime.getDate(),
            year = currentDateTime.getFullYear(),
            hour = currentDateTime.getHours() > 12 ? currentDateTime.getHours() - 12 : currentDateTime.getHours(),
            minutes = currentDateTime.getMinutes().toString().length === 1 ?
                '0' + currentDateTime.getMinutes().toString() : currentDateTime.getMinutes(),
            period = currentDateTime.getHours() > 11 ? 'PM' : 'AM';
        hour = hour === 0 ? 12 : hour;
        $scope.currentDate = month + ' ' + day + ', ' + year;
        $scope.currentTime = hour + ':' + minutes + ' ' + period;
        $timeout(time, 1000);
    })();
    /**
     * Loads the list of fish from json file
     */
    var loadFish = function () {
        var path = $scope.hemisphere === 'Northern' ?
            'critters/fish-northern-hemisphere.json' : 'critters/fish-southern-hemisphere.json';
        return $http.get(path).then(function(response) {
            $scope.critterList = $scope.critterList.concat(response.data);
        })
    };
    loadFish();
    /**
     * Loads the list of bugs from json file
     */
    var loadBugs = function () {
        var path = $scope.hemisphere === 'Northern' ?
            'critters/bugs-northern-hemisphere.json' : 'critters/bugs-southern-hemisphere.json';
        return $http.get(path).then(function(response) {
            $scope.critterList = $scope.critterList.concat(response.data);
        })
    };
    loadBugs();
});