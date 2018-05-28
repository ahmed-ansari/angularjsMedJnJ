app.controller('NavController', ['$scope', '$translate', 'localStorageService','$state','force', function ($scope, $translate, localStorageService, $state, force) {

    var nav =  this;

    nav.logout = function() {
    	var networkState = navigator.connection.type;
        if (networkState !== Connection.UNKNOWN && networkState !== Connection.NONE) {
            navigator.notification.confirm(
	            $translate.instant('nav.navControllerjs.offline-data-will-be-lost-after-logout'),
	           	 nav.confirmLogout,
	            $translate.instant("nav.navControllerjs.medvantage"), 
	            [$translate.instant('nav.navControllerjs.logout'), $translate.instant('nav.navControllerjs.cancel')]
        	);
        } else {
            nav.showAlertMessage($translate.instant('nav.navControllerjs.functionality-not-accessible-offline'));
        }
    };
    nav.goToInventory = function() {
    	var networkState = navigator.connection.type;
        if (networkState !== Connection.UNKNOWN && networkState !== Connection.NONE) {
            $state.go('app.inventorylist');
        } else {
            nav.showAlertMessage($translate.instant('nav.navControllerjs.need-internet-view-inventory'));
        }
    };

    nav.confirmLogout = function(buttonIndex) {
    	if(buttonIndex === 1) {
    		localStorageService.clearAll();
    		var sfOAuthPlugin  = cordova.require("com.salesforce.plugin.oauth");
  			sfOAuthPlugin.logout();	
    	}
    };

    nav.moduleArray = ['calendar', 'account', 'asset', 'contact', 'product','inventory','setting'];
	nav.mappingArr = [];
	angular.forEach(nav.moduleArray, function (value, index) {
		var obj = {};
		switch(value) {
			case 'account':
				obj = {'type': $translate.instant('nav.navControllerjs.accounts'), 'url': 'app.accountlist', 'img': 'products.png'};
				break;
			case 'asset':
				obj = {'type': $translate.instant('nav.navControllerjs.assets'), 'url': 'app.assetlist', 'img': 'products.png'};
				break;
			case 'calendar':
				obj = {'type': $translate.instant('nav.navControllerjs.calendar'), 'url': 'app.calendar', 'img': 'calendar.png'};
				break;
			case 'contact':
				obj = {'type': $translate.instant('nav.navControllerjs.contacts'), 'url': 'app.contactlist', 'img': 'contacts.png'};
				break;
			case 'product':
				obj = {'type': $translate.instant('nav.navControllerjs.products'), 'url': 'app.productlist', 'img': 'products.png'};
				break;
			case 'inventory':
				obj = {'type': $translate.instant('nav.navControllerjs.inventory'), 'url': 'app.inventorylist', 'img': 'products.png'};
				break;
			case 'setting':
				obj = {'type': $translate.instant('nav.navControllerjs.settings'), 'url': 'app.settings', 'img': 'settings.png'};
				break;
			default:
				break;
		}
		nav.mappingArr.push(obj);
	});

	nav.showAlertMessage = function(message) {
        navigator.notification.alert(message, nav.alertDismissed, $translate.instant("nav.navControllerjs.medvantage"), $translate.instant('nav.navControllerjs.OK'));
    };
    nav.alertDismissed = function() {};

}]);
