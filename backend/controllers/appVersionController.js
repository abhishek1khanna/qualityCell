import appVersionModel from "../models/appVersionModel.js";

export const getLatestAppVersion = async (req, res) => {
  try {
    const latestVersion = await appVersionModel.findOne().sort({ createdAt: -1 });

    if (!latestVersion) {
      return res.status(404).json({ 
        message: "No versions found", 
        status: 404 
      });
    }

    return res.status(200).json({
      message: "Latest version retrieved successfully",
      status: 200,
      version: latestVersion.Version,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving latest version",
      status: 500,
      error: error.message,
    });
  }
};



export const addAppVersion = async (req, res) => {
    try {
      const { Version } = req.body;
  
      // Check if the version is provided
      if (!Version) {
        return res.status(400).json({ 
          message: "Version is required", 
          status: 400 
        });
      }

    

      // Create and save the new version
      const newVersion = new appVersionModel({ Version });
      await newVersion.save();
  
      return res.status(201).json({
        message: "Version added successfully",
        status: 201,
        version: newVersion,
      }); 
    } catch (error) {
      return res.status(500).json({
        message: "Error adding version",
        status: 500,
        error: error.message,
      });
    }
  };
