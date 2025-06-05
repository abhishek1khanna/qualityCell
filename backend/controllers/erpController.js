
import axios from "axios";
import https from "https";
import { constants } from "crypto";

const agent = new https.Agent({
    secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT, // Enable legacy SSL options
  });


export const sendData = async (req, res) => {
    const { DIno } = req.body;
    if (!DIno) {
        return res.status(400).json({ error: "DIno is required in the body" });
    }

// "https://po-dev.erp.uppclonline.com/RESTAdapter/Quality_cell/DI_Details",
    try {
        const response = await axios.post(
            "https://po.erp.uppclonline.com/RESTAdapter/Quality_cell/DI_Details",
            { DIno: DIno }, // Request body
            {
              auth: {
                username: "UPPCL_QUALITY_CELL",
                password: "Uppcl@123",
              },
              headers: {
                "Content-Type": "application/json",
              },
              httpsAgent: agent,
            }
          );
    
        // Send the response from the API back to the client

        return res.status(response.status).json({
            status: response.status,
            data: response.data,
        });

    } catch (error) {
        // console.error("Error details:", error);
        if (error.response) {
            return res.status(error.response.status).json({ 
                status: error.response.status, 
                error: error.response.data 
            });
        } else {
            return res.status(500).json({ 
                status: 500, 
                error: "Internal Server Error" 
            });
        }
    }


}


