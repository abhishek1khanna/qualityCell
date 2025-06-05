import grnModel from '../models/grnModel.js';
import sampleModel from '../models/sampleModel.js';
import sampleTeamModel from '../models/samplingTeamModel.js';

import sealModel from '../models/sealModel.js';


export const generateMaterialReport = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        const filter = {};
        if (selectedRole == 'admin') {
        }else if (selectedRole == 'EE (STORE)' || selectedRole == 'AE (STORE)' || selectedRole == 'SE (STORE)') {
            filter.uID = uID;
        }else if (selectedRole === "DQC") {
            filter.discom = location;
            filter.materialName = { $nin: [/Transformer/i, /Meter/i] }; // Exclude Transformer and Meter
        } else if (selectedRole === "UQC") {
            filter.materialName = { $in: [/Meter/i, /Transformer/i] }; // Include Meter or Transformer
        }else if (selectedRole === "Material Management Unit") {
            filter.discom = location;
        }
        // console.log(selectedRole,location);
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            customLabels: {
                totalDocs: 'totalItems',
                docs: 'grns',
                limit: 'pageSize',
                page: 'currentPage',
                totalPages: 'totalPages',
            },
        };

        const grnResult  = await grnModel.paginate(filter,options);
        const { grns, ...paginationInfo } = grnResult;
        const report = [];

        const currentDate = new Date();

        for (const grn of grns) {
            const { grnNo,di, receiveDate } = grn;
            const receivedDateObj = new Date(receiveDate);

            // Check if sample is created
            const sample = await sampleModel.findOne({ 'items.grnNo': grnNo });
            const sampleNotCreated = !sample
                ? Math.ceil((currentDate - receivedDateObj) / (1000 * 60 * 60 * 24)) // Days pending
                : 0;

                if (sample){
                var sampleCreateDate =   sample.createdAt;
                sampleCreateDate = new Date(sampleCreateDate);
                }
            // Check if sample team is created
           // console.log('grn.di', grn.di);
            const sampleTeam = sample
                ? await sampleTeamModel.findOne({ di: grn.di })
                : null;
            //    console.log('sampleTeam', sampleTeam);
            const sampleTeamNotCreated =
                sample && !sampleTeam
                    ? Math.ceil((currentDate - sampleCreateDate) / (1000 * 60 * 60 * 24)) // Days pending
                    : 0;

                if (sampleTeam){
                    var teamCreateDate =   sampleTeam.createdAt;
                    teamCreateDate = new Date(teamCreateDate);
                }    

            // Check if sealing is done
            const sealing = sampleTeam
                ? await sealModel.findOne({ 'samplesSelected.grnNo': grnNo })
                : null;
            const sealingNotDone =
                sampleTeam && !sealing
                    ? Math.ceil((currentDate - teamCreateDate) / (1000 * 60 * 60 * 24)) // Days pending
                    : 0;

            // Check if sealing is done but not dispatched
            if (sealing){
                var sealDate =   sealing.sealingDate;
                sealDate = new Date(sealDate);
            }   
            
            const dispatched =
            sealing &&
            Array.isArray(sealing.itemsSent) &&
            sealing.itemsSent.some((item) => item.grnNo === grnNo);

            const sealingDoneButNotDispatched =
                sealing && !dispatched
                    ? Math.ceil((currentDate - sealDate) / (1000 * 60 * 60 * 24)) // Days pending
                    : 0;

            // Add the structured data to the report
            report.push({
                di,
                grnNo,
                receiveDate,
                sampleNotCreated: sampleNotCreated > 0 ? `${sampleNotCreated}` : '0',
                sampleTeamNotCreated:
                    sampleTeamNotCreated > 0 ? `${sampleTeamNotCreated}` : '0',
                sealingNotDone:
                    sealingNotDone > 0 ? `${sealingNotDone}` : '0',
                sealingDoneButNotDispatched:
                    sealingDoneButNotDispatched > 0
                        ? `${sealingDoneButNotDispatched}`
                        : '0',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Material report generated successfully.',
            pagination: paginationInfo,
            data: report,
        });


    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error generating material report.",
            error: error.message,
        });
    }
};


export const generateMaterialReport1 = async (req, res) => {
    try {
        const grns = await grnModel.find();
        const report = [];

        for (const grn of grns) {
            const { grnNo, createdAt: receivedDate } = grn;

            // Check if sample is created
            const sample = await sampleModel.findOne({ "items.grnNo": grnNo });
            const sampleNotCreated = !sample;

            // Check if sample team is created
            const sampleTeam = sample
                ? await sampleTeamModel.findOne({ di: grn.di })
                : null;
            const sampleTeamNotCreated = sample && !sampleTeam;

            // Check if sealing is done
            const sealing = sampleTeam
                ? await sealModel.findOne({ "samplesSelected.grnNo": grnNo })
                : null;
            const sealingNotDone = sampleTeam && !sealing;

            // Check if sealing is done but not dispatched
            const dispatched = sealing
                ? sealing.itemsSent.some((item) =>
                      item.itemList.some((list) => list.grnNo === grnNo)
                  )
                : false;
            const sealingDoneButNotDispatched = sealing && !dispatched;

            // Add the structured data to the report
            report.push({
                grnNo,
                receivedDate,
                sampleNotCreated,
                sampleTeamNotCreated,
                sealingNotDone,
                sealingDoneButNotDispatched,
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Material report generated successfully.",
            data: report,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error generating material report.",
            error: error.message,
        });
    }
};