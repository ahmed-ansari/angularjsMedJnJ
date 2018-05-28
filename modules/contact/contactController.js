/* jshint -W100 */
app.controller('ContactListCtrl', function($scope, force, ContactsService, $ionicModal, localStorageService, $ionicLoading, DataService, SOUPINFO, $timeout, SyncUpService, $translate) {

        var contactlist = this;

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
        });

        var filterValue = localStorageService.get("filterValue");
        if (filterValue === null) {
            contactlist.filterContact = 7;
        } else {
            contactlist.filterContact = filterValue;
        }

        contactlist.noMoreItemsAvailable = true;
        contactlist.nocontacts = false;
        contactlist.no_contact = $translate.instant("contact.contact.no_records_found");
        contactlist.loggedInId = '';

        var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
        sfOAuthPlugin.getAuthCredentials(function(usr) {
            contactlist.loggedInId = usr.userId;
            contactlist.callList(contactlist.filterContact, contactlist.loggedInId);
        });

        var rec_entries = localStorageService.get('maxRecords');
        if (rec_entries === null) {
            localStorageService.set('maxRecords', 20);
            rec_entries = 20;
        }

        $scope.filterDays = "7";
        var filterValue2 = localStorageService.get('filterValue');
        if (filterValue2 !== null) {
            $scope.filterDays = filterValue2;
        }
        /** 
         *   Desc - fetches contact list
         *   @param - days - [number of days], userId [loggedIn user Id]
         */
        contactlist.callList = function(days, userId) {

            DataService.getSoupData(SOUPINFO.contactList, rec_entries).then(
                function(entries) {
                    contactlist.contacts = entries.currentPageOrderedEntries;
                    contactlist.noMoreItemsAvailable = true;
                    $ionicLoading.hide();
                },
                function(err) {
                    contactlist.contacts = [];
                    $ionicLoading.hide();
                }
            );
            $ionicLoading.hide();
        };
        contactlist.entries = 0;
        /** 
         *   Desc - trigger call pop up
         *   @param - none
         */
        contactlist.callNumber = function(mobile) {
            if (mobile !== null && mobile.length > 14) {
                navigator.notification.alert($translate.instant("contact.contactControllerjs.alert-call-number"), alertDismissed, $translate.instant("contact.contactControllerjs.medvantage"), $translate.instant("contact.contactControllerjs.ok"));
            }
        };

        function alertDismissed() {}

    }).controller('ContactCtrl', function($window, $scope, $stateParams, $translate, ContactsService, $q, $ionicLoading, DataService, SOUPINFO, $timeout) {
        var singlecontact = this;
        singlecontact.dontProceed = false;
        singlecontact.history = [];

        var contactSubModulesList = ["contact", "incidents", "service_request", "open_activity", "acc_notes", "acc_attachments"];
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
        });

        var contactID = $stateParams.contactId;
        var promise1 = ContactsService.getContactById(contactID);
        var promise2 = ContactsService.getContactIncidents(contactID);
        var promise3 = ContactsService.getContactServiceRequest(contactID);
        var promise4 = ContactsService.getContactOpenActivity(contactID);
        var promise5 = ContactsService.getActivityHistory(contactID);
        var promise6 = ContactsService.getNotesnAttachments(contactID);

        $q.all([promise1, promise2, promise3, promise4, promise5, promise6]).then(function(data) {
            singlecontact.contact = data[0].records[0];
            singlecontact.incidents = data[1].records;
            console.log('cont', data);
            singlecontact.service_request = data[2].records;
            if (data[3].records[0].OpenActivities === null) {
                singlecontact.open_activity = [];
            } else {
                singlecontact.open_activity = data[3].records[0].OpenActivities.records;
            }
            if (data[4].records[0].ActivityHistories === null) {
                singlecontact.history = [];
            } else {
                singlecontact.history = data[4].records[0].ActivityHistories.records;
            }
            singlecontact.acc_notes = data[5].records[0].Notes;
            singlecontact.acc_attachments = data[5].records[0].Attachments;
            console.log('cont', singlecontact);
            angular.forEach(contactSubModulesList, function(module) {
                storeDataInOffline(module, contactID);
            });

            angular.element($window).on('resize', setHeightForContact);
            setHeightForContact();

            $timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
                setHeightForContact();
            }, 800);

            angular.element('#telChk').attr('href', 'tel:' + singlecontact.contact.Phone);

            $ionicLoading.hide();
        }, function(err) {
            angular.forEach(contactSubModulesList, function(module) {
                getDataFromOffline(module, contactID);
            });
        });
        /** 
         *   Desc - set contact  page height
         *   @param - none
         */
        function setHeightForContact() {
            var windowHt = $(window).outerHeight(true);
            var headerHt = $(".bar-header").outerHeight(true);
            var subNameHt = $(".contact-detail").outerHeight(true);
            var subHeaderHt = $(".subCtHdr").outerHeight(true);
            var tabHt = $(".tsb-icons").outerHeight(true);
            var subCtInfo = $(".cntInfo").outerHeight(true);
            //Adding 30px as buffer
            var cntCtHt = windowHt - (headerHt + subNameHt + subHeaderHt + tabHt + 40);
            var cntCtOthersHt = windowHt - (headerHt + subNameHt + subHeaderHt + subCtInfo + tabHt + 40);
            $(".scrollCtHtGI").css({ "height": cntCtHt, "overflow": "auto" });
            $(".scrollCtHt").css({ "height": cntCtOthersHt, "overflow": "auto" });
        }

        function cleanUp() {
            angular.element($window).off('resize', setHeightForContact);
        }

        $scope.$on('$destroy', cleanUp);
        /** 
         *   Desc - trigger email pop up
         *   @param - none
         */
        singlecontact.sendEmail = function() {
            cordova.plugins.email.isAvailable(
                function(isAvailable) {
                    if (isAvailable) {
                        cordova.plugins.email.open({
                            to: singlecontact.contact.Email,
                            cc: '',
                            bcc: [],
                            subject: '',
                            body: ''
                        });
                    } else {
                        singlecontact.showAlertMessage($translate.instant("contact.contactControllerjs.email-not-configured"));
                    }
                }
            );
        };

        singlecontact.showAlertMessage = function(message) {
            navigator.notification.alert(message, singlecontact.alertDismissed, $translate.instant("contact.contactControllerjs.medvantage"), $translate.instant("contact.contactControllerjs.ok"));
        };
        singlecontact.alertDismissed = function() {};
        /** 
         *   Desc - fetch offline data from soup
         *   @param - type [ tabs of contact], contact Id[contact Id]
         */
        function getDataFromOffline(type, contactId) {
            var configObject = getPreFilledJSONArray(type);
            DataService.getSoupData(configObject.soupName, 10).then(
                function(entries) {
                    var contactIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                        if (obj.Id === contactId) {
                            return index; 
                        } 
                    }); 

                    if (contactIdIndex.length === 0) {
                        if (singlecontact.contact === undefined && singlecontact.dontProceed === false) {
                            singlecontact.dontProceed = true;
                            $scope.showAlertMessage($translate.instant("contact.contactControllerjs.no-offline-data-found"));
                            return;
                        }
                    }

                    singlecontact[type] = entries.currentPageOrderedEntries[contactIdIndex].data;
                    $ionicLoading.hide(); 

                    $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                    }, 800);
                },
                function(err) {
                    $ionicLoading.hide();
                }
            );
        }
        /** 
         *   Desc - store offline data in soup
         *   @param - none
         */
        function storeDataInOffline(type, contactId) {
            var configObject = getPreFilledJSONArray(type);
            var contactDetailsArr = [];
            var contactsDetailsObj = {};
            contactsDetailsObj.Id = contactId;
            contactsDetailsObj.data = singlecontact[type];
            contactDetailsArr.push(contactsDetailsObj);
            DataService.setSoupData(configObject.soupName, contactDetailsArr);
        }
        /** 
         *   Desc - Maps the soups names to the tabs of contact pages for showing data in offline
         *   @param - type [ tabs of contact]
         */
        function getPreFilledJSONArray(type) {
            var configJSON = {};
            switch (type) {
                case 'contact':
                    configJSON.soupName = SOUPINFO.contactDetails;
                    return configJSON;
                case 'incidents':
                    configJSON.soupName = SOUPINFO.contactIncidentDetails;
                    return configJSON;
                case 'service_request':
                    configJSON.soupName = SOUPINFO.contactServiceRequestDetails;
                    return configJSON;
                case 'open_activity':
                    configJSON.soupName = SOUPINFO.contactOpenActivitiesDetails;
                    return configJSON;
                case 'acc_notes':
                    configJSON.soupName = SOUPINFO.contactNotesDetails;
                    return configJSON;
                case 'acc_attachments':
                    configJSON.soupName = SOUPINFO.contactAttachmentsDetails;
                    return configJSON;
            }
        }

    }).controller('ContactMapCtrl', function($scope, $stateParams, $translate, ContactsService, $q, $ionicLoading, DataService, SOUPINFO) {
        var contactmap = this;
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
        });
        ContactsService.getContactById($stateParams.contactId).then(function(contactm) {
                contactmap.contact = contactm.records[0];

                if (contactmap.contact.MailingLatitude === null || contactmap.contact.MailingLongitude === null) {
                    contactmap.contact.addr = (contactmap.contact.MailingStreet !== null ? contactmap.contact.MailingStreet : '') + ', ' +
                        (contactmap.contact.MailingCity !== null ? contactmap.contact.MailingCity : '') + ', ' +
                        (contactmap.contact.MailingState !== null ? contactmap.contact.MailingState : '') + ', ' +
                        (contactmap.contact.MailingCountry !== null ? contactmap.contact.MailingCountry : '');
                } else {
                    contactmap.contact.addr = (contactmap.contact.MailingLatitude !== null ? contactmap.contact.MailingLatitude : '') + ',' +
                        (contactmap.contact.MailingLongitude !== null ? contactmap.contact.MailingLongitude : '');
                }

                $ionicLoading.hide();

            },
            function(err) {
                contactmap.contact = '';
                $ionicLoading.hide();
            });
    })
    .controller('CreateContactCtrl', function($scope, $filter, $translate, AccountsService, $stateParams, $ionicLoading, NetworkService, toastr, $ionicNavBarDelegate, ContactsService, $ionicHistory, DataService, SOUPINFO, $ionicModal) {

        var createcontact = this;

        createcontact.takeMeBack = function() {
            $ionicHistory.goBack(-1);
        };

        createcontact.selected_account_name = '';
        createcontact.selected_account_id = '';
        createcontact.contactId = '';
        createcontact.contact = {};
        createcontact.searchaccountname = '';
        createcontact.searhError = '';
        createcontact.no_record = '';
        createcontact.Loading = '';

        createcontact.contactId = $stateParams.contactId;
        console.log('creat', $stateParams);
        if (createcontact.contactId !== '0') {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
            });
            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', createcontact.contactId);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(cont) {
                if (cont && cont.currentPageOrderedEntries.length > 0) {
                    console.log('cont offloine', cont);
                    old_cont = cont.currentPageOrderedEntries[0].data;
                    console.log('cont old_cont', old_cont);
                    createcontact.isLock = cont.currentPageOrderedEntries[0].lock;
                    setTimeout(function() {
                        createcontact.selected_account_id = old_cont.AccountId;
                        createcontact.selected_account_name = cont.currentPageOrderedEntries[0].AccountName;
                        createcontact.old_contact_name = cont.currentPageOrderedEntries[0].Name;
                        createcontact.contact.firstname = old_cont.FirstName;
                        createcontact.contact.lastname = old_cont.LastName;
                        createcontact.contact.title = old_cont.Title;
                        createcontact.contact.department = old_cont.Department;
                        createcontact.contact.role = old_cont.Role_MDSR__c;
                        createcontact.contact.email = old_cont.Email;
                        createcontact.contact.phone = old_cont.Phone;
                        createcontact.contact.homephone = old_cont.HomePhone;
                        createcontact.contact.mobile = old_cont.MobilePhone;
                        $ionicLoading.hide();
                    }, 700);

                }
            });
        }

        var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
        sfOAuthPlugin.getAuthCredentials(function(usr) {
            createcontact.userId = usr.userId;
        });
        createcontact.searchaccount = function() {
            if (createcontact.searchaccountname.length > 0) {
                createcontact.searhError = '';
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
                });
                AccountsService.getAccountSearchLists(createcontact.userId, createcontact.searchaccountname).then(
                    function(entries) {

                        // console.log('post search', entries);
                        if (entries.records.length > 0) {
                            createcontact.accounts = entries.records;
                            createcontact.no_record = '';
                            createcontact.searhError = '';
                        } else {
                            createcontact.no_record = $translate.instant("contact.contactControllerjs.no_records_found");
                            createcontact.accounts = [];
                            createcontact.searhError = '';
                        }
                        $ionicLoading.hide();
                    },
                    function(err) {
                        createcontact.accounts = [];
                        DataService.getSoupData(SOUPINFO.accountList, 500).then(function(sucEntries) {
                            if (sucEntries.currentPageOrderedEntries.length > 0) {
                                // console.log('sucEntries', sucEntries);
                                //  saccounts = sucEntries.currentPageOrderedEntries.filter(function(acc){
                                //     console.log('acc',acc);
                                //     console.log(acc.Name+' = '+createcontact.searchaccountname);
                                //     console.log(acc.Name.indexOf(createcontact.searchaccountname));
                                //     return acc.Name.indexOf(createcontact.searchaccountname == -1) ? false : true;
                                // });
                                // console.log('saccounts',saccounts);

                                var saccounts = $filter('filter')(sucEntries.currentPageOrderedEntries, { Name: createcontact.searchaccountname });
                                // console.log('saccounts', saccounts);
                                createcontact.accounts = saccounts;
                                if (createcontact.accounts.length === 0) {
                                    createcontact.accounts = [];
                                    createcontact.no_record = $translate.instant("contact.contactControllerjs.no_records_found");
                                } else {
                                    createcontact.no_record = '';
                                }

                                createcontact.searhError = '';
                                $ionicLoading.hide();
                            } else {
                                createcontact.no_record = $translate.instant("contact.contactControllerjs.no_records_found");
                                createcontact.accounts = [];
                                createcontact.searhError = '';
                                $ionicLoading.hide();
                            }
                        }, function(err) {
                            createcontact.no_record = $translate.instant("contact.contactControllerjs.no_records_found");
                            createcontact.accounts = [];
                            createcontact.searhError = '';
                            $ionicLoading.hide();
                        });
                    }
                );
            } else {
                $ionicLoading.hide();
                createcontact.searhError = $translate.instant("contact.contactControllerjs.type-atleast-1-characters");
                createcontact.no_record = '';
                createcontact.accounts = '';
            }

        };
        createcontact.showAccounts = function() {
            $ionicModal.fromTemplateUrl('modules/contact/accounts_lookup.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        };

        createcontact.select_the_account = function(id, name) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
            });

            createcontact.selected_account_name = name;
            createcontact.selected_account_id = id;
            $scope.modal.hide();
            $ionicLoading.hide();
        };

        $scope.closeModal = function() {

            $scope.modal.hide();
        };

        createcontact.contactSave = function(contactForm) {
            if (createcontact.selected_account_id === '') {
                createcontact.account_error = true;
                console.log('missing account id');
                return;
            }

            if (contactForm.$valid) {

                $ionicLoading.show({
                    template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
                });

                var contactData = {};
                contactData.AccountId = createcontact.selected_account_id;
                contactData.FirstName = createcontact.contact.firstname || '';
                contactData.LastName = createcontact.contact.lastname || '';
                contactData.Title = createcontact.contact.title || '';
                contactData.Department = createcontact.contact.department || '';
                contactData.Role_MDSR__c = createcontact.contact.role || '';
                contactData.Email = createcontact.contact.email || '';
                contactData.Phone = createcontact.contact.phone || '';
                contactData.HomePhone = createcontact.contact.homephone || '';
                contactData.MobilePhone = createcontact.contact.mobile || '';

                ContactsService.setContact(contactData).then(function(cont_added) {
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', createcontact.contactId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp.currentPageOrderedEntries.length > 0) {
                                // console.log('resp',resp);
                                DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, createcontact.contactId);
                                toastr.success($translate.instant('contact.contactControllerjs.contact-created-successfully'));
                                $timeout(function(){
                                    $ionicHistory.goBack(-1);
                                },800) ;
                            } else {
                                $ionicLoading.hide();
                                toastr.success($translate.instant('contact.contactControllerjs.contact-created-successfully'));
                                $ionicHistory.goBack(-1);
                            }
                       
                        });
                    },
                    function(err) {
                        $ionicLoading.hide();
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage($translate.instant("contact.contactControllerjs.error-code") + ': ' + err[0].errorCode + '\n ' + $translate.instant("contact.contactControllerjs.error-message") + ': ' + err[0].message);
                        } else {
                            if (createcontact.contactId !== '0') {
                                navigator.notification.confirm(
                                    $translate.instant("contact.contactControllerjs.update-contact-offline"),
                                    function(buttonIndex) {
                                        createcontact.updateContactOffline(buttonIndex, contactData, createcontact.contactId);
                                    },
                                    $translate.instant("contact.contactControllerjs.medvantage"), [$translate.instant("contact.contactControllerjs.confirm"), $translate.instant("contact.contactControllerjs.cancel")]
                                );

                            } else {
                                navigator.notification.confirm(
                                    $translate.instant("contact.contactControllerjs.create-contact-offline"),
                                    function(buttonIndex) {
                                        createcontact.createContactOffline(buttonIndex, contactData, null);
                                    },
                                    $translate.instant("contact.contactControllerjs.medvantage"), [$translate.instant("contact.contactControllerjs.confirm"), $translate.instant("contact.contactControllerjs.cancel")]
                                );
                            }

                        }
                    });

            }
        };
        createcontact.createContactOffline = function(buttonIndex, new_contact, contactId) {

            if (buttonIndex === 1) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
                });


                var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                var conName = "Contact-" + randomId;
                var offlineObj = {
                    "action": "New",
                    "type": "CON",
                    "Name": conName,
                    "WOName": '',
                    "data": new_contact,
                    "randomId": randomId,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "AccountName": createcontact.selected_account_name,
                    "href": "#/app/create-contact/" + randomId
                };

                DataService.setOfflineSoupData(offlineObj).then(function() {
                    toastr.info($translate.instant('contact.contactControllerjs.contact-added-offline-successfully'));
                    $ionicHistory.goBack();
                });
            } else {
                $ionicLoading.hide();
                // $ionicHistory.goBack();
            }
        };

        createcontact.updateContactOffline = function(buttonIndex,new_cont, contactId) {
            if (buttonIndex === 1) {

                $ionicLoading.show({
                    template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
                });

                var promises = [];

                var offlineObj = {
                    "action": "Edit",
                    "type": "CON",
                    "Name": createcontact.old_contact_name,
                    "AccountName": createcontact.selected_account_name,
                    "data": new_cont,
                    "randomId": contactId,
                    "resync": false,
                    "lock":false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/create-contact/" + contactId
                };

               DataService.setOfflineSoupData(offlineObj).then(function(resp) {
                    toastr.info($translate.instant('contact.contactControllerjs.contact-updated-offline-successfully'));
                    $ionicHistory.goBack();
                });
            } else {
                $ionicHistory.goBack(-1);
            }
        };
    });

app.controller('ShowNoteCtrl', ['$scope', '$stateParams', '$translate', 'NoteService', '$ionicLoading', 'DataService', 'SOUPINFO', function($scope, $stateParams, NoteService, $ionicLoading, DataService, SOUPINFO) {
    var shownote = this;
    var noteSubModulesList = ["notes"];
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
    });
    var noteId = $stateParams.noteId;
    if (noteId) {
        NoteService.getNotes(noteId).then(function(data) {
            shownote.notes = data.records;
            angular.forEach(noteSubModulesList, function(module) {
                storeDataInOffline(module, noteId);
            });
            $ionicLoading.hide();
        }, function(err) {
            angular.forEach(noteSubModulesList, function(module) {
                getNoteDataFromOffline(module, noteId);
            });
        });
    }

    function getNoteDataFromOffline(type, noteId) {
        if (shownote.dontProceed) {
            return;
        }
        var configObject = getPreFilledJSONArray(type);
        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {
                var noteIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === noteId) {
                        return index; 
                    } 
                }); 
                if (noteIdIndex.length === 0) {
                    if (shownote.notes === undefined && shownote.dontProceed === false) {
                        singleaccount.dontProceed = true;
                        $scope.showAlertMessage($translate.instant("contact.contactControllerjs.no-offline-data-found"));
                        return;
                    }
                }
                shownote[type] = entries.currentPageOrderedEntries[noteIdIndex].data; 
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }

    function storeDataInOffline(type, noteId) {
        var configObject = getPreFilledJSONArray(type);
        var noteDetailsArr = [];
        var notesDetailsObj = {};
        notesDetailsObj.Id = noteId;
        notesDetailsObj.data = shownote[type];
        noteDetailsArr.push(notesDetailsObj);
        DataService.setSoupData(configObject.soupName, noteDetailsArr);
    }

    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'notes':
                configJSON.soupName = SOUPINFO.notesSoup;
                return configJSON;

        }
    }

}]);

app.controller('ShowAttachmentCtrl', ['$scope', '$stateParams', '$translate', 'AttachmentService', '$ionicLoading', function($scope, $stateParams, AttachmentService, $ionicLoading) {
    var showattachment = this;
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> {{"contact.contactControllerjs.loading" | translate}}'
    });

    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    showattachment.attachmentId = $stateParams.attachmentId;
    if (showattachment.attachmentId) {
        AttachmentService.getAttachments(showattachment.attachmentId).then(function(data) {
            showattachment.attached = data.records;
            // console.log('attached', data);
            var img_id = data.records[0].Body;
            // console.log('img_id', img_id);
            if (img_id) {
                sfoAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
                sfoAuthPlugin.getAuthCredentials(function(usr) {
                    var url = usr.instanceUrl + img_id;
                    var request = new XMLHttpRequest();
                    request.open("GET", url, true);
                    request.responseType = "arraybuffer";
                    request.setRequestHeader("Authorization", "Bearer " + usr.accessToken);
                    if (usr.userAgent !== null) {
                        request.setRequestHeader('User-Agent', usr.userAgent);
                        request.setRequestHeader('X-User-Agent', usr.userAgent);
                    }
                    if (url !== null)
                        request.setRequestHeader('SalesforceProxy-Endpoint', url);
                    request.onreadystatechange = function() {
                        if (request.readyState == 4) {
                            if (request.status == 200) {
                                try {
                                    //console.log('request', request);
                                    showattachment.attach_img = arrayBufferToBase64(request.response);
                                    $ionicLoading.hide();
                                } catch (e) {
                                    alert($translate.instant("contact.contactControllerjs.error-reading-response") + ": " + e.toString());
                                    $ionicLoading.hide();
                                }
                            } else if (request.status == 401) {
                                //console.log('request status 401', request);
                                $ionicLoading.hide();
                            } else {
                                //console.log('request in else', request, request.statusText, request.response);
                                $ionicLoading.hide();
                            }
                        }
                    };
                    request.send();
                });
            }

        }, function(err) {

            $scope.showAlertMessage($translate.instant("contact.contactControllerjs.no-offline-data-found"));
            $ionicLoading.hide();
        });
    }

}]);
