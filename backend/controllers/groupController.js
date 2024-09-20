const pool = require("../config/db");

// Get all groups
exports.getAllGroups = async (req, res) => {
  console.log("Get All groups");
  try {
    let [value] = await pool.query("SELECT * FROM Grouplist");
    if (value.length === 0) {
      res.status(404).send("Groups not Found");
    }
    console.log(value);
    res.send(value);
  } catch (err) {
    console.log(err);
  }
};

// Get all groups
exports.getAllGroupNames = async (req, res) => {
  try {
    let [value] = await pool.query("SELECT DISTINCT Group_name FROM Grouplist");
    if (value.length === 0) {
      res.status(404).send("Groups not Found");
    }
    console.log(value);
    res.send(value);
  } catch (err) {
    console.log(err);
  }
};

// Get a specific group by Group_id

exports.getGroupById = async (req, res) => {
  const { Group_id } = req.params;
  try {
    const [value, fields] = await pool.query("SELECT * FROM Grouplist WHERE Group_id = ?", [Group_id]);
    if (value.length === 0) {
      return res.status(404).send("Group not Found");
    }
    console.log(value);
    res.send(value);
  } catch (err) {
    console.log(err);
  }
};

// Add New Group
exports.AddNewGrp = async (req, res) => {
  const grpName = req.body.Group_name;
  console.log("Add New group");
  console.log(grpName);

  //let connection;

  try {
    //connection = await pool.getConnection();

    const [rows] = await pool.query("SELECT 1 FROM Grouplist WHERE Group_name =?", [grpName]);
    if (rows.length > 0) {
      //group exist
      return res.status(400).send("Group existed");
    }

    //await connection.beginTransaction();

    // Insert New Group
    const [result] = await pool.execute("INSERT INTO Grouplist (Group_name) VALUES (?)", [grpName]);
    //const [result] = await connection.execute("INSERT INTO Grouplist (Group_name) VALUES (?)", [grpName]);

    if (result.affectedRows === 0) {
      // Rollback and hanlde insertion failure
      //await connection.rollback();
      res.status(400).send("Unable to insert");
      return;
    }

    //Commit transaction
    //await connection.commit();
    res.status(200).send("New Group added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
