/* jshint -W100 */
app.controller('AssetListCtrl', function($scope, force, $ionicModal, $translate, AssetsService, localStorageService, $ionicLoading, DataService, SOUPINFO) {

    var assetlist = this;
    assetlist.no_asset = $translate.instant("asset.assetControllerjs.no_records_found");
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
    });

    var filterValue = localStorageService.get("filterValue");
    if (filterValue === null) {
        assetlist.filterDays = 7;
    } else {
        assetlist.filterDays = filterValue;
    }

    assetlist.noMoreItemsAvailable = true;
    assetlist.loggedInId = '';

    var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
    sfOAuthPlugin.getAuthCredentials(function(usr) {
        assetlist.loggedInId = usr.userId;
        assetlist.callList(assetlist.filterContact, assetlist.loggedInId);
    });

    var rec_entries = localStorageService.get('maxRecords');
    if (rec_entries === null) {
        localStorageService.set('maxRecords', 20);
        rec_entries = 20;
    }
    /** 
     *   Desc - fetches assets list
     *   @param - days - [number of days], userId [loggedIn user Id]
     */
    assetlist.callList = function(days, userId) {
        DataService.getSoupData(SOUPINFO.assetsList, rec_entries).then(
            function(entries) {
                assetlist.assets = entries.currentPageOrderedEntries;
                assetlist.noMoreItemsAvailable = true;
                $ionicLoading.hide();
            },
            function(err) {
                assetlist.assets = [];
                $ionicLoading.hide();
            }
        );
        $ionicLoading.hide();
    };

    assetlist.entries = 0;
})

.controller('AssetCtrl', function($window, $scope, $state, $translate, $stateParams, AssetsService, $q, $ionicLoading, DataService, SOUPINFO, force, AssetNetworkService, $timeout, $ionicPopover) {
        var singleasset = this;
        var assetsSubModulesList = ["asset", "work_order", "service_contract","activities","modules"];
        singleasset.dontProceed = false;
        singleasset.assetId = $stateParams.assetId;
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
        });

        $ionicPopover.fromTemplateUrl('modules/asset/asset_popover.html', {
            scope: $scope
        }).then(function(popover) {
            singleasset.popover = popover;
        });

        var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
        sfOAuthPlugin.getAuthCredentials(successCall, failureCall);
        /** 
         *   Desc - set asset page height
         *   @param - none
         */
        function setAssetHt() {
            var windowHt = $(window).outerHeight(true);
            var headerHt = $(".bar-header").outerHeight(true);
            var subNameHt = $(".subTopHdr").outerHeight(true);
            var subHeaderHt = $(".subtmHdr").outerHeight(true);
            var tabHt = $(".tsb-icons").outerHeight(true);
            var subCtInfo = $(".cntInfo").outerHeight(true);
            //Adding 40px as buffer
            var cntCtHt = windowHt - (headerHt + subNameHt + subHeaderHt + tabHt + 40);
            var cntCtOthersHt = windowHt - (headerHt + subNameHt + subHeaderHt + subCtInfo + tabHt + 40);
            $(".scrollAtHtGI").css({ "height": cntCtHt, "overflow": "auto" });
            $(".scrollAtHt").css({ "height": cntCtOthersHt, "overflow": "auto" });
        }

        function cleanUp() {
            angular.element($window).off('resize', setAssetHt);
        }

        $scope.$on('$destroy', cleanUp);

        function successCall(data) {
            $scope.userTechId = data.userId;

            //Calling service for assets
            var assetsID = $stateParams.assetId;
            var aspromise1 = AssetsService.getAssetById(assetsID);
            var aspromise2 = AssetsService.getAssetWorkOrder(assetsID);
            var aspromise3 = AssetsService.getAssetServiceContract(assetsID);
            var aspromise4 = AssetsService.getActivities(assetsID);
            var aspromise5 = AssetsService.getModules(assetsID);
            $q.all([aspromise1, aspromise2, aspromise3, aspromise4, aspromise5]).
            then(
                function(asdata) {
                    console.log('modules',asdata);
                    singleasset.asset = asdata[0].records[0];
                    singleasset.work_order = asdata[1].records;
                    singleasset.service_contract = asdata[2].records;
                    singleasset.activities = asdata[3].records;
                    singleasset.modules = asdata[4].records;
                    angular.element($window).on('resize', setAssetHt);
                    // console.log('activities',singleasset.asset);
                    $ionicLoading.hide();

                    angular.forEach(assetsSubModulesList, function(module) {
                        storeAssetsDataInOffline(module, assetsID);
                    });

                    $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                        setAssetHt();
                    }, 800);
                },
                function(err) {
                    if (AssetNetworkService.isDeviceOnline()) {
                        $scope.showAlertMessage('Error Code: ' + err[0].errorCode + '\n Error message: ' + err[0].message);
                        return;
                    } else {
                        angular.forEach(assetsSubModulesList, function(module) {
                            getAssetsDataFromOffline(module, assetsID);
                        });

                        $timeout(function() {
                            angular.element('.item-note').show().css('color', 'black');
                            setAssetHt();
                        }, 800);
                    }
                }
            );
        }

        function failureCall(data) {
            console.log("Failure Callback is: ", data);
        }

        singleasset.goToModule = function () {
            $state.go('app.assetModuleform',{'assetId':$stateParams.assetId,'assetName':singleasset.asset.Name,'moduleId':0});
        };
        /** 
         *   Desc - store offline data in soup
         *   @param - none
         */
        function storeAssetsDataInOffline(type, assetsId) {
            var configObject = getAssetsPreFilledJSONArray(type);
            var AssetsDetailsArr = [];
            var AssetsDetailsObj = {};
            AssetsDetailsObj.Id = assetsId;
            AssetsDetailsObj.data = singleasset[type];
            AssetsDetailsArr.push(AssetsDetailsObj);
            DataService.setSoupData(configObject.soupName, AssetsDetailsArr);
        }
        /** 
         *   Desc - fetch offline data from soup
         *   @param - type [ tabs of asset], asset Id[asset Id]
         */
        function getAssetsDataFromOffline(type, assetsId) {
            if (singleasset.dontProceed) {
                return;
            }

            var configObject = getAssetsPreFilledJSONArray(type);
            DataService.getSoupData(configObject.soupName).then(
                function(entries) {
                    var assetsIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                        if (obj.Id === assetsId) {
                            return index;
                        }
                    });
                    if (assetsIdIndex.length === 0) {
                        if (singleasset.asset === undefined && singleasset.dontProceed === false) {
                            singleasset.dontProceed = true;
                            $scope.showAlertMessage($translate.instant("asset.assetControllerjs.no-offline-data-found"));
                            return;
                        }
                    }
                    singleasset[type] = entries.currentPageOrderedEntries[assetsIdIndex].data;
                    $ionicLoading.hide();
                },
                function(err) {
                    $ionicLoading.hide();
                }
            );
        }
        /** 
         *   Desc - Maps the soups names to the tabs of asset pages for showing data in offline
         *   @param - type [ tabs of asset]
         */
        function getAssetsPreFilledJSONArray(type) {
            var configJSON = {};
            switch (type) {
                case 'asset':
                    configJSON.soupName = SOUPINFO.assetsDetails;
                    return configJSON;
                case 'work_order':
                    configJSON.soupName = SOUPINFO.assetsWorkOrderDetails;
                    return configJSON;
                case 'service_contract':
                    configJSON.soupName = SOUPINFO.assetsServiceContractDetails;
                    return configJSON;
                case 'activities':
                    configJSON.soupName = SOUPINFO.assetsActivitiesDetails;
                    return configJSON;
                case 'modules':
                    configJSON.soupName = SOUPINFO.assetsModulesDetails;
                    return configJSON;
            }
        }

})
.controller('UpdateAssetCtrl', function($scope, force, $translate, $ionicModal, $state, $stateParams, NetworkService, AssetsService, $q, RepairAnalysisService, localStorageService, $ionicLoading, DataService, SOUPINFO) {

    var updateasset = this;
    updateasset.no_asset = $translate.instant("asset.assetControllerjs.no_records_found");

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
    });

    updateasset.noMoreItemsAvailable = true;
    updateasset.loggedInId = '';
    console.log('asset id',$stateParams);
    var assetId = $stateParams.assetId;
    var workorderID = $stateParams.workOrderId;
    // var childAsset = AssetsService.getChildAssets(assetId);
    // var masterAsset = AssetsService.getParentAssets(workorderID);
    // var getAllList = AssetsService.getAllUpdateAssets(workorderID);
    AssetsService.getAllUpdateAssets(workorderID).then(function(data) {
        console.log('lists',data);
        updateasset.assets = data;
        $ionicLoading.hide();
    }, function(err) {
        $ionicLoading.hide();
        $scope.showAlertMessage($translate.instant("asset.assetControllerjs.cannot-access-offline"));
    });

    updateasset.goToAssetForm = function(id) {
        if (NetworkService.isDeviceOnline()) {
            $state.go('app.assetform', { 'assetId': id });
        } else {
            $scope.displayAlertMessage($translate.instant("asset.assetControllerjs.cannot-access-offline"));
        }
    };

})
.controller('AssetCreateCtrl', function($scope, $translate, NetworkService, force, $ionicModal, $stateParams, toastr, $ionicHistory, AssetsService, $q, RepairAnalysisService, localStorageService, $ionicLoading, DataService, SOUPINFO, $filter) {

    var assetCreate = this;
    assetCreate.assetForm = {};
    var old_asset, newAsset = {};
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
    });
    assetCreate.assetData = {};
    var assetsID = $stateParams.assetId,
        workorderID = $stateParams.workOrderId;

    AssetsService.getAssetUpdateDetails($stateParams.assetId)
        .then(function(data) {
            if (data.records && data.records[0]) {
                console.log('asset detail', data.records);
                old_asset = data.records[0];
                assetCreate.accountId = old_asset.MedConnect__Account__c;
                assetCreate.accountName = (old_asset.MedConnect__Account__r) ? old_asset.MedConnect__Account__r.Name : '';
                assetCreate.productId = old_asset.MedConnect__Product__c;
                assetCreate.productName = (old_asset.MedConnect__Product__r) ? old_asset.MedConnect__Product__r.Name : '';
                assetCreate.assetName = old_asset.Name;
                assetCreate.assetId = old_asset.Id;
                if (old_asset.Last_PM_Date_MDSR__c && old_asset.Last_PM_Date_MDSR__c.length > 4) {
                    // console.log(1);
                    pm_time_arr = old_asset.Last_PM_Date_MDSR__c.split("+");
                    assetCreate.assetData.lastPmDate2 = new Date(pm_time_arr[0]);
                } else {
                    // console.log(2);
                    assetCreate.assetData.lastPmDate2 = old_asset.Last_PM_Date_MDSR__c;
                }
                if (old_asset.MedConnect__Installed_Date__c && old_asset.MedConnect__Installed_Date__c.length > 4) {
                    // console.log(3);
                    in_time_arr = old_asset.MedConnect__Installed_Date__c.split("+");
                    assetCreate.assetData.installeddate2 = new Date(in_time_arr[0]);
                } else {
                    // console.log(4);
                    assetCreate.assetData.installeddate2 = old_asset.MedConnect__Installed_Date__c;
                }
                assetCreate.assetData.cyclecount = old_asset.Usage_Cycle_Count_MDSR__c;
                assetCreate.selected_software_id = old_asset.MedConnect__Software_Version__c;
                assetCreate.selected_software_name = (old_asset.MedConnect__Software_Version__r) ? old_asset.MedConnect__Software_Version__r.Name : '';
                assetCreate.selected_hardware_id = old_asset.MedConnect__Hardware_Version__c;
                assetCreate.selected_hardware_name = (old_asset.MedConnect__Hardware_Version__r) ? old_asset.MedConnect__Hardware_Version__r.Name : '';

            }
            $ionicLoading.hide();

        }, function(err) {
            toastr.success($translate.instant('asset.assetControllerjs.could-not-load-data'));
            $ionicLoading.hide();

        });


    assetCreate.showSoftwares = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
        });
        AssetsService.getSoftwares(assetCreate.productId).then(
            function(entries) {
                assetCreate.softwares = entries.records;

                $ionicModal.fromTemplateUrl('modules/asset/softwares_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                    $ionicLoading.hide();
                });
            },
            function(err) {
                assetCreate.softwares = [];
                $ionicLoading.hide();
            }
        );
    };

    assetCreate.select_the_software = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
        });

        assetCreate.selected_software_name = name;
        assetCreate.selected_software_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    assetCreate.showHardwares = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
        });
        AssetsService.getHardwares(assetCreate.productId).then(
            function(entries) {
                assetCreate.hardwares = entries.records;

                $ionicModal.fromTemplateUrl('modules/asset/hardwares_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                    $ionicLoading.hide();
                });
            },
            function(err) {
                assetCreate.hardwares = [];
                $ionicLoading.hide();
            }
        );
    };

    assetCreate.select_the_hardware = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
        });

        assetCreate.selected_hardware_name = name;
        assetCreate.selected_hardware_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };


    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    assetCreate.takeMeBack = function() {
        $ionicHistory.goBack();
    };

    assetCreate.assetSave = function($form) {
        
        assetCreate.assetData.lastPmDate = $filter('date')(new Date(assetCreate.assetData.lastPmDate2), "MM/dd/yyyy hh:mm a");
        assetCreate.assetData.installeddate = $filter('date')(new Date(assetCreate.assetData.installeddate2), "MM/dd/yyyy");
        console.log('assetCreate.assetData',assetCreate.assetData);
        // return;
        if ($form.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
            });

            // if (typeof assetCreate.assetData.pmdate !== undefined && assetCreate.assetData.pmdate !== null && assetCreate.assetData.pmdate !== '') {
            //     newAsset.lastPmDate = assetCreate.assetData.pmdate.toISOString();
            // } else {
            //     newAsset.lastPmDate = assetCreate.assetData.pmdate;
            // }
            // if (typeof assetCreate.assetData.installeddate !== undefined && assetCreate.assetData.installeddate !== null && assetCreate.assetData.pmdate !== '') {
            //     newAsset.installedDate = assetCreate.assetData.installeddate.toISOString();
            // } else {
            //     newAsset.installedDate = assetCreate.assetData.installeddate;
            // }


            newAsset.assetUsageCycleCount = assetCreate.assetData.cyclecount;
            newAsset.curentLocation = assetCreate.assetData.current_location || '';
            newAsset.softwareVersion = assetCreate.selected_software_id;
            newAsset.hardWareVersion = assetCreate.selected_hardware_id;
            newAsset.lastPmDate = assetCreate.assetData.lastPmDate;
            newAsset.installedDate = assetCreate.assetData.installeddate;
             newAsset.assetId = assetsID;
            // "assetId" : "a080v0000008TGD",
            // "lastPmDate" : "10/14/2011 11:46 AM",
            // "installedDate" : "12/27/2009",
            // "assetUsageCycleCount": "13",
            // "softwareVersion": "a3d0v0000004FSp",
            // "hardWareVersion" : "a3d0v0000004FSk",
            // "locationAccount" : "0010v0000043ACy",
            // "isPart" : "false",
            // "woId" : "a3F0v000000EI9L",
            console.log('new asset',newAsset);
            AssetsService.updateAsset(newAsset).then(
                function(suc) {
                    console.log('suc',suc);
                    if (suc === 'SUCCESS') {
                        $ionicLoading.hide();
                        toastr.success($translate.instant("asset.assetControllerjs.asset-updated-successfully"));
                        $ionicHistory.goBack();
                    } else {
                          $scope.displayAlertMessage(suc);
                          $ionicLoading.hide();
                    }
                },
                function(err) {
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                    } else {
                        $scope.showAlertMessage($translate.instant("asset.assetControllerjs.asset-cannot-be-updated-offline"));
                    }
                });
        }
    };

})
.controller('ModuleCreateCtrl', function($scope, $translate, NetworkService, force, $ionicModal, $stateParams, toastr, $ionicHistory, AssetsService, $q,  localStorageService, $ionicLoading,SyncUpDataService) {

    var moduleCreate = this;
    moduleCreate.moduleForm = {};
    var newModule = {}, payload = {};
   
    moduleCreate.moduleData = {};
    var assetID = $stateParams.assetId;
    moduleCreate.moduleId = $stateParams.moduleId;
    moduleCreate.assetName = $stateParams.assetName;
    moduleCreate.assetId =assetID;
    console.log('id',moduleCreate.moduleId);
    if (moduleCreate.moduleId && moduleCreate.moduleId !== '0') {
         $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
    });
        AssetsService.getModuleInfo(moduleCreate.moduleId).then(
            function (mod) {
                $ionicLoading.hide();
                console.log('mod',mod);
                moduleCreate.moduleInfo =  mod.records[0];
                if (mod.records) {
                    moduleCreate.selected_module_name = moduleCreate.moduleInfo.Module_MDSR__r.Name;
                    moduleCreate.selected_module_id = moduleCreate.moduleInfo.Asset_MDSR__r.Id ;
                    moduleCreate.assetName = moduleCreate.moduleInfo.Asset_MDSR__r.Name;
                    moduleCreate.rowId = moduleCreate.moduleInfo.Id;
                }
               
            },function(err){
                 $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                    } else {
                        $scope.showAlertMessage($translate.instant("asset.assetControllerjs.modulecannot-be-find-offline"));
                    }
            }
        );
    }
    moduleCreate.showModules = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
        });
        AssetsService.getAllModules().then(
            function(entries) {
                moduleCreate.modules = entries.records;
                console.log(entries.records);
                $ionicModal.fromTemplateUrl('modules/asset/modules_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                    $ionicLoading.hide();
                });
            },
            function(err) {
                moduleCreate.modules = [];
                $ionicLoading.hide();
            }
        );
    };

    moduleCreate.select_the_module = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
        });

        moduleCreate.selected_module_name = name;
        moduleCreate.selected_module_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    moduleCreate.takeMeBack = function() {
        $ionicHistory.goBack();
    };

    moduleCreate.moduleSave = function($form) {
        if ($form.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"asset.assetControllerjs.loading" | translate}}'
            });
           
            console.log('newModule',newModule);
            payload.records = [{
                "action": "ATMD",
                "ref-id":"1",
                "data" : {
                    "Asset_MDSR__c":assetID,
                    "Module_MDSR__c": moduleCreate.selected_module_id
                }
            }];
            if (moduleCreate.moduleId && moduleCreate.moduleId !== '0') {
                payload.records[0].data.Id = moduleCreate.rowId ;
            }
            console.log(payload);
            SyncUpDataService.doSyncUp(payload).then(
                function(suc) {
                    console.log(suc);
                    console.log(suc.status);
                    if (suc.results.status === 'Failure') {
                        console.log('if');
                        $scope.displayAlertMessage(suc.results.msg);
                    } else if (suc.results.status === 'Success') {
                        console.log('else');
                        toastr.success($translate.instant("asset.assetControllerjs.module-added-successfully"));
                        $ionicHistory.goBack();
                    }
                    $ionicLoading.hide();

                },
                function(err) {
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                    } else {
                        $scope.showAlertMessage($translate.instant("asset.assetControllerjs.module-cannot-be-updated-offline"));
                    }
                });
        }
    };

});
