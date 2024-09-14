const bcrypt = require("bcrypt");
const saltRounds = 10; // Number of salt rounds for hashing
const pool = require("../config/db");

// get all users
exports.getAllUser = async (req, res) => {
  let usersList = [];
  // Get user info (name, email, active)
  try {
    let [userInfo] = await pool.query("Select User_name, Email, Active from User");
    console.log(userInfo);

    userInfo.forEach((user) => {
      let box = {
        User_name: user.User_name,
        Email: user.Email,
        Active: user.Active,
        Group: [],
      };
      usersList.push(box);
    });
    console.log(usersList);
  } catch (err) {
    return res.status(500).send("Error retriving data from User table");
  }

  // get groups accociate with user
  try {
    let queryStatement =
      "SELECT u.User_name, g.Group_name, g.Group_id " +
      "FROM User u " +
      "JOIN User_group ug ON u.User_name = ug.User_name " +
      "JOIN Grouplist g ON ug.Group_id = g.Group_id ";

    let [jGrpResult] = await pool.query(queryStatement);
    console.log("done the group query");
    console.log(jGrpResult);

    usersList.forEach((user) => {
      let filtered = jGrpResult.filter((ug) => ug.User_name == user.User_name);
      console.log(filtered);
      filtered.forEach((ugf) => {
        user.Group.push(
          ugf.Group_name
          //Group_id: ugf.Group_id,
        );
      });
    });
  } catch (error) {
    return res.status(500).send("Error retriving user group details from User table");
  }

  res.status(200).send(usersList);
};

// get single user based on name
exports.getUser = async (req, res) => {
  const User_name = req.user.username;
  //console.log(User_name);
  try {
    const [value, fields] = await pool.execute("SELECT * FROM User WHERE user_name = ?", [User_name]);
    res.json(value); // Send the result as JSON response
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

// update of email

exports.updateEmail = async (req, res) => {
  const { User_name, Email } = req.body;
  console.log(User_name);
  console.log("Email to be updated: ", Email);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); //Start transaction

    const [result] = await connection.execute("UPDATE User SET email =? WHERE User_name =?", [Email, User_name]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).send("User not Found");
    }
    await connection.commit(); // Commit transaction
    res.status(200).send("User's Email is updated successfully");
  } catch (err) {
    await connection.rollback(); // Rollback on error
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }
};

// Update Password

exports.updatePassword = async (req, res) => {
  const { User_name, Password } = req.body;
  console.log(Password);

  // Hash the new password
  let hashedPassword;
  if (Password) {
    try {
      hashedPassword = await bcrypt.hash(Password, saltRounds);
    } catch (error) {
      return res.status(500).json({ error: "Error hashing password" });
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); //Start transcation
    const [result] = await connection.execute("UPDATE User SET password =? WHERE User_name =?", [Password, User_name]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).send("User not Found");
    }

    await connection.commit(); // Commit transaction
    res.status(200).send("User's Password is updated successfully");
  } catch (err) {
    await connection.rollback(); // Rollback on error
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }
};

// Create new user

exports.CreateNewUser = async (req, res) => {
  console.log(req.body);
  const { User_name, Password, Email, Active, Group_name } = req.body; //Use req.body for POST request data
  console.log(User_name);

  let connection;
  try {
    connection = await pool.getConnection();

    // Check if the username already exists
    const [rows] = await connection.execute("SELECT 1 FROM User WHERE User_name = ?", [User_name]);

    if (rows.length > 0) {
      // Username already exists
      res.status(400).send("Duplicate User");
      return; // Exit early
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // Start transaction
    await connection.beginTransaction();

    // Insert new user
    const [result] = await connection.execute("INSERT INTO User (User_name, Password, Email, Active) VALUES (?, ?, ?, ?)", [
      User_name,
      hashedPassword,
      Email,
      Active,
    ]);

    if (result.affectedRows === 0) {
      // Rollback and handle insertion failure
      await connection.rollback();
      res.status(404).send("Unable to insert");
      return res.json({}); // Exit early
    }

    // Commit transaction
    await connection.commit();
    //res.status(200).send("New User added successfully");
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

  // find the group is for group name..
  console.log("Finding grp");
  try {
    console.log("Group name: ", [Group_name]);
    const [rows] = await connection.execute("SELECT Group_id from Grouplist WHERE Group_name =?", [Group_name]);
    const grpIdres = rows[0].Group_id;

    console.log("Group Id Retrieved: ", grpIdres);
    Group_Id = grpIdres;
    console.log("Group_Id: ", Group_Id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }

  //set the group id for this user...
  try {
    await connection.beginTransaction(); //Start transcation
    const [result] = await connection.execute("INSERT INTO user_group (Group_Id, User_name) VALUES (?, ?)", [Group_Id, User_name]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).send("Unable to add the User's group");
    }
    await connection.commit(); // Commit transaction
    res.status(200).send("New User added successfully");
  } catch (err) {
    await connection.rollback(); // Rollback on error
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }
};

// Update Email, Password, Active Status, and User's Groups
exports.updateUserDetails = async (req, res) => {
  console.log("In updateUserDetails");
  console.log(req.body);
  const { User_name, Email, Password, Active, Group_name } = req.body;

  let Group_Id;
  /*
  // Validate input
  if (!Email && !Password && Active === undefined && (!groupIds || groupIds.length === 0)) {
    return res.status(400).json({ message: "No fields provided to update" });
  }
  */
  // Hash Password
  const connection = await pool.getConnection();
  let hashedPassword;
  if (Password) {
    try {
      hashedPassword = await bcrypt.hash(Password, saltRounds);
    } catch (error) {
      return res.status(500).json({ error: "Error hashing password" });
    }
  }

  // Update the user's info (password, email, active)
  try {
    await connection.beginTransaction(); //Start transcation
    const [result] = await connection.execute("UPDATE User SET Password =?, Email= ?, Active=? WHERE User_name =?", [
      hashedPassword,
      Email,
      Active,
      User_name,
    ]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).send("Unable to update User's Info");
    }
    await connection.commit(); // Commit transaction
    //res.status(200).send("User's Info are updated successfully");
  } catch (err) {
    await connection.rollback(); // Rollback on error
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }
  // find the group is for group name..
  console.log("Finding grp");
  try {
    console.log("Group name: ", Group_name);
    const [rows] = await connection.execute("SELECT Group_id from Grouplist WHERE Group_name =?", [Group_name]);
    const grpIdx = rows[0].Group_id;
    console.log("Group Id Retrieved: ", grpIdx);
    Group_Id = grpIdx;
    console.log("Group_Id: ", Group_Id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }

  console.log("Grp ID outsite try and catch: ", Group_Id);
  //set the group id for this user...
  try {
    console.log("Now Updating User Grp: ", User_name);
    console.log("Grp ID: ", Group_Id);
    await connection.beginTransaction(); //Start transcation
    const [result] = await connection.execute("UPDATE user_group SET Group_Id = ? WHERE User_name =?", [Group_Id, User_name]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).send("Unable to update User's group");
    }
    await connection.commit(); // Commit transaction
    res.status(200).send("User's Info is updated successfully");
  } catch (err) {
    await connection.rollback(); // Rollback on error
    console.log(err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); //release the connection
  }
};
