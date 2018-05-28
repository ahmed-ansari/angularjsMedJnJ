app.controller('NewOrderLineItemCtrl', ['$rootScope', '$scope', '$stateParams', 'toastr', '$state', '$q', '$ionicLoading', '$ionicHistory', 'ServiceOrderService', 'localStorageService', '$ionicModal', 'ProductsService', 'AssetsService', 'SyncUpDataService', 'AccountsService','NetworkService', NewOrderLineItemCtrl]);

function NewOrderLineItemCtrl($rootScope, $scope, $stateParams, toastr, $state, $q, $ionicLoading, $ionicHistory, ServiceOrderService, localStorageService, $ionicModal, ProductsService, AssetsService, SyncUpDataService, AccountsService, NetworkService) {

    var neworderitem = this;

    neworderitem.orderId = $stateParams.orderId;
    neworderitem.itemId = $stateParams.itemId;
    neworderitem.formData = {};
    neworderitem.formData.condition = '';
    neworderitem.formData.status = '';
    neworderitem.formData.ship_method = '';
    neworderitem.searchproductname = '';
    neworderitem.searchassetname = '';
    neworderitem.errorMessage = 'This Functionality is not accessible Offline';
    console.log('stateparams', $stateParams);

    sfoAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
    sfoAuthPlugin.getAuthCredentials(function(usr) {
        // console.log('usr',usr);
        neworderitem.userId = usr.userId;
    });
    if (neworderitem.itemId.length > 4) {
        ServiceOrderService.getOrderDetails(neworderitem.itemId).then(
            function(orderData) {
                console.log('orderData data', orderData);
                neworderitem.orderData = orderData.records;
            },
            function(err) {
                $scope.displayAlertMessage(neworderitem.errorMessage);
            });

    } else if (neworderitem.orderId.length > 4){
        ServiceOrderService.getOrderDetails(neworderitem.orderId).then(
            function(orderData){
                console.log('data',orderData);
                 neworderitem.orderData = orderData.records[0];
            },function(err){
                  $scope.displayAlertMessage(neworderitem.errorMessage);
            });
        // $scope.displayAlertMessage('Could not Retreive Details, This Functionality is not accessible Offline');
        // toastr.error('Could not Retreive Details Online for edit');
    }

    /** 
     *   Desc - Used to load BOM
     *   @param - none
     *   @return none
     */
    neworderitem.loadBOM = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        RepairAnalysisService.getInstallationBOM(SharedPreferencesService.getWorkOrderAsset()).then(function(data) {
            neworderitem.BOMRecords = data.records;
            $ionicLoading.hide();

            $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_install_BOM.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            $scope.displayAlertMessage(neworderitem.errorMessage);
            $ionicLoading.hide();
        });
    };

    /** 
     *   Desc - Assigns the selected BOM from BOM lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    neworderitem.fetchBOM = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.materialBOMName = name;
        neworderitem.materialBOMId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Shows the inventory line items
     *   @param - none
     *   @return none
     */
    neworderitem.loadInventoryLineItem = function() {

        if (neworderitem.srcInventoryId && typeof neworderitem.srcInventoryId !== undefined && neworderitem.srcInventoryId !== null && neworderitem.srcInventoryId !== '') {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            RepairAnalysisService.getInventoryLineItems(neworderitem.srcInventoryId).then(function(data) {
                $ionicLoading.hide();
                neworderitem.lineItemRecords = data.records;

                $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_lineitems.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });

            }, function(err) {
                $scope.displayAlertMessage(neworderitem.errorMessage);
                $ionicLoading.hide();
            });
        } else {
            neworderitem.showAlertMessage("Source Inventory is mandatory for Line Items");
        }

    };

    /** 
     *   Desc - Assigns the selected Line Item from Line Item lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    neworderitem.fetchLineItem = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.inventoryItem = name;
        neworderitem.inventoryItemId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Shows the source inventory items
     *   @param - none
     *   @return none
     */
    neworderitem.loadSrcInventory = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        ServiceOrderService.getSourceInventories().then(function(data) {
            neworderitem.srcInventoryRecords = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/order/lookup_source_inv.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            $scope.displayAlertMessage(neworderitem.errorMessage);
            $ionicLoading.hide();
        });
    };

    /** 
     *   Desc - Assigns the selected source inventory item from source inventory lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    neworderitem.fetchSrcInventory = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.sourceInventory = name;
        neworderitem.sourceInventoryId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Shows the destination inventory items
     *   @param - none
     *   @return none
     */
    neworderitem.loadDestInventory = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        ServiceOrderService.getDestinationInventories().then(function(data) {

            neworderitem.destInventoryRecords = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/order/lookup_dest_inventory.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            $scope.displayAlertMessage(neworderitem.errorMessage);
            $ionicLoading.hide();
        });
    };

    /** 
     *   Desc - Assigns the destination inventory Item from destination inventory lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    neworderitem.fetchDestInventory = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.destInventory = name;
        neworderitem.destInventoryId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Loads the Asset List
     *   @param - none
     *   @return none
     */
    neworderitem.loadAssets = function() {
        neworderitem.searhAssetError = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        $ionicModal.fromTemplateUrl('modules/order/lookup_assets.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });

    };

    neworderitem.searchAsset = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (neworderitem.searchassetname.length > 0) {
            neworderitem.searhAssetError = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            AssetsService.getAssetsbySearch(neworderitem.searchassetname).then(
                function(entries) {

                    console.log('post search', entries);
                    if (entries.records.length > 0) {
                        neworderitem.Assets = entries.records;
                        neworderitem.no_asset = '';
                        neworderitem.searhAssetError = '';
                    } else {
                        neworderitem.no_asset = 'No Record Found';
                        neworderitem.Assets = [];
                        neworderitem.searhAssetError = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage(neworderitem.errorMessage);
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            neworderitem.searhAssetError = 'Please type atleast 1 characters';
            neworderitem.no_asset = '';
            neworderitem.Assets = '';
        }


    };

    neworderitem.selectAsset = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.AssetName = name;
        neworderitem.AssetId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    neworderitem.loadLot = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        AssetsService.getLot().then(function(data) {
            console.log('loadLot', data);
            neworderitem.Lots = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/lookup_lots.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            $scope.displayAlertMessage(neworderitem.errorMessage);
            $ionicLoading.hide();
        });
    };

    neworderitem.selectLot = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.lotName = name;
        neworderitem.lotId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    neworderitem.loadProducts = function() {
        neworderitem.searhproductError = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        $ionicModal.fromTemplateUrl('modules/order/lookup_products.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });
    };

    neworderitem.searchProduct = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (neworderitem.searchproductname.length > 0) {
            neworderitem.searhproductError = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            ProductsService.getProductsbySearch(neworderitem.searchproductname).then(
                function(entries) {

                    console.log('post search', entries);
                    if (entries.records.length > 0) {
                        neworderitem.Products = entries.records;
                        neworderitem.no_product = '';
                        neworderitem.searhproductError = '';
                    } else {
                        neworderitem.no_product = 'No Record Found';
                        neworderitem.Products = [];
                        neworderitem.searhproductError = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage(neworderitem.errorMessage);
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            neworderitem.searhproductError = 'Please type atleast 1 characters';
            neworderitem.no_product = '';
            neworderitem.Products = '';
        }
    };

    neworderitem.selectProduct = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.productName = name;
        neworderitem.productId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    neworderitem.loadSourceAccounts = function() {
        neworderitem.searhSourceAccountError = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        $ionicModal.fromTemplateUrl('modules/order/lookup_SourceAccounts.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });
    };

    neworderitem.searchSourceAccount = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (neworderitem.searchSourceAccountname.length > 0) {
            neworderitem.searhSourceAccountError = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            AccountsService.getAllAccountsforLookup(neworderitem.searchSourceAccountname).then(
                function(entries) {

                    console.log('post search', entries);
                    if (entries.records.length > 0) {
                        neworderitem.SourceAccounts = entries.records;
                        neworderitem.no_SourceAccount = '';
                        neworderitem.searhSourceAccountError = '';
                    } else {
                        neworderitem.no_SourceAccount = 'No Record Found';
                        neworderitem.SourceAccounts = [];
                        neworderitem.searhSourceAccountError = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage(neworderitem.errorMessage);
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            neworderitem.searhSourceAccountError = 'Please type atleast 1 characters';
            neworderitem.no_SourceAccount = '';
            neworderitem.SourceAccounts = '';
        }
    };

    neworderitem.selectSourceAccount = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.selected_source_account_name = name;
        neworderitem.selected_source_account_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    neworderitem.loadDestAccounts = function() {
        neworderitem.searhDestAccountError = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        $ionicModal.fromTemplateUrl('modules/order/lookup_destAccounts.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });
    };

    neworderitem.searchDestAccount = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (neworderitem.searchDestAccountname.length > 0) {
            neworderitem.searhDestAccountError = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            AccountsService.getAllAccountsforLookup(neworderitem.searchDestAccountname).then(
                function(entries) {

                    console.log('DestAccount search', entries);
                    if (entries.records.length > 0) {
                        neworderitem.DestAccounts = entries.records;
                        neworderitem.no_DestAccount = '';
                        neworderitem.searhDestAccountError = '';
                    } else {
                        neworderitem.no_DestAccount = 'No Record Found';
                        neworderitem.DestAccounts = [];
                        neworderitem.searhDestAccountError = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage(neworderitem.errorMessage);
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            neworderitem.searhDestAccountError = 'Please type atleast 1 characters';
            neworderitem.no_DestAccount = '';
            neworderitem.DestAccounts = '';
        }
    };

    neworderitem.selectDestAccount = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.selected_dest_account_name = name;
        neworderitem.selected_dest_account_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    neworderitem.loadInventoryLocations = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        ServiceOrderService.getCurrentInventoryLocations().then(function(data) {
            console.log('loadLot', data);
            neworderitem.inv_locs = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/order/lookup_inv_locations.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            $scope.displayAlertMessage(neworderitem.errorMessage);
            $ionicLoading.hide();
        });
    };

    neworderitem.selectCurrentInventory = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        neworderitem.curr_inventory_loc_name = name;
        neworderitem.curr_inventory_loc_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };



    /** 
     *   Desc - Closes the modal dialog
     *   @param - none
     *   @return none
     */
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    /** 
     *   Desc - Used to install asset
     *   @param - $form
     *   @return none
     */
    neworderitem.save = function($form) {
        // console.log('form data', neworderitem.formData);
        // return;

        if ($form.$valid) {
            var required_data = {
                "MedConnect__Inventory_Request_Order__c": neworderitem.orderId,
                "MedConnect__Transaction_Qty__c": neworderitem.formData.quantity,
                "MedConnect__Product__c": (neworderitem.productId) ? neworderitem.productId : '',
                "MedConnect__LineItem_Status__c": neworderitem.formData.status,
                "MedConnect__Lot__c": (neworderitem.lotId) ? neworderitem.lotId : '',
                "MedConnect__Asset__c": (neworderitem.AssetId) ? neworderitem.AssetId : '',
                // "MedConnect__Batch__c": "<Batch ID>",
                "MedConnect__Order_Line_Type__c": neworderitem.formData.type,
                "MedConnect__Source_Inventory__c": (neworderitem.sourceInventoryId) ? neworderitem.sourceInventoryId : '',
                "MedConnect__Destination_Inventory__c": (neworderitem.destInventoryId) ? neworderitem.destInventoryId : '',
                "MedConnect__Source_Account__c": (neworderitem.selected_source_account_id) ? neworderitem.selected_source_account_id : '',
                "MedConnect__Destination_Account__c": (neworderitem.selected_dest_account_id) ? neworderitem.selected_dest_account_id : '',
                // "MedConnect__Description__c": "<Description>",
                // "MedConnect__Qty_Expected__c": "<Order Line Quantity Expected>",
                // "MedConnect__Total_Qty_Shipped__c": "<Order Line Quantity Shipped>",
                // "MedConnect__Total_Qty_Received__c": "<Order Line Quantity Received>",
                "MedConnect__Billable__c": neworderitem.formData.billable,
                "MedConnect__Courier__c": neworderitem.formData.courier,
                "MedConnect__Tracking_Number_New__c": neworderitem.formData.track_num,
                "MedConnect__Shipping_Method_New__c": neworderitem.formData.ship_method,
                "MedConnect__Route__c": neworderitem.formData.route,
                "MedConnect__Expected_Ship_Date1__c": neworderitem.formData.ship_date,
                "MedConnect__Expected_Delivery_Date1__c": neworderitem.formData.delivery_date,
                "MedConnect__Current_Location_Inventory__c": (neworderitem.curr_inventory_loc_id) ? neworderitem.curr_inventory_loc_id : '',
                "CreatedBy": neworderitem.userId,
                "LastModifiedBy": neworderitem.userId,
                "Owner": neworderitem.userId,
                // "MedConnect__UDI_Number__c": "<UDI Number>",
                "MedConnect__PO__c": neworderitem.formData.po,
                // "MedConnect__RMA_Reference__c": "<RMA Reference Id>",
                // "MedConnect__Expected_Loaner_Return_Date1__c": "<Expected Loaner Return Date>"
            };
            var wrapper = {
                "records": [{
                    "action": "OLI",
                    "ref-id": "123",
                    "data": required_data
                }]
            };
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            SyncUpDataService.doSyncUp(wrapper).then(
                function(suc) {
                    console.log('suc',suc);
                    console.log(suc.status);
                    if (suc.results.status === 'Failure') {
                        console.log('if');
                        $scope.displayAlertMessage(suc.results.msg);
                    } else if (suc.results.status === 'Success') {
                        console.log('else');
                        toastr.success('Line Item Added Successfully');
                        $ionicHistory.goBack();
                    }
                    $ionicLoading.hide();

                },
                function(err) {
                    console.log('err',err);
                    $scope.displayAlertMessage(neworderitem.errorMessage);
                    $ionicLoading.hide();

                });
        }
    };

    /** 
     *   Desc - Shows the alert message
     *   @param - message
     *   @return none
     */
    neworderitem.showAlertMessage = function(message) {
        navigator.notification.alert(message, neworderitem.alertDismissed, 'Medvantage', 'OK');
    };

    /** 
     *   Desc - Success callback from alert message
     *   @param - none
     *   @return none
     */
    neworderitem.alertDismissed = function() {};

    /** 
     *   Desc - Shows the alert popup
     *   @param - none
     *   @return none
     */
    neworderitem.showSuccessMessage = function(message) {
        navigator.notification.alert(message, neworderitem.onSuccess, 'Medvantage', 'OK');
    };

    /** 
     *   Desc - Success callback from alert message to go back
     *   @param - none
     *   @return none
     */
    neworderitem.onSuccess = function() {
        $ionicHistory.goBack();
    };

    /** 
     *   Desc - Used to navigate to previous state
     *   @param - none
     *   @return none
     */
    neworderitem.backToOrder = function() {
        $ionicHistory.goBack();
    };

}