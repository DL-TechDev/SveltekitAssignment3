const pool = require("../config/db");

// Get all groups
exports.getAllGroups = async (req, res) => {
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

// Get a specific group by Group_id

exports.getGroupById = async (req, res) => {
  const { Group_id } = req.params;
  try {
    const [value, fields] = await pool.execute("SELECT * FROM Grouplist WHERE Group_id = ?", [Group_id]);
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
  console.log(grpName);

  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute("SELECT 1 FROM Grouplist WHERE Group_name =?", [grpName]);
    if (rows.length > 0) {
      //group exist
      return res.status(400).send("Group existed");
    }

    await connection.beginTransaction();

    // Insert New Group
    const [result] = await connection.execute("INSERT INTO Grouplist (Group_name) VALUES (?)", [grpName]);

    if (result.affectedRows === 0) {
      // Rollback and hanlde insertion failure
      await connection.rollback();
      res.status(400).send("Unable to insert");
      return;
    }

    //Commit transaction
    await connection.commit();
    res.status(200).send("New Group added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

/*
// Add New Group
exports.addGroup = (req, res) => {
  const { Group_name } = req.body;

  // Validate input
  if (!Group_name) {
    return res.status(400).json({ message: "Group name is required" });
  }

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Error starting transaction" });
    }

    const query = "INSERT INTO Grouplist (Group_name) VALUES (?)";

    db.query(query, [Group_name], (err, results) => {
      if (err) {
        // Rollback transaction on error
        return db.rollback(() => {
          res.status(500).json({ error: "Error adding new group" });
        });
      }

      // Commit the transaction if the query was successful
      db.commit((err) => {
        if (err) {
          // Rollback transaction if commit fails
          return db.rollback(() => {
            res.status(500).json({ error: "Error committing transaction" });
          });
        }

        // Success response after committing the transaction
        res.status(201).json({
          message: "Group added successfully",
          groupId: results.insertId, // The new group's ID
          groupName: Group_name,
        });
      });
    });
  });
};
*/
