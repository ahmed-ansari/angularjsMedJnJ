app.controller('CreateToolCtrl', function ($scope, CreateToolService, $ionicModal, $ionicLoading, $stateParams, $state, DataService, SOUPINFO, localStorageService, NetworkService, $translate) {
	var createTool = this;

    createTool.activityId = $stateParams.activityId; 

    var rec_entries = localStorageService.get('maxRecords');
    if (rec_entries === null) {
        localStorageService.set('maxRecords', 20);
        rec_entries = 20;
    }   

	createTool.loadProducts = function () {

		$ionicLoading.show({
        	template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.createToolController.loading" | translate}}'
    	});

		CreateToolService.getProducts().then(function (data) {
			createTool.prodRecords = data.records;
			$ionicLoading.hide();

			$ionicModal.fromTemplateUrl('modules/workorder/create_tool_modal.html', {
		      scope: $scope,
		      animation: 'slide-in-up',
		   }).then(function(modal) {
		      $scope.modal = modal;
		      $scope.modal.show();
		   });

		}, function (err) {
            DataService.getSoupData(SOUPINFO.productList, rec_entries).then(function (entries) {
                createTool.prodRecords = entries.currentPageOrderedEntries;
                $ionicModal.fromTemplateUrl('modules/workorder/create_tool_modal.html', {
                  scope: $scope,
                  animation: 'slide-in-up',
               }).then(function(modal) {
                  $scope.modal = modal;
                  $scope.modal.show();
               });
            }, function (err) {
                createTool.prodRecords = [];
            });

            $ionicLoading.hide();
		});

	};

	createTool.fetchSrcFromProd = function (prodId, prodName) {
		$ionicLoading.show({
        	template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.createToolController.loading" | translate}}'
    	});
        createTool.productName = prodName;
        createTool.prodId = prodId;
        $scope.modal.hide();
        $ionicLoading.hide();
	};

    createTool.saveToolForm = function ($form) {
        
        if ($form.$valid && typeof createTool.toolName != 'undefined' && createTool.toolName !== "") {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.createToolController.loading" | translate}}'
            });
            var inputParams = {};
            
            inputParams.MedConnect__Tool_Name__c = (typeof createTool.toolName != 'undefined') ? createTool.toolName.trim():"";
            inputParams.MedConnect__Product__c = (typeof createTool.prodId != 'undefined') ? createTool.prodId.trim():"";
            inputParams.MedConnect__Description__c = (typeof createTool.description != 'undefined') ? createTool.description.trim():"";
            inputParams.MedConnect__Specification_1__c = (typeof createTool.spec1 != 'undefined') ? createTool.spec1.trim():"";
            inputParams.MedConnect__Specification_2__c = (typeof createTool.spec2 != 'undefined') ? createTool.spec2.trim():"";
            inputParams.MedConnect__Specification_3__c = (typeof createTool.spec3 != 'undefined') ? createTool.spec3.trim():"";
            inputParams.MedConnect__Source__c = (typeof createTool.source != 'undefined')?createTool.source:"";
    
            CreateToolService.createTool(inputParams).then(function (data) { 
                showAlertMessage($translate.instant("workorder.createToolController.toolCreatedSuccess"), true);
            }, function (err) {
                
                var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                var offlineObj = {
                    "action": "add",
                    "type": "Tool",
                    "object": '' + serverInstance + 'Tool__c',
                    "data": inputParams,
                    "randomId": randomId
                };
                DataService.setOfflineSoupData(offlineObj);
                $ionicLoading.hide();
            });
        } else {
            showAlertMessage($translate.instant("workorder.createToolController.enterToolName"), false);
        }
    };

    createTool.backToActivityList = function () {
        $state.go('app.wo-activity', {"activityId": $stateParams.activityId});
    };

   $scope.closeModal = function () {
   	$scope.modal.hide();
   };


  function showAlertMessage(message, bool) {
    $ionicLoading.hide();
    navigator.notification.alert(message, alertDismissed(bool), $translate.instant("workorder.createToolController.medvantage"), $translate.instant("workorder.createToolController.ok"));
  }

  function alertDismissed(bool) {
    if (bool) {
        $state.go('app.wo-activity', {"activityId": $stateParams.activityId});
    } 
  }

  function toolAlertDismissed() {

  }


});