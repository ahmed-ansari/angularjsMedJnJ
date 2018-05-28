app.controller('AssignToolDetailsCtrl', function ($scope, $stateParams, $state, AssignToolDetailService, $ionicLoading, SharedPreferencesService, ActivityService, $timeout, NetworkService, $ionicHistory, $translate) {
	var assignDetails = this;

	$ionicLoading.show({
      template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.assignToolDetailsController.loading" | translate}}'
    });

	function showMessage(message) {
        navigator.notification.alert(message, alertDismissed, $translate.instant("workorder.assignToolDetailsController.medvantage"), $translate.instant("workorder.assignToolDetailsController.ok"));
    }

    function alertDismissed() {}

    assignDetails.WOA = SharedPreferencesService.getWorkOrderActivity();

	AssignToolDetailService.fetchAssignedTool($stateParams.assignToolId).then(function (data) {
		assignDetails.WO = data.records[0];

		AssignToolDetailService.fetchToolDetails(data.records[0].MedConnect__Tool__c).then(function (record) {
			assignDetails.detail = record.records[0];
			$timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
            }, 800);
			$ionicLoading.hide();
			
		}, function (err) {
			$ionicLoading.hide();
			if (NetworkService.isDeviceOnline()) {
               	showMessage($translate.instant("workorder.assignToolDetailsController.errCode") + err[0].errorCode + $translate.instant("workorder.assignToolDetailsController.errMsg") + err[0].message);
            }
		});
	}, function (err) {
		$ionicLoading.hide();
		if (NetworkService.isDeviceOnline()) {
            showMessage($translate.instant("workorder.assignToolDetailsController.errCode") + err[0].errorCode + $translate.instant("workorder.assignToolDetailsController.errMsg") + err[0].message);
        }
	});
});