$(document).bind("mobileinit", function () {

	/* Get rid of styling */
	$.mobile.ignoreContentEnabled=true;
	//$.mobile.keepNative = "h1,h2,h3,h4,h5,h6,p,input,button,a,label"

    $.mobile.changePage.defaults.changeHash = true;
	$.mobile.hashListeningEnabled = true;
	$.mobile.pushStateEnabled = false;
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.changePage.defaults.allowSamePageTransition = false;
    $.mobile.phonegapNavigationEnabled = true;
    $.mobile.defaultPageTransition = 'slide';
});