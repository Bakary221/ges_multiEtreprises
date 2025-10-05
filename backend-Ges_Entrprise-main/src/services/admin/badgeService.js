const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../../config/prisma');

class BadgeService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../../uploads/badges');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // Generate QR code data for employee
  generateQRData(employee) {
    return JSON.stringify({
      matricule: employee.matricule,
      employeeId: employee.id,
      companyId: employee.companyId,
      timestamp: Date.now(),
      type: 'employee_badge'
    });
  }

  // Generate QR code as base64
  async generateQRCode(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    }
  }

  // Generate employee badge PDF
  async generateBadgePDF(employee, company) {
    return new Promise(async (resolve, reject) => {
      try {
        const qrData = this.generateQRData(employee);
        const qrCodeBase64 = await this.generateQRCode(qrData);

        // Remove data URL prefix to get base64 data
        const qrCodeImageData = qrCodeBase64.replace(/^data:image\/png;base64,/, '');

        const doc = new PDFDocument({
          size: [3.375 * 72, 2.125 * 72], // Standard ID card size (3.375" x 2.125")
          margin: 0
        });

        const filename = `badge_${employee.id}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);

        // Remove existing file if it exists
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }

        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Colors
        const primaryColor = company.primaryColor || '#4F46E5';
        const secondaryColor = company.secondaryColor || '#7C3AED';

        // Background gradient effect
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(primaryColor);

        // Add a subtle pattern overlay
        doc.fillColor(primaryColor).opacity(0.9);
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(primaryColor);

        // Header section with company branding
        doc.opacity(1);
        doc.fillColor('white').fontSize(14).font('Helvetica-Bold');
        doc.text(company.name, 20, 15, { align: 'center', width: doc.page.width - 40 });

        // Decorative line
        doc.strokeColor('white').lineWidth(2);
        doc.moveTo(20, 35).lineTo(doc.page.width - 20, 35).stroke();

        // Employee photo placeholder with better styling
        const photoX = doc.page.width / 2;
        const photoY = 65;
        const photoRadius = 15;

        // Photo background
        doc.fillColor('white');
        doc.circle(photoX, photoY, photoRadius + 3).fill();

        // Photo circle
        doc.fillColor('#F3F4F6');
        doc.circle(photoX, photoY, photoRadius).fill();

        // Photo border
        doc.strokeColor(primaryColor).lineWidth(3);
        doc.circle(photoX, photoY, photoRadius).stroke();

        // Employee initial in photo
        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
        doc.text(employee.name.charAt(0).toUpperCase(), photoX - 3, photoY - 3);

        // Employee information section
        const infoY = photoY + photoRadius + 20;

        // Name
        doc.fillColor('white').fontSize(16).font('Helvetica-Bold');
        doc.text(employee.name, 20, infoY, { align: 'center', width: doc.page.width - 40 });

        // Position
        doc.fillColor('white').fontSize(12).font('Helvetica');
        doc.text(employee.position, 20, infoY + 25, { align: 'center', width: doc.page.width - 40 });

        // Matricule with background
        doc.fillColor(primaryColor);
        doc.roundedRect(40, infoY + 45, doc.page.width - 80, 20, 5).fill();

        doc.fillColor('white').fontSize(11).font('Helvetica-Bold');
        doc.text(`Matricule: ${employee.matricule}`, 20, infoY + 50, { align: 'center', width: doc.page.width - 40 });

        // Department
        if (employee.department) {
          doc.fillColor('white').fontSize(10).font('Helvetica');
          doc.text(`Département: ${employee.department.name}`, 20, infoY + 75, { align: 'center', width: doc.page.width - 40 });
        }

        // QR Code section with background
        const qrSize = 60;
        const qrX = doc.page.width - qrSize - 20;
        const qrY = doc.page.height - qrSize - 30;

        // QR background
        doc.fillColor('white');
        doc.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 5).fill();

        // QR Code
        try {
          const qrImageBuffer = Buffer.from(qrCodeImageData, 'base64');
          doc.image(qrImageBuffer, qrX, qrY, { width: qrSize, height: qrSize });
        } catch (qrError) {
          console.error('Error adding QR code to PDF:', qrError);
          // Fallback: draw a placeholder
          doc.fillColor('#E5E7EB');
          doc.roundedRect(qrX, qrY, qrSize, qrSize, 5).fill();
          doc.strokeColor(primaryColor).lineWidth(2);
          doc.roundedRect(qrX, qrY, qrSize, qrSize, 5).stroke();
          doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
          doc.text('QR', qrX + qrSize/2 - 8, qrY + qrSize/2 - 5);
        }

        // QR label
        doc.fillColor('white').fontSize(8).font('Helvetica');
        doc.text('Scanner pour pointer', qrX - 5, qrY + qrSize + 8, { width: qrSize + 10, align: 'center' });

        // Footer with date and branding
        doc.fillColor('white').fontSize(7).font('Helvetica');
        const footerY = doc.page.height - 15;
        doc.text(`Badge employé - Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, footerY, { align: 'center', width: doc.page.width - 40 });

        // Company tagline
        doc.fontSize(6);
        doc.text('Système de gestion d\'entreprise', 20, footerY + 8, { align: 'center', width: doc.page.width - 40 });

        doc.end();

        stream.on('finish', () => {
          const stats = fs.statSync(filepath);
          console.log('🖨️ GENERATE_PDF: PDF file created successfully, size:', stats.size, 'bytes');
          resolve({
            filename,
            filepath: `/uploads/badges/${filename}`,
            qrData,
            qrCode: qrCodeBase64
          });
        });

        stream.on('error', (error) => {
          reject(new Error('Failed to write badge PDF: ' + error.message));
        });

      } catch (error) {
        reject(new Error('Failed to generate badge PDF: ' + error.message));
      }
    });
  }

  // Generate badge for employee
  async generateEmployeeBadge(employeeId) {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) },
        include: {
          company: true,
          department: true
        }
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      const badge = await this.generateBadgePDF(employee, employee.company);

      // Update employee to mark badge as generated
      await prisma.employee.update({
        where: { id: parseInt(employeeId) },
        data: { badgeGeneratedAt: new Date() }
      });

      return {
        employeeId: employee.id,
        matricule: employee.matricule,
        badgeUrl: badge.filepath,
        qrData: badge.qrData,
        qrCode: badge.qrCode,
        generatedAt: new Date()
      };

    } catch (error) {
      throw new Error('Failed to generate employee badge: ' + error.message);
    }
  }

  // Validate QR code data
  validateQRData(qrData) {
    try {
      const data = JSON.parse(qrData);

      if (data.type !== 'employee_badge') {
        return { valid: false, error: 'Invalid badge type' };
      }

      if (!data.matricule || !data.employeeId || !data.companyId) {
        return { valid: false, error: 'Missing required badge data' };
      }

      // Check if timestamp is not too old (24 hours)
      const age = Date.now() - data.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        return { valid: false, error: 'Badge expired' };
      }

      return {
        valid: true,
        data: {
          matricule: data.matricule,
          employeeId: data.employeeId,
          companyId: data.companyId
        }
      };

    } catch (error) {
      return { valid: false, error: 'Invalid QR code format' };
    }
  }

  // Process attendance from QR scan or manual matricule entry
  async processAttendanceScan(qrData, companyId, scanType = 'CHECK_IN', hoursWorked = null) {
    try {
      console.log('🔍 PROCESS_ATTENDANCE_SCAN: Starting with qrData:', qrData, 'companyId:', companyId, 'scanType:', scanType);
      let employeeId;
      let employee = null;

      // Check if qrData is a simple matricule or JSON QR data
      if (qrData.startsWith('{')) {
        // It's JSON QR data, validate it
        const validation = this.validateQRData(qrData);

        if (!validation.valid) {
          return {
            success: false,
            error: validation.error,
            sound: 'error',
            message: this.getErrorMessage(validation.error)
          };
        }

        employeeId = validation.data.employeeId;
      } else {
        // It's a simple matricule, find the employee by matricule
        console.log('🔍 PROCESS_ATTENDANCE_SCAN: Looking for employee with matricule:', qrData.trim(), 'in company:', companyId);

        try {
          employee = await prisma.employee.findFirst({
            where: {
              matricule: qrData.trim(),
              companyId: parseInt(companyId),
              archived: false
            },
            select: {
              id: true,
              name: true,
              matricule: true,
              position: true,
              contractType: true
            }
          });

          console.log('🔍 PROCESS_ATTENDANCE_SCAN: Employee found:', employee ? employee.name : 'null');
        } catch (dbError) {
          console.error('❌ PROCESS_ATTENDANCE_SCAN: Database error:', dbError);
          return {
            success: false,
            error: 'Database error',
            sound: 'error',
            message: 'Erreur de base de données'
          };
        }

        if (!employee) {
          console.log('❌ PROCESS_ATTENDANCE_SCAN: No employee found with matricule:', qrData.trim());
          return {
            success: false,
            error: 'Employee not found',
            sound: 'error',
            message: `Aucun employé trouvé avec le matricule "${qrData.trim()}"`
          };
        }

        employeeId = employee.id;
        console.log('✅ PROCESS_ATTENDANCE_SCAN: Using employee:', employee.name, 'ID:', employee.id);
      }

      // Get employee data if not already fetched (for QR data)
      if (!employee) {
        employee = await prisma.employee.findFirst({
          where: {
            id: parseInt(employeeId),
            companyId: parseInt(companyId),
            archived: false
          },
          select: {
            id: true,
            name: true,
            matricule: true,
            position: true,
            contractType: true
          }
        });

        if (!employee) {
          return {
            success: false,
            error: 'Employee not found or does not belong to this company',
            sound: 'error',
            message: 'Employé non trouvé ou n\'appartient pas à cette entreprise'
          };
        }
      }

      // Check if employee already checked in today
      console.log('🔍 PROCESS_ATTENDANCE_SCAN: Checking existing attendance for employeeId:', employeeId);
      let existingAttendance = null;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        existingAttendance = await prisma.attendance.findFirst({
          where: {
            employeeId: parseInt(employeeId),
            timestamp: {
              gte: today,
              lt: tomorrow
            }
          },
          select: {
            id: true,
            type: true,
            timestamp: true
          }
        });

        console.log('🔍 PROCESS_ATTENDANCE_SCAN: Existing attendance query completed');
      } catch (attendanceError) {
        console.error('❌ PROCESS_ATTENDANCE_SCAN: Error checking existing attendance:', attendanceError);
        return {
          success: false,
          error: 'Database error',
          sound: 'error',
          message: 'Erreur lors de la vérification des présences existantes'
        };
      }

      console.log('🔍 PROCESS_ATTENDANCE_SCAN: Existing attendance found:', existingAttendance ? 'YES' : 'NO');

      if (existingAttendance) {
        console.log('❌ PROCESS_ATTENDANCE_SCAN: Employee already checked in today');
        return {
          success: false,
          error: 'Already checked in today',
          sound: 'error',
          message: `${employee.name} s'est déjà pointé aujourd'hui à ${existingAttendance.timestamp.toLocaleTimeString('fr-FR')}`
        };
      }

      console.log('✅ PROCESS_ATTENDANCE_SCAN: No existing attendance, proceeding to create new one');

      // Validate contract type logic for QR scans
      if (employee.contractType === 'HONORAIRE') {
        // For HONORAIRE contracts, hoursWorked is required for CHECK_OUT
        if (scanType === 'CHECK_OUT' && (!hoursWorked || hoursWorked <= 0)) {
          return {
            success: false,
            error: 'Hours worked required for HONORAIRE contract',
            sound: 'error',
            message: 'Le nombre d\'heures travaillées est requis pour les contrats honoraires'
          };
        }
      } else if (employee.contractType === 'FIXE') {
        // For FIXE contracts, hoursWorked should not be provided
        if (hoursWorked !== null && hoursWorked !== undefined) {
          return {
            success: false,
            error: 'Hours worked not allowed for FIXE contract',
            sound: 'error',
            message: 'Les heures travaillées ne doivent pas être spécifiées pour les contrats fixes'
          };
        }
      }

      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          employeeId: parseInt(employeeId),
          type: scanType,
          timestamp: new Date(),
          hoursWorked: employee.contractType === 'HONORAIRE' && scanType === 'CHECK_OUT' ? parseFloat(hoursWorked) : null
        },
        include: {
          employee: {
            select: {
              name: true,
              matricule: true,
              position: true
            }
          }
        }
      });

      return {
        success: true,
        attendance,
        employee: attendance.employee,
        sound: 'success',
        message: `${scanType === 'CHECK_IN' ? 'Pointage' : 'Non pointage'} enregistré pour ${employee.name}`
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to process attendance scan: ' + error.message,
        sound: 'error',
        message: 'Erreur lors du traitement du scan: ' + error.message
      };
    }
  }

  // Helper method to get user-friendly error messages
  getErrorMessage(error) {
    const errorMessages = {
      'Invalid badge type': 'Type de badge invalide',
      'Missing required badge data': 'Données du badge manquantes',
      'Badge expired': 'Badge expiré (plus de 24h)',
      'Invalid QR code format': 'Format de QR code invalide'
    };

    return errorMessages[error] || error;
  }
}

module.exports = new BadgeService();