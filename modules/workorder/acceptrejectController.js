app.controller('AcceptRejectOrderCtrl', function ($scope,$state, $stateParams, $q, $ionicLoading, SharedPreferencesService, AcceptRejectWorkOrderService, $ionicHistory, $translate) {

  var acceptRejectOrder = this;
  var date = new Date();
  var NOT_A_TECHNICIAN = $translate.instant("workorder.acceptRejectController.notTechnician");
  acceptRejectOrder.reason = '';

  acceptRejectOrder.woName = SharedPreferencesService.getWorkOrderName();
  acceptRejectOrder.currentDate = SharedPreferencesService.getMonth(date.getMonth()) + ' ' + date.getDate() + ', ' + date.getFullYear();
  acceptRejectOrder.altTime = SharedPreferencesService.getAlternateTime();
  acceptRejectOrder.signComments = $translate.instant("workorder.acceptRejectController.signComments");
  var workOrderId = SharedPreferencesService.getWorkOrderId();
  var productId = SharedPreferencesService.getProductId();
  var appointedTechnicianId = SharedPreferencesService.getAppointedTechnicianId();
  var assignedTechnicianId = SharedPreferencesService.getAssignedTechnicianId();
  var loggedInUserId = SharedPreferencesService.getLoggedInUserId();

  acceptRejectOrder.isApplicableForWOAcceptReject = function (processType) {
    
    $ionicLoading.show({
      template: '<ion-spinner icon="ios-small"></ion-spinner> {{"workorder.acceptRejectController.loading" | translate}}'
    });

    if (acceptRejectOrder.userId) {
      if (acceptRejectOrder.password) {
        if (processType === 'RejectWorkOrder' && acceptRejectOrder.reason === '') {
            showAlertMessage($translate.instant("workorder.acceptRejectController.reasonForRejection"));
        } else {
            var promise1 = AcceptRejectWorkOrderService.getUserIdFromTechId(appointedTechnicianId);
            var promise2 = AcceptRejectWorkOrderService.getLoggedInUserIdFromEmail(acceptRejectOrder.userId);

            $q.all([promise1, promise2]).then(function (data) {

              var technicianUserId, enteredUserId = null;

              if (data[0].records.length > 0) {
                technicianUserId = data[0].records[0].MedConnect__User__c;
                if (technicianUserId.length == 18) {
                  technicianUserId = technicianUserId.substr(0, 15);
                }
              }

              if (data[1].records.length > 0) {
                enteredUserId = data[1].records[0].Id;
                if (enteredUserId.length == 18) {
                  enteredUserId = enteredUserId.substr(0, 15);
                }
              }

              if (enteredUserId !== null) {
                if (technicianUserId != enteredUserId) {
                showAlertMessage($translate.instant("workorder.acceptRejectController.notTechnician"));
                } else {
                if (assignedTechnicianId !== null && processType == 'AcceptWorkOrder') {
                  showAlertMessage($translate.instant("workorder.acceptRejectController.workOrder") + acceptRejectOrder.woName + $translate.instant("workorder.acceptRejectController.alreadyAccepted"));
                } else {
                  acceptRejectOrder.checkWorkOrderAccept(processType);
                }
                }
              } else {
                showAlertMessage($translate.instant("workorder.acceptRejectController.credentialsNotCorrect"));
              }
              
            }, function (err) {
              showAlertMessage($translate.instant("workorder.acceptRejectController.errorFetchData"));
            });
        }
      } else {
        showAlertMessage($translate.instant("workorder.acceptRejectController.enterPass"));
      }
    } else {
      showAlertMessage($translate.instant("workorder.acceptRejectController.enterUser"));
    }
  };

  acceptRejectOrder.clearFields = function (processType) {
    acceptRejectOrder.userId = '';
    acceptRejectOrder.password = '';
    if (processType === 'AcceptWorkOrder') {
      acceptRejectOrder.signComments = $translate.instant("workorder.acceptRejectController.signComments");
    } else if (processType === 'RejectWorkOrder') {
      acceptRejectOrder.altTime = '';
      acceptRejectOrder.reason = '';
      acceptRejectOrder.signComments = '';
    }
  };

  acceptRejectOrder.checkWorkOrderAccept = function (processType) {
    acceptRejectOrder.checkValidUserWhileAcceptRejectWO(acceptRejectOrder.userId, acceptRejectOrder.password, processType);
  };

  acceptRejectOrder.checkValidUserWhileAcceptRejectWO = function (username, password, processType) {

    var requestJSON = {
      'userName': username,
      'userPassword': password
    };

    AcceptRejectWorkOrderService.validateUser('POST', requestJSON).then(function (response) {

      if (typeof response.status != 'undefined' && response.status == 'ValidUser') {
        acceptRejectOrder.checkWhetherUserExistsInOrg(username, processType);
      } else if (typeof response.status != 'undefined' && response.status == 'InvalidUser') {
        showAlertMessage($translate.instant("workorder.acceptRejectController.invalidCredentials"));
        acceptRejectOrder.userId = null;
        acceptRejectOrder.password = null;
        acceptRejectOrder.signComments = $translate.instant("workorder.acceptRejectController.signComments");
      }
    }, function (err) {
      $ionicLoading.hide();
    });
  };

  acceptRejectOrder.checkWhetherUserExistsInOrg = function (username, processType) {

    AcceptRejectWorkOrderService.checkUserInOrg(username).then(function (data) {
      var userInfoId = data.records[0].Id;
      acceptRejectOrder.processWorkOrderAccept(userInfoId, processType);

    }, function (err) {
      $ionicLoading.hide();
      showAlertMessage($translate.instant("workorder.acceptRejectController.user") + username + $translate.instant("workorder.acceptRejectController.notAvailable"));
    });
  };

  acceptRejectOrder.processWorkOrderAccept = function (userInfoId, processType) {
    var processingStatus = "";
    var queueId = null;
    var woRecord = {};
    var productId = '';

    if (processType == 'AcceptWorkOrder') {
      woRecord.MedConnect__Assigned_Technician__c = userInfoId;
      woRecord.MedConnect__Processing_Status__c = "Accepted by FSE/Scheduled";
      woRecord.MedConnect__Reason_For_Change__c = "Via Approval Process";
      woRecord.MedConnect__Signature_Comment__c = acceptRejectOrder.signComments;

      acceptRejectOrder.updateWorkOrderWhenAcceptReject(workOrderId, productId, woRecord, userInfoId, processType);
    } else if (processType == 'RejectWorkOrder') {

      woRecord.MedConnect__Assigned_Technician__c = null;
      woRecord.MedConnect__Appointed_Technician__c = null;
      woRecord.MedConnect__Processing_Status__c = "Rejected by FSE";
      woRecord.MedConnect__Reason_For_Change__c = "Via Approval Process";
      woRecord.MedConnect__Signature_Comment__c = acceptRejectOrder.reason;
      woRecord.MedConnect__Alternate_Time__c = acceptRejectOrder.altTime;

      var recordType = SharedPreferencesService.getRecordType();

      // If Record Type of the WO is 'Field Service'
      // then update OwnerId of WO with Id of Field Service Manager Queue
      if (recordType == 'Field Service') {
        AcceptRejectWorkOrderService.getIdOnRecordType().then(function (response) {
          if (typeof response.records != 'undefined' && response.records.length > 0) {
            queueId = response.records[0].Id;
            // Update Owner Id in every case in Reject scenario
            woRecord.OwnerId = queueId;
            acceptRejectOrder.updateWorkOrderWhenAcceptReject(workOrderId, productId, woRecord, userInfoId, processType);
          }
        });
      } else if (recordType == 'Depot Repair') {
          var depotQueue = SharedPreferencesService.getDepotQueue();
          if (typeof depotQueue !== undefined && depotQueue !== '' && depotQueue !== null) {
            queueId = SharedPreferencesService.getDepotQueue();
            if(queueId && queueId.length > 0) {
              woRecord.OwnerId = queueId;
            }
          }
          acceptRejectOrder.updateWorkOrderWhenAcceptReject(workOrderId, productId, woRecord, userInfoId, processType);

      } else {
          acceptRejectOrder.updateWorkOrderWhenAcceptReject(workOrderId, productId, woRecord, userInfoId, processType);
      }

    }
  };

  acceptRejectOrder.updateWorkOrderWhenAcceptReject = function (workOrderId, productId, woRecord, userInfoId, processType) {

    AcceptRejectWorkOrderService.getDetailsFromWOAction(workOrderId).then(function (response) {
      var woaList = null;
      var woaRecord = {};
      var action = '';
      if (processType == 'AcceptWorkOrder')
        action = $translate.instant("workorder.acceptRejectController.accept");
      else
        action = $translate.instant("workorder.acceptRejectController.reject");

      if (response.records.length > 0)
        woaList = response.records[0];

      woaRecord.MedConnect__Action_Label__c = action;
      woaRecord.MedConnect__Action_Name__c = action;
      woaRecord.MedConnect__Comments__c = woRecord.MedConnect__Signature_Comment__c;
      woaRecord.MedConnect__Performed_By__c = userInfoId;
      woaRecord.MedConnect__ESignature_Captured__c = true;
      if (woaList !== null && woaList.CreatedDate)
        woaRecord.MedConnect__Previous_Action_Date__c = woaList.CreatedDate;
        woaRecord.MedConnect__Work_Order__c = workOrderId;

      AcceptRejectWorkOrderService.createWOActionRecord(woaRecord).then(function (response) {
        //Update Work Order
        AcceptRejectWorkOrderService.updateWOActionRecord(workOrderId, woRecord).then(function (response) {
          showSuccessAlertMessage($translate.instant("workorder.acceptRejectController.workOrder") + acceptRejectOrder.woName + $translate.instant("workorder.acceptRejectController.is") + action +$translate.instant("workorder.acceptRejectController.successfully"), action);
        }, function (err) {
          showAlertMessage($translate.instant("workorder.acceptRejectController.errCode")+err[0].errorCode+$translate.instant("workorder.acceptRejectController.errMsg")+err[0].message);
        });
      }, function (err) {
        $ionicLoading.hide();
        showAlertMessage($translate.instant("workorder.acceptRejectController.errCode")+err[0].errorCode+$translate.instant("workorder.acceptRejectController.errMsg")+err[0].message);
      });
    }, function (err) {
      $ionicLoading.hide();
      showAlertMessage($translate.instant("workorder.acceptRejectController.errCode")+err[0].errorCode+$translate.instant("workorder.acceptRejectController.errMsg")+err[0].message);
    });
  };

  function showAlertMessage(message) {
    $ionicLoading.hide();
    navigator.notification.alert(message, alertDismissed, $translate.instant("workorder.acceptRejectController.medvantage"), $translate.instant("workorder.acceptRejectController.ok"));
  }

  function alertDismissed() {
  }

  function showSuccessAlertMessage(message, action) {
    $ionicLoading.hide();
    navigator.notification.alert(message, backToWorkOrder(action), $translate.instant("workorder.acceptRejectController.medvantage"), $translate.instant("workorder.acceptRejectController.ok"));
  }

  function backToWorkOrder (action) {
    if (action == $translate.instant("workorder.acceptRejectController.accept")) {
      $ionicHistory.goBack();
    } else if (action == $translate.instant("workorder.acceptRejectController.reject")) {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.calendar');
    }
  }

});
