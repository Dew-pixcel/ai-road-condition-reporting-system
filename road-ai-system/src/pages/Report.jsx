import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Upload } from "lucide-react";

//  MAP IMPORTS
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

//  FIX MARKER ICON
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
});

export default function Report() {
  const [image, setImage] = useState(null);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  //  NEW STATES (ADDED ONLY)
  const [preview, setPreview] = useState(null);
  const [aiResult, setAiResult] = useState("");
  const [coords, setCoords] = useState(null);

  //  NEW IMAGE HANDLER (ADDED)
  const handleImageChange = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

const handleSubmit = async () => {
  console.log("EMAIL:", localStorage.getItem("userEmail")); 

  if (!image || !city || !phone || !description) {
    alert("Please fill all fields!");
    return;
  }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("city", city);
    formData.append("phone", phone);
    formData.append("description", description);
    formData.append("email", localStorage.getItem("userEmail"));

    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    //  NEW VALIDATIONS (ADDED ONLY)
    if (data.error === "NO_GPS") {
      alert(" Image has no GPS metadata!");
      return;
    }

    if (data.error === "DUPLICATE_LOCATION") {
      alert(" This location already reported!");
      return;
    }

    if (data.error === "NO_ROAD_DAMAGE") {
  alert(" Please upload only road damage images. No pothole or crack detected!");
  return;
}

//  ONLY SUCCESS CASE
if (data.success) {
  navigate("/my-reports");
}

    //  SET COORDS
    if (data.latitude && data.longitude) {
      setCoords({
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
      });
    }

    //  AI RESULT
    if (data.detections && data.detections.length > 0) {
      setAiResult(data.detections[0].label);
    } else {
      setAiResult("No damage detected");
    }

    // redirect
    navigate("/my-reports");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
      
      {/*  CLOSE BUTTON (ADDED) */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 right-5 bg-red-500 text-white p-2 rounded-full"
      >
        <X size={20} />
      </button>

      <h1 className="text-3xl font-bold text-center text-blue-800">
        Report Road Damage
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Submit details and location of road damage
      </p>

      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        
        {/* LEFT */}
        <div className="bg-white p-5 rounded-xl shadow">
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
            <p className="text-lg font-semibold text-gray-700">
              Upload Image
            </p>

            {/*  ICON UPLOAD (ADDED, old input NOT removed) */}
           <label
  htmlFor="fileUpload"
  className="cursor-pointer flex flex-col items-center mt-4"
>
  <Upload size={40} className="text-blue-500" />
  <span className="text-sm text-gray-500">Click to upload</span>

              <input
  type="file"
  id="fileUpload"
  onChange={(e) => handleImageChange(e.target.files[0])}
  style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
/>
            </label>

            {/*  ORIGINAL INPUT (KEPT) */}
            <input
              type="file"
              className="mt-4"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          {/*  PREVIEW (ADDED) */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-4 rounded-lg"
            />
          )}

          {image && !preview && (
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="mt-4 rounded-lg"
            />
          )}

          {/*  MAP UPGRADE (ADDED) */}
          <div className="mt-6">
            <p className="font-semibold mb-2">Location</p>

            <div className="h-60 rounded-lg overflow-hidden">
              <MapContainer
                center={
                  coords ? [coords.lat, coords.lng] : [7.8731, 80.7718]
                }
                zoom={coords ? 15 : 7}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {coords && (
                  <Marker position={[coords.lat, coords.lng]} icon={icon}>
                    <Popup>
                      <strong>{aiResult || "Damage"}</strong>
                      <br />
                      {city}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-5 rounded-xl shadow">
          
          {/*  AI RESULT (UPDATED DISPLAY ONLY, ORIGINAL KEPT) */}
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg mb-4">
            <p className="font-bold text-yellow-700">
              ⚠ Detection Result
            </p>
            <p className="text-sm text-gray-600">
              {aiResult || "AI result will appear here"}
            </p>
          </div>

          {/* CITY */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">City</label>
            <input
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* PHONE */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Contact Number
            </label>
            <input
              type="text"
              placeholder="+94 77 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Submit Report
          </button>
        </div>

      </div>
    </div>
  );
}