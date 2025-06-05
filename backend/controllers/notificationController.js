import notificationModel from "../models/notificationModel.js";

/**
 * List Notifications with Filters
 */
export const listNotifications = async (req, res) => {
    try {
        const { materialName, notificationFor, page = 1, limit = 10,markRead = 0 } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        // console.log(selectedRole);
        const filter = {};
        filter.markRead = markRead;
        if (selectedRole == 'UQC'){
            // filter.materialName = { $in: [/Meter/i, /Transformer/i] }; // Include Meter or Transformer
            filter.notificationFor = 'UQC';
        }else if (selectedRole == 'DQC') {
           // filter.materialName = { $nin: [/Transformer/i, /Meter/i] }; // Exclude Transformer and Meter
           // filter.notificationFor = { $in: ['QC', 'AE/DQC'] }; // Match 'QC' or 'AE/DQC'
            filter.notificationFor = 'DQC';
            filter.discom = location;
        }else if (selectedRole == 'AE (STORE)' || selectedRole == 'EE (STORE)' || selectedRole == 'SE (STORE)') {
            // filter.location = { $regex: new RegExp(location, 'i') };
            // filter.notificationFor = { $in: ['AE', 'AE/DQC'] }; // Match 'QC' or 'AE/DQC'
            filter.notificationFor = 'AE';
            filter.uID = uID;
        }else if (selectedRole == 'Material Management Unit') {
            // filter.materialName = { $nin: [/Transformer/i, /Meter/i] }; // Exclude Transformer and Meter
            // filter.notificationFor = { $in: ['QC', 'AE/DQC'] }; // Match 'QC' or 'AE/DQC'
             filter.notificationFor = 'MMU';
             filter.discom = location;
         }else if (selectedRole == 'admin') {

        }else{
            filter.notificationFor = 'XYZ';
        }

        // Build the filter dynamically
       
       // console.log(filter);
        // Fetch notifications with pagination
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }, // Sort by most recent
        };

        const notifications = await notificationModel.paginate(filter, options);

        return res.status(200).json({
            status: 200,
            data: notifications,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed to fetch notifications',
            error: error.message,
        });
    }
};

export const listNotificationsTeamMember = async (req, res) => {
    try {
        const { page = 1, limit = 10,markRead = 0 } = req.body;
        const {id,role,memberName,mobile} = req.encodedUser;
        // console.log(selectedRole);
        const filter = {};
        filter.teamMemberID = mobile;
        if (role == 'teammember'){
            filter.notificationFor = 'teammember';
        }

        // Build the filter dynamically
       
       console.log(filter);
        // Fetch notifications with pagination
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }, // Sort by most recent
        };

        const notifications = await notificationModel.paginate(filter, options);

        return res.status(200).json({
            status: 200,
            data: notifications,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed to fetch notifications',
            error: error.message,
        });
    }
};


/**
 * Delete Notification by ID
 */
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.body;

        const deletedNotification = await notificationModel.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.status(404).json({
                status: 404,
                message: 'Notification not found',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed to delete notification',
            error: error.message,
        });
    }
};


export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.body;

        const updatedNotification = await notificationModel.findByIdAndUpdate(
            id,
            { markRead: 1 },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({
                status: 404,
                message: 'Notification not found',
            });
        }

        return res.status(200).json({
            status: 404,
            message: 'Notification marked as read',
            data: updatedNotification,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed to mark notification as read',
            error: error.message,
        });
    }
};