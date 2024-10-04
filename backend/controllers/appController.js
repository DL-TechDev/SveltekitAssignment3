const pool = require("../config/db");

// get all appInfo: App_Acronym, App_Description, App_Rnumber
exports.getAllApp = async (req, res) => {
  console.log("Fetching all apps");
  let appList = [];
  // Get app info (App_Acronym, App_Description, App_Rnumber)
  try {
    let [appInfo] = await pool.query("Select App_Acronym, App_Description, App_Rnumber from Application");
    console.log("Managed to get apps: ", appInfo);
    appInfo.forEach((app) => {
      let box = {
        App_Acronym: app.App_Acronym,
        App_Description: app.App_Description,
        App_Rnumber: app.App_Rnumber,
      };
      appList.push(box);
    });
    console.log(appList);
    res.status(200).send(appList);
  } catch (err) {
    return res.status(500).send("Error retriving data from Application table");
  }
};

// get info for an app *Working
exports.getAppInfo = async (req, res) => {
  const { App_Acronym } = req.body;
  // mising app number
  if (!App_Acronym) return res.status(400).send("Bad Request");
  try {
    let [appInfo] = await pool.query("SELECT * from Application where App_Acronym = ?", [App_Acronym]);
    res.status(200).send(appInfo);
  } catch (err) {
    return res.status(500).send("Error retriving info for the application");
  }
};

// can only update Description, permit_create, open, todolist, doing, done
exports.editAppInfo = async (req, res) => {
  console.log("In edit app info now:");
  const { App_Acronym, App_Description, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done } = req.body;

  let statement =
    "UPDATE Application SET App_Description=?, App_permit_Create=?, App_permit_Open=?, App_permit_toDoList=?, App_permit_Doing=?, App_permit_Done=? WHERE App_Acronym=?";

  try {
    let [editAppInfo] = await pool.execute(statement, [
      App_Description,
      App_permit_Create,
      App_permit_Open,
      App_permit_toDoList,
      App_permit_Doing,
      App_permit_Done,
      App_Acronym,
    ]);
    res.status(200).send("App updated successfully");
  } catch (err) {
    return res.status(500).send("Error updating applicaiton info");
  }
};

//* Working
exports.createApp = async (req, res) => {
  console.log("In the Create App:")
  console.log(req.body);
  // getting items from req
  const {
    App_Acronym,
    App_Description,
    App_Rnumber,
    App_startDate,
    App_endDate,
    App_permit_Create,
    App_permit_Open,
    App_permit_toDoList,
    App_permit_Doing,
    App_permit_Done,
  } = req.body;

  // check for null values
  if (!App_Acronym || !App_Rnumber || !App_startDate || !App_endDate) return res.status(400).send("Bad request: empty values");

  let statement =
    "INSERT INTO Application (App_Acronym, App_Description ,App_Rnumber, App_startDate,App_endDate, App_permit_Create, App_permit_Open,App_permit_toDoList, App_permit_Doing, App_permit_Done) VALUES (?,?,?,?,?,?,?,?,?,?)";
  try {
    let [newApp] = await pool.execute(statement, [
      App_Acronym,
      App_Description,
      App_Rnumber,
      App_startDate,
      App_endDate,
      App_permit_Create,
      App_permit_Open,
      App_permit_toDoList,
      App_permit_Doing,
      App_permit_Done
    ]);
    return res.status(200).send("App has been created successfully!");
  } catch (err) {
    return res.status(500).send("Error creating app");
  }
};

//* Working
exports.updateAppDescription = async (req, res) => {
  const { App_Acronym, App_Description } = req.body;

  try {
    let statement = "UPDATE Application SET App_Description = ? WHERE App_Acronym =?";
    let [editAppInfo] = await pool.execute(statement, [App_Description, App_Acronym]);
    res.status(200).send("Applciation updated successfully!");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// * Working
exports.updateAppPermitCreate = async (req, res) => {
  const { App_Acronym, App_permit_Create } = req.body;
  console.log(req.body);
  console.log("Group of users: ", App_permit_Create);

  const userGrp = App_permit_Create.join(",");
  console.log("userGrp: ", userGrp);

  try {
    let statement = "UPDATE Application SET App_permit_Create=? WHERE App_Acronym=?";

    let [editAppPermitCreate] = await pool.execute(statement, [userGrp, App_Acronym]);
    res.status(200).send("App Permit Create Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating App Permit Create");
  }
};

// * Working
exports.updateAppPermitOpen = async (req, res) => {
  const { App_Acronym, App_permit_Open } = req.body;
  console.log(req.body);
  console.log("Group of users: ", App_permit_Open);

  const userGrp = App_permit_Open.join(",");
  console.log("userGrp: ", userGrp);

  try {
    let statement = "UPDATE Application SET App_permit_Open=? WHERE App_Acronym=?";

    let [editAppPermitCreate] = await pool.execute(statement, [userGrp, App_Acronym]);
    res.status(200).send("App Permit Open Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating App Permit Open");
  }
};

exports.updateAppPermitToDoList = async (req, res) => {};

exports.updateAppPermitToDoListDoing = async (req, res) => {};

exports.updateAppPermitDone = async (req, res) => {};
