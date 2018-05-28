/* jshint -W100 */
app.controller('WorkOrderCtrl', function($rootScope, $ionicSlideBoxDelegate, $scope, $stateParams, $state, WorkOrderService, $q, $ionicLoading, DataService, SOUPINFO, SharedPreferencesService, $ionicPopup, $timeout, SLAClockService, ActivityService, ExpenseService, RepairAnalysisService, QuoteService, TechnicalBulletinService, $interval, $ionicPopover, NetworkService, toastr, $window, $translate) {

    var singleWorkOrder = this;
    singleWorkOrder.dontProceed = false;
    sfoAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
    sfoAuthPlugin.getAuthCredentials(function(usr) {
        loadScript(usr.instanceUrl, usr.accessToken);
    });

    /** 
     *   Desc - Dynamically load the script in the page body
     *   @param - instance_url
     *   @param - sid
     */

    var loadScript = function(instance_url, sid) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = instance_url + '/secur/frontdoor.jsp?sid=' + sid;
        $timeout(function() {
            document.body.appendChild(script);
        }, 800);
    };

    var woSubModulesList = ["WO", "warranty_info", "BOM", "activities", "expenses", "RMA", "repair_analysis", "quote", "invoice", "appliedTerms"];

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.workorderController.loading" | translate}}'
    });

    var workOrderID = $stateParams.workorderId;
    singleWorkOrder.workOrderID = workOrderID;
    SharedPreferencesService.setWorkOrderId(workOrderID);

    $ionicPopover.fromTemplateUrl('modules/workorder/wo_popover.html', {
        scope: $scope
    }).then(function(popover) {
        singleWorkOrder.popover = popover;
        singleWorkOrder.workOrderID = workOrderID;
        singleWorkOrder.workOrderName = '';
    });

    /** 
     *   Desc - setting the sign for the workorder
     *   @param - sdata
     *   @return none
     */

    singleWorkOrder.setSign = function(sdata) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.workorderController.loading" | translate}}'
        });
        sdata.Id = workOrderID;
        sdata.MedConnect__SignOff__c = "<img alt='signature' src='" + sdata.dataurl + "'/>";
        var signImageString = sdata.dataurl;
        delete sdata.dataurl;
        delete sdata.isEmpty;
        WorkOrderService.setSignatureToId(sdata).then(function() {
            $state.reload();
        }, function(err) {
            if (!NetworkService.isDeviceOnline()) {
                var signObj = {};
                var signArrayObj = [];
                signObj.Id = workOrderID;
                signObj.data = signImageString;
                signArrayObj.push(signObj);
                DataService.setSoupData(SOUPINFO.woSignature, signArrayObj);

                var offlineObj = {
                    "action": "Edit",
                    "type": "WOS",
                    "Name": "Signature",
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "object": "MedConnect__Work_Order__c",
                    "data": sdata,
                    "randomId": workOrderID,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/workorder/" + workOrderID
                };

                DataService.setOfflineSoupData(offlineObj).then(function() {
                    toastr.info($translate.instant("workorder.workorderController.signatureUpdatedSuccessOffline"));
                    $state.reload();
                });
            }
            $ionicLoading.hide();
        });
    };

    /** 
     *   Desc - Used to get the signature of the corresponding workorder
     *   @param - workOrderID
     *   @return none 
     */

    singleWorkOrder.getSign = function(workOrderID) {
        WorkOrderService.getSignatureById(workOrderID).then(function(sign) {
            singleWorkOrder.sign_img = sign.records[0].MedConnect__SignOff__c;
            var signObj = {};
            var signArrayObj = [];
            signObj.Id = workOrderID;
            signObj.data = sign.records;
            signArrayObj.push(signObj);
            DataService.setSoupData(SOUPINFO.woSignature, signArrayObj);

        }, function(er) {
            var querySpec = navigator.smartstore.buildExactQuerySpec('Id', workOrderID);
            navigator.smartstore.querySoup(SOUPINFO.woSignature.Name, querySpec, function(resp) {
                if (resp.currentPageOrderedEntries.length > 0) {
                    var signOffArray = resp.currentPageOrderedEntries[0];
                    if (typeof signOffArray.data[0].MedConnect__SignOff__c !== 'undefined') {
                        singleWorkOrder.sign_img = signOffArray.data[0].MedConnect__SignOff__c;
                    } else {
                        singleWorkOrder.sign_img = "<img alt='signature' src='" + signOffArray.data + "'/>";
                    }
                } else {
                    singleWorkOrder.sign_img = '';
                }
            });
        });
    };

    singleWorkOrder.getSign(workOrderID);

    /** 
     *   Desc - Clears the signature for the workorder that's been set already
     *   @param - none
     */
    singleWorkOrder.clearsign = function() {
        $timeout(function() {
            angular.element('#clearsignid').click();
        });
    };

    singleWorkOrder.setsign = function() {
        $timeout(function() {
            angular.element('#setsignid').click();
        });
    };

    /** 
     *   Desc - Shows the custom signature pad popup for user to sign
     *   @param - none
     */
    singleWorkOrder.showPopup = function() {
        $scope.data = {};
        $ionicPopup.show({
            template: '<signature-pad-custom accept="accept" clear="clear" height="220" width="568"></signature-pad-custom><button ng-click="clear()" id="clearsignid">{{"workorder.workorderController.clearSignature" | translate}}</button><button ng-click="singleWorkOrder.setSign(accept())" id="setsignid">{{"workorder.workorderController.sign" | translate}}</button>',
            title: $translate.instant("workorder.workorderController.signature"),
            subTitle: $translate.instant("workorder.workorderController.signForm"),
            scope: $scope,
            buttons: [{
                text: $translate.instant("workorder.workorderController.cancel"),
                onTap: function(e) {
                    singleWorkOrder.clearsign();
                }
            }, {
                text: '<b>' + $translate.instant("workorder.workorderController.save") + '</b>',
                type: 'button-positive',
                onTap: function(e) {
                    singleWorkOrder.setsign();
                }
            }]
        });
    };

    /** 
     *   Desc - Used for accepting the workorder
     *   @param - none
     */

    singleWorkOrder.acceptWorkOrder = function(type) {
        if (!NetworkService.isDeviceOnline()) {
            $scope.displayAlertMessage($translate.instant("workorder.workorderController.functionalityNotAccessibleOffline"));
            return false;
        }
        var procesingStatus = SharedPreferencesService.getProcessingStatus();
        if (singleWorkOrder.WO.MedConnect__Assigned_Technician__c !== null && type === "accept" && procesingStatus === 'Accepted by FSE/Scheduled') {
            showMessage($translate.instant("workorder.workorderController.workorder") + singleWorkOrder.WO.Name + $translate.instant("workorder.workorderController.alreadyAccepted"));
        } else if ((singleWorkOrder.WO.MedConnect__Assigned_Technician__c === null && type === "accept") || (singleWorkOrder.WO.MedConnect__Assigned_Technician__c !== null && type === "accept" && procesingStatus !== 'Accepted by FSE/Scheduled')) {
            $state.go('app.acceptorder');
        } else if (singleWorkOrder.WO.MedConnect__Assigned_Technician__c === null && type === "reject") {
            //showMessage('The Work Order ' + singleWorkOrder.WO.Name + ' is not accepted');
            $state.go('app.rejectorder');
        } else if (singleWorkOrder.WO.MedConnect__Assigned_Technician__c !== null && type === "reject") {
            $state.go('app.rejectorder');
        }
    };

    /** 
     *   Desc - Shows the alert popup
     *   @param - message
     */
    function showMessage(message) {
        navigator.notification.alert(message, alertDismissed, $translate.instant("workorder.workorderController.medvantage"), $translate.instant("workorder.workorderController.ok"));
    }

    /** 
     *   Desc - Success callback for alert popup
     *   @param - message
     */
    function alertDismissed() {}


    var promise1 = WorkOrderService.getWorkOrderById(workOrderID);
    var promise2 = ActivityService.getActivity(workOrderID);
    var promise3 = ExpenseService.getExpenses(workOrderID);
    var promise4 = RepairAnalysisService.getRepairAnalysisList(workOrderID);
    var promise5 = QuoteService.getQuotesByWOId(workOrderID);
    var promise6 = WorkOrderService.getInvoiceByWoId(workOrderID);
    var promise7 = WorkOrderService.getAppliedContractTerms(workOrderID);
    var promise8 = WorkOrderService.getServiceOrders(workOrderID);
    var promiseRMA = WorkOrderService.getRMADetails(workOrderID);


    $q.all([promise1, promise2, promise3, promise4, promise5, promise6, promise7, promise8, promiseRMA]).then(function(data) {
        //console.log('work order details',data[0].records[0]);
        $ionicSlideBoxDelegate.update();

        if (data[0].records[0].RecordType.Name.toLowerCase() == 'depot repair') {
            singleWorkOrder.hideExpenseTab = true;
            singleWorkOrder.showRMA = true;
        } else {
            singleWorkOrder.hideExpenseTab = false;
            singleWorkOrder.showRMA = false;
        }

        singleWorkOrder.WO = data[0].records[0];
        singleWorkOrder.activities = data[1].records;
        singleWorkOrder.expenses = data[2].records;
        singleWorkOrder.repair_analysis = data[3].records;
        singleWorkOrder.quote = data[4].records;
        singleWorkOrder.invoice = data[5].records;
        singleWorkOrder.appliedTerms = data[6].records;
        singleWorkOrder.orders = data[7].records;

        singleWorkOrder.RMA = data[7].records;
        singleWorkOrder.product_c = singleWorkOrder.WO.MedConnect__Product__c;
        singleWorkOrder.asset_w = singleWorkOrder.WO.MedConnect__Asset_Warranty__c;


        singleWorkOrder.storeDataInSharedPrefernce();

        //get BOM Details
        if (singleWorkOrder.product_c && singleWorkOrder.product_c !== null) {
            WorkOrderService.getBOMDetails(singleWorkOrder.product_c).then(function(bom_details) {
                singleWorkOrder.BOM = bom_details.records[0];
                singleWorkOrder.configureBOMChart();
                singleWorkOrder.invokeGetWarrantyInfoService();

                setHeight();

            }, function(err) {
                singleWorkOrder.invokeGetWarrantyInfoService();
            });
        }

        //Get Activity Templates
        ActivityService.getActivityTemplatesByProductId(singleWorkOrder.WO.MedConnect__Product__c).then(function(data) {
            DataService.setSoupData(SOUPINFO.activityTemplateList, [{ 'Id': singleWorkOrder.WO.Id, 'data': data.records }]);
        }, function(er) {

        });

        //********** Get Available and Applied Bullitens of WO
        var availableTB = TechnicalBulletinService.getAvailableTechnicalBulliten(singleWorkOrder.WO.Id, singleWorkOrder.WO.MedConnect__Asset__c);
        var appliedTB = TechnicalBulletinService.getAppliedTechnicalBulliten(singleWorkOrder.WO.Id);
        $q.all([availableTB, appliedTB]).then(function(data) {
            DataService.setSoupData(SOUPINFO.technicalBulletinList, [{ 'Id': singleWorkOrder.WO.Id, 'data': data }]);
        }, function(err) {

        });

        if ($rootScope.previousState.name === "app.add-wo-activity" && $rootScope.isSuccess === true) {
            $rootScope.isSuccess = false;
            $ionicSlideBoxDelegate.slide(7);
        }

        if ($rootScope.previousState.name === "app.add-wo-expense" && $rootScope.isSuccess === true) {
            $rootScope.isSuccess = false;
            $ionicSlideBoxDelegate.slide(8);
        }
        $timeout(function() {
            angular.element('.item-note').show().css('color', 'black');
            navigator.smartstore.getDatabaseSize(function(db) {
                    console.log('size', db);
                },
                function(err) {
                    console.log('err', err);
                });
        }, 1000);
        $ionicLoading.hide();
    }, function(err) {
        if (NetworkService.isDeviceOnline()) {
            $scope.showAlertMessage($translate.instant("workorder.workorderController.errCode") + err[0].errorCode + $translate.instant("workorder.workorderController.errMsg") + err[0].message);
            return;
        } else {
            angular.forEach(woSubModulesList, function(module, key) {
                getDataFromOffline(module, workOrderID);
            });
        }
        $ionicLoading.hide();
    });


    /** 
     *   Desc - Used to invoke the warranty info service 
     *   @param - none
     */

    singleWorkOrder.invokeGetWarrantyInfoService = function() {
        singleWorkOrder.warranty_info = null;
        if (singleWorkOrder.asset_w !== '' && singleWorkOrder.asset_w !== null) {
            WorkOrderService.getWarrantyInfo(singleWorkOrder.asset_w).then(function(warranty_info) {
                if (warranty_info.records[0]) {
                    singleWorkOrder.warranty_info_data = true;
                    singleWorkOrder.warranty_info = warranty_info.records[0];

                    angular.forEach(woSubModulesList, function(module) {
                        storeDataInOffline(module, workOrderID, singleWorkOrder);
                    });
                } else {
                    singleWorkOrder.warranty_info_data = false;
                    singleWorkOrder.no_warranty_info = $translate.instant("workorder.workorderController.noDataFound");
                }
            });
        } else {
            angular.forEach(woSubModulesList, function(module) {
                storeDataInOffline(module, workOrderID, singleWorkOrder);
            });
        }
    };

    /** 
     *   Desc - Used to store workorder data in service to be used across controllers
     *   @param - none
     */

    singleWorkOrder.storeDataInSharedPrefernce = function() {
        //Using these details in AcceptRejectController
        if (singleWorkOrder.WO) {
            SharedPreferencesService.setWorkOrderName(singleWorkOrder.WO.Name);
            SharedPreferencesService.setProductId(singleWorkOrder.WO.MedConnect__Product__c);
            SharedPreferencesService.setAppointedTechnicianId(singleWorkOrder.WO.MedConnect__Appointed_Technician__c);
            SharedPreferencesService.setAssignedTechnicianId(singleWorkOrder.WO.MedConnect__Assigned_Technician__c);
            SharedPreferencesService.setAlternateTime(singleWorkOrder.WO.MedConnect__Alternate_Time__c);
            SharedPreferencesService.setRecordType(singleWorkOrder.WO.RecordType.Name);
            SharedPreferencesService.setAssetId(singleWorkOrder.WO.MedConnect__Asset__c);
            SharedPreferencesService.setProcessingStatus(singleWorkOrder.WO.MedConnect__Processing_Status__c);
            if (singleWorkOrder.WO.MedConnect__Account__r) {
                SharedPreferencesService.setAccountName(singleWorkOrder.WO.MedConnect__Account__r.Name);
                SharedPreferencesService.setAccountId(singleWorkOrder.WO.MedConnect__Account__c);

            }
            if (singleWorkOrder.WO.MedConnect__Contact__r) {
                SharedPreferencesService.setContactName(singleWorkOrder.WO.MedConnect__Contact__r.Name);
                SharedPreferencesService.setContactId(singleWorkOrder.WO.MedConnect__Contact__c);

            }
        }
    };


    /** 
     *   Desc - Used to draw hierarchial chart for BOM
     *   @param - none
     */

    function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('string', 'Manager');
        data.addColumn('string', 'ToolTip');

        // For each orgchart box, provide the name, manager, and tooltip to show.
        var base_arr = [];
        base_arr[0] = [{ v: singleWorkOrder.BOM.MedConnect__Product_Name__r.Name + ' - head' }, '', ''];
        for (var i = 0; i < singleWorkOrder.BOM.MedConnect__BOM_Details__r.records.length; i++) {
            base_arr.push([singleWorkOrder.BOM.MedConnect__BOM_Details__r.records[i].Name + ' -1', singleWorkOrder.BOM.MedConnect__Product_Name__r.Name + ' - head', '']);
        }
        data.addRows(base_arr);
        // Create the chart.
        var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
        chart.draw(data, {
            allowHtml: true
        });
    }

    /** 
     *   Desc - Used to configure the BOM chart
     *   @param - none
     */
    singleWorkOrder.configureBOMChart = function() {
        if (singleWorkOrder.BOM && singleWorkOrder.BOM.MedConnect__BOM_Details__r != null) {
            google.charts.setOnLoadCallback(drawChart);
        } else {
            singleWorkOrder.no_BOMStatus = true;
            singleWorkOrder.no_BOMMessage = $translate.instant("workorder.workorderController.noDataFound");
        }
    };

    /** 
     *   Desc - Used to get workorder data saved during the online from offline soup
     *   @param - type
     *   @param - workOrderId
     */
    function getDataFromOffline(type, workOrderId) {
        if (singleWorkOrder.dontProceed) {
            return;
        }

        var configObject = getPreFilledJSONArray(type);
        DataService.getSoupData(configObject.soupName, 100).then(function(entries) {

                var woIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == workOrderId) {
                        return index;

                    }

                });

                if (woIdIndex.length === 0) {
                    if (singleWorkOrder.WO === undefined && singleWorkOrder.dontProceed === false) {
                        singleWorkOrder.dontProceed = true;
                        $scope.showAlertMessage($translate.instant("workorder.workorderController.noOfflineDataFound"));
                        return;
                    }
                }

                singleWorkOrder[type] = entries.currentPageOrderedEntries[woIdIndex].data;

                if (type == "WO") {
                    if (singleWorkOrder[type].RecordType.Name.toLowerCase() == 'depot repair') {
                        singleWorkOrder.hideExpenseTab = true;
                        singleWorkOrder.showRMA = true;
                    } else {
                        singleWorkOrder.hideExpenseTab = false;
                        singleWorkOrder.showRMA = false;
                    }
                }

                if (type === 'warranty_info') {
                    if (singleWorkOrder[type] !== null) {
                        singleWorkOrder.warranty_info_data = true;
                    } else {
                        singleWorkOrder.warranty_info_data = false;
                    }
                } else if (type === 'BOM') {
                    singleWorkOrder.configureBOMChart();
                } else if (type === 'WO') {
                    singleWorkOrder.storeDataInSharedPrefernce();
                }

                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                    setHeight();
                }, 1000);
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            });
    }

    /** 
     *   Desc - Sets the content height for the workorder main screen 
     *   @param - none
     */
    function setHeight() {
        var windowHt = $(window).outerHeight(true);
        var headerHt = $(".bar-header").outerHeight(true);
        var subheaderHt = $(".subHeader").outerHeight(true);
        var tabHt = $(".tsb-icons").outerHeight(true);
        var footerHt = $(".bar-footer").outerHeight(true);
        var contentHdr = $(".cntHdr").outerHeight(true);

        if (contentHdr < 10 || contentHdr === null) {
            contentHdr = 72;
        }
        $('.scroll-height').css("height", windowHt - (headerHt + subheaderHt + tabHt + footerHt + contentHdr));
    }

    /** 
     *   Desc - Used to store the workorder data in online to be used in offline
     *   @param - type
     *   @param - workOrderId
     *   @param - singleWorkOrderObject
     */

    function storeDataInOffline(type, workOrderId, singleWorkOrderObject) {
        var configObject = getPreFilledJSONArray(type);
        var woDetailsArr = [];
        var woDetailsObj = {};
        woDetailsObj.Id = workOrderId;
        woDetailsObj.data = singleWorkOrderObject[type];
        woDetailsArr.push(woDetailsObj);

        DataService.setSoupData(configObject.soupName, woDetailsArr);
    }

    angular.element($window).on('resize', setHeight);
    setHeight();

    /** 
     *   Desc - Used to clear the resize event set for calculating the content height
     *   @param - none
     */
    function cleanUp() {
        angular.element($window).off('resize', setHeight);
    }

    $scope.$on('$destroy', cleanUp);

    /** 
     *   Desc - Fetches the soup name of the corresponding type
     *   @param - type
     */
    function getPreFilledJSONArray(type) {

        var configJSON = {};
        switch (type) {
            case 'WO':
                configJSON.soupName = SOUPINFO.workOrderDetails;
                return configJSON;
            case 'slaArray':
                configJSON.soupName = SOUPINFO.workOrderSLAList;
                return configJSON;
            case 'warranty_info':
                configJSON.soupName = SOUPINFO.workOrderWarrentyInfo;
                return configJSON;
            case 'BOM':
                configJSON.soupName = SOUPINFO.workOrderBOMChart;
                return configJSON;
            case 'activities':
                configJSON.soupName = SOUPINFO.workOrderActivities;
                return configJSON;
            case 'RMA':
                configJSON.soupName = SOUPINFO.workorderRMA;
                return configJSON;
            case 'expenses':
                configJSON.soupName = SOUPINFO.workOrderExpenses;
                return configJSON;
            case 'repair_analysis':
                configJSON.soupName = SOUPINFO.workOrderRA;
                return configJSON;
            case 'quote':
                configJSON.soupName = SOUPINFO.workOrderQuote;
                return configJSON;
            case 'invoice':
                configJSON.soupName = SOUPINFO.workOrderInvoice;
                return configJSON;
            case 'appliedTerms':
                configJSON.soupName = SOUPINFO.woAppliedContractTerms;
                return configJSON;
        }
    }

})

.controller('RMAController', function($scope, $stateParams, WorkOrderService, localStorageService, $q, $ionicLoading, $timeout, DataService, SOUPINFO, $translate) {

    var singleRMA = this;
    var rmaorderId = $stateParams.rmaorderId;


    singleRMA.dontProceed = false;


    var woRMADetailsModulesList = ["RMAorder_data", "return_actions", "loaner_actions"];

    var rec_entries = localStorageService.get('maxRecords');
    if (rec_entries === null) {
        localStorageService.set('maxRecords', 20);
        rec_entries = 20;
    }

    var promise1 = WorkOrderService.getRMADetailById(rmaorderId);
    var promise2 = WorkOrderService.getRMAReturnAction(rmaorderId);
    var promise3 = WorkOrderService.getRMALoaner(rmaorderId);

    $q.all([promise1, promise2, promise3]).then(function(data) {

        singleRMA.RMA = data[0].records[0];

        singleRMA.RMAorder_data = data[0].records[0];
        singleRMA.return_actions = data[1].records;
        singleRMA.loaner_actions = data[2].records;
        $timeout(function() {
            angular.element('.item-note').show().css('color', 'black');
        }, 800);


        angular.forEach(woRMADetailsModulesList, function(module) {
            storeDataInOffline(module, rmaorderId, singleRMA);
        });


    }, function(err) {
        angular.forEach(woRMADetailsModulesList, function(module, key) {
            getDataFromOffline(module, rmaorderId);
        });

    });

    /** 
     *   Desc - Used to store the workorder data in online to be used in offline
     *   @param - type
     *   @param - rmaId
     *   @param - singleRMAObject
     */
    function storeDataInOffline(type, rmaId, singleRMAObject) {
        var configObject = getPreFilledJSONArray(type);
        var woRMADetailsArr = [];
        var woRMADetailsObj = {};
        woRMADetailsObj.Id = rmaId;
        woRMADetailsObj.data = singleRMA[type];
        woRMADetailsArr.push(woRMADetailsObj);

        DataService.setSoupData(configObject.soupName, woRMADetailsArr);
    }

    /** 
     *   Desc - Fetches data which was saved in online from soup in offline
     *   @param - type
     *   @param - rmaId
     */
    function getDataFromOffline(type, rmaId) {
        if (singleRMA.dontProceed) {
            return;
        }
        var configObject = getPreFilledJSONArray(type);

        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {

                var rmaIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == rmaId) {
                        return index;

                    }

                });


                if (rmaIdIndex.length === 0) {
                    if (singleRMA.RMA === undefined && singleRMA.dontProceed === false) {
                        singleRMA.dontProceed = true;

                        $scope.showAlertMessage($translate.instant("workorder.workorderController.noOfflineDataFound"));
                        return;
                    }
                }

                singleRMA[type] = entries.currentPageOrderedEntries[rmaIdIndex].data;

                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            }
        );

        DataService.getSoupData(SOUPINFO.offlineDataSoup).then(function(offResp) {

            if (offResp && offResp.currentPageOrderedEntries.length > 0) {
                var offlineRecord = offResp.currentPageOrderedEntries[0];
                if (offlineRecord.lock) {
                    singleActivity.isLock = offlineRecord.lock;
                }
            }
        });
    }

    /** 
     *   Desc - Fetches the soup name of the corresponding type
     *   @param - type
     */
    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'RMAorder_data':
                configJSON.soupName = SOUPINFO.WORMADetailsGeneralInfo;
                return configJSON;
            case 'return_actions':
                configJSON.soupName = SOUPINFO.WORMADetailsReturnActions;
                return configJSON;
            case 'loaner_actions':
                configJSON.soupName = SOUPINFO.WORMADetailsLoanerItems;
                return configJSON;
        }
    }
})

.controller('ReturnActionController', function($scope, $stateParams, WorkOrderService, localStorageService, $q, $ionicLoading, DataService, SOUPINFO, $translate) {

    var returnaction = this;
    var returnActionId = $stateParams.returnActionId;

    var rec_entries = localStorageService.get('maxRecords');
    if (rec_entries === null) {
        localStorageService.set('maxRecords', 20);
        rec_entries = 20;
    }

    WorkOrderService.getReturnActionDetails(returnActionId).then(function(response) {
        returnaction.ReturnOrder_data = response.records[0];
        DataService.clearSoups(SOUPINFO.rmaReturnActionDetails);
        DataService.setSoupData(SOUPINFO.rmaReturnActionDetails, response.records);

    }, function(err) {
        DataService.getSoupData(SOUPINFO.rmaReturnActionDetails, 100).then(
            function(entries) {
                returnaction.ReturnOrder_data = entries.currentPageOrderedEntries[0];
            },
            function(err) {
                returnaction.ReturnOrder_data = [];
            }
        );

    });
})

.controller('LoanerController', function($scope, $stateParams, WorkOrderService, $q, $ionicLoading, DataService, SOUPINFO, $translate) {
    var singleLoaner = this;
    var loanerId = $stateParams.loanerId;

    WorkOrderService.getLoanerDetails(loanerId).then(function(response) {

        singleLoaner.Loaner_data = response.records[0];

        //Setting soup
        DataService.clearSoups(SOUPINFO.workorderRMAloanerDetails);
        DataService.setSoupData(SOUPINFO.workorderRMAloanerDetails, response.records);

    }, function(err) {

        //fetching soup.
        DataService.getSoupData(SOUPINFO.workorderRMAloanerDetails, 100).then(
            function(entries) {
                singleLoaner.Loaner_data = entries.currentPageOrderedEntries[0];
            },
            function(err) {
                singleLoaner.Loaner_data = {};
            }
        );
    });
})

.controller('TechnicalBulletinCtrl', function($scope, $stateParams, TechnicalBulletinService, $q, $ionicLoading, DataService, SOUPINFO, $ionicHistory, NetworkService, toastr, SharedPreferencesService, $translate) {
    var tb = this;
    var workorderId = $stateParams.workorderId;
    tb.workOrderName = SharedPreferencesService.getWorkOrderName();
    tb.available = [];
    tb.applied = [];

    tb.getBulletins = function(id) {
        var deferred = $q.defer();
        var querySpec = navigator.smartstore.buildExactQuerySpec('Id', id);
        navigator.smartstore.querySoup(SOUPINFO.technicalBulletinList.Name, querySpec, function(resp) {
            // console.log('resp', resp);
            deferred.resolve(resp);
        }, function(err) {
            deferred.reject($translate.instant("workorder.workorderController.noDataFromSoup"));
        });
        return deferred.promise;
    };

    tb.getBulletins(workorderId).then(function(tbs) {
        // console.log('tbs', tbs);
        if (tbs.currentPageOrderedEntries[0].data) {
            tb.available = tbs.currentPageOrderedEntries[0].data[0].records;
            tb.applied = tbs.currentPageOrderedEntries[0].data[1].records;
            // console.log('applied', tb.applied);
        }
    });

        tb.applytb = function(tbid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.workorderController.loading" | translate}}'
            });
            var applytbdata = {
                'MedConnect__Work_Order__c': $stateParams.workorderId,
                'MedConnect__Type__c': 'Upgrade/TB',
                'Technical_Bulletin_MDSR__c': tbid
            };
            TechnicalBulletinService.applyTB(applytbdata).then(function() {
                    toastr.success($translate.instant("workorder.workorderController.tBAppliedSuccess"));
                    $ionicHistory.goBack(-1);
                },
                function(err) {
                    // console.log('err',err);
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        $scope.displayAlertMessage($translate.instant("workorder.workorderController.errCode") + err[0].errorCode + $translate.instant("workorder.workorderController.errMsg") + err[0].message);
                    } else {
                        // console.log('else');
                        navigator.notification.confirm(
                            $translate.instant("workorder.workorderController.applyTBOffline"),
                            function(buttonIndex) {
                                // console.log('else 2');
                                tb.applyTBOffline(buttonIndex, applytbdata, null);
                            },
                            $translate.instant("workorder.workorderController.medvantage"), 
                            [$translate.instant("workorder.workorderController.confirm"), $translate.instant("workorder.workorderController.cancel")]
                        );
                    }
                });
        };

        tb.applyTBOffline = function(buttonIndex, tbdata, tbid) {
            // console.log('else 3');
            if (buttonIndex === 1) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.workorderController.loading" | translate}}'
                });

            // console.log('else 4',tbdata);
            var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
            var tbName = "TB-" + randomId;
            var offlineObj = {
                "action": "New",
                "type": "WOA",
                "Name": tbName,
                "WOName": '',
                "data": tbdata,
                "randomId": randomId,
                "resync": false,
                "createdDate": new Date().getTime().toString(),
                "href": "javascript:void(0)"
            };
            // console.log('offlineObj',offlineObj);

                DataService.setOfflineSoupData(offlineObj).then(function() {
                    toastr.info($translate.instant("workorder.workorderController.tBAppliedSuccessOffline"));
                    $ionicHistory.goBack();
                });
            } else {
                $ionicHistory.goBack();
            }
        };
})
    
.controller('WOStatusCtrl', function($scope, $state, $stateParams, $ionicLoading, SharedPreferencesService, NetworkService, WorkOrderService, toastr, $ionicHistory, $translate) {

    var wostatus = this;
    var SFOAuth = cordova.require("com.salesforce.plugin.oauth");
    wostatus.woId = $stateParams.workorderId;
    wostatus.woName = SharedPreferencesService.getWorkOrderName();
    window.open = cordova.InAppBrowser.open;

    SFOAuth.getAuthCredentials(function(usr) {
        wostatus.userId = usr.userId;
    });

    wostatus.clearFields = function() {
        wostatus.username = '';
        wostatus.password = '';
        wostatus.type = '';
    };

    wostatus.changeProcessingStatus = function() {

        if (NetworkService.isDeviceOnline()) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.workorderController.loading" | translate}}'
            });
            var request = {};
            request.woId = wostatus.woId;

            WorkOrderService.processWorkOrder(request).then(function(resp) {
                console.log('1st Web Service response: ', resp);
                var response = JSON.parse(resp);
                if (response.responseCheck === "Success") {
                    $ionicLoading.hide();
                    wostatus.validateSSO(response.content);
                } else if (response.responseCheck === "ERROR") {
                    wostatus.showAlertMessage(response.content);
                }
            }, function(er) {
                console.log('Error in processing work order: ', er);
            });
        } else {
            wostatus.showAlertMessage($translate.instant("workorder.workorderController.workOrderIncompleteOffline"));
        }
    };

    wostatus.showAlertMessage = function(message) {
        $ionicLoading.hide();
        navigator.notification.alert(message, wostatus.alertDismissed, $translate.instant("workorder.workorderController.medvantage"), $translate.instant("workorder.workorderController.ok"));
    };

    wostatus.alertDismissed = function() {};

    wostatus.validateSSO = function(SSO_URL) {

        var accessToken = '';
        var ref = cordova.InAppBrowser.open(SSO_URL, "_blank", "location=no");
        ref.addEventListener('loadstart', loadStartCallBack);
        ref.addEventListener('loadstop', loadStopCallBack);
        ref.addEventListener('loaderror', loadErrorCallBack);
        ref.addEventListener('exit', loadExitCallBack);

        function loadStartCallBack(request) {

            if (typeof request.url !== undefined && request.url.includes('access_token')) {
                accessToken = request.url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
                ref.close();

                $ionicLoading.show({
                    template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.workorderController.loading" | translate}}'
                });

                var request = {};
                request.woId = wostatus.woId;
                request.userId = wostatus.userId;
                request.woStatus = wostatus.type;
                request.access_token = accessToken;
                request.woComment = wostatus.comments;

                WorkOrderService.postSSOProcessWO(request).then(function(resp) {
                    console.log('Response: ', resp);
                    var response = JSON.parse(resp);
                    if (response.responseCheck === "SUCCESS") {
                        toastr.success($translate.instant('workorder.workorderController.work-order') + ' ' + wostatus.woName + ' ' + $translate.instant('workorder.workorderController.completed-successfully'));
                        $ionicHistory.goBack();
                    } else {
                        wostatus.showAlertMessage(response.content);
                    }
                }, function(er) {
                    console.log('Error: ,', er);
                    $ionicLoading.hide();
                });
            }
        }

        function loadStopCallBack() {
            console.log('loadStopCallBack');
        }

        function loadErrorCallBack(er) {
            console.log('loadErrorCallBack: ', er);
        }

        function loadExitCallBack() {
            console.log('loadExitCallBack');
        }
    }
});
