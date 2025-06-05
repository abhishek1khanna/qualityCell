export const ApiResponse = {
    "status": 200,
    "message": "Authentication Successfull",
    "name": "Abhishek Khanna",
    "sapID": 1111188,
	"token":"",
    "authorizationAreas": [
        {
            "area": {
                "office": {
                    "uID": "1111111",
                    "name": "admin",
                    "type": "UPPCL",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "admin",
                    "uID": "1111111",
                    "role": "admin",
                }
            }
        },
		{
            "area": {
                "office": {
                    "uID": "22222",
                    "name": "PUVNL",
                    "type": "UPPCL_DISCOM",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "Material Management Unit",
                    "uID": "22222",
                    "role": "Material Management Unit",
                }
            }
        },
		{
            "area": {
                "office": {
                    "uID": "3333",
                    "name": "DVNL",
                    "type": "UPPCL_DISCOM",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "Material Management Unit",
                    "uID": "3333",
                    "role": "Material Management Unit",
                }
            }
        },
		{
            "area": {
                "office": {
                    "uID": "4444",
                    "name": "Varanasi",
                    "type": "UPPCL_DISCOM",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "AE (STORE)",
                    "uID": "4444",
                    "role": "AE (STORE)",
                }
            }
        },
		{
            "area": {
                "office": {
                    "uID": "5555",
                    "name": "Azamgarh",
                    "type": "UPPCL_DISCOM",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "AE (STORE)",
                    "uID": "5555",
                    "role": "AE (STORE)",
                }
            }
        },
		{
            "area": {
                "office": {
                    "uID": "6666",
                    "name": "PUVNL",
                    "type": "UPPCL_DISCOM",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "DQC",
                    "uID": "6666",
                    "role": "DQC",
                }
            }
        },
		{
            "area": {
                "office": {
                    "uID": "7777",
                    "name": "UQC",
                    "type": "UPPCL_DISCOM",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "UQC",
                    "uID": "7777",
                    "role": "UQC",
                }
            }
        },
		{
            "area": {
                "office": {
                    "uID": "8888",
                    "name": "Varanasi",
                    "type": "UPPCL_DISCOM",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "EE (STORE)",
                    "uID": "8888",
                    "role": "EE (STORE)",
                }
            }
        },
		{
            "area": {
                "office": {
                    "uID": "8888",
                    "name": "Azamgarh",
                    "type": "UPPCL_DISCOM",
                    "status": "ACTIVE"
                },
                "role": {
                    "displayName": "EE (STORE)",
                    "uID": "8888",
                    "role": "EE (STORE)",
                }
            }
        },
		]
}
export const Grn = {
    "Status": "Success",
    "Status Code": "200",
    "Data": [
        {
            di:"1000222527",
            grnNo: "GRN001",
            year:'2025',
            quantity: 5,
            materialName: "Test Material",
            Line_NO: "00010",
            Contract_No: "CN001",
            totalQuantityLineNo: "10",
            materialCode: "M001",
            receiveDate: "2025-01-15",
            receiveMaterailList: ["single phase meter1", "single phase meter2", "single phase meter3", "single phase meter4", "single phase meter5"],
            Mat_Group: "MG001",
            plant: "PL001",
            plantName: "Main Plant",
            storeLocation: "Varanasi IIID"
        }
    ,
        /* {
            di:"1000222527",  
            grnNo: "GRN002",
            year:'2025',
            quantity: 20,
            materialName: "single phase meter",
            Line_NO: "00020",
            Contract_No: "CN002",
            totalQuantityLineNo: "50",
            materialCode: "M002",
            receiveDate: "2025-01-16",
            receiveMaterailList: ["Copper Wire 1"],
            Mat_Group: "MG002",
            plant: "PL002",
            plantName: "Secondary Plant",
            storeLocation: "Kanpur IID"
        } */
        ]
  }