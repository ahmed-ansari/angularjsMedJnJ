app.service('WorkOrderService', ['force', 'MedvantageUtils', WorkOrderService]);
app.service('SharedPreferencesService', ['force', 'MedvantageUtils', SharedPreferencesService]);
app.service('AcceptRejectWorkOrderService', ['force', 'MedvantageUtils', AcceptRejectWorkOrderService]);
app.service('SLAClockService', ['force', 'MedvantageUtils', SLAClockService]);
app.service('ActivityService', ['force', 'MedvantageUtils', 'DataService', 'SOUPINFO', ActivityService]);
app.service('ExpenseService', ['force', 'MedvantageUtils', 'DataService', 'SOUPINFO', ExpenseService]);
app.service('AssignToolService', ['force', 'NetworkService', 'DataService', 'MedvantageUtils', AssignToolService]);
app.service('AssignToolDetailService', ['force', 'MedvantageUtils', AssignToolDetailService]);
app.service('RepairAnalysisService', ['force', 'MedvantageUtils',RepairAnalysisService]);
app.service('InstallAssetService', ['force', 'MedvantageUtils',InstallAssetService]);
app.service('NetworkService', NetworkService);
app.service('UsersService', ['force', UsersService]);
app.factory('CameraService', ['$q','$ionicLoading', CameraService]);
app.service('TechnicalBulletinService', ['force', 'MedvantageUtils', 'DataService', 'SOUPINFO',TechnicalBulletinService]);

function WorkOrderService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.getBOMDetails = function(prod_name) {
        return force.query("Select Id, Name, " + serverInstance + "Product_Name__c, " + serverInstance + "Product_Name__r.Name, " + serverInstance + "Product_Description__c, " + serverInstance + "Revision_Level__c, " + serverInstance + "Inspection_Cost__c , (SELECT Id, Name, " + serverInstance + "Cost__c, " + serverInstance + "Quantity__c, " + serverInstance + "Service_Charge__c, " + serverInstance + "UOM__c, " + serverInstance + "Part_Name__c, " + serverInstance + "Part_Number__c, " + serverInstance + "Make_Or_Buy__c, " + serverInstance + "Parent_Part_Name__c FROM " + serverInstance + "BOM_Details__r) from " + serverInstance + "BOM_Header__c Where " + serverInstance + "Product_Name__c = '" + prod_name + "'");
    };

    this.getWarrantyInfo = function(asset_warranty) {
        return force.query("SELECT " + serverInstance + "Account__c, " + serverInstance + "Asset__c, " + serverInstance + "End_Date__c, " + serverInstance + "Expense_End_Date__c, Id, IsDeleted, " + serverInstance + "Labor_End_Date__c, " + serverInstance + "Material_End_Date__c, Name, " + serverInstance + "Product_Name__c, " + serverInstance + "Start_Date__c, " + serverInstance + "Warranty__c, " + serverInstance + "Asset__r.Name, " + serverInstance + "Asset__r." + serverInstance + "Product__r." + serverInstance + "Is_Part__c, " + serverInstance + "Asset__r." + serverInstance + "Product__r." + serverInstance + "Parent_Product_Name__r.Name, " + serverInstance + "Warranty__r." + serverInstance + "Material_Covered__c,  " + serverInstance + "Warranty__r." + serverInstance + "Duration_of_Material_Coverage__c,  " + serverInstance + "Warranty__r." + serverInstance + "Unit_of_Time_for_Material_Coverage__c, " + serverInstance + "Warranty__r." + serverInstance + "Labor_Covered__c,  " + serverInstance + "Warranty__r." + serverInstance + "Duration_of_Labor_Coverage__c, " + serverInstance + "Warranty__r." + serverInstance + "Unit_of_Time_for_Labor_Coverage__c, " + serverInstance + "Warranty__r." + serverInstance + "Expense_Covered__c, " + serverInstance + "Warranty__r." + serverInstance + "Duration_of_Expense_Coverage__c, " + serverInstance + "Warranty__r." + serverInstance + "Unit_of_Time_for_Expense_Coverage__c FROM " + serverInstance + "Asset_Warranty__c WHERE Id = '" + asset_warranty + "'");
    };

    this.getWorkOrderById = function(id) {
        var sql = "Select Id, Name,  " + serverInstance + "Account__c, " + serverInstance + "Account__r.Name, " + serverInstance + "Time_Required_Hr__c, " + serverInstance + "Alternate_Time__c," + serverInstance + "Appointed_Technician__c, " + serverInstance + "Assigned_Technician__c, " + serverInstance + "Appointed_Technician_Name__c, " + serverInstance + "Assigned_Technician_Name__c, " + serverInstance + "Asset__c, " + serverInstance + "Asset__r.Name, " + serverInstance + "Asset_Sl_No__c," + serverInstance + "Assigned_Start_Time__c," + serverInstance + "Assigned_End_Time__c, " + serverInstance + "Incident__c, " + serverInstance + "Contact__c, " + serverInstance + "Contact__r.Name, " + serverInstance + "Contact__r.Phone, " + serverInstance + "Processing_Status__c, " + serverInstance + "Inspection_Standards__c, " + serverInstance + "Inspection_Description__c, " + serverInstance + "Date__c, " + serverInstance + "Incident__r.Name, " + serverInstance + "Product_Complaint__r.Name, " + serverInstance + "Service_Request__r.Name, " + serverInstance + "Cost_Estimate__c, " + serverInstance + "Date_Reported__c, " + serverInstance + "Installed_Location__c, " + serverInstance + "Product__r.Name, " + serverInstance + "Product__c, " + serverInstance + "RMA__r.Name, " + serverInstance + "Test_Standards__c, " + serverInstance + "Test_Standards_Description__c, " + serverInstance + "Comments__c, RecordType.Name, " + serverInstance + "Type__c, " + serverInstance + "SignOff__c, " + serverInstance + "Asset_Warranty__c, " + serverInstance + "SLA_Terms__c, CreatedDate, WO_Priority_MDSR__c, WO_Conclusion_Code_MDSR__c, WO_Date_Reported_MDSR__c, On_Hold_justification_MDSR__c, " + serverInstance + "Warranty_Application_Date_Update_Reason__c From " + serverInstance + "Work_Order__c Where Id='" + id + "'";
        return force.query(sql);
    };

    this.getWorkOrderContactsAccountsById = function (id) {
        return force.query("Select Id, Name,  " + serverInstance + "Account__c, " + serverInstance + "Account__r.Name," + serverInstance + "Contact__c, " + serverInstance + "Contact__r.Name, " + serverInstance + "Contact__r.Phone From " + serverInstance + "Work_Order__c Where Id='" + id + "'");
    };

    this.getWorkOrderNameById = function(id) {
        return force.query("Select Id, Name From " + serverInstance + "Work_Order__c Where Id='" + id + "'");
    };

    this.setSignatureToId = function(data) {
        return force.update("" + serverInstance + "Work_Order__c", data);
    };

    this.getSignatureById = function(id) {
        return force.query("SELECT " + serverInstance + "SignOff__c FROM " + serverInstance + "Work_Order__c WHERE Id='" + id + "'"); 
    };

    this.getRMADetails = function(id) {
        return force.query("SELECT Id,Name," + serverInstance + "Reason_for_Return__c," + serverInstance + "RMA_Order_Status__c FROM " + serverInstance + "RMA_Order__c WHERE " + serverInstance + "Work_Order__c='" + id + "' ORDER BY Name");
    }; 

    this.getRMADetailById = function(id) {
        return force.query("SELECT Id,Name," + serverInstance + "Account__c," + serverInstance + "Incident__c," + serverInstance + "Complaint__c," + serverInstance + "Contact__c," + serverInstance + "RMA_Order_Status__c," + serverInstance + "RMA_Origin__c," + serverInstance + "Service_Request__c," + serverInstance + "Work_Order__c," + serverInstance + "Reason_for_Return__c, " + serverInstance + "Work_Order__r.Name, " + serverInstance + "Account__r.Name, " + serverInstance + "Contact__r.Name, " + serverInstance + "Complaint__r.Name, " + serverInstance + "Service_Request__r.Name, " + serverInstance + "Incident__r.Name, " + serverInstance + "Work_Order__r." + serverInstance + "Product__c FROM " + serverInstance + "RMA_Order__c WHERE Id='" + id + "'");
    };

    this.getRMAReturnAction = function(id) {

        return force.query("SELECT Id,Name," + serverInstance + "Product__c," + serverInstance + "Status__c," + serverInstance + "Order_Line_Item__c, " + serverInstance + "Product__r.Name, " + serverInstance + "Order_Line_Item__r.Name FROM " + serverInstance + "Return_Material_Order__c WHERE " + serverInstance + "RMA_Order__c='" + id + "' ORDER BY Name");
    };

    this.getRMALoaner = function(id) {
        return force.query("SELECT Id,Name," + serverInstance + "Product__c," + serverInstance + "Order_Status__c, " + serverInstance + "Product__r.Name FROM " + serverInstance + "Loaner__c WHERE " + serverInstance + "RMA_Order__c='" + id + "' ORDER BY Name");
    };
    this.getReturnActionDetails = function(id) {
        return force.query("SELECT Id, Name, " + serverInstance + "RMA_Order__c, " + serverInstance + "RMA_Order__r.Name, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__c, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__r.Name, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__r." + serverInstance + "Product__c, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__r." + serverInstance + "Account__c, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__r." + serverInstance + "Account__r.Name, " + serverInstance + "Product__c, " + serverInstance + "Product__r.Name, " + serverInstance + "Order_Status__c, " + serverInstance + "Order_Type__c, " + serverInstance + "UDI__c, " + serverInstance + "Order_Line_Item__c, " + serverInstance + "Order_Line_Item__r.Name, " + serverInstance + "X3_Attempts_complete__c  FROM " + serverInstance + "Return_Material_Order__c WHERE Id='" + id + "'");
    };

    this.getLoanerDetails = function(id) {
        return force.query("SELECT Id, Name, " + serverInstance + "RMA_Order__c, " + serverInstance + "RMA_Order__r.Name, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__c, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__r.Name, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__r." + serverInstance + "Product__c, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__r." + serverInstance + "Account__c, " + serverInstance + "RMA_Order__r." + serverInstance + "Work_Order__r." + serverInstance + "Account__r.Name, " + serverInstance + "Asset__c, " + serverInstance + "Asset__r.Name, " + serverInstance + "Order_Status__c, " + serverInstance + "Is_Dispatched__c, " + serverInstance + "Dispatch_date__c, " + serverInstance + "Dispatch_Status__c, " + serverInstance + "Received_by__c, " + serverInstance + "Received_by__r.Name, " + serverInstance + "Received_Date_Time__c, " + serverInstance + "Receiving_Status__c  FROM " + serverInstance + "Loaner__c WHERE Id='" + id + "'");
    };

    this.getInvoiceByWoId = function(id){
        return force.query("SELECT Id,Name," + serverInstance + "Status__c," + serverInstance + "Total_Invoice_Detail_Amount__c FROM " + serverInstance + "Invoice__c WHERE " + serverInstance + "Work_Order__c='" + id + "'");
    };

    this.processWorkOrder = function(requestBody) {

        var params = {
            path: 'MobileWebserviceCompleteWorkorder_MDSR',
            method: 'POST',
            data: requestBody
        };

        return force.apexrest(params);
    };

    this.getAppliedContractTerms = function(id) {
        return force.query("Select ID, Name, "+ serverInstance +"Term__r.Name, "+ serverInstance +"Term__r."+ serverInstance +"Term_Type__c,Contract_Name_MDSR__c,Contract_Type_MDSR__c, "+ serverInstance +"Work_Order__r."+ serverInstance +"Asset__r.Name, Service_Product_MDSR__c, "+ serverInstance +"Term__r."+ serverInstance +"Service_Maintenance_Contract__r."+ serverInstance +"Start_Date__c, "+ serverInstance +"Term__r."+ serverInstance +"Service_Maintenance_Contract__r."+ serverInstance +"End_Date__c, "+ serverInstance +"Term__r."+ serverInstance +"Material_Covered__c from "+ serverInstance +"Applied_Contract_Term__c where "+ serverInstance +"Work_Order__c='"+ id + "'");
    };

    this.getServiceOrders = function(id){
        return force.query("Select ID, Name, MedConnect__Account__c, MedConnect__Account__r.Name, MedConnect__Contact__c, MedConnect__Contact__r.Name,MedConnect__Status__c, MedConnect__Delivery_Date__c from MedConnect__Inventory_Request_Order__c where MedConnect__Work_Order__c = '"+id+"'");
    };

    this.postSSOProcessWO = function (requestBody) {

        var params = {
            path: 'MobileUserAuthentication_MDSR',
            method: 'POST',
            data: requestBody
        };

        return force.apexrest(params);

    };
}

function AssignToolService(force, NetworkService, DataService, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.fetchAssignedIds = function (woaId) {
        return force.query("SELECT Id, "+serverInstance+"Tool__c FROM "+ serverInstance+"Assign_Tool__c WHERE "+serverInstance+"Work_Order_Activity__c = '"+woaId+"'");
    };

    this.fetchToolList = function(queryString) {
        return force.query(queryString);
    };

    this.assignToolList = function(data) {
        return force.create('' + serverInstance + 'Assign_Tool__c', data);
    };
    
}

function InstallAssetService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.fetchAssignedIds = function (woaId) {
        return force.query("SELECT Id, "+serverInstance+"Tool__c FROM "+ serverInstance+"Assign_Tool__c WHERE "+serverInstance+"Work_Order_Activity__c = '"+woaId+"'");
    };

    this.getInstallAssetData = function(RAId,Operation ) {
        var params = {
            path: 'MobileWebserviceRAInstallUninstall/' + RAId + '/'+ Operation,
            method: 'GET'
        };

        return force.apexrest(params);
    };

    this.getSerializedPorts =  function (id) {
        return force.query("select Id, Name, MedConnect__Serial_No__c,MedConnect__Account__r.Name, MedConnect__Lot_Master1__r.name, MedConnect__Batch_Master__r.Name,MedConnect__Installed_Date__c, MedConnect__Installed_By__r.name from MedConnect__Asset__c where ID != '"+ id +"' limit 100");
    };

   
}

function TechnicalBulletinService(force, MedvantageUtils, DataService,SOUPINFO ) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.applyTB = function(data) {
        return force.create('' + serverInstance + 'Work_Order_Activity__c', data);
    };

    this.getAvailableTechnicalBulliten = function(woid) {
        // return force.query("SELECT Id,MedConnect__Product__c,MedConnect__Valid_From__c,MedConnect__Valid_Till__c,Name, MedConnect__Priority__c, MedConnect__Content__c,Timeframe_MDSR__c,Applicable_Countries_MDSR__c FROM MedConnect__Technical_Bulletin__c WHERE MedConnect__Valid_From__c <= Today AND MedConnect__Valid_Till__c >= today AND MedConnect__Product__c IN (SELECT MedConnect__Product__c from MedConnect__Work_Order__c where ID ='"+ woid +"') and MedConnect__Product__c IN (SELECT Installed_Component_MDSR__c FROM Technical_Bulletin_Covered_Asset_MDSR__c where Serial_Number_MDSR__c ='"+assetId+"' )");
        return force.query("SELECT Id,MedConnect__Product__c,MedConnect__Valid_From__c,MedConnect__Valid_Till__c,Name, MedConnect__Priority__c, MedConnect__Content__c,Timeframe_MDSR__c,Applicable_Countries_MDSR__c FROM MedConnect__Technical_Bulletin__c WHERE MedConnect__Valid_From__c <= Today AND MedConnect__Valid_Till__c >= today AND MedConnect__Product__c IN (SELECT MedConnect__Product__c from MedConnect__Work_Order__c where ID ='"+woid+"') AND ID IN (Select Technical_Bulletin_MDSR__c from Technical_Bulletin_Covered_Asset_MDSR__c)");
    };



    this.getAppliedTechnicalBulliten = function(woid) {
        // var sql="Select ID,Technical_Bulletin_MDSR__c, Name,Technical_Bulletin_MDSR__r.MedConnect__Priority__c,Technical_Bulletin_MDSR__r.Name,Technical_Bulletin_MDSR__r.MedConnect__Valid_From__c,Technical_Bulletin_MDSR__r.MedConnect__Valid_Till__c, Technical_Bulletin_MDSR__r.MedConnect__Content__c,Technical_Bulletin_MDSR__r.Timeframe_MDSR__c,Technical_Bulletin_MDSR__r.Applicable_Countries_MDSR__c from MedConnect__Work_Order_Activity__c WHERE Asset_MDSR__c = '"+assetId+"' AND Technical_Bulletin_MDSR__c != null";
        var sql = "SELECT Id,MedConnect__Valid_From__c,MedConnect__Valid_Till__c,Name, MedConnect__Priority__c, MedConnect__Content__c,Timeframe_MDSR__c,Applicable_Countries_MDSR__c FROM MedConnect__Technical_Bulletin__c WHERE  Id IN (SELECT Technical_Bulletin_MDSR__c FROM MedConnect__Work_Order_Activity__c where MedConnect__Work_Order__c = '"+woid+"' ) ";
        console.log('sql',sql);
        return force.query(sql);
    };
    
}


function AssignToolDetailService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.fetchAssignedTool = function(assignToolId) {
        return force.query("SELECT Id, " + serverInstance + "Tool_Description__c," + serverInstance + "Tool_Name__c," + serverInstance + "Tool__c," + serverInstance + "Work_Order_Activity__c,Name FROM " + serverInstance + "Assign_Tool__c WHERE Id='" + assignToolId + "'");
    };

    this.fetchToolDetails = function(toolId) {
        return force.query("SELECT " + serverInstance + "Description__c," + serverInstance + "Product__r.Name," + serverInstance + "Source__c," + serverInstance + "Specification_1__c," + serverInstance + "Specification_2__c," + serverInstance + "Specification_3__c," + serverInstance + "Tool_Name__c,Name,Owner.Name FROM " + serverInstance + "Tool__c WHERE Id='" + toolId + "'");
    };
}

function SharedPreferencesService(force) {

    var workOrderName = '',
        accountName = '',
        accountId = '',
        contactName = '',
        contactId = '',
        workOrderId = '',
        productId = '',
        alternateTime = '',
        appointedTechnicianId = '',
        assignedTechnicianId = '',
        activityData = '',
        recordType = '',
        workOrderActivity = '',
        workOrderActivityId = '',
        workOrderProduct = '',
        repairAnalysisId = '',
        offlineRAId = '',
        analysisCodes = [],
        faultCodes = [],
        parentId = '',
        faultOrAnalysis = '',
        workOrderAsset = '',
        RAName = '',
        RAId = '',
        assetId = '',
        processingStatus = '',
        depotQueue = '',
        month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    this.setDepotQueue = function (dtQueue) {
        depotQueue = dtQueue;
    };

    this.getDepotQueue = function () {
        return depotQueue;
    };

    this.setProcessingStatus = function(proStatus) {
        processingStatus = proStatus;
    };

    this.getProcessingStatus = function(){
        return processingStatus;
    };

    this.getFaultOrAnalysis = function() {
        return faultOrAnalysis;
    };

    this.setFaultOrAnalysis = function(code) {
        faultOrAnalysis = code;
    };

    this.getWorkOrderName = function() {
        return workOrderName;
    };

    this.setWorkOrderName = function(woName) {
        workOrderName = woName;
    };

    this.getAccountName = function() {
        return accountName;
    };

    this.setAccountName = function(woAccountName) {
        accountName = woAccountName;
    };

    this.getContactName = function() {
        return contactName;
    };

    this.setContactName = function(woContactName) {
        contactName = woContactName;
    };

    this.getContactId = function() {
        return contactId;
    };

    this.setContactId = function(ContactId) {
        contactId = ContactId;
    };

    this.getAccountId = function() {
        return accountId;
    };

    this.setAccountId = function(AccountID) {
        accountId = AccountID;
    };

    this.setWorkOrderActivity = function (woaName) {
        workOrderActivity = woaName;
    };

    this.getWorkOrderActivity = function () {
        return workOrderActivity;
    };

    this.setWorkOrderActivityId = function (woaId) {
        workOrderActivityId = woaId;
    };

    this.getWorkOrderActivityId = function () {
        return workOrderActivityId;
    };

    this.getActivityData = function() {
        return activityData;
    };

    this.setActivityData = function(data) {
        activityData = data;
    };

    this.getWorkOrderId = function() {
        return workOrderId;
    };

    this.setWorkOrderId = function(woId) {
        workOrderId = woId;
    };

    this.getProductId = function() {
        return productId;
    };

    this.setProductId = function(prodId) {
        productId = prodId;
    };

    this.getAppointedTechnicianId = function() {
        return appointedTechnicianId;
    };

    this.setAppointedTechnicianId = function(techId) {
        appointedTechnicianId = techId;
    };

    this.getAssignedTechnicianId = function() {
        return assignedTechnicianId;
    };

    this.setAssignedTechnicianId = function(techId) {
        assignedTechnicianId = techId;
    };

    this.getLoggedInUserId = function() {
        return force.getUserId();
    };

    this.setAlternateTime = function(altTime) {
        alternateTime = altTime;
    };

    this.getAlternateTime = function() {
        return alternateTime;
    };

    this.setRecordType = function(type) {
        recordType = type;
    };

    this.getRecordType = function() {
        return recordType;
    };

    this.getMonth = function(mon) {
        return month[mon];
    };

    this.setWorkOrderProduct = function (product) {
        workOrderProduct = product;
    };

    this.getWorkOrderProduct = function () {
        return workOrderProduct;
    };

    this.setRepairAnalysisId = function (raId) {
        repairAnalysisId = raId;
    };

    this.getRepairAnalysisId = function () {
        return repairAnalysisId;
    };

    this.setAnalysisCode = function (aCodes) {
        analysisCodes = aCodes;
    };

    this.getAnalysisCode = function () {
        return analysisCodes;
    };

    this.setFaultCode = function (fCodes) {
        faultCodes = fCodes;
    };

    this.getFaultCode = function () {
        return faultCodes;
    };

    this.getParentId = function () {
        return parentId;
    };

    this.setParentId = function (parent_id) {
        parentId = parent_id;
    };

    this.getWorkOrderAsset = function () {
        return workOrderAsset;
    };

    this.setWorkOrderAsset = function (wo_asset) {
        workOrderAsset = wo_asset;
    };

    this.setRAName = function (raName) {
        RAName = raName;
    };

    this.getRAName = function () {
        return RAName;
    };

    this.setRAId = function (raId) {
        RAId = raId;
    };

    this.getRAId = function () {
        return RAId;
    };
    
    this.setAssetId = function (Id) {
        assetId = Id;
    };

    this.getAssetId = function () {
        return assetId;
    };

    this.setOfflineRAId = function(offRAId) {
        offlineRAId = offRAId;
    };

    this.getOfflineRAId = function() {
        return offlineRAId;
    };
}

function AcceptRejectWorkOrderService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.checkUserInOrg = function(name) {
        return force.query("SELECT Id FROM User WHERE Username='" + name + "'");
    };

    this.getIdOnRecordType = function() {
        return force.query("SELECT Id FROM Group WHERE Type='Queue' AND Name='Field Service Manager Queue'");
    };

    this.getDetailsFromWOAction = function(woId) {
        return force.query("SELECT Id, CreatedDate FROM " + serverInstance + "Work_Order_Action__c WHERE " + serverInstance + "Work_Order__c ='" + woId + "' ORDER BY CreatedDate DESC LIMIT 1");
    };

    this.getLoggedInUserIdFromEmail = function(userName) {
        return force.query("SELECT Id FROM User WHERE Username='" + userName + "'");
    };

    this.getUserIdFromTechId = function(technicianId) {
        return force.query("SELECT " + serverInstance + "User__c FROM " + serverInstance + "Technician__c WHERE Id='" + technicianId + "'");
    };

    this.validateUser = function(requestType, requestBody) {

        var params = {
            path: 'MobileWebServiceVerifyUserLogin',
            method: requestType,
            data: requestBody
        };

        return force.apexrest(params);
    };

    this.createWOActionRecord = function(data) {
        return force.create('' + serverInstance + 'Work_Order_Action__c', data);
    };

    this.updateWOActionRecord = function(woId, data) {

        data.Id = woId;
        return force.update('' + serverInstance + 'Work_Order__c', data);
    };

    this.getQueueDepot = function() {
        return force.query("SELECT " + serverInstance + "Depot_Account__r.MedConnect__Depot_Queue_Id__c FROM " + serverInstance + "Work_Order__c WHERE RecordType.Name='Depot Repair'");
    };

}

function SLAClockService(force) {
    this.getSLAClock = function(requestType, workOrderID) {
        var params = {
            path: 'MobileWebServiceWorkOrderSLAClock/' + workOrderID,
            method: requestType
        };

        return force.apexrest(params);
    };
}

function ActivityService(force, MedvantageUtils, DataService, SOUPINFO) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.createActivity = function(data) {
        return force.create("" + serverInstance + "Work_Order_Activity__c", data);
    };

    this.updateActivity = function(data) {
        return force.update("" + serverInstance + "Work_Order_Activity__c", data);
    };

    this.getActivity = function(id) {
        return force.query("SELECT Id,Name," + serverInstance + "Status__c," + serverInstance + "Billable__c, Technical_Bulletin_MDSR__r.Name from " + serverInstance + "Work_Order_Activity__c where " + serverInstance + "Work_Order__c='" + id + "' ORDER BY Name");
    };

    this.getAssignedTools = function(wo_activity_id) {
        return force.query("SELECT Id,Name," + serverInstance + "Tool__c," + serverInstance + "Tool_Description__c," + serverInstance + "Tool_Name__c FROM " + serverInstance + "Assign_Tool__c WHERE " + serverInstance + "Work_Order_Activity__c='" + wo_activity_id + "'");
    };

    this.getRA = function(wo_activity_id) {
        return force.query("SELECT Id,Name," + serverInstance + "Quantity__c," + serverInstance + "Status__c FROM " + serverInstance + "Repair_Analysis__c WHERE " + serverInstance + "Activity__c='" + wo_activity_id + "'");
    };

    this.getActivityDetails = function(id) {
        return force.query("SELECT Name,Id," + serverInstance + "Additional_Time_mins__c," + serverInstance + "Billable__c," + serverInstance + "Description__c," + serverInstance + "End_Time_formula__c," + serverInstance + "Labor_Time_mins__c," + serverInstance + "Priority__c," + serverInstance + "Start_Time__c," + serverInstance + "Status__c," + serverInstance + "Time_outside_Working_Hours_mins__c," + serverInstance + "Training_Time_mins__c," + serverInstance + "Travel_Time_mins__c," + serverInstance + "Type__c," + serverInstance + "Wait_Time_mins__c, " + serverInstance + "Work_Order__r.Name, " + serverInstance + "Work_Order__c, " + serverInstance + "Assigned_To_Primary__c, " + serverInstance + "Assigned_To_Secondary__c, " + serverInstance + "Assigned_To_Primary__r.Name, " + serverInstance + "Assigned_To_Secondary__r.Name, Activity_Template_MDSR__c, Activity_Template_MDSR__r.Name, Third_Party_Depot_MDSR__c, Third_Party_Depot_MDSR__r.Name, Technical_Bulletin_MDSR__c, Technical_Bulletin_MDSR__r.Name FROM " + serverInstance + "Work_Order_Activity__c WHERE Id='" + id + "'");
    };

    this.getActivityDetailsName = function(id) {
        return force.query("SELECT Name,Id FROM " + serverInstance + "Work_Order_Activity__c WHERE Id='" + id + "'");
    };

    this.getActivityTemplatesByProductId = function(id){
        return force.query("SELECT Id, Activity_Template_MDSR__c, Activity_Template_MDSR__r.Name, Activity_Template_MDSR__r.Activity_Description_MDSR__c from Product_Activity_Template_MDSR__c WHERE MedConnect_Product_MDSR__c ='"+id+"' Order By Activity_Template_MDSR__r.Name");
    };   

}

function ExpenseService(force, MedvantageUtils, DataService, SOUPINFO) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.createExpense = function(data) {
        return force.create("" + serverInstance + "Work_Order_Expense__c", data);
    };

    this.updateExpense = function(data) {
        return force.update("" + serverInstance + "Work_Order_Expense__c", data);
    };

    this.getExpenses = function(id) {
        return force.query("SELECT Id,Name," + serverInstance + "Type__c," + serverInstance + "Cost__c," + serverInstance + "Billable__c FROM " + serverInstance + "Work_Order_Expense__c WHERE " + serverInstance + "Work_Order__c='" + id + "' ORDER BY Name");
    };

    this.getExpenseDetails = function(id) {

        return force.query("SELECT Name,Id," + serverInstance + "Billable__c," + serverInstance + "Cost__c," + serverInstance + "Type__c, " + serverInstance + "Work_Order__r.Name, " + serverInstance + "Work_Order__c," + serverInstance + "Description__c FROM " + serverInstance + "Work_Order_Expense__c WHERE Id='" + id + "'");
        
    };
}

function RepairAnalysisService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }
    this.createRA = function(data) {
        return force.create("" + serverInstance + "Repair_Analysis__c", data);
    };

    this.updateRA = function(data) {
        return force.update("" + serverInstance + "Repair_Analysis__c", data);
    };

    this.getRepairAnalysisList = function(wo_activity_id) {
        return force.query("SELECT Id,Name," + serverInstance + "Quantity__c," + serverInstance + "Status__c," + serverInstance + "Defective_Part_Name__c FROM " + serverInstance + "Repair_Analysis__c WHERE " + serverInstance + "Work_Order__c='" + wo_activity_id + "' ORDER BY Name");
    };

    this.getRepairAnalysisDetails = function(RA_Id) {
        return force.query("SELECT Id, Name, " + serverInstance + "Work_Order__c, " + serverInstance + "Work_Order__r.Name, " + serverInstance + "Work_Order__r." + serverInstance + "Asset__c, " + serverInstance + "Part_Name_Product__c, " + serverInstance + "Part_Name_Product__r.Name, " + serverInstance + "Status__c, " + serverInstance + "Action__c, " + serverInstance + "Quantity__c, " + serverInstance + "Comments__c," + serverInstance + "Activity__c, " + serverInstance + "Activity__r.Name, " + serverInstance+"Parent_WO_Asset__c," + serverInstance + "Work_Order__r." + serverInstance + "Product__c FROM " + serverInstance + "Repair_Analysis__c WHERE Id='" + RA_Id + "'");
    }; 

    this.getRAShortDetails = function(RA_Id) {
        return force.query("SELECT Id, Name, " + serverInstance + "Work_Order__c, " + serverInstance + "Work_Order__r.Name, " + serverInstance + "Work_Order__r." + serverInstance + "Asset__c, " + serverInstance + "Work_Order__r." + serverInstance + "Asset__r.name" + " FROM " + serverInstance + "Repair_Analysis__c WHERE Id='" + RA_Id + "'"); 
    };

    this.getCodes = function(ra_id) {
        return force.query("SELECT " + serverInstance + "Code__c,Id,Name," + serverInstance + "Parent_Record_Id__c, " + serverInstance + "Code__r.Name, " + serverInstance + "Code__r." + serverInstance + "Description__c, " + serverInstance + "Code__r." + serverInstance + "Code_Level__c, " + serverInstance + "Code__r.RecordType.Name FROM " + serverInstance + "Code_Assignment__c WHERE " + serverInstance + "Parent_Record_Id__c='" + ra_id + "' and " +serverInstance+"Is_Deleted__c  = false");
    };

    this.getHierarchyHeader = function(asset_id) {
        return force.query("SELECT Id, Name," + serverInstance + "Asset__c, " + serverInstance + "Asset__r.name, " + serverInstance + "Product_Description__c, " + serverInstance + "Revision_Level__c, " + serverInstance + "Inspection_Cost__c ," + serverInstance + "Picture__c FROM " + serverInstance + "Material_BOM_Header__c WHERE " + serverInstance + "Asset__c = '" + asset_id + "'");
    };

    this.getHierarchyItems = function(asset_id) {
        return force.query("SELECT Id, Name, " + serverInstance + "Cost__c, " + serverInstance + "Quantity__c, " + serverInstance + "Service_Charge__c, " + serverInstance + "UOM__c, " + serverInstance + "Part_Name__c, " + serverInstance + "Part_Design__c, " + serverInstance + "Picture__c, " + serverInstance + "IsImage__c,  " + serverInstance + "Make_Or_Buy__c, " + serverInstance + "IsDesignUploaded__c, " + serverInstance + "Parent_Asset_Part_Name__c FROM " + serverInstance + "Material_BOM_Item__c WHERE " + serverInstance + "Material_BOM__c IN (SELECT Id FROM " + serverInstance + "Material_BOM_Header__c WHERE " + serverInstance + "Asset__c='" + asset_id + "') AND " + serverInstance + "Asset__c != null ORDER BY Name");
    };

    this.getAttachments = function (ra_id) {
        return force.query("SELECT (Select Id, ContentType, Name, ParentId From Attachments) FROM " + serverInstance + "Repair_Analysis__c where Id='"+ra_id+"'");
    };

    this.getTestInstructions  = function (ra_id) {
        return force.query("SELECT Id,Name,MedConnect__Instruction_Template__c, MedConnect__Instruction_Template__r.Name, MedConnect__Instruction_Template__r.MedConnect__Description__c , MedConnect__Record_Id__c,MedConnect__Status__c FROM MedConnect__Instruction_Test_Header__c WHERE MedConnect__Record_Id__c='"+ra_id+"' ORDER BY MedConnect__Instruction_Template__r.Name");
    };


    this.getTestInstructionTemplate = function(ra_id){
        var sql = "SELECT Id,Name FROM MedConnect__Instruction_Template__c WHERE MedConnect__Object_Type__c='Repair Analysis' order by name";
        return force.query(sql);
    };


    this.getTestNowForm = function(test_id){
        return force.query("SELECT Id, Name, MedConnect__Instruction_Section__c,MedConnect__Instruction_Section__r.Name,MedConnect__Instruction_Steps__c, MedConnect__Result__c ,MedConnect__Instruction_Steps__r.MedConnect__Options__c, MedConnect__Instruction_Steps__r.MedConnect__Result_Type__c, MedConnect__Instruction_Steps__r.MedConnect__Step_Instruction__c, MedConnect__Instruction_Steps__r.MedConnect__Step_Number__c FROM MedConnect__Instruction_Test__c where MedConnect__Instruction_Test_Header__c='"+test_id+"'ORDER BY MedConnect__Instruction_Section__r.Name, MedConnect__Instruction_Steps__r.MedConnect__Step_Number__c");
    };

    
    this.createTestInstruction = function(data) {
        return force.create("" + serverInstance + "Instruction_Test_Header__c", data);
    };

    this.getAllInstructionSections = function(id){
        return force.query("SELECT Id, MedConnect__Instruction_Section__c FROM MedConnect__Instruction_Steps__c WHERE MedConnect__Instruction_Template__c='"+id+"'");
    };

    this.addAllInstructionSections = function(data){
        return force.create("" + serverInstance + "Instruction_Test__c", data);    
    };

    this.updateTestInstruction = function(data){
        return force.update("" + serverInstance + "Instruction_Test__c", data);
    };

    this.updateStatusTestInstruction = function(data){
        return force.update("" + serverInstance + "Instruction_Test_Header__c", data);
    };
            
    this.addImage = function(data) {
        return force.create("Attachment", data);
    };

    this.getApplicableCodes = function (product_id) {
        return force.query("SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c, (SELECT Id FROM " + serverInstance + "Codes__r) FROM " + serverInstance + "Code__c WHERE RecordType.Name = 'Analysis Code' AND Id IN (SELECT " + serverInstance + "Code__c FROM  " + serverInstance + "Code_Product_Assignment__c WHERE " + serverInstance + "Product__c = '" + product_id + "') AND " + serverInstance + "Parent_Code__c=NULL ORDER BY Name");
    };

    this.getAvailableCodes = function () {
        return force.query("SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c, (SELECT Id, Name, "+serverInstance+"Code_Number__c, "+serverInstance+"Code_Level__c, "+serverInstance+"Description__c  FROM " + serverInstance + "Codes__r) FROM " + serverInstance + "Code__c WHERE RecordType.Name = 'Analysis Code' AND " + serverInstance + "Parent_Code__c=NULL ORDER BY Name");
    };

    this.assignCodes = function (data) {
        return force.create("" + serverInstance + "Code_Assignment__c", data);
    };

    this.getChildCodes = function (parent_id) {
        return force.query("SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c, (SELECT Id FROM " + serverInstance + "Codes__r) FROM " + serverInstance + "Code__c WHERE " + serverInstance + "Parent_Code__c = '" + parent_id + "'  ORDER BY Name");
    };

    this.getFaultApplicableCodes = function (product_id) {
        return force.query("SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c, (SELECT Id FROM " + serverInstance + "Codes__r) FROM " + serverInstance + "Code__c WHERE RecordType.Name = 'Fault Code' AND Id IN (SELECT " + serverInstance + "Code__c FROM  " + serverInstance + "Code_Product_Assignment__c WHERE " + serverInstance + "Product__c = '" + product_id + "') AND " + serverInstance + "Parent_Code__c=NULL ORDER BY Name");
    };

    this.getFaultAvailableCodes = function () {
        return force.query("SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c, (SELECT Id FROM " + serverInstance + "Codes__r) FROM " + serverInstance + "Code__c WHERE RecordType.Name = 'Fault Code' AND " + serverInstance + "Parent_Code__c=NULL ORDER BY Name");
    };

    this.deleteCode = function (data) {
        return force.update("" + serverInstance + "Code_Assignment__c", data);
    };

    this.getInstallationBOM = function (asset_id) {
        return force.query("SELECT Id, Name FROM "+serverInstance+"Material_BOM_Item__c WHERE "+serverInstance+"Material_BOM__r."+serverInstance+"Asset__c = '"+asset_id+"' ORDER BY Name");
    };

    this.getUnInstallationBOM = function (asset_id) {
        return force.query("SELECT Id, Name FROM "+serverInstance+"Material_BOM_Item__c WHERE "+serverInstance+"Material_BOM__r."+serverInstance+"Asset__c = '"+asset_id+"' AND MedConnect__Asset__c != null ORDER BY Name");
    };

    this.getSrcInventory = function () {
        return force.query("SELECT Id,Name, "+serverInstance+"Location__r.Name,"+serverInstance+"Owner_Account__r.Name,"+serverInstance+"Owner_Technician__r.Name,"+serverInstance+"Technician_User__c FROM "+serverInstance+"Inventory_Header__c ORDER BY Name");
    };

    this.getDestInventory = function () {
        return force.query("SELECT Id,Name, "+serverInstance+"Location__r.Name,"+serverInstance+"Owner_Account__r.Name,"+serverInstance+"Owner_Technician__r.Name,"+serverInstance+"Technician_User__c FROM "+serverInstance+"Inventory_Header__c ORDER BY Name");
    };

    this.getInventoryLineItems = function (source_id) {
        var sql = "SELECT Id,Name,"+serverInstance+"Asset__r.Name,"+serverInstance+"Lot_Master__r.Name,"+serverInstance+"Product__r.Name,"+serverInstance+"Quantity__c FROM "+serverInstance+"Inventory_Line_Item__c WHERE "+serverInstance+"Inventory__c ='"+source_id+"' ORDER BY Name";
        console.log('sql',sql);
        return force.query(sql);
    };

    this.installUninstallItem = function (request_type, request_data) { 

        var params = {
            path: '/services/apexrest/MobileWebServiceUninstallInstall/',
            method: request_type,
            data: request_data
        };

        return force.apexrest(params);

    };

    this.installUninstallSave = function (request_type, request_data) { 

        var params = {
            path: '/services/apexrest/MobileWebserviceRAInstallUninstallSave/',
            method: request_type,
            data: request_data
        };

        return force.apexrest(params);

    };
}

function UsersService(force) {

    this.getUsersList = function() {
        return force.query("SELECT Id, Name, UserRole.Name FROM User Order By Name");
    }; 
    this.getUserDetails = function(id) {
        return force.query("SELECT Id, Name, UserRole.Name FROM User WHERE Id='" + id + "'");
    };
}

function NetworkService() {

    this.isDeviceOnline = function() {
        var networkState = navigator.connection.type;
        if (networkState != Connection.UNKNOWN && networkState != Connection.NONE) {
            return true;
        } else {
            return false;
        }
    };
}

function CameraService($q, $ionicLoading) {

   return {
      getPicture: function(options) {
         var q = $q.defer();

         navigator.camera.getPicture(function(result) {
            q.resolve(result);
         }, function(err) {
            q.reject(err);
         }, options);

         return q.promise;
      }
   };

}

function NetworkService() {
    this.isDeviceOnline = function() {
        var networkState = navigator.connection.type;
        if (networkState != Connection.UNKNOWN && networkState != Connection.NONE) {
            return true;
        } else {
            return false;
        }
    };
}