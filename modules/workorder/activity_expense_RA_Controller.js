/* jshint -W100 */
app.controller('ActivityCtrl', ['$rootScope', '$q', '$scope', 'ActivityService', '$stateParams', '$state', '$ionicHistory', 'NetworkService', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'toastr', 'UsersService', '$ionicLoading', '$timeout', 'localStorageService', '$ionicModal', '$translate', ActivityCtrl]);
app.controller('ActivityDetailCtrl', ['$scope', 'ActivityService', '$stateParams', '$state', '$q', '$ionicPopover', 'DataService', 'SOUPINFO', '$ionicLoading', 'SharedPreferencesService', '$timeout', 'NetworkService', '$window', '$translate', ActivityDetailCtrl]);
app.controller('ExpenseCtrl', ['$rootScope', '$q', '$scope', 'ExpenseService', '$stateParams', '$state', '$ionicHistory', 'NetworkService', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'toastr', '$ionicLoading', '$timeout', '$translate', ExpenseCtrl]);
app.controller('ExpenseDetailCtrl', ['$scope', 'ExpenseService', '$stateParams', '$state', '$ionicPopover', 'DataService', 'SOUPINFO', '$ionicLoading', '$timeout', 'NetworkService', '$translate', ExpenseDetailCtrl]);
app.controller('RepairAnalysisCtrl', ['$scope', 'RepairAnalysisService', 'ActivityService', 'WorkOrderService', '$stateParams', '$state', '$q', 'SharedPreferencesService', '$ionicLoading', '$ionicHistory', '$timeout', '$ionicModal', 'toastr', 'NetworkService', 'DataService', 'SOUPINFO', '$rootScope', 'MedvantageUtils', '$translate', RepairAnalysisCtrl]);
app.controller('RepairAnalysisDetailCtrl', ['$rootScope', '$scope', 'RepairAnalysisService', '$stateParams', '$state', '$ionicPopover', '$q', '$ionicLoading', 'DataService', 'SOUPINFO', 'CameraService', '$timeout', 'SharedPreferencesService', '$ionicSlideBoxDelegate', 'NetworkService', 'toastr', '$window', '$translate', RepairAnalysisDetailCtrl]);
app.controller('CameraCtrl', ['$scope', 'RepairAnalysisService', '$stateParams', '$state', '$q', '$ionicLoading', 'CameraService', '$ionicScrollDelegate', '$timeout', 'toastr', '$ionicHistory', '$translate', CameraCtrl]);
app.controller('AnalysisCodeCtrl', ['$rootScope', '$scope', '$stateParams', '$state', '$q', '$ionicLoading', '$ionicHistory', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'RepairAnalysisService', 'NetworkService', 'toastr', '$translate', AnalysisCodeCtrl]);
app.controller('FaultCodeCtrl', ['$rootScope', '$scope', '$stateParams', '$state', '$q', '$ionicLoading', '$ionicHistory', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'RepairAnalysisService', 'NetworkService', 'toastr', '$translate', FaultCodeCtrl]);
app.controller('ChildCodeCtrl', ['$rootScope', '$scope', '$stateParams', '$state', '$q', '$ionicLoading', '$ionicHistory', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'RepairAnalysisService', 'NetworkService', 'toastr', '$translate', ChildCodeCtrl]);
app.controller('InstallAssetCtrl', ['$rootScope', '$scope', '$stateParams', 'toastr', '$state', '$q', '$ionicLoading', '$ionicHistory', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'ActivityService', 'RepairAnalysisService', 'localStorageService', '$ionicModal', 'AssetsService', 'InstallAssetService', '$filter', 'NetworkService', '$translate', InstallAssetCtrl]);
app.controller('UninstallAssetCtrl', ['$rootScope', '$scope', '$stateParams', 'toastr', '$state', '$q', '$ionicLoading', '$ionicHistory', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'ActivityService', 'RepairAnalysisService', 'localStorageService', '$ionicModal', 'AssetsService', 'InstallAssetService', '$filter', 'NetworkService', '$translate', UninstallAssetCtrl]);
// app.controller('uninstallAssetCtrl2', ['$rootScope', '$scope', '$stateParams', '$state', '$q', '$ionicLoading', '$ionicHistory', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'RepairAnalysisService', 'localStorageService', '$ionicModal', '$translate', uninstallAsset2Ctrl]);
app.controller('TestInstructionCtrl', ['$scope', 'RepairAnalysisService', '$stateParams', '$state', '$q', '$ionicLoading', '$ionicScrollDelegate', '$ionicHistory', '$timeout', '$ionicModal', '$ionicPopover', 'SharedPreferencesService', '$translate', TestInstructionCtrl]);

function ActivityCtrl($rootScope, $q, $scope, ActivityService, $stateParams, $state, $ionicHistory, NetworkService, DataService, SOUPINFO, SharedPreferencesService, toastr, UsersService, $ionicLoading, $timeout, localStorageService, $ionicModal, $translate) {
    var activity = this,
        new_act = {},
        old_act;
    activity.act = {};
    activity.activityId = $stateParams.activityId || '';
    activity.workorderId = $stateParams.workorderId || '';

    activity.showSubmitEndDate = false;
    activity.userName = localStorageService.get('userName');

    activity.act.selected_at_name = '';
    activity.act.selected_at_id = '';
    activity.act.selected_tpd_name = '';
    activity.act.selected_tpd_id = '';
    activity.no_record = '';
    activity.no_tpd_record = '';

    activity.workOrderName = SharedPreferencesService.getWorkOrderName() || '';

    activity.backToWorkOrder = function() {
        $ionicHistory.goBack();
    };

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
    });

    if (activity.activityId && activity.activityId !== '' && activity.activityId !== 'null' && activity.activityId.length === 18) {

        ActivityService.getActivityDetails(activity.activityId).then(function(act_data) {
            old_act = act_data.records[0];

            activity.act.type = old_act.MedConnect__Type__c;
            activity.act.priority = old_act.MedConnect__Priority__c;
            activity.act.status = old_act.MedConnect__Status__c;

            if (old_act.MedConnect__Start_Time__c && old_act.MedConnect__Start_Time__c.length > 4) {
                start_time_arr = old_act.MedConnect__Start_Time__c.split("+");
                activity.act.start_time = new Date(start_time_arr[0]);
            } else {
                activity.act.start_time = old_act.MedConnect__Start_Time__c;
            }
            activity.act.billable = old_act.MedConnect__Billable__c;
            activity.act.travel_time = old_act.MedConnect__Travel_Time_mins__c;
            activity.act.labor_time = old_act.MedConnect__Labor_Time_mins__c;
            activity.act.wait_time = old_act.MedConnect__Wait_Time_mins__c;
            activity.act.training_time = old_act.MedConnect__Training_Time_mins__c;
            activity.act.additional_time = old_act.MedConnect__Additional_Time_mins__c;
            activity.act.outside_time = old_act.MedConnect__Time_outside_Working_Hours_mins__c;
            activity.act.description = old_act.MedConnect__Description__c;
            activity.act.selected_at_id = old_act.Activity_Template_MDSR__c;
            activity.act.selected_tpd_id = old_act.Third_Party_Depot_MDSR__c;
            activity.act.selected_at_name = (old_act.Activity_Template_MDSR__r) ? old_act.Activity_Template_MDSR__r.Name : '';
            activity.act.selected_tpd_name = (old_act.Third_Party_Depot_MDSR__r) ? old_act.Third_Party_Depot_MDSR__r.Name : '';


            $timeout(function() {
                $ionicLoading.hide();
            }, 700);
        }, function(er) {

            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', activity.activityId);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(act) {
                if (act && act.currentPageOrderedEntries.length > 0) {

                    old_act = act.currentPageOrderedEntries[0].data;
                    activity.isLock = act.currentPageOrderedEntries[0].lock;
                    setTimeout(function() {
                        activity.act.type = old_act.MedConnect__Type__c;
                        activity.act.priority = old_act.MedConnect__Priority__c;
                        activity.act.status = old_act.MedConnect__Status__c;

                        if (old_act.MedConnect__Start_Time__c && old_act.MedConnect__Start_Time__c.length > 4) {
                            start_time_arr = old_act.MedConnect__Start_Time__c.split("+");
                            activity.act.start_time = new Date(start_time_arr[0]);
                        } else {
                            activity.act.start_time = old_act.MedConnect__Start_Time__c;
                        }
                        activity.act.billable = old_act.MedConnect__Billable__c;
                        activity.act.travel_time = parseFloat(old_act.MedConnect__Travel_Time_mins__c);
                        activity.act.labor_time = parseFloat(old_act.MedConnect__Labor_Time_mins__c);
                        activity.act.wait_time = parseFloat(old_act.MedConnect__Wait_Time_mins__c);
                        activity.act.training_time = parseFloat(old_act.MedConnect__Training_Time_mins__c);
                        activity.act.additional_time = parseFloat(old_act.MedConnect__Additional_Time_mins__c);
                        activity.act.outside_time = parseFloat(old_act.MedConnect__Time_outside_Working_Hours_mins__c);
                        activity.act.description = old_act.MedConnect__Description__c;
                        activity.act.selected_at_id = old_act.Activity_Template_MDSR__c;
                        activity.act.selected_tpd_id = old_act.Third_Party_Depot_MDSR__c;
                        activity.act.selected_at_name = act.currentPageOrderedEntries[0].ACT_TEM_NAME;
                        activity.act.selected_tpd_name = act.currentPageOrderedEntries[0].THIRD_PARTY_DEPOT_NAME;

                        $ionicLoading.hide();
                    }, 700);

                } else {

                    var querySpec = navigator.smartstore.buildExactQuerySpec('Id', activity.activityId);
                    navigator.smartstore.querySoup(SOUPINFO.WOActivitiesDetailsGeneralInfo.Name, querySpec, function(act) {
                        if (act && act.currentPageOrderedEntries.length > 0) {
                            old_act = act.currentPageOrderedEntries[0].data;
                            setTimeout(function() {
                                activity.act.type = old_act.MedConnect__Type__c;
                                activity.act.priority = old_act.MedConnect__Priority__c;
                                activity.act.status = old_act.MedConnect__Status__c;
                                if (old_act.MedConnect__Start_Time__c && old_act.MedConnect__Start_Time__c.length > 4) {
                                    start_time_arr = old_act.MedConnect__Start_Time__c.split("+");
                                    activity.act.start_time = new Date(start_time_arr[0]);
                                } else {
                                    activity.act.start_time = old_act.MedConnect__Start_Time__c;
                                }
                                activity.act.billable = old_act.MedConnect__Billable__c;
                                activity.act.travel_time = parseFloat(old_act.MedConnect__Travel_Time_mins__c);
                                activity.act.labor_time = parseFloat(old_act.MedConnect__Labor_Time_mins__c);
                                activity.act.wait_time = parseFloat(old_act.MedConnect__Wait_Time_mins__c);
                                activity.act.training_time = parseFloat(old_act.MedConnect__Training_Time_mins__c);
                                activity.act.additional_time = parseFloat(old_act.MedConnect__Additional_Time_mins__c);
                                activity.act.outside_time = parseFloat(old_act.MedConnect__Time_outside_Working_Hours_mins__c);
                                activity.act.description = old_act.MedConnect__Description__c;
                                activity.act.selected_at_id = old_act.Activity_Template_MDSR__c;
                                activity.act.selected_tpd_id = old_act.Third_Party_Depot_MDSR__c;
                                activity.act.selected_at_name = (old_act.Activity_Template_MDSR__r) ? old_act.Activity_Template_MDSR__r.Name : '';
                                activity.act.selected_tpd_name = (old_act.Third_Party_Depot_MDSR__r) ? old_act.Third_Party_Depot_MDSR__r.Name : '';

                                $ionicLoading.hide();
                            }, 700);
                        } else {
                            $ionicLoading.hide();
                        }
                    });
                }
            });
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', activity.activityId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(act) {
            if (act && act.currentPageOrderedEntries.length > 0) {

                old_act = act.currentPageOrderedEntries[0].data;
                activity.isLock = act.currentPageOrderedEntries[0].lock;
                setTimeout(function() {
                    activity.act.type = old_act.MedConnect__Type__c;
                    activity.act.priority = old_act.MedConnect__Priority__c;
                    activity.act.status = old_act.MedConnect__Status__c;

                    if (old_act.MedConnect__Start_Time__c && old_act.MedConnect__Start_Time__c.length > 4) {
                        start_time_arr = old_act.MedConnect__Start_Time__c.split("+");
                        activity.act.start_time = new Date(start_time_arr[0]);
                    } else {
                        activity.act.start_time = old_act.MedConnect__Start_Time__c;
                    }
                    activity.act.billable = old_act.MedConnect__Billable__c;
                    activity.act.travel_time = parseFloat(old_act.MedConnect__Travel_Time_mins__c);
                    activity.act.labor_time = parseFloat(old_act.MedConnect__Labor_Time_mins__c);
                    activity.act.wait_time = parseFloat(old_act.MedConnect__Wait_Time_mins__c);
                    activity.act.training_time = parseFloat(old_act.MedConnect__Training_Time_mins__c);
                    activity.act.additional_time = parseFloat(old_act.MedConnect__Additional_Time_mins__c);
                    activity.act.outside_time = parseFloat(old_act.MedConnect__Time_outside_Working_Hours_mins__c);
                    activity.act.description = old_act.MedConnect__Description__c;
                    activity.act.selected_at_id = old_act.Activity_Template_MDSR__c;
                    activity.act.selected_tpd_id = old_act.Third_Party_Depot_MDSR__c;
                    activity.act.selected_at_name = act.currentPageOrderedEntries[0].ACT_TEM_NAME;
                    activity.act.selected_tpd_name = act.currentPageOrderedEntries[0].THIRD_PARTY_DEPOT_NAME;

                    $ionicLoading.hide();
                }, 700);
            }
        });
        $ionicLoading.hide();
    }

    /** 
     *   Desc - Saves the activity
     *   @param - $form 
     *   @return none
     */

    activity.activitySave = function($form) {

        if ($form.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            new_act.MedConnect__Work_Order__c = $stateParams.workorderId;
            new_act.MedConnect__Type__c = activity.act.type || '';
            new_act.MedConnect__Priority__c = activity.act.priority || '';
            new_act.MedConnect__Status__c = activity.act.status || 'Not Started';

            if (typeof activity.act.start_time !== undefined && activity.act.start_time !== null && activity.act.start_time !== '') {
                new_act.MedConnect__Start_Time__c = activity.act.start_time.toISOString();
            }

            new_act.MedConnect__Billable__c = activity.act.billable || '';
            new_act.MedConnect__Travel_Time_mins__c = (activity.act.travel_time) ? activity.act.travel_time + '.0' : '0.0';
            new_act.MedConnect__Labor_Time_mins__c = (activity.act.labor_time) ? activity.act.labor_time + '.0' : '0.0';
            new_act.MedConnect__Wait_Time_mins__c = (activity.act.wait_time) ? activity.act.wait_time + '.0' : '0.0';
            new_act.MedConnect__Training_Time_mins__c = (activity.act.training_time) ? activity.act.training_time + '.0' : '0.0';
            new_act.MedConnect__Additional_Time_mins__c = (activity.act.additional_time) ? activity.act.additional_time + '.0' : '0.0';
            new_act.MedConnect__Time_outside_Working_Hours_mins__c = (activity.act.outside_time) ? activity.act.outside_time + '.0' : '0.0';
            new_act.MedConnect__Description__c = activity.act.description || '';
            new_act.MedConnect__Reason_For_Change__c = activity.act.change_reason || '';
            //Adding Activity template and third party depot as per FSD
            new_act.Activity_Template_MDSR__c = activity.act.selected_at_id || '';
            new_act.Third_Party_Depot_MDSR__c = activity.act.selected_tpd_id || '';

            if (activity.activityId !== 'null' && activity.activityId !== '' && activity.activityId.length === 18) {

                new_act.Id = activity.activityId;
                delete new_act.MedConnect__Work_Order__c;
                ActivityService.updateActivity(new_act).then(function(act_updated) {
                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', activity.activityId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, activity.activityId);
                        }
                    });

                    toastr.success($translate.instant("workorder.accept_expense_RA_Controller.activityModifiedSuccess"));
                    $rootScope.isSuccess = true;
                    $state.go('app.wo-activity', { "activityId": activity.activityId });
                }, function(err) {

                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        activity.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
                    } else {
                        navigator.notification.confirm(
                            $translate.instant("workorder.accept_expense_RA_Controller.editNotificationConfirm"),
                            function(buttonIndex) {
                                activity.editActivityOffline(buttonIndex, old_act, new_act, activity.activityId);
                            },
                            $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                            [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
                        );
                    }
                });

            } else {
                delete new_act.Id;
                ActivityService.createActivity(new_act).then(function(act_added) {

                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', activity.activityId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, activity.activityId);
                            $rootScope.isSuccess = true;
                            toastr.success($translate.instant("workorder.accept_expense_RA_Controller.activityCreatedSuccess"));
                            $ionicLoading.hide();
                            $ionicHistory.goBack(-2);
                        } else {
                            toastr.success($translate.instant("workorder.accept_expense_RA_Controller.activityCreatedSuccess"));
                            $ionicLoading.hide();
                            $rootScope.isSuccess = true;
                            $state.go('app.wo-activity', { "activityId": act_added.id });
                        }
                    });
                }, function(err) {

                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        activity.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
                    } else {

                        navigator.notification.confirm(
                            $translate.instant("workorder.accept_expense_RA_Controller.addNotificationConfirm"),
                            function(buttonIndex) {
                                activity.createActivityOffline(buttonIndex, new_act);
                            },
                            $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                            [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
                        );
                    }
                });
            }
        }
    };

    /** 
     *   Desc - Shows alert message
     *   @param - message
     *   @return none
     */

    activity.showAlertMessage = function(message) {
        navigator.notification.alert(message, activity.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - success callback for alert popup
     *   @param - none 
     *   @return none
     */
    activity.alertDismissed = function() {};


    /** 
     *   Desc - Creates activity in offline
     *   @param - buttonIndex
     *   @param - new_act
     *   @return none
     */

    activity.createActivityOffline = function(buttonIndex, new_act) {
        if (buttonIndex === 1) {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            var activityId = $stateParams.activityId;
            if (activityId !== '' && activityId !== 'null') {
                var offlineObj = {};
                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', activityId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                    if (resp.currentPageOrderedEntries.length > 0) {
                        var obj = resp.currentPageOrderedEntries[0];
                        offlineObj.action = obj.action;
                        offlineObj.type = obj.type;
                        offlineObj.Name = obj.Name;
                        offlineObj.WOName = obj.WOName;
                        offlineObj.ACT_TEM_NAME = activity.act.selected_at_name;
                        offlineObj.THIRD_PARTY_DEPOT_NAME = activity.act.selected_tpd_name;
                        offlineObj.object = obj.object;
                        offlineObj.data = new_act;
                        offlineObj.randomId = activityId;
                        offlineObj.resync = obj.resync;
                        offlineObj.createdDate = new Date().getTime().toString();
                        offlineObj.href = obj.href;

                        DataService.setOfflineSoupData(offlineObj).then(function() {
                            toastr.info($translate.instant("workorder.accept_expense_RA_Controller.activityModifiedSuccessOffline"));
                            $rootScope.isSuccess = true;
                            $ionicHistory.goBack();
                        });
                    }
                });
            } else {
                var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                var actName = "Act-" + randomId;
                var offlineObjData = {
                    "action": "New",
                    "type": "WOA",
                    "Name": actName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "ACT_TEM_NAME": activity.act.selected_at_name,
                    "THIRD_PARTY_DEPOT_NAME": activity.act.selected_tpd_name,
                    "object": "MedConnect__Work_Order_Activity__c",
                    "data": new_act,
                    "randomId": randomId,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/activity/" + randomId
                };

                DataService.setOfflineSoupData(offlineObjData).then(function() {
                    toastr.info($translate.instant("workorder.accept_expense_RA_Controller.activityCreatedSuccessOffline"));
                    $rootScope.isSuccess = true;
                    $ionicHistory.goBack();
                });
            }
        }
    };

    /** 
     *   Desc - Edits the activity in offline
     *   @param - buttonIndex
     *   @param - old_act
     *   @param - new_act
     *   @param - activityId 
     *   @return none
     */

    activity.editActivityOffline = function(buttonIndex, old_act, new_act, activityId) {
        if (buttonIndex === 1) {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            var promises = [];

            var offlineObj = {
                "action": "Edit",
                "type": "WOA",
                "Name": old_act.Name,
                "WOName": SharedPreferencesService.getWorkOrderName(),
                "ACT_TEM_NAME": activity.act.selected_at_name,
                "THIRD_PARTY_DEPOT_NAME": activity.act.selected_tpd_name,
                "object": 'MedConnect__Work_Order_Activity__c',
                "data": new_act,
                "randomId": activityId,
                "resync": false,
                "createdDate": new Date().getTime().toString(),
                "href": "#/app/activity/" + activityId
            };

            var querySpec = navigator.smartstore.buildExactQuerySpec('Id', activityId);
            navigator.smartstore.querySoup(SOUPINFO.WOActivitiesDetailsGeneralInfo.Name, querySpec, function(resp) {
                var rec = resp.currentPageOrderedEntries[0].data;
                rec.MedConnect__Type__c = new_act.MedConnect__Type__c;
                rec.MedConnect__Priority__c = new_act.MedConnect__Priority__c;
                rec.MedConnect__Status__c = new_act.MedConnect__Status__c;
                rec.MedConnect__Start_Time__c = new_act.MedConnect__Start_Time__c;
                rec.MedConnect__Billable__c = new_act.MedConnect__Billable__c;
                rec.MedConnect__Travel_Time_mins__c = new_act.MedConnect__Travel_Time_mins__c;
                rec.MedConnect__Labor_Time_mins__c = new_act.MedConnect__Labor_Time_mins__c;
                rec.MedConnect__Wait_Time_mins__c = new_act.MedConnect__Wait_Time_mins__c;
                rec.MedConnect__Training_Time_mins__c = new_act.MedConnect__Training_Time_mins__c;
                rec.MedConnect__Additional_Time_mins__c = new_act.MedConnect__Additional_Time_mins__c;
                rec.MedConnect__Time_outside_Working_Hours_mins__c = new_act.MedConnect__Time_outside_Working_Hours_mins__c;
                rec.MedConnect__Description__c = new_act.MedConnect__Description__c;
                rec.MedConnect__Reason_For_Change__c = new_act.change_reason || '';
                rec.Activity_Template_MDSR__c = new_act.Activity_Template_MDSR__c || '';
                rec.Third_Party_Depot_MDSR__c = new_act.Third_Party_Depot_MDSR__c || '';

                resp.currentPageOrderedEntries[0].data = rec;
                promises.push(DataService.setSoupData(SOUPINFO.WOActivitiesDetailsGeneralInfo, resp.currentPageOrderedEntries));

            }, function(er) {
                $ionicLoading.hide();
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.activityUpdatedSuccessOffline"));
                $rootScope.isSuccess = true;
                $ionicHistory.goBack();
            });
        }
    };

    activity.loadActivityTemplate = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        var querySpec = navigator.smartstore.buildExactQuerySpec('Id', SharedPreferencesService.getWorkOrderId());
        navigator.smartstore.querySoup(SOUPINFO.activityTemplateList.Name, querySpec, function(resp) {
            if (resp.currentPageOrderedEntries.length > 0) {
                activity.at = resp.currentPageOrderedEntries[0].data;
                activity.no_record = '';
            } else {
                activity.no_record = $translate.instant("workorder.accept_expense_RA_Controller.noRecordsFound");
            }

            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/wo_activity_at_lookup.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(er) {
            console.log($translate.instant("workorder.accept_expense_RA_Controller.errorRetrieveActivityTemp"), er);
        });
    };

    activity.select_the_at = function(id, name) {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        activity.act.selected_at_name = name;
        activity.act.selected_at_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    activity.loadThirdPartyDepot = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        var querySpec = navigator.smartstore.buildAllQuerySpec();
        navigator.smartstore.querySoup(SOUPINFO.thirdPartyDepotList.Name, querySpec, function(resp) {
            if (resp.currentPageOrderedEntries.length > 0) {
                activity.tpd = resp.currentPageOrderedEntries;
                activity.no_tpd_record = '';
            } else {
                activity.no_tpd_record = $translate.instant("workorder.accept_expense_RA_Controller.noRecordsFoundSyncDown");
            }

            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/wo_activity_tpd_lookup.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(er) {
            console.log($translate.instant("workorder.accept_expense_RA_Controller.errorRetrieveThirdPartyDepot"), er);
        });
    };

    activity.select_the_tpd = function(id, name) {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        activity.act.selected_tpd_name = name;
        activity.act.selected_tpd_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    $scope.closeModal = function() {

        $scope.modal.hide();
    };
}

function ActivityDetailCtrl($scope, ActivityService, $stateParams, $state, $q, $ionicPopover, DataService, SOUPINFO, $ionicLoading, SharedPreferencesService, $timeout, NetworkService, $window, $translate) {
    var singleActivity = this,
        new_act = {};
    singleActivity.dontProceed = false;
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
    });
    singleActivity.ass_id = SharedPreferencesService.getAssetId();

    var woActivityDetailsModulesList = ["activity", "assigned_tools", "repair_analysis"];
    $ionicPopover.fromTemplateUrl('modules/workorder/wo_popover_edit_activity.html', {
        scope: $scope,
    }).then(function(popover) {
        singleActivity.popover = popover;
        singleActivity.workOrderName = '';
    });
    var activity_id = $stateParams.activityId;

    /** 
     *   Desc - Checks whether the device is online or offline to navigate to assign tools page
     *   @param - none
     *   @return none
     */
    singleActivity.checkForAssignTools = function() {
        if (NetworkService.isDeviceOnline()) {
            $state.go('app.assign-wo-tool', { "activityId": activity_id });
        } else {
            $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.functionalityNotAccessibleOffline"));
        }
    };

    /** 
     *   Desc - Goes to add repair analysis page
     *   @param - none
     *   @return none
     */
    singleActivity.goToRA = function() {
        $state.go('app.add-wo-repair-analysis', { "workorderId": singleActivity.workOrderID, "RAId": null });
    };


    /** 
     *   Desc - Checks whether the device is online or offline to navigate to assign tools details page
     *   @param - assignToolId 
     *   @return none
     */
    singleActivity.checkForAssignToolsDetails = function(assignToolId) {
        if (NetworkService.isDeviceOnline()) {
            $state.go('app.assign_tool_details', { "assignToolId": assignToolId });
        } else {
            $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.functionalityNotAccessibleOffline"));
        }
    };
    if (activity_id && activity_id.length === 18) {

        var promise1 = ActivityService.getActivityDetails(activity_id);
        var promise2 = ActivityService.getAssignedTools(activity_id);
        var promise3 = ActivityService.getRA(activity_id);
        $q.all([promise1, promise2, promise3]).then(function(act) {

            singleActivity.activity = act[0].records[0];
            if (singleActivity.activity) {

                if (singleActivity.activity.MedConnect__Start_Time__c && singleActivity.activity.MedConnect__Start_Time__c.length > 4) {
                    start_time_arr = singleActivity.activity.MedConnect__Start_Time__c.split("+");
                    singleActivity.activity.start_time = new Date(start_time_arr[0]);
                } else {
                    singleActivity.activity.start_time = singleActivity.activity.MedConnect__Start_Time__c;
                }
            }

            singleActivity.workOrderID = singleActivity.activity.MedConnect__Work_Order__c;
            singleActivity.activityId = singleActivity.activity.Id;
            singleActivity.assigned_tools = act[1].records;
            singleActivity.repair_analysis = act[2].records;

            SharedPreferencesService.setWorkOrderActivity(singleActivity.activity.Name);
            SharedPreferencesService.setWorkOrderActivityId(singleActivity.activity.Id);

            angular.forEach(woActivityDetailsModulesList, function(module) {
                storeDataInOffline(module, activity_id);
            });
            $ionicLoading.hide();
            $timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
                angular.element($window).on('resize', setActivityHt);
                setActivityHt();
            }, 800);
            $timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
            }, 2800);

        }, function(err) {
            if (activity_id.length === 18) {
                angular.forEach(woActivityDetailsModulesList, function(module) {
                    getDataFromOffline(module, activity_id);
                });

                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                    angular.element($window).on('resize', setActivityHt);
                    setActivityHt();
                }, 1000);
                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 4000);
            }
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', activity_id);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            $ionicLoading.hide();

            singleActivity.activity = {};
            singleActivity.isLock = resp.currentPageOrderedEntries[0].lock;
            singleActivity.activity = resp.currentPageOrderedEntries[0].data;
            singleActivity.workOrderID = resp.currentPageOrderedEntries[0].data.MedConnect__Work_Order__c;
            singleActivity.activityId = resp.currentPageOrderedEntries[0].randomId;
            singleActivity.activity.MedConnect__Work_Order__r = {};
            singleActivity.activity.Activity_Template_MDSR__r = {};
            singleActivity.activity.Third_Party_Depot_MDSR__r = {};
            singleActivity.activity.Name = resp.currentPageOrderedEntries[0].Name;
            singleActivity.activity.MedConnect__Work_Order__r.Name = resp.currentPageOrderedEntries[0].WOName;
            singleActivity.activity.Activity_Template_MDSR__r.Name = resp.currentPageOrderedEntries[0].ACT_TEM_NAME;
            singleActivity.activity.Third_Party_Depot_MDSR__r.Name = resp.currentPageOrderedEntries[0].THIRD_PARTY_DEPOT_NAME;


            SharedPreferencesService.setWorkOrderActivity(resp.currentPageOrderedEntries[0].WOName);
            SharedPreferencesService.setWorkOrderActivityId(singleActivity.activityId);

            $timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
                angular.element($window).on('resize', setActivityHt);
                setActivityHt();
            }, 800);
        });
    }

    /** 
     *   Desc - Stores the data of the page thats been viewed in online
     *   @param - type
     *   @param - workorderId 
     *   @return none
     */

    function storeDataInOffline(type, workOrderId) {
        var configObject = getPreFilledJSONArray(type);
        var woActivityDetailsArr = [];
        var woActivityDetailsObj = {};
        woActivityDetailsObj.Id = workOrderId;
        woActivityDetailsObj.data = singleActivity[type];
        woActivityDetailsArr.push(woActivityDetailsObj);

        DataService.setSoupData(configObject.soupName, woActivityDetailsArr);
    }

    /** 
     *   Desc - Sets the height of the main content of activity details screen
     *   @param - none
     *   @return none
     */
    function setActivityHt() {
        var windowHt = $(window).outerHeight(true);
        var headerHt = $(".bar-header").outerHeight(true);
        var subNameHt = $(".activity_detail").outerHeight(true);
        var tabHt = $(".tsb-icons").outerHeight(true);
        var cntTitle = $(".cntTitle").outerHeight(true);

        var cntCtHt = windowHt - (headerHt + subNameHt + tabHt + 40);
        var cntCtTitle = windowHt - (headerHt + subNameHt + tabHt + cntTitle + 40);
        $(".scroll-height").css({ "height": cntCtHt, "overflow": "auto" });
        $(".scroll-heightCt").css({ "height": cntCtHt, "overflow": "auto" });
    }

    angular.element($window).on('resize', setActivityHt);
    setActivityHt();

    /** 
     *   Desc - clears the resize event
     *   @param - none
     *   @return none
     */
    function cleanUp() {
        angular.element($window).off('resize', setActivityHt);
    }

    $scope.$on('$destroy', cleanUp);


    /** 
     *   Desc - Fetches data which was saved in online from soup in offline
     *   @param - type
     *   @param - activityId
     *   @return none
     */
    function getDataFromOffline(type, activityId) {
        if (singleActivity.dontProceed) {
            return;
        }
        var configObject = getPreFilledJSONArray(type);

        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {

                var activityIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == activityId) {
                        return index;

                    }

                });


                if (activityIdIndex.length === 0) {
                    if (singleActivity.activity === undefined && singleActivity.dontProceed === false) {
                        singleActivity.dontProceed = true;
                        $scope.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));
                        return;
                    }
                }

                singleActivity[type] = entries.currentPageOrderedEntries[activityIdIndex].data;
                if (type == 'activity') {
                    singleActivity.workOrderID = singleActivity[type].MedConnect__Work_Order__c;
                    singleActivity.activityId = singleActivity[type].Id;

                    if (singleActivity.activity.MedConnect__Start_Time__c && singleActivity.activity.MedConnect__Start_Time__c.length > 4) {
                        start_time_arr = singleActivity.activity.MedConnect__Start_Time__c.split("+");
                        singleActivity.activity.start_time = new Date(start_time_arr[0]);
                    } else {
                        singleActivity.activity.start_time = singleActivity.activity.MedConnect__Start_Time__c;
                    }

                    SharedPreferencesService.setWorkOrderActivity(singleActivity.activity.Name);
                    SharedPreferencesService.setWorkOrderActivityId(singleActivity.activity.Id);
                }

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
     *   @return soup name
     */
    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'activity':
                configJSON.soupName = SOUPINFO.WOActivitiesDetailsGeneralInfo;
                return configJSON;
            case 'assigned_tools':
                configJSON.soupName = SOUPINFO.WOActivitiesDetailsAssignedTools;
                return configJSON;
            case 'repair_analysis':
                configJSON.soupName = SOUPINFO.WOActivitiesDetailsRepairAnalysis;
                return configJSON;
        }
    }
}

function ExpenseCtrl($rootScope, $q, $scope, ExpenseService, $stateParams, $state, $ionicHistory, NetworkService, DataService, SOUPINFO, SharedPreferencesService, toastr, $ionicLoading, $timeout, $translate) {
    var expense = this,
        new_exp = {},
        old_exp;
    expense.exp = {};
    var expenseId = $stateParams.expenseId || '';
    expense.expenseId = expenseId;

    expense.workorderId = $stateParams.workorderId || '';
    /** 
     *   Desc - navigates to previous state
     *   @param - none
     *   @return none
     */
    expense.backToWorkOrder = function() {
        $ionicHistory.goBack();
    };

    if (expenseId !== 'null' && expenseId !== '' && expenseId.length === 18) {
        ExpenseService.getExpenseDetails(expenseId).then(function(exp) {
            if (exp && exp.records.length > 0) {
                old_exp = exp.records[0];
                expense.exp.type = old_exp.MedConnect__Type__c;
                expense.exp.billable = old_exp.MedConnect__Billable__c;
                expense.exp.cost = old_exp.MedConnect__Cost__c;
                expense.exp.description = old_exp.MedConnect__Description__c;
                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 800);
            }
        }, function(er) {
            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', expenseId);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(exp) {
                if (exp && exp.currentPageOrderedEntries.length > 0) {
                    old_exp = exp.currentPageOrderedEntries[0].data;

                    expense.isLock = exp.currentPageOrderedEntries[0].lock;

                    expense.exp.type = old_exp.MedConnect__Type__c;
                    expense.exp.billable = old_exp.MedConnect__Billable__c;
                    expense.exp.cost = parseFloat(old_exp.MedConnect__Cost__c);
                    expense.exp.description = old_exp.MedConnect__Description__c;

                    $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                    }, 800);

                } else {
                    var querySpec = navigator.smartstore.buildExactQuerySpec('Id', expenseId);
                    navigator.smartstore.querySoup(SOUPINFO.WOExpenseDetails.Name, querySpec, function(exp) {
                        if (exp && exp.currentPageOrderedEntries.length > 0) {
                            old_exp = exp.currentPageOrderedEntries[0].data;

                            expense.isLock = exp.currentPageOrderedEntries[0].lock;
                            expense.exp.type = old_exp.MedConnect__Type__c;
                            expense.exp.billable = old_exp.MedConnect__Billable__c;
                            expense.exp.cost = parseFloat(old_exp.MedConnect__Cost__c);
                            expense.exp.description = old_exp.MedConnect__Description__c;
                        }

                    });

                    $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                    }, 800);
                }
            });
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', expenseId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {
                old_exp = resp.currentPageOrderedEntries[0];
                expense.isLock = old_exp.lock;
                expense.exp.type = old_exp.data.MedConnect__Type__c;
                expense.exp.billable = old_exp.data.MedConnect__Billable__c;
                expense.exp.cost = old_exp.data.MedConnect__Cost__c;
                expense.exp.description = old_exp.data.MedConnect__Description__c;

                $ionicLoading.hide();
            }
        });
    }


    /** 
     *   Desc - Saves the expense
     *   @param - $form 
     *   @return none
     */
    expense.expenseSave = function($form) {
        if ($form.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            new_exp.MedConnect__Work_Order__c = $stateParams.workorderId;
            new_exp.MedConnect__Type__c = expense.exp.type || '';
            new_exp.MedConnect__Billable__c = expense.exp.billable || false;
            new_exp.MedConnect__Cost__c = (expense.exp.cost) ? expense.exp.cost : '0.0';
            new_exp.MedConnect__Description__c = expense.exp.description || '';
            new_exp.MedConnect__Reason_For_Change__c = expense.exp.change_reason;

            if (expenseId !== '' && expenseId !== null && expenseId.length === 18) {
                new_exp.Id = expenseId;
                delete new_exp.MedConnect__Work_Order__c;
                ExpenseService.updateExpense(new_exp).then(function(exp_added) {

                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', expenseId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length !== 0) {
                            DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, expenseId);
                        }
                    });

                    toastr.success($translate.instant("workorder.accept_expense_RA_Controller.expenseUpdatedSuccess"));
                    $rootScope.isSuccess = true;
                    $state.go('app.wo-expense', { "expenseId": expenseId });
                }, function(err) {
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        expense.showAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                    } else {
                        navigator.notification.confirm(
                            $translate.instant("workorder.accept_expense_RA_Controller.editExpenseOffline"),
                            function(buttonIndex) {
                                expense.editExpenseOffline(buttonIndex, old_exp, new_exp, expenseId);
                            },
                            $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                            [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
                        );
                    }
                });
            } else {
                delete new_exp.Id;
                ExpenseService.createExpense(new_exp).then(function(exp_added_suc) {

                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', expenseId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, expenseId);
                            toastr.success($translate.instant("workorder.accept_expense_RA_Controller.expenseCreatedSuccess"));
                            $rootScope.isSuccess = true;
                            $ionicLoading.hide();
                            $ionicHistory.goBack(-2);
                        } else {
                            toastr.success($translate.instant("workorder.accept_expense_RA_Controller.expenseCreatedSuccess"));
                            $rootScope.isSuccess = true;
                            $state.go('app.wo-expense', { "expenseId": exp_added_suc.id });
                        }
                    });

                }, function(err) {
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        expense.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);

                    } else {
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', expenseId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp && resp.currentPageOrderedEntries.length > 0) {
                                navigator.notification.confirm(
                                    $translate.instant("workorder.accept_expense_RA_Controller.editExpenseOffline"),
                                    function(buttonIndex) {
                                        expense.createExpenseOffline(buttonIndex, new_exp);
                                    },
                                    $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                                    [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
                                );
                            } else {
                                navigator.notification.confirm(
                                    $translate.instant("workorder.accept_expense_RA_Controller.addExpenseOffline"),
                                    function(buttonIndex) {
                                        expense.createExpenseOffline(buttonIndex, new_exp);
                                    },
                                    $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                                    [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
                                );

                            }
                        });
                    }
                });
            }
        }
    };

    /** 
     *   Desc - Shows the alert message
     *   @param - message
     *   @return none
     */
    expense.showAlertMessage = function(message) {
        navigator.notification.alert(message, expense.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - Success callback for alert popup
     *   @param - none
     *   @return none
     */
    expense.alertDismissed = function() {};

    /** 
     *   Desc - creates expense in offline 
     *   @param - buttonIndex
     *   @param - new_exp
     *   @return none
     */
    expense.createExpenseOffline = function(buttonIndex, new_exp) {
        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            var expenseId = $stateParams.expenseId;
            if (expenseId !== '' && expenseId !== 'null') {
                var offlineObj = {};
                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', expenseId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                    if (resp.currentPageOrderedEntries.length > 0) {
                        var obj = resp.currentPageOrderedEntries[0];
                        offlineObj.action = obj.action;
                        offlineObj.type = obj.type;
                        offlineObj.Name = obj.Name;
                        offlineObj.WOName = obj.WOName;
                        offlineObj.object = obj.object;
                        offlineObj.data = new_exp;
                        offlineObj.randomId = expenseId;
                        offlineObj.resync = obj.resync;
                        offlineObj.createdDate = new Date().getTime().toString();
                        offlineObj.href = obj.href;

                        DataService.setOfflineSoupData(offlineObj).then(function() {
                            toastr.warning($translate.instant("workorder.accept_expense_RA_Controller.expenseModifiedSuccessOffline"));
                            $rootScope.isSuccess = true;
                            $ionicHistory.goBack();
                        });
                    }
                });
            } else {
                var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                var expName = "Exp-" + randomId;
                var offlineObjExp = {
                    "action": "New",
                    "type": "WOE",
                    "Name": expName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "object": 'MedConnect__Work_Order_Expense__c',
                    "data": new_exp,
                    "randomId": randomId,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/expense/" + randomId
                };

                DataService.setOfflineSoupData(offlineObjExp).then(function() {
                    toastr.info($translate.instant("workorder.accept_expense_RA_Controller.expenseCreatedSuccessOffline"));
                    $rootScope.isSuccess = true;
                    $ionicHistory.goBack();
                });
            }
        }
    };

    /** 
     *   Desc - Used for editing expense in offline
     *   @param - buttonIndex, old_exp, expenseId
     *   @return none
     */
    expense.editExpenseOffline = function(buttonIndex, old_exp, new_exp, expenseId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            var promises = [];
            var offlineObj = {
                "action": "Edit",
                "type": "WOE",
                "Name": old_exp.Name,
                "WOName": SharedPreferencesService.getWorkOrderName(),
                "object": 'MedConnect__Work_Order_Expense__c',
                "data": new_exp,
                "randomId": expenseId,
                "resync": false,
                "createdDate": new Date().getTime().toString(),
                "href": "#/app/expense/" + expenseId
            };

            var querySpec = navigator.smartstore.buildExactQuerySpec('Id', expenseId);
            navigator.smartstore.querySoup(SOUPINFO.WOExpenseDetails.Name, querySpec, function(resp) {

                if (resp && resp.currentPageOrderedEntries.length !== 0) {
                    var rec = resp.currentPageOrderedEntries[0].data;
                    rec.Id = expenseId;
                    rec.MedConnect__Billable__c = new_exp.MedConnect__Billable__c;
                    rec.MedConnect__Cost__c = new_exp.MedConnect__Cost__c;
                    rec.MedConnect__Description__c = new_exp.MedConnect__Description__c;
                    rec.MedConnect__Reason_For_Change__c = new_exp.MedConnect__Reason_For_Change__c;
                    rec.MedConnect__Type__c = new_exp.MedConnect__Type__c;

                    resp.currentPageOrderedEntries[0].data = rec;
                    promises.push(DataService.setSoupData(SOUPINFO.WOExpenseDetails, resp.currentPageOrderedEntries));

                }

            }, function(er) {
                $ionicLoading.hide();
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.expenseModifiedSuccessOffline"));
                $rootScope.isSuccess = true;
                $ionicHistory.goBack();
            });
        }
    };
}

function ExpenseDetailCtrl($scope, ExpenseService, $stateParams, $state, $ionicPopover, DataService, SOUPINFO, $ionicLoading, $timeout, NetworkService, $translate) {

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
    });
    var singleExpense = this;
    singleExpense.dontProceed = false;
    // POPOVER
    $ionicPopover.fromTemplateUrl('modules/workorder/wo_popover_edit_expense.html', {
        scope: $scope,
    }).then(function(popover) {
        singleExpense.popover = popover;
    });

    var woExpenseDetailsModulesList = ["expense"];

    var expense_id = $stateParams.expenseId;
    singleExpense.expenseId = $stateParams.expenseId;

    if (expense_id && expense_id.length === 18) {

        ExpenseService.getExpenseDetails(expense_id).then(function(exp) {
            $ionicLoading.hide();
            singleExpense.expense = exp.records[0];
            singleExpense.workOrderID = exp.records[0].MedConnect__Work_Order__c;
            angular.forEach(woExpenseDetailsModulesList, function(module) {
                storeDataInOffline(module, expense_id);
            });

            $timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
            }, 800);

        }, function(err) {
            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', expense_id);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                if (resp && resp.currentPageOrderedEntries.length > 0) {

                    singleExpense.isLock = resp.currentPageOrderedEntries[0].lock;
                    singleExpense.expense = resp.currentPageOrderedEntries[0].data;
                    singleExpense.workOrderID = resp.currentPageOrderedEntries[0].data.MedConnect__Work_Order__c;
                    singleExpense.expense.Name = resp.currentPageOrderedEntries[0].Name;
                    singleExpense.expense.MedConnect__Work_Order__r = {};
                    singleExpense.expense.MedConnect__Work_Order__r.Name = resp.currentPageOrderedEntries[0].WOName;

                    $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                    }, 800);

                    $ionicLoading.hide();
                } else {
                    angular.forEach(woExpenseDetailsModulesList, function(module) {
                        getDataFromOffline(module, expense_id);
                    });
                }
            });
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', expense_id);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {

                singleExpense.isLock = resp.currentPageOrderedEntries[0].lock;

                singleExpense.expense = resp.currentPageOrderedEntries[0].data;
                singleExpense.workOrderID = resp.currentPageOrderedEntries[0].data.MedConnect__Work_Order__c;
                singleExpense.expense.Name = resp.currentPageOrderedEntries[0].Name;
                singleExpense.expense.MedConnect__Work_Order__r = {};
                singleExpense.expense.MedConnect__Work_Order__r.Name = resp.currentPageOrderedEntries[0].WOName;

                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 800);

                $ionicLoading.hide();
            }
        });
    }

    /** 
     *   Desc - Shows the alert message
     *   @param - message
     *   @return none
     */
    singleExpense.showAlertMessage = function(message) {
        navigator.notification.alert(message, expense.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - Success callback for alert popup
     *   @param - none 
     *   @return none
     */
    singleExpense.alertDismissed = function() {};

    /** 
     *   Desc - Stores data in soup to be retrived in offline
     *   @param - type
     *   @param - expenseId 
     *   @return none
     */
    function storeDataInOffline(type, expenseId) {
        var configObject = getPreFilledJSONArray(type);
        var woExpenseDetailsArr = [];
        var woExpenseDetailsObj = {};
        woExpenseDetailsObj.Id = expenseId;
        woExpenseDetailsObj.data = singleExpense[type];
        woExpenseDetailsArr.push(woExpenseDetailsObj);
        DataService.setSoupData(configObject.soupName, woExpenseDetailsArr);
    }

    /** 
     *   Desc - Fetches data which was saved in online from soup in offline
     *   @param - type
     *   @param - expenseId
     *   @return none
     */
    function getDataFromOffline(type, expenseId) {
        if (singleExpense.dontProceed) {
            return;
        }
        var configObject = getPreFilledJSONArray(type);

        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {

                var ExpenseIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == expenseId) {
                        return index;

                    }

                });


                if (ExpenseIdIndex.length === 0) {
                    if (singleExpense.expense === undefined && singleExpense.dontProceed === false) {
                        singleExpense.dontProceed = true;
                        $scope.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));
                        return;
                    }
                }

                singleExpense[type] = entries.currentPageOrderedEntries[ExpenseIdIndex].data;
                if (type == 'expense') {
                    singleExpense.workOrderID = singleExpense[type].MedConnect__Work_Order__c;
                }

                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 800);

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
                    singleExpense.isLock = offlineRecord.lock;
                }
            }
        });
    }

    /** 
     *   Desc - Fetches the soup name of the corresponding type
     *   @param - type
     *   @return soup name
     */
    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'expense':
                configJSON.soupName = SOUPINFO.WOExpenseDetails;
                return configJSON;
        }
    }
}

function RepairAnalysisCtrl($scope, RepairAnalysisService, ActivityService, WorkOrderService, $stateParams, $state, $q, SharedPreferencesService, $ionicLoading, $ionicHistory, $timeout, $ionicModal, toastr, NetworkService, DataService, SOUPINFO, $rootScope, MedvantageUtils, $translate) {

    var RA = this,
        new_ra = {},
        old_ra = {};
    RA.data = {};
    RA.child = {};
    RA.selectedActivity = '';
    RA.raId = $stateParams.RAId || '';
    RA.workorderId = $stateParams.workorderId || '';

    /** 
     *   Desc - Displays a lookup of activities
     *   @param - none
     *   @return none
     */
    RA.showActivities = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        DataService.getSoupData(SOUPINFO.workOrderActivities, 50).then(
            function(entries) {

                if (entries.currentPageOrderedEntries.length > 0) {
                    angular.forEach(entries.currentPageOrderedEntries, function(act, index) {
                        if (act.Id === RA.workorderId) {
                            RA.activities = act.data;
                        }
                    });
                }

                $ionicLoading.hide();
                $ionicModal.fromTemplateUrl('modules/workorder/activities_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            },
            function(err) {
                $ionicLoading.hide();
                RA.activities = [];
            }
        );
    };

    /** 
     *   Desc - Sets the activity selected in activity lookup
     *   @param - none
     *   @return none
     */
    RA.select_the_activity = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        RA.selected_activity_name = name;
        RA.selected_activity_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };
    $scope.clearsearchactivity = function() {
        // console.log('123');
        RA.searchactivity = '';
    };
    /** 
     *   Desc - Closes the modal popup
     *   @param - none
     *   @return none
     */
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    if ($rootScope.showActivity) {
        RA.selected_activity_name = SharedPreferencesService.getWorkOrderActivity();
        RA.selected_activity_id = SharedPreferencesService.getWorkOrderActivityId();
    } else {
        RA.selected_activity_name = '';
        RA.selected_activity_id = '';
    }

    RA.workOrderName = {};
    RA.workOrderName.Name = SharedPreferencesService.getWorkOrderName();

    if (RA.workorderId && RA.workorderId !== 'null' && RA.workorderId !== '') {
        WorkOrderService.getWorkOrderNameById(RA.workorderId).then(function(wo) {
            RA.workOrderName = wo.records[0];
        });
        ActivityService.getActivity(RA.workorderId).then(function(act_data) {
            RA.activities = act_data.records;
        });
    }

    /** 
     *   Desc - Navigates to the previous state
     *   @param - none
     *   @return none
     */
    RA.backToWorkOrder = function() {
        $ionicHistory.goBack();
    };

    if (RA.raId && RA.raId !== '' && RA.raId !== 'null' && RA.raId.length == 18) {

        RepairAnalysisService.getRepairAnalysisDetails(RA.raId).then(function(ra_data) {
            $ionicLoading.hide();
            old_ra = ra_data.records[0];
            RA.selected_activity_id = old_ra.MedConnect__Activity__c;
            RA.selected_activity_name = (old_ra.MedConnect__Activity__r) ? old_ra.MedConnect__Activity__r.Name : '';
            RA.data.comments = old_ra.MedConnect__Comments__c;
            RA.data.action = old_ra.MedConnect__Action__c;
            RA.data.status = old_ra.MedConnect__Status__c;

            ActivityService.getActivityDetailsName(RA.selected_activity_id).then(function(act_data) {
                    RA.selectedActivity = act_data.records[0];
                    DataService.setSoupData(SOUPINFO.woRAActivityDetails, act_data.records);
                    $ionicLoading.hide();
                },
                function(err) {
                    $ionicLoading.hide();
                    RA.selectedActivity = {};
                });

            $timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
            }, 800);

            // angular.forEach(woRADetailsModulesList, function(module) {
            //     storeDataInOffline(module, RA.raId);
            // });

        }, function(err) {

            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', RA.raId);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                if (resp && resp.currentPageOrderedEntries.length > 0) {

                    old_ra = resp.currentPageOrderedEntries[0].data;
                    RA.selected_activity_id = (typeof old_ra.MedConnect__Activity__c != 'undefined') ? old_ra.MedConnect__Activity__c : '';
                    RA.selected_activity_name = (old_ra.MedConnect__Activity__r) ? old_ra.MedConnect__Activity__r.Name : '';
                    RA.data.comments = old_ra.MedConnect__Comments__c;
                    RA.data.action = old_ra.MedConnect__Action__c;
                    RA.data.status = old_ra.MedConnect__Status__c;

                    $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                    }, 800);

                    $ionicLoading.hide();
                } else {
                    var querySpec = navigator.smartstore.buildExactQuerySpec('Id', RA.raId);
                    navigator.smartstore.querySoup(SOUPINFO.woRADetails.Name, querySpec, function(resp) {
                        if (resp && resp.currentPageOrderedEntries.length > 0) {
                            old_ra = resp.currentPageOrderedEntries[0].data;
                            setTimeout(function() {
                                RA.selected_activity_id = (typeof old_ra.MedConnect__Activity__c != 'undefined') ? old_ra.MedConnect__Activity__c : '';
                                RA.selected_activity_name = (old_ra.MedConnect__Activity__r) ? old_ra.MedConnect__Activity__r.Name : '';
                                RA.data.comments = old_ra.MedConnect__Comments__c;
                                RA.data.action = old_ra.MedConnect__Action__c;
                                RA.data.status = old_ra.MedConnect__Status__c;

                                $timeout(function() {
                                    angular.element('.item-note').show().css('color', 'black');
                                }, 800);

                                $ionicLoading.hide();
                            }, 300);
                        } else {
                            $ionicLoading.hide();
                        }
                    });

                }
            });
        });

    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', RA.raId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {

                old_ra = resp.currentPageOrderedEntries[0].data;

                RA.selected_activity_id = (typeof old_ra.MedConnect__Activity__c != 'undefined') ? old_ra.MedConnect__Activity__c : '';
                RA.selected_activity_name = (old_ra.MedConnect__Activity__r) ? old_ra.MedConnect__Activity__r.Name : '';
                RA.data.comments = old_ra.MedConnect__Comments__c;
                RA.data.action = old_ra.MedConnect__Action__c;
                RA.data.status = old_ra.MedConnect__Status__c;

                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 800);

                $ionicLoading.hide();
            }
        });
    }

    /** 
     *   Desc - Saves the repair analysis 
     *   @param - $form
     *   @return none
     */
    RA.RASave = function($form) {
        if ($form.$valid) {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            new_ra.MedConnect__Work_Order__c = $stateParams.workorderId;
            new_ra.MedConnect__Status__c = RA.data.status || '';
            new_ra.MedConnect__Action__c = RA.data.action || '';
            new_ra.MedConnect__Comments__c = RA.data.comments || '';
            new_ra.MedConnect__Activity__c = (RA.selected_activity_id !== '') ? RA.selected_activity_id : old_ra.MedConnect__Activity__c;
            new_ra.MedConnect__Reason_For_Change__c = RA.data.change_reason || '';

            if (RA.selected_activity_name.length === 0) {
                new_ra.MedConnect__Activity__c = '';
            }
            if (RA.raId && RA.raId != 'null' && RA.raId.length === 18) {
                new_ra.Id = RA.raId;
                delete new_ra.MedConnect__Work_Order__c;

                RepairAnalysisService.updateRA(new_ra).then(function(ra_updated) {

                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', RA.raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length !== 0) {
                            DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, expenseId);
                        }
                    });


                    $ionicLoading.hide();
                    toastr.success($translate.instant("workorder.accept_expense_RA_Controller.rAModifiedSuccess"));
                    var ass_id = SharedPreferencesService.getAssetId();
                    $state.go('app.wo-repair-analysis', { "repair_analysisId": RA.raId, "assetId": ass_id });
                }, function(err) {
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        RA.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
                    } else {

                        navigator.notification.confirm(
                            $translate.instant("workorder.accept_expense_RA_Controller.editRAOffline"),
                            function(buttonIndex) {
                                RA.editRAOffline(buttonIndex, old_ra, new_ra, RA.raId);
                            },
                            $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                            [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
                        );
                    }
                });

            } else {
                delete new_ra.Id;
                RepairAnalysisService.createRA(new_ra).then(function(ra_added) {

                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', RA.raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, RA.raId);
                            toastr.success($translate.instant("workorder.accept_expense_RA_Controller.rACreatedSuccess"));
                            $rootScope.isSuccess = true;
                            $ionicLoading.hide();
                            $ionicHistory.goBack(-2);
                        } else {
                            $ionicLoading.hide();
                            toastr.success($translate.instant("workorder.accept_expense_RA_Controller.rACreatedSuccess"));
                            var ass_id = SharedPreferencesService.getAssetId();
                            $state.go('app.wo-repair-analysis', { "repair_analysisId": ra_added.id, "assetId": ass_id });
                        }
                    });

                }, function(err) {
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        RA.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
                    } else {
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', RA.raId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp && resp.currentPageOrderedEntries.length > 0) {
                                navigator.notification.confirm(
                                    $translate.instant("workorder.accept_expense_RA_Controller.editRAOffline"),
                                    function(buttonIndex) {
                                        RA.createRAOffline(buttonIndex, new_ra);
                                    },
                                    $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                                    [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
                                );
                            } else {
                                navigator.notification.confirm(
                                    $translate.instant("workorder.accept_expense_RA_Controller.addRAOffline"),
                                    function(buttonIndex) {
                                        RA.createRAOffline(buttonIndex, new_ra);
                                    },
                                    $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                                    [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
                                );

                            }
                        });

                    }
                });
            }

        }
    };

    RA.showAlertMessage = function(message) {
        navigator.notification.alert(message, RA.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    RA.alertDismissed = function() {};

    /** 
     *   Desc - Creates repair analysis in offline mode
     *   @param - buttonIndex
     *   @param - new_ra
     *   @return none
     */
    RA.createRAOffline = function(buttonIndex, new_ra) {
        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            var raId = $stateParams.RAId;
            if (raId !== '' && raId !== 'null') {
                var offlineObj = {};
                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', raId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                    if (resp.currentPageOrderedEntries.length > 0) {
                        var obj = resp.currentPageOrderedEntries[0];

                        offlineObj.action = obj.action;
                        offlineObj.type = obj.type;
                        offlineObj.Name = obj.Name;
                        offlineObj.WOName = obj.WOName;
                        offlineObj.object = obj.object;
                        offlineObj.data = new_ra;
                        offlineObj.randomId = raId;
                        offlineObj.resync = obj.resync;
                        offlineObj.createdDate = new Date().getTime().toString();
                        offlineObj.href = obj.href;

                        DataService.setOfflineSoupData(offlineObj).then(function() {
                            toastr.info($translate.instant("workorder.accept_expense_RA_Controller.rAModifiedSuccessOffline"));
                            $rootScope.isSuccess = true;
                            $ionicHistory.goBack();
                        });
                    }
                });
            } else {
                var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                var reqData = RA.getRequestPayload(new_ra, randomId);
                var raName = "RA-" + randomId;
                var offlineData = {
                    "action": "New",
                    "type": "RA",
                    "Name": raName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "ActivityName": SharedPreferencesService.getWorkOrderActivity(),
                    "data": new_ra,
                    "randomId": randomId,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/repair-analysis/" + randomId + "/" + SharedPreferencesService.getAssetId()
                };

                DataService.setOfflineSoupData(offlineData).then(function() {
                    toastr.info($translate.instant("workorder.accept_expense_RA_Controller.rACreatedSuccessOffline"));
                    $rootScope.isSuccess = true;
                    $ionicHistory.goBack();
                });
            }

        }
    };

    /** 
     *   Desc - Used for editing the repair analysis in offline mode
     *   @param - buttonIndex, old_ra, new_ra, raId
     *   @return none
     */
    RA.editRAOffline = function(buttonIndex, old_ra, new_ra, raId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            var promises = [];
            var offlineObj = {
                "action": "Edit",
                "type": "RA",
                "Name": old_ra.Name,
                "WOName": SharedPreferencesService.getWorkOrderName(),
                "ActivityName": SharedPreferencesService.getWorkOrderActivity(),
                "object": 'MedConnect__Repair_Analysis__c',
                "data": new_ra,
                "randomId": raId,
                "resync": false,
                "createdDate": new Date().getTime().toString(),
                "href": "#/app/repair-analysis/" + raId + "/" + SharedPreferencesService.getAssetId()
            };

            var querySpec = navigator.smartstore.buildExactQuerySpec('Id', raId);
            navigator.smartstore.querySoup(SOUPINFO.woRADetails.Name, querySpec, function(resp) {

                $ionicLoading.hide();
                if (resp && resp.currentPageOrderedEntries.length !== 0) {
                    var rec = resp.currentPageOrderedEntries[0].data;
                    rec.Id = raId;
                    rec.MedConnect__Work_Order__c = new_ra.MedConnect__Work_Order__c || '';
                    rec.MedConnect__Status__c = new_ra.MedConnect__Status__c || '';
                    rec.MedConnect__Action__c = new_ra.MedConnect__Action__c || '';
                    rec.MedConnect__Comments__c = new_ra.MedConnect__Comments__c || '';
                    rec.MedConnect__Activity__c = new_ra.MedConnect__Activity__c || '';
                    rec.MedConnect__Reason_For_Change__c = new_ra.MedConnect__Reason_For_Change__c || '';

                    promises.push(DataService.setSoupData(SOUPINFO.woRADetails, resp.currentPageOrderedEntries));

                }

            }, function(er) {
                $ionicLoading.hide();
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.rAModifiedSuccessOffline"));
                $rootScope.isSuccess = true;
                $ionicHistory.goBack();
            });
        }
    };

    /** 
     *   Desc - Gets the repair analysis request payload 
     *   @param - reqData
     *   @param - offlineId
     *   @return soup name
     */
    RA.getRequestPayload = function(reqData, offlineId) {

        var key = '',
            reqJSON = {},
            recordsArray = [],
            recordJSON = {},
            raKeys = ['Status__c', 'Activity__c', 'Action__c', 'Work_Order__c', 'Comments__c'],
            serverInstance = MedvantageUtils.getMedSQlServerInstance();

        if (serverInstance === null || serverInstance === '') {
            serverInstance = 'MedConnect__';
        }

        angular.forEach(raKeys, function(item) {
            key = serverInstance + item;

            if (reqData.hasOwnProperty(key) && reqData[key] !== "") {
                recordJSON[key] = reqData[key];
            }
        });

        recordsArray.push(recordJSON);
        reqJSON.records = recordsArray;

        return reqJSON;
    };

}

function RepairAnalysisDetailCtrl($rootScope, $scope, RepairAnalysisService, $stateParams, $state, $ionicPopover, $q, $ionicLoading, DataService, SOUPINFO, CameraService, $timeout, SharedPreferencesService, $ionicSlideBoxDelegate, NetworkService, toastr, $window, $translate) {

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
    });
    var singleRA = this;
    singleRA.ra_id = $stateParams.repair_analysisId;
    singleRA.asset_id = $stateParams.assetId;
    singleRA.repair_analysis = {};

    SharedPreferencesService.setRepairAnalysisId($stateParams.repair_analysisId);

    singleRA.showAlertMessage = function(message) {
        navigator.notification.alert(message, singleRA.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    singleRA.alertDismissed = function() {};

    woRADetailsModulesList = ["repair_analysis", "faultCodes", "analysisCodes", "HierarchyHeader", "Attachments", "HierarchyItems"];
    singleRA.dontProceed = false;

    /** 
     *   Desc - Stores data in soup to be retrived in offline
     *   @param - type
     *   @param - ra_id 
     *   @return none
     */
    function storeDataInOffline(type, ra_id) {
        var configObject = getPreFilledJSONArray(type);
        var woRADetailsArr = [];
        var woRADetailsObj = {};
        woRADetailsObj.Id = ra_id;
        woRADetailsObj.data = singleRA[type];
        woRADetailsArr.push(woRADetailsObj);
        DataService.setSoupData(configObject.soupName, woRADetailsArr);
    }

    /** 
     *   Desc - Fetches data which was saved in online from soup in offline
     *   @param - type
     *   @param - ra_id
     *   @return none
     */
    function getDataFromOffline(type, ra_id) {
        if (singleRA.dontProceed) {
            return;
        }
        var configObject = getPreFilledJSONArray(type);
        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {

                var RAIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == ra_id) {
                        return index;

                    }

                });


                if (RAIdIndex.length === 0) {
                    if (singleRA.repair_analysis === undefined && singleRA.dontProceed === false) {
                        singleRA.dontProceed = true;
                        $scope.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));
                        return;
                    }
                }

                singleRA[type] = entries.currentPageOrderedEntries[RAIdIndex].data;
                if (type == 'repair_analysis') {
                    SharedPreferencesService.setWorkOrderProduct(singleRA[type].MedConnect__Part_Name_Product__c);
                }

                if (type == 'faultCodes') {
                    var tempFault = [];
                    angular.forEach(singleRA[type], function(value, index) {
                        tempFault.push(value.MedConnect__Code__c);
                    });

                    SharedPreferencesService.setFaultCode(tempFault);

                    angular.forEach($rootScope.faultCodeArr, function (value, index) {
                        angular.forEach(singleRA[type], function (val, ind) {
                            if (val.Id == value) {
                                singleRA[type].splice(ind, 1);
                            }
                        });
                    });
                }

                if (type == 'analysisCodes') {

                    var tempAnalysis = [];
                    angular.forEach(singleRA[type], function(value, index) {
                        tempAnalysis.push(value.MedConnect__Code__c);
                    });

                    SharedPreferencesService.setAnalysisCode(tempAnalysis);

                    angular.forEach($rootScope.anaCodeArr, function(value, index) {
                        angular.forEach(singleRA[type], function(val, ind) {
                            if (val.Id == value) {
                                singleRA[type].splice(ind, 1);
                            }
                        });
                    });
                }

                if (type == 'HierarchyItems') {
                    singleRA.configureBOMChart();
                }
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }

    /** 
     *   Desc - Fetches the soup name of the corresponding type
     *   @param - type
     *   @return soup name
     */

    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'repair_analysis':
                configJSON.soupName = SOUPINFO.woRADetails;
                return configJSON;
            case 'analysisCodes':
                configJSON.soupName = SOUPINFO.woAnalysisCodes;
                return configJSON;
            case 'faultCodes':
                configJSON.soupName = SOUPINFO.woFaultCodes;
                return configJSON;
            case 'HierarchyHeader':
                configJSON.soupName = SOUPINFO.RAHierarchyHeader;
                return configJSON;
            case 'HierarchyItems':
                configJSON.soupName = SOUPINFO.RAHierarchyItems;
                return configJSON;
            case 'Attachments':
                configJSON.soupName = SOUPINFO.RAAttachments;
                return configJSON;
        }
    }

    /** 
     *   Desc - Used to upload image from either camera or gallery
     *   @param - type
     *   @return soup name
     */

    singleRA.uploadImage = function(type) {
        var camera_options = '';
        if (type === 'browseGallery') {
            camera_options = { correctOrientation: true, sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM, destinationType: Camera.DestinationType.DATA_URL };
        } else if (type === 'takePicture') {
            camera_options = { correctOrientation: true, destinationType: Camera.DestinationType.DATA_URL };
        }

        CameraService.getPicture(camera_options).then(function(img) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });
            var imageData = { ParentId: singleRA.ra_id, Body: img, Name: 'Image', ContentType: 'image/png' };
            RepairAnalysisService.addImage(imageData).then(function() {
                $state.reload();
            }, function(err) {
                $ionicLoading.hide();
            });

        }, function(err) {
            $ionicLoading.hide();
        });
    };

    // POPOVER
    $ionicPopover.fromTemplateUrl('modules/workorder/wo_popover_edit_repairAnalysis.html', {
        scope: $scope,
    }).then(function(popover) {
        singleRA.popover = popover;
    });

    /** 
     *   Desc - Checks for the network availability to go to test instruction
     *   @param - none
     *   @return none
     */

    singleRA.goToTest = function() {
        if (NetworkService.isDeviceOnline()) {
            $state.go('app.add-testinstruction', { "RAId": singleRA.ra_id });
        } else {
            $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.functionalityNotAccessibleOffline"));
        }
    };

    /** 
     *   Desc - Checks for the network availability to go to uninstall asset
     *   @param - none
     *   @return none
     */
    singleRA.goToUninstall = function() {
        if (NetworkService.isDeviceOnline()) {
            $state.go('app.uninstall-asset', { 'RAId': singleRA.ra_id });
        } else {
            $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.functionalityNotAccessibleOffline"));
        }
    };

    singleRA.goToUpdateAsset = function() {
        if (NetworkService.isDeviceOnline()) {
            $state.go('app.updateassetlist', { 'assetId': singleRA.repair_analysis.MedConnect__Parent_WO_Asset__c, 'workOrderId': singleRA.repair_analysis.MedConnect__Work_Order__c });
        } else {
            $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.functionalityNotAccessibleOffline"));
        }
    };

    /** 
     *   Desc - Checks for the network availability to go to test install asset
     *   @param - none
     *   @return none
     */
    singleRA.goToInstall = function() {
        if (NetworkService.isDeviceOnline()) {
            $state.go('app.install-asset', { 'RAId': singleRA.ra_id });
        } else {
            $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.functionalityNotAccessibleOffline"));
        }
    };

    /** 
     *   Desc - Clears the resize event for page height
     *   @param - none
     *   @return none
     */
    function cleanUp() {
        angular.element($window).off('resize', setPageHeight);
    }

    /** 
     *   Desc - Draws the hierarchial google chart
     *   @param - none
     *   @return none
     */
    function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('string', 'Manager');
        data.addColumn('string', 'ToolTip');

        var base_arr = [];
        var codes_head = '';
        if (typeof singleRA.HierarchyHeader.MedConnect__Product_Description__c !== undefined && singleRA.HierarchyHeader.MedConnect__Product_Description__c !== null) {
            if (codes_head.length > 0) {
                codes_head += ', ';
            }

            codes_head += "Description: " + singleRA.HierarchyHeader.MedConnect__Product_Description__c;
        }

        if (typeof singleRA.HierarchyHeader.MedConnect__Revision_Level__c !== undefined && singleRA.HierarchyHeader.MedConnect__Revision_Level__c !== null) {
            if (codes_head.length > 0) {
                codes_head += ', ';
            }

            codes_head += "Revision Level: " + singleRA.HierarchyHeader.MedConnect__Revision_Level__c;
        }

        if (typeof singleRA.HierarchyHeader.MedConnect__Inspection_Cost__c !== undefined && singleRA.HierarchyHeader.MedConnect__Inspection_Cost__c !== null) {
            if (codes_head.length > 0) {
                codes_head += ', ';
            }

            codes_head += "Inspection Cost: " + singleRA.HierarchyHeader.MedConnect__Inspection_Cost__c;
        }


        base_arr[0] = [{ v: codes_head }, '', ''];
        for (var i = 0; i < singleRA.HierarchyItems.length; i++) {
            var codes_item = 'Item: ' + singleRA.HierarchyItems[i].Name + ', Type: ' + singleRA.HierarchyItems[i].MedConnect__Make_Or_Buy__c;
            base_arr.push([codes_item, codes_head, '']);
        }

        data.addRows(base_arr);
        // Create the chart.
        var chart = new google.visualization.OrgChart(document.getElementById('Hierarchy_chart_div'));
        chart.draw(data, {
            allowHtml: true
        });
    }

    /** 
     *   Desc - Configuration settings for BOM chart
     *   @param - none
     *   @return none
     */
    singleRA.configureBOMChart = function() {

        if (singleRA.HierarchyHeader) {
            google.charts.setOnLoadCallback(drawChart);
        } else {
            singleRA.no_HierarchyStatus = true;
            singleRA.no_HierarchyMessage = $translate.instant("workorder.accept_expense_RA_Controller.noDataFound");
        }
    };
    $scope.selectedId = '';


    /** 
     *   Desc - Confirmation popup for deleting the codes
     *   @param - id
     *   @param - name
     *   @return none
     */
    singleRA.removeCode = function(id, name) {
        $scope.selectedId = id;
        navigator.notification.confirm($translate.instant("workorder.accept_expense_RA_Controller.deleteCodeConfirmation") + name + "?", function(buttonIndex) { onConfirmDeleteCode(buttonIndex); }, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.okCancel"));
    };

    /** 
     *   Desc - Success callback for confirmation delete popup
     *   @param - buttonIndex
     *   @return none
     */

    function onConfirmDeleteCode(buttonIndex) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });
            var inputForDel = { "Id": $scope.selectedId, "MedConnect__Is_Deleted__c": true };
            RepairAnalysisService.deleteCode(inputForDel).then(function(data) {
                if (singleRA.ra_id) {
                    RepairAnalysisService.getCodes(singleRA.ra_id).then(function(data) {
                        var codesArray = data.records;
                        singleRA.faultCodes = [];
                        singleRA.analysisCodes = [];
                        singleRA.faultAssignedCodes = [];
                        singleRA.analysisAssignedCodes = [];

                        for (var i = 0; i < codesArray.length; i++) {
                            var split = '';
                            if (codesArray[i].MedConnect__Code__r !== null) {
                                split = codesArray[i].MedConnect__Code__r.RecordType.Name;
                            }
                            if (split == 'Analysis Code') {
                                singleRA.analysisCodes.push(codesArray[i]);
                                singleRA.analysisAssignedCodes.push(codesArray[i].MedConnect__Code__c);
                            } else if (split == 'Fault Code') {
                                singleRA.faultCodes.push(codesArray[i]);
                                singleRA.faultAssignedCodes.push(codesArray[i].MedConnect__Code__c);
                            }
                        }

                        SharedPreferencesService.setAnalysisCode(singleRA.analysisAssignedCodes);
                        SharedPreferencesService.setFaultCode(singleRA.faultAssignedCodes);
                        $ionicLoading.hide();

                    }, function(err) {
                        $ionicLoading.hide();
                    });
                }
            }, function(err) {
                $ionicLoading.hide();
                if (NetworkService.isDeviceOnline()) {
                    $ionicLoading.hide();
                    singleRA.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
                } else {
    
                    var raId = SharedPreferencesService.getRepairAnalysisId();
                    var name = "DeleteCode-" + raId;
                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {

                            var objData = resp.currentPageOrderedEntries[0].data;

                            var req_obj = {};
                            req_obj.Id = raId;
                            req_obj.MedConnect__Comments__c = objData.MedConnect__Comments__c || '';
                            req_obj.MedConnect__Reason_For_Change__c = objData.MedConnect__Reason_For_Change__c || '';
                            req_obj.Code_Assignment = objData.Code_Assignment || [];
                            req_obj.Code_Assignment.push({
                                "MedConnect__Code_Assignment__c": $scope.selectedId
                            });

                            var offlineObj = {};
                            var obj = resp.currentPageOrderedEntries[0];
                            offlineObj.action = obj.action;
                            offlineObj.type = obj.type;
                            offlineObj.Name = obj.Name;
                            offlineObj.WOName = obj.WOName;
                            offlineObj.object = obj.object;
                            offlineObj.data = req_obj;
                            offlineObj.randomId = raId;
                            offlineObj.resync = obj.resync;
                            offlineObj.createdDate = new Date().getTime().toString();
                            offlineObj.href = obj.href;


                            DataService.setOfflineSoupData(offlineObj).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesDeletedOfflineSuccess"));
                                angular.forEach(singleRA.analysisCodes, function(value, index) {
                                    if (value.Id == $scope.selectedId) {
                                        singleRA.analysisCodes.splice(index, 1);
                                        $rootScope.anaCodeArr.push($scope.selectedId);
                                    }
                                });

                                angular.forEach(singleRA.faultCodes, function(value, index) {
                                    if (value.Id == $scope.selectedId) {
                                        singleRA.faultCodes.splice(index, 1);
                                        $rootScope.faultCodeArr.push($scope.selectedId);
                                    }
                                });
                            });
                        } else {

                            var inputParam = {};
                            inputParam.Code_Assignment = [{
                                "MedConnect__Code_Assignment__c": $scope.selectedId
                            }];
                            inputParam.Id = raId;
                            var name = "Delete-" + raId;
                            var offlineObject = {
                                "action": "New",
                                "type": "RA",
                                "Name": name,
                                "WOName": SharedPreferencesService.getWorkOrderName(),
                                "object": 'MedConnect__Code_Assignment__c',
                                "data": inputParam,
                                "randomId": raId,
                                "resync": false,
                                "createdDate": new Date().getTime().toString()
                            };

                            DataService.setOfflineSoupData(offlineObject).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesDeletedOfflineSuccess"));
                                angular.forEach(singleRA.analysisCodes, function(value, index) {
                                    if (value.Id == $scope.selectedId) {
                                        singleRA.analysisCodes.splice(index, 1);
                                        $rootScope.anaCodeArr.push($scope.selectedId);
                                    }
                                });

                                angular.forEach(singleRA.faultCodes, function(value, index) {
                                    if (value.Id == $scope.selectedId) {
                                        singleRA.faultCodes.splice(index, 1);
                                        $rootScope.faultCodeArr.push($scope.selectedId);
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }

    }

    if (singleRA.ra_id && singleRA.ra_id.length === 18) {

        var promise1 = RepairAnalysisService.getRepairAnalysisDetails(singleRA.ra_id);
        var promise2 = RepairAnalysisService.getCodes(singleRA.ra_id);
        var promise3 = RepairAnalysisService.getHierarchyHeader(singleRA.asset_id);
        var promise4 = RepairAnalysisService.getHierarchyItems(singleRA.asset_id);
        var promise5 = RepairAnalysisService.getAttachments(singleRA.ra_id);
        var promise6 = RepairAnalysisService.getTestInstructions(singleRA.ra_id);
        var promise7 = RepairAnalysisService.getTestInstructionTemplate(singleRA.ra_id);

        $q.all([promise1, promise2, promise3, promise4, promise5, promise6, promise7]).then(function(data) {
            singleRA.workOrderID = data[0].records[0].MedConnect__Work_Order__c;
            SharedPreferencesService.setWorkOrderProduct(data[0].records[0].MedConnect__Part_Name_Product__c);
            SharedPreferencesService.setRAName(data[0].records[0].Name);
            SharedPreferencesService.setWorkOrderAsset(data[0].records[0].MedConnect__Work_Order__r.MedConnect__Asset__c);
            console.log('ra', data[0].records[0]);
            singleRA.repair_analysis = data[0].records[0];
            singleRA.HierarchyHeader = data[2].records[0];
            singleRA.HierarchyItems = data[3].records;
            singleRA.Attachments = data[4].records[0].Attachments;
            singleRA.TestIntruction = data[5].records;
            singleRA.TestIntructionTemplate = data[6];

            $timeout(function() {
                singleRA.configureBOMChart();
                angular.element('.item-note').show().css('color', 'black');
                setPageHeight();
            }, 800);

            angular.element($window).on('resize', setPageHeight);

            function cleanUp() {
                angular.element($window).off('resize', setPageHeight);
            }

            $scope.$on('$destroy', cleanUp);

            //Analysis & Fault Logics below
            var codesArray = data[1].records;
            singleRA.faultCodes = [];
            singleRA.analysisCodes = [];
            singleRA.faultAssignedCodes = [];
            singleRA.analysisAssignedCodes = [];

            for (var i = 0; i < codesArray.length; i++) {
                var split = '';
                if (codesArray[i].MedConnect__Code__r !== null) {
                    split = codesArray[i].MedConnect__Code__r.RecordType.Name;
                }

                if (split == 'Analysis Code') {
                    singleRA.analysisCodes.push(codesArray[i]);
                    singleRA.analysisAssignedCodes.push(codesArray[i].MedConnect__Code__c);
                } else if (split == 'Fault Code') {
                    singleRA.faultCodes.push(codesArray[i]);
                    singleRA.faultAssignedCodes.push(codesArray[i].MedConnect__Code__c);
                }
            }

            SharedPreferencesService.setAnalysisCode(singleRA.analysisAssignedCodes);
            SharedPreferencesService.setFaultCode(singleRA.faultAssignedCodes);

            $rootScope.faultCodeArr = [];
            $rootScope.anaCodeArr = [];

            angular.forEach(woRADetailsModulesList, function(module) {
                storeDataInOffline(module, singleRA.ra_id);
            });

            if (($rootScope.previousState.name === "app.analysis-code" || $rootScope.previousState.name === "app.fault-code" || $rootScope.previousState.name === "app.child-code") && $rootScope.isSuccess === true) {
                $rootScope.isSuccess = false;
                $ionicSlideBoxDelegate.slide(1);
            }

            $ionicLoading.hide();
        }, function(err) {
            if (singleRA.ra_id.length === 18) {
                angular.forEach(woRADetailsModulesList, function(module) {
                    getDataFromOffline(module, singleRA.ra_id);
                });

                $timeout(function() {
                    singleRA.configureBOMChart();
                    angular.element('.item-note').show().css('color', 'black');
                    setPageHeight();
                }, 800);

                angular.element($window).on('resize', setPageHeight);

                $scope.$on('$destroy', cleanUp);

            } else {
                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', singleRA.ra_id);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {

                    var offlineData = resp.currentPageOrderedEntries[0];

                    singleRA.workOrderID = offlineData.data.MedConnect__Work_Order__c;
                    SharedPreferencesService.setWorkOrderProduct(offlineData.data.MedConnect__Part_Name_Product__c);
                    SharedPreferencesService.setRAName(offlineData.Name);

                    singleRA.repair_analysis = offlineData.data;
                    singleRA.repair_analysis.Name = offlineData.Name;
                    singleRA.repair_analysis.MedConnect__Work_Order__r = {};
                    singleRA.repair_analysis.MedConnect__Work_Order__r.Name = offlineData.WOName;
                    singleRA.repair_analysis.MedConnect__Activity__c = offlineData.data.MedConnect__Activity__c;
                    singleRA.repair_analysis.MedConnect__Activity__r = {};
                    singleRA.repair_analysis.MedConnect__Activity__r.Name = offlineData.ActivityName;

                    singleRA.HierarchyHeader = {};
                    singleRA.HierarchyItems = [];
                    singleRA.Attachments = [];
                    singleRA.TestIntruction = [];
                    singleRA.TestIntructionTemplate = [];

                    $timeout(function() {
                        singleRA.configureBOMChart();
                        angular.element('.item-note').show().css('color', 'black');
                        setPageHeight();
                    }, 800);

                    angular.element($window).on('resize', setPageHeight);

                    function cleanUp() {
                        angular.element($window).off('resize', setPageHeight);
                    }

                    $scope.$on('$destroy', cleanUp);

                    //Analysis & Fault Logics below for Offline to be implemented HERE
                    singleRA.faultCodes = [];
                    singleRA.analysisCodes = [];
                    singleRA.faultAssignedCodes = [];
                    singleRA.analysisAssignedCodes = [];

                    SharedPreferencesService.setAnalysisCode(singleRA.analysisAssignedCodes);
                    SharedPreferencesService.setFaultCode(singleRA.faultAssignedCodes);

                    if (($rootScope.previousState.name === "app.analysis-code" || $rootScope.previousState.name === "app.fault-code" || $rootScope.previousState.name === "app.child-code") && $rootScope.isSuccess === true) {
                        $rootScope.isSuccess = false;
                        $ionicSlideBoxDelegate.slide(1);
                    }

                    $ionicLoading.hide();
                });
            }
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', singleRA.ra_id);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {

            var offlineData = resp.currentPageOrderedEntries[0];

            singleRA.workOrderID = offlineData.data.MedConnect__Work_Order__c;
            SharedPreferencesService.setWorkOrderProduct(offlineData.data.MedConnect__Part_Name_Product__c);
            SharedPreferencesService.setRAName(offlineData.Name);

            singleRA.repair_analysis = offlineData.data;
            singleRA.repair_analysis.Name = offlineData.Name;
            singleRA.repair_analysis.MedConnect__Work_Order__r = {};
            singleRA.repair_analysis.MedConnect__Work_Order__r.Name = offlineData.WOName;
            singleRA.repair_analysis.MedConnect__Activity__c = offlineData.data.MedConnect__Activity__c;
            singleRA.repair_analysis.MedConnect__Activity__r = {};
            singleRA.repair_analysis.MedConnect__Activity__r.Name = offlineData.ActivityName;

            singleRA.HierarchyHeader = {};
            singleRA.HierarchyItems = [];
            singleRA.Attachments = [];
            singleRA.TestIntruction = [];
            singleRA.TestIntructionTemplate = [];

            $timeout(function() {
                singleRA.configureBOMChart();
                angular.element('.item-note').show().css('color', 'black');
                setPageHeight();
            }, 800);

            angular.element($window).on('resize', setPageHeight);

            function cleanUp() {
                angular.element($window).off('resize', setPageHeight);
            }

            $scope.$on('$destroy', cleanUp);

            //Analysis & Fault Logics below for Offline to be implemented HERE
            singleRA.faultCodes = [];
            singleRA.analysisCodes = [];
            singleRA.faultAssignedCodes = [];
            singleRA.analysisAssignedCodes = [];

            SharedPreferencesService.setAnalysisCode(singleRA.analysisAssignedCodes);
            SharedPreferencesService.setFaultCode(singleRA.faultAssignedCodes);

            if (($rootScope.previousState.name === "app.analysis-code" || $rootScope.previousState.name === "app.fault-code" || $rootScope.previousState.name === "app.child-code") && $rootScope.isSuccess === true) {
                $rootScope.isSuccess = false;
                $ionicSlideBoxDelegate.slide(1);
            }

            $ionicLoading.hide();
        });
    }


    /** 
     *   Desc - sets the height of the reapir analysis details page
     *   @param - none
     *   @return none
     */
    function setPageHeight() {
        var windowHt = $(window).outerHeight(true);
        var headerHt = $(".bar-header").outerHeight(true);
        var subNameHt = $(".subTopHdr").outerHeight(true);
        //var subHeaderHt = $(".subtmHdr").outerHeight(true);
        var tabHt = $(".tsb-icons").outerHeight(true);
        var cntCtHt = windowHt - (headerHt + subNameHt + tabHt + 70);
        $(".scrollPtHt").css({ "height": cntCtHt, "overflow": "auto" });
    }
}

function CameraCtrl($scope, RepairAnalysisService, $stateParams, $state, $q, $ionicLoading, CameraService, $ionicScrollDelegate, $timeout, toastr, $ionicHistory, $translate) {

    $ionicLoading.hide();
    var camera = this;
    camera.parentId = $stateParams.parentId;

    /** 
     *   Desc - Submit the image captured from camera
     *   @param - none
     *   @return none
     */
    camera.submitImage = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        if (camera.attach_img !== '') {
            var imageData = { ParentId: camera.parentId, Body: camera.attach_img, Name: 'Image', ContentType: 'image/png' };
            RepairAnalysisService.addImage(imageData).then(function() {
                toastr.success($translate.instant("workorder.accept_expense_RA_Controller.imageUploadSuccess"));
                $ionicHistory.goBack();
            }, function(err) {
                $ionicLoading.hide();
            });
        } else {
            $ionicLoading.hide();
            toastr.error($translate.instant("workorder.accept_expense_RA_Controller.imageUploadFailure"));
            $timeout(function() {
                $state.reload();
            }, 900);

        }

    };

    /** 
     *   Desc - Cancels the attach operation from camera roll
     *   @param - none
     *   @return none
     */
    camera.cancelImage = function() {
        camera.attach_img = '';
        $ionicScrollDelegate.scrollTop();
    };

    /** 
     *   Desc - uploads the image either from camera or gallery
     *   @param - type
     *   @return none
     */
    camera.uploadImage = function(type) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        var camera_options = '';
        if (type === 'browseGallery') {
            camera_options = { correctOrientation: true, sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM, destinationType: Camera.DestinationType.DATA_URL };
        } else if (type === 'takePicture') {
            camera_options = { correctOrientation: true, destinationType: Camera.DestinationType.DATA_URL };
        }
        $timeout(function() {
            $ionicLoading.hide();
        });

        CameraService.getPicture(camera_options).then(function(img) {
            camera.attach_img = img;
            $ionicLoading.hide();

        }, function(err) {
            $ionicLoading.hide();
        });
    };

}

function AnalysisCodeCtrl($rootScope, $scope, $stateParams, $state, $q, $ionicLoading, $ionicHistory, DataService, SOUPINFO, SharedPreferencesService, RepairAnalysisService, NetworkService, toastr, $translate) {
    var analysisCode = this;
    analysisCode.dontProceed = false;
    var analysisCodeList = ['availableCodes', 'applicableCodes'];
    var prodCode = SharedPreferencesService.getWorkOrderProduct();
    analysisCode.isAvailableChecked = {};
    analysisCode.isApplicableChecked = {};
    analysisCode.mainArr = [];
    SharedPreferencesService.setFaultOrAnalysis('ANALYSIS');
    analysisCode.inputArr = [];
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
    });
    var codeAssignmentArr = [];
    $rootScope.backCounter = -1;

    /** 
     *   Desc - Used to navigate to previous screen
     *   @param - none
     *   @return none
     */
    analysisCode.cancelAnalysisCode = function() {
        $ionicHistory.goBack();
    };

    /** 
     *   Desc - Shows the alert popup
     *   @param - message
     *   @return none
     */
    analysisCode.showAlertMessage = function(message) {
        navigator.notification.alert(message, analysisCode.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - Success callback for alert popup
     *   @param - none
     *   @return none
     */
    analysisCode.alertDismissed = function() {};

    /** 
     *   Desc - Shows the alert popup
     *   @param - message
     *   @return none
     */
    analysisCode.showMessage = function(message) {
        navigator.notification.alert(message, analysisCode.cancelAnalysisCode, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };


    if (typeof prodCode !== undefined && null !== prodCode) {
        analysisCode.inputArr.push(RepairAnalysisService.getApplicableCodes(prodCode));
    }

    analysisCode.inputArr.push(RepairAnalysisService.getAvailableCodes());

    $q.all(analysisCode.inputArr).then(function(data) {
        var applicableCodes = [];
        var availableCodes = [];
        analysisCode.applicableCodes = [];
        analysisCode.availableCodes = [];

        if (typeof prodCode !== undefined && null !== prodCode) {
            applicableCodes = data[0].records;
            availableCodes = data[1].records;
        } else {
            applicableCodes = [];
            availableCodes = data[0].records;
        }

        angular.forEach(applicableCodes, function(value, index) {
            value.showChecked = true;
            angular.forEach(SharedPreferencesService.getAnalysisCode(), function(data, ind) {
                if (value.Id == data) {
                    value.showChecked = false;
                }
            });
            analysisCode.applicableCodes.push(value);
        });

        angular.forEach(availableCodes, function(value, index) {
            value.showChecked = true;
            angular.forEach(SharedPreferencesService.getAnalysisCode(), function(data, ind) {
                if (value.Id == data) {
                    value.showChecked = false;
                }
            });
            analysisCode.availableCodes.push(value);
        });

        angular.forEach(analysisCodeList, function(value, index) {
            storeDataInOffline(value, SharedPreferencesService.getWorkOrderProduct(), analysisCode);
        });

        $ionicLoading.hide();
    }, function(err) {
        $ionicLoading.hide();

        if (NetworkService.isDeviceOnline()) {
            $ionicLoading.hide();
            analysisCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
        } else {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });
            analysisCode.offMasterData = [];
            analysisCode.offSubData = [];
            DataService.getSoupData(SOUPINFO.masterAnalysisCodeList, 20).then(
                function (entries) {
                  analysisCode.offMasterData = entries.currentPageOrderedEntries;
                  
                  DataService.getSoupData(SOUPINFO.subCodeList, 20).then(
                    function (data) {
                        $ionicLoading.hide();
                        analysisCode.offSubData = data.currentPageOrderedEntries;
                        analysisCode.separateCodes();
                    },
                    function (err) {
                        analysisCode.offSubData = [];
                        $ionicLoading.hide();
                        analysisCode.showMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));
                    }
                  );
                },
                function (err) {
                  analysisCode.offMasterData = [];
                  $ionicLoading.hide();
                  analysisCode.showMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));

                }
            );
        }

    });

    /** 
     *   Desc - Used to separate the applicable codes and available codes
     *   @param - none
     *   @return none
     */
    analysisCode.separateCodes = function() {
        analysisCode.availableCodes = [];
        analysisCode.applicableCodes = [];
        var applicableCodes = [];
        var availableCodes = analysisCode.offMasterData;

        if (typeof prodCode !== undefined && prodCode !== null) {
            var code_c_arr = [];
            angular.forEach(analysisCode.offSubData, function (value, index) {
                if (value.MedConnect__Product__c !== null && value.MedConnect__Product__c == prodCode) {
                    code_c_arr.push(value.MedConnect__Code__c);
                }
            });

            angular.forEach(analysisCode.offMasterData, function (value, index) {
                angular.forEach(code_c_arr, function (data, ind) {
                    if (value.Id == data) {
                        applicableCodes.push(value);
                        availableCodes.splice(index, 1);
                    }
                });
            });

            angular.forEach(availableCodes, function(value, index) {
                value.showChecked = true;
                angular.forEach(SharedPreferencesService.getAnalysisCode(), function(data, ind) {
                    if (value.Id == data) {
                        value.showChecked = false;
                    }
                });
                analysisCode.availableCodes.push(value);
            });

            angular.forEach(applicableCodes, function(value, index) {
                value.showChecked = true;
                angular.forEach(SharedPreferencesService.getAnalysisCode(), function(data, ind) {
                    if (value.Id == data) {
                        value.showChecked = false;
                    }
                });
                analysisCode.applicableCodes.push(value);
            });

        } else {
            angular.forEach(analysisCode.offMasterData, function(value, index) {
                value.showChecked = true;
                angular.forEach(SharedPreferencesService.getAnalysisCode(), function(data, ind) {
                    if (value.Id == data) {
                        value.showChecked = false;
                    }
                });
                analysisCode.availableCodes.push(value);
            });
        }
    };

    /** 
     *   Desc - Used for assigning the selected analysis code
     *   @param - none
     *   @return none
     */
    analysisCode.assignAnalysisCode = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        analysisCode.mainArr = [];
        codeAssignmentArr = [];

        for (var pos in analysisCode.isApplicableChecked) {
            if (analysisCode.isApplicableChecked[pos] === true) {
                analysisCode.mainArr.push(analysisCode.applicableCodes[pos]);
            }
        }

        for (var posAvailable in analysisCode.isAvailableChecked) {
            if (analysisCode.isAvailableChecked[posAvailable] === true) {
                analysisCode.mainArr.push(analysisCode.availableCodes[posAvailable]);
            }
        }

        angular.forEach(analysisCode.mainArr, function (value, index) {
            var obj = {
                "MedConnect__Code__c": value.Id
            };
            codeAssignmentArr.push(obj);
        });

        if (analysisCode.mainArr.length > 0) {

            if (NetworkService.isDeviceOnline()) {
                angular.forEach(analysisCode.mainArr, function(value, index) {
                    var inputParam = {};
                    inputParam.MedConnect__Code__c = value.Id;
                    inputParam.MedConnect__Parent_Record_Id__c = SharedPreferencesService.getRepairAnalysisId();
                    RepairAnalysisService.assignCodes(inputParam).then(function(data) {
                        if (index === analysisCode.mainArr.length - 1) {
                            $rootScope.isSuccess = true;
                            $ionicHistory.goBack();
                        }
                    }, function(error) {
                        analysisCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + error[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + error[0].message);
                    });
                });
            } else {
                var raId = SharedPreferencesService.getRepairAnalysisId();

                if (raId.length == 18) {

                    $ionicLoading.hide();

                    var query = navigator.smartstore.buildExactQuerySpec('randomId', raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, query, function(resp) {

                        if (resp.currentPageOrderedEntries.length > 0) {
                            var objData = resp.currentPageOrderedEntries[0].data;
                            var req_obj = {};
                            req_obj.Id = raId;
                            req_obj.MedConnect__Comments__c = objData.MedConnect__Comments__c || '';
                            req_obj.MedConnect__Reason_For_Change__c = objData.MedConnect__Reason_For_Change__c || '';

                            if (typeof objData.Code_Assignment !== undefined && objData.Code_Assignment !== null) {
                                angular.forEach(objData.Code_Assignment, function(value, index) {
                                    codeAssignmentArr.push(value);
                                });
                            }

                            req_obj.Code_Assignment = codeAssignmentArr;

                            var offlineObj = {};
                            var objEntries = resp.currentPageOrderedEntries[0];
                            offlineObj.action = objEntries.action;
                            offlineObj.type = objEntries.type;
                            offlineObj.Name = objEntries.Name;
                            offlineObj.WOName = objEntries.WOName;
                            offlineObj.object = objEntries.object;
                            offlineObj.data = req_obj;
                            offlineObj.randomId = raId;
                            offlineObj.resync = objEntries.resync;
                            offlineObj.createdDate = new Date().getTime().toString();
                            offlineObj.href = objEntries.href;

                            DataService.setOfflineSoupData(offlineObj).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack();
                            });

                        } else {
                            var inputParam = {};
                            inputParam.Code_Assignment = codeAssignmentArr;
                            inputParam.Id = raId;

                            var name = "Codes-" + raId;
                            var offlineNewObj = {
                                "action": "New",
                                "type": "RA",
                                "Name": name,
                                "WOName": SharedPreferencesService.getWorkOrderName(),
                                "object": 'MedConnect__Code_Assignment__c',
                                "data": inputParam,
                                "randomId": raId,
                                "resync": false,
                                "createdDate": new Date().getTime().toString()
                            };

                            DataService.setOfflineSoupData(offlineNewObj).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack();
                            });
                        }
                    });

                } else {

                    $ionicLoading.hide();
                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            var objNewData = resp.currentPageOrderedEntries[0].data;
                            var req_obj = {};
                            req_obj.MedConnect__Status__c = objNewData.MedConnect__Status__c || '';
                            req_obj.MedConnect__Activity__c = objNewData.MedConnect__Activity__c || '';
                            req_obj.MedConnect__Action__c = objNewData.MedConnect__Action__c || '';
                            req_obj.MedConnect__Work_Order__c = objNewData.MedConnect__Work_Order__c || '';
                            req_obj.MedConnect__Comments__c = objNewData.MedConnect__Comments__c || '';
                            req_obj.Code_Assignment = codeAssignmentArr;

                            var offlineObject = {};
                            var objNew = resp.currentPageOrderedEntries[0];
                            offlineObject.action = objNew.action;
                            offlineObject.type = objNew.type;
                            offlineObject.Name = objNew.Name;
                            offlineObject.WOName = objNew.WOName;
                            offlineObject.object = objNew.object;
                            offlineObject.data = req_obj;
                            offlineObject.randomId = raId;
                            offlineObject.resync = objNew.resync;
                            offlineObject.createdDate = new Date().getTime().toString();
                            offlineObject.href = objNew.href;

                            DataService.setOfflineSoupData(offlineObject).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack();
                            });
                        }
                    });

                }
            }
        } else {
            $ionicLoading.hide();
            analysisCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.noCodeSelected"));
        }
    };

    /** 
     *   Desc - Stores data in soup to be retrived in offline
     *   @param - type
     *   @param - id
     *   @param - module 
     *   @return none
     */
    function storeDataInOffline(type, id, module) {
        var configObject = getPreFilledJSONArray(type);
        var analysisCodeArr = [];
        var analysisCodeObj = {};
        analysisCodeObj.Id = id;
        analysisCodeObj.data = module[type];
        analysisCodeArr.push(analysisCodeObj);
        DataService.setSoupData(configObject.soupName, analysisCodeArr);
    }

    /** 
     *   Desc - Fetches the soup name of the corresponding type
     *   @param - type
     *   @return soup name
     */
    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'availableCodes':
                configJSON.soupName = SOUPINFO.woAnalysisAvailCodes;
                return configJSON;
            case 'applicableCodes':
                configJSON.soupName = SOUPINFO.woAnalysisAppCodes;
                return configJSON;
        }
    }

    /** 
     *   Desc - Fetches data which was saved in online from soup in offline
     *   @param - type
     *   @param - prodId
     *   @return none
     */

    function getDataFromOffline(type, prodId) {
        if (analysisCode.dontProceed) {
            return;
        }

        var configObject = getPreFilledJSONArray(type);

        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {

                var prodIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == prodId) {
                        return index;

                    }

                });


                if (prodIndex.length === 0) {
                    if (analysisCode.applicableCodes === undefined && analysisCode.dontProceed === false) {
                        analysisCode.dontProceed = true;
                        analysisCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));
                        $ionicHistory.goBack();
                        return;
                    }
                }

                analysisCode[type] = entries.currentPageOrderedEntries[prodIndex].data;
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }
}

function FaultCodeCtrl($rootScope, $scope, $stateParams, $state, $q, $ionicLoading, $ionicHistory, DataService, SOUPINFO, SharedPreferencesService, RepairAnalysisService, NetworkService, toastr, $translate) {
    var faultCode = this;
    var faultCodeList = ['availableCodes', 'applicableCodes'];
    faultCode.dontProceed = false;
    var prodCode = SharedPreferencesService.getWorkOrderProduct();
    faultCode.isAvailableChecked = {};
    faultCode.isApplicableChecked = {};
    faultCode.mainArr = [];
    SharedPreferencesService.setFaultOrAnalysis('FAULT');
    faultCode.inputArr = [];
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
    });
    codeAssignmentArr = [];
    $rootScope.backCounter = -1;

    /** 
     *   Desc - Used to navigate to previous screen
     *   @param - none
     *   @return none
     */
    faultCode.cancelFaultCode = function() {
        $ionicHistory.goBack();
    };

    /** 
     *   Desc - Shows alert popup
     *   @param - message
     *   @return none
     */
    faultCode.showAlertMessage = function(message) {
        navigator.notification.alert(message, faultCode.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - Success callback for alert popup
     *   @param - none
     *   @return none
     */
    faultCode.alertDismissed = function() {};

    /** 
     *   Desc - Shows alert popup
     *   @param - message
     *   @return none
     */
    faultCode.showMessage = function(message) {
        navigator.notification.alert(message, faultCode.cancelFaultCode, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    if (typeof prodCode !== undefined && null !== prodCode) {
        faultCode.inputArr.push(RepairAnalysisService.getFaultApplicableCodes(prodCode));
    }

    faultCode.inputArr.push(RepairAnalysisService.getFaultAvailableCodes());


    $q.all(faultCode.inputArr).then(function(data) {
        var applicableCodes = [];
        var availableCodes = [];
        faultCode.applicableCodes = [];
        faultCode.availableCodes = [];

        if (typeof prodCode !== undefined && null !== prodCode && '' !== prodCode) {
            applicableCodes = data[0].records;
            availableCodes = data[1].records;
        } else {
            applicableCodes = [];
            availableCodes = data[0].records;
        }

        angular.forEach(applicableCodes, function(value, index) {
            value.showChecked = true;
            angular.forEach(SharedPreferencesService.getFaultCode(), function(data, ind) {
                if (value.Id == data) {
                    $rootScope.isSuccess = true;
                    value.showChecked = false;
                }
            });
            faultCode.applicableCodes.push(value);
        });

        angular.forEach(availableCodes, function(value, index) {
            value.showChecked = true;
            angular.forEach(SharedPreferencesService.getFaultCode(), function(data, ind) {
                if (value.Id == data) {
                    value.showChecked = false;
                }
            });
            faultCode.availableCodes.push(value);
        });

        angular.forEach(faultCodeList, function(value, index) {
            storeDataInOffline(value, SharedPreferencesService.getWorkOrderProduct(), faultCode);
        });

        $ionicLoading.hide();
    }, function(err) {
        $ionicLoading.hide();

        if (NetworkService.isDeviceOnline()) {
            $ionicLoading.hide();
            faultCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
        } else {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });
            faultCode.offMasterData = [];
            faultCode.offSubData = [];
            DataService.getSoupData(SOUPINFO.masterFaultCodeList, 20).then(
                function (entries) {
                  faultCode.offMasterData = entries.currentPageOrderedEntries;
                
                  DataService.getSoupData(SOUPINFO.subCodeList, 20).then(
                    function (data) {
                        $ionicLoading.hide();
                        faultCode.offSubData = data.currentPageOrderedEntries;
                        faultCode.separateCodes();
                    },
                    function (err) {
                        faultCode.offSubData = [];
                        $ionicLoading.hide();
                        faultCode.showMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));
                    }
                  );
                },
                function (err) {
                  faultCode.offMasterData = [];
                  $ionicLoading.hide();
                  faultCode.showMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));

                }
            );
        }
    });

    /** 
     *   Desc - Used to separate applicable code and available code
     *   @param - none
     *   @return none
     */
    faultCode.separateCodes = function() {
        faultCode.availableCodes = [];
        faultCode.applicableCodes = [];
        var applicableCodes = [];
        var availableCodes = faultCode.offMasterData;

        if (typeof prodCode !== undefined && prodCode !== null) {
            var code_c_arr = [];
            angular.forEach(faultCode.offSubData, function(value, index) {
                if (value.MedConnect__Product__c !== null && value.MedConnect__Product__c == prodCode) {
                    code_c_arr.push(value.MedConnect__Code__c);
                }
            });

            angular.forEach(faultCode.offMasterData, function(value, index) {
                angular.forEach(code_c_arr, function(data, ind) {
                    if (value.Id == data) {
                        applicableCodes.push(value);
                        availableCodes.splice(index, 1);
                    }
                });
            });

            angular.forEach(availableCodes, function(value, index) {
                value.showChecked = true;
                angular.forEach(SharedPreferencesService.getFaultCode(), function(data, ind) {
                    if (value.Id == data) {
                        value.showChecked = false;
                    }
                });
                faultCode.availableCodes.push(value);
            });

            angular.forEach(applicableCodes, function(value, index) {
                value.showChecked = true;
                angular.forEach(SharedPreferencesService.getFaultCode(), function(data, ind) {
                    if (value.Id == data) {
                        value.showChecked = false;
                    }
                });
                faultCode.applicableCodes.push(value);
            });

        } else {
            angular.forEach(faultCode.offMasterData, function(value, index) {
                value.showChecked = true;
                angular.forEach(SharedPreferencesService.getFaultCode(), function(data, ind) {
                    if (value.Id == data) {
                        value.showChecked = false;
                    }
                });
                faultCode.availableCodes.push(value);
            });
        }
    };

    /** 
     *   Desc - Assigns the selected fault code
     *   @param - none
     *   @return none
     */
    faultCode.assignFaultCode = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        faultCode.mainArr = [];

        for (var pos in faultCode.isApplicableChecked) {
            if (faultCode.isApplicableChecked[pos] === true) {
                faultCode.mainArr.push(faultCode.applicableCodes[pos]);
            }
        }

        for (var posAvailable in faultCode.isAvailableChecked) {
            if (faultCode.isAvailableChecked[posAvailable] === true) {
                faultCode.mainArr.push(faultCode.availableCodes[posAvailable]);
            }
        }

        angular.forEach(faultCode.mainArr, function(value, index) {
            var obj = {
                "MedConnect__Code__c": value.Id
            };
            codeAssignmentArr.push(obj);
        });

        if (faultCode.mainArr.length > 0) {

            if (NetworkService.isDeviceOnline()) {
                angular.forEach(faultCode.mainArr, function(value, index) {
                    var inputParam = {};
                    inputParam.MedConnect__Code__c = value.Id;
                    inputParam.MedConnect__Parent_Record_Id__c = SharedPreferencesService.getRepairAnalysisId();
                    RepairAnalysisService.assignCodes(inputParam).then(function(data) {
                        if (index === faultCode.mainArr.length - 1) {
                            $rootScope.isSuccess = true;
                            $ionicHistory.goBack();
                        }
                    }, function(error) {
                        faultCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + error[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + error[0].message);
                    });
                });
            } else {
                var raId = SharedPreferencesService.getRepairAnalysisId();
                if (raId.length == 18) {
                    //Update Repair Analysis
                    $ionicLoading.hide();

                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {

                        if (resp.currentPageOrderedEntries.length > 0) {

                            var obj = resp.currentPageOrderedEntries[0].data;
                            var req_obj = {};
                            req_obj.Id = raId;
                            req_obj.MedConnect__Comments__c = obj.MedConnect__Comments__c || '';
                            req_obj.MedConnect__Reason_For_Change__c = obj.MedConnect__Reason_For_Change__c || '';

                            if (typeof obj.Code_Assignment !== undefined && obj.Code_Assignment !== null) {
                                angular.forEach(obj.Code_Assignment, function(value, index) {
                                    codeAssignmentArr.push(value);
                                });
                            }

                            req_obj.Code_Assignment = codeAssignmentArr;

                            var offlineObj = {};
                            var objData = resp.currentPageOrderedEntries[0];
                            offlineObj.action = objData.action;
                            offlineObj.type = objData.type;
                            offlineObj.Name = objData.Name;
                            offlineObj.WOName = objData.WOName;
                            offlineObj.object = objData.object;
                            offlineObj.data = req_obj;
                            offlineObj.randomId = raId;
                            offlineObj.resync = objData.resync;
                            offlineObj.createdDate = new Date().getTime().toString();
                            offlineObj.href = objData.href;

                            DataService.setOfflineSoupData(offlineObj).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack();
                            });

                        } else {
                            var inputParam = {};
                            inputParam.Code_Assignment = codeAssignmentArr;
                            inputParam.Id = raId;
                            var name = "Codes-" + raId;
                            var offlineObjNew = {
                                "action": "New",
                                "type": "RA",
                                "Name": name,
                                "WOName": SharedPreferencesService.getWorkOrderName(),
                                "object": 'MedConnect__Code_Assignment__c',
                                "data": inputParam,
                                "randomId": raId,
                                "resync": false,
                                "createdDate": new Date().getTime().toString()
                            };

                            DataService.setOfflineSoupData(offlineObjNew).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack();
                            });
                        }
                    });

                } else {

                    $ionicLoading.hide();
                    var querySpecRand = navigator.smartstore.buildExactQuerySpec('randomId', raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpecRand, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            var obj = resp.currentPageOrderedEntries[0].data;
                            var req_obj = {};
                            req_obj.MedConnect__Status__c = obj.MedConnect__Status__c || '';
                            req_obj.MedConnect__Activity__c = obj.MedConnect__Activity__c || '';
                            req_obj.MedConnect__Action__c = obj.MedConnect__Action__c || '';
                            req_obj.MedConnect__Work_Order__c = obj.MedConnect__Work_Order__c || '';
                            req_obj.MedConnect__Comments__c = obj.MedConnect__Comments__c || '';
                            req_obj.Code_Assignment = codeAssignmentArr;

                            var offlineObj = {};
                            var objNew = resp.currentPageOrderedEntries[0];
                            offlineObj.action = objNew.action;
                            offlineObj.type = objNew.type;
                            offlineObj.Name = objNew.Name;
                            offlineObj.WOName = objNew.WOName;
                            offlineObj.object = objNew.object;
                            offlineObj.data = req_obj;
                            offlineObj.randomId = raId;
                            offlineObj.resync = objNew.resync;
                            offlineObj.createdDate = new Date().getTime().toString();
                            offlineObj.href = objNew.href;

                            DataService.setOfflineSoupData(offlineObj).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack();
                            });
                        }
                    });

                }
            }
        } else {
            $ionicLoading.hide();
            analysisCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.noCodeSelected"));
        }

    };

    /** 
     *   Desc - Stores data in soup to be retrived in offline
     *   @param - type
     *   @param - expenseId 
     *   @return none
     */
    function storeDataInOffline(type, id, module) {
        var configObject = getPreFilledJSONArray(type);
        var faultCodeArr = [];
        var faultCodeObj = {};
        faultCodeObj.Id = id;

        faultCodeObj.data = module[type];
        faultCodeArr.push(faultCodeObj);
        DataService.setSoupData(configObject.soupName, faultCodeArr);
    }

    /** 
     *   Desc - Fetches the soup name of the corresponding type
     *   @param - type
     *   @return soup name
     */
    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'availableCodes':
                configJSON.soupName = SOUPINFO.woFaultAvailCodes;
                return configJSON;
            case 'applicableCodes':
                configJSON.soupName = SOUPINFO.woFaultAppCodes;
                return configJSON;
        }
    }

    /** 
     *   Desc - Fetches data which was saved in online from soup in offline
     *   @param - type
     *   @param - expenseId
     *   @return none
     */
    function getDataFromOffline(type, prodId) {
        if (faultCode.dontProceed) {
            return;
        }

        var configObject = getPreFilledJSONArray(type);

        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {

                var prodIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == prodId) {
                        return index;

                    }

                });


                if (prodIndex.length === 0) {
                    if (faultCode.applicableCodes === undefined && faultCode.dontProceed === false) {
                        faultCode.dontProceed = true;
                        faultCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));
                        $ionicHistory.goBack();
                        return;
                    }
                }

                faultCode[type] = entries.currentPageOrderedEntries[prodIndex].data;
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }

}

function ChildCodeCtrl($rootScope, $scope, $stateParams, $state, $q, $ionicLoading, $ionicHistory, DataService, SOUPINFO, SharedPreferencesService, RepairAnalysisService, NetworkService, toastr, $translate) {
    childCode = this;
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
    });
    var parentId = $stateParams.parentId;
    var childCodes = [];
    childCode.codeValues = [];
    codeAssignmentArr = [];
    childCode.repairAnalysisId = SharedPreferencesService.getRepairAnalysisId();
    childCode.assetId = SharedPreferencesService.getAssetId();

    $rootScope.backCounter = $rootScope.backCounter - 1;

    var isAnalysisOrFault = SharedPreferencesService.getFaultOrAnalysis();
    var codes = [];
    if (isAnalysisOrFault == 'ANALYSIS') {
        codes = SharedPreferencesService.getAnalysisCode();
    } else if (isAnalysisOrFault == 'FAULT') {
        codes = SharedPreferencesService.getFaultCode();
    }

    /** 
     *   Desc - Shows alert popup
     *   @param - message
     *   @return soup name
     */
    childCode.showAlertMessage = function(message) {
        navigator.notification.alert(message, childCode.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - Success callback for alert popup
     *   @param - none
     *   @return none
     */
    childCode.alertDismissed = function() {};

    /** 
     *   Desc - Shows alert popup
     *   @param - message
     *   @return none
     */
    childCode.showMessage = function(message) {
        navigator.notification.alert(message, childCode.cancelChildCode, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - Used to navigate to previous state
     *   @param - none
     *   @return none
     */
    childCode.cancelChildCode = function() {
        $ionicHistory.goBack();
    };

    /** 
     *   Desc - Used to get the child codes and split it whether it is analysis or fault codes
     *   @param - parentId
     *   @return none
     */
    RepairAnalysisService.getChildCodes(parentId).then(function(data) {

        angular.forEach(data.records, function(value, index) {
            value.showChecked = true;
            angular.forEach(codes, function(data, ind) {
                if (value.Id == data) {
                    value.showChecked = false;
                }
            });
            childCode.codeValues.push(value);
        });

        $ionicLoading.hide();
    }, function(err) {

        if (NetworkService.isDeviceOnline()) {
            $ionicLoading.hide();
            childCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
        } else {
            if (isAnalysisOrFault == 'ANALYSIS') {
                DataService.getSoupData(SOUPINFO.masterAnalysisCodeList, 20).then(
                    function(entries) {
                        childCode.offMasterData = entries.currentPageOrderedEntries;
                        childCode.findChildElements();
                    },
                    function (err) {
                      childCode.offMasterData = [];
                      $ionicLoading.hide();
                      childCode.showMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));

                    }
                );
            } else if (isAnalysisOrFault == 'FAULT') {
                DataService.getSoupData(SOUPINFO.masterFaultCodeList, 20).then(
                    function(entries) {
                        childCode.offMasterData = entries.currentPageOrderedEntries;
                        childCode.findChildElements();
                    },
                    function (err) {
                      childCode.offMasterData = [];
                      $ionicLoading.hide();
                      childCode.showMessage($translate.instant("workorder.accept_expense_RA_Controller.noOfflineDataFound"));

                    }
                );
            }

        }
    });

    /** 
     *   Desc - Used to check whether code is been already selected
     *   @param - none
     *   @return none
     */

    childCode.findChildElements = function() {
        var childCodes = [];
        var bool = false;
        angular.forEach(childCode.offMasterData, function(value, index) {
            if (value.Id == parentId) {
                angular.forEach(value.MedConnect__Codes__r.records, function(value, index) {
                    value.showChecked = true;
                    angular.forEach(codes, function(data, ind) {
                        if (value.Id == data) {
                            value.showChecked = false;
                        }
                    });
                    childCode.codeValues.push(value);
                });
            }
        });

        $ionicLoading.hide();
    };

    /** 
     *   Desc - Used for assigning the selected child code  
     *   @param - none
     *   @return none
     */
    childCode.assignChildCode = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        childCode.mainArr = [];

        for (var pos in childCode.isValueChecked) {
            if (childCode.isValueChecked[pos] === true) {
                childCode.mainArr.push(childCode.codeValues[pos]);
            }
        }

        angular.forEach(childCode.mainArr, function(value, index) {
            var obj = {
                "MedConnect__Code__c": value.Id
            };
            codeAssignmentArr.push(obj);
        });

        if (childCode.mainArr.length > 0) {

            if (NetworkService.isDeviceOnline()) {
                angular.forEach(childCode.mainArr, function(value, index) {
                    var inputParam = {};
                    inputParam.MedConnect__Code__c = value.Id;
                    inputParam.MedConnect__Parent_Record_Id__c = SharedPreferencesService.getRepairAnalysisId();
                    RepairAnalysisService.assignCodes(inputParam).then(function(data) {
                        if (index === childCode.mainArr.length - 1) {
                            $rootScope.isSuccess = true;
                            $ionicHistory.goBack($rootScope.backCounter);
                        }
                    }, function(error) {
                        childCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + error[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + error[0].message);
                    });
                });
            } else {
                var raId = SharedPreferencesService.getRepairAnalysisId();
                if (raId.length == 18) {
                    $ionicLoading.hide();

                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            var obj = resp.currentPageOrderedEntries[0].data;
                            var req_obj = {};
                            req_obj.Id = raId;
                            req_obj.MedConnect__Comments__c = obj.MedConnect__Comments__c || '';
                            req_obj.MedConnect__Reason_For_Change__c = obj.MedConnect__Reason_For_Change__c || '';

                            if (typeof obj.Code_Assignment !== undefined && obj.Code_Assignment !== null) {
                                angular.forEach(obj.Code_Assignment, function(value, index) {
                                    codeAssignmentArr.push(value);
                                });
                            }

                            req_obj.Code_Assignment = codeAssignmentArr;

                            var offlineObj = {};
                            var objData = resp.currentPageOrderedEntries[0];
                            offlineObj.action = objData.action;
                            offlineObj.type = objData.type;
                            offlineObj.Name = objData.Name;
                            offlineObj.WOName = objData.WOName;
                            offlineObj.object = objData.object;
                            offlineObj.data = req_obj;
                            offlineObj.randomId = raId;
                            offlineObj.resync = objData.resync;
                            offlineObj.createdDate = new Date().getTime().toString();
                            offlineObj.href = objData.href;

                            DataService.setOfflineSoupData(offlineObj).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack($rootScope.backCounter);
                            });

                        } else {
                            var inputParam = {};
                            inputParam.Code_Assignment = codeAssignmentArr;
                            inputParam.Id = raId;
                            var name = "Codes-" + raId;
                            var offlineObjNew = {
                                "action": "New",
                                "type": "RA",
                                "Name": name,
                                "WOName": SharedPreferencesService.getWorkOrderName(),
                                "object": 'MedConnect__Code_Assignment__c',
                                "data": inputParam,
                                "randomId": raId,
                                "resync": false,
                                "createdDate": new Date().getTime().toString()
                            };

                            DataService.setOfflineSoupData(offlineObjNew).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack($rootScope.backCounter);
                            });
                        }
                    });

                } else {
                    $ionicLoading.hide();
                    var querySpecRand = navigator.smartstore.buildExactQuerySpec('randomId', raId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpecRand, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            var obj = resp.currentPageOrderedEntries[0].data;
                            var req_obj = {};
                            req_obj.MedConnect__Status__c = obj.MedConnect__Status__c || '';
                            req_obj.MedConnect__Activity__c = obj.MedConnect__Activity__c || '';
                            req_obj.MedConnect__Action__c = obj.MedConnect__Action__c || '';
                            req_obj.MedConnect__Work_Order__c = obj.MedConnect__Work_Order__c || '';
                            req_obj.MedConnect__Comments__c = obj.MedConnect__Comments__c || '';
                            req_obj.Code_Assignment = codeAssignmentArr;

                            var offlineObj = {};
                            var objNew = resp.currentPageOrderedEntries[0];
                            offlineObj.action = objNew.action;
                            offlineObj.type = objNew.type;
                            offlineObj.Name = objNew.Name;
                            offlineObj.WOName = objNew.WOName;
                            offlineObj.object = objNew.object;
                            offlineObj.data = req_obj;
                            offlineObj.randomId = raId;
                            offlineObj.resync = objNew.resync;
                            offlineObj.createdDate = new Date().getTime().toString();
                            offlineObj.href = objNew.href;

                            DataService.setOfflineSoupData(offlineObj).then(function() {
                                toastr.info($translate.instant("workorder.accept_expense_RA_Controller.codesAddOfflineSuccess"));
                                $rootScope.isSuccess = true;
                                $ionicHistory.goBack($rootScope.backCounter);
                            });
                        }
                    });

                }
            }
        } else {
            $ionicLoading.hide();
            analysisCode.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.noCodeSelected"));
        }

    };

    /** 
     *   Desc - Used to navigate to codes detail screen
     *   @param - none
     *   @return none
     */
    childCode.cancelChildCode = function() {
        $ionicHistory.goBack($rootScope.backCounter);
    };
}
// app.controller('InstallAssetCtrl', ['$rootScope', '$scope', '$stateParams', 'toastr','$state', '$q', '$ionicLoading', '$ionicHistory', 'DataService', 'SOUPINFO', 'SharedPreferencesService', 'ActivityService', 'RepairAnalysisService', 'localStorageService', '$ionicModal', ', AssetsService', InstallAssetCtrl]);
function InstallAssetCtrl($rootScope, $scope, $stateParams, toastr, $state, $q, $ionicLoading, $ionicHistory, DataService, SOUPINFO, SharedPreferencesService, ActivityService, RepairAnalysisService, localStorageService, $ionicModal, AssetsService, InstallAssetService, $filter,NetworkService,$translate) {
    var installAsset = this;

    // var rec_entries = localStorageService.get('maxRecords');
    // if (rec_entries === null) {
    //     localStorageService.set('maxRecords', 20);
    //     rec_entries = 20;
    // }

    installAsset.RAId = $stateParams.RAId;
    installAsset.formData = {};
    installAsset.formData.performed_on = new Date();
    installAsset.searchproductname = '';
    console.log('stateparams', $stateParams);
    if (installAsset.RAId) {

        InstallAssetService.getInstallAssetData(installAsset.RAId, 'Install').then(
            function(InstallData) {
                console.log('InstallData data', InstallData);
                if (InstallData)
                // installAsset.InstallData = InstallData;
                {
                    installAsset.AssetName = InstallData.asset;
                    installAsset.AssetId = InstallData.assetId;
                    installAsset.destInventory = InstallData.destinationInventoryName;
                    installAsset.destInventoryId = InstallData.destinationInventoryId;
                    installAsset.materialBOMName = InstallData.mBOM;
                    installAsset.materialBOMId = InstallData.mBOMId;
                    installAsset.formData.condition = InstallData.condition;
                }
            },
            function(err) {
                $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.retrieveDetailsFailure"));
            });

        RepairAnalysisService.getRAShortDetails(installAsset.RAId).then(
            function(RAData) {
                console.log('ra data', RAData);
                if (RAData) {
                    installAsset.RAData = RAData.records[0];
                } else {
                    $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.couldNotRetreiveDetailsTryLater"));
                }
            },
            function(err) {
                $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.retrieveDetailsFailure"));
            });

    } else {
        $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.retrieveDetailsFailure"));
        toastr.error($translate.instant("workorder.accept_expense_RA_Controller.retrieveRAFailure"));
    }

    /** 
     *   Desc - Used to load BOM
     *   @param - none
     *   @return none
     */
    installAsset.loadBOM = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        RepairAnalysisService.getInstallationBOM(SharedPreferencesService.getWorkOrderAsset()).then(function(data) {
            installAsset.BOMRecords = data.records;
            $ionicLoading.hide();

            $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_install_BOM.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        });
    };

    /** 
     *   Desc - Assigns the selected BOM from BOM lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    installAsset.fetchBOM = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.materialBOMName = name;
        installAsset.materialBOMId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Shows the inventory line items
     *   @param - none
     *   @return none
     */
    installAsset.loadInventoryLineItem = function() {

        if (installAsset.srcInventoryId && typeof installAsset.srcInventoryId !== undefined && installAsset.srcInventoryId !== null && installAsset.srcInventoryId !== '') {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            RepairAnalysisService.getInventoryLineItems(installAsset.srcInventoryId).then(function(data) {
                $ionicLoading.hide();
                installAsset.lineItemRecords = data.records;

                $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_lineitems.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });

            }, function(err) {
                $ionicLoading.hide();
                installAsset.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.fetchLIFailure"));
            });
        } else {
            installAsset.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.mandatoryLISourceInv"));
        }

    };

    /** 
     *   Desc - Assigns the selected Line Item from Line Item lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    installAsset.fetchLineItem = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.inventoryItem = name;
        installAsset.inventoryItemId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Shows the source inventory items
     *   @param - none
     *   @return none
     */
    installAsset.loadSrcInventory = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        RepairAnalysisService.getSrcInventory().then(function(data) {
            installAsset.srcInventoryRecords = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_src_inventory.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            installAsset.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.fetchSourceInvFailure"));
        });
    };

    /** 
     *   Desc - Assigns the selected source inventory item from source inventory lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    installAsset.fetchSrcInventory = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.srcInventory = name;
        installAsset.srcInventoryId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Shows the destination inventory items
     *   @param - none
     *   @return none
     */
    installAsset.loadDestInventory = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        RepairAnalysisService.getDestInventory().then(function(data) {

            installAsset.destInventoryRecords = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_dest_inventory.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            installAsset.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.fetchDestInvFailure"));
        });
    };

    /** 
     *   Desc - Assigns the destination inventory Item from destination inventory lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    installAsset.fetchDestInventory = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.destInventory = name;
        installAsset.destInventoryId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Loads the Asset List
     *   @param - none
     *   @return none
     */

    installAsset.loadAssets = function() {
        installAsset.searhAssetError = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        $ionicModal.fromTemplateUrl('modules/workorder/lookup_assets.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });

    };

    installAsset.searchAsset = function() {
        console.log('clicked');
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        if (installAsset.searchassetname != null && installAsset.searchassetname.length > 0) {
            installAsset.searhAssetError = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });
            AssetsService.getAssetsbySearch(installAsset.searchassetname).then(
                function(entries) {

                    console.log('post search', entries);
                    if (entries.records != null && entries.records.length > 0) {
                        installAsset.Assets = entries.records;
                        installAsset.no_asset = '';
                        installAsset.searhAssetError = '';
                    } else {
                        installAsset.no_asset = $translate.instant('workorder.accept_expense_RA_Controller.noRecordFound');
                        installAsset.Assets = [];
                        installAsset.searhAssetError = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage($translate.instant('workorder.accept_expense_RA_Controller.errorGettingAssets'));
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            installAsset.searhAssetError = $translate.instant('workorder.accept_expense_RA_Controller.PleaseTypeAtleast1Characters');
            installAsset.no_asset = '';
            installAsset.Assets = '';
        }


    };

    installAsset.selectAsset = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.AssetName = name;
        installAsset.AssetId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    // installAsset.load_seriailized_port = function() {
    //     $ionicLoading.show({
    //         template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    //     });
    //     if (installAsset.AssetId) {
    //         InstallAssetService.getSerializedPorts(installAsset.AssetId).then(function(data) {
    //             console.log('asset 1', data);
    //             installAsset.serialized_ports = data.records;

    //             $ionicModal.fromTemplateUrl('modules/workorder/lookup_serialized_ports.html', {
    //                 scope: $scope,
    //                 animation: 'slide-in-up',
    //             }).then(function(modal) {
    //                 $scope.modal = modal;
    //                 $scope.modal.show();
    //                 $ionicLoading.hide();
    //             });
    //         }, function(err) {
    //             installAsset.showAlertMessage('Error in getting Assets');
    //             $ionicLoading.hide();
    //         });
    //     } else {
    //         $scope.displayAlertMessage('Please select Asset');
    //         $ionicLoading.hide();
    //     }

    // };

    installAsset.load_seriailized_port = function() {
        installAsset.searhAsset2Error = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        $ionicModal.fromTemplateUrl('modules/workorder/lookup_serialized_ports.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });

    };

    installAsset.search_seriailized_port = function() {
        console.log('clicked');
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        if (installAsset.searchasset2name != null && installAsset.searchasset2name.length > 0) {
            installAsset.searhAsset2Error = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });
            AssetsService.getAssetsbySearch(installAsset.searchasset2name).then(
                function(entries) {

                    console.log('post search', entries);
                    if (entries.records != null && entries.records.length > 0) {
                        installAsset.Assets2 = entries.records;
                        installAsset.no_asset2 = '';
                        installAsset.searhAsset2Error = '';
                    } else {
                        installAsset.no_asset2 = $translate.instant("workorder.accept_expense_RA_Controller.noRecordFound");
                        installAsset.Assets2 = [];
                        installAsset.searhAsset2Error = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errorGettingAssets"));
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            installAsset.searhAsset2Error = $translate.instant("workorder.accept_expense_RA_Controller.PleaseTypeAtleast1Characters");
            installAsset.no_asset2 = '';
            installAsset.Assets2 = '';
        }


    };

    installAsset.select_seriailized_port = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.seriailized_port_name = name;
        installAsset.seriailized_port_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };


    // installAsset.selectserialized_port = function(id, name) {
    //     $ionicLoading.show({
    //         template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    //     });
    //     installAsset.seriailized_port_name = name;
    //     installAsset.seriailized_port_id = id;
    //     $scope.modal.hide();
    //     $ionicLoading.hide();
    // };

    installAsset.loadMaterialBOMItems = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        if (installAsset.materialBOMId) {
            AssetsService.getMaterialBOMItems(installAsset.materialBOMId).then(function(data) {
                console.log('MaterialBOMItems', data);
                installAsset.MaterialBOMItems = data.records;
                $ionicLoading.hide();
                $ionicModal.fromTemplateUrl('modules/workorder/lookup_materialBOMItems.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            }, function(err) {
                installAsset.showAlertMessage($translate.instant('workorder.accept_expense_RA_Controller.fetchMaterialBOMItemsFailure'));
                $ionicLoading.hide();
            });
        } else {
            $scope.displayAlertMessage($translate.instant('workorder.accept_expense_RA_Controller.pleaseSelectBOM'));
            $ionicLoading.hide();
        }

    };

    installAsset.selectMaterialBOM_item = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.materialBOM_itemName = name;
        installAsset.materialBOM_itemIdmaterialBOM_itemId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    installAsset.loadParentMaterialBOMItems = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        AssetsService.getParentMaterialBOMItems(installAsset.materialBOMId).then(function(data) {
            console.log('MaterialBOMItems', data);
            installAsset.ParentMaterialBOMItems = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/lookup_parentmaterialBOMItems.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            installAsset.showAlertMessage($translate.instant('workorder.accept_expense_RA_Controller.errorGettingParentMaterialBOM'));
            $ionicLoading.hide();
        });
    };

    installAsset.selectParentMaterialBOM_item = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.parent_materialBOM_itemName = name;
        installAsset.parent_materialBOM_itemId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    installAsset.loadLot = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        AssetsService.getLot().then(function(data) {
            console.log('loadLot', data);
            installAsset.Lots = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/lookup_lots.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            installAsset.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.fetchLotFailure"));
            $ionicLoading.hide();
        });
    };

    installAsset.selectLot = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.lotName = name;
        installAsset.lotId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    installAsset.loadProducts = function() {
        console.log('clicked');
        installAsset.searhproductError = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        $ionicModal.fromTemplateUrl('modules/workorder/lookup_products.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });
    };

    installAsset.searchProduct = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        if (installAsset.searchproductname.length > 0) {
                installAsset.searhproductError = '';
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
                });
               AssetsService.getProductsbySearch(installAsset.searchproductname).then(
                    function(entries) {

                        console.log('post search', entries);
                        if (entries.records.length > 0) {
                              installAsset.Products = entries.records;
                            installAsset.no_product = '';
                            installAsset.searhproductError = '';
                        } else {
                            installAsset.no_product = $translate.instant("workorder.accept_expense_RA_Controller.noRecordsFound");
                            installAsset.Products = [];
                            installAsset.searhproductError = '';
                        }
                        $ionicLoading.hide();
                    },
                    function(err) {
                        $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.fetchProductsFailure"));
                        $ionicLoading.hide();
                    }
                );
            } else {
                $ionicLoading.hide();
                installAsset.searhproductError = $translate.instant("workorder.accept_expense_RA_Controller.typeCharValidation");
                installAsset.no_product = '';
                installAsset.Products = '';
            }
    };

    installAsset.selectProduct = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        installAsset.productName = name;
        installAsset.productId = id;
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
    installAsset.install = function($form) {
        console.log('clicked');
        if ($form.$valid) {
            installAsset.performedOn = $filter('date')(new Date(installAsset.formData.performed_on), "MM/dd/yyyy hh:mm a");
            var inputParam = {
                "repairId": installAsset.RAData.Id,
                "destinationInventoryId": (typeof installAsset.destInventoryId != 'undefined') ? installAsset.destInventoryId : "",
                "mBOMId": (typeof installAsset.materialBOMId != 'undefined') ? installAsset.materialBOMId : "",
                "mBOMItemId": (installAsset.materialBOM_itemId) ? installAsset.materialBOM_itemId : '',
                "assetId": (installAsset.AssetId) ? installAsset.AssetId : '',
                "operation": "Install",
                "performedOn": installAsset.performedOn,
                "productId": (installAsset.productId) ? installAsset.productId : '',
                "quantity": installAsset.formData.quantity,
                "serializedId": (installAsset.seriailized_port_id) ? installAsset.seriailized_port_id : '',
                "sourceInventoryId": (installAsset.srcInventoryId) ? installAsset.srcInventoryId : '',
                "inventoryLineItemId": (installAsset.inventoryItemId) ? installAsset.inventoryItemId : '',
                "lotNumId": (installAsset.lotId) ? installAsset.lotId : '',
                "parMatBOMItemId": (installAsset.parent_materialBOM_itemId) ? installAsset.parent_materialBOM_itemId : '',
                "status": "On-Hand",
                "condition": installAsset.formData.condition,
            };
            console.log('inputParam', inputParam);
            //return;
            navigator.notification.confirm(
                $translate.instant("workorder.accept_expense_RA_Controller.doYouWantInstallAsset"),
                function(buttonIndex) {
                    if (buttonIndex == 1) {

                        $ionicLoading.show({
                            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
                        });

                        RepairAnalysisService.installUninstallSave('POST', inputParam).then(function(data) {
                            $ionicLoading.hide();
                            console.log('data', data);
                            if (data.statusMsg === 'ERROR') {
                                $scope.displayAlertMessage(data.errorMsg);
                            } else if (data.statusMsg === 'SUCCESS') {
                                  $ionicHistory.goBack();
                                toastr.success($translate.instant('workorder.accept_expense_RA_Controller.installationAssetSuccessfully"'));
                            } else {
                                installAsset.showAlertMessage(data.statusMsg +': '+data.errorMsg);
                            }

                        }, function(err) {
                            $ionicLoading.hide();
                            if (NetworkService.isDeviceOnline()) {
                                installAsset.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
                            } else {
                                $scope.displayAlertMessage($translate.instance('workorder.accept_expense_RA_Controller.functionalityNotAccessibleOffline'));
                            }

                        });
                    } else {
                        $ionicLoading.hide();
                    }
                },
                $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
            );
        }
    };

    /** 
     *   Desc - Shows the alert message
     *   @param - message
     *   @return none
     */
    installAsset.showAlertMessage = function(message) {
        navigator.notification.alert(message, installAsset.alertDismissed, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - Success callback from alert message
     *   @param - none
     *   @return none
     */
    installAsset.alertDismissed = function() {};

    /** 
     *   Desc - Shows the alert popup
     *   @param - none
     *   @return none
     */
    installAsset.showSuccessMessage = function(message) {
        navigator.notification.alert(message, installAsset.onSuccess, $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), $translate.instant("workorder.accept_expense_RA_Controller.ok"));
    };

    /** 
     *   Desc - Success callback from alert message to go back
     *   @param - none
     *   @return none
     */
    installAsset.onSuccess = function() {
        $ionicHistory.goBack();
    };

    /** 
     *   Desc - Used to navigate to previous state
     *   @param - none
     *   @return none
     */
    installAsset.backToRA = function() {
        $ionicHistory.goBack();
    };

}

function UninstallAssetCtrl($rootScope, $scope, $stateParams, toastr, $state, $q, $ionicLoading, $ionicHistory, DataService, SOUPINFO, SharedPreferencesService, ActivityService, RepairAnalysisService, localStorageService, $ionicModal, AssetsService, InstallAssetService, $filter,NetworkService,$translate) {
    var uninstallAsset = this;

    // var rec_entries = localStorageService.get('maxRecords');
    // if (rec_entries === null) {
    //     localStorageService.set('maxRecords', 20);
    //     rec_entries = 20;
    // }

    uninstallAsset.RAId = $stateParams.RAId;
    uninstallAsset.formData = {};
    uninstallAsset.formData.performed_on = new Date();
    uninstallAsset.searchproductname = '';
    console.log('stateparams', $stateParams);
    if (uninstallAsset.RAId) {

        InstallAssetService.getInstallAssetData(uninstallAsset.RAId, 'Uninstall').then(
            function(uninstallAssetData) {
                console.log('uninstallAsset data', uninstallAssetData);
                if (uninstallAssetData)
                // installAsset.InstallData = InstallData;
                {
                    uninstallAsset.AssetName = uninstallAssetData.asset;
                    uninstallAsset.AssetId = uninstallAssetData.assetId;
                    uninstallAsset.srcInventory = uninstallAssetData.sourceInventoryName;
                    uninstallAsset.srcInventoryId = uninstallAssetData.sourceInventoryId;
                    uninstallAsset.materialBOMName = uninstallAssetData.mBOM;
                    uninstallAsset.materialBOMId = uninstallAssetData.mBOMId;
                    uninstallAsset.formData.condition = uninstallAssetData.condition;
                }
            },
            function(err) {
                $scope.displayAlertMessage($translate.instant('workorder.accept_expense_RA_Controller.retrieveDetailsFailure'));
            });

        RepairAnalysisService.getRAShortDetails(uninstallAsset.RAId).then(
            function(RAData) {
                console.log('ra data', RAData);
                if (RAData) {
                    uninstallAsset.RAData = RAData.records[0];
                } else {
                    $scope.displayAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.couldNotRetreiveDetailsTryLater"));
                }
            },
            function(err) {
                $scope.displayAlertMessage($translate.instant('workorder.accept_expense_RA_Controller.retrieveDetailsFailure'));
            });

    } else {
        $scope.displayAlertMessage($translate.instant('workorder.accept_expense_RA_Controller.retrieveDetailsFailure'));
        toastr.error($translate.instant('workorder.accept_expense_RA_Controller.retrieveRAFailure'));
    }

    /**
     *   Desc - Used to load BOM
     *   @param - none
     *   @return none
     */
    uninstallAsset.loadBOM = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        RepairAnalysisService.getInstallationBOM(SharedPreferencesService.getWorkOrderAsset()).then(function(data) {
            uninstallAsset.BOMRecords = data.records;
            $ionicLoading.hide();

            $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_uninstall_BOM.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        });
    };

    /**
     *   Desc - Assigns the selected BOM from BOM lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    uninstallAsset.fetchBOM = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.materialBOMName = name;
        uninstallAsset.materialBOMId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /**
     *   Desc - Shows the inventory line items
     *   @param - none
     *   @return none
     */
    uninstallAsset.loadInventoryLineItem = function() {

        if (uninstallAsset.srcInventoryId && typeof uninstallAsset.srcInventoryId !== undefined && uninstallAsset.srcInventoryId !== null && uninstallAsset.srcInventoryId !== '') {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            RepairAnalysisService.getInventoryLineItems(uninstallAsset.srcInventoryId).then(function(data) {
                $ionicLoading.hide();
                uninstallAsset.lineItemRecords = data.records;

                $ionicModal.fromTemplateUrl('modules/workorder/lookup_lineitems_uninstall.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });

            }, function(err) {
                $ionicLoading.hide();
                uninstallAsset.showAlertMessage("Error in fetching Line Items");
            });
        } else {
            uninstallAsset.showAlertMessage("Source Inventory is mandatory for Line Items");
        }

    };

    /**
     *   Desc - Assigns the selected Line Item from Line Item lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    uninstallAsset.fetchLineItem = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.inventoryItem = name;
        uninstallAsset.inventoryItemId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /**
     *   Desc - Shows the source inventory items
     *   @param - none
     *   @return none
     */
    uninstallAsset.loadSrcInventory = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        RepairAnalysisService.getSrcInventory().then(function(data) {
            uninstallAsset.srcInventoryRecords = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/lookup_src_inv_uninstall.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            uninstallAsset.showAlertMessage('Error in getting source inventory');
        });
    };

    /**
     *   Desc - Assigns the selected source inventory item from source inventory lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    uninstallAsset.fetchSrcInventory = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.srcInventory = name;
        uninstallAsset.srcInventoryId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /**
     *   Desc - Shows the destination inventory items
     *   @param - none
     *   @return none
     */
    uninstallAsset.loadDestInventory = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        RepairAnalysisService.getDestInventory().then(function(data) {

            uninstallAsset.destInventoryRecords = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/lookup_dest_inv_uninstall.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            uninstallAsset.showAlertMessage('Error in getting destination inventory');
        });
    };

    /**
     *   Desc - Assigns the destination inventory Item from destination inventory lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    uninstallAsset.fetchDestInventory = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.destInventory = name;
        uninstallAsset.destInventoryId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };



    uninstallAsset.loadAssets = function() {
        uninstallAsset.searhAssetError = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        $ionicModal.fromTemplateUrl('modules/workorder/lookup_asset_uninstall.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });

    };

    uninstallAsset.searchAsset = function() {
        console.log('clicked');
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (uninstallAsset.searchassetname.length > 0) {
            uninstallAsset.searhAssetError = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            AssetsService.getAssetsbySearch(uninstallAsset.searchassetname).then(
                function(entries) {

                    console.log('post search', entries);
                    if (entries.records.length > 0) {
                        uninstallAsset.Assets = entries.records;
                        uninstallAsset.no_asset = '';
                        uninstallAsset.searhAssetError = '';
                    } else {
                        uninstallAsset.no_asset = 'No Record Found';
                        uninstallAsset.Assets = [];
                        uninstallAsset.searhAssetError = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage('Error in getting Assets');
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            uninstallAsset.searhAssetError = 'Please type atleast 1 characters';
            uninstallAsset.no_asset = '';
            uninstallAsset.Assets = '';
        }


    };

    uninstallAsset.selectAsset = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.AssetName = name;
        uninstallAsset.AssetId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    // uninstallAsset.load_seriailized_port = function() {
    //     $ionicLoading.show({
    //         template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    //     });
    //     if (uninstallAsset.AssetId) {
    //         InstallAssetService.getSerializedPorts(uninstallAsset.AssetId).then(function(data) {
    //             console.log('asset 1', data);
    //             uninstallAsset.serialized_ports = data.records;

    //             $ionicModal.fromTemplateUrl('modules/workorder/lookup_serialized_ports_uninstall.html', {
    //                 scope: $scope,
    //                 animation: 'slide-in-up',
    //             }).then(function(modal) {
    //                 $scope.modal = modal;
    //                 $scope.modal.show();
    //                 $ionicLoading.hide();
    //             });
    //         }, function(err) {
    //             uninstallAsset.showAlertMessage('Error in getting Assets');
    //             $ionicLoading.hide();
    //         });
    //     } else {
    //         $scope.displayAlertMessage('Please select Asset');
    //         $ionicLoading.hide();
    //     }

    // };

    // uninstallAsset.selectserialized_port = function(id, name) {
    //     $ionicLoading.show({
    //         template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    //     });
    //     uninstallAsset.seriailized_port_name = name;
    //     uninstallAsset.seriailized_port_id = id;
    //     $scope.modal.hide();
    //     $ionicLoading.hide();
    // };

     uninstallAsset.load_seriailized_port = function() {
        uninstallAsset.searhAsset2Error = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        $ionicModal.fromTemplateUrl('modules/workorder/lookup_serialized_ports_uninstall.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });

    };

    uninstallAsset.search_seriailized_port = function() {
        console.log('clicked');
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (uninstallAsset.searchasset2name != null && uninstallAsset.searchasset2name.length > 0) {
            uninstallAsset.searhAsset2Error = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            AssetsService.getAssetsbySearch(uninstallAsset.searchasset2name).then(
                function(entries) {

                    console.log('post search', entries);
                    if (entries.records != null && entries.records.length > 0) {
                        uninstallAsset.Assets2 = entries.records;
                        uninstallAsset.no_asset2 = '';
                        uninstallAsset.searhAsset2Error = '';
                    } else {
                        uninstallAsset.no_asset2 = 'No Record Found';
                        uninstallAsset.Assets2 = [];
                        uninstallAsset.searhAsset2Error = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage('Error in getting Assets');
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            uninstallAsset.searhAsset2Error = 'Please type atleast 1 characters';
            uninstallAsset.no_asset2 = '';
            uninstallAsset.Assets2 = '';
        }


    };

    uninstallAsset.select_seriailized_port = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.seriailized_port_name = name;
        uninstallAsset.seriailized_port_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    uninstallAsset.loadMaterialBOMItems = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (uninstallAsset.materialBOMId) {
            AssetsService.getMaterialBOMItems(uninstallAsset.materialBOMId).then(function(data) {
                console.log('MaterialBOMItems', data);
                uninstallAsset.MaterialBOMItems = data.records;
                $ionicLoading.hide();
                $ionicModal.fromTemplateUrl('modules/workorder/lookup_materialBOMItems_uninstall.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            }, function(err) {
                uninstallAsset.showAlertMessage('Error in getting Material BOM Items');
                $ionicLoading.hide();
            });
        } else {
            $scope.displayAlertMessage('Please select BOM');
            $ionicLoading.hide();
        }

    };

    uninstallAsset.selectMaterialBOM_item = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.materialBOM_itemName = name;
        uninstallAsset.materialBOM_itemIdmaterialBOM_itemId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    uninstallAsset.loadParentMaterialBOMItems = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        AssetsService.getParentMaterialBOMItems(uninstallAsset.materialBOMId).then(function(data) {
            console.log('MaterialBOMItems', data);
            uninstallAsset.ParentMaterialBOMItems = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/lookup_parentmaterialBOMItems_uninstall.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            uninstallAsset.showAlertMessage('Error in getting Parent Material BOM Items');
            $ionicLoading.hide();
        });
    };

    uninstallAsset.selectParentMaterialBOM_item = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.parent_materialBOM_itemName = name;
        uninstallAsset.parent_materialBOM_itemId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    uninstallAsset.loadLot = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        AssetsService.getLot().then(function(data) {
            console.log('loadLot', data);
            uninstallAsset.Lots = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/lookup_lots_uninstall.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(err) {
            uninstallAsset.showAlertMessage('Error in getting Lot');
            $ionicLoading.hide();
        });
    };

    uninstallAsset.selectLot = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.lotName = name;
        uninstallAsset.lotId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    uninstallAsset.loadProducts = function() {
        console.log('clicked');
        uninstallAsset.searhproductError = '';
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        $ionicModal.fromTemplateUrl('modules/workorder/lookup_products_uninstall.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $ionicLoading.hide();
        });
    };

    uninstallAsset.searchProduct = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (uninstallAsset.searchproductname.length > 0) {
            uninstallAsset.searhproductError = '';
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            AssetsService.getProductsbySearch(uninstallAsset.searchproductname).then(
                function(entries) {

                    console.log('post search', entries);
                    if (entries.records.length > 0) {
                        uninstallAsset.Products = entries.records;
                        uninstallAsset.no_product = '';
                        uninstallAsset.searhproductError = '';
                    } else {
                        uninstallAsset.no_product = 'No Record Found';
                        uninstallAsset.Products = [];
                        uninstallAsset.searhproductError = '';
                    }
                    $ionicLoading.hide();
                },
                function(err) {
                    $scope.displayAlertMessage('Error in getting Products');
                    $ionicLoading.hide();
                }
            );
        } else {
            $ionicLoading.hide();
            uninstallAsset.searhproductError = 'Please type atleast 1 characters';
            uninstallAsset.no_product = '';
            uninstallAsset.Products = '';
        }
    };

    uninstallAsset.selectProduct = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        uninstallAsset.productName = name;
        uninstallAsset.productId = id;
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
    uninstallAsset.install = function($form) {
        console.log('clcoked');
        if ($form.$valid) {
            uninstallAsset.performedOn = $filter('date')(new Date(uninstallAsset.formData.performed_on), "MM/dd/yyyy hh:mm a");
            var inputParam = {
                "repairId": uninstallAsset.RAData.Id,
                "destinationInventoryId": (typeof uninstallAsset.destInventoryId != 'undefined') ? uninstallAsset.destInventoryId : "",
                "mBOMId": (typeof uninstallAsset.materialBOMId != 'undefined') ? uninstallAsset.materialBOMId : "",
                "mBOMItemId": (uninstallAsset.materialBOM_itemId) ? uninstallAsset.materialBOM_itemId : '',
                "assetId": (uninstallAsset.AssetId) ? uninstallAsset.AssetId : '',
                "operation": "Uninstall",
                "performedOn": uninstallAsset.performedOn,
                "productId": (uninstallAsset.productId) ? uninstallAsset.productId : '',
                "quantity": uninstallAsset.formData.quantity,
                "serializedId": (uninstallAsset.seriailized_port_id) ? uninstallAsset.seriailized_port_id : '',
                "sourceInventoryId": (uninstallAsset.srcInventoryId) ? uninstallAsset.srcInventoryId : '',
                "inventoryLineItemId": (uninstallAsset.inventoryItemId) ? uninstallAsset.inventoryItemId : '',
                "lotNumId": (uninstallAsset.lotId) ? uninstallAsset.lotId : '',
                "parMatBOMItemId": (uninstallAsset.parent_materialBOM_itemId) ? uninstallAsset.parent_materialBOM_itemId : '',
                "status": "On-Hand",
                "condition": uninstallAsset.formData.condition,
            };
            console.log('inputParam', inputParam);
            //return;
            navigator.notification.confirm(
                'Do you want to Install the asset?',
                function(buttonIndex) {
                    if (buttonIndex == 1) {

                        $ionicLoading.show({
                            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
                        });

                        RepairAnalysisService.installUninstallSave('POST', inputParam).then(function(data) {
                            $ionicLoading.hide();
                            console.log('data', data);
                             if (data.statusMsg === 'ERROR') {
                                $scope.displayAlertMessage(data.errorMsg);
                            } else if (data.statusMsg === 'SUCCESS') {
                                  toastr.success("Uninstallation of Asset done successfully");
                                  $ionicHistory.goBack();
                            } else {
                                uninstallAsset.showAlertMessage(data.statusMsg +': '+data.errorMsg);
                            }

                        }, function(err) {
                            $ionicLoading.hide();
                            if (NetworkService.isDeviceOnline()) {
                                uninstallAsset.showAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                            }else {
                                $scope.displayAlertMessage('This Functionality is not accessible Offline');
                            }

                        });
                    } else {
                        $ionicLoading.hide();
                    }
                },
                'Medvantage', ['Confirm', 'Cancel']
            );
        }
    };

    /**
     *   Desc - Shows the alert message
     *   @param - message
     *   @return none
     */
    uninstallAsset.showAlertMessage = function(message) {
        navigator.notification.alert(message, uninstallAsset.alertDismissed, 'Medvantage', 'OK');
    };

    /**
     *   Desc - Success callback from alert message
     *   @param - none
     *   @return none
     */
    uninstallAsset.alertDismissed = function() {};

    /**
     *   Desc - Shows the alert popup
     *   @param - none
     *   @return none
     */
    uninstallAsset.showSuccessMessage = function(message) {
        navigator.notification.alert(message, uninstallAsset.onSuccess, 'Medvantage', 'OK');
    };

    /**
     *   Desc - Success callback from alert message to go back
     *   @param - none
     *   @return none
     */
    uninstallAsset.onSuccess = function() {
        $ionicHistory.goBack();
    };

    /**
     *   Desc - Used to navigate to previous state
     *   @param - none
     *   @return none
     */
    uninstallAsset.backToRA = function() {
        $ionicHistory.goBack();
    };

}

function uninstallAssetCtrl2($rootScope, $scope, $stateParams, $state, $q, $ionicLoading, $ionicHistory, DataService, SOUPINFO, SharedPreferencesService, RepairAnalysisService, localStorageService, $ionicModal, NetworkService, $translate) {
    var rec_entries = localStorageService.get('maxRecords');
    if (rec_entries === null) {
        localStorageService.set('maxRecords', 20);
        rec_entries = 20;
    }

    var uninstallAsset2 = this;
    uninstallAsset2.RAName = SharedPreferencesService.getRAName();

    /** 
     *   Desc - Shows the alert popup
     *   @param - none
     *   @return none
     */
    uninstallAsset2.showAlertMessage = function(message) {
        navigator.notification.alert(message, uninstallAsset2.alertDismissed, 'Medvantage', 'OK');
    };

    /** 
     *   Desc - Success callback from alert message
     *   @param - none
     *   @return none
     */
    uninstallAsset2.alertDismissed = function() {};

    /** 
     *   Desc - Shows the alert popup
     *   @param - none
     *   @return none
     */
    uninstallAsset2.showSuccessMessage = function(message) {
        navigator.notification.alert(message, uninstallAsset2.onSuccess, 'Medvantage', 'OK');
    };

    /** 
     *   Desc - Success callback from alert message and go back to previous state
     *   @param - none
     *   @return none
     */
    uninstallAsset2.onSuccess = function() {
        $ionicHistory.goBack();
    };

    /** 
     *   Desc - Shows the BOM items
     *   @param - none
     *   @return none
     */
    uninstallAsset2.loadBOM = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        RepairAnalysisService.getUnInstallationBOM(SharedPreferencesService.getWorkOrderAsset()).then(function(data) {

            uninstallAsset2.BOMRecords = data.records;
            $ionicLoading.hide();

            $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_uninstall_BOM.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        });
    };

    /** 
     *   Desc - Assigns the BOM Item from BOM lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    uninstallAsset2.fetchBOM = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        uninstallAsset2.materialBOMName = name;
        uninstallAsset2.materialBOMId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Shows the destination line items
     *   @param - none
     *   @return none
     */
    uninstallAsset2.loadDestInventory = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        RepairAnalysisService.getDestInventory().then(function(data) {

            uninstallAsset2.destInventoryRecords = data.records;
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('modules/workorder/wo_ra_dest_un_inventory.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }, function(error) {
            if (NetworkService.isDeviceOnline()) {
                uninstallAsset2.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + error[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + error[0].message);
            } else {
                uninstallAsset2.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.fetchDestInvFailure"));
            }
        });
    };

    /** 
     *   Desc - Assigns the destination inventory Item from destination inventory lookup
     *   @param - id
     *   @param - name
     *   @return none
     */
    uninstallAsset2.fetchDestInventory = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        uninstallAsset2.destInventory = name;
        uninstallAsset2.destInventoryId = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Close the modal
     *   @param - none
     *   @return none
     */
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    /** 
     *   Desc - Used to uninstall the asset
     *   @param - $form
     *   @return none
     */
    uninstallAsset2.uninstall = function($form) {
        if ($form.$valid) {
            var inputParam = {
                "operation": "Uninstall",
                "raId": SharedPreferencesService.getRepairAnalysisId(),
                "bomItemId": uninstallAsset2.materialBOMId,
                "destInvId": uninstallAsset2.destInventoryId,
                "qty": uninstallAsset2.quantity
            };

            navigator.notification.confirm(
                $translate.instant('workorder.accept_expense_RA_Controller.want-to-uninstall-asset'),
                function(buttonIndex) {
                    if (buttonIndex == 1) {
                        $ionicLoading.show({
                            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
                        });
                        RepairAnalysisService.installUninstallItem('POST', inputParam).then(function(data) {
                            $ionicLoading.hide();

                            if (data.statusMsg === 'ERROR') {
                                $scope.displayAlertMessage(errorMsg);
                            } else if (data.statusMsg === 'SUCCESS') {
                                uninstallAsset2.showSuccessMessage($translate.instant("workorder.accept_expense_RA_Controller.uninstallingAssetSuccess"));
                            } else {
                                uninstallAsset2.showAlertMessage(data.statusMsg);
                            }

                        }, function(err) {
                            $ionicLoading.hide();
                            if (NetworkService.isDeviceOnline()) {
                                uninstallAsset2.showAlertMessage($translate.instant("workorder.accept_expense_RA_Controller.errCode") + err[0].errorCode + $translate.instant("workorder.accept_expense_RA_Controller.errMsg") + err[0].message);
                            }

                        });
                    } else {
                        $ionicLoading.hide();
                    }
                },
                $translate.instant("workorder.accept_expense_RA_Controller.medvantage"), 
                [$translate.instant("workorder.accept_expense_RA_Controller.confirm"), $translate.instant("workorder.accept_expense_RA_Controller.cancel")]
            );
        }
    };

    /** 
     *   Desc - Used to go back to previous state
     *   @param - none
     *   @return none
     */
    uninstallAsset2.backToRA = function() {
        $ionicHistory.goBack();
    };

}

function TestInstructionCtrl($scope, RepairAnalysisService, $stateParams, $state, $q, $ionicLoading, $ionicScrollDelegate, $ionicHistory, $timeout, $ionicModal, $ionicPopover, SharedPreferencesService, $translate) {

    var testinstruction = this;
    testinstruction.RAId = $stateParams.RAId;
    testinstruction.Id = $stateParams.testId;
    new_ti = {};
    testinstruction.workOrderName = SharedPreferencesService.getRAName();
    testinstruction.status = {};
    testinstruction.clearsearch = function() {
        testinstruction.searchtemplate = '';
    };

    $ionicPopover.fromTemplateUrl('modules/workorder/testInstruction_popover.html', {
        scope: $scope,
    }).then(function(popover) {
        testinstruction.popover = popover;
    });

    /** 
     *   Desc - Used for saving the test instructions
     *   @param - $form
     *   @return none
     */
    testinstruction.testinstructionSave = function($form) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        new_ti.MedConnect__Record_Id__c = testinstruction.RAId;
        new_ti.MedConnect__Instruction_Template__c = testinstruction.selected_template_id;
        new_ti.MedConnect__Status__c = testinstruction.status.value || '';

        RepairAnalysisService.createTestInstruction(new_ti).then(function(ti_added) {

            RepairAnalysisService.getAllInstructionSections(testinstruction.selected_template_id).then(function(temps) {
                for (var i = temps.records.length - 1; i >= 0; i--) {
                    var tempObj = {
                        'MedConnect__Instruction_Steps__c': temps.records[i].Id,
                        'MedConnect__Instruction_Section__c': temps.records[i].MedConnect__Instruction_Section__c,
                        'MedConnect__Instruction_Test_Header__c': ti_added.id
                    };

                    RepairAnalysisService.addAllInstructionSections(tempObj);
                }
            }, function(err) {

            });

            $ionicHistory.goBack();
        }, function(er) {});
    };

    /** 
     *   Desc - Used for showing templates
     *   @param - none
     *   @return none
     */
    testinstruction.showTemplates = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });
        RepairAnalysisService.getTestInstructionTemplate(testinstruction.RAId).then(function(temps) {
                testinstruction.temps = temps.records;
                $ionicLoading.hide();
                $ionicModal.fromTemplateUrl('modules/workorder/templates_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            },
            function(act_err) {
                testinstruction.temps = [];
            });
    };

    /** 
     *   Desc - Used to take users back to previous state
     *   @param - none
     *   @return none
     */
    testinstruction.takeMeBack = function() {
        $ionicHistory.goBack();
    };

    /** 
     *   Desc - Used to select template from the template lookup
     *   @param - none
     *   @return none
     */
    testinstruction.select_the_template = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        testinstruction.selected_template_name = name;
        testinstruction.selected_template_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    /** 
     *   Desc - Used to close the modal popup
     *   @param - none
     *   @return none
     */
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    /** 
     *   Desc - Used to check the instruction set values
     *   @param - none
     *   @return none
     */
    testinstruction.checkValues = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        if (testinstruction.res) {
            for (var i = testinstruction.res.length - 1; i >= 0; i--) {

                if (testinstruction.res[i].val) {
                    for (var j = testinstruction.res[i].val.length - 1; j >= 0; j--) {
                        if (testinstruction.res[i].val[j]) {
                            if (typeof testinstruction.res[i].val[j].anotherResult === 'object' && testinstruction.res[i].val[j].anotherResult !== null) {

                                var keyss = Object.keys(testinstruction.res[i].val[j].anotherResult);
                                var true_res = keyss.filter(function(key) {
                                    return testinstruction.res[i].val[j].anotherResult[key];
                                });

                                testinstruction.res[i].val[j].MedConnect__Result__c = '(' + true_res.toString() + ')';
                                testinstruction.res[i].val[j].MedConnect__Result__c = testinstruction.res[i].val[j].MedConnect__Result__c.replace(/,/g, ", ");

                            }
                        }

                        var data = {
                            "Id": testinstruction.res[i].val[j].Id,
                            "MedConnect__Result__c": testinstruction.res[i].val[j].MedConnect__Result__c
                        };
                        RepairAnalysisService.updateTestInstruction(data).then(function() {

                        }, function(er) {

                        });
                    }
                }
            }
        }

        $ionicHistory.goBack();
    };

    if ($stateParams.testId && $stateParams.testId !== undefined) {
        RepairAnalysisService.getTestNowForm($stateParams.testId).then(function(testnowdata) {


            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
            });

            testinstruction.testNowForm = testnowdata;
            var data = testinstruction.testNowForm.records;
            testinstruction.res = [];
            var result = [];
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i].MedConnect__Instruction_Section__c && result.indexOf(data[i].MedConnect__Instruction_Section__c) == -1) {
                    var b = {};
                    b.Id = data[i].MedConnect__Instruction_Section__c;
                    b.val = [data[i]];
                    testinstruction.res.push(b);
                    result.push(data[i].MedConnect__Instruction_Section__c);
                } else {
                    testinstruction.res[result.indexOf(data[i].MedConnect__Instruction_Section__c)].val.push(data[i]);
                }
            }
            testinstruction.res.reverse();

            for (var m = testinstruction.res.length - 1; m >= 0; m--) {
                if (testinstruction.res[m].val.length > 0) {
                    for (var n = testinstruction.res[m].val.length - 1; n >= 0; n--) {
                        if (testinstruction.res[m].val[n].MedConnect__Instruction_Steps__r) {
                            if (testinstruction.res[m].val[n].MedConnect__Instruction_Steps__r.MedConnect__Result_Type__c === 'Checkbox') {

                                if (testinstruction.res[m].val[n].MedConnect__Result__c !== null) {
                                    var yourString = testinstruction.res[m].val[n].MedConnect__Result__c;
                                    var res1 = yourString.slice(1, -1);
                                    if (res1.length > 1) {
                                        var res2 = res1.split(', ');
                                        var rv = {};
                                        for (var y = 0; y < res2.length; ++y) {
                                            rv[res2[y]] = true;
                                        }
                                        testinstruction.res[m].val[n].anotherResult = rv;
                                    }

                                } else {
                                    testinstruction.res[m].val[n].anotherResult = {};
                                }
                            }
                        }
                    }
                }
            }

            $timeout(function() {
                $ionicLoading.hide();
            }, 1000);

        }, function(er) {});
    }

    /** 
     *   Desc - Used to complete the test instruction
     *   @param - none
     *   @return none
     */
    testinstruction.completeTestinstruction = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.accept_expense_RA_Controller.loading" | translate}}'
        });

        var data = {
            "Id": $stateParams.testId,
            "MedConnect__Status__c": 'Complete'
        };

        RepairAnalysisService.updateStatusTestInstruction(data).then(function() {
            $ionicHistory.goBack();
        }, function(er) {

        });
    };
}