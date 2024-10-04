const pool = require("../config/db");

// Working*
exports.getAllPlans = async (req, res) => {
  let planList = [];
  try {
    //console.log("Get All Plan: ");
    const statement = "SELECT Plan_MVP_name, Plan_app_Acronym FROM Plan";
    let [allPlans] = await pool.query(statement);

    // populate plans into planlist
    allPlans.forEach((plan) => {
      let box ={
        Plan_MVP_name: plan.Plan_MVP_name,
        Plan_app_Acronym: plan.Plan_app_Acronym
      };
      planList.push(box);
    });

    //console.log("All Plans: ", planList);
    res.status(200).send(planList);
  } catch (error) {
    res.status(500).send("Errror: ", error);
  }
};

exports.getrelatedPlans = async (req, res) => {
  let planList = [];
  const { Plan_app_Acronym } = req.body;
  try {
    //console.log("Get All Plan: ");
    const statement = "SELECT Plan_MVP_name, Plan_app_Acronym FROM Plan WHERE Plan_app_Acronym=?";
    let [allPlans] = await pool.query(statement, [Plan_app_Acronym]);

    // populate plans into planlist
    allPlans.forEach((plan) => {
      let box = {
        Plan_MVP_name: plan.Plan_MVP_name,
        Plan_app_Acronym: plan.Plan_app_Acronym,
      };
      planList.push(box);
    });

    //console.log("All Plans: ", planList);
    res.status(200).send(planList);
  } catch (error) {
    res.status(500).send("Errror: ", error);
  }
};

// Working*
exports.getPlan = async (req, res) => {
  console.log("*********************");
  console.log("Get Plan: ", req.body);
  const { Plan_MVP_name, Plan_app_Acronym } = req.body;
  //console.log("MVP name: ", Plan_MVP_name);
  //console.log("Plan_app_Acronym: ", Plan_app_Acronym);
  try {
    let statement = "SELECT * FROM PLAN WHERE Plan_MVP_Name=? AND Plan_app_Acronym=?";
    let [getPlan] = await pool.query(statement, [Plan_MVP_name, Plan_app_Acronym]);
    console.log("Sending plan: ",getPlan);
    res.status(200).send(getPlan);
  } catch (error) {
      console.error("Error: ", error);
    res.status(500).send("Fail to get the plan");
  }
};

// Working*
exports.editPlan = async (req, res) => {
  console.log("Edit Plan: ", req.body);
  const { Plan_MVP_name, Plan_app_Acronym,Plan_startDate, Plan_endDate, Plan_colour } = req.body;
  try {
    let statement = "UPDATE Plan SET Plan_startDate=?, Plan_endDate=?, Plan_colour=? WHERE Plan_MVP_name=? and Plan_app_Acronym=?";
    //let statement = "UPDATE Plan SET Plan_startDate=?, Plan_endDate=?, Plan_colour=? WHERE Plan_MVP_Name=? and Plan_app_Acronym=?";
    let [updatePlan] = await pool.execute(statement, [Plan_startDate, Plan_endDate, Plan_colour, Plan_MVP_name, Plan_app_Acronym]);
    res.status(200).send("Plan has been updated successfully!");
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send("Fail to update plan");
  }
};

// Working*
exports.createPlan = async (req, res) => {
  console.log("In Create Plan function: ", req.body);
  const { Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_colour } = req.body;

  // check for null for Acronym
  if (!Plan_app_Acronym)
    return res.status(400).send("Missing Plan_app_Acronym");

  if (!Plan_MVP_name || !Plan_startDate || !Plan_endDate || !Plan_colour)
      // check for null
      return res.status(400).send("Bad request: empty values");

  // Check for duplicate Plan_MVP_name and Plan_app_Acronym

  // Now do query
  try {
    let statement = `INSERT INTO Plan (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_colour) VALUES (?,?,?,?,?)`;
    let [newPlan] = await pool.execute(statement, [Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_colour]);
    res.status(200).send("New Plan has been created successfully");
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send("Fail to create plan");
  }
};
