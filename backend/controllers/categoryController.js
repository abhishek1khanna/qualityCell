import categoryModel from '../models/categoryModel.js';

export const manageCategory = async (req, res) => {
    try {
        const { action, catId, categoryName, categoryDescription,page = 1, limit = 10 } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        switch (action) {
            // Add a new test
            case 'add':
                const existingTest = await categoryModel.findOne({ categoryName });
                if (existingTest) {
                    return res.status(400).json({ status: 400, message: "Category name already exists" });
                }
                const newTest = new categoryModel({ categoryName, categoryDescription,sapID,location,uID,loginPersonName });
                await newTest.save();
                return res.status(201).json({ status: 201, message: "Category added successfully", test: newTest });

            // Edit an existing test
            case 'edit':
                if (!catId) return res.status(400).json({ status: 400, message: "Category ID is required" });

                const updatedTest = await categoryModel.findByIdAndUpdate(
                    catId,
                    { categoryName, categoryDescription },
                    { new: true }
                );

                if (!updatedTest) return res.status(404).json({ status: 404, message: "Category not found" });
                return res.status(200).json({ status: 200, message: "Category updated successfully", test: updatedTest });

            // Delete a test
            case 'delete':
                if (!catId) return res.status(400).json({ status: 400, message: "Category ID is required" });

                const deletedTest = await categoryModel.findByIdAndDelete(catId);
                if (!deletedTest) return res.status(404).json({ status: 404, message: "Category not found" });
                return res.status(200).json({ status: 200, message: "Category deleted successfully" });

            // List all tests
            case 'list':
                const options = {
                    page: parseInt(page, 10),   // Convert page to integer
                    limit: parseInt(limit, 10), // Convert limit to integer
                    sort: { createdAt: -1 }     // Sort by newest tests
                };

                const result = await categoryModel.paginate({}, options);

                if (result.docs.length === 0) {
                    return res.status(404).json({
                        status: 404,
                        message: "No Category found"
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: "List of Category",
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
