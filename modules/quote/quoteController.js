/* jshint -W100 */
app.controller('QuoteCtrl', ['$q', '$scope', 'QuoteService', '$stateParams', '$state', '$ionicLoading', '$ionicPopover', '$timeout', '$ionicPopup', 'SOUPINFO', 'DataService', 'NetworkService', 'SharedPreferencesService', 'toastr', '$translate', QuoteCtrl]);
app.controller('QuoteCreationCtrl', ['$q', '$scope', 'QuoteService', '$stateParams', '$state', '$ionicLoading', 'toastr', '$ionicHistory', 'WorkOrderService', 'SOUPINFO', 'DataService', 'NetworkService', 'SharedPreferencesService', 'SyncUpDataService','$timeout', '$translate', QuoteCreationCtrl]);
app.controller('QuoteExpenseCtrl', ['$q', '$scope', 'QuoteService', '$stateParams', '$state', '$ionicLoading', 'toastr', '$ionicHistory', 'NetworkService', 'DataService', 'SOUPINFO', 'SharedPreferencesService', '$translate', QuoteExpenseCtrl]);
app.controller('QuoteLabourCtrl', ['$q', '$scope', 'QuoteService', '$stateParams', '$state', '$ionicLoading', 'toastr', '$ionicHistory', 'NetworkService', 'SharedPreferencesService', 'DataService', 'SOUPINFO', '$timeout', '$translate', QuoteLabourCtrl]);
app.controller('QuoteMaterialCtrl', ['$q', '$scope', 'QuoteService', '$stateParams', '$state', '$ionicLoading', 'toastr', '$ionicHistory', 'NetworkService', 'SharedPreferencesService', 'ActivityService', 'DataService', 'SOUPINFO', '$ionicModal', 'ProductsService','$timeout', '$translate', QuoteMaterialCtrl]);
app.controller('QuoteExpenseDetailCtrl', ['$q', '$scope', 'QuoteService', '$stateParams', '$state', '$ionicLoading', '$ionicPopover', 'toastr', '$ionicHistory', '$timeout', '$translate', QuoteExpenseDetailCtrl]);
app.controller('QuoteMaterialDetailCtrl', ['$q', '$scope', 'QuoteService', '$stateParams', '$state', '$ionicLoading', '$ionicPopover', 'toastr', '$ionicHistory', '$timeout', '$translate', QuoteMaterialDetailCtrl]);
app.controller('QuoteLabourDetailCtrl', ['$q', '$scope', 'QuoteService', '$stateParams', '$state', '$ionicLoading', '$ionicPopover', 'toastr', '$ionicHistory', '$timeout', '$translate', QuoteLabourDetailCtrl]);

function QuoteCtrl($q, $scope, QuoteService, $stateParams, $state, $ionicLoading, $ionicPopover, $timeout, $ionicPopup, SOUPINFO, DataService, NetworkService, SharedPreferencesService, toastr, $translate) {
    var singleQuote = this;
    singleQuote.quoteId = $stateParams.quoteId;
    var quoteID = singleQuote.quoteId;
    singleQuote.workOrderID = $stateParams.workOrderID;

    singleQuote.dontProceed = false;

    var quoteModuleList = ["quote", "materials", "labours", "expenses"];

    $ionicPopover.fromTemplateUrl('modules/quote/quote_popover.html', {
        scope: $scope
    }).then(function(popover) {
        singleQuote.popover = popover;
    });

    // Sign Pop Up Start
    singleQuote.showPopup = function() {
        $scope.data = {};
        $ionicPopup.show({
            template: '<signature-pad-custom accept="accept" clear="clear" height="220" width="568"></signature-pad-custom><button ng-click="clear()" id="clearqsignid">Clear signature</button><button ng-click="singleQuote.setSign(accept())" id="setqsignid">Sign</button>',
            title: 'Signature',
            subTitle: 'Please Sign the form',
            scope: $scope,
            buttons: [{
                text: 'Cancel',
                onTap: function(e) {
                    singleQuote.clearsign();
                }
            }, {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                    singleQuote.setsign();
                }
            }]
        });
    };

    singleQuote.clearsign = function() {
        $timeout(function() {
        });
    };

    singleQuote.setsign = function() {
        $timeout(function() {
            angular.element('#setqsignid').click();
        });
    };

    singleQuote.setSign = function(sdata) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading")|translate}}...'
        });
        sdata.Id = singleQuote.quoteId;
        sdata.MedConnect__SignOff__c = "<img alt='signature' src='" + sdata.dataurl + "'/>";
        sdata.MedConnect__Status__c = "Accepted";
        sdata.MedConnect__Signature_Status__c = "Signed";
        delete sdata.dataurl;
        delete sdata.isEmpty;
       
        DataService.setSoupData(SOUPINFO.quoteSignature, [sdata]);

        QuoteService.setSignatureToId(sdata).then(function() {
            $state.reload();
        }, function(err) {
            if (!NetworkService.isDeviceOnline()) {

                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', singleQuote.quoteId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(offlineQuote) {
                    if (offlineQuote && offlineQuote.currentPageOrderedEntries.length > 0) {
                        var offlineQuoteData = offlineQuote.currentPageOrderedEntries[0].data;
                        offlineQuoteData.MedConnect__SignOff__c = sdata.MedConnect__SignOff__c;
                        offlineQuoteData.MedConnect__Status__c = sdata.MedConnect__Status__c;
                        offlineQuoteData.MedConnect__Signature_Status__c = sdata.MedConnect__Signature_Status__c;

                        offlineQuote.currentPageOrderedEntries[0].data = offlineQuoteData;

                        DataService.setOfflineSoupData(offlineQuote.currentPageOrderedEntries[0]).then(function() {
                            toastr.info($translate.instant("quote.quoteController.signatureupdatedofflinesuccessfully"));
                            singleQuote.getSign(quoteID);
                        });

                    } else {

                        var offlineObj = {
                            "action": "Edit",
                            "type": "QTE",
                            "Name": "Signature",
                            "WOName": SharedPreferencesService.getWorkOrderName(),
                            "data": sdata,
                            "randomId": singleQuote.quoteId,
                            "resync": false,
                            "createdDate": new Date().getTime().toString(),
                            "href": "#/app/quote/" + singleQuote.quoteId + "/" + singleQuote.workOrderID
                        };

                        DataService.setOfflineSoupData(offlineObj).then(function() {
                            toastr.info($translate.instant("quote.quoteController.signatureupdatedofflinesuccessfully"));
                            singleQuote.getSign(quoteID);
                        });
                    }
                });
            } else {
                $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            }
            $ionicLoading.hide();
        });
    };

    singleQuote.revise = false;
    singleQuote.sign = false;

    singleQuote.getSign = function(quoteID) {
        QuoteService.getSignatureById(quoteID).then(function(sign) {
            singleQuote.quote.MedConnect__SignOff__c = sign.records[0].MedConnect__SignOff__c;

            //   singleQuote.revise = (sign.records[0].MedConnect__Signature_Status__c === 'Signed' && sign.records[0].MedConnect__SignOff__c) ? true : false;
            // var signObj = {};
            // var signArrayObj = [];
            // signObj['Id'] = singleQuote.quoteId;
            // signObj['data'] = sign.records;
            // signArrayObj.push(signObj);
            // DataService.setSoupData(SOUPINFO.woSignature, signArrayObj);

        }, function(er) {
            var querySpec = navigator.smartstore.buildExactQuerySpec('Id', singleQuote.quoteId);
            navigator.smartstore.querySoup(SOUPINFO.quoteSignature.Name, querySpec, function(resp) {
                
                if (resp.currentPageOrderedEntries.length > 0) {
                    var signOff = resp.currentPageOrderedEntries[0];
                    
                    singleQuote.sign = true;
                    singleQuote.quote.MedConnect__SignOff__c = signOff.MedConnect__SignOff__c;
                    singleQuote.quote.MedConnect__Status__c = signOff.MedConnect__Status__c;
                    singleQuote.quote.MedConnect__Signature_Status__c = signOff.MedConnect__Signature_Status__c;

                } else {
                    singleQuote.quote.MedConnect__SignOff__c = '';
                }
            });
        });
    };

    if (singleQuote.quoteId && singleQuote.quoteId.length === 18) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });

        var quoteDetailsPromise = QuoteService.getQuote(singleQuote.quoteId);
        var quoteMaterialsPromise = QuoteService.getQuoteLineItemsType(singleQuote.quoteId, 'Material');
        var quoteLaboursPromise = QuoteService.getQuoteLineItemsType(singleQuote.quoteId, 'Labour');
        var quoteExpensesPromise = QuoteService.getQuoteLineItemsType(singleQuote.quoteId, 'Expense');
        var dummy = QuoteService.getQuoteLineItems2(singleQuote.quoteId);

        $q.all([quoteDetailsPromise, quoteMaterialsPromise, quoteLaboursPromise, quoteExpensesPromise, dummy]).then(function(quotePromise) {
            
            if (quotePromise.length) {
                singleQuote.quote = quotePromise[0].records[0];
                singleQuote.materials = quotePromise[1].records;
                singleQuote.labours = quotePromise[2].records;
                singleQuote.expenses = quotePromise[3].records;
                
                if (singleQuote.quote) {
                    if (singleQuote.quote.MedConnect__Signature_Status__c === 'Signed' && singleQuote.quote.MedConnect__SignOff__c
                        .length > 5 && singleQuote.quote.MedConnect__Status__c === 'Accepted') {
                        singleQuote.sign = true;
                    }
                    if (singleQuote.quote.MedConnect__Child_Quote__c && singleQuote.quote.MedConnect__Child_Quote__c.length > 15)  {
                        singleQuote.revise = true;
                    }
                }

                //need to is_revisable code
                // add a quote - valid tilll should be prepopulated post 30 days
                // applicable for create code
                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                    $ionicLoading.hide();
                }, 800);
            }

            angular.forEach(quoteModuleList, function(module) {
                storeDataInOffline(module, quoteID, singleQuote);
            });

            $ionicLoading.hide();
        }, function(err) {

            angular.forEach(quoteModuleList, function(module, key) {
                getDataFromOffline(module, quoteID);
            });

            $timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
            }, 800);

            $ionicLoading.hide();
        });

    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', singleQuote.quoteId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            $ionicLoading.hide();
            
            singleQuote.isLock = resp.currentPageOrderedEntries[0].lock;
            singleQuote.quote = resp.currentPageOrderedEntries[0].data;
            singleQuote.workOrderID = resp.currentPageOrderedEntries[0].data.MedConnect__Work_Order__c;
            singleQuote.quoteId = resp.currentPageOrderedEntries[0].randomId;
            singleQuote.quote.Name = resp.currentPageOrderedEntries[0].Name;
            singleQuote.quote.MedConnect__Work_Order__r = {};
            singleQuote.quote.MedConnect__Account__r = {};
            singleQuote.quote.MedConnect__Contact__r = {};
            singleQuote.quote.MedConnect__Work_Order__r.Name = resp.currentPageOrderedEntries[0].WOName;
            singleQuote.quote.MedConnect__Account__r.Name = resp.currentPageOrderedEntries[0].AccountName;
            singleQuote.quote.MedConnect__Contact__r.Name = resp.currentPageOrderedEntries[0].ContactName;
            
            singleQuote.getSign(quoteID);
            
            $timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
            }, 800);
        });
    }

    function storeDataInOffline(type, quoteID, singleQuoteObject) {
        var configObject = getPreFilledJSONArray(type);
        
        var woQuoteDetailsArr = [];
        var woQuoteDetailsObj = {};
        woQuoteDetailsObj.Id = quoteID;
        woQuoteDetailsObj.data = singleQuote[type];
        woQuoteDetailsArr.push(woQuoteDetailsObj);
        
        DataService.setSoupData(configObject.soupName, woQuoteDetailsArr);
    }

    function getDataFromOffline(type, quoteId) {
        if (singleQuote.dontProceed) {
            return;
        }
        var configObject = getPreFilledJSONArray(type);

        DataService.getSoupData(configObject.soupName, 100).then(
            function(entries) {

                var quoteIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == quoteId) {
                        return index; 
                    } 
                }); 

                singleQuote.getSign(quoteId);
                if (quoteIdIndex.length === 0) {
                    if (singleQuote.quote === undefined && singleQuote.dontProceed === false) {
                        singleQuote.dontProceed = true;
                         $scope.showAlertMessage($translate.instant("quote.quoteController.noOfflineDataFound"));
                        return;
                    }
                }

                singleQuote[type] = entries.currentPageOrderedEntries[quoteIdIndex].data;
                if (singleQuote.quote) {
                    if (singleQuote.quote.MedConnect__Signature_Status__c === 'Signed' && singleQuote.quote.MedConnect__SignOff__c
                        .length > 5 && singleQuote.quote.MedConnect__Status__c === 'Accepted') {
                        singleQuote.sign = true;
                    }
                    if (singleQuote.quote.MedConnect__Child_Quote__c && singleQuote.quote.MedConnect__Child_Quote__c.length > 15)  {
                        singleQuote.revise = true;
                    }
                }

                if (singleQuote.quote && type === 'quote') {
                    if (singleQuote.quote.MedConnect__Signature_Status__c === 'Signed' && singleQuote.quote.MedConnect__SignOff__c
                        .length > 5 && singleQuote.quote.MedConnect__Status__c === 'Accepted') {
                        singleQuote.sign = true;
                    }
                    if (singleQuote.quote.MedConnect__Child_Quote__c && singleQuote.quote.MedConnect__Child_Quote__c.length > 15)  {
                        singleQuote.revise = true;
                    }
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
                    singleQuote.isLock = offlineRecord.lock;
                }
            }
        });
    }

    function getPreFilledJSONArray(type) {
        
        var configJSON = {};
        switch (type) {
            case 'quote':
                configJSON.soupName = SOUPINFO.WOQuotesGeneralInfo;
                return configJSON;
            case 'materials':
                configJSON.soupName = SOUPINFO.WOQuotesMaterials;
                return configJSON;
            case 'labours':
                configJSON.soupName = SOUPINFO.WOQuotesLabours;
                return configJSON;
            case 'expenses':
                configJSON.soupName = SOUPINFO.WOQuotesExpenses;
                return configJSON;
        }
    }

}

function QuoteCreationCtrl($q, $scope, QuoteService, $stateParams, $state, $ionicLoading, toastr, $ionicHistory, WorkOrderService, SOUPINFO, DataService, NetworkService, SharedPreferencesService, SyncUpDataService,$timeout,$translate) {
    var quoteCreate = this;
    quoteCreate.quoteId = $stateParams.quoteId;
    quoteCreate.workorderId = $stateParams.workorderId;
    quoteCreate.revise = $stateParams.revise;
    quoteCreate.qte = {};
    var now = new Date();
    var old_quote = '';
    now.setDate(now.getDate() + 30);
    quoteCreate.qte.valid_till = now;

    quoteCreate.takeMeBack = function() {
        $ionicHistory.goBack();
    };

    quoteCreate.fetchQuoteDetails = function(id) {
        // console.log('one');
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading"|translate}}...'
        });
        if (id.length === 18) {
            // console.log('two');
            QuoteService.getQuote(id).
            then(function(quoteDetailsRes) {
                if (quoteDetailsRes) {
                    quoteCreate.quote = quoteDetailsRes.records[0];
                    
                    var valid_time = quoteCreate.quote.MedConnect__Valid_Till__c.split("+");
                    quoteCreate.qte.valid_till = new Date(valid_time[0]);
                    quoteCreate.qte.status = quoteCreate.quote.MedConnect__Status__c;
                    if (quoteCreate.revise === 'revise') {
                        quoteCreate.qte.status = 'Revised';
                    }
                    quoteCreate.qte.discount = quoteCreate.quote.MedConnect__Discount__c;
                    quoteCreate.qte.discountType = quoteCreate.quote.MedConnect__Discount_Type__c;
                    quoteCreate.qte.description = quoteCreate.quote.MedConnect__Description__c;
                    quoteCreate.qte.account = quoteCreate.quote.MedConnect__Account__c;
                    quoteCreate.qte.contact = quoteCreate.quote.MedConnect__Contact__c;
                    quoteCreate.qte.work_order = quoteCreate.quote.MedConnect__Work_Order__c;

                }
                $ionicLoading.hide();
            }, function(err) {
                // console.log('three');
                $ionicLoading.hide();
                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteCreate.quoteId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(quoteOff) {
                    if (quoteOff && quoteOff.currentPageOrderedEntries.length > 0) {
                        // console.log('four');
                        old_quote = quoteOff.currentPageOrderedEntries[0].data;
                        old_quote_links = quoteOff.currentPageOrderedEntries[0];
                        quoteCreate.isLock = quoteOff.currentPageOrderedEntries[0].lock;
                        setTimeout(function() {
                            // console.log('split time 1',old_quote); 
                            // console.log('quoteOff',quoteOff);  
                            var valid_time = (old_quote.MedConnect__Valid_Till__c !== undefined) ? old_quote.MedConnect__Valid_Till__c.split("+") : '';
                            if (valid_time && valid_time[0]) {
                                        quoteCreate.qte.valid_till = new Date(valid_time[0]);                                        
                            }
                            quoteCreate.qte.discount = old_quote.MedConnect__Discount__c;
                            quoteCreate.qte.discountType = old_quote.MedConnect__Discount_Type__c;
                            quoteCreate.qte.status = old_quote.MedConnect__Status__c;
                            quoteCreate.qte.description = old_quote.MedConnect__Description__c;
                            quoteCreate.qte.work_order = old_quote.MedConnect__Work_Order__c;
                            quoteCreate.qte.account = old_quote.MedConnect__Account__c;
                            quoteCreate.qte.contact = old_quote.MedConnect__Contact__c;
                            if (quoteCreate.revise === 'revise') {
                                quoteCreate.qte.status = 'Revised';
                                $scope.showAlertMessage($translate.instant("quote.quoteController.offlineSignedQuotecantbeReviseOffline"));
                            }
                            quoteCreate.quote = {};
                            quoteCreate.quote.Name = old_quote.Name;
                            quoteCreate.quote.MedConnect__Work_Order__r = {};
                            quoteCreate.quote.MedConnect__Work_Order__r.Name = quoteOff.currentPageOrderedEntries[0].WOName;
                            quoteCreate.quote.MedConnect__Account__r = {};
                            quoteCreate.quote.MedConnect__Account__r.Name = quoteOff.currentPageOrderedEntries[0].AccountName;
                            quoteCreate.quote.MedConnect__Contact__r = {};
                            quoteCreate.quote.MedConnect__Contact__r.Name = quoteOff.currentPageOrderedEntries[0].ContactName;

                            old_quote.MedConnect__Work_Order__r = {};
                            old_quote.MedConnect__Work_Order__r.Name = quoteOff.currentPageOrderedEntries[0].WOName;
                            old_quote.MedConnect__Account__r = {};
                            old_quote.MedConnect__Account__r.Name = quoteOff.currentPageOrderedEntries[0].AccountName;
                            old_quote.MedConnect__Contact__r = {};
                            old_quote.MedConnect__Contact__r.Name = quoteOff.currentPageOrderedEntries[0].ContactName;

                            $ionicLoading.hide();
                        }, 700);

                    } else {

                        var querySpec = navigator.smartstore.buildExactQuerySpec('Id', quoteCreate.quoteId);
                        navigator.smartstore.querySoup(SOUPINFO.WOQuotesGeneralInfo.Name, querySpec, function(quoteOff) {
                            if (quoteOff && quoteOff.currentPageOrderedEntries.length > 0) {
                                old_quote = quoteOff.currentPageOrderedEntries[0].data;
                                
                                setTimeout(function() {
                                    // console.log('split time 2',old_quote.MedConnect__Valid_Till__c);
                                    var valid_time = (old_quote.MedConnect__Valid_Till__c !== undefined) ? old_quote.MedConnect__Valid_Till__c.split("+") : '';
                                    if (valid_time && valid_time[0]) {
                                        quoteCreate.qte.valid_till = new Date(valid_time[0]);                                        
                                    }
                                    quoteCreate.qte.discount = old_quote.MedConnect__Discount__c;
                                    quoteCreate.qte.discountType = old_quote.MedConnect__Discount_Type__c;
                                    quoteCreate.qte.status = old_quote.MedConnect__Status__c;
                                    quoteCreate.qte.description = old_quote.MedConnect__Description__c;
                                    quoteCreate.qte.work_order = old_quote.MedConnect__Work_Order__c;
                                    quoteCreate.qte.account = old_quote.MedConnect__Account__c;
                                    quoteCreate.qte.contact = old_quote.MedConnect__Contact__c;
                                    if (quoteCreate.revise === 'revise') {
                                        quoteCreate.qte.status = 'Revised';
                                    }
                                    quoteCreate.quote = {};
                                    quoteCreate.quote.Name = old_quote.Name;
                                    quoteCreate.quote.MedConnect__Work_Order__r = {};
                                    quoteCreate.quote.MedConnect__Work_Order__r.Name = old_quote.MedConnect__Work_Order__r.Name;
                                    quoteCreate.quote.MedConnect__Account__r = {};
                                    quoteCreate.quote.MedConnect__Account__r.Name = old_quote.MedConnect__Account__r.Name;
                                    quoteCreate.quote.MedConnect__Contact__r = {};
                                    quoteCreate.quote.MedConnect__Contact__r.Name = old_quote.MedConnect__Contact__r.Name;

                                    $ionicLoading.hide();
                                }, 700);
                            } else {
                                quoteCreate.quote = {};
                                quoteCreate.quote.MedConnect__Work_Order__r = {};
                                quoteCreate.quote.MedConnect__Work_Order__r.Name = SharedPreferencesService.getWorkOrderName();
                                quoteCreate.quote.MedConnect__Account__r = {};
                                quoteCreate.quote.MedConnect__Account__r.Name = SharedPreferencesService.getAccountName();
                                quoteCreate.quote.MedConnect__Contact__r = {};
                                quoteCreate.quote.MedConnect__Contact__r.Name = SharedPreferencesService.getContactName();
                                $ionicLoading.hide();
                            }
                        });
                    }
                });
            });
        } else {

            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteCreate.quoteId);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(quoteOff) {
                if (quoteOff && quoteOff.currentPageOrderedEntries.length > 0) {
                   
                    old_quote = quoteOff.currentPageOrderedEntries[0].data;
                    old_quote_links = quoteOff.currentPageOrderedEntries[0];
                    quoteCreate.isLock = quoteOff.currentPageOrderedEntries[0].lock;
                    setTimeout(function() {
                        // console.log('split time 3',old_quote.MedConnect__Valid_Till__c);
                        var valid_time = (old_quote.MedConnect__Valid_Till__c !== undefined) ? old_quote.MedConnect__Valid_Till__c.split("+") : '';
                         if (valid_time && valid_time[0]) {
                            quoteCreate.qte.valid_till = new Date(valid_time[0]);                                        
                        }
                        quoteCreate.qte.discount = old_quote.MedConnect__Discount__c;
                        quoteCreate.qte.discountType = old_quote.MedConnect__Discount_Type__c;
                        quoteCreate.qte.status = old_quote.MedConnect__Status__c;
                        quoteCreate.qte.description = old_quote.MedConnect__Description__c;
                        quoteCreate.qte.work_order = old_quote.MedConnect__Work_Order__c;
                        quoteCreate.qte.account = old_quote.MedConnect__Account__c;
                        quoteCreate.qte.contact = old_quote.MedConnect__Contact__c;
                        quoteCreate.quote = {};
                        quoteCreate.quote.MedConnect__Work_Order__r = {};
                        quoteCreate.quote.MedConnect__Work_Order__r.Name = quoteOff.currentPageOrderedEntries[0].WOName;
                        quoteCreate.quote.MedConnect__Account__r = {};
                        quoteCreate.quote.MedConnect__Account__r.Name = quoteOff.currentPageOrderedEntries[0].AccountName;
                        quoteCreate.quote.MedConnect__Contact__r = {};
                        quoteCreate.quote.MedConnect__Contact__r.Name = quoteOff.currentPageOrderedEntries[0].ContactName;
                        quoteCreate.quote.Name = old_quote.Name;
                        old_quote.MedConnect__Work_Order__r = {};
                        old_quote.MedConnect__Work_Order__r.Name = quoteOff.currentPageOrderedEntries[0].WOName;
                        old_quote.MedConnect__Account__r = {};
                        old_quote.MedConnect__Account__r.Name = quoteOff.currentPageOrderedEntries[0].AccountName;
                        old_quote.MedConnect__Contact__r = {};
                        old_quote.MedConnect__Contact__r.Name = quoteOff.currentPageOrderedEntries[0].ContactName;

                        $ionicLoading.hide();
                    }, 700);

                } else {

                    var querySpec = navigator.smartstore.buildExactQuerySpec('Id', quoteCreate.quoteId);
                    navigator.smartstore.querySoup(SOUPINFO.WOQuotesGeneralInfo.Name, querySpec, function(quoteOff) {
                        if (quoteOff && quoteOff.currentPageOrderedEntries.length > 0) {
                            old_quote = quoteOff.currentPageOrderedEntries[0].data;
                            
                            setTimeout(function() {
                                // console.log('split time 4',old_quote.MedConnect__Valid_Till__c);
                                var valid_time = (old_quote.MedConnect__Valid_Till__c !== undefined) ? old_quote.MedConnect__Valid_Till__c.split("+") : '';
                                 if (valid_time && valid_time[0]) {
                                        quoteCreate.qte.valid_till = new Date(valid_time[0]);                                        
                                }
                                quoteCreate.qte.discount = old_quote.MedConnect__Discount__c;
                                quoteCreate.qte.discountType = old_quote.MedConnect__Discount_Type__c;
                                quoteCreate.qte.status = old_quote.MedConnect__Status__c;
                                quoteCreate.qte.description = old_quote.MedConnect__Description__c;
                                quoteCreate.qte.work_order = old_quote.MedConnect__Work_Order__c;
                                quoteCreate.qte.account = old_quote.MedConnect__Account__c;
                                quoteCreate.qte.contact = old_quote.MedConnect__Contact__c;
                                quoteCreate.quote = {};
                                quoteCreate.quote.Name = old_quote.Name;
                                quoteCreate.quote.MedConnect__Work_Order__r = {};
                                quoteCreate.quote.MedConnect__Work_Order__r.Name = old_quote.MedConnect__Work_Order__r.Name;
                                quoteCreate.quote.MedConnect__Account__r = {};
                                quoteCreate.quote.MedConnect__Account__r.Name = old_quote.MedConnect__Account__r.Name;
                                quoteCreate.quote.MedConnect__Contact__r = {};
                                quoteCreate.quote.MedConnect__Contact__r.Name = old_quote.MedConnect__Contact__r.Name;

                                $ionicLoading.hide();
                            }, 700);
                        } else {
                            quoteCreate.quote = {};
                            quoteCreate.quote.MedConnect__Work_Order__r = {};
                            quoteCreate.quote.MedConnect__Work_Order__r.Name = SharedPreferencesService.getWorkOrderName();
                            quoteCreate.quote.MedConnect__Account__r = {};
                            quoteCreate.quote.MedConnect__Account__r.Name = SharedPreferencesService.getAccountName();
                            quoteCreate.quote.MedConnect__Contact__r = {};
                            quoteCreate.quote.MedConnect__Contact__r.Name = SharedPreferencesService.getContactName();
                            $ionicLoading.hide();
                        }
                    });
                }
            });
            $ionicLoading.hide();
        }


    };

    if ($stateParams.revise && $stateParams.revise === 'revise') {
        if (quoteCreate.quoteId.length === 18) {
            var q_id = quoteCreate.quoteId;
            quoteCreate.fetchQuoteDetails(q_id);

        }
    }


    if (quoteCreate.workorderId && quoteCreate.workorderId !== 'null') {
        WorkOrderService.getWorkOrderContactsAccountsById(quoteCreate.workorderId).
        then(function(wo_Details) {
            console.log('wo_Details',wo_Details);
            quoteCreate.workOrder = wo_Details.records[0];
        }, function(err) {
        });
    }


    if (quoteCreate.quoteId.length && $stateParams.revise !== 'revise') {
        var q_id2 = quoteCreate.quoteId;
        quoteCreate.fetchQuoteDetails(q_id2);
    }



    quoteCreate.quoteSave = function(quoteForm) {
        if (quoteForm.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading"|translate}}...'
            });
            var quoteData = {};
            quoteData.MedConnect__Status__c = quoteCreate.qte.status;
            quoteData.MedConnect__Valid_Till__c = quoteCreate.qte.valid_till.toISOString();
            quoteData.MedConnect__Discount__c = quoteCreate.qte.discount;
            quoteData.MedConnect__Discount_Type__c = quoteCreate.qte.discountType;
            quoteData.MedConnect__Description__c = quoteCreate.qte.description;
            quoteData.MedConnect__Reason_For_Change__c = quoteCreate.qte.change_reason || '';

            if (quoteCreate.quoteId.length === 18 && quoteCreate.revise !== 'revise') {
                quoteData.Id = quoteCreate.quoteId;
                QuoteService.updateQuote(quoteData).then(function(qte_updated) {
                        
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteCreate.quoteId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp.currentPageOrderedEntries.length > 0) {
                                DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, quoteCreate.quoteId);
                            }
                        });
                        toastr.success($translate.instant("quote.quoteController.quoteupdatedsuccessfully"));
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        
                        $ionicLoading.hide();
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            navigator.notification.confirm(
                                 $translate.instant("quote.quoteController.doyouwanttoedittheQuoteOffline")+'?',
                                function(buttonIndex) {
                                    quoteCreate.editQuoteOffline(buttonIndex, old_quote, quoteData, quoteCreate.quoteId);
                                },
                                $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                            );
                        }
                    });

            } else {
                
                quoteData.MedConnect__Account__c = (SharedPreferencesService.getAccountId() !== '') ? SharedPreferencesService.getAccountId() : quoteCreate.qte.account;
                quoteData.MedConnect__Contact__c = (SharedPreferencesService.getContactId() !== '') ? SharedPreferencesService.getContactId() : quoteCreate.qte.contact;
                quoteData.MedConnect__Work_Order__c = (SharedPreferencesService.getWorkOrderId() !== '') ? SharedPreferencesService.getWorkOrderId() : quoteCreate.qte.work_order;


                if (quoteCreate.quoteId.length === 18 && quoteCreate.revise === 'revise') {

                    delete quoteData.MedConnect__Account__c;
                    delete quoteData.MedConnect__Contact__c;
                    delete quoteData.MedConnect__Work_Order__c;
                    quoteData.MedConnect__Parent_Quote__c = quoteCreate.quoteId;
                    var syncingNewRevise = {};
                    var randomId2 = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number

                    var ReviseObject = {
                        "action": 'RQTE',
                        "refId": randomId2,
                        "data": quoteData
                    };
                    syncingNewRevise.records = [ReviseObject];
                    SyncUpDataService.doSyncUp(syncingNewRevise).then(function(suc) {
                        
                        if (suc) {
                            if (suc.results.status === "Success") {
                                toastr.success($translate.instant("quote.quoteController.quoteReviseSuccessfully"));
                                $state.go('app.wo-quote', { "quoteId": suc.results.sfdcId, "workOrderID": quoteCreate.workOrder.Id });

                            } else {
                                if (suc.results.status === 'Failure') {
                                    toastr.error($translate.instant("quote.quoteController.unabletoReviseQuote"));
                                }
                            }
                        }
                    }, function(err) {
                        delete quoteData.MedConnect__Account__c;
                        delete quoteData.MedConnect__Contact__c;
                        delete quoteData.MedConnect__Work_Order__c;
                        quoteData.MedConnect__Parent_Quote__c = quoteCreate.quoteId;
                        var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                        var qteName = "Quote Revise -" + randomId;
                        var offlineObj = {
                            "action": "New",
                            "type": "RQTE",
                            "Name": qteName,
                            "WOName": SharedPreferencesService.getWorkOrderName() + ' [This Quote can be accessible after Syncing]',
                            "data": quoteData,
                            "randomId": randomId,
                            "resync": false,
                            "createdDate": new Date().getTime().toString(),
                            "href":"javascript:void(0)"
                        };

                        navigator.notification.confirm(
                            $translate.instant("quote.quoteController.doyouwanttoRevisetheQuoteOffline")+'?',
                            function(buttonIndex) {
                                if (buttonIndex === 1) {
                                    DataService.setOfflineSoupData(offlineObj).then(function() {
                                        toastr.info($translate.instant("quote.quoteController.quoterevisedofflinesuccessfully"));
                                        var querySpec = navigator.smartstore.buildExactQuerySpec('Id', quoteCreate.quoteId);
                                        navigator.smartstore.querySoup(SOUPINFO.WOQuotesGeneralInfo.Name, querySpec, function(offlineQuoteData) {
                                            if (offlineQuoteData && offlineQuoteData.currentPageOrderedEntries.length > 0) {
                                                
                                                var obj = offlineQuoteData.currentPageOrderedEntries[0].data;
                                                
                                                obj.MedConnect__Child_Quote__c = quoteCreate.quoteId;
                                                offlineQuoteData.currentPageOrderedEntries[0].data = obj;
                                                
                                                DataService.setSoupData(SOUPINFO.WOQuotesGeneralInfo, offlineQuoteData.currentPageOrderedEntries);
                                                $timeout(function(){
                                                   $ionicHistory.goBack();
                                                    $ionicLoading.hide(); 
                                                },1500);
                                            }
                                        });
                                    });
                                } else {
                                    $ionicHistory.goBack();
                                    $ionicLoading.hide();
                                }
                            },
                            'Medvantage', ['Confirm', 'Cancel']
                        );
                    });
                    
                } else if (quoteCreate.revise === 'norevise') {
                    QuoteService.createQuote(quoteData).then(function(qte_added) {
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteCreate.quoteId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp.currentPageOrderedEntries.length > 0) {
                                    DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, quoteCreate.quoteId);
                                    toastr.success($translate.instant("quote.quoteController.quotecreatedsuccessfully"));
                                    $ionicLoading.hide();
                                    $ionicHistory.goBack(-2);
                                } else { 
                                    toastr.success($translate.instant("quote.quoteController.quotecreatedsuccessfully"));
                                    $ionicLoading.hide();
                                    $state.go('app.wo-quote', { "quoteId": qte_added.id, "workOrderID": quoteCreate.workOrder.Id });

                                }
                            });

                        },
                        function(err) {
                            
                            $ionicLoading.hide();
                            if (NetworkService.isDeviceOnline()) {
                                $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                            } else {
                                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteCreate.quoteId);
                                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                    if (resp.currentPageOrderedEntries.length > 0) {
                                        navigator.notification.confirm(
                                            $translate.instant("quote.quoteController.doyouwanttoedittheQuoteOffline")+'?',
                                            function(buttonIndex) {
                                                quoteCreate.createQuoteOffline(buttonIndex, quoteData);
                                            },
                                            $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                                        );
                                    } else {
                                        navigator.notification.confirm(
                                        $translate.instant("quote.quoteController.doyouwanttoaddtheQuoteOffline")+'?',
                                            function(buttonIndex) {
                                                quoteCreate.createQuoteOffline(buttonIndex, quoteData);
                                            },
                                            $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                                        );

                                    }
                                });
                            }
                        });
                }

            }
        }
    };

    quoteCreate.createQuoteOffline = function(buttonIndex, quoteData) {
        if (buttonIndex === 1) {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });


            if (quoteCreate.quoteId !== '' && quoteCreate.quoteId !== 'null') {
                var offlineObj = {};
                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteCreate.quoteId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                    if (resp.currentPageOrderedEntries.length > 0) {
                        var obj = resp.currentPageOrderedEntries[0];
                        offlineObj.action = obj.action;
                        offlineObj.type = obj.type;
                        offlineObj.Name = obj.Name;
                        offlineObj.WOName = obj.WOName;
                        offlineObj.AccountName = obj.AccountName;
                        offlineObj.ContactName = obj.ContactName;
                        offlineObj.object = obj.object;
                        offlineObj.data = quoteData;
                        offlineObj.randomId = quoteCreate.quoteId;
                        offlineObj.resync = obj.resync;
                        offlineObj.createdDate = new Date().getTime().toString();
                        offlineObj.href = obj.href;
                        DataService.setOfflineSoupData(offlineObj).then(function() {
                            toastr.info($translate.instant("quote.quoteController.quotemodifiedofflinesuccessfully"));
                            $ionicHistory.goBack();
                        });
                    }
                });
            } else {
                var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                var actName = "Quote-" + randomId;
                var offlineObj2 = {
                    "action": "New",
                    "type": "QTE",
                    "Name": actName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "AccountName": SharedPreferencesService.getAccountName(),
                    "ContactName": SharedPreferencesService.getContactName(),
                    "data": quoteData,
                    "randomId": randomId,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/quote/" + randomId + "/" + SharedPreferencesService.getWorkOrderId()
                };

                DataService.setOfflineSoupData(offlineObj2).then(function() {
                    toastr.info($translate.instant("quote.quoteController.quotecreatedofflinesuccessfully"));
                    $ionicHistory.goBack();
                });
            }
        }
    };
    quoteCreate.editQuoteOffline = function(buttonIndex, old_quote_links, quoteData, qteId) {
        if (buttonIndex === 1) {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner>  {{"quote.quoteController.loading" | translate}}...'
            });
            var promises = [];
            var offlineObj = {
                "action": "Edit",
                "type": "QTE",
                "Name": old_quote_links.Name,
                "WOName": old_quote_links.MedConnect__Work_Order__r.Name,
                "AccountName": old_quote_links.MedConnect__Account__r.Name,
                "ContactName": old_quote_links.MedConnect__Contact__r.Name,
                "data": quoteData,
                "randomId": qteId,
                "resync": false,
                "lock": true,
                "createdDate": new Date().getTime().toString(),
                "href": "#/app/quote/" + qteId + "/" + SharedPreferencesService.getWorkOrderId()
            };
            var querySpec = navigator.smartstore.buildExactQuerySpec('Id', qteId);
            navigator.smartstore.querySoup(SOUPINFO.WOQuotesGeneralInfo.Name, querySpec, function(resp) {
                var rec = resp.currentPageOrderedEntries[0].data;
                rec.MedConnect__Status__c = quoteCreate.qte.status;
                rec.MedConnect__Valid_Till__c = quoteCreate.qte.valid_till.toISOString();
                rec.MedConnect__Discount__c = quoteCreate.qte.discount;
                rec.MedConnect__Discount_Type__c = quoteCreate.qte.discountType;
                rec.MedConnect__Description__c = quoteCreate.qte.description;
                rec.MedConnect__Reason_For_Change__c = quoteCreate.qte.change_reason || '';
                resp.currentPageOrderedEntries[0].data = rec;
                promises.push(DataService.setSoupData(SOUPINFO.WOQuotesGeneralInfo, resp.currentPageOrderedEntries));

            }, function(er) {
                $ionicLoading.hide();
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info($translate.instant("quote.quoteController.quoteupdatedofflinesuccessfully"));
                $ionicHistory.goBack();
            });
        }
    };

}

function QuoteExpenseCtrl($q, $scope, QuoteService, $stateParams, $state, $ionicLoading, toastr, $ionicHistory, NetworkService, DataService, SOUPINFO, SharedPreferencesService, $translate) {
    var quoteExpense = this;
    quoteExpense.quoteId = $stateParams.quoteId;
    quoteExpense.expenseId = $stateParams.expenseId;
    quoteExpense.quoteName = $stateParams.quoteName;

    quoteExpense.exp = {};
    quoteExpense.takeMeBack = function() {
        $ionicHistory.goBack();
    };
    if (quoteExpense.expenseId.length === 18) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });
        QuoteService.getQuoteLineItemsDetails(quoteExpense.expenseId, 'Expense').then(function(quoteExpenseRes) {
            
            if (quoteExpenseRes) {
                quoteExpense.expense = quoteExpenseRes.records[0];
                quoteExpense.exp.type = quoteExpense.expense.MedConnect__Expense_Type__c;
                quoteExpense.exp.billable = quoteExpense.expense.MedConnect__Billable__c;
                quoteExpense.exp.applyWarranty = quoteExpense.expense.MedConnect__Apply_Warranty__c;
                quoteExpense.exp.amount = quoteExpense.expense.MedConnect__Expense_Amount__c;
                quoteExpense.exp.discount = quoteExpense.expense.MedConnect__Discount__c;
                quoteExpense.exp.discountType = quoteExpense.expense.MedConnect__Discount_Type__c;
                quoteExpense.exp.description = quoteExpense.expense.MedConnect__Description__c;

            }
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();
            if (NetworkService.isDeviceOnline()) {
                $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            } else {
                quoteExpense.getQuoteExpenseOffline(quoteExpense.expenseId);
            }
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteExpense.expenseId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {

                quoteExpense.expense = resp.currentPageOrderedEntries[0].data;
                quoteExpense.exp.type = quoteExpense.expense.MedConnect__Expense_Type__c;
                quoteExpense.exp.billable = quoteExpense.expense.MedConnect__Billable__c;
                quoteExpense.exp.applyWarranty = quoteExpense.expense.MedConnect__Apply_Warranty__c;
                quoteExpense.exp.amount = quoteExpense.expense.MedConnect__Expense_Amount__c;
                quoteExpense.exp.discount = quoteExpense.expense.MedConnect__Discount__c;
                quoteExpense.exp.discountType = quoteExpense.expense.MedConnect__Discount_Type__c;
                quoteExpense.exp.description = quoteExpense.expense.MedConnect__Description__c;

                $ionicLoading.hide();
            }
        });
    }

    quoteExpense.expenseSave = function(expenseForm) {
       
        if (expenseForm.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });
            var quoteExpData = {};
            quoteExpData.MedConnect__Expense_Type__c = quoteExpense.exp.type;
            quoteExpData.MedConnect__Billable__c = quoteExpense.exp.billable;
            quoteExpData.MedConnect__Apply_Warranty__c = quoteExpense.exp.applyWarranty;
            quoteExpData.MedConnect__Expense_Amount__c = quoteExpense.exp.amount;
            quoteExpData.MedConnect__Discount__c = quoteExpense.exp.discount;
            quoteExpData.MedConnect__Discount_Type__c = quoteExpense.exp.discountType;
            quoteExpData.MedConnect__Description__c = quoteExpense.exp.description;
            
            if (quoteExpense.expenseId.length === 18) {
                
                quoteExpData.MedConnect__Reason_For_Change__c = quoteExpense.exp.change_reason || '';
               
                quoteExpData.Id = quoteExpense.expenseId;
                QuoteService.updateQuoteLineItems(quoteExpData).then(function(exp_updated) {
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteExpense.expenseId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp.currentPageOrderedEntries.length !== 0) {
                                DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, quoteExpense.expenseId);
                            }
                        });
                        toastr.success($translate.instant("quote.quoteController.expenseupdatedsuccessfully"));
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        $ionicLoading.hide();
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            navigator.notification.confirm(
                                $translate.instant("quote.quoteController.doyouwanttoedittheExpenseOffline")+'?',
                                function(buttonIndex) {
                                    quoteExpense.editQuoteExpenseOffline(buttonIndex, quoteExpense, quoteExpData, quoteExpense.expenseId);
                                },
                                $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                            );
                        }
                    });
            } else {
                quoteExpData.MedConnect__Quote__c = quoteExpense.quoteId;
                quoteExpData.MedConnect__Line_Type__c = 'Expense';
                QuoteService.createQuoteLineItems(quoteExpData).then(function(exp_added) {
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteExpense.expenseId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp.currentPageOrderedEntries.length > 0) {
                                DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, quoteExpense.expenseId);
                                toastr.success($translate.instant("quote.quoteController.expensecreatedsuccessfully"));
                                $ionicLoading.hide();
                                $ionicHistory.goBack(-2);
                            } else {
                                toastr.success($translate.instant("quote.quoteController.expensecreatedsuccessfully"));
                                $ionicHistory.goBack(-1);
                            }
                        });
                    },
                    function(err) {
                       
                        $ionicLoading.hide();
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage($translate.instant("quote.quoteController.errorCode")+': ' + err[0].errorCode + '\n'+$translate.instant("quote.quoteController.errorMessage")+': ' + err[0].message);
                        } else {
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteExpense.expenseId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if(resp && resp.currentPageOrderedEntries.length > 0) {
                                    navigator.notification.confirm(
                                         $translate.instant("quote.quoteController.doyouwanttoedittheExpenseOffline")+'?',
                                        function(buttonIndex) {
                                            quoteExpense.createQuoteExpenseOffline(buttonIndex, quoteExpData, quoteExpense.expenseId);
                                        },
                                        $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                                    );
                                } else {
                                     navigator.notification.confirm(
                                       $translate.instant("quote.quoteController.doyouwanttocreatetheExpenseOffline") +'?',
                                        function(buttonIndex) {
                                            quoteExpense.createQuoteExpenseOffline(buttonIndex, quoteExpData, quoteExpense.expenseId);
                                        },
                                         $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                                    );
                                }
                            });
                        }
                    });
            }
        }
    };

    quoteExpense.getQuoteExpenseOffline = function(expenseId) {

        DataService.getSoupData(SOUPINFO.WOQuotesExpenses, 100).then(function(entries) {
            $.map(entries.currentPageOrderedEntries, function(obj, index) {
                if (obj.Id === quoteExpense.quoteId) {
                    var ExpenseIdIndex = $.map(entries.currentPageOrderedEntries[index].data, function(obj, subIndex) {
                        if (obj.Id === expenseId) {
                            return subIndex; 
                        } 
                    }); 

                    quoteExpense.expense = entries.currentPageOrderedEntries[index].data[ExpenseIdIndex];
                    quoteExpense.exp.type = quoteExpense.expense.MedConnect__Expense_Type__c;
                    quoteExpense.exp.billable = quoteExpense.expense.MedConnect__Billable__c;
                    quoteExpense.exp.applyWarranty = quoteExpense.expense.MedConnect__Apply_Warranty__c;
                    quoteExpense.exp.amount = quoteExpense.expense.MedConnect__Expense_Amount__c;
                    quoteExpense.exp.discount = quoteExpense.expense.MedConnect__Discount__c;
                    quoteExpense.exp.discountType = quoteExpense.expense.MedConnect__Discount_Type__c;
                    quoteExpense.exp.description = quoteExpense.expense.MedConnect__Description__c;
                } 
            }); 
        });
    };

    quoteExpense.createQuoteExpenseOffline = function(buttonIndex, new_quote_exp, quoteExpenseId) {
        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });

            if (quoteExpense.quoteId !== '' && quoteExpense.quoteId !== 'null') {

                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteExpense.quoteId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(offlineQuote) {
                    if (offlineQuote && offlineQuote.currentPageOrderedEntries.length > 0) {
                        var obj = offlineQuote.currentPageOrderedEntries[0];
                        var offlineQuoteData = obj.data;
                        delete new_quote_exp.MedConnect__Quote__c;
                        if (offlineQuoteData.hasOwnProperty('Quote_Line_Items')) {
                            offlineQuoteData.Quote_Line_Items.push(new_quote_exp);
                        } else {
                            offlineQuoteData.Quote_Line_Items = [new_quote_exp];
                        }

                        obj.data = offlineQuoteData;
                        DataService.setOfflineSoupData(obj).then(function() {
                            toastr.info($translate.instant("quote.quoteController.expensesavedtoQuoteofflinesuccessfully"));
                            $ionicHistory.goBack();
                        });

                    } else {
                        if (quoteExpenseId !== '' && quoteExpenseId !== 'null') {
                            var offlineObj = {};
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteExpenseId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp.currentPageOrderedEntries.length > 0) {
                                    var obj = resp.currentPageOrderedEntries[0];
                                    offlineObj.action = obj.action;
                                    offlineObj.type = obj.type;
                                    offlineObj.Name = obj.Name;
                                    offlineObj.WOName = obj.WOName;
                                    offlineObj.object = obj.object;
                                    offlineObj.data = new_quote_exp;
                                    offlineObj.randomId = quoteExpenseId;
                                    offlineObj.resync = obj.resync;
                                    offlineObj.createdDate = new Date().getTime().toString();
                                    offlineObj.href = obj.href;

                                    DataService.setOfflineSoupData(offlineObj).then(function() {
                                        toastr.info($translate.instant("quote.quoteController.expensemodifiedofflinesuccessfully"));
                                        $ionicHistory.goBack();
                                    });
                                }
                            });
                        } else {
                            var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                            var expName = "QN-Exp-" + randomId;
                            var offlineObj3 = {
                                "action": "New",
                                "type": "QLI",
                                "Name": expName,
                                "WOName": SharedPreferencesService.getWorkOrderName(),
                                "data": new_quote_exp,
                                "randomId": randomId,
                                "resync": false,
                                "createdDate": new Date().getTime().toString(),
                                "href": "#/app/add-quote-expense/" + randomId + "/" + quoteExpense.quoteId + "/" + quoteExpense.quoteName
                            };

                            DataService.setOfflineSoupData(offlineObj3).then(function() {
                                toastr.info($translate.instant("quote.quoteController.expensecreatedofflinesuccessfully"));
                                $ionicHistory.goBack();
                            });
                        }
                    }
                });
            }
        }
    };

    quoteExpense.editQuoteExpenseOffline = function(buttonIndex, old_quote_exp, new_quote_exp, quoteExpenseId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });

            var promises = [],
                offlineObj = {
                    "action": "Edit",
                    "type": "QLI",
                    "Name": old_quote_exp.quoteName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "data": new_quote_exp,
                    "randomId": quoteExpenseId,
                    "resync": false,
                    "lock": true,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/add-quote-expense/" + quoteExpenseId + "/" + old_quote_exp.quoteId + "/" + old_quote_exp.quoteName
                };

            DataService.getSoupData(SOUPINFO.WOQuotesExpenses, 100).then(function(entries) {
                $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === quoteExpense.quoteId) {
                        var ExpenseIdIndex = $.map(entries.currentPageOrderedEntries[index].data, function(obj, subIndex) {
                            if (obj.Id === quoteExpenseId) {
                                return subIndex; 
                            } 
                        }); 

                        quoteExpense.expense = entries.currentPageOrderedEntries[index].data[ExpenseIdIndex];
                        quoteExpense.expense.MedConnect__Expense_Type__c = new_quote_exp.MedConnect__Expense_Type__c;
                        quoteExpense.expense.MedConnect__Billable__c = new_quote_exp.MedConnect__Billable__c;
                        quoteExpense.expense.MedConnect__Apply_Warranty__c = new_quote_exp.MedConnect__Apply_Warranty__c;
                        quoteExpense.expense.MedConnect__Expense_Amount__c = new_quote_exp.MedConnect__Expense_Amount__c;
                        quoteExpense.expense.MedConnect__Discount__c = new_quote_exp.MedConnect__Discount__c;
                        quoteExpense.expense.MedConnect__Discount_Type__c = new_quote_exp.MedConnect__Discount_Type__c;
                        quoteExpense.expense.MedConnect__Description__c = new_quote_exp.MedConnect__Description__c;

                        entries.currentPageOrderedEntries[index].data[ExpenseIdIndex] = quoteExpense.expense;
                        promises.push(DataService.setSoupData(SOUPINFO.WOQuotesExpenses, entries.currentPageOrderedEntries));
                    } 
                }); 
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info($translate.instant("quote.quoteController.expenseismodifiedsuccessfullyinoffline"));
                $ionicHistory.goBack();
            });
        }
    };
}

function QuoteLabourCtrl($q, $scope, QuoteService, $stateParams, $state, $ionicLoading, toastr, $ionicHistory, NetworkService, SharedPreferencesService, DataService, SOUPINFO, $timeout,$translate) {
    var quoteLabour = this;
    quoteLabour.quoteId = $stateParams.quoteId;
    quoteLabour.labourId = $stateParams.labourId;
    quoteLabour.quoteName = $stateParams.quoteName;
    var appointedTechId = SharedPreferencesService.getAppointedTechnicianId();

    function showMessage(message) {
        navigator.notification.alert(message, alertDismissed, $translate.instant("quote.quoteController.medvantage"), $translate.instant("quote.quoteController.OK"));
    }

    function alertDismissed() {}

    quoteLabour.lab = {};
    quoteLabour.takeMeBack = function() {
        $ionicHistory.goBack(-1);
    };

    if (quoteLabour.labourId.length === 18) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });
        QuoteService.getQuoteLineItemsDetails(quoteLabour.labourId, 'Labour').
        then(function(quoteLabourRes) {
            
            if (quoteLabourRes) {
                quoteLabour.labour = quoteLabourRes.records[0];
                quoteLabour.lab.Activitytype = quoteLabour.labour.MedConnect__Activity_Type__c;
                quoteLabour.lab.RateType = quoteLabour.labour.MedConnect__Applied_Rate_Type__c;
                quoteLabour.lab.hours = quoteLabour.labour.MedConnect__Hours_Worked__c;
                quoteLabour.lab.rate = quoteLabour.labour.MedConnect__Rate__c;
                quoteLabour.lab.billable = quoteLabour.labour.MedConnect__Billable__c;
                quoteLabour.lab.applyWarranty = quoteLabour.labour.MedConnect__Apply_Warranty__c;
                quoteLabour.lab.discount = quoteLabour.labour.MedConnect__Discount__c;
                quoteLabour.lab.discountType = quoteLabour.labour.MedConnect__Discount_Type__c;
                quoteLabour.lab.description = quoteLabour.labour.MedConnect__Description__c;

            }
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();
            if (NetworkService.isDeviceOnline()) {
                $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            } else {
                quoteLabour.getQuoteLabourOffline(quoteLabour.labourId);
            }
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteLabour.labourId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {

                quoteLabour.labour = resp.currentPageOrderedEntries[0].data;
                quoteLabour.lab.Activitytype = quoteLabour.labour.MedConnect__Activity_Type__c;
                quoteLabour.lab.RateType = quoteLabour.labour.MedConnect__Applied_Rate_Type__c;
                quoteLabour.lab.hours = quoteLabour.labour.MedConnect__Hours_Worked__c;
                quoteLabour.lab.rate = quoteLabour.labour.MedConnect__Rate__c;
                quoteLabour.lab.billable = quoteLabour.labour.MedConnect__Billable__c;
                quoteLabour.lab.applyWarranty = quoteLabour.labour.MedConnect__Apply_Warranty__c;
                quoteLabour.lab.discount = quoteLabour.labour.MedConnect__Discount__c;
                quoteLabour.lab.discountType = quoteLabour.labour.MedConnect__Discount_Type__c;
                quoteLabour.lab.description = quoteLabour.labour.MedConnect__Description__c;

                $ionicLoading.hide();
            }
        });
    }

    quoteLabour.getQuoteLabourOffline = function(labourId) {

        DataService.getSoupData(SOUPINFO.WOQuotesLabours, 100).then(function(entries) {
            $.map(entries.currentPageOrderedEntries, function(obj, index) {
                if (obj.Id === quoteLabour.quoteId) {
                    var LabourIdIndex = $.map(entries.currentPageOrderedEntries[index].data, function(obj, subIndex) {
                        if (obj.Id === labourId) {
                            return subIndex; 
                        } 
                    }); 

                    quoteLabour.labour = entries.currentPageOrderedEntries[index].data[LabourIdIndex];
                    quoteLabour.lab.Activitytype = quoteLabour.labour.MedConnect__Activity_Type__c;
                    quoteLabour.lab.RateType = quoteLabour.labour.MedConnect__Applied_Rate_Type__c;
                    quoteLabour.lab.hours = quoteLabour.labour.MedConnect__Hours_Worked__c;
                    quoteLabour.lab.rate = quoteLabour.labour.MedConnect__Rate__c;
                    quoteLabour.lab.billable = quoteLabour.labour.MedConnect__Billable__c;
                    quoteLabour.lab.applyWarranty = quoteLabour.labour.MedConnect__Apply_Warranty__c;
                    quoteLabour.lab.discount = quoteLabour.labour.MedConnect__Discount__c;
                    quoteLabour.lab.discountType = quoteLabour.labour.MedConnect__Discount_Type__c;
                    quoteLabour.lab.description = quoteLabour.labour.MedConnect__Description__c;

                } 
            }); 
        });
    };

    quoteLabour.changeRateOnActivity = function(activity_type) {

        if (typeof activity_type !== undefined && activity_type !== '' && activity_type !== null) {
            if (NetworkService.isDeviceOnline()) {
                QuoteService.getTechnicianRate(activity_type, appointedTechId).then(function(data) {
                    if (data.records.length > 0) {
                        if (data.records[0].MedConnect__Rate_Hr__c !== null) {
                            quoteLabour.lab.rate = data.records[0].MedConnect__Rate_Hr__c;
                        } else {
                            quoteLabour.lab.rate = 0;
                        }
                    } else {
                        quoteLabour.lab.rate = 0;
                    }
                }, function(err) {
                    showMessage('Error Code: ' + err[0].errorCode + '\n Error message: ' + err[0].message);
                });
            } else {
                DataService.getSoupData(SOUPINFO.technicianRateHrList).then(function(entries) {
                    var bool = false;
                    if (entries.currentPageOrderedEntries.length > 0) {
                        angular.forEach(entries.currentPageOrderedEntries, function(value, index) {
                            if (value.MedConnect__Activity__c === activity_type && value.MedConnect__Technician__c === appointedTechId) {
                                if (null !== value.MedConnect__Rate_Hr__c) {
                                    bool = true;
                                    quoteLabour.lab.rate = value.MedConnect__Rate_Hr__c;
                                } else {
                                    bool = false;
                                    quoteLabour.lab.rate = 0;
                                }
                            }
                        });
                        if (!bool) {
                            quoteLabour.lab.rate = 0;
                        }
                    } else {
                        quoteLabour.lab.rate = 0;
                    }
                }, function(error) {
                });
            }
        }
    };

    quoteLabour.labourSave = function(labourForm) {

        if (labourForm.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });
            var quoteLabData = {};

            quoteLabData.MedConnect__Activity_Type__c = quoteLabour.lab.Activitytype;
            quoteLabData.MedConnect__Applied_Rate_Type__c = quoteLabour.lab.RateType;
            quoteLabData.MedConnect__Hours_Worked__c = quoteLabour.lab.hours;
            quoteLabData.MedConnect__Rate__c = quoteLabour.lab.rate;
            quoteLabData.MedConnect__Billable__c = quoteLabour.lab.billable;
            quoteLabData.MedConnect__Apply_Warranty__c = quoteLabour.lab.applyWarranty;
            quoteLabData.MedConnect__Discount__c = quoteLabour.lab.discount;
            quoteLabData.MedConnect__Discount_Type__c = quoteLabour.lab.discountType;
            quoteLabData.MedConnect__Description__c = quoteLabour.lab.description;

            if (quoteLabour.labourId.length === 18) {
                
                quoteLabData.MedConnect__Reason_For_Change__c = quoteLabour.lab.change_reason || '';
                quoteLabData.Id = quoteLabour.labourId;
                QuoteService.updateQuoteLineItems(quoteLabData).then(function(lab_updated) {
                        
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteLabour.labourId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp.currentPageOrderedEntries.length !== 0) {
                                DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, quoteLabour.labourId);
                            }
                        });
                        toastr.success($translate.instant("quote.quoteController.laborupdatedsuccessfully"));
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        $ionicLoading.hide();
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage($translate.instant("quote.quoteController.errorCode")+': ' + err[0].errorCode + '\n'+$translate.instant("quote.quoteController.errorMessage")+': ' + err[0].message);
                        } else {
                            navigator.notification.confirm(
                                $translate.instant("quote.quoteController.doyouwanttoedittheLabourOffline"),
                                function(buttonIndex) {
                                    quoteLabour.editQuoteLabourOffline(buttonIndex, quoteLabour, quoteLabData, quoteLabour.labourId);
                                },
                                 $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                            );
                        }
                    });
            } else {
                
                quoteLabData.MedConnect__Quote__c = quoteLabour.quoteId;
                quoteLabData.MedConnect__Line_Type__c = 'Labour';
                QuoteService.createQuoteLineItems(quoteLabData).then(function(lab_added) {
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteLabour.labourId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp.currentPageOrderedEntries.length > 0) {
                                DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, quoteLabour.labourId);
                                toastr.success($translate.instant("quote.quoteController.laborcreatedsuccessfully" ));
                                $ionicLoading.hide();
                                $ionicHistory.goBack(-2);
                            } else {
                                toastr.success($translate.instant("quote.quoteController.laborcreatedsuccessfully" ));
                                $ionicHistory.goBack(-1);
                            }
                        });
                    },
                    function(err) {
                        $ionicLoading.hide();
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteLabour.labourId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp.currentPageOrderedEntries.length > 0) {
                                    navigator.notification.confirm(
                                       $translate.instant("quote.quoteController.doyouwanttoedittheLabourOffline"),
                                        function(buttonIndex) {
                                            quoteLabour.createQuoteLabourOffline(buttonIndex, quoteLabData, quoteLabour.labourId);
                                        },
                                        $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                                    );
                                } else {
                                    navigator.notification.confirm(
                                        $translate.instant("quote.quoteController.doyouwanttocreatetheLabourOffline"),
                                        function(buttonIndex) {
                                            quoteLabour.createQuoteLabourOffline(buttonIndex, quoteLabData, quoteLabour.labourId);
                                        },
                                        $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                                    );
                                }
                            });
                        }
                    });
            }
        }
    };

    quoteLabour.createQuoteLabourOffline = function(buttonIndex, new_quote_lab, quoteLabourId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });

            if (quoteLabour.quoteId !== '' && quoteLabour.quoteId !== 'null') {

                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteLabour.quoteId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(offlineQuote) {
                    if (offlineQuote && offlineQuote.currentPageOrderedEntries.length > 0) {
                        var obj = offlineQuote.currentPageOrderedEntries[0];
                        var offlineQuoteData = obj.data;
                        delete new_quote_lab.MedConnect__Quote__c;
                        if (offlineQuoteData.hasOwnProperty('Quote_Line_Items')) {
                            offlineQuoteData.Quote_Line_Items.push(new_quote_lab);
                        } else {
                            offlineQuoteData.Quote_Line_Items = [new_quote_lab];
                        }

                        obj.data = offlineQuoteData;
                        DataService.setOfflineSoupData(obj).then(function() {
                            toastr.info($translate.instant("quote.quoteController.laboursavedtoQuoteofflinesuccessfully"));
                            $ionicHistory.goBack();
                        });
                    } else {
                        if (quoteLabourId !== '' && quoteLabourId !== 'null') {
                            var offlineObj = {};
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteLabourId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp.currentPageOrderedEntries.length > 0) {
                                    var obj = resp.currentPageOrderedEntries[0];
                                    offlineObj.action = obj.action;
                                    offlineObj.type = obj.type;
                                    offlineObj.Name = obj.Name;
                                    offlineObj.WOName = obj.WOName;
                                    offlineObj.object = obj.object;
                                    offlineObj.data = new_quote_lab;
                                    offlineObj.randomId = quoteLabourId;
                                    offlineObj.resync = obj.resync;
                                    offlineObj.createdDate = new Date().getTime().toString();
                                    offlineObj.href = obj.href;

                                    DataService.setOfflineSoupData(offlineObj).then(function() {
                                        toastr.info($translate.instant("quote.quoteController.labourmodifiedofflinesuccessfully"));
                                        $ionicHistory.goBack();
                                    });
                                }
                            });
                        } else {
                            var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                            var labName = "QN-Lab-" + randomId;
                            var offlineObj4 = {
                                "action": "New",
                                "type": "QLI",
                                "Name": labName,
                                "WOName": SharedPreferencesService.getWorkOrderName(),
                                "data": new_quote_lab,
                                "randomId": randomId,
                                "resync": false,
                                "createdDate": new Date().getTime().toString(),
                                "href": "#/app/add-quote-labour/" + randomId + "/" + quoteLabour.quoteId + "/" + quoteLabour.quoteName
                            };

                            DataService.setOfflineSoupData(offlineObj4).then(function() {
                                toastr.info($translate.instant("quote.quoteController.labourcreatedofflinesuccessfully"));
                                $ionicHistory.goBack();
                            });
                        }
                    }
                });
            }
        }
    };

    quoteLabour.editQuoteLabourOffline = function(buttonIndex, old_quote_lab, new_quote_lab, quoteLabourId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });

            var promises = [],
                offlineObj = {
                    "action": "Edit",
                    "type": "QLI",
                    "Name": old_quote_lab.quoteName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "data": new_quote_lab,
                    "randomId": quoteLabourId,
                    "resync": false,
                    "lock": true,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/add-quote-labour/" + quoteLabourId + "/" + old_quote_lab.quoteId + "/" + old_quote_lab.quoteName
                };

            DataService.getSoupData(SOUPINFO.WOQuotesLabours, 100).then(function(entries) {
                $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === quoteLabour.quoteId) {
                        var LabourIdIndex = $.map(entries.currentPageOrderedEntries[index].data, function(obj, subIndex) {
                            if (obj.Id === quoteLabourId) {
                                return subIndex; 
                            } 
                        }); 

                        quoteLabour.labour = entries.currentPageOrderedEntries[index].data[LabourIdIndex];
                        quoteLabour.labour.MedConnect__Activity_Type__c = new_quote_lab.MedConnect__Activity_Type__c;
                        quoteLabour.labour.MedConnect__Applied_Rate_Type__c = new_quote_lab.MedConnect__Applied_Rate_Type__c;
                        quoteLabour.labour.MedConnect__Hours_Worked__c = new_quote_lab.MedConnect__Hours_Worked__c;
                        quoteLabour.labour.MedConnect__Rate__c = new_quote_lab.MedConnect__Rate__c;
                        quoteLabour.labour.MedConnect__Billable__c = new_quote_lab.MedConnect__Billable__c;
                        quoteLabour.labour.MedConnect__Apply_Warranty__c = new_quote_lab.MedConnect__Apply_Warranty__c;
                        quoteLabour.labour.MedConnect__Discount__c = new_quote_lab.MedConnect__Discount__c;
                        quoteLabour.labour.MedConnect__Discount_Type__c = new_quote_lab.MedConnect__Discount_Type__c;
                        quoteLabour.labour.MedConnect__Description__c = new_quote_lab.MedConnect__Description__c;

                        entries.currentPageOrderedEntries[index].data[LabourIdIndex] = quoteLabour.labour;
                        promises.push(DataService.setSoupData(SOUPINFO.WOQuotesLabours, entries.currentPageOrderedEntries));
                    } 
                }); 
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info($translate.instant("quote.quoteController.labourismodifiedsuccessfullyinoffline"));
                $ionicHistory.goBack();
            });
        }
    };
}

function QuoteMaterialCtrl($q, $scope, QuoteService, $stateParams, $state, $ionicLoading, toastr, $ionicHistory, NetworkService, SharedPreferencesService, ActivityService, DataService, SOUPINFO, $ionicModal,ProductsService,$timeout,$translate) {
    var quoteMaterial = this;
    quoteMaterial.quoteId = $stateParams.quoteId;
    quoteMaterial.materialId = $stateParams.materialId;
    quoteMaterial.workOrderId = $stateParams.workOrderId;
    quoteMaterial.quoteName = $stateParams.quoteName;
   
    quoteMaterial.selectedActivity = '';
    quoteMaterial.selectedProduct = '';
    quoteMaterial.products = [];
    quoteMaterial.activities = [];

    quoteMaterial.takeMeBack = function() {
        $ionicHistory.goBack(-1);
    };

    quoteMaterial.showProducts = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });

        ProductsService.getProductsOnline().then(function(prods) {
            quoteMaterial.products = prods.records;
            $timeout(function(){
                $ionicLoading.hide();
            },2000);
            
            $ionicModal.fromTemplateUrl('modules/quote/products_lookup.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });

        }, function(err) {
             DataService.getSoupData(SOUPINFO.productList, 50).then(
            function(entries) {
                quoteMaterial.products = entries.currentPageOrderedEntries;
                $ionicLoading.hide();
                $ionicModal.fromTemplateUrl('modules/quote/products_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            },
            function(err) {
                quoteMaterial.products = [];
            }
        );
        });

       
    };

    quoteMaterial.select_the_product = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });

        quoteMaterial.selected_product_name = name;
        quoteMaterial.selected_product_id = id;
        
        if (id) {
            QuoteService.getUnitPrice(id).then(function(unit_Data) {
                if (unit_Data.records.length) {
                    quoteMaterial.mat.unitPrice = unit_Data.records[0].MedConnect__List_Price__c;
                } else {
                    quoteMaterial.mat.unitPrice = '';
                }
            }, function(er){
                DataService.getSoupData(SOUPINFO.productPriceList).then(function(entries) {
                    var bool = false;
                    if (entries.currentPageOrderedEntries.length > 0) {
                        angular.forEach(entries.currentPageOrderedEntries, function(value, index) {
                            if (id === value.MedConnect__Product__c) {
                                if (null !== value.MedConnect__List_Price__c) {
                                    bool = true;
                                    quoteMaterial.mat.unitPrice = value.MedConnect__List_Price__c;
                                } else {
                                    bool = false;
                                    quoteMaterial.mat.unitPrice = 0;
                                }
                            }
                        });
                        if (!bool) {
                            quoteMaterial.mat.unitPrice = 0;
                        }
                    } else {
                       quoteMaterial.mat.unitPrice = 0;
                    }
                }, function(error) {
                });
            });
        }
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    quoteMaterial.showActivities = function() {
        DataService.getSoupData(SOUPINFO.workOrderActivities, 50).then(
            function(entries) {
                if (entries.currentPageOrderedEntries.length > 0) {
                    angular.forEach(entries.currentPageOrderedEntries, function(act, index) {
                        if (act.Id === quoteMaterial.workOrderId) {
                            quoteMaterial.activities = act.data;
                        }
                    });
                }

                $ionicModal.fromTemplateUrl('modules/quote/activities_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            },
            function(err) {
                invoiceMaterial.activities = [];
            }
        );
    };

    quoteMaterial.select_the_activity = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });
       
        quoteMaterial.selected_activity_name = name;
        quoteMaterial.selected_activity_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    quoteMaterial.mat = {};
    if (quoteMaterial.materialId.length === 18) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });
        QuoteService.getQuoteLineItemsDetails(quoteMaterial.materialId, 'Material').then(function(quoteMaterialRes) {
            if (quoteMaterialRes) {
                quoteMaterial.material = quoteMaterialRes.records[0];
                quoteMaterial.selected_activity_name = (quoteMaterial.material.MedConnect__Activity__r) ? quoteMaterial.material.MedConnect__Activity__r.Name : '';
                quoteMaterial.selected_product_name = (quoteMaterial.material.MedConnect__Product__r) ? quoteMaterial.material.MedConnect__Product__r.Name : '';
                quoteMaterial.mat.Activitytype = quoteMaterial.material.MedConnect__Activity_Type__c;
                quoteMaterial.mat.billable = quoteMaterial.material.MedConnect__Billable__c;
                quoteMaterial.mat.apply_warranty = quoteMaterial.material.MedConnect__Apply_Warranty__c;
                quoteMaterial.mat.unitPrice = quoteMaterial.material.MedConnect__Unit_Price__c;
                quoteMaterial.mat.quantity = quoteMaterial.material.MedConnect__Quantity__c;
                quoteMaterial.mat.discount = quoteMaterial.material.MedConnect__Discount__c;
                quoteMaterial.mat.discountType = quoteMaterial.material.MedConnect__Discount_Type__c;
                quoteMaterial.mat.description = quoteMaterial.material.MedConnect__Description__c;
            }

            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();

            if (NetworkService.isDeviceOnline()) {
                $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            } else {
                quoteMaterial.getQuoteMaterialOffline(quoteMaterial.materialId);
            }
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteMaterial.materialId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {

                quoteMaterial.material = resp.currentPageOrderedEntries[0].data;
                quoteMaterial.selected_activity_name = resp.currentPageOrderedEntries[0].ActivityName;
               
                quoteMaterial.selected_product_name = resp.currentPageOrderedEntries[0].ProductName;
                quoteMaterial.mat.Activitytype = quoteMaterial.material.MedConnect__Activity_Type__c;
                quoteMaterial.mat.billable = quoteMaterial.material.MedConnect__Billable__c;
                quoteMaterial.mat.apply_warranty = quoteMaterial.material.MedConnect__Apply_Warranty__c;
                quoteMaterial.mat.unitPrice = quoteMaterial.material.MedConnect__Unit_Price__c;
                quoteMaterial.mat.quantity = quoteMaterial.material.MedConnect__Quantity__c;
                quoteMaterial.mat.discount = quoteMaterial.material.MedConnect__Discount__c;
                quoteMaterial.mat.discountType = quoteMaterial.material.MedConnect__Discount_Type__c;
                quoteMaterial.mat.description = quoteMaterial.material.MedConnect__Description__c;

                $ionicLoading.hide();
            }
        });
    }

    quoteMaterial.getQuoteMaterialOffline = function(materialId) {
        DataService.getSoupData(SOUPINFO.WOQuotesMaterials, 100).then(function(entries) {
            $.map(entries.currentPageOrderedEntries, function(obj, index) {
                if (obj.Id === quoteMaterial.quoteId) {
                    var MaterialIdIndex = $.map(entries.currentPageOrderedEntries[index].data, function(obj, subIndex) {
                        if (obj.Id === materialId) {
                            return subIndex; 
                        } 
                    }); 

                    quoteMaterial.material = entries.currentPageOrderedEntries[index].data[MaterialIdIndex];
                    quoteMaterial.selected_activity_name = (quoteMaterial.material.MedConnect__Activity__r) ? quoteMaterial.material.MedConnect__Activity__r.Name : '';
                    quoteMaterial.selected_product_name = (quoteMaterial.material.MedConnect__Product__r) ? quoteMaterial.material.MedConnect__Product__r.Name : '';
                    quoteMaterial.mat.Activitytype = quoteMaterial.material.MedConnect__Activity_Type__c;
                    quoteMaterial.mat.billable = quoteMaterial.material.MedConnect__Billable__c;
                    quoteMaterial.mat.apply_warranty = quoteMaterial.material.MedConnect__Apply_Warranty__c;
                    quoteMaterial.mat.unitPrice = quoteMaterial.material.MedConnect__Unit_Price__c;
                    quoteMaterial.mat.quantity = quoteMaterial.material.MedConnect__Quantity__c;
                    quoteMaterial.mat.discount = quoteMaterial.material.MedConnect__Discount__c;
                    quoteMaterial.mat.discountType = quoteMaterial.material.MedConnect__Discount_Type__c;
                    quoteMaterial.mat.description = quoteMaterial.material.MedConnect__Description__c;

                } 
            }); 
        });
    };

    quoteMaterial.materialSave = function(materialForm) {
        var selected_product = quoteMaterial.selected_product_name;
        if (selected_product === '') {
            quoteMaterial.product_error = true;
            return;
        }

        if (materialForm.$valid) {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });

            var quoteMatData = {};
            quoteMatData.MedConnect__Product__c = quoteMaterial.selected_product_id;
            quoteMatData.MedConnect__Activity__c = quoteMaterial.selected_activity_id;
            quoteMatData.MedConnect__Quantity__c = quoteMaterial.mat.quantity;
            quoteMatData.MedConnect__Unit_Price__c = quoteMaterial.mat.unitPrice;
            quoteMatData.MedConnect__Billable__c = quoteMaterial.mat.billable;
            quoteMatData.MedConnect__Apply_Warranty__c = quoteMaterial.mat.apply_warranty;
            quoteMatData.MedConnect__Discount__c = quoteMaterial.mat.discount;
            quoteMatData.MedConnect__Discount_Type__c = quoteMaterial.mat.discountType;
            quoteMatData.MedConnect__Description__c = quoteMaterial.mat.description;
            
            if (quoteMaterial.materialId.length === 18) {
               
                quoteMatData.MedConnect__Reason_For_Change__c = quoteMaterial.mat.change_reason || '';
                quoteMatData.Id = quoteMaterial.materialId;
                QuoteService.updateQuoteLineItems(quoteMatData).then(function(mat_updated) {
                 
                        toastr.success($translate.instant("quote.quoteController.materialupdatedsuccessfully"));
                        $ionicHistory.goBack(-1);

                    },
                    function(err) {
                        $ionicLoading.hide();

                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            navigator.notification.confirm(
                                $translate.instant("quote.quoteController.doyouwanttoedittheMaterialOffline"),
                                function(buttonIndex) {
                                    quoteMaterial.editMaterialOffline(buttonIndex, quoteMaterial, quoteMatData, quoteMaterial.materialId);

                                },
                                 $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                            );
                        }


                    });

            } else {
                quoteMatData.MedConnect__Quote__c = quoteMaterial.quoteId;
                quoteMatData.MedConnect__Line_Type__c = 'Material';
                QuoteService.createQuoteLineItems(quoteMatData).then(function(mat_added) {
                        toastr.success('Material created successfully');
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        $ionicLoading.hide();
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteMaterial.materialId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp && resp.currentPageOrderedEntries.length > 0) {
                                    navigator.notification.confirm(
                                        $translate.instant("quote.quoteController.doyouwanttoedittheMaterialOffline"),
                                        function(buttonIndex) {
                                            quoteMaterial.createQuoteMaterialOffline(buttonIndex, quoteMatData, quoteMaterial.materialId);
                                        },
                                         $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                                    );
                                } else {
                                    navigator.notification.confirm(
                                        $translate.instant("quote.quoteController.doyouwanttocreatetheMaterialOffline"),
                                        function(buttonIndex) {
                                            quoteMaterial.createQuoteMaterialOffline(buttonIndex, quoteMatData, quoteMaterial.materialId);
                                        },
                                         $translate.instant("quote.quoteController.medvantage"), [$translate.instant("quote.quoteController.confirm"), $translate.instant("quote.quoteController.cancel")]
                                    );
                                }
                            });
                        }
                    });
            }
        }
    };

    quoteMaterial.createQuoteMaterialOffline = function(buttonIndex, new_quote_mat, quoteMaterialId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });


            if (quoteMaterial.quoteId !== '' && quoteMaterial.quoteId !== 'null') {

                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteMaterial.quoteId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(offlineQuote) {
                    if (offlineQuote && offlineQuote.currentPageOrderedEntries.length > 0) {
                        var obj = offlineQuote.currentPageOrderedEntries[0];
                        var offlineQuoteData = obj.data;
                        delete new_quote_mat.MedConnect__Quote__c;
                        if (offlineQuoteData.hasOwnProperty('Quote_Line_Items')) {
                            offlineQuoteData.Quote_Line_Items.push(new_quote_mat);
                        } else {
                            offlineQuoteData.Quote_Line_Items = [new_quote_mat];
                        }

                        obj.data = offlineQuoteData;
                        DataService.setOfflineSoupData(obj).then(function() {
                            toastr.info($translate.instant("materialsavedtoQuoteofflinesuccessfully"));
                            $ionicHistory.goBack();
                        });

                    } else {
                        if (quoteMaterialId !== '' && quoteMaterialId !== 'null') {
                            var offlineObj = {};
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', quoteMaterialId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp.currentPageOrderedEntries.length > 0) {
                                    var obj = resp.currentPageOrderedEntries[0];
                                    offlineObj.action = obj.action;
                                    offlineObj.type = obj.type;
                                    offlineObj.Name = obj.Name;
                                    offlineObj.WOName = obj.WOName;
                                    offlineObj.ProductName = quoteMaterial.selected_product_name;
                                    offlineObj.ActivityName = quoteMaterial.selected_activity_name;
                                    offlineObj.data = new_quote_mat;
                                    offlineObj.randomId = quoteMaterialId;
                                    offlineObj.resync = obj.resync;
                                    offlineObj.createdDate = new Date().getTime().toString();
                                    offlineObj.href = obj.href;

                                    DataService.setOfflineSoupData(offlineObj).then(function() {
                                        toastr.info($translate.instant("quote.quoteController.materialmodifiedofflinesuccessfully"));
                                        $ionicHistory.goBack();
                                    });
                                }
                            });
                        } else {
                            var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                            var matName = "QN-Mat-" + randomId;
                            var offlineObj5 = {
                                "action": "New",
                                "type": "QLI",
                                "Name": matName,
                                "WOName": SharedPreferencesService.getWorkOrderName(),
                                "ProductName": quoteMaterial.selected_product_name,
                                "ActivityName": quoteMaterial.selected_activity_name,
                                "data": new_quote_mat,
                                "randomId": randomId,
                                "resync": false,
                                "createdDate": new Date().getTime().toString(),
                                "href": "#/app/add-quote-material/" + randomId + "/" + quoteMaterial.quoteId + "/" + quoteMaterial.workOrderId + "/" + quoteMaterial.quoteName + "/"
                            };

                            DataService.setOfflineSoupData(offlineObj5).then(function() {
                                toastr.info($translate.instant("quote.quoteController.materialcreatedofflinesuccessfully"));
                                $ionicHistory.goBack();
                            });
                        }


                    }


                });

            }
        }
    };

    quoteMaterial.editMaterialOffline = function(buttonIndex, old_quote_mat, new_quote_mat, quoteMaterialId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
            });

            var promises = [],
                offlineObj = {
                    "action": "Edit",
                    "type": "QLI",
                    "Name": old_quote_mat.quoteName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "ProductName": old_quote_mat.selected_product_name,
                    "ActivityName": old_quote_mat.selected_activity_name,
                    "data": new_quote_mat,
                    "randomId": quoteMaterialId,
                    "resync": false,
                    "lock": true,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/add-quote-material/" + quoteMaterialId + "/" + old_quote_mat.quoteId + "/" + old_quote_mat.workOrderId + "/" + old_quote_mat.quoteName + "/"
                };

            DataService.getSoupData(SOUPINFO.WOQuotesMaterials, 100).then(function(entries) {
                $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === quoteMaterial.quoteId) {
                        var MaterialIdIndex = $.map(entries.currentPageOrderedEntries[index].data, function(obj, subIndex) {
                            if (obj.Id === quoteMaterialId) {
                                return subIndex; 
                            } 
                        }); 


                        quoteMaterial.material = entries.currentPageOrderedEntries[index].data[MaterialIdIndex];

                        quoteMaterial.material.MedConnect__Activity__c = new_quote_mat.MedConnect__Activity__c;
                        quoteMaterial.material.MedConnect__Activity__r = {};
                        quoteMaterial.material.MedConnect__Activity__r.Name = old_quote_mat.selected_activity_name;
                        quoteMaterial.material.MedConnect__Product__c = new_quote_mat.MedConnect__Product__c;
                        quoteMaterial.material.MedConnect__Product__r = {};
                        quoteMaterial.material.MedConnect__Product__r.Name = old_quote_mat.selected_product_name;
                        quoteMaterial.material.MedConnect__Activity_Type__c = new_quote_mat.MedConnect__Activity_Type__c;
                        quoteMaterial.material.MedConnect__Billable__c = new_quote_mat.MedConnect__Billable__c;
                        quoteMaterial.material.MedConnect__Apply_Warranty__c = new_quote_mat.MedConnect__Apply_Warranty__c;
                        quoteMaterial.material.MedConnect__Unit_Price__c = new_quote_mat.MedConnect__Unit_Price__c;
                        quoteMaterial.material.MedConnect__Quantity__c = new_quote_mat.MedConnect__Quantity__c;
                        quoteMaterial.material.MedConnect__Discount__c = new_quote_mat.MedConnect__Discount__c;
                        quoteMaterial.material.MedConnect__Discount_Type__c = new_quote_mat.MedConnect__Discount_Type__c;
                        quoteMaterial.material.MedConnect__Description__c = new_quote_mat.MedConnect__Description__c;

                        entries.currentPageOrderedEntries[index].data[MaterialIdIndex] = quoteMaterial.material;
                        promises.push(DataService.setSoupData(SOUPINFO.WOQuotesMaterials, entries.currentPageOrderedEntries));
                    } 
                }); 
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info($translate.instant("quote.quoteController.materialismodifiedsuccessfullyinoffline"));
                $ionicHistory.goBack();
            });
        }
    };
}

function QuoteExpenseDetailCtrl($q, $scope, QuoteService, $stateParams, $state, $ionicLoading, $ionicPopover, toastr, $ionicHistory, $timeout, $translate) {
    var quoteExpenseData = this;
    quoteExpenseData.expenseId = $stateParams.expenseId;
   
    $ionicPopover.fromTemplateUrl('modules/quote/expense_popover.html', {
        scope: $scope
    }).then(function(popover) {
        quoteExpenseData.popover = popover;
    });

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
    });

    if (quoteExpenseData.expenseId) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });
        QuoteService.getQuoteLineItemsDetails(quoteExpenseData.expenseId, 'Expense').
        then(function(quoteExpensePromise) {
            
            if (quoteExpensePromise) {
                quoteExpenseData.expense = quoteExpensePromise.records[0];
                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 800);
            }
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();
            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
        });
    }
    $ionicLoading.hide();

}

function QuoteMaterialDetailCtrl($q, $scope, QuoteService, $stateParams, $state, $ionicLoading, $ionicPopover, toastr, $ionicHistory, $timeout,$translate) {
    var quoteMaterial = this;
    quoteMaterial.materialId = $stateParams.materialId;
    quoteMaterial.workOrderId = $stateParams.workOrderId;
    
    $ionicPopover.fromTemplateUrl('modules/quote/material_popover.html', {
        scope: $scope
    }).then(function(popover) {
        quoteMaterial.popover = popover;
        quoteMaterial.workOrderID = $stateParams.workOrderId;
    });

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
    });

    if (quoteMaterial.materialId) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });
        QuoteService.getQuoteLineItemsDetails(quoteMaterial.materialId, 'Material').
        then(function(quoteMaterialPromise) {
           
            if (quoteMaterialPromise) {
                quoteMaterial.material = quoteMaterialPromise.records[0];
                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 800);
            }
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();
            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
        });
    }
    $ionicLoading.hide();

}

function QuoteLabourDetailCtrl($q, $scope, QuoteService, $stateParams, $state, $ionicLoading, $ionicPopover, toastr, $ionicHistory, $timeout,$translate) {
    var quoteLabour = this;
    quoteLabour.labourId = $stateParams.labourId;

    $ionicPopover.fromTemplateUrl('modules/quote/labour_popover.html', {
        scope: $scope
    }).then(function(popover) {
        quoteLabour.popover = popover;
    });

    if (quoteLabour.labourId) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"quote.quoteController.loading" | translate}}...'
        });
        QuoteService.getQuoteLineItemsDetails(quoteLabour.labourId, 'Labour').
        then(function(quoteLabourPromise) {
            if (quoteLabourPromise) {
                quoteLabour.labour = quoteLabourPromise.records[0];
                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 800);
            }
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();
            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
        });
    }
    $ionicLoading.hide();

}
