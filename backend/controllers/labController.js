import labModel from '../models/labModel.js';

export const manageLabs = async (req, res) => {
    try {
        const { action, labId, labName, labLocation,page = 1, limit = 10 } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        switch (action) {
            // Add a new test
            case 'add':
                const existingTest = await labModel.findOne({ labName });
                if (existingTest) {
                    return res.status(400).json({ status: 400, message: "Lab name already exists" });
                }
                const newTest = new labModel({ labName, labLocation,sapID,location,uID,loginPersonName });
                await newTest.save();
                return res.status(201).json({ status: 201, message: "Lab added successfully", test: newTest });

            // Edit an existing test
            case 'edit':
                if (!labId) return res.status(400).json({ status: 400, message: "Lab ID is required" });

                const updatedTest = await labModel.findByIdAndUpdate(
                    labId,
                    { labName, labLocation },
                    { new: true }
                );

                if (!updatedTest) return res.status(404).json({ status: 404, message: "Lab not found" });
                return res.status(200).json({ status: 200, message: "Lab updated successfully", test: updatedTest });

            // Delete a test
            case 'delete':
                if (!labId) return res.status(400).json({ status: 400, message: "lab ID is required" });

                const deletedTest = await labModel.findByIdAndDelete(labId);
                if (!deletedTest) return res.status(404).json({ status: 404, message: "lab not found" });
                return res.status(200).json({ status: 200, message: "lab deleted successfully" });

            // List all tests
            case 'list':
                const options = {
                    page: parseInt(page, 10),   // Convert page to integer
                    limit: parseInt(limit, 10), // Convert limit to integer
                    sort: { createdAt: -1 }     // Sort by newest tests
                };

                const result = await labModel.paginate({}, options);

                if (result.docs.length === 0) {
                    return res.status(404).json({
                        status: 404,
                        message: "No lab found"
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: "List of lab",
                    data: result.docs,
                    totalDocs: result.totalDocs,
                    totalPages: result.totalPages,
                    currentPage: result.page,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage,
                    nextPage: result.nextPage,
                    prevPage: result.prevPage,
                    limit: result.limit
                });
                
            default:
                return res.status(400).json({ status: 400, message: "Invalid action" });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};
