app.service('InventoryService', ['force', 'MedvantageUtils', InventoryService]);

function InventoryService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnect__';
    }

    this.getInventoryList = function(userId) {
        return force.query("SELECT Id,"+serverInstance+"Location__c,"+serverInstance+"Location__r.Name,"+serverInstance+"Owner_Account__c,"+serverInstance+"Owner_Account__r.Name,Name FROM "+serverInstance+"Inventory_Header__c WHERE "+serverInstance+"Owner_Technician__r."+serverInstance+"User__c='"+userId+"' ORDER BY Name");
    };

    this.getInventoryById = function(id) {
        var sql ="SELECT Id,MedConnect__Owner_Account__c,MedConnect__Owner_Account__r.Name, Name,OwnerId,Owner.Name FROM MedConnect__Inventory_Header__c WHERE Id='"+id+"'";
        return force.query(sql);
    };

    this.getInventoryLineItemsList = function (id) {
        var sql = "SELECT Id,MedConnect__Asset__c,MedConnect__Product__c,MedConnect__Status__c,Name,MedConnect__Quantity__c,MedConnect__Product__r.Name,MedConnect__Asset__r.Name FROM MedConnect__Inventory_Line_Item__c WHERE MedConnect__Inventory__c = '"+id+"' ORDER BY Name";
        return force.query(sql);
    };

    this.getSourceInventoryTransactionsList = function (id) {
        var sql = "SELECT Id,Name,MedConnect__Source_Inventory__c,MedConnect__Destination_Inventory__c,MedConnect__Type__c,MedConnect__Asset__r.Name,MedConnect__Source_Inventory__r.Name,MedConnect__Destination_Inventory__r.Name,MedConnect__Parent_Asset1__r.Name,MedConnect__Product__r.Name,MedConnect__Lot_Master__r.Name,MedConnect__Quantity__c FROM MedConnect__Inventory_Transaction__c WHERE MedConnect__Source_Inventory__c = '"+id+"' ORDER BY Name";
        return force.query(sql);
    };
    this.getInventoryTransactionlists = function (id) {
        var sql = "SELECT Id,Name,MedConnect__Source_Inventory__c,MedConnect__Destination_Inventory__c,MedConnect__Type__c,MedConnect__Asset__r.Name,MedConnect__Source_Inventory__r.Name,MedConnect__Destination_Inventory__r.Name,MedConnect__Parent_Asset1__r.Name,MedConnect__Product__r.Name,MedConnect__Lot_Master__r.Name,MedConnect__Quantity__c FROM MedConnect__Inventory_Transaction__c WHERE MedConnect__Source_Inventory__c = '"+id+"' OR MedConnect__Destination_Inventory__c = '"+id+"' ORDER BY Name";
        return force.query(sql);
    };
    this.getDestinationInventoryTransactionsList = function (id) {
        var sql = "SELECT Id,Name,MedConnect__Source_Inventory__c,MedConnect__Destination_Inventory__c,MedConnect__Type__c,MedConnect__Asset__r.Name,MedConnect__Source_Inventory__r.Name,MedConnect__Destination_Inventory__r.Name,MedConnect__Parent_Asset1__r.Name,MedConnect__Product__r.Name,MedConnect__Lot_Master__r.Name,MedConnect__Quantity__c FROM MedConnect__Inventory_Transaction__c WHERE MedConnect__Destination_Inventory__c = '"+id+"' ORDER BY Name";
        return force.query(sql);
    };
    this.getInventoryLineItemDetails = function (id) {
        var sql = "SELECT Id, Name, MedConnect__Asset__c,MedConnect__Asset__r.Name,MedConnect__Batch_No__r.Name,MedConnect__Condition__c,MedConnect__Inventory__c, MedConnect__Lot_Master__r.Name,MedConnect__Product__c,MedConnect__Product__r.Name,MedConnect__Quantity__c,MedConnect__Serial_No__c,MedConnect__Status__c,MedConnect__Type__c,MedConnect__Inventory__r.Name,CreatedBy.Name,LastModifiedBy.Name FROM MedConnect__Inventory_Line_Item__c WHERE Id='"+id+"'";
        return force.query(sql);
    };
    this.getInventoryTransactionDetails = function (id) {
        return force.query("SELECT Id,Name,MedConnect__Asset__c,MedConnect__Asset__r.Name, MedConnect__Product__c,MedConnect__Product__r.Name,MedConnect__Quantity__c , MedConnect__Type__c, MedConnect__Source_Inventory__c, MedConnect__Source_Inventory__r.Name, MedConnect__Destination_Inventory__c, MedConnect__Destination_Inventory__r.Name FROM MedConnect__Inventory_Transaction__c WHERE Id='"+id+"'");
    };
}