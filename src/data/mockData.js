// src/data/mockData.js

const defaultData = {
  users: [
    { id: "1", role: "Admin", email: "admin@entnt.in", password: "admin123" },
    { id: "2", role: "Patient", email: "john@entnt.in", password: "patient123", patientId: "p1" }
  ],
  patients: [
    {
      id: "p1",
      name: "John Doe",
      dob: "1990-05-10",
      contact: "1234567890",
      healthInfo: "No allergies"
    }
  ],
  incidents: [
    {
      id: "i1",
      patientId: "p1",
      title: "Toothache",
      description: "Upper molar pain",
      comments: "Sensitive to cold",
      appointmentDate: "2025-07-01T10:00:00",
      cost: 80,
      status: "Completed",
      files: [
        { name: "invoice.pdf", url: "base64string-or-blob-url" },
        { name: "xray.png", url: "base64string-or-blob-url" }
      ]
    }
  ]
};

export const initializeMockData = () => {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(defaultData.users));
  }
  if (!localStorage.getItem("patients")) {
    localStorage.setItem("patients", JSON.stringify(defaultData.patients));
  }
  if (!localStorage.getItem("incidents")) {
    localStorage.setItem("incidents", JSON.stringify(defaultData.incidents));
  }
};
