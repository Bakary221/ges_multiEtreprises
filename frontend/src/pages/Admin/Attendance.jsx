import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { Clock, CheckCircle, XCircle, User, ChevronLeft, ChevronRight, QrCode, Hash, Camera } from 'lucide-react';

const Attendance = () => {
  const theme = useCompanyTheme();
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  // Defensive fix: ensure employees is always an array
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceType, setAttendanceType] = useState('CHECK_IN');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttendances, setTotalAttendances] = useState(0);

  // Badge scanning states
  const [scanMode, setScanMode] = useState('matricule'); // 'matricule', 'qr', 'manual'
  const [qrData, setQrData] = useState('');
  const [matriculeInput, setMatriculeInput] = useState('');
  const [manualMatriculeInput, setManualMatriculeInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const [attendanceResponse, employeeResponse] = await Promise.all([
        attendanceService.getAllAttendances({ page, limit: 10 }),
        employeeService.getEmployees({ page: 1, limit: 1000 }) // Get all employees for dropdown
      ]);

      if (attendanceResponse.success) {
        setAttendances(attendanceResponse.data.attendances || []);
        setTotalPages(attendanceResponse.data.totalPages || 1);
        setTotalAttendances(attendanceResponse.data.total || 0);
        setCurrentPage(page);
      }

      setEmployees(employeeResponse.data?.employees || []);
    } catch (error) {
      setAttendances([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAttendance = async () => {
    if (!manualMatriculeInput.trim()) return;

    setIsScanning(true);
    try {
      // First find employee by matricule
      const employeesResponse = await fetch(`${import.meta.env.VITE_API_URL}/employees?search=${manualMatriculeInput.trim()}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const employeesData = await employeesResponse.json();

      if (!employeesData.success || !employeesData.data.employees || employeesData.data.employees.length === 0) {
        setScanResult({
          success: false,
          message: 'Matricule non trouvé'
        });
        setIsScanning(false);
        return;
      }

      const employee = employeesData.data.employees[0];

      // Then scan attendance for this employee
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendances/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: employee.id,
          type: attendanceType
        })
      });

      const data = await response.json();

      if (data.success) {
        setScanResult({
          success: true,
          message: `${attendanceType === 'CHECK_IN' ? 'Arrivée' : 'Départ'} enregistrée pour ${employee.name}`,
          employee: employee
        });
        loadData(); // Reload attendance data
        setManualMatriculeInput('');
      } else {
        setScanResult({
          success: false,
          message: data.message || 'Erreur lors de l\'enregistrement'
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Erreur de connexion'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleQRScan = async () => {
    if (!qrData.trim()) return;

    setIsScanning(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/scan-qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrData: qrData.trim(),
          type: attendanceType
        })
      });

      const data = await response.json();

      if (data.success) {
        setScanResult({
          success: true,
          message: data.data.message,
          employee: data.data.employee
        });
        loadData(); // Reload attendance data
        setQrData('');
      } else {
        setScanResult({
          success: false,
          message: data.message || 'Erreur lors du scan'
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Erreur de connexion'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleMatriculeScan = async () => {
    if (!matriculeInput.trim()) return;

    setIsScanning(true);
    try {
      // First find employee by matricule
      const employeesResponse = await fetch(`${import.meta.env.VITE_API_URL}/employees?search=${matriculeInput.trim()}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const employeesData = await employeesResponse.json();

      if (!employeesData.success || !employeesData.data.employees || employeesData.data.employees.length === 0) {
        setScanResult({
          success: false,
          message: 'Matricule non trouvé'
        });
        setIsScanning(false);
        return;
      }

      const employee = employeesData.data.employees[0];

      // Then scan attendance for this employee
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendances/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: employee.id,
          type: attendanceType
        })
      });

      const data = await response.json();

      if (data.success) {
        setScanResult({
          success: true,
          message: `${attendanceType === 'CHECK_IN' ? 'Pointage' : 'Non pointage'} enregistré pour ${employee.name}`,
          employee: employee
        });
        loadData(); // Reload attendance data
        setMatriculeInput('');
      } else {
        setScanResult({
          success: false,
          message: data.message || 'Erreur lors de l\'enregistrement'
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Erreur de connexion'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadData(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.primary }}></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
      </div>

      {/* Scan Attendance Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Enregistrer une présence</h2>

          {/* Scan Mode Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mode:</span>
            <div className="flex rounded-lg border border-gray-300">
              <button
                onClick={() => setScanMode('matricule')}
                className={`px-3 py-1 text-sm rounded-l-lg transition-colors ${
                  scanMode === 'matricule'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Hash className="h-4 w-4 inline mr-1" />
                Matricule
              </button>
              <button
                onClick={() => setScanMode('qr')}
                className={`px-3 py-1 text-sm rounded-r-lg transition-colors ${
                  scanMode === 'qr'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <QrCode className="h-4 w-4 inline mr-1" />
                QR Code
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Matricule Mode */}
          {scanMode === 'matricule' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matricule employé
                </label>
                <input
                  type="text"
                  value={manualMatriculeInput}
                  onChange={(e) => setManualMatriculeInput(e.target.value.toUpperCase())}
                  placeholder="Ex: EMP001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                  style={{
                    '--tw-ring-color': theme.primary,
                    borderColor: theme.primary
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={attendanceType}
                  onChange={(e) => setAttendanceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                  style={{
                    '--tw-ring-color': theme.primary,
                    borderColor: theme.primary
                  }}
                >
                  <option value="CHECK_IN">Pointé</option>
                  <option value="CHECK_OUT">Non pointé</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleManualAttendance}
                  disabled={!manualMatriculeInput.trim() || isScanning}
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                >
                  {isScanning ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline"></div>
                  ) : (
                    <Hash className="h-4 w-4 mr-2 inline" />
                  )}
                  {isScanning ? 'Recherche...' : 'Enregistrer présence'}
                </button>
              </div>
            </>
          )}

          {/* QR Code Mode */}
          {scanMode === 'qr' && (
            <>
              <div className="col-span-2">
                <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Scan QR Code</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Utilisez la page dédiée "Scan Présences" pour scanner les QR codes avec la caméra
                  </p>
                  <a
                    href="/admin/attendance/scan"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-300 transform hover:scale-105"
                    style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Ouvrir Scan Présences
                  </a>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            scanResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {scanResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm font-medium ${
                scanResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {scanResult.message}
              </span>
            </div>
            {scanResult.employee && (
              <div className="mt-2 text-sm text-gray-600">
                Employé: {scanResult.employee.name} - Matricule: {scanResult.employee.matricule}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des présences</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <tr key={attendance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {attendance.employee?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      attendance.type === 'CHECK_IN'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {attendance.type === 'CHECK_IN' ? 'Pointé' : 'Non pointé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(attendance.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, totalAttendances)} sur {totalAttendances} présences
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                        page === currentPage
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;