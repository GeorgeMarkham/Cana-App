$(document).bind("mobileinit", function () {

	/* Get rid of styling */
	$.mobile.ignoreContentEnabled=true;

    $.mobile.changePage.defaults.changeHash = true;
	$.mobile.hashListeningEnabled = true;
	$.mobile.pushStateEnabled = false;
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.changePage.defaults.allowSamePageTransition = false;
    $.mobile.phonegapNavigationEnabled = true;
    $.mobile.defaultPageTransition = 'slide';
});