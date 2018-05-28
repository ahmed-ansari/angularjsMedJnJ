app.controller('ServiceOrderCtrl', function($scope, $stateParams, $state, $q, $ionicLoading, SharedPreferencesService, ServiceOrderService, $ionicPopup, $ionicPopover, NetworkService) {

        var singleOrder = this;
        var workOrderId = SharedPreferencesService.getWorkOrderId();
        singleOrder.orderId = $stateParams.orderId;
        singleOrder.orderStatus = '';
        singleOrder.orderReason = '';

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        $ionicPopover.fromTemplateUrl('modules/order/order_popover.html', {
            scope: $scope,
        }).then(function(popover) {
            singleOrder.popover = popover;
        });
        var singleOrderDetails = ServiceOrderService.getOrderDetails(singleOrder.orderId);
        var LineItems = ServiceOrderService.getLineItems(singleOrder.orderId);
        $q.all([singleOrderDetails, LineItems])
            .then(function(resp) {
                singleOrder.order = resp[0].records[0];
                singleOrder.orderStatus = resp[0].records[0].MedConnect__Status__c;
                singleOrder.orderReason = resp[0].records[0].MedConnect__Reason_for_Return__c;
                singleOrder.lineitems = resp[1].records;
                $ionicLoading.hide();
            }, function(er) {
                $ionicLoading.hide();
                console.log('Error in retreiving order details');
            });

        singleOrder.addLineItem = function() {
	        if (NetworkService.isDeviceOnline()) {
	            $state.go('app.new-order-line-item', { "workorderId": workOrderId, "orderId": singleOrder.orderId });
	        } else {
	            $scope.displayAlertMessage('This Functionality is not accessible offline');
	        }
        };

        singleOrder.editOrder = function() {
	        if (NetworkService.isDeviceOnline()) {
	            $state.go('app.add-order', { "orderReason": singleOrder.orderStatus, "orderId": singleOrder.orderId,"orderStatus": singleOrder.orderReason});
	        } else {
	            $scope.displayAlertMessage('This Functionality is not accessible offline');
	        }
        };

    })
    .controller('ServiceOrderCreateCtrl', function($scope, $stateParams, $state, $q, $ionicLoading, SharedPreferencesService, ServiceOrderService, $ionicPopup, $ionicPopover, $ionicHistory, NetworkService) {

        var createOrder = this;
        var order = {};
        createOrder.orderId = $stateParams.orderId;
        createOrder.workOrderName = SharedPreferencesService.getWorkOrderName();
        createOrder.accountName = SharedPreferencesService.getAccountName();
        createOrder.contactName = SharedPreferencesService.getContactName();

        createOrder.backToWorkOrder = function() {

            $ionicHistory.goBack();
        };

        if (createOrder.orderId !== null) {
            createOrder.status = $stateParams.orderStatus;
            createOrder.reason_return = $stateParams.orderReason;
        }

        createOrder.saveOrder = function() {

            var request = {},
                res = {},
                records = [],
                data = {};

            data.MedConnect__Account__c = SharedPreferencesService.getAccountId();
            data.MedConnect__Contact__c = SharedPreferencesService.getContactId();
            data.MedConnect__Work_Order__c = SharedPreferencesService.getWorkOrderId();
            data.MedConnect__Status__c = createOrder.status;
            data.MedConnect__Reason_for_Return__c = createOrder.reason_return;

            res.action = "ORD";
            res['ref-id'] = "1";
            res.data = data;
            records.push(res);
            request.records = records;
            console.log('Request: ', request);

            ServiceOrderService.createOrder(request).then(function(resp) {
                console.log('Response after creating order: ', resp);
                if (resp.results.status === "Success") {
                    $state.go('app.wo-order', { "orderId": resp.results.sfdcId });
                }
            }, function(er) {
                console.log('Error in creating service order: ', er);
            });
        };

    });