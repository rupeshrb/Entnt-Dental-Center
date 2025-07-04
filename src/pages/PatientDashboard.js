import React, { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, DollarSign, FileText, LogOut, User, Heart, Phone, Mail, MapPin, Download, Eye, ChevronLeft, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); 

  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

 useEffect(() => {
  const loadPatientData = async () => {
    if (!user || !user.patientId) {
      setIsLoadingData(false);
      return;
    }

    try {
  await new Promise(resolve => setTimeout(resolve, 300));
      
      const patients = JSON.parse(localStorage.getItem("patients") || "[]");
      const incidents = JSON.parse(localStorage.getItem("incidents") || "[]");

      const currentPatient = patients.find(p => p.id === user.patientId);

      if (currentPatient) {
        setPatientData(currentPatient);

   
        const patientAppointments = incidents
          .filter(incident => incident.patientId === user.patientId)
          .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

        setAppointments(patientAppointments);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  loadPatientData();
}, [user]); 

  const handleLogout = () => {
    logout();
    navigate("/");
  };


  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load patient data. Please try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.appointmentDate) >= new Date() && apt.status !== 'Completed' && apt.status !== 'Cancelled')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const pastAppointments = appointments
    .filter(apt => apt.status === 'Completed' || new Date(apt.appointmentDate) < new Date())
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

 
  const totalSpent = pastAppointments
    .filter(apt => apt.status === 'Completed')
    .reduce((sum, apt) => sum + (apt.cost || 0), 0);

  const handleFileView = (file) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  const handleFileDownload = (file) => {
   
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getAppointmentsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.appointmentDate.startsWith(dateStr));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome back, {patientData.name}!</h1>
      
   
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Visits</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-green-500 text-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
            </div>
            <Clock className="h-10 w-10 text-green-200" />
          </div>
        </div>
        
        <div className="bg-purple-500 text-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{pastAppointments.filter(a => a.status === 'Completed').length}</p>
            </div>
            <Activity className="h-10 w-10 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-orange-500 text-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">${totalSpent}</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            My Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-gray-600 mr-2">Date of Birth:</span>
              <span className="font-medium">{new Date(patientData.dob).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-gray-600 mr-2">Phone:</span>
              <span className="font-medium">{patientData.contact}</span>
            </div>
            {patientData.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600 mr-2">Email:</span>
                <span className="font-medium">{patientData.email}</span>
              </div>
            )}
            {patientData.address && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600 mr-2">Address:</span>
                <span className="font-medium">{patientData.address}</span>
              </div>
            )}
            <div className="flex items-start">
              <Heart className="h-4 w-4 text-gray-400 mr-3 mt-1" />
              <div>
                <span className="text-gray-600">Health Notes:</span>
                <p className="font-medium mt-1">{patientData.healthInfo || 'No specific health information on file'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-500" />
            Upcoming Appointments
          </h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 2).map(appointment => (
                <div key={appointment.id} className="border-l-4 border-blue-400 pl-4 py-2">
                  <h3 className="font-semibold">{appointment.title}</h3>
                  <p className="text-gray-600 text-sm">{appointment.description}</p>
                  <div className="flex items-center space-x-4 text-sm mt-2">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                    appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
              <p className="text-sm text-gray-400 mt-1">Contact us to schedule your next visit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
     
  
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{appointment.title}</h3>
                    <p className="text-gray-600 mt-1">{appointment.description}</p>
                    {appointment.comments && (
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Notes:</strong> {appointment.comments}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                      appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {appointment.status}
                    </span>
                    {appointment.cost && (
                      <p className="text-lg font-semibold text-green-600 mt-2">${appointment.cost}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        )}
      </div>


      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">Past Appointments</h2>
        {pastAppointments.length > 0 ? (
          <div className="space-y-4">
            {pastAppointments.map(appointment => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{appointment.title}</h3>
                    <p className="text-gray-600 mt-1">{appointment.description}</p>
                    {appointment.treatment && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Treatment:</strong> {appointment.treatment}
                      </p>
                    )}
                    {appointment.comments && (
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Doctor's Notes:</strong> {appointment.comments}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    
                    {/* File attachments */}
                    {appointment.files && appointment.files.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {appointment.files.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{file.name}</span>
                              <button 
                                onClick={() => handleFileView(file)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View file"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleFileDownload(file)}
                                className="text-green-600 hover:text-green-800"
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      appointment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status}
                    </span>
                    {appointment.cost && (
                      <p className="text-lg font-semibold text-green-600 mt-2">${appointment.cost}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointment history</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const goToPreviousMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    
    const goToNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
  <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Appointment Calendar</h1>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={goToPreviousMonth} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xl font-semibold min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button 
              onClick={goToNextMonth} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
      
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                {day}
              </div>
            ))}
          </div>
          
    
          <div className="grid grid-cols-7 gap-1">
          
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="p-3 h-24"></div>
            ))}
            
           
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNumber = i + 1;
              const dayAppointments = getAppointmentsForDay(dayNumber);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber).toDateString();
              
              return (
                <div 
                  key={dayNumber} 
                  className={`p-2 h-24 border rounded-lg relative ${
                    isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {dayNumber}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayAppointments.slice(0, 2).map(appointment => (
                      <div 
                        key={appointment.id} 
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appointment.title}
                      </div>
                    ))}
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


  const renderFileModal = () => {
    if (!showFileModal || !selectedFile) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
            <button 
              onClick={() => setShowFileModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(90vh-100px)]">
            {selectedFile.type && selectedFile.type.startsWith('image/') ? (
              <img 
                src={selectedFile.url} 
                alt={selectedFile.name} 
                className="max-w-full h-auto"
                style={{ maxHeight: '70vh' }}
              />
            ) : (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Can't preview this file type</p>
                <button 
                  onClick={() => handleFileDownload(selectedFile)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
          <img 
            src="/assets/logo.png" 
            alt="Logo" 
            className="w-6 h-6 sm:w-8 sm:h-8 filter invert brightness-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">ENTNT Dental</h1>
          <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Patient Portal</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Hi, {patientData.name.split(' ')[0]}</span>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-red-600 p-1"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs sm:hidden">Logout</span>
        </button>
        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-medium text-xs sm:text-sm">
            {patientData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  </div>
</header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">

        
        <div className="mb-4 sm:mb-8">
  <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto pb-2 sm:pb-0">
           {[
              { id: 'overview', label: 'Overview', icon: User },
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
                      ? 'bg-blue-500 text-white'
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

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'calendar' && renderCalendar()}
      </div>

      {renderFileModal()}
    </div>
  );
};

export default PatientDashboard;
