const pool = require("../config/db");

// Add new User-Group association
exports.addUserGroup = async (req, res) => {
  const { User_name, Group_id } = req.body;

  // Validate input
  if (!User_name || !Group_id) {
    return res.status(400).json({ message: "User_name and Group_id are required" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if the username already exists
    const [rows] = await connection.execute("INSERT INTO User_group (User_name, Group_id) VALUES (?, ?)", [User_name, Group_id]);

    if (result.affectedRows === 0) {
      // Rollback and handle insertion failure
      await connection.rollback();
      res.status(404).send("Unable to insert");
      return; // Exit early
    }
    // Commit transaction
    await connection.commit();
    res.status(200).send("New User Group successfully");
  } catch (err) {
    if (connection) {
      // Rollback on error
      await connection.rollback();
    }
    console.error(err);
    res.status(500).send("Server error");
  } finally {
    if (connection) {
      // Release the connection
      connection.release();
    }
  }
};

// Update User's Groups
exports.updateUserGroups = async (req, res) => {
  const { User_name, Group_Id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // First, remove existing groups for the user
    const [results] = await connection.execute("DELETE FROM User_group WHERE User_name = ?",[User_name],
      (err = {
        if(err) {
          return res.status(500).json({ error: err.message });
        },
      })
    );
    await connection.commit(); // Commit transaction
    res.status(200).send("Previous User_Group is deleted successfully");
  } catch (err) {
    await connection.rollback(); // Rollback on error
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }

  // Add new group associations

  await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert new group
    const [results] = await connection.execute(
      "INSERT INTO User_group (User_name, Group_id) VALUES ?"[(User_name, groupIds)],
      (err = {
        if(err) {
          return res.status(500).json({ error: err.message });
        },
      })
    );
    await connection.commit(); // Commit transaction
    res.status(200).send("User_Group is updated successfully");
  } catch (err) {
    await connection.rollback(); // Rollback on error
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }
};

// Get all user-group associations
exports.getAllUserGroups = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM User_group");
    console.log(results);
    res.send(results);
  } catch (err) {
    console.error(err);
  }
};
