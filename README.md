---

# FOTA API Documentation

## This API is used for managing devices and firmware in an IoT environment. It allows clients to add devices, fetch device lists, initiate firmware updates, check for available updates, and retrieve firmware records.

## Base URL

```plaintext
http://localhost:7070
```

## Endpoints

### 1. Add Devices from an Excel or CSV File

- **Endpoint**: `/api/add-device`
- **Method**: `POST`
- **Description**: Upload an Excel or CSV file to add multiple devices. Each row should include fields for `DeviceId`, `Vendor`, `District`, `Block`, and `Panchayat`.
- **Request Headers**:
  - `Content-Type: multipart/form-data`
- **Request Body**:
  - `file`: An Excel or CSV file containing device data.

- **Success Response**:
  - **Code**: 201
  - **Body**:
    ```json
    {
      "addedDevices": ["Device1", "Device2"],
      "errors": [],
      "message": "All devices added successfully"
    }
    ```
- **Partial Success Response**:
  - **Code**: 207
  - **Body**:
    ```json
    {
      "addedDevices": ["Device1"],
      "errors": ["Device2 already exists"],
      "message": "Partial success"
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Body**:
    ```json
    {
      "error": "File is required"
    }
    ```



---

### 2. Retrieve All Devices

- **Endpoint**: `/api/devices`
- **Method**: `GET`
- **Description**: Fetch a list of all added devices from the database.

- **Success Response**:
  - **Code**: 200
  - **Body**:
    ```json
    {
      "allDevices": [
        {
          "_id": "64a1e5b0c345e6d4e9d01234",
          "deviceId": "Device1",
          "vendor": "VendorA",
          "district": "District1",
          "block": "Block1",
          "panchayat": "Panchayat1"
        }
        // More devices...
      ]
    }
    ```
- **Error Response**:
  - **Code**: 500
  - **Body**:
    ```json
    {
      "error": "Failed to retrieve devices"
    }
    ```

---

### 3. Initiate Update for Selected Devices

- **Endpoint**: `/api/initiate-update`
- **Method**: `POST`
- **Description**: Start a firmware update for specified devices by marking them with a `pendingUpdate` status.
- **Request Headers**:
  - `Content-Type: application/json`
- **Request Body**:

  - `deviceIds`: An array of device IDs to update.
  - `firmwareName`: The name of the firmware to be updated.

- **Success Response**:
  - **Code**: 200
  - **Body**:
    ```json
    {
      "message": "Update initiated for selected devices"
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Body**:
    ```json
    {
      "error": "Device IDs and firmware name are required"
    }
    ```
  - **Code**: 404
  - **Body**:
    ```json
    {
      "error": "Firmware not found"
    }
    ```

#### Example Request (cURL)

---

### 4. Check for Updates for a Device

- **Endpoint**: `/api/check-for-update/:deviceId`
- **Method**: `GET`
- **Description**: Check if a specific device has a pending update. If an update is available, the firmware file will be sent.
- **Path Parameters**:

  - `deviceId`: The unique ID of the device.

- **Success Response (No Update Available)**:
  - **Code**: 200
  - **Body**:
    ```json
    {
      "updateAvailable": false
    }
    ```
- **Success Response (Update Available)**:
  - **Code**: 200
  - **Headers**:
    - `Content-Disposition: attachment; filename=FirmwareV1`
    - `Content-Type: application/octet-stream`
  - **Body**: (Binary data of the firmware file)
- **Error Response**:
  - **Code**: 404
  - **Body**:
    ```json
    {
      "error": "Device not found"
    }
    ```

---

### 5. Retrieve All Firmware Records

- **Endpoint**: `/api/firmwares`
- **Method**: `GET`
- **Description**: Fetch a list of all available firmware records.

- **Success Response**:
  - **Code**: 200
  - **Body**:
    ```json
    {
      "allFirmwares": [
        { "_id": "64a1e5b0c345e6d4e9d05678", "name": "FirmwareV1" },
        { "_id": "64a1e5b0c345e6d4e9d05679", "name": "FirmwareV2" }
      ]
    }
    ```
- **Error Response**:
  - **Code**: 500
  - **Body**:
    ```json
    {
      "error": "Failed to retrieve firmware list"
    }
    ```

---

## Error Codes

- **400** - Bad Request: Request payload is invalid or missing required fields.
- **404** - Not Found: Resource could not be found.
- **500** - Internal Server Error: Unexpected server error occurred.
- **207** - Multi-Status: Partial success when some devices are added successfully, while others fail.

---

## Additional Notes

- **File Uploads**: Only Excel or CSV files are supported for the `/api/add-device` endpoint.
- **Multipart Form Data**: The `file` field should be used to upload files.
- **Headers for Firmware Download**: When downloading firmware, the `Content-Disposition` and `Content-Type` headers indicate that the response is a binary file.

This documentation provides a comprehensive guide to using the FOTA API. Let me know if you need further customization or additional details for any specific endpoint!
