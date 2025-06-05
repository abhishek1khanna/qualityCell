import rolesModel from "../models/rolesModel.js";

// Create a new role
export const createRole = async (req, res) => {
    try {
        const { roleName, description, permissions } = req.body;

        // Check for duplicate role
        const existingRole = await rolesModel.findOne({ roleName });
        if (existingRole) {
            return res.status(400).json({ status: 400, message: "Role already exists" });
        }

        // Create and save new role
        const newRole = new rolesModel({ roleName, description, permissions });
        await newRole.save();

        return res.status(201).json({ status: 201, message: "Role created successfully", data: newRole });
    } catch (error) {
        return res.status(500).json({ status: 500, error: "Error creating role", details: error.message });
    }
};



// Get all roles (with pagination)
export const getAllRoles = async (req, res) => {
    try {
        const { page = 1, limit = 10, roleName } = req.body;

        const filter = {};
        if (roleName) filter.roleName = { $regex: roleName, $options: "i" };

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
        };

        const result = await rolesModel.paginate(filter, options);

        return res.status(200).json({
            status: 200,
            message: "List of roles",
            data: result.docs,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, error: "Error fetching roles", details: error.message });
    }
};

// Update a role by ID
export const updateRole = async (req, res) => {
    try {
        const { id, roleName, description, permissions } = req.body;

        const updatedRole = await rolesModel.findByIdAndUpdate(
            id,
            { roleName, description, permissions },
            { new: true }
        );

        if (!updatedRole) {
            return res.status(404).json({ status: 404, message: "Role not found" });
        }

        return res.status(200).json({ status: 200, message: "Role updated successfully", data: updatedRole });
    } catch (error) {
        return res.status(500).json({ status: 500, error: "Error updating role", details: error.message });
    }
};

// Delete a role by ID
export const deleteRole = async (req, res) => {
    try {
        const { id } = req.body;

        const deletedRole = await rolesModel.findByIdAndDelete(id);

        if (!deletedRole) {
            return res.status(404).json({ status: 404, message: "Role not found" });
        }

        return res.status(200).json({ status: 200, message: "Role deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: 500, error: "Error deleting role", details: error.message });
    }
};
