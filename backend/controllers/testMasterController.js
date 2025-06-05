import testsMasterModel from '../models/testsMasterModel.js';

export const manageTests = async (req, res) => {
    try {
        const { action, testId, categoryID, testName, testDescription,page = 1, limit = 10 } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        switch (action) {
            // Add a new test
            case 'add':
                const existingTest = await testsMasterModel.findOne({ testName });
                if (existingTest) {
                    return res.status(400).json({ status: 400, message: "Test name already exists" });
                }
                const newTest = new testsMasterModel({ categoryID, testName, testDescription,sapID,location,uID,loginPersonName });
                await newTest.save();
                return res.status(201).json({ status: 201, message: "Test added successfully", test: newTest });

            // Edit an existing test
            case 'edit':
                if (!testId) return res.status(400).json({ status: 400, message: "Test ID is required" });

                const updatedTest = await testsMasterModel.findByIdAndUpdate(
                    testId,
                    { categoryID, testName, testDescription },
                    { new: true }
                );

                if (!updatedTest) return res.status(404).json({ status: 404, message: "Test not found" });
                return res.status(200).json({ status: 200, message: "Test updated successfully", test: updatedTest });

            // Delete a test
            case 'delete':
                if (!testId) return res.status(400).json({ status: 400, message: "Test ID is required" });

                const deletedTest = await testsMasterModel.findByIdAndDelete(testId);
                if (!deletedTest) return res.status(404).json({ status: 404, message: "Test not found" });
                return res.status(200).json({ status: 200, message: "Test deleted successfully" });

            // List all tests
            case 'list':
                const options = {
                    page: parseInt(page, 10),   // Convert page to integer
                    limit: parseInt(limit, 10), // Convert limit to integer
                    sort: { createdAt: -1 },     // Sort by newest tests
                    populate: {
                        path: 'categoryID',          // Populate the 'tests' field
                    }
        
                };

                var result = '';
                if (categoryID){
                    result = await testsMasterModel.paginate({categoryID:categoryID}, options);
                }else{
                    result = await testsMasterModel.paginate({}, options);
                }


               

                if (result.docs.length === 0) {
                    return res.status(404).json({
                        status: 404,
                        message: "No tests found"
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: "List of tests",
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
