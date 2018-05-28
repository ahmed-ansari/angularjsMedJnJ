app.controller('InventoryListCtrl', function($scope, force, $ionicModal, $translate, InventoryService, localStorageService, $ionicLoading, DataService, SOUPINFO) {

    var inventorylist = this;
    inventorylist.no_inventory = $translate.instant('inventory.inventoryControllerjs.no-records-found');

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"inventory.inventoryControllerjs.loading" | translate}}'
    });

    inventorylist.noMoreItemsAvailable = true;
    inventorylist.loggedInId = '';
    inventorylist.errorMessageStatus = false;
    inventorylist.errorMessage = '';

    var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
    sfOAuthPlugin.getAuthCredentials(function(usr) {
        inventorylist.loggedInId = usr.userId; 
        inventorylist.callList(inventorylist.loggedInId);
    });
    /** 
    *   Desc - fetches inventory list
    *   @param - days - [number of days], userId [loggedIn user Id]
    */
    inventorylist.callList = function(userId) {
        InventoryService.getInventoryList(userId).then(
            function(data) {
                inventorylist.inventory = data.records;
                $ionicLoading.hide();
                inventorylist.noMoreItemsAvailable = false;
                if (!data.records.length) {
                    inventorylist.noinventory = true;
                }
            },
            function(err) {
                inventorylist.inventory = [];
                inventorylist.errorMessage = $translate.instant("inventory.inventoryControllerjs.need-internet-connection-view-inventory");
                inventorylist.errorMessageStatus = true;
                $ionicLoading.hide();
            }
        );
    };
    inventorylist.entries = 0;
})

.controller('InventoryCtrl', function($window, $scope, $stateParams, $translate, InventoryService, $q, $ionicLoading, DataService, SOUPINFO, $timeout,$ionicHistory) {
    var singleinventory = this;


    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"inventory.inventoryControllerjs.loading" | translate}}'
    });

    var inventoryId = $stateParams.inventoryId;
    singleinventory.inventoryId = $stateParams.inventoryId;
    var ipromise1 = InventoryService.getInventoryById(inventoryId);
    var ipromise2 = InventoryService.getInventoryLineItemsList(inventoryId);
    var ipromise3 = InventoryService.getInventoryTransactionlists(inventoryId);

    $q.all([ipromise1, ipromise2, ipromise3]).
    then(
        function(data) {
            singleinventory.inventory = data[0].records[0];
            singleinventory.InventoryLineItemsList = data[1].records;
            singleinventory.InventoryTransactionLists = data[2].records;
            $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                     $ionicLoading.hide();
                }, 800);            

            angular.element($window).on('resize', setProductHt);
            setProductHt();
        },
        function(err) {
            $scope.displayAlertMessage($translate.instant('inventory.inventoryControllerjs.need-internet-connection-view-inventoryDetails'));
            $ionicHistory.goBack();
        }
    );


    function cleanUp() {
        angular.element($window).off('resize', setProductHt);
    }

    $scope.$on('$destroy', cleanUp);


    function setProductHt() {
        var windowHt = $(window).outerHeight(true);
        var headerHt = $(".bar-header").outerHeight(true);
        var subNameHt = $(".subTopHdr").outerHeight(true);
        var subHeaderHt = $(".subtmHdr").outerHeight(true);
        var tabHt = $(".tsb-icons").outerHeight(true);
        var subCtInfo = $(".cntInfo").outerHeight(true);
        //Adding 30px as buffer
        var cntCtHt = windowHt - (headerHt + subNameHt + subHeaderHt + tabHt + 40);
        var cntCtOthersHt = windowHt - (headerHt + subNameHt + subHeaderHt + subCtInfo + tabHt + 40);
        $(".scrollPtHtGI").css({ "height": cntCtHt, "overflow": "auto" });
        $(".scrollPtHt").css({ "height": cntCtOthersHt, "overflow": "auto" });
    }


})

.controller('LineItemCtrl', function($scope, force, $translate, $ionicLoading, InventoryService, $stateParams, $timeout,$ionicHistory) {
        var lineitem = this;
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"inventory.inventoryControllerjs.loading" | translate}}'
        });
        var lineitemId = $stateParams.itemId;
        InventoryService.getInventoryLineItemDetails(lineitemId).then(
            function(lineitemData) {
                lineitem.detail = lineitemData.records[0];
                $ionicLoading.hide();
                 $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                  }, 1000);
            },
            function(err) {
            $scope.displayAlertMessage($translate.instant('inventory.inventoryControllerjs.need-internet-connection-view-details'));
            $ionicHistory.goBack();

            }
        );
})
.controller('InventoryTransactionsCtrl', function($scope, force, $translate, $ionicLoading, InventoryService, $stateParams, $timeout,$ionicHistory) {
        var trans = this;
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"inventory.inventoryControllerjs.loading" | translate}}'
        });
        var transId = $stateParams.transId;
        InventoryService.getInventoryTransactionDetails(transId).then(
            function(trans_Data) {
                trans.detail = trans_Data.records[0];
                $ionicLoading.hide();
                 $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                  }, 1000);
            },
            function(err) {
                $scope.displayAlertMessage($translate.instant('inventory.inventoryControllerjs.need-internet-connection-view-details'));
                $ionicHistory.goBack();
            }
        );
});


