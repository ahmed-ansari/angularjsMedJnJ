app.service('AssetsService', ['force', 'MedvantageUtils', AssetsService]);
app.service('AssetNetworkService', AssetNetworkService);



function AssetsService(force, MedvantageUtils) {

  var serverInstance = MedvantageUtils.getMedSQlServerInstance();
  if (serverInstance === null || serverInstance === '') {
    serverInstance = 'MedConnect__';
  }

  this.getAssets = function (days, limit, userId) {
    return force.query("SELECT Id,Name," + serverInstance + "Installed_By__r.Name," + serverInstance + "Product__r.Name," + serverInstance + "Serial_No__c," + serverInstance + "Type__c" +
      " FROM " + serverInstance + "Asset__c WHERE ID IN(SELECT "+ serverInstance +"Asset__c FROM " + serverInstance + "Work_Order__c WHERE " + serverInstance + "Appointed_Technician__r."+serverInstance+"User__c ='"+ userId +"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+ days + " OR "+ serverInstance +"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Id DESC NULLS FIRST LIMIT " + limit);

  };

  this.getAssetsMore = function (days, num, userId) {
    return force.query("SELECT Id,Name," + serverInstance + "Installed_By__r.Name," + serverInstance + "Product__r.Name," + serverInstance + "Serial_No__c," + serverInstance + "Type__c" +
      " FROM " + serverInstance + "Asset__c WHERE ID IN(SELECT "+ serverInstance +"Asset__c FROM " + serverInstance + "Work_Order__c WHERE " + serverInstance + "Appointed_Technician__r."+serverInstance+"User__c ='"+ userId +"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+ days + " OR "+ serverInstance +"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name NULLS FIRST LIMIT 20 OFFSET " + num);

  };

  this.getAssetById = function (id) {
    var sql  = 'SELECT Id,' + serverInstance + 'Account__c,' + serverInstance + 'Current_Location__c,' + serverInstance + 'Date_Shipped__c,' + serverInstance + 'Device_Manufacture_Date__c,' +
      '' + serverInstance + 'Expiration_Date__c,' + serverInstance + 'Installed_By__c,' + serverInstance + 'Installed_Date__c,' + serverInstance + 'Last_Serviced_By__c,' + serverInstance + 'Last_Serviced_Date__c,' + 
        'Product_Part_Number_MDSR__c,' +
        'Product_Description_MDSR__c,' +
        serverInstance + 'Batch_Master__c,' +
        serverInstance + 'Batch_Master__r.Name,' +
        serverInstance + 'Lot_Master1__c,' +
        serverInstance + 'Lot_Master1__r.Name,' +
        serverInstance + 'Recall__c,' +
        serverInstance + 'Software_Version__r.Name,' +
        serverInstance + 'Hardware_Version__r.Name,' +
         'Note_MDSR__c,Not_For_Human_Use_MDSR__c, Down_Time_MDSR__c,Disputed_Location_MDSR__c,' +
        'Next_PM_Date2_MDSR__c,Legal_Hold_MDSR__c,' +
        'Frequency_Unit_MDSR__c,' +
        'Frequency_MDSR__c,' +
        'Last_PM_Date_MDSR__c,' +
        'Usage_Cycle_Count_MDSR__c,' +

         serverInstance + 'Last_Shipped_Date__c,' + serverInstance + 'Manufacturer_Location__c,' + serverInstance + 'Manufacturer_Name__c,' + serverInstance + 'Manufacturer_Report_Number__c,' +
      '' + serverInstance + 'Manufacturing_Country__c,' + serverInstance + 'Manufacturing_Location__c,' + serverInstance + 'Order_Line_Item__c,' + serverInstance + 'Ownership_Level__c,' + serverInstance + 'Postal_Code__c,' +
      '' + serverInstance + 'Product__c,' + serverInstance + 'Purchase_Order_No__c,' + serverInstance + 'Quantity__c,' + serverInstance + 'Referenceable__c,' + serverInstance + 'Serial_No__c,' + serverInstance + 'Service_Due_On__c,' + serverInstance + 'State__c,' + serverInstance + 'Street__c,' + serverInstance + 'Type__c,' + serverInstance + 'UDI__c,' + serverInstance + 'Usage_Status__c,Name, ' + serverInstance + 'Account__r.Name,' +
      '' + serverInstance + 'Product__r.Name, ' + serverInstance + 'Installed_By__r.Name' +
      ' FROM ' + serverInstance + 'Asset__c WHERE Id='+"'"+id+"'";
    return force.query(sql);
  };

  this.getAssetsLookup =  function () {
    return force.query("select Id, Name, MedConnect__Serial_No__c,MedConnect__Account__r.Name, MedConnect__Lot_Master1__r.name, MedConnect__Batch_Master__r.Name,MedConnect__Installed_Date__c, MedConnect__Installed_By__r.name from MedConnect__Asset__c ORDER BY Id DESC limit 100" );
  };

  this.getAssetWorkOrder = function (id) {
    var sql = 'SELECT Id,Name,' + serverInstance + 'Processing_Status__c,' + serverInstance + 'Product__c, ' + serverInstance + 'Product__r.Name, ' + serverInstance + 'Appointed_Technician__r.MedConnect__User__c' +
      ' FROM ' + serverInstance + 'Work_Order__c WHERE ' + serverInstance + 'Asset__c='+"'"+id+"'";
    return force.query(sql);
  };

  this.getAssetServiceContract = function (id) {

    return force.query('SELECT Id, Name, ' + serverInstance + 'Service_Maintenance_Contract__c, ' + serverInstance + 'Service_Maintenance_Contract__r.Name, '+ serverInstance + 'Service_Maintenance_Contract__r.'+ serverInstance +'Active__c, ' + serverInstance + 'Service_Maintenance_Contract__r.' + serverInstance + 'Contract_Number__c, ' + serverInstance + 'Product_Name__c , ' + serverInstance + 'Service_Maintenance_Contract__r.' + serverInstance + 'Contract_Signed__c '+
      'FROM ' + serverInstance + 'Covered_Asset__c WHERE ' + serverInstance + 'Asset__c='+"'"+id+"'");
  };

  this.getModules =  function () {
    return force.query("SELECT Id,Name,MedConnect__Value__c,MedConnect__Product__r.name,MedConnect__Type__c,       MedConnect__Description__c FROM MedConnect__Product_Attribute__c WHERE MedConnect__Type__c = 'Module' AND MedConnect__IsActive__c = True");
  };

  this.getSoftwares = function (pid) {
    return force.query("SELECT Id,Name,Revision_MDSR__c,Version_MDSR__c,MedConnect__Product__c,       MedConnect__Description__c,MedConnect__IsActive__c,MedConnect__Value__c,MedConnect__Type__c FROM MedConnect__Product_Attribute__c WHERE MedConnect__Product__c ='"+pid+"' AND MedConnect__Type__c = 'Software Version' AND MedConnect__IsActive__c = True");
  };

  this.getHardwares = function (pid) {
    return force.query("SELECT Id,Name,Revision_MDSR__c,Version_MDSR__c,MedConnect__Product__c,       MedConnect__Description__c,MedConnect__IsActive__c,MedConnect__Value__c,MedConnect__Type__c FROM MedConnect__Product_Attribute__c WHERE MedConnect__Product__c ='"+pid+"' AND MedConnect__Type__c = 'Hardware Version' AND MedConnect__IsActive__c = True");
  };

  this.getLocations = function (){
     return force.query("SELECT Id, Name, Billing_Address_MDSR__c,Shipping_Address_MDSR__c FROM Account");
  };

  this.getAssetUpdateDetails = function (id) {
    return force.query("Select Id, name,Last_PM_Date_MDSR__c,MedConnect__Installed_Date__c,Usage_Cycle_Count_MDSR__c,MedConnect__Software_Version__c,MedConnect__Software_Version__r.Name, MedConnect__Hardware_Version__c,MedConnect__Hardware_Version__r.Name,MedConnect__Account__c,MedConnect__Account__r.Name,MedConnect__Product__c,MedConnect__Product__r.Name from MedConnect__Asset__c where Id = '"+ id +"'");
  };

  this.getChildAssets = function(assetId){
    var sql ="SELECT MedConnect__Asset__c,MedConnect__Asset__r.name,MedConnect__Asset__r.Last_PM_Date_MDSR__c,MedConnect__Asset__r.MedConnect__Installed_Date__c,MedConnect__Asset__r.Usage_Cycle_Count_MDSR__c,MedConnect__Asset__r.MedConnect__Software_Version__c,MedConnect__Asset__r.MedConnect__Hardware_Version__c,MedConnect__Asset__r.MedConnect__Account__c FROM MedConnect__Material_BOM_Item__c WHERE MedConnect__Material_BOM__c  IN (SELECT Id FROM MedConnect__Material_BOM_Header__c WHERE MedConnect__Asset__c ='"+assetId+"') AND MedConnect__Asset__c != null";
    console.log('sql',sql);
    return force.query(sql);
  };

  this.getParentAssets = function(workorderId){
    return force.query("SELECT MedConnect__Asset__c,MedConnect__Asset__r.name,MedConnect__Asset__r.Last_PM_Date_MDSR__c,MedConnect__Asset__r.MedConnect__Installed_Date__c,MedConnect__Asset__r.Usage_Cycle_Count_MDSR__c,MedConnect__Asset__r.MedConnect__Software_Version__c,MedConnect__Asset__r.MedConnect__Hardware_Version__c,MedConnect__Asset__r.MedConnect__Account__c FROM MedConnect__Work_Order__c WHERE Id = '"+workorderId+"'");
  };


  this.updateAsset = function(requestBody) {

        var params = {
            path: 'MobileWebServiceUpdateAsset',
            method: 'POST',
            data: requestBody
        };

        return force.apexrest(params);
    };

   this.getAllUpdateAssets = function(woId) {

        var params = {
            path: 'MobileWebServiceUpdateAsset/'+woId,
            method: 'GET'
        };

        return force.apexrest(params);
    };

  this.getModules = function(assetId) {
      return force.query("select ID, Name,Module_MDSR__r.Name,Asset_MDSR__r.Name from Asset_Module_MDSR__c where Asset_MDSR__c='"+assetId+"'");
  };
  
  this.getModuleInfo = function(modId) {
      return force.query("select ID, Name,Module_MDSR__r.Name,Module_MDSR__r.Id,Asset_MDSR__r.Name from Asset_Module_MDSR__c where Id='"+modId+"'");
  };


  this.getAllModules = function() {
      return force.query("select Id, Name, MedConnect__Product__r.Name, MedConnect__Type__c, MedConnect__Value__c,MedConnect__Description__c FROM MedConnect__Product_Attribute__c WHERE MedConnect__Type__c = 'Module' AND MedConnect__IsActive__c = True");
  };

  this.getActivities = function (assetId) {
    return force.query("SELECT Id,Name, MedConnect__Type__c, Technical_Bulletin_MDSR__c, MedConnect__Work_Order__c,MedConnect__Work_Order__r.Name,Technical_Bulletin_MDSR__r.Name FROM MedConnect__Work_Order_Activity__c WHERE Asset_MDSR__c = '"+assetId+"'");
  };

  this.getMaterialBOMItems = function (bomId) {
    return force.query("SELECT Id, name, MedConnect__Material_BOM__r.Name,MedConnect__Asset__r.Name, MedConnect__Product__r.Name FROM MedConnect__Material_BOM_Item__c WHERE MedConnect__Material_BOM__c ='"+bomId+"'");
  };

  this.getParentMaterialBOMItems = function (bomid) {
    return force.query("SELECT Id, Name, MedConnect__Material_BOM__r.Name,MedConnect__Asset__r.Name, MedConnect__Product__r.Name FROM MedConnect__Material_BOM_Item__c WHERE MedConnect__Material_BOM__r.Name ='"+bomid+"'");
  };

  this.getLot = function () {
    return force.query("SELECT Name,Id, MedConnect__Lot_Number__c,MedConnect__Product__r.name FROM MedConnect__Lot_Master__c");
  };

   this.getProductsbySearch = function (product_name) {
    return force.query("SELECT Name,Id, MedConnect__Product_Part_Number__c,MedConnect__Repair_Site__c,MedConnect__Is_Part__c,MedConnect__Status__c,Source_System_Name_MDSR__c FROM MedConnect__Product__c WHERE Name LIKE '%"+product_name+"%'");
  };

  this.getAssetsbySearch =  function (asset_name) {
    return force.query("select Id, Name , MedConnect__Product__r.Name , MedConnect__Serial_No__c ,MedConnect__Account__r.Name , MedConnect__Lot_Master1__r.Name , MedConnect__Batch_Master__r.Name ,MedConnect__Installed_Date__c , MedConnect__Installed_By__r.Name from MedConnect__Asset__c where MedConnect__Inventory_Status__c != 'Installed' and MedConnect__Parent_Asset__c = '' and Name LIKE '%"+asset_name+"%'");
  };
}

function AssetNetworkService() {

    this.isDeviceOnline = function() {
        var networkState = navigator.connection.type;
        if (networkState !== Connection.UNKNOWN && networkState !== Connection.NONE) {
            return true;
        } else {
            return false;
        }
    };
}