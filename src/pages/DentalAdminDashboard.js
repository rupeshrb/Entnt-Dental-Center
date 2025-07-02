import React, { useState, useEffect, useContext } from 'react';
import { Calendar, Users, FileText, DollarSign, Clock, Plus, Edit2, Trash2, Upload, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";



const DentalAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());


  const [patientForm, setPatientForm] = useState({
    name: '', dob: '', contact: '', email: '', address: '', healthInfo: ''
  });
  const [incidentForm, setIncidentForm] = useState({
    patientId: '', title: '', description: '', comments: '', appointmentDate: '', 
    cost: '', status: 'Scheduled', treatment: '', nextDate: '', files: []
  });
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const patientsData = JSON.parse(localStorage.getItem("patients") || "[]");
    const incidentsData = JSON.parse(localStorage.getItem("incidents") || "[]");
    setPatients(patientsData);
    setIncidents(incidentsData);
  };

  const savePatients = (data) => {
    localStorage.setItem("patients", JSON.stringify(data));
    setPatients(data);
  };

  const saveIncidents = (data) => {
    localStorage.setItem("incidents", JSON.stringify(data));
    setIncidents(data);
  };

  const generateId = () => 'id_' + Math.random().toString(36).substr(2, 9);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (type === 'patient') {
      setPatientForm(item || { name: '', dob: '', contact: '', email: '', address: '', healthInfo: '' });
    } else if (type === 'incident') {
      setIncidentForm(item || { 
        patientId: '', title: '', description: '', comments: '', appointmentDate: '', 
        cost: '', status: 'Scheduled', treatment: '', nextDate: '', files: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setPatientForm({ name: '', dob: '', contact: '', email: '', address: '', healthInfo: '' });
    setIncidentForm({ 
      patientId: '', title: '', description: '', comments: '', appointmentDate: '', 
      cost: '', status: 'Scheduled', treatment: '', nextDate: '', files: []
    });
  };

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    const updatedPatients = [...patients];
    
    if (editingItem) {
      const index = updatedPatients.findIndex(p => p.id === editingItem.id);
      updatedPatients[index] = { ...patientForm, id: editingItem.id };
    } else {
      updatedPatients.push({ ...patientForm, id: generateId() });
    }
    
    savePatients(updatedPatients);
    closeModal();
  };

  const handleIncidentSubmit = (e) => {
    e.preventDefault();
    const updatedIncidents = [...incidents];
    
    if (editingItem) {
      const index = updatedIncidents.findIndex(i => i.id === editingItem.id);
      updatedIncidents[index] = { ...incidentForm, id: editingItem.id };
    } else {
      updatedIncidents.push({ ...incidentForm, id: generateId() });
    }
    
    saveIncidents(updatedIncidents);
    closeModal();
  };

  const deletePatient = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      const updatedPatients = patients.filter(p => p.id !== id);
      const updatedIncidents = incidents.filter(i => i.patientId !== id);
      savePatients(updatedPatients);
      saveIncidents(updatedIncidents);
    }
  };

  const deleteIncident = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      const updatedIncidents = incidents.filter(i => i.id !== id);
      saveIncidents(updatedIncidents);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile = {
          name: file.name,
          url: event.target.result,
          type: file.type
        };
        setIncidentForm(prev => ({
          ...prev,
          files: [...prev.files, newFile]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setIncidentForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

 
  const nextAppointments = incidents
    .filter(i => new Date(i.appointmentDate) >= new Date() && i.status !== 'Completed')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 10);

  const completedTreatments = incidents.filter(i => i.status === 'Completed').length;
  const pendingTreatments = incidents.filter(i => i.status !== 'Completed').length;
  const totalRevenue = incidents.filter(i => i.status === 'Completed').reduce((sum, i) => sum + (i.cost || 0), 0);

  const patientAppointmentCounts = patients.map(patient => ({
    ...patient,
    appointmentCount: incidents.filter(i => i.patientId === patient.id).length
  })).sort((a, b) => b.appointmentCount - a.appointmentCount);

  // Calendar functions
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getAppointmentsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return incidents.filter(i => i.appointmentDate.startsWith(dateStr));
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Patients</p>
              <p className="text-3xl font-bold">{patients.length}</p>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold">{completedTreatments}</p>
            </div>
            <FileText className="h-12 w-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-3xl font-bold">{pendingTreatments}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Revenue</p>
              <p className="text-3xl font-bold">${totalRevenue}</p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Next 10 Appointments</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {nextAppointments.map(appointment => {
              const patient = patients.find(p => p.id === appointment.patientId);
              return (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{patient?.name}</p>
                    <p className="text-sm text-gray-600">{appointment.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                      {new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Top Patients</h2>
          <div className="space-y-3">
            {patientAppointmentCounts.slice(0, 10).map(patient => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-gray-600">{patient.contact}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {patient.appointmentCount} visits
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Patient Management</h1>
        <button 
          onClick={() => openModal('patient')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Patient</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.dob}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.contact}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.email}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{patient.healthInfo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openModal('patient', patient)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deletePatient(patient.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Appointment Management</h1>
        <button 
          onClick={() => openModal('incident')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Appointment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incidents.map(incident => {
                const patient = patients.find(p => p.id === incident.patientId);
                return (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{patient?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{incident.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(incident.appointmentDate).toLocaleDateString()}<br/>
                      <span className="text-sm">{new Date(incident.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        incident.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        incident.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {incident.cost ? `$${incident.cost}` : 'TBD'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openModal('incident', incident)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteIncident(incident.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const previousMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    
    const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Calendar View</h1>
          <div className="flex items-center space-x-4">
            <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="p-3 h-24"></div>
            ))}
            
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayAppointments = getAppointmentsForDay(day);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              
              return (
                <div key={day} className={`p-2 h-24 border rounded-lg relative ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayAppointments.slice(0, 2).map(appointment => {
                      const patient = patients.find(p => p.id === appointment.patientId);
                      return (
                        <div key={appointment.id} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                          {patient?.name}
                        </div>
                      );
                    })}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayAppointments.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {modalType === 'patient' ? (editingItem ? 'Edit Patient' : 'Add Patient') : 
                 (editingItem ? 'Edit Appointment' : 'Add Appointment')}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {modalType === 'patient' ? (
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={patientForm.name}
                      onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={patientForm.dob}
                      onChange={(e) => setPatientForm({...patientForm, dob: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={patientForm.contact}
                      onChange={(e) => setPatientForm({...patientForm, contact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={patientForm.email}
                      onChange={(e) => setPatientForm({...patientForm, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({...patientForm, address: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Health Information</label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={patientForm.healthInfo}
                    onChange={(e) => setPatientForm({...patientForm, healthInfo: e.target.value})}
                    placeholder="Allergies, medical conditions, medications..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Add'} Patient
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleIncidentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={incidentForm.patientId}
                      onChange={(e) => setIncidentForm({...incidentForm, patientId: e.target.value})}
                    >
                      <option value="">Select Patient</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>{patient.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={incidentForm.title}
                      onChange={(e) => setIncidentForm({...incidentForm, title: e.target.value})}
                      placeholder="e.g., Routine Checkup, Root Canal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={incidentForm.appointmentDate}
                      onChange={(e) => setIncidentForm({...incidentForm, appointmentDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={incidentForm.status}
                      onChange={(e) => setIncidentForm({...incidentForm, status: e.target.value})}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                    placeholder="Detailed description of the treatment or procedure"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <textarea
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={incidentForm.comments}
                    onChange={(e) => setIncidentForm({...incidentForm, comments: e.target.value})}
                    placeholder="Additional notes or observations"
                  />
                </div>

                {incidentForm.status === 'Completed' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={incidentForm.cost}
                          onChange={(e) => setIncidentForm({...incidentForm, cost: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Appointment</label>
                        <input
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={incidentForm.nextDate}
                          onChange={(e) => setIncidentForm({...incidentForm, nextDate: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Details</label>
                      <textarea
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={incidentForm.treatment}
                        onChange={(e) => setIncidentForm({...incidentForm, treatment: e.target.value})}
                        placeholder="Details of treatment provided"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload files
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="sr-only"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          PDF, JPG, PNG, DOC up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {incidentForm.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                      {incidentForm.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Add'} Appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                 <img 
                src="/assets/logo.png" 
                alt="Dental Logo" 
                className="w-8 h-8 filter invert brightness-0"
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                onLoad={() => console.log('Image loaded successfully')}
              />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ENTNT Dental Center</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Dr. Admin</span>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">DA</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
              { id: 'patients', label: 'Patients', icon: Users },
              { id: 'appointments', label: 'Appointments', icon: FileText },
              { id: 'calendar', label: 'Calendar', icon: Calendar }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'calendar' && renderCalendar()}
      </div>

     
      {renderModal()}
    </div>
  );
};

export default DentalAdminDashboard;