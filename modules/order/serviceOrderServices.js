app.service('ServiceOrderService', ['force', 'MedvantageUtils', ServiceOrderService]);

function ServiceOrderService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.getProducts = function(days,limit,userId) {
        return force.query("SELECT Name, Id, "+serverInstance+"Therapeutic_Area__c, "+serverInstance+"Company_Product__c, OwnerId, "+serverInstance+"Product_Category__c" +
            " FROM "+serverInstance+"Product__c WHERE Id IN(SELECT "+serverInstance+"Product__c FROM "+serverInstance+"Work_Order__c WHERE  "+serverInstance+"Appointed_Technician__r."+serverInstance+"User__c ='"+ userId +"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+days+" OR "+serverInstance+"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name NULLS FIRST LIMIT " + limit);    

    };

    this.getSourceInventories =  function () {
    	return force.query("select Id, Name,MedConnect__Inventory_Name__c,MedConnect__Owner_Account__c,MedConnect__Owner_Technician__r.Name,MedConnect__Technician_User__c,MedConnect__Location__r.Name,MedConnect__isExternal__c from MedConnect__Inventory_Header__c");
    };

    this.getDestinationInventories =  function () {
    	return force.query("select Id, Name,MedConnect__Inventory_Name__c,MedConnect__Owner_Account__c,MedConnect__Owner_Technician__r.Name,MedConnect__Technician_User__c,MedConnect__Location__r.Name,MedConnect__isExternal__c from MedConnect__Inventory_Header__c");
    };
    
    this.getCurrentInventoryLocations = function () {
    	return force.query("select Id, Name,MedConnect__Inventory_Name__c,MedConnect__Owner_Account__c,MedConnect__Owner_Technician__r.Name,MedConnect__Technician_User__c,MedConnect__Location__r.Name,MedConnect__isExternal__c from MedConnect__Inventory_Header__c");
    };

    this.getOrderDetails = function(id) {

        return force.query("Select Id, Name, "+ serverInstance +"Account__c , "+ serverInstance +"Account__r.Name, "+ serverInstance +"Contact__c, "+ serverInstance +"Contact__r.Name, "+ serverInstance +"Status__c, "+ serverInstance +"Delivery_Date__c, Reason_for_Return_MDSR__c, "+ serverInstance +"Work_Order__c, "+ serverInstance +"Work_Order__r.Name from "+ serverInstance +"Inventory_Request_Order__c where Id='" + id + "'");
    };

    this.createOrder = function(requestBody) {

        var params = {
            path: 'MobileWebServiceFacade',
            method: 'POST',
            data: requestBody
        };

        return force.apexrest(params);
    };

    this.getLineItems =  function (orderId) {
        return force.query("Select Id,Name,SourceSystemId_MDSR__c,Integration_Status_MDSR__c,MedConnect__Asset__c,MedConnect__Product__c,MedConnect__Count__c,MedConnect__Comments__c,MedConnect__LineItem_Status__c,MedConnect__Order_Line_Type__c from MedConnect__Inventory_Order_Line_Item__c where MedConnect__Inventory_Request_Order__c = '"+orderId+"'");
    };
}