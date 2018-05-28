app.service('CalendarService', ['force', CalendarService]);
app.service('UserService', ['force', UserService]);
app.service('NetworkService', NetworkService);

function UserService (force) {
	this.getUserDetails = function () {
		return force.query("SELECT Id,Address,City,Title,CompanyName,ContactId,Country,Email,FirstName,LastName,Latitude,Longitude,MedConnect__Address__c,MobilePhone,Name,Phone,State,Street,Username,UserType FROM User WHERE Id='"+force.getUserId()+"'");
	};
}

function CalendarService(force) {
    this.getItems = function(start,end) {
        var sql = "SELECT Id, Name, MedConnect__Assigned_Start_Time__c, MedConnect__Assigned_End_Time__c, MedConnect__Installed_Location__c, MedConnect__Asset__r.Name, MedConnect__Processing_Status__c, MedConnect__Product__c FROM MedConnect__Work_Order__c Where MedConnect__Asset__c != null AND MedConnect__Processing_Status__c In ('Open','In progress','Pending Completion','Accepted by FSE/Scheduled','Completed') And MedConnect__Appointed_Technician__r.MedConnect__User__c = '"+force.getUserId()+"' And MedConnect__Assigned_Start_Time__c != null AND MedConnect__Assigned_End_Time__c != null AND ((MedConnect__Assigned_Start_Time__c >="+ start +" And MedConnect__Assigned_End_Time__c <="+ end +" ) Or (MedConnect__Assigned_Start_Time__c >="+ start +" And MedConnect__Assigned_Start_Time__c <="+ end +") Or (MedConnect__Assigned_End_Time__c >="+ start +" And MedConnect__Assigned_End_Time__c <="+ end +") Or (MedConnect__Assigned_Start_Time__c <="+ start +" And MedConnect__Assigned_End_Time__c >="+ end +")) ORDER BY MedConnect__Assigned_Start_Time__c";
        return force.query(sql);
    };

    this.getItemsStatic = function() {
        return force.query("SELECT Id, Name, MedConnect__Assigned_Start_Time__c, MedConnect__Assigned_End_Time__c, MedConnect__Installed_Location__c, MedConnect__Asset__r.Name, MedConnect__Product__c FROM MedConnect__Work_Order__c Where MedConnect__Asset__c != null AND MedConnect__Processing_Status__c <> 'Completed' And MedConnect__Appointed_Technician__r.MedConnect__User__c = '00536000002dcVQAAY' And MedConnect__Assigned_Start_Time__c != null AND MedConnect__Assigned_End_Time__c != null AND ((MedConnect__Assigned_Start_Time__c >= 2016-07-30T18:30:00.000Z And MedConnect__Assigned_End_Time__c <= 2016-09-10T18:30:00.000Z ) Or (MedConnect__Assigned_Start_Time__c >= 2016-07-30T18:30:00.000Z And MedConnect__Assigned_Start_Time__c <= 2016-09-10T18:30:00.000Z) Or (MedConnect__Assigned_End_Time__c >= 2016-07-30T18:30:00.000Z And MedConnect__Assigned_End_Time__c <= 2016-09-10T18:30:00.000Z) Or (MedConnect__Assigned_Start_Time__c <= 2016-07-30T18:30:00.000Z And MedConnect__Assigned_End_Time__c >= 2016-09-10T18:30:00.000Z)) ORDER BY MedConnect__Assigned_Start_Time__c");
    };
}

function NetworkService() {

    this.isDeviceOnline = function() {
        var networkState = navigator.connection.type;
        if (networkState !== Connection.UNKNOWN && networkState !== Connection.NONE) {
            return true;
        } else {
            return false;
        }
    };
}